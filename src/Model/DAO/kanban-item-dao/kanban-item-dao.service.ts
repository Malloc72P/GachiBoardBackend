import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { KanbanGroupEnum, KanbanItemDto } from '../../DTO/KanbanItemDto/kanban-item-dto';
import { KanbanItemDtoIntf } from '../../DTO/KanbanItemDto/kanban-item-intf.interface';
import { ProjectDaoService } from '../project-dao/project-dao.service';
import { WebsocketPacketDto } from '../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import { RejectionEvent, RejectionEventEnum } from '../../Helper/PromiseHelper/RejectionEvent';
import { KanbanDataDaoService } from '../kanban-data-dao/kanban-data-dao.service';
import { KanbanDataDto } from '../../DTO/KanbanDataDto/kanban-data-dto';
import { from } from 'rxjs';

@Injectable()
export class KanbanItemDaoService {
  constructor(
    @InjectModel('KANBAN_ITEM_MODEL') private readonly kanbanItemModel: Model<KanbanItemDtoIntf>,
    private projectDao:ProjectDaoService,
    private kanbanDataDao:KanbanDataDaoService,
  ){

  }

  async create(createKanbanItemDto: KanbanItemDto): Promise<any> {

    const createdUsers = new this.kanbanItemModel(createKanbanItemDto);
    return createdUsers.save();
  }

  async findAll(): Promise<any[]> {
    return await this.kanbanItemModel.find().exec();
  }
  async findOne(_id): Promise<any> {
    return await this.kanbanItemModel.findOne({ _id: _id })
      .exec();
  }
  async update(_id, kanbanItemDto:KanbanItemDto): Promise<any> {
    return await this.kanbanItemModel.updateOne({_id : _id}, kanbanItemDto).exec();
  }

  async deleteOne(_id): Promise<any> {
    return await this.kanbanItemModel.deleteOne({ _id: _id })
      .exec();
  }

  async lockKanban(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let kanbanItemDto:KanbanItemDto = packetDto.dataDto as KanbanItemDto;
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let projectDto = data.projectDto;
          this.findOne(kanbanItemDto._id)
            .then((foundKanbanItem:KanbanItemDto)=>{
              if(foundKanbanItem.lockedBy){
                reject(new RejectionEvent(RejectionEventEnum.ALREADY_LOCKED, foundKanbanItem));
              }

              foundKanbanItem.lockedBy = packetDto.senderIdToken;
              this.update(foundKanbanItem._id, foundKanbanItem).then(()=>{
                let resolveParam = {
                  userDto : userDto,
                  projectDto : projectDto,
                  kanbanItemDto : foundKanbanItem
                };
                resolve(resolveParam);
              });
            })
        });
    });
  }
  async unlockKanban(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let kanbanItemDto:KanbanItemDto = packetDto.dataDto as KanbanItemDto;
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let projectDto = data.projectDto;
          this.findOne(kanbanItemDto._id)
            .then((foundKanbanItem:KanbanItemDto)=>{

              foundKanbanItem.lockedBy = null;
              this.update(foundKanbanItem._id, foundKanbanItem).then(()=>{
                let resolveParam = {
                  userDto : userDto,
                  projectDto : projectDto,
                  kanbanItemDto : foundKanbanItem
                };
                resolve(resolveParam);
              });
            })
        });
    });
  }

  async relocateKanbanItem(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let kanbanItemDto:KanbanItemDto = packetDto.dataDto as KanbanItemDto;
      let destGroupTitle = packetDto.additionalData.destGroupTitle;
      let destIdx = packetDto.additionalData.destIdx;
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let projectDto = data.projectDto;
          this.findOne(kanbanItemDto._id)
            .then((foundKanbanItem:KanbanItemDto)=>{
              if(foundKanbanItem.lockedBy !== userDto.idToken ){
                reject(new RejectionEvent(RejectionEventEnum.LOCKED_BY_ANOTHER_USER, foundKanbanItem));
              }
              this.kanbanDataDao.findOneAndNoPopulate(projectDto.kanbanData)
                .then((kanbanDataDto:KanbanDataDto)=>{
                  let fromGroup, toGroup;
                  fromGroup = this.getGroupObject(kanbanDataDto, kanbanItemDto.parentGroup);
                  toGroup = this.getGroupObject(kanbanDataDto, destGroupTitle);
                  let adjustedIdx = -1;
                  if(!toGroup){
                    adjustedIdx = 0;
                  }
                  else if(toGroup.length <= destIdx){//재배치될 위치가 그룹 배열크기를 초과하는 경우 enqueue함
                    adjustedIdx = toGroup.length;
                  }else{
                    adjustedIdx = destIdx;
                  }
                  //1. 재배치할 위치로 칸반아이템을 삽입.
                  toGroup.splice(adjustedIdx, 0, kanbanItemDto);

                  //2. 이전 위치에 있던 칸반 아이템을 제거
                  let delIdx = -1;
                  for(let i = 0 ; i < fromGroup.length; i++){
                    let currItem = fromGroup[i];
                    if(currItem.toString() === kanbanItemDto._id){
                      delIdx = i;
                      break;
                    }
                  }
                  if(delIdx > -1){
                    fromGroup.splice(delIdx, 1);
                  }


                  this.kanbanDataDao.update(kanbanDataDto._id, kanbanDataDto)
                    .then(()=>{
                      foundKanbanItem.lockedBy = null;
                      foundKanbanItem.parentGroup = destGroupTitle;
                      this.update(foundKanbanItem._id, foundKanbanItem).then(()=>{
                        let resolveParam = {
                          userDto : userDto,
                          projectDto : projectDto,
                          kanbanItemDto : foundKanbanItem
                        };
                        resolve(resolveParam);
                      });
                    });
              });
            })
        });
    });
  }

  getGroupObject(kanbanDataDto:KanbanDataDto, groupTitle){
    let switchEnum:KanbanGroupEnum = groupTitle as KanbanGroupEnum;
    switch (switchEnum) {
      case KanbanGroupEnum.TODO:
        return kanbanDataDto.todoGroup;
      case KanbanGroupEnum.IN_PROGRESS:
        return kanbanDataDto.inProgressGroup;
      case KanbanGroupEnum.DONE:
        return kanbanDataDto.doneGroup;
    }
  }

}

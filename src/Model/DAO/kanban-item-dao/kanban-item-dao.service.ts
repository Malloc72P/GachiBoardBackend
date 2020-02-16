import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { KanbanItemDto } from '../../DTO/KanbanItemDto/kanban-item-dto';
import { KanbanItemDtoIntf } from '../../DTO/KanbanItemDto/kanban-item-intf.interface';
import { ProjectDaoService } from '../project-dao/project-dao.service';
import { WebsocketPacketDto } from '../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import { RejectionEvent, RejectionEventEnum } from '../../Helper/PromiseHelper/RejectionEvent';

@Injectable()
export class KanbanItemDaoService {
  constructor(
    @InjectModel('KANBAN_ITEM_MODEL') private readonly kanbanItemModel: Model<KanbanItemDtoIntf>,
    private projectDao:ProjectDaoService,
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

}

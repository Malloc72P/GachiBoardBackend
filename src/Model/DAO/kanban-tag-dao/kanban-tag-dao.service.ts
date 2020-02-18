import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { KanbanItemDtoIntf } from '../../DTO/KanbanItemDto/kanban-item-intf.interface';
import { ProjectDaoService } from '../project-dao/project-dao.service';
import { KanbanDataDaoService } from '../kanban-data-dao/kanban-data-dao.service';
import { KanbanItemDto } from '../../DTO/KanbanItemDto/kanban-item-dto';
import { KanbanTagDtoIntf } from '../../DTO/KanbanTagDto/kanban-tag-intf.interface';
import { KanbanTagDto } from '../../DTO/KanbanTagDto/kanban-tag-dto';
import { WebsocketPacketDto } from '../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import { RejectionEvent, RejectionEventEnum } from '../../Helper/PromiseHelper/RejectionEvent';
import { KanbanDataDto } from '../../DTO/KanbanDataDto/kanban-data-dto';

@Injectable()
export class KanbanTagDaoService {
  constructor(
    @InjectModel('KANBAN_TAG_MODEL') private readonly kanbanTagModel: Model<KanbanTagDtoIntf>,
    private projectDao:ProjectDaoService,
    private kanbanDataDao:KanbanDataDaoService,
  ){

  }

  private async create(createKanbanTagDto: KanbanTagDto): Promise<any> {
    const createdUsers = new this.kanbanTagModel(createKanbanTagDto);
    return createdUsers.save();
  }
  private async findAll(): Promise<any[]> {
    return await this.kanbanTagModel.find().exec();
  }
  private async findOne(_id): Promise<any> {
    return await this.kanbanTagModel.findOne({ _id: _id })
      .exec();
  }
  private async update(_id, kanbanTagDto:KanbanTagDto): Promise<any> {
    return await this.kanbanTagModel.updateOne({_id : _id}, kanbanTagDto).exec();
  }
  private async deleteOne(_id): Promise<any> {
    return await this.kanbanTagModel.deleteOne({ _id: _id })
      .exec();
  }

  async createKanbanTag(packetDto:WebsocketPacketDto): Promise<any>{
    let kanbanTagDto:KanbanTagDto = packetDto.dataDto as KanbanTagDto;
    return new Promise<any>((resolve, reject)=>{
      let kanbanItemDto:KanbanItemDto = packetDto.dataDto as KanbanItemDto;
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let projectDto = data.projectDto;
          this.create(kanbanTagDto).then((createdTagDto:KanbanTagDto)=>{
            this.kanbanDataDao.findOne(projectDto.kanbanData._id)
              .then((kanbanDataDto:KanbanDataDto)=>{
                kanbanDataDto.kanbanTagListDto.push(createdTagDto._id);
                this.kanbanDataDao.update(kanbanDataDto._id, kanbanDataDto).then(()=>{
                  let resolveParam = {
                    userDto       : userDto,
                    projectDto    : projectDto,
                    createdTagDto : createdTagDto
                  };
                  resolve(resolveParam);
                })
              });
          })
        });
    });
  }

}

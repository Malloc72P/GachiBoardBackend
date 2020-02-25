import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { KanbanItemDtoIntf } from '../../DTO/KanbanItemDto/kanban-item-intf.interface';
import { ProjectDaoService } from '../project-dao/project-dao.service';
import { KanbanDataDaoService } from '../kanban-data-dao/kanban-data-dao.service';
import { WbItemPacketDtoIntf } from '../../DTO/WebsocketPacketDto/WbItemPacketDto/WbItemPacket-dto-int.interface';
import { KanbanItemDto } from '../../DTO/KanbanItemDto/kanban-item-dto';
import { WbItemPacketDto } from '../../DTO/WebsocketPacketDto/WbItemPacketDto/WbItemPacketDto';

@Injectable()
export class WhiteboardItemDaoService {
  constructor(
    @InjectModel('WHITEBOARD_ITEM_PACKET_MODEL')
          private readonly wbItemPacketModel: Model<WbItemPacketDtoIntf>,
    private projectDao:ProjectDaoService,
    private kanbanDataDao:KanbanDataDaoService,
  ){

  }
//WHITEBOARD_ITEM_PACKET_MODEL
  async create(wbItemPacketDto: WbItemPacketDto): Promise<any> {

    const createdWbItemPacket = new this.wbItemPacketModel(wbItemPacketDto);
    return createdWbItemPacket.save();
  }

  async findAll(): Promise<any[]> {
    return await this.wbItemPacketModel.find().exec();
  }
  async findOne(_id): Promise<any> {
    return await this.wbItemPacketModel.findOne({ _id: _id })
      .exec();
  }
  async update(_id, wbItemPacketDto: WbItemPacketDto): Promise<any> {
    return await this.wbItemPacketModel.updateOne({_id : _id}, wbItemPacketDto).exec();
  }

  async deleteOne(_id): Promise<any> {
    return await this.wbItemPacketModel.deleteOne({ _id: _id })
      .exec();
  }

}

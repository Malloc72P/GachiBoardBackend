import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { KanbanDataDtoIntf } from '../../DTO/KanbanDataDto/kanban-data-dto-intf.interface';
import { KanbanDataDto } from '../../DTO/KanbanDataDto/kanban-data-dto';

@Injectable()
export class KanbanDataDaoService {
  constructor(
    @InjectModel('KANBAN_DATA_MODEL') private readonly kanbanDataModel: Model<KanbanDataDtoIntf>
  ){

  }

  async create(createKanbanDataDto: KanbanDataDto): Promise<any> {

    const createdUsers = new this.kanbanDataModel(createKanbanDataDto);
    return createdUsers.save();
  }

  async findAll(): Promise<any[]> {
    return await this.kanbanDataModel.find().exec();
  }
  async findOne(_id): Promise<any> {
    return await this.kanbanDataModel.findOne({ _id: _id })
      .populate([
        { path : "todoGroup",       model : "KANBAN_ITEM_MODEL" },
        { path : "inProgressGroup", model : "KANBAN_ITEM_MODEL" },
        { path : "doneGroup",       model : "KANBAN_ITEM_MODEL" }
      ])
      .exec();
  }
  async update(_id, kanbanDataDto:KanbanDataDto): Promise<any> {
    return await this.kanbanDataModel.updateOne({_id : _id}, kanbanDataDto).exec();
  }
}

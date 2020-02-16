import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { KanbanItemDto } from '../../DTO/KanbanItemDto/kanban-item-dto';
import { KanbanItemDtoIntf } from '../../DTO/KanbanItemDto/kanban-item-intf.interface';

@Injectable()
export class KanbanItemDaoService {
  constructor(
    @InjectModel('KANBAN_ITEM_MODEL') private readonly kanbanItemModel: Model<KanbanItemDtoIntf>
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


}

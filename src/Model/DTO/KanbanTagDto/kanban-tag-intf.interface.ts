import * as mongoose from 'mongoose';

export interface KanbanTagDtoIntf extends Document{
  _id;
  title:string;
  color:string;
}

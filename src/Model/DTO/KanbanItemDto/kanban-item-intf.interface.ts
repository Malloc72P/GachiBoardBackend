import * as mongoose from 'mongoose';

export interface KanbanItemDtoIntf extends Document{
  _id;
  title     : string;
  userInfo  : string;
  color     : string;
}
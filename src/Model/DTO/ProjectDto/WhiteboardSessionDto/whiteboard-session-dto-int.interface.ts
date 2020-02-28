import * as mongoose from 'mongoose';

export interface WhiteboardSessionDtoIntf extends Document{
  _id;
  title;
  createdBy;
  recentlyModifiedBy;
  startDate;
  wbItemArray:Array<any>;
  connectedUsers:Array<any>;
}

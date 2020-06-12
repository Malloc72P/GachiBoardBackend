import * as mongoose from 'mongoose';

export interface WhiteboardSessionDtoIntf extends mongoose.Document{
  _id;
  title;
  createdBy;
  recentlyModifiedBy;
  startDate;
  wbItemArray:Array<any>;
  connectedUsers:Array<any>;

  zIndexMinimum;
  zIndexMaximum;
}

import * as mongoose from 'mongoose';

export interface KanbanItemDtoIntf extends mongoose.Document{
  _id;
  title     : string;
  userInfo  : string;
  color     : string;
  lockedBy  : string;
  tagIdList : Array<any>;
  isTimerStarted;
  timerStartDate:Date;
  timerEndDate:Date;
}

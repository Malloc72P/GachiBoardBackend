import * as mongoose from 'mongoose';
import { TouchHistory } from './TouchHistory/TouchHistory';

export interface WbItemPacketDtoIntf extends mongoose.Document{
  _id;
  createdBy;
  occupiedBy;
  lastModifier;
  version;
  touchHistory:Array<TouchHistory>;
  wbItemDto;
  createdDate;
  modifiedDate;
  projectTitle;
}

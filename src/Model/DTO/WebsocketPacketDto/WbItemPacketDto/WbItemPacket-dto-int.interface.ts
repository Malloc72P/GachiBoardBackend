import * as mongoose from 'mongoose';
import { TouchHistory } from './TouchHistory/TouchHistory';

export interface WbItemPacketDtoIntf extends Document{
  _id;
  createdBy;
  lastModifier;
  version;
  touchHistory:Array<TouchHistory>;
  wbItemDto;
  createdDate;
  modifiedDate;
  projectTitle;
}

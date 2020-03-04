import * as mongoose from 'mongoose';

export const WbItemPacketSchema = new mongoose.Schema({
  createdBy      : { type: String   , required  : true},
  occupiedBy     : { type: String                     },
  lastModifier   : { type: String   , required  : true},
  version        : { type: Number   , required  : true},
  touchHistory   : { type: Array    , required  : true},
  wbItemDto      : { type: Object   , required  : true},
  createdDate    : { type: Date     , default   : Date.now },
  modifiedDate   : { type: Date     , default   : Date.now },
});

import * as mongoose from 'mongoose';

export const WhiteboardSessionSchema = new mongoose.Schema({
  title               : { type: String, required: true},
  createdBy           : { type: String, required: true},
  recentlyModifiedBy  : { type: String, required: true},
  startDate           : { type: Date, default: Date.now },
  wbItemArray         : [ {type: mongoose.Schema.Types.ObjectId, ref: "WHITEBOARD_ITEM_PACKET_MODEL"} ],
  connectedUsers      : { type: Array, required: true},
});

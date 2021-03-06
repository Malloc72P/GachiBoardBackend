import * as mongoose from 'mongoose';

export const KanbanItemSchema = new mongoose.Schema({
  title       : { type: String, required: true},
  userInfo    : { type: String, required: true},
  color       : { type: String, required: true},
  tagIdList   : [{ type: mongoose.Schema.Types.ObjectId, ref: "KANBAN_TAG_MODEL" }],
  parentGroup : { type: String, required: true },
  lockedBy    : { type: String },
  isTimerStarted  : {type: Boolean},
  timerStartDate  : {type: Date},
  timerEndDate    : {type: Date},
});

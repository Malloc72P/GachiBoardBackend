import * as mongoose from 'mongoose';

export const KanbanItemSchema = new mongoose.Schema({
  title       : { type: String, required: true},
  userInfo    : { type: String, required: true},
  color       : { type: String, required: true},
  tagIdList   : Array,
  parentGroup : { type: String, required: true }
});

import * as mongoose from 'mongoose';

export const KanbanTagSchema = new mongoose.Schema({
  title       : { type: String, required: true, unique : true},
  color       : { type: String, required: true},
});

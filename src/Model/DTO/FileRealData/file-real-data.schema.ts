import * as mongoose from 'mongoose';
import { KanbanDataDto } from '../KanbanDataDto/kanban-data-dto';

export const FileRealDataSchema = new mongoose.Schema({
  type  : { type: String,  required: true},
});

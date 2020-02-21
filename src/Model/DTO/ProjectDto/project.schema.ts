import * as mongoose from 'mongoose';
import { KanbanDataDto } from '../KanbanDataDto/kanban-data-dto';

export const ProjectSchema = new mongoose.Schema({
  projectTitle : { type: String, required: true},
  createdBy : { type: String, required: true},
  startDate : { type: Date, default: Date.now },
  kanbanData : { type: mongoose.Schema.Types.ObjectId, ref: "KANBAN_DATA_MODEL" },
  inviteCodeList : { type: Array, required: true},
  participantList : { type: Array, required: true},
  whiteboardSessionList : [{ type: mongoose.Schema.Types.ObjectId, ref: "WHITEBOARD_SESSION_MODEL" }],
});

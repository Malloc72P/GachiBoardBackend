import * as mongoose from 'mongoose';
import { KanbanDataDto } from './KanbanDataDto/kanban-data-dto';

export const ProjectSchema = new mongoose.Schema({
  projectTitle : { type: String, required: true},
  createdBy : { type: String, required: true},
  startDate : { type: Date, default: Date.now },
  kanbanData : { type: Object, required: true},
  inviteCodeList : { type: Array, required: true},
  participantList : { type: Array, required: true},
  connectedParticipant : { type: Array, required: true},
  whiteboardSessionList : { type: Array, required: true},
});

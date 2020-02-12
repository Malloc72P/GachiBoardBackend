import * as mongoose from 'mongoose';
import { KanbanDataDto } from './KanbanDataDto/kanban-data-dto';
import { ParticipantDto } from './ParticipantDto/participant-dto';
import { WhiteboardSessionDto } from './WhiteboardSessionDto/whiteboard-session-dto';

export interface ProjectDtoIntf extends Document{
  _id;
  projectTitle;
  createdBy;
  startDate;
  kanbanData;
  participantList:Array<ParticipantDto>;
  whiteboardSessionList:Array<WhiteboardSessionDto>;
}

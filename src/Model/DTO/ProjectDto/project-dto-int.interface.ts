import * as mongoose from 'mongoose';
import { KanbanDataDto } from '../KanbanDataDto/kanban-data-dto';
import { ParticipantDto } from './ParticipantDto/participant-dto';
import { WhiteboardSessionDto } from './WhiteboardSessionDto/whiteboard-session-dto';
import { InviteCodeDto } from './InviteCodeDto/InviteCodeDto';

export interface ProjectDtoIntf extends mongoose.Document{
  _id;
  projectTitle;
  createdBy;
  startDate;
  inviteCodeList:Array<InviteCodeDto>;
  participantList:Array<ParticipantDto>;
  whiteboardSessionList:Array<WhiteboardSessionDto>;
}

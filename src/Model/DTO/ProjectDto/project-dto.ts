import {KanbanDataDto} from './KanbanDataDto/kanban-data-dto';
import {ParticipantDto} from './ParticipantDto/participant-dto';
import {WhiteboardSessionDto} from './WhiteboardSessionDto/whiteboard-session-dto';
import { InviteCodeDto } from './InviteCodeDto/InviteCodeDto';

export class ProjectDto {
  public _id;
  public projectTitle;
  public createdBy;
  public startDate;
  public kanbanData:KanbanDataDto;
  public inviteCodeList:Array<InviteCodeDto>;
  public participantList:Array<ParticipantDto>;
  public connectedParticipant:Array<ParticipantDto>;
  public whiteboardSessionList:Array<WhiteboardSessionDto>;

  constructor(){
    this.kanbanData = new KanbanDataDto();
    this.participantList = new Array<ParticipantDto>();
    this.whiteboardSessionList = new Array<WhiteboardSessionDto>();
    this.inviteCodeList = new Array<InviteCodeDto>();
  }

  public getCreaterName(){
    for(let i = 0 ; i < this.participantList.length; i++){
      let currParticipant = this.participantList[i];
      if(this.createdBy === currParticipant.idToken){
        return currParticipant.userName;
      }
    }
  }
}

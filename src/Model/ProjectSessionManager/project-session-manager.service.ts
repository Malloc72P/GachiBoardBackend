import { Injectable } from '@nestjs/common';
import { ProjectDaoService } from '../DAO/project-dao/project-dao.service';
import { ProjectDto } from '../DTO/ProjectDto/project-dto';
import { ProjectSession } from './project-session/project-session';

@Injectable()
export class ProjectSessionManagerService {
  private projectWsConnectionMap:Map<string,ProjectSession>;
  constructor(
    private projectDaoService:ProjectDaoService
  ){
    this.projectWsConnectionMap = new Map<string, ProjectSession>();
  }

  addConnection(socketId, projectId, idToken){
    this.projectDaoService.findOne(projectId)
      .then((projectDto:ProjectDto)=>{
        let participant = null;
        for (let i = 0; i < projectDto.participantList.length; i++) {
          let value = projectDto.participantList[i];
          if(value.idToken === idToken){
            participant = value;
            break;
          }
        }
        if(participant){
          projectDto.connectedParticipant.push(participant);
          this.projectDaoService.update(projectDto._id, projectDto)
            .then((data)=>{
              console.log("ProjectSessionManagerService >>  >> data : ",data);
              this.projectWsConnectionMap.set(socketId, new ProjectSession(projectId, idToken));
            });

        }
      });
  }
  removeConnection(socketId){
    let purgedConnection = this.projectWsConnectionMap.get(socketId);
    if(!purgedConnection){
      return;
    }

    this.projectDaoService.findOne(purgedConnection.projectId)
      .then((projectDto:ProjectDto)=>{
        let delIdx = -1;
        for (let i = 0; i < projectDto.connectedParticipant.length; i++) {
          let participant = projectDto.connectedParticipant[i];
          if(participant.idToken === purgedConnection.idToken){
            delIdx = i;
            break;
          }
        }
        if(delIdx > -1){
          projectDto.connectedParticipant.splice(delIdx, 1);
        }
        this.projectDaoService.update(projectDto._id, projectDto)
          .then((data)=>{
            this.projectWsConnectionMap.delete(socketId);
          console.log("ProjectSessionManagerService >>  >> data : ",data);
        });
      });
  }
}

import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Client, Server, Socket } from 'socket.io';
import { HttpHelper, WebsocketValidationCheck } from '../../Model/Helper/HttpHelper/HttpHelper';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { ProjectSessionManagerService } from '../../Model/ProjectSessionManager/project-session-manager.service';

@WebSocketGateway()
export class ProjectWebsocketGateway implements OnGatewayDisconnect{

  constructor(
    private userDao:UserDaoService,
    private projectDao:ProjectDaoService,
    private projectSessionManagerService:ProjectSessionManagerService
    ){

  }

  @WebSocketServer() server: Server;


  handleDisconnect(client) {
    console.log("ProjectWebsocketGateway >> handleDisconnect >> 진입함");
    console.log("ProjectWebsocketGateway >> handleDisconnect >> client : ",client.id);
    this.projectSessionManagerService.removeConnection(client.id);
  }


  @SubscribeMessage(HttpHelper.websocketApi.project.joinProject.event)
  onJoinProject(socket: Socket, data) {
    let idToken = data.idToken;
    let accessToken = data.accessToken;
    let project_id = data.project_id;

    console.log("ProjectWebsocketGateway >> onJoinProject >> socket : ",socket.id);

    //this.projectSessionManagerService.checkAlreadyJoined(project_id, idToken);

    try {
      this.userDao.findOne(idToken)
        .then((userDto:UserDto)=>{
          if(userDto.accessToken !== accessToken){
            throw WebsocketValidationCheck.INVALID_USER;
          }

          this.projectDao.findOne(project_id)
            .then((projectDto:ProjectDto)=>{
              if(!projectDto){
                throw WebsocketValidationCheck.INVALID_PROJECT;
              }
              let participantDto = this.projectDao.getParticipantByUserDto(projectDto, userDto);
              if(!participantDto){
                throw WebsocketValidationCheck.INVALID_PARTICIPANT;
              }

              for (let i = 0; i < projectDto.connectedParticipant.length; i++) {
                let value = projectDto.connectedParticipant[i];
                if(value.idToken === userDto.idToken){
                  console.log("ProjectWebsocketGateway >> onJoinProject >> already connected user");
                  socket.emit(HttpHelper.websocketApi.project.joinProject.event,
                    {result : 'already connected'});
                  return;
                }
              }

              //#### 최종적으로 성공한 경우
              let projectNamespace = projectDto._id;

              socket.join(projectNamespace);

              //this.projectSessionManagerService.addUser(project_id, userDto._id.toString());
              this.projectSessionManagerService.addConnection(socket.id, project_id,  idToken);
              socket.broadcast.to(projectNamespace)
                .emit(HttpHelper.websocketApi.project.joinProject.event,
                  {participantDto : participantDto});

              socket.emit(HttpHelper.websocketApi.project.joinProject.event,
                {result : 'success'});


            })
        });
    }catch (e) {
      console.log("ProjectWebsocketGateway >> onJoinProject >> e : ",e);
    }
  }

}

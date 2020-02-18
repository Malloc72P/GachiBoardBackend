import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpHelper, WebsocketValidationCheck } from '../../Model/Helper/HttpHelper/HttpHelper';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { ProjectSessionManagerService } from '../../Model/ProjectSessionManager/project-session-manager.service';
import { WebsocketPacketDto } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketDto';
import { WebsocketPacketActionEnum, WebsocketPacketScopeEnum } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketActionEnum';

@WebSocketGateway()
export class ProjectWebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect{

  constructor(
    private userDao:UserDaoService,
    private projectDao:ProjectDaoService,
    private projectSessionManagerService:ProjectSessionManagerService
    ){

  }

  @WebSocketServer() server: Server;

  handleConnection(client: Socket){
    console.log("ProjectWebsocketGateway >> handleConnection >> client : ",client.id);
  }
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
              console.log("ProjectWebsocketGateway >> projectDao >> findOne >> projectDto : ",projectDto);
              let participantDto = this.projectDao.getParticipantByUserDto(projectDto, userDto);
              if(!participantDto){
                throw WebsocketValidationCheck.INVALID_PARTICIPANT;
              }
              //#### 최종적으로 성공한 경우
              let projectNamespace = projectDto._id;

              socket.join(projectNamespace);

              //this.projectSessionManagerService.addUser(project_id, userDto._id.toString());
              this.projectSessionManagerService.addConnection(socket, idToken, project_id);
              socket.broadcast.to(projectNamespace)
                .emit(HttpHelper.websocketApi.project.joinProject.event,
                  {participantDto : participantDto});
              projectDto.inviteCodeList = null;
              let ackPacket = WebsocketPacketDto.createAckPacket(0, projectDto._id.toString());
              ackPacket.dataDto = projectDto;
              socket.emit(HttpHelper.websocketApi.project.joinProject.event, ackPacket);


            })
            .catch((rejection)=>{
              this.onJoinProjectErrorHandler(socket.id, project_id, idToken, rejection);
            });
        })
        .catch((rejection)=>{
          this.onJoinProjectErrorHandler(socket.id, project_id, idToken, rejection);
        });
    }catch (e) {
      console.log("ProjectWebsocketGateway >> onJoinProject >> e : ",e);
      console.log("ProjectWebsocketGateway >> onJoinProject >> e : ",e.message);
      if(e === 'already connected'){
        socket.emit(HttpHelper.websocketApi.project.joinProject.event,
          {result : 'already connected'});
        return;
      }
    }
  }

  onJoinProjectErrorHandler(socketId, projectId, idToken, e){
    console.log("ProjectWebsocketGateway >> onJoinProjectErrorHandler >> e : ",e);

  }

}

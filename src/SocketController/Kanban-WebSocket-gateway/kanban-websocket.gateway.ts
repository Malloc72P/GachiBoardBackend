import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Client, Server, Socket } from 'socket.io';
import { HttpHelper, WebsocketValidationCheck } from '../../Model/Helper/HttpHelper/HttpHelper';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { ProjectSessionManagerService } from '../../Model/ProjectSessionManager/project-session-manager.service';
import { WebsocketPacketDto } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketDto';

@WebSocketGateway()
export class KanbanWebsocketGateway{
  @WebSocketServer() server: Server;

  constructor(
    private userDao:UserDaoService,
    private projectDao:ProjectDaoService,
    private projectSessionManagerService:ProjectSessionManagerService
    ){

  }

  @SubscribeMessage(HttpHelper.websocketApi.kanban.create.event)
  onKanbanItemCreate(socket: Socket, packetDto:WebsocketPacketDto) {
    console.log("KanbanWebsocketGateway >> onKanbanItemCreate >> packetDto : ",packetDto);
    this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
      .then((data)=>{
        let userDto = data.userDto;
        let projectDto = data.projectDto;
        /*console.log("KanbanWebsocketGateway >> verifyRequest >> then >> userDto : ",userDto);
        console.log("KanbanWebsocketGateway >> verifyRequest >> then >> projectDto : ",projectDto);*/

        packetDto.accessToken = null;
        let ackPacket = WebsocketPacketDto.createAckPacket(packetDto.wsPacketSeq, projectDto._id.toString());
        ackPacket.dataDto = packetDto.dataDto;
        socket.emit(HttpHelper.websocketApi.kanban.create.event, ackPacket);
        socket.broadcast.to(projectDto._id.toString()).emit(HttpHelper.websocketApi.kanban.create.event, packetDto);
      })
      .catch((e)=>{
        console.log("KanbanWebsocketGateway >> verifyRequest >> catch >> e : ",e);
      })
  }


}

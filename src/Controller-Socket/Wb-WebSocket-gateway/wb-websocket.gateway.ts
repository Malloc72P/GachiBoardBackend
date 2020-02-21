import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpHelper, WebsocketValidationCheck } from '../../Model/Helper/HttpHelper/HttpHelper';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { RejectionEvent, RejectionEventEnum } from '../../Model/Helper/PromiseHelper/RejectionEvent';
import { WebsocketPacketDto } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketDto';

@WebSocketGateway()
export class WbWebsocketGateway{

  constructor(
    private userDao:UserDaoService,
    private projectDao:ProjectDaoService,
    ){

  }

  @WebSocketServer() server: Server;



  @SubscribeMessage(HttpHelper.websocketApi.whiteboardSession.create.event)
  onWbSessionCreateRequest(socket: Socket, data) {

  }

  wsKanbanErrHandler(rejection:RejectionEvent, socket:Socket, packetDto:WebsocketPacketDto, event){
    console.warn("KanbanWebsocketGateway >> wsKanbanErrHandler >> reason : ",RejectionEventEnum[rejection.action]);
    if(rejection.action === RejectionEventEnum.DEBUGING){
      return;
    }
    let nakPacket:WebsocketPacketDto;
    switch (rejection.action) {
      case RejectionEventEnum.ALREADY_LOCKED:
        nakPacket = WebsocketPacketDto.createNakPacket(packetDto.wsPacketSeq, packetDto.namespaceValue);
        nakPacket.additionalData = RejectionEventEnum.ALREADY_LOCKED;
        socket.emit(event, nakPacket);
        break;
      case RejectionEventEnum.LOCKED_BY_ANOTHER_USER:
        nakPacket = WebsocketPacketDto.createNakPacket(packetDto.wsPacketSeq, packetDto.namespaceValue);
        nakPacket.additionalData = RejectionEventEnum.LOCKED_BY_ANOTHER_USER;
        socket.emit(event, nakPacket);
        break;

    }
  }


}

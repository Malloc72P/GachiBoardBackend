import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpHelper, WebSocketRequest, WebsocketValidationCheck } from '../../Model/Helper/HttpHelper/HttpHelper';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { RejectionEvent, RejectionEventEnum } from '../../Model/Helper/PromiseHelper/RejectionEvent';
import { WebsocketPacketDto } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketDto';
import { WhiteboardSessionDto } from '../../Model/DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import { WhiteboardSessionDaoService } from '../../Model/DAO/whiteboard-session-dao/whiteboard-session-dao.service';

@WebSocketGateway()
export class WbSessionWebsocketGateway{

  constructor(
    private userDao:UserDaoService,
    private projectDao:ProjectDaoService,
    private whiteboardSessionDao:WhiteboardSessionDaoService,
    ){

  }

  @WebSocketServer() server: Server;

  @SubscribeMessage(HttpHelper.websocketApi.whiteboardSession.create.event)
  onWbSessionCreateRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    let wbSessionDto:WhiteboardSessionDto = packetDto.dataDto as WhiteboardSessionDto;
    console.log("WbSessionWebsocketGateway >> onWbSessionCreateRequest >> wbSessionDto : ",wbSessionDto);

    this.whiteboardSessionDao.createWbSession(packetDto)
      .then((resolveParam)=>{
        let userDto          = resolveParam.userDto;
        let projectDto       = resolveParam.projectDto;
        let additionalData   = resolveParam.additionalData;

        packetDto.dataDto         = additionalData.createdWbSession;

        WbSessionWebsocketGateway.responseAckPacket( socket,
          HttpHelper.websocketApi.whiteboardSession.create, packetDto, additionalData.wbSessionList);
      }).catch((e:RejectionEvent)=>{
        this.wsErrHandler(e, socket, packetDto, HttpHelper.websocketApi.whiteboardSession.create.event);
    });


  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardSession.read.event)
  onWbSessionGetRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    let wbSessionDto:WhiteboardSessionDto = packetDto.dataDto as WhiteboardSessionDto;
    console.log("WbSessionWebsocketGateway >> onWbSessionCreateRequest >> wbSessionDto : ",wbSessionDto);

    this.whiteboardSessionDao.getWbSessionListByProjectId(packetDto)
      .then((resolveParam)=>{
        let userDto          = resolveParam.userDto;
        let projectDto       = resolveParam.projectDto;

        packetDto.dataDto = projectDto.whiteboardSessionList;

        WbSessionWebsocketGateway.responseAckPacket( socket,
          HttpHelper.websocketApi.whiteboardSession.read, packetDto);
      }).catch((e:RejectionEvent)=>{
      this.wsErrHandler(e, socket, packetDto, HttpHelper.websocketApi.whiteboardSession.read.event);
    });


  }

  @SubscribeMessage(HttpHelper.websocketApi.whiteboardSession.join.event)
  onWbSessionJoinRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    let wbSessionDto:WhiteboardSessionDto = packetDto.dataDto as WhiteboardSessionDto;
    console.log("WbSessionWebsocketGateway >> onWbSessionCreateRequest >> wbSessionDto : ",wbSessionDto);

    this.whiteboardSessionDao.joinWbSession(packetDto)
      .then((data)=>{
        let userDto = data.userDto;
        let projectDto = data.projectDto;
        let foundWbSessionDto:WhiteboardSessionDto = data.additionalData;

        socket.join(foundWbSessionDto._id);
        packetDto.dataDto = foundWbSessionDto;

        WbSessionWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardSession.join, packetDto);
      }).catch((e)=>{
      let reject = new RejectionEvent(RejectionEventEnum.JOINED_FAILED, e);
      this.wsErrHandler(reject, socket, packetDto, HttpHelper.websocketApi.whiteboardSession.join.event);
    });


  }


  private static responseAckPacket(socket:Socket, webSocketRequest:WebSocketRequest, packetDto:WebsocketPacketDto,  additionalData?){
    let ackPacket = WebsocketPacketDto.createAckPacket(packetDto.wsPacketSeq, packetDto.namespaceValue);
    ackPacket.dataDto = packetDto.dataDto;

    if(additionalData){
      ackPacket.additionalData = additionalData;
    }

    socket.emit(webSocketRequest.event, ackPacket);
    socket.broadcast.to(packetDto.namespaceValue.toString()).emit(webSocketRequest.event, packetDto);
  }
  wsErrHandler(rejection:RejectionEvent, socket:Socket, packetDto:WebsocketPacketDto, event){
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

  @SubscribeMessage(HttpHelper.websocketApi.whiteboardSession.update.event)
  onWbSessionPing(socket: Socket, packetDto:WebsocketPacketDto) {
    let wbSessionDto:WhiteboardSessionDto = packetDto.dataDto as WhiteboardSessionDto;
    console.log("WbSessionWebsocketGateway >> onWbSessionPing >> wbSessionDto : ",wbSessionDto);


    WbSessionWebsocketGateway.responseAckPacket( socket,
      HttpHelper.websocketApi.whiteboardSession.update, packetDto);


  }



}

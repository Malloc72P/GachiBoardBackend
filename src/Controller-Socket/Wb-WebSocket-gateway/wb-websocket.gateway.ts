import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpHelper, WebSocketRequest, WebsocketValidationCheck } from '../../Model/Helper/HttpHelper/HttpHelper';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { RejectionEvent, RejectionEventEnum } from '../../Model/Helper/PromiseHelper/RejectionEvent';
import { WebsocketPacketDto } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketDto';
import { WhiteboardItemDto } from '../../Model/DTO/WhiteboardItemDto/whiteboard-item-dto';

@WebSocketGateway()
export class WbWebsocketGateway{

  constructor(
    private userDao:UserDaoService,
    private projectDao:ProjectDaoService,
    ){

  }

  private static _idGenerater:number = 0;

  static get idGenerater(): number {
    return this._idGenerater++;
  }

  @WebSocketServer() server: Server;


  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.create.event)
  onWbItemCreateRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    console.log("WbWebsocketGateway >> onWbItemCreateRequest >> packetDto : ",packetDto);
    packetDto.dataDto["id"] = WbWebsocketGateway.idGenerater;
    console.log("WbWebsocketGateway >> onWbItemCreateRequest >> packetDto : ",packetDto);
    WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.create, packetDto);
  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.create_multiple.event)
  onWbItemMultipleCreateRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    console.log("WbWebsocketGateway >> onWbItemMultipleCreateRequest >> packetDto : ",packetDto);
    let wbItemArray:Array<WhiteboardItemDto> = packetDto.dataDto as Array<WhiteboardItemDto>;
    for(let wbItem of wbItemArray){
        wbItem.id = WbWebsocketGateway.idGenerater;
    }
    console.log("WbWebsocketGateway >> onWbItemCreateRequest >> packetDto : ",packetDto);
    WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.create_multiple, packetDto);
  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.update.event)
  onWbItemUpdateRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    console.log("WbWebsocketGateway >> onWbItemUpdateRequest >> packetDto : ",packetDto);
    WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.update, packetDto);
  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.delete.event)
  onWbItemDeleteRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    console.log("WbWebsocketGateway >> onWbItemDeleteRequest >> packetDto : ",packetDto);
    WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.delete, packetDto);
  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.unlock.event)
  onWbItemLockRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.unlock, packetDto);
  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.lock.event)
  onWbItemUnlockRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.lock, packetDto);
  }

  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.occupied.event)
  onWbItemOccupiedRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.occupied, packetDto);
  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.notOccupied.event)
  onWbItemNotOccupiedRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.notOccupied, packetDto);
  }



  private static responseAckPacket(socket:Socket, webSocketRequest:WebSocketRequest, packetDto:WebsocketPacketDto,  additionalData?){
    let ackPacket = WebsocketPacketDto.createAckPacket(packetDto.wsPacketSeq, packetDto.namespaceValue);
    ackPacket.dataDto = packetDto.dataDto;
    ackPacket.additionalData = packetDto.additionalData;

    if(additionalData){
      ackPacket.additionalData = additionalData;
    }

    socket.emit(webSocketRequest.event, ackPacket);
    socket.broadcast.to(packetDto.namespaceValue.toString()).emit(webSocketRequest.event, packetDto);
  }

  wsWbItemErrHandler(rejection:RejectionEvent, socket:Socket, packetDto:WebsocketPacketDto, event){
    console.warn("WbWebsocketGateway >> wsWbItemErrHandler >> reason : ",RejectionEventEnum[rejection.action]);
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

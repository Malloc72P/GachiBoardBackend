import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { HttpHelper, WebSocketRequest, WebsocketValidationCheck } from '../../Model/Helper/HttpHelper/HttpHelper';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { RejectionEvent, RejectionEventEnum } from '../../Model/Helper/PromiseHelper/RejectionEvent';
import { WebsocketPacketDto } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketDto';
import { WhiteboardItemDto } from '../../Model/DTO/WhiteboardItemDto/whiteboard-item-dto';
import { WhiteboardItemType } from '../../Model/Helper/data-type-enum/data-type.enum';
import { EditableLinkDto } from '../../Model/DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/editable-link-dto';
import { WhiteboardItemDaoService } from '../../Model/DAO/whiteboard-item-dao/whiteboard-item-dao.service';

@WebSocketGateway()
export class WbWebsocketGateway{

  constructor(
    private userDao:UserDaoService,
    private projectDao:ProjectDaoService,
    private whiteboardItemDao:WhiteboardItemDaoService,
    ){

  }

  private static _idGenerater:number = 0;

  static get idGenerater(): number {
    return this._idGenerater++;
  }

  @WebSocketServer() server: Server;

  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.read.event)
  onWbItemGetListRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    this.whiteboardItemDao.getWbItemList(packetDto)
      .then((resolveParam)=>{
        let userDto = resolveParam.userDto;
        let projectDto = resolveParam.projectDto;
        let wbItemPacketList = resolveParam.wbItemList;
        let wbItemDtoArray:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();
        for(let wbItemPacket of wbItemPacketList){
            wbItemDtoArray.push(wbItemPacket.wbItemDto);
        }
        packetDto.dataDto = wbItemDtoArray;
        WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.read, packetDto, wbItemPacketList);
      });
  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.create.event)
  onWbItemCreateRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    this.whiteboardItemDao.saveWbItem(packetDto)
      .then((resolveParam)=>{
        let userDto = resolveParam.userDto;
        let projectDto = resolveParam.projectDto;
        let createdWbItemPacket = resolveParam.createdWbItemPacket;
        packetDto.dataDto = createdWbItemPacket.wbItemDto;
        WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.create, packetDto, createdWbItemPacket);
      });
  }

  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.create_multiple.event)
  onWbItemMultipleCreateRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    this.whiteboardItemDao.saveMultipleWbItem(packetDto)
      .then((resolveParam)=>{
        let userDto = resolveParam.userDto;
        let projectDto = resolveParam.projectDto;
        let createdWbItemPacket = resolveParam.createdWbItemPacket;
        let wbItemArray:Array<WhiteboardItemDto> = new Array<WhiteboardItemDto>();
        for(let wbItemPacket of createdWbItemPacket){
            wbItemArray.push(wbItemPacket.wbItemDto);
        }
        packetDto.dataDto = wbItemArray;
        packetDto.additionalData = createdWbItemPacket;
        WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.create_multiple, packetDto);
      });
  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.update.event)
  onWbItemUpdateRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    this.whiteboardItemDao.updateWbItem(packetDto)
      .then((resolveParam)=>{
        let userDto = resolveParam.userDto;
        let projectDto = resolveParam.projectDto;
        let updatedWbItemPacket = resolveParam.updatedWbItemPacket;
        WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.update, packetDto, updatedWbItemPacket);
      })
      .catch((rejection)=>{
        this.wsWbItemErrHandler(rejection, socket, packetDto, HttpHelper.websocketApi.whiteboardItem.create_multiple);
      });
  }
  @SubscribeMessage(HttpHelper.websocketApi.whiteboardItem.delete.event)
  onWbItemDeleteRequest(socket: Socket, packetDto:WebsocketPacketDto) {
    this.whiteboardItemDao.deleteWbItem(packetDto)
      .then((resolveParam)=>{
        let userDto = resolveParam.userDto;
        let projectDto = resolveParam.projectDto;
        WbWebsocketGateway.responseAckPacket( socket, HttpHelper.websocketApi.whiteboardItem.delete, packetDto);
      });
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
    console.log("WbWebsocketGateway >> wsWbItemErrHandler >> rejection : ",rejection.data);
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
import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Client, Server, Socket } from 'socket.io';
import { HttpHelper, WebsocketValidationCheck } from '../../Model/Helper/HttpHelper/HttpHelper';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { ProjectSessionManagerService } from '../../Model/ProjectSessionManager/project-session-manager.service';
import { WebsocketPacketDto } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketDto';
import { KanbanItemDaoService } from '../../Model/DAO/kanban-item-dao/kanban-item-dao.service';
import { KanbanGroupEnum, KanbanItemDto } from '../../Model/DTO/KanbanItemDto/kanban-item-dto';
import { KanbanDataDaoService } from '../../Model/DAO/kanban-data-dao/kanban-data-dao.service';
import { KanbanDataDto } from '../../Model/DTO/KanbanDataDto/kanban-data-dto';
import { RejectionEvent, RejectionEventEnum } from '../../Model/Helper/PromiseHelper/RejectionEvent';

@WebSocketGateway()
export class KanbanWebsocketGateway{
  @WebSocketServer() server: Server;

  constructor(
    private userDao:UserDaoService,
    private projectDao:ProjectDaoService,
    private kanbanItemDao:KanbanItemDaoService,
    private kanbanDataDao:KanbanDataDaoService,

    private projectSessionManagerService:ProjectSessionManagerService,
    ){

  }

  @SubscribeMessage(HttpHelper.websocketApi.kanban.create.event)
  onKanbanItemCreate(socket: Socket, packetDto:WebsocketPacketDto) {
    console.log("KanbanWebsocketGateway >> onKanbanItemCreate >> packetDto : ",packetDto);
    let kanbanItemDto:KanbanItemDto = packetDto.dataDto as KanbanItemDto;
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
      .then((data)=>{
        let userDto = data.userDto;
        let projectDto = data.projectDto;

        this.kanbanItemDao.create(kanbanItemDto)
          .then((newkanbanItemDto:KanbanItemDto)=>{
            console.log("KanbanWebsocketGateway >> kanbanItemDao.create >> projectDto.kanbanData._id : ",projectDto.kanbanData._id);
            this.kanbanDataDao.findOne(projectDto.kanbanData._id)
              .then((kanbanData:KanbanDataDto)=>{
                let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup;
                let kanbanGroup:Array<any> = null;
                switch (groupEnum) {
                  case KanbanGroupEnum.TODO:
                    kanbanGroup = kanbanData.todoGroup;
                    break;
                  case KanbanGroupEnum.IN_PROGRESS:
                    kanbanGroup = kanbanData.inProgressGroup;
                    break;
                  case KanbanGroupEnum.DONE:
                    kanbanGroup = kanbanData.doneGroup;
                    break;
                  default:
                    kanbanGroup = kanbanData.todoGroup;
                }
                kanbanGroup.push(newkanbanItemDto._id);

                this.kanbanDataDao.update(kanbanData._id, kanbanData)
                  .then((updateResult)=>{
                    console.log("KanbanWebsocketGateway >> projectDao >> update >> updateResult : ",updateResult);
                    packetDto.accessToken = null;

                    packetDto.dataDto["_id"] = newkanbanItemDto._id;
                    let ackPacket = WebsocketPacketDto.createAckPacket(packetDto.wsPacketSeq, projectDto._id.toString());
                    ackPacket.dataDto = packetDto.dataDto;
                    socket.emit(HttpHelper.websocketApi.kanban.create.event, ackPacket);
                    socket.broadcast.to(projectDto._id.toString()).emit(HttpHelper.websocketApi.kanban.create.event, packetDto);
                  })
                  .catch((e)=>{console.log("KanbanWebsocketGateway >>  >> e : ",e);});

              })
              .catch((e)=>{ console.log("KanbanWebsocketGateway >>  >> e : ",e); });
          })
          .catch((e)=>{
            console.log("KanbanWebsocketGateway >> kanbanItemDao >> create >> e : ",e);
          });

      })
      .catch((e)=>{
        console.log("KanbanWebsocketGateway >> verifyRequest >> catch >> e : ",e);
      })
  }

  @SubscribeMessage(HttpHelper.websocketApi.kanban.delete.event)
  onKanbanItemDelete(socket: Socket, packetDto:WebsocketPacketDto) {
    let kanbanItemDto:KanbanItemDto = packetDto.dataDto as KanbanItemDto;
    this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
      .then((data)=>{
        let userDto = data.userDto;
        let projectDto = data.projectDto;
        this.kanbanItemDao.deleteOne(kanbanItemDto._id)
          .then(()=>{
            this.kanbanDataDao.findOne(projectDto.kanbanData._id)
              .then((kanbanData:KanbanDataDto)=>{
                let groupEnum:KanbanGroupEnum = kanbanItemDto.parentGroup as KanbanGroupEnum;

                let targetGroup:Array<any> = null;

                switch (groupEnum) {
                  case KanbanGroupEnum.TODO:
                    targetGroup = kanbanData.todoGroup;
                    break;
                  case KanbanGroupEnum.IN_PROGRESS:
                    targetGroup = kanbanData.inProgressGroup;
                    break;
                  case KanbanGroupEnum.DONE:
                    targetGroup = kanbanData.doneGroup;
                    break;
                  default :
                    return;
                }
                let index = -1;
                for(let i = 0 ; i < targetGroup.length; i++){
                  let currItem = targetGroup[i];

                  if(currItem._id === kanbanItemDto._id){
                    index = i;
                    break;
                  }
                }

                if(index >= 0){
                  targetGroup.splice(index, 1);
                }

                this.kanbanDataDao.update(kanbanData._id, kanbanData)
                  .then(()=>{
                    packetDto.accessToken = null;
                    let ackPacket = WebsocketPacketDto.createAckPacket(packetDto.wsPacketSeq, projectDto._id.toString());
                    ackPacket.dataDto = packetDto.dataDto;
                    socket.emit(HttpHelper.websocketApi.kanban.delete.event, ackPacket);
                    socket.broadcast.to(projectDto._id.toString()).emit(HttpHelper.websocketApi.kanban.delete.event, packetDto);
                  })
                  .catch((e)=>{
                    console.log("KanbanWebsocketGateway >> kanbanDataDao.update >> arguments : ",arguments);
                  })

              })
              .catch((e)=>{
                console.log("KanbanWebsocketGateway >> kanbanDataDao.findOne >> e : ",e);
              });
          })
          .catch((e)=>{
            console.log("KanbanWebsocketGateway >> anbanItemDao.deleteOne >> e : ",e);
          });
      })
      .catch((e)=>{
        console.log("KanbanWebsocketGateway >> verifyRequest >> catch >> e : ",e);
      })
  }

  @SubscribeMessage(HttpHelper.websocketApi.kanban.read.event)
  onKanbanItemRead(socket: Socket, packetDto:WebsocketPacketDto){
    console.log("KanbanWebsocketGateway >> onKanbanItemRead >> packetDto : ",packetDto);
    this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
      .then((data)=>{
        let userDto = data.userDto;
        let projectDto = data.projectDto;

        packetDto.accessToken = null;
        let ackPacket = WebsocketPacketDto.createAckPacket(packetDto.wsPacketSeq, projectDto._id.toString());

        this.kanbanDataDao.findOne(projectDto.kanbanData)
          .then((kanbanData:KanbanDataDto)=>{
            ackPacket.dataDto = kanbanData;
            socket.emit(HttpHelper.websocketApi.kanban.read.event, ackPacket);
          })
          .catch((e)=>{console.log("KanbanWebsocketGateway >> kanbanDataDao.findOne >> e : ",e);})
      })
      .catch((e)=>{
        console.log("KanbanWebsocketGateway >> verifyRequest >> catch >> e : ",e);
      })

  }

  @SubscribeMessage(HttpHelper.websocketApi.kanban.lock.event)
  onKanbanItemLock(socket: Socket, packetDto:WebsocketPacketDto) {
    let kanbanItemDto:KanbanItemDto = packetDto.dataDto as KanbanItemDto;
    this.kanbanItemDao.lockKanban(packetDto).then((data)=>{
      let userDto = data.userDto;
      let projectDto = data.projectDto;
      let kanbanItemDto = data.kanbanItemDto;

      packetDto.accessToken = null;
      let ackPacket = WebsocketPacketDto.createAckPacket(packetDto.wsPacketSeq, projectDto._id.toString());
      ackPacket.dataDto = packetDto.dataDto;

      socket.emit(HttpHelper.websocketApi.kanban.lock.event, ackPacket);
      socket.broadcast.to(projectDto._id.toString()).emit(HttpHelper.websocketApi.kanban.lock.event, packetDto);
    })
      .catch((e:RejectionEvent)=>{
        this.wsKanbanErrHandler(e, socket, packetDto);
      })
  }

  @SubscribeMessage(HttpHelper.websocketApi.kanban.unlock.event)
  onKanbanItemUnlock(socket: Socket, packetDto:WebsocketPacketDto) {
    let kanbanItemDto:KanbanItemDto = packetDto.dataDto as KanbanItemDto;
    this.kanbanItemDao.unlockKanban(packetDto).then((data)=>{
      let userDto = data.userDto;
      let projectDto = data.projectDto;
      let kanbanItemDto = data.kanbanItemDto;

      packetDto.accessToken = null;
      let ackPacket = WebsocketPacketDto.createAckPacket(packetDto.wsPacketSeq, projectDto._id.toString());
      ackPacket.dataDto = packetDto.dataDto;

      socket.emit(HttpHelper.websocketApi.kanban.unlock.event, ackPacket);
      socket.broadcast.to(projectDto._id.toString()).emit(HttpHelper.websocketApi.kanban.unlock.event, packetDto);
    })
      .catch((e:RejectionEvent)=>{
        this.wsKanbanErrHandler(e, socket, packetDto);
      })
  }

  @SubscribeMessage(HttpHelper.websocketApi.kanban.relocate.event)
  onKanbanItemRelocate(socket: Socket, packetDto:WebsocketPacketDto) {
    let kanbanItemDto:KanbanItemDto = packetDto.dataDto as KanbanItemDto;
    this.kanbanItemDao.relocateKanbanItem(packetDto).then((data)=>{
      let userDto = data.userDto;
      let projectDto = data.projectDto;
      let kanbanItemDto = data.kanbanItemDto;

      packetDto.accessToken = null;
      let ackPacket = WebsocketPacketDto.createAckPacket(packetDto.wsPacketSeq, projectDto._id.toString());
      packetDto.dataDto["lockedBy"] = null;
      ackPacket.dataDto = packetDto.dataDto;
      ackPacket.additionalData = packetDto.additionalData;

      socket.emit(HttpHelper.websocketApi.kanban.relocate.event, ackPacket);
      socket.broadcast.to(projectDto._id.toString()).emit(HttpHelper.websocketApi.kanban.relocate.event, packetDto);
    })
      .catch((e:RejectionEvent)=>{
        this.wsKanbanErrHandler(e, socket, packetDto);
      })
  }

  wsKanbanErrHandler(rejection:RejectionEvent, socket:Socket, packetDto:WebsocketPacketDto){
    console.warn("KanbanWebsocketGateway >> wsKanbanErrHandler >> reason : ",RejectionEventEnum[rejection.action]);
    if(rejection.action !== RejectionEventEnum.DEBUGING){
      let nakPacket = WebsocketPacketDto.createNakPacket(packetDto.wsPacketSeq, packetDto.namespaceValue);
      socket.emit(HttpHelper.websocketApi.kanban.lock.event, nakPacket);
    }
  }
}

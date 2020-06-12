import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { ProjectDto } from '../DTO/ProjectDto/project-dto';
import { WebsocketPacketDto } from '../DTO/WebsocketPacketDto/WebsocketPacketDto';
import { WebsocketPacketActionEnum } from '../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import { HttpHelper, WebSocketRequest } from '../Helper/HttpHelper/HttpHelper';

@Injectable()
export class SocketManagerService {
  public socket:Server = null;
  broadcastMsgToProjectSession(wsReq:WebSocketRequest, projectDto:ProjectDto, data, additionalData?){
    let broadcastPacket:WebsocketPacketDto
      = WebsocketPacketDto.createNormalPacket(
            projectDto._id.toString(),
            WebsocketPacketActionEnum.CLOUD_UPDATED);
    broadcastPacket.dataDto = data;
    broadcastPacket.additionalData = additionalData;

    this.socket.to(projectDto._id.toString()).emit(wsReq.event, broadcastPacket);
  }
}

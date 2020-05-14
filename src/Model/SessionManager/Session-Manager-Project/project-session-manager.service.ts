import { Injectable } from '@nestjs/common';
import { ProjectDaoService } from '../../DAO/project-dao/project-dao.service';
import { ProjectDto } from '../../DTO/ProjectDto/project-dto';
import { ProjectSession } from './project-session/project-session';
import { WebsocketConnection } from '../Websocket-Connection/Websocket-Connection';
import { Server, Socket } from 'socket.io';
import { WebsocketPacketDto } from '../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import { WebsocketPacketActionEnum } from '../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import { HttpHelper, WebSocketRequest } from '../../Helper/HttpHelper/HttpHelper';
import { WhiteboardSessionManagerService } from '../Session-Manager-Whiteboard/whiteboard-session-manager.service';

@Injectable()
export class ProjectSessionManagerService {
  private readonly websocketConnectionPool:Array<WebsocketConnection>;
  private wsServer:Server;
  constructor(
    private projectDaoService:ProjectDaoService,
  ){
    this.websocketConnectionPool = new Array<WebsocketConnection>();
  }

  initService(server:Server){
    //console.log("ProjectSessionManagerService >> initService >> 진입함");
    this.wsServer = server;
  }

  addConnection(socket:Socket, idToken, projectId){
    //console.log("\nProjectSessionManagerService >> addConnection >> 진입함");
    let wbConnection = this.checkConnection(socket.id);
    if(wbConnection){//이미 연결된 경우라면,
      wbConnection.socket = socket;
      return wbConnection;
    }

    wbConnection = new WebsocketConnection(socket, idToken, projectId);
    this.websocketConnectionPool.push(wbConnection);
  }

  removeConnection(socketId){
    //console.log("\nProjectSessionManagerService >> removeConnection >> 진입함");
    let wbConnection = this.checkConnection(socketId);

    if(wbConnection){
      let delIdx = this.websocketConnectionPool.indexOf(wbConnection);
      if(delIdx > -1){
        this.websocketConnectionPool.splice(delIdx, 1);
      }
    }
  }
  checkConnection(socketId) :WebsocketConnection{
    for(let wbConnection of this.websocketConnectionPool){
      if(wbConnection.socket.id === socketId){
        //이미 연결된 경우임
        //console.log("ProjectSessionManagerService >> checkConnection >> Already Connected User");
        return wbConnection;
      }
    }
    return null
  }
  getConnectedUserList(objectId){
    ////console.log("WhiteboardSessionManagerService >> getConnectedUserList >> namespaceString : ",namespaceString);
    this.prettyPrintConnectionPool();
    let namespaceString = objectId.toString();
    let userList = new Array<string>();
    for(let connection of this.websocketConnectionPool){
      if(connection.namespaceString === namespaceString){
        userList.push(connection.participantIdToken);
      }
    }
    return userList;
  }
  getConnectionByIdToken(idToken){
    for(let connection of this.websocketConnectionPool){
      if (connection.participantIdToken === idToken) {
        return connection;
      }
    }
  }

  broadcastToProjectMember(projectId, wsAction:WebsocketPacketActionEnum, wsRequest:WebSocketRequest, data?, additionalData?){
    let normalPacket = WebsocketPacketDto.createNormalPacket(projectId, wsAction);
    normalPacket.dataDto = data;
    normalPacket.additionalData = additionalData;
    if(this.wsServer){
      this.wsServer.to(projectId).emit(
        wsRequest.event, normalPacket
      );
    }else{
      console.warn("ProjectSessionManagerService >> broadcastToProjectMember >> this.wsServer : ",this.wsServer);
    }
  }



  prettyPrintConnectionPool(){
    //console.log("=====================================================");
    for(let connection of this.websocketConnectionPool){
      //console.log("prettyPrintConnectionPool >> connection : ",connection.toString());
    }
    //console.log("=====================================================");
  }
}

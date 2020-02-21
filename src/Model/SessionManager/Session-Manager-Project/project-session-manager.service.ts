import { Injectable } from '@nestjs/common';
import { ProjectDaoService } from '../../DAO/project-dao/project-dao.service';
import { ProjectDto } from '../../DTO/ProjectDto/project-dto';
import { ProjectSession } from './project-session/project-session';
import { WebsocketConnection } from '../Websocket-Connection/Websocket-Connection';
import { Socket } from 'socket.io';

@Injectable()
export class ProjectSessionManagerService {
  private readonly websocketConnectionPool:Array<WebsocketConnection>;
  constructor(
    private projectDaoService:ProjectDaoService
  ){
    this.websocketConnectionPool = new Array<WebsocketConnection>();
  }

  addConnection(socket:Socket, idToken, projectId){
    console.log("\nProjectSessionManagerService >> addConnection >> 진입함");
    let wbConnection = this.checkConnection(socket.id);
    if(wbConnection){//이미 연결된 경우라면,
      wbConnection.socket = socket;
      return wbConnection;
    }

    wbConnection = new WebsocketConnection(socket, idToken, projectId);
    this.websocketConnectionPool.push(wbConnection);
  }

  removeConnection(socketId){
    console.log("\nProjectSessionManagerService >> removeConnection >> 진입함");
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
        console.log("ProjectSessionManagerService >> checkConnection >> Already Connected User");
        return wbConnection;
      }
    }
    return null
  }
}

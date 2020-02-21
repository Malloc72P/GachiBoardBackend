import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { WebsocketConnection } from '../Websocket-Connection/Websocket-Connection';

@Injectable()
export class WhiteboardSessionManagerService {
  private readonly websocketConnectionPool:Array<WebsocketConnection>;
  constructor(){
    this.websocketConnectionPool = new Array<WebsocketConnection>();
  }
  addConnection(socket:Socket, idToken, projectId){
    console.log("\nWhiteboardSessionManagerService >> addConnection >> 진입함");
    let wbConnection = this.checkConnection(socket.id);
    if(wbConnection){//이미 연결된 경우라면,
      wbConnection.socket = socket;
      return wbConnection;
    }

    wbConnection = new WebsocketConnection(socket, idToken, projectId);
    this.websocketConnectionPool.push(wbConnection);
  }

  removeConnection(socketId){
    console.log("\nWhiteboardSessionManagerService >> removeConnection >> 진입함");
    let wbConnection = this.checkConnection(socketId);
    if(wbConnection){
      let delIdx = this.websocketConnectionPool.indexOf(wbConnection);
      if(delIdx > -1){
        this.websocketConnectionPool.splice(delIdx, 1);
      }
      return wbConnection;
    }
  }
  checkConnection(socketId) :WebsocketConnection{
    for(let wbConnection of this.websocketConnectionPool){
      if(wbConnection.socket.id === socketId){
        //이미 연결된 경우임
        console.log("WhiteboardSessionManagerService >> checkConnection >> Already Connected User");
        return wbConnection;
      }
    }
    return null
  }
  getConnectedUserList(objectId){
    //console.log("WhiteboardSessionManagerService >> getConnectedUserList >> namespaceString : ",namespaceString);
    //this.prettyPrintConnectionPool();
    let namespaceString = objectId.toString();
    let userList = new Array<string>();
    for(let connection of this.websocketConnectionPool){
      if(connection.namespaceString === namespaceString){
        userList.push(connection.participantIdToken);
      }
    }
    return userList;
  }

  prettyPrintConnectionPool(){
    console.log("=====================================================");
    for(let connection of this.websocketConnectionPool){
        console.log("prettyPrintConnectionPool >> connection : ",connection.toString());
    }
    console.log("=====================================================");
  }
}

import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebsocketConnection } from '../Websocket-Connection/Websocket-Connection';
import { GachiPointDto } from '../../DTO/GachiPoint/Gachi-Point';
import { WhiteboardSessionInstance } from './Whiteboard-Session-Instance/Whiteboard-Session-Instance';
import { CursorData } from './Whiteboard-Session-Instance/Cursor-Data/Cursor-Data';
import { ProjectDto } from '../../DTO/ProjectDto/project-dto';
import { WhiteboardItemDaoService } from '../../DAO/whiteboard-item-dao/whiteboard-item-dao.service';

@Injectable()
export class WhiteboardSessionManagerService {
  private readonly websocketConnectionPool:Array<WebsocketConnection>;
  public wbSessionMap:Map<string, WhiteboardSessionInstance>;
  constructor(
    private whiteboardItemDaoService:WhiteboardItemDaoService
  ){
    this.websocketConnectionPool = new Array<WebsocketConnection>();
    this.wbSessionMap = new Map<string, WhiteboardSessionInstance>();
  }
  addConnection(socket:Socket, idToken, projectId){
    //console.log("\nWhiteboardSessionManagerService >> addConnection >> 진입함");
    let wbConnection = this.checkConnection(socket.id);
    if(wbConnection){//이미 연결된 경우라면,
      wbConnection.socket = socket;
      return wbConnection;
    }

    wbConnection = new WebsocketConnection(socket, idToken, projectId);
    this.websocketConnectionPool.push(wbConnection);
  }

  removeConnection(socketId){
    //console.log("\nWhiteboardSessionManagerService >> removeConnection >> 진입함");
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
        //console.log("WhiteboardSessionManagerService >> checkConnection >> Already Connected User");
        return wbConnection;
      }
    }
    return null
  }
  getConnectedUserList(objectId){
    ////console.log("WhiteboardSessionManagerService >> getConnectedUserList >> namespaceString : ",namespaceString);
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
  getConnectionByIdToken(idToken){
    for(let connection of this.websocketConnectionPool){
      if(connection.participantIdToken === idToken){
        return connection;
      }
    }

  }

  prettyPrintConnectionPool(){
    //console.log("=====================================================");
    for(let connection of this.websocketConnectionPool){
        //console.log("prettyPrintConnectionPool >> connection : ",connection.toString());
    }
    //console.log("=====================================================");
  }

  /* *************************************************** */
  /* Cursor Data Handler START */
  /* *************************************************** */
  addCursorData(wsServerInstance:Server, wsConnection:WebsocketConnection, newPosition:GachiPointDto, projectDto:ProjectDto){
    if(!this.wbSessionMap.has(wsConnection.namespaceString)){
      this.wbSessionMap.set(wsConnection.namespaceString,
        new WhiteboardSessionInstance(
          wsServerInstance, wsConnection.namespaceString, projectDto._id.toString()
        ));
    }
    let wbSession:WhiteboardSessionInstance = this.wbSessionMap.get(wsConnection.namespaceString);
    let i = wbSession.cursorDataArray.length;
    while (i--) {
      let currCursorData = wbSession.cursorDataArray[i];
      if (currCursorData.idToken === wsConnection.participantIdToken) {
        wbSession.cursorDataArray.splice(i, 1);
      }
    }
    wbSession.cursorDataArray.push( new CursorData(wsConnection.participantIdToken, newPosition) );
    wbSession.cursorDataVersion++;
    ////console.log("WhiteboardSessionManagerService >> addCursorData >> wbSession : ",wbSession.cursorDataArray);
  }

  removeCursorData(wsConnection:WebsocketConnection){
    if(!this.wbSessionMap.has(wsConnection.namespaceString)){
      return;
    }
    let wbSession:WhiteboardSessionInstance = this.wbSessionMap.get(wsConnection.namespaceString);
    let i = wbSession.cursorDataArray.length;
    while (i--) {
      let currCursorData = wbSession.cursorDataArray[i];
      if (currCursorData.idToken === wsConnection.participantIdToken) {
        wbSession.cursorDataArray.splice(i, 1);
        wbSession.cursorDataVersion++;
      }
    }
  }

  updateCursorData(wsConnection:WebsocketConnection, newPosition:GachiPointDto){
    if(!this.wbSessionMap.has(wsConnection.namespaceString)){
      return;
    }
    let wbSession:WhiteboardSessionInstance = this.wbSessionMap.get(wsConnection.namespaceString);

    for(let currCursorData of wbSession.cursorDataArray){
      if(currCursorData.idToken === wsConnection.participantIdToken){
        currCursorData.position = newPosition;
        break;
      }
    }
  }
  /* **************************************************** */
  /* Cursor Data Handler END */
  /* **************************************************** */
}

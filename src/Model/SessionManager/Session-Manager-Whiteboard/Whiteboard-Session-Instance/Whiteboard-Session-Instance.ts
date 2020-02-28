import { CursorData } from './Cursor-Data/Cursor-Data';
import { WebsocketConnection } from '../../Websocket-Connection/Websocket-Connection';
import { GachiPointDto } from '../../../DTO/GachiPoint/Gachi-Point';
import { Namespace, Server, Socket } from 'socket.io';
import { timeInterval } from 'rxjs/operators';
import { WebsocketPacketDto } from '../../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import { WebsocketPacketActionEnum } from '../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum';
import { HttpHelper } from '../../../Helper/HttpHelper/HttpHelper';

export class WhiteboardSessionInstance {
  public cursorDataArray:Array<CursorData>;
  private wbSessionNsp:string;
  private wsServer:Server;
  public cursorDataVersion = 0;
  private prevCursorDataVersion = 0;

  constructor(wsServer:Server, wbSessionNsp) {
    this.cursorDataArray = new Array<CursorData>();
    this.wsServer = wsServer;
    this.wbSessionNsp = wbSessionNsp;
    this.broadCastCursorData();
  }

  broadCastCursorData(){
    setInterval(()=>{
      if(this.prevCursorDataVersion !== this.cursorDataVersion){
        let normalPacket = WebsocketPacketDto.createNormalPacket(this.wbSessionNsp, WebsocketPacketActionEnum.SPECIAL);
        normalPacket.dataDto = this.wbSessionNsp;
        normalPacket.additionalData = this.cursorDataArray;
        this.wsServer.to(this.wbSessionNsp).emit(
          HttpHelper.websocketApi.whiteboardSession.update_cursor.event,
          normalPacket
        );
        this.prevCursorDataVersion = this.cursorDataVersion;
      }

    },30);
  }



}

import { Socket } from 'socket.io';

export class WebsocketConnection {
  public socket:Socket;
  public participantIdToken;
  public projectId;
  public joinedRoom:Array<string>;

  constructor(socket: Socket, participantIdToken, projectId) {
    this.socket = socket;
    this.participantIdToken = participantIdToken;
    this.projectId = projectId;
    this.joinedRoom = new Array<string>();
  }
}

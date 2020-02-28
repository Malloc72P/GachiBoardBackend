import { Socket } from 'socket.io';

export class WebsocketConnection {
  public socket:Socket;
  public participantIdToken;
  public namespaceString;

  constructor(socket: Socket, participantIdToken, namespaceString) {
    this.socket = socket;
    this.participantIdToken = participantIdToken;
    this.namespaceString = namespaceString;
  }
  public toString = () : string => {
    return `\n namespace :  ${this.namespaceString}\n idToken : ${this.participantIdToken}\n`;
  }
}

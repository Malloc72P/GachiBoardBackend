import { WebsocketPacketActionEnum, WebsocketPacketScopeEnum } from './WebsocketPacketActionEnum';

export class WebsocketPacketDto {
  public wsPacketSeq;
  public senderIdToken:string;
  public packetScope:WebsocketPacketScopeEnum;
  public namespaceValue:string;
  public dataDto:Object;
  public action:WebsocketPacketActionEnum;
  public accessToken:string;
  public additionalData;
  public specialAction:string;

  constructor(senderIdToken     : string,
              packetScope       : WebsocketPacketScopeEnum,
              namespaceValue    : string,
              dataDto           : Object,
              action            : WebsocketPacketActionEnum,
              specialAction?    : string) {
    this.senderIdToken = senderIdToken;
    this.packetScope = packetScope;
    this.namespaceValue = namespaceValue;
    this.dataDto = dataDto;
    this.action = action;
    this.specialAction = specialAction;
  }
  public static createAckPacket(seq, projectId){
    let  ackPacket = new WebsocketPacketDto(
      "admin", WebsocketPacketScopeEnum.PROJECT,
      projectId,
      {},
      WebsocketPacketActionEnum.ACK);
    ackPacket.wsPacketSeq = seq;
    return ackPacket;
  }
  public static createNakPacket(seq, projectId){
    let nakPacket = new WebsocketPacketDto(
      "admin", WebsocketPacketScopeEnum.PROJECT,
      projectId,
      {},
      WebsocketPacketActionEnum.NAK);
    nakPacket.wsPacketSeq = seq;
    return nakPacket;
  }
}

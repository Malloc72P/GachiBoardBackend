import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { HttpHelper } from '../../Model/Helper/HttpHelper/HttpHelper';
import { Socket } from 'socket.io';
import { VideoChatManagerService } from '../../Model/VideoChatManager/video-chat-manager/video-chat-manager.service';
import { WebsocketPacketDto } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketDto';
import { MediaKind, RtpCapabilities } from 'mediasoup/lib/RtpParameters';
import { DtlsParameters, WebRtcTransport } from 'mediasoup/lib/WebRtcTransport';
import { Consumer } from 'mediasoup/lib/Consumer';
import { ChatMessageDto } from '../../Model/DTO/ChatMessageDto/chat-message-dto';
import { ChatMessageDaoService } from '../../Model/DAO/chat-message-dao/chat-message-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { ProjectSessionManagerService } from '../../Model/SessionManager/Session-Manager-Project/project-session-manager.service';
import { WebsocketConnection } from '../../Model/SessionManager/Websocket-Connection/Websocket-Connection';

@WebSocketGateway()
export class ChattingWebsocketGateway {
  constructor(
    private videoChatManager: VideoChatManagerService,
    private chatMessageDao: ChatMessageDaoService,
    private projectDao: ProjectDaoService,
    private projectSessionManager: ProjectSessionManagerService,
  ) {
  }

//  ##############################################
//  ############## Video Chat Start ##############
//  ##############################################

  @SubscribeMessage(HttpHelper.websocketApi.videoChat.getRouterRtpCapabilities.event)
  public async getRouterRtpCapabilities(socket: Socket, socketDto: WebsocketPacketDto) {
    try {
      const rtpCapabilities = this.videoChatManager.getRoomById(socketDto.namespaceValue).router.rtpCapabilities;

      const ackPacketDto = WebsocketPacketDto.createAckPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
      ackPacketDto.additionalData = rtpCapabilities;

      socket.emit(HttpHelper.websocketApi.videoChat.getRouterRtpCapabilities.event, ackPacketDto);
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  @SubscribeMessage(HttpHelper.websocketApi.videoChat.join.event)
  public async onJoinVideoChatRoom(socket: Socket, socketDto: WebsocketPacketDto) {
    try {
      // 현재 이미 접속자들을 broadcast 대상에 추가
      let ackPacket = WebsocketPacketDto.createAckPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
      ackPacket.additionalData = await this.videoChatManager.joinRoom(socketDto.namespaceValue, socketDto.senderIdToken);

      socket.emit(HttpHelper.websocketApi.videoChat.join.event, ackPacket);
      socket.broadcast.to(socketDto.namespaceValue).emit(HttpHelper.websocketApi.videoChat.join.event, socketDto);
    } catch (e) {
      console.error('ChattingWebsocketGateway >> onJoinVideoChatRoom >> Room join failed : ', e);
      socket.emit(
        HttpHelper.websocketApi.videoChat.join.event,
        WebsocketPacketDto.createNakPacket(socketDto.wsPacketSeq, socketDto.namespaceValue));
    }
    return;
  }

  @SubscribeMessage(HttpHelper.websocketApi.videoChat.leave.event)
  public onLeaveVideoChatRoom(socket: Socket, socketDto: WebsocketPacketDto) {
    try {
      this.videoChatManager.leaveRoom(socketDto.namespaceValue, socketDto.senderIdToken);
    } catch (e) {
      console.error(e.message, e.stack);
    }
    socket.emit(
      HttpHelper.websocketApi.videoChat.leave.event,
      WebsocketPacketDto.createAckPacket(socketDto.wsPacketSeq, socketDto.namespaceValue));

    socket.broadcast.to(socketDto.namespaceValue).emit(HttpHelper.websocketApi.videoChat.leave.event, socketDto.senderIdToken);
  }

  @SubscribeMessage(HttpHelper.websocketApi.videoChat.createTransport.event)
  public async createTransport(socket: Socket, socketDto: WebsocketPacketDto) {
    let transportParams = await this.videoChatManager.createTransport(socketDto.namespaceValue, socketDto.senderIdToken);
    let ackPacket = WebsocketPacketDto.createAckPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
    ackPacket.additionalData = transportParams;

    socket.emit(HttpHelper.websocketApi.videoChat.createTransport.event, ackPacket);
  }

  @SubscribeMessage(HttpHelper.websocketApi.videoChat.connectTransport.event)
  public async connectTransport(socket: Socket, socketDto: WebsocketPacketDto) {
    let data = socketDto.additionalData as { dtlsParameters: DtlsParameters, type: 'producer' | 'consumer' };

    try {
      let user = this.videoChatManager.getRoomById(socketDto.namespaceValue).getUserById(socketDto.senderIdToken);

      let transport: WebRtcTransport;

      switch (data.type) {
        case 'producer':
          transport = user.producerTransport;
          break;
        case 'consumer':
          transport = user.consumerTransport;
          break;
      }

      if (!transport) {
        console.error(`Couldn't find ${data.type} transport with roomId - ${socketDto.senderIdToken}, userId - ${socketDto.senderIdToken}`);
      }

      await transport.connect({ dtlsParameters: data.dtlsParameters });

      let ackPacket = WebsocketPacketDto.createAckPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
      socket.emit(HttpHelper.websocketApi.videoChat.connectTransport.event, ackPacket);
    } catch (e) {
      console.error(e.message, e.stack);
      let nakPacket = WebsocketPacketDto.createNakPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
      socket.emit(HttpHelper.websocketApi.videoChat.connectTransport.event, nakPacket);
    }
  }

  @SubscribeMessage(HttpHelper.websocketApi.videoChat.getProducerIds.event)
  public async getProducerIds(socket: Socket, socketDto: WebsocketPacketDto) {
    try {
      let kind = socketDto.additionalData as MediaKind;
      let userList = this.videoChatManager.getRoomById(socketDto.namespaceValue).userList;
      let producerIdArray = new Array<string>();

      switch (kind) {
        case 'audio':
          for (let [key, user] of userList) {
            if (key === socketDto.senderIdToken) continue;
            if (!!user.producerAudio && !user.producerAudio.closed) {
              producerIdArray.push(key);
            }
          }
          break;
        case 'video':
          for (let [key, user] of userList) {
            if (key === socketDto.senderIdToken) continue;
            if (!!user.producerVideo && !user.producerVideo.closed) {
              producerIdArray.push(key);
            }
          }
          break;
      }

      let ackPacket = WebsocketPacketDto.createAckPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
      ackPacket.additionalData = producerIdArray;
      socket.emit(HttpHelper.websocketApi.videoChat.getProducerIds.event, ackPacket);
    } catch (e) {
      let NakPacket = WebsocketPacketDto.createNakPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
      socket.emit(HttpHelper.websocketApi.videoChat.getProducerIds.event, NakPacket);
    }
  }

  @SubscribeMessage(HttpHelper.websocketApi.videoChat.produce.event)
  public async produce(socket: Socket, socketDto: WebsocketPacketDto) {
    let param: { rtpParameters: RTCRtpParameters, kind: MediaKind } = socketDto.additionalData;

    try {
      let user = this.videoChatManager.getRoomById(socketDto.namespaceValue).getUserById(socketDto.senderIdToken);
      await user.produce(param.rtpParameters, param.kind);
    } catch (e) {
      console.error(e.message, e.stack);
      let nakPacket = WebsocketPacketDto.createNakPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
      socket.emit(HttpHelper.websocketApi.videoChat.produce.event, nakPacket);
    }

    let ackPacket = WebsocketPacketDto.createAckPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
    socket.emit(HttpHelper.websocketApi.videoChat.produce.event, ackPacket);

    socketDto.additionalData = param.kind;
    socket.broadcast.to(socketDto.namespaceValue).emit(HttpHelper.websocketApi.videoChat.mediaProduce.event, socketDto);
  }

  @SubscribeMessage(HttpHelper.websocketApi.videoChat.consume.event)
  public async consume(socket: Socket, socketDto: WebsocketPacketDto) {
    let param: { rtpCapabilities: RtpCapabilities, userId: string, kind: MediaKind } = socketDto.additionalData;
    let consumer: Consumer;

    try {
      let room = this.videoChatManager.getRoomById(socketDto.namespaceValue);
      consumer = await room.getUserById(socketDto.senderIdToken).consume(param.userId, param.rtpCapabilities, param.kind);
    } catch (e) {
      console.error(e.message, e.stack);
    }

    let ackPacket = WebsocketPacketDto.createAckPacket(socketDto.wsPacketSeq, socketDto.namespaceValue);
    ackPacket.additionalData = {
      producerId: consumer.producerId,
      id: consumer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      type: consumer.type,
      producerPaused: consumer.producerPaused,
    };

    socket.emit(HttpHelper.websocketApi.videoChat.consume.event, ackPacket);
  }

//  ##############################################
//  ############## Text Chat Start ###############
//  ##############################################

  @SubscribeMessage(HttpHelper.websocketApi.textChat.sendMessage.event)
  public async sendMessage(socket: Socket, chatMessageDto: ChatMessageDto) {
    try {
      console.log('ChattingWebsocketGateway >> sendMessage >> chatMessageDto : ', chatMessageDto);

      // DB 전송
      this.chatMessageDao.saveMessage(chatMessageDto).then((dto: ChatMessageDto) => {
        // DB 성공시 확인 메시지 전송 (verify = true)
        dto.verify = true;
        socket.emit(HttpHelper.websocketApi.textChat.sendMessage.event, dto);

        // 다른 유저들에게 전송
        socket.broadcast.to(chatMessageDto.projectId).emit(HttpHelper.websocketApi.textChat.receiveMessage.event, chatMessageDto);
      }).catch((dto: ChatMessageDto) => {
        // DB 실패시 확인 메시지 전송 (verify = false)
        dto.verify = false;
        socket.emit(HttpHelper.websocketApi.textChat.sendMessage.event, dto);
      });
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  @SubscribeMessage(HttpHelper.websocketApi.textChat.loadMessages.event)
  public async loadMessages(socket: Socket, receivedData: { projectId: string, loadAt: string }) {
    try {
      const data = await this.chatMessageDao.loadMessages(receivedData.projectId, receivedData.loadAt);
      const parsedData = ChatMessageDto.parseData(data);
      socket.emit(HttpHelper.websocketApi.textChat.loadMessages.event, parsedData);
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  @SubscribeMessage(HttpHelper.websocketApi.textChat.getUnreadCount.event)
  public async getUnreadCount(socket: Socket, receivedData: { projectId: string, userId: string }) {
    try {
      const dto: { userDto: UserDto, projectDto: ProjectDto } = await this.projectDao.verifyRequest(receivedData.userId, receivedData.projectId);
      const participantDto = this.projectDao.getParticipantByUserDto(dto.projectDto, dto.userDto);
      let date;
      if (!!participantDto) {
        date = participantDto.lastReadDate;
        const unReadCount = await this.chatMessageDao.getUnreadCount(receivedData.projectId, date);
        socket.emit(HttpHelper.websocketApi.textChat.getUnreadCount.event, unReadCount);
      }
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  @SubscribeMessage(HttpHelper.websocketApi.textChat.updateReadDate.event)
  public async updateReadDate(socket: Socket, receivedData: { projectId: string, userId: string, date: string }) {
    try {
      await this.projectDao.updateLastReadDate(receivedData.projectId, receivedData.userId, new Date(receivedData.date));
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }
}

import { Producer } from 'mediasoup/lib/Producer';
import { Consumer } from 'mediasoup/lib/Consumer';
import { VideoChatRoom } from '../video-chat-room/video-chat-room';
import { Options } from '../options';
import {
  DtlsParameters,
  IceCandidate,
  IceParameters,
  WebRtcTransport,
  WebRtcTransportOptions,
} from 'mediasoup/lib/WebRtcTransport';
import { MediaKind, RtpCapabilities } from 'mediasoup/lib/RtpParameters';

export class TransportParams {
  userId: string;
  id: string;
  iceParameters: IceParameters;
  iceCandidate: Array<IceCandidate>;
  dtlsParameters: DtlsParameters;
  type: string;

  constructor(userId: string, id: string, iceParameters: IceParameters, iceCandidate: Array<IceCandidate>, dtlsParameters: DtlsParameters, type: string) {
    this.userId = userId;
    this.id = id;
    this.iceParameters = iceParameters;
    this.iceCandidate = iceCandidate;
    this.dtlsParameters = dtlsParameters;
    this.type = type;
  }
}

export class VideoChatUser {
  private readonly _userId: string;

  private room: VideoChatRoom;

  public producerVideo: Producer;
  public producerAudio: Producer;
  public producerTransport: WebRtcTransport;
  public consumerTransport: WebRtcTransport;
  public consumersVideo: Map<string, Consumer>;
  public consumersAudio: Map<string, Consumer>;

  private readonly _transports: Map<string, WebRtcTransport>;

  constructor(room: VideoChatRoom, userId: string) {
    this._transports = new Map<string, WebRtcTransport>();
    this.room = room;
    this._userId = userId;

    this.consumersVideo = new Map<string, Consumer>();
    this.consumersAudio = new Map<string, Consumer>();
  }

  public async createProduceTransport() {
    let transport: WebRtcTransport;

    try {
      transport = await this.room.router.createWebRtcTransport(Options.transportOptions as WebRtcTransportOptions);
    } catch (e) {
      console.error("VideoChatUser >> getProduceTransport >> createWebRtcError : ", e);
    }

    transport.appData.userId = this.userId;
    this.producerTransport = transport;

    return new TransportParams(
      this.userId,
      transport.id,
      transport.iceParameters,
      transport.iceCandidates,
      transport.dtlsParameters,
      "produce"
    );
  }

  public async createConsumerTransport() {
    let transport: WebRtcTransport;

    try {
      transport = await this.room.router.createWebRtcTransport(Options.transportOptions as WebRtcTransportOptions);
    } catch (e) {
      console.error("VideoChatUser >> getConsumerTransport >> createWebRtcTransport : ", e);
    }

    transport.appData.userId = this.userId;
    this.consumerTransport = transport;

    return new TransportParams(
      this.userId,
      transport.id,
      transport.iceParameters,
      transport.iceCandidates,
      transport.dtlsParameters,
      "consume"
    )
  }

  public async produce(rtpParameters: RTCRtpParameters, kind: MediaKind) {
    try {
      if(!this.producerTransport) {
        console.error(`Couldn't find producer transport with 'room_id'=${this.room.id}, user_id - ${this.userId}`);
        return;
      }

      const producer = await this.producerTransport.produce({ kind: kind, rtpParameters: rtpParameters });

      producer.on('transportclose', () => {
        producer.close();
      });

      switch (kind) {
        case 'video':
          this.producerVideo = producer;
          break;
        case 'audio':
          this.producerAudio = producer;
          break;
      }
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  public async consume(targetId: string, rtpCapabilities: RtpCapabilities, kind: MediaKind): Promise<Consumer> {
    let target: VideoChatUser;

    try {
      target = this.room.getUserById(targetId);
    } catch (e) {
      console.error(e.message, e.stack);
    }

    let targetProducer: Producer;

    switch (kind) {
      case 'video':
        targetProducer = target.producerVideo;
        break;
      case 'audio':
        targetProducer = target.producerAudio;
        break;
    }

    if(!targetProducer || !rtpCapabilities ||
      !this.room.router.canConsume({ producerId: targetProducer.id, rtpCapabilities: rtpCapabilities})) {
      throw new Error(`Couldn't consume ${kind} with user(${targetId}) and room(${this.room.id})`);
    }

    if(!this.consumerTransport) {
      throw new Error(`Couldn't find consumer transport with user(${this.userId}) and room(${this.room.id})`);
    }

    const consumer = await this.consumerTransport.consume({
      producerId: targetProducer.id,
      rtpCapabilities: rtpCapabilities,
      paused: kind === 'video',
    });

    switch (kind) {
      case 'video':
        this.consumersVideo.set(targetId, consumer);

        consumer.on('transportclose', async () => {
          consumer.close();
          this.consumersVideo.delete(targetId);
        });

        consumer.on('producerclose', async () => {
          consumer.close();
          this.consumersVideo.delete(targetId);
        });
        break;
      case 'audio':
        this.consumersAudio.set(targetId, consumer);

        consumer.on('transportclose', async () => {
          consumer.close();
          this.consumersAudio.delete(targetId);
        });
        consumer.on('producerclose', async () => {
          consumer.close();
          this.consumersAudio.delete(targetId);
        });
        break;
    }

    consumer.on('producerpause', async () => {
      await consumer.pause();
    });
    consumer.on('producerresume', async () => {
      await consumer.resume();
    });

    if(consumer.kind === 'video') {
      await consumer.resume();
    }

    return consumer;
  }

  public destroy() {
    if(!!this.producerTransport) {
      this.producerTransport.close();
    }
    if(!!this.consumerTransport) this.consumerTransport.close();

    this.consumersVideo.forEach(value => {
      value.close();
    });
    this.consumersVideo.clear();
    this.consumersAudio.forEach(value => {
      value.close();
    });
    this.consumersAudio.clear();
  }

  get userId(): string {
    return this._userId;
  }
}

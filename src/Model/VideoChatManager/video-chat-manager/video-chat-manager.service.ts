import { Injectable } from '@nestjs/common';
import { VideoChatRoom } from '../video-chat-room/video-chat-room';
import { TransportParams } from '../video-chat-user/video-chat-user';

@Injectable()
export class VideoChatManagerService {
  private readonly rooms: Map<string, VideoChatRoom>;

  constructor() {
    this.rooms = new Map<string, VideoChatRoom>();
  }
  
  public async joinRoom(roomId: string, userId: string): Promise<Array<string>> {
    let room: VideoChatRoom;

    if(!this.rooms.has(roomId)) {
      room = new VideoChatRoom(roomId);
      this.rooms.set(roomId, room);
      await room.load();
    } else {
      room = this.rooms.get(roomId);
    }

    return room.addUser(userId);
  }

  public async createTransport(roomId: string, userId: string): Promise<Array<TransportParams>> {
    try {
      return await this.getRoomById(roomId).createTransportsById(userId);
    } catch (e) {
      console.error(`Couldn't create transport roomId - ${roomId}, userId - ${userId}`);
    }
  }

  public leaveRoom(roomId: string, userId: string) {
    let room: VideoChatRoom;

    if(this.rooms.has(roomId)) {
      room = this.rooms.get(roomId);
      room.removeUser(userId);
    } else {
      return;
    }
    if(room.isEmpty) {
      room.destroy();
      this.rooms.delete(roomId);
    }
  }

  public getRoomById(roomId: string): VideoChatRoom {
    if(this.rooms.has(roomId)) {
      return this.rooms.get(roomId);
    }
    throw new Error(`Couldn't find roomId - ${roomId}`);
  }
}

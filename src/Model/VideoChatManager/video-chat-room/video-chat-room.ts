import * as mediasoup from 'mediasoup';
import { Worker } from 'mediasoup/lib/Worker';
import { Router, RouterOptions } from 'mediasoup/lib/Router';
import { TransportParams, VideoChatUser } from '../video-chat-user/video-chat-user';
import { Options } from '../options';

export class VideoChatRoom {
  // id
  private readonly _id: string;
  private readonly _userList: Map<string, VideoChatUser>;

  // mediasoup room
  private _worker: Worker;
  private _router: Router;

  constructor(id: string) {
    this._userList = new Map<string, VideoChatUser>();
    this._id = id;
  }

  public async load() {
    this._worker = await mediasoup.createWorker({ rtcMinPort: 14000, rtcMaxPort: 14999 });
    let mediaCodecs = Options.mediaCodecs;
    this._router = await this._worker.createRouter({ mediaCodecs } as RouterOptions);

    return;
  }

  public async createTransportsById(userId: string): Promise<Array<TransportParams>> {
    try {
      let user = this.getUserById(userId);

      let transportParams = new Array<TransportParams>();
      transportParams[0] = await user.createProduceTransport();
      transportParams[1] = await user.createConsumerTransport();

      return transportParams;
    } catch (e) {
      console.error(e.message, e.stack);
    }
  }

  public addUser(userId: string): Array<string> {
    let user: VideoChatUser;

    if(!this._userList.has(userId)) {
      user = new VideoChatUser(this, userId);
      this._userList.set(userId, user);
    }

    return this.userIdList;
  }

  public removeUser(userId: string) {
    if(this._userList.has(userId)) {
      this._userList.get(userId).destroy();
      this._userList.delete(userId);
    }
  }

  public destroy() {
    this._router.close();
    this._worker.close();
    this._userList.clear();
  }

  public getUserById(userId: string) {
    if(this._userList.has(userId)) {
      return this._userList.get(userId);
    }
    throw new Error(`Couldn't find userId - ${userId}`);
  }

  get id(): string {
    return this._id;
  }

  get userList(): Map<string, VideoChatUser> {
    return this._userList;
  }

  get userIdList(): Array<string> {
    let userIdList = new Array<string>();
    this._userList.forEach((value, key) => {
      userIdList.push(key);
    });

    return userIdList;
  }

  get worker(): Worker {
    return this._worker;
  }

  get router(): Router {
    return this._router;
  }

  get remainUser(): number {
    return this._userList.size;
  }

  get isEmpty(): boolean {
    return this._userList.size === 0;
  }
}

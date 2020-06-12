import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ChatMessageIntf } from '../../DTO/ChatMessageDto/chat-message-intf.interface';
import { Model } from 'mongoose';
import { ChatMessageDto } from '../../DTO/ChatMessageDto/chat-message-dto';

@Injectable()
export class ChatMessageDaoService {
  private readonly loadAmount = 50;

  constructor(
    @InjectModel('CHAT_MESSAGE_MODEL') private readonly chatMessageModel: Model<ChatMessageIntf>
  ) {}

  public saveMessage(chatMessageDto: ChatMessageDto): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.create(chatMessageDto).then(() => {
        resolve(chatMessageDto);
      }).catch(() => {
        reject(chatMessageDto);
      });
    });
  }

  public loadMessages(projectId: string, findAt?: string): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
      this.findMessages(projectId, this.loadAmount, findAt).then((data) => {
        resolve(data.reverse());
      }).catch((err) => {
        reject(err.toString());
      })
    }));
  }

  public getUnreadCount(projectId: string, fromDate: Date) {
    return new Promise<number>((resolve) => {
      let count = this.chatMessageModel.countDocuments({ projectId: projectId }).gt('sentDate', fromDate).exec();
      resolve(count);
    });
  }

  private async create(createMessageDto: ChatMessageDto): Promise<any> {
    const createdMessage = new this.chatMessageModel(createMessageDto);

    return createdMessage.save();
  }

  private async findMessages(projectId: string, amount: number, objectId?: string): Promise<any> {
    if(!!objectId) {
      return await this.chatMessageModel.find({ projectId: projectId }).sort({_id: -1}).lt('_id', objectId).limit(amount).populate("projectId").exec();
    } else {
      return await this.chatMessageModel.find({ projectId: projectId }).sort({_id: -1}).limit(amount).populate("projectId").exec();
    }
  }
}

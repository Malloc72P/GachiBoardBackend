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

  public loadMessages(projectId: string, start: number): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
      this.findMessages(projectId, start, this.loadAmount).then((data) => {
        console.log("ChatMessageDaoService >>  >> data : ", data);
      }).catch((err) => {
        reject(err.toString());
      })
    }));
  }

  private async create(createMessageDto: ChatMessageDto): Promise<any> {
    const createdMessage = new this.chatMessageModel(createMessageDto);

    return createdMessage.save();
  }

  private async findMessages(projectId: string, start: number, amount: number): Promise<any> {
    return await this.chatMessageModel.find({ projectId: projectId }).exec();
  }
}

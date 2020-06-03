import Model from 'mongoose';

export class ChatMessageDto {
  public _id: string;
  public userId: string;
  public content: string;
  public projectId: string;
  public sentDate: string;
  public verifyId: string;
  public verify: boolean;

  public static parseData(databaseResult: Array<Model>): Array<ChatMessageDto> {
    const messagesDto: Array<ChatMessageDto> = new Array<ChatMessageDto>();
    databaseResult.forEach((value: Model) => {
      const messageDto = new ChatMessageDto();

      messageDto._id = value.id;
      messageDto.sentDate = value.sentDate.toISOString();
      messageDto.projectId = value.projectId.id;
      messageDto.userId = value.userId;
      messageDto.content = value.content;
      messageDto.verify = true;

      messagesDto.push(messageDto);
    });

    return messagesDto;
  }
}

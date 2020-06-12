export interface ChatMessageIntf extends Document{
  _id: string;
  userId: string;
  content: string;
  projectId: string;
  sentDate: Date;
}

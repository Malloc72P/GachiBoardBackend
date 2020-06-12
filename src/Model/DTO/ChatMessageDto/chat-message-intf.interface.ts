import * as mongoose from "mongoose";

export interface ChatMessageIntf extends mongoose.Document {
  _id: string;
  userId: string;
  content: string;
  projectId: string;
  sentDate: Date;
}

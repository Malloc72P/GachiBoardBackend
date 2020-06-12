import * as mongoose from 'mongoose';

export const ChatMessageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  content: String,
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "PROJECT_MODEL"},
  sentDate: Date,
});

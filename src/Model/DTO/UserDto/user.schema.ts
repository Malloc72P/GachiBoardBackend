import * as mongoose from 'mongoose';
import { Schema } from 'inspector';

export const UsersSchema = new mongoose.Schema({
  email     : { type: String, required: true, unique: true},
  regDate   : { type: Date, default: Date.now },
  idToken   : String,
  accessToken : String,
  userName  : String,
});

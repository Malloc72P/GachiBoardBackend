import * as mongoose from 'mongoose';

export const UsersSchema = new mongoose.Schema({
  idToken   : String,
  authToken : String,
  userName  : String,
  email     : String
});

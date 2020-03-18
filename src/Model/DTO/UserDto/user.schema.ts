import * as mongoose from 'mongoose';
import { Schema } from 'inspector';
import { ProjectDto } from '../ProjectDto/project-dto';

export const UsersSchema = new mongoose.Schema({
  email     : { type: String, required: true},
  regDate   : { type: Date, default: Date.now },
  idToken   : String,
  accessToken : String,
  userName  : String,
  profileImg  : String,
  participatingProjects: [ {type: mongoose.Schema.Types.ObjectId, ref: "PROJECT_MODEL"} ]
});

import * as mongoose from 'mongoose';

export const FileMetadataSchema = new mongoose.Schema({
  path           : { type: String},
  projectId      : { type: String,  required: true},
  title          : { type: String,  required: true},
  type           : { type: Number,  required: true},
  size           : { type: String,  required: true},
  uploaderId     : { type: String,  required: true},
  uploaderName   : { type: String,  required: true},
  children       : { type: Array,   required: true},
  uploadDate     : { type: Date,    default: Date.now },
  filePointer    : { type: mongoose.Schema.Types.ObjectId, ref: "CloudStorage" },
});

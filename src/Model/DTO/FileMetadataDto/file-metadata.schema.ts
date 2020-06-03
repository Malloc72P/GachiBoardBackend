import * as mongoose from 'mongoose';

export const FileMetadataSchema = new mongoose.Schema({
  title          : { type: String,  required: true},
  type           : { type: String,  required: true},
  size           : { type: String,  required: true},
  uploaderId     : { type: String,  required: true},
  uploaderName   : { type: String,  required: true},
  children       : { type: Array,   required: true},
  uploadDate     : { type: Date,    default: Date.now },
  filePointer    : { type: mongoose.Schema.Types.ObjectId, ref: "FILE_REAL_DATA_MODEL" },
});

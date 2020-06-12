import * as mongoose from 'mongoose';
import { FileMetadataDto, FileTypeEnum } from './file-metadata-dto';


export interface FileMetadataDtoIntf extends mongoose.Document{
  _id;
  projectId;
  path;
  title;
  type;
  size;
  uploaderId;
  uploaderName;
  uploadDate;
  children;
  filePointer;
}

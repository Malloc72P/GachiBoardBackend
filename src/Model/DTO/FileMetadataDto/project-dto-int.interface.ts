import * as mongoose from 'mongoose';
import { FileMetadataDto, FileTypeEnum } from './file-metadata-dto';


export interface FileMetadataDtoIntf extends Document{
  _id;
  title;
  type;
  size;
  uploaderId;
  uploaderName;
  uploadDate;
  children;
  filePointer;
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileMetadataDto, FileTypeEnum } from '../../DTO/FileMetadataDto/file-metadata-dto';
import { UserDto } from '../../DTO/UserDto/user-dto';
import { ProjectDto } from '../../DTO/ProjectDto/project-dto';
import { FileMetadataDtoIntf } from '../../DTO/FileMetadataDto/file-metadata-dto-int.interface';

@Injectable()
export class FileMetadataDaoService {
  constructor(
    @InjectModel('FILE_METADATA_MODEL') private readonly fileMetadataModel: Model<FileMetadataDtoIntf>
  ){

  }
  async create(fileMetadataDto: FileMetadataDto): Promise<any> {
    // console.log("FileMetadataDaoService >> create >> fileMetadataDto : ",fileMetadataDto);
    const createdMetadata = new this.fileMetadataModel(fileMetadataDto);
    return await createdMetadata.save();
  }

  async findAll(): Promise<any[]> {
    return await this.fileMetadataModel.find().exec();
  }
  async findOne(_id): Promise<any> {
    return await this.fileMetadataModel.findOne({ _id: _id })
      .exec();
  }
  async findOneByFilePointer(filePointer): Promise<any> {
    return await this.fileMetadataModel.findOne({ filePointer: filePointer })
      .exec();
  }
  async findRootByProjectId(projectId): Promise<any> {
    return await this.fileMetadataModel.findOne({ projectId : projectId, path : null })
      .exec();
  }
  async findChildrenByPath(path): Promise<any> {
    // console.log("FileMetadataDaoService >> findChildrenByPath >> path : ",path);
    return await this.fileMetadataModel.find({ path: path })
      .exec();
  }
  async findDescendentByPath(path): Promise<any> {
    return await this.fileMetadataModel.find({ path: new RegExp(path) })
      .exec();
  }
  async findByProjectId(projectId): Promise<any> {
    return await this.fileMetadataModel.findOne({ projectId: projectId })
      .exec();
  }
  async update(_id, fileMetadataDto:FileMetadataDto): Promise<any> {
    return await this.fileMetadataModel.updateOne({_id : _id}, fileMetadataDto)
      .exec();
  }
  async deleteOne(_id): Promise<any>{
    return await this.fileMetadataModel.deleteOne({_id : _id})
      .exec();
  }

  async getParentDirectory(path, projectDto){
    let tokenizedPath = path.split(',');
    let tgtDirectoryId = tokenizedPath[tokenizedPath.length - 2];
    // console.log("CloudStorageController >> getAllMetadata >> tgtDirectory : ",tgtDirectoryId);
    //찾은 폴더의 메타데이터를 가져온다
    let tgtDirectory:FileMetadataDto = null;
    if(tgtDirectoryId){
      tgtDirectory = await this.findOne(tgtDirectoryId);
      tgtDirectory.children = await this.findChildrenByPath(path);
    }else{//root인 경우
      tgtDirectory = await this.findRootByProjectId(projectDto._id.toString());
      tgtDirectory.children = await this.findChildrenByPath(`,${tgtDirectory._id.toString()},`);
    }

    return tgtDirectory;
  }


  async createFolder(projectDto:ProjectDto, userData:UserDto, folderName, parentFolder){
    try {
      // console.log('FileMetadataDaoService >> createFolder >> 진입함');
      /*{projectId:5edcfc9e5530deb8fc418ba4, path:null}*/
      //새폴더 생성
      let newFolder = new FileMetadataDto(
        projectDto._id, parentFolder, folderName, FileTypeEnum.DIRECTORY, 0,
        userData.idToken, userData.userName, new Date());

      return await this.create(newFolder);
      // let createdMetadata:FileMetadataDto = await this.create(newFolder);
      // return createdMetadata;
    } catch (e) {
      console.log("FileMetadataDaoService >> createFolder >> e : ",e);
    }
  }
  async initRootDirectory(projectDto:ProjectDto){//루트 디렉토리 생성메서드
    let newRoot = new FileMetadataDto(
      projectDto._id, null, "root", FileTypeEnum.DIRECTORY,0,
      -1, "System", new Date());
    // console.log("FileMetadataDaoService >> initRootDirectory >> newRoot : ",newRoot);
    return await this.create(newRoot);
  }
  getFileType(filename, contentType){
    let tokenizedContentType = contentType.split('/');
    let tokenizedFileName = filename.split('.');
    let fileExt = tokenizedFileName[tokenizedFileName.length - 1];
    let fileTypeEnum:FileTypeEnum;
    switch (tokenizedContentType[0]) {
      case "application" :
        switch (tokenizedContentType[1]) {
          case "octet-stream" :
            if (fileExt === "7z" || fileExt === "egg") {
              fileTypeEnum = FileTypeEnum.COMPRESSED_FILE;
            } else {
              fileTypeEnum = FileTypeEnum.ETC;
            }
            break;
          case "x-zip-compressed" :
            fileTypeEnum = FileTypeEnum.COMPRESSED_FILE;
            break;
          default :
            fileTypeEnum = FileTypeEnum.DOCUMENT;
            break;
        }
        break;
      case "image" :
        fileTypeEnum = FileTypeEnum.IMAGE;
        break;
      case "video" :
        fileTypeEnum = FileTypeEnum.VIDEO;
        break;
      case "audio" :
        fileTypeEnum = FileTypeEnum.AUDIO;
        break;
      case "text" :
        fileTypeEnum = FileTypeEnum.DOCUMENT;
        break;
    }
    return fileTypeEnum;
  }

}

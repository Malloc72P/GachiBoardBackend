import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { KanbanDataDaoService } from '../../Model/DAO/kanban-data-dao/kanban-data-dao.service';
import { ProjectSessionManagerService } from '../../Model/SessionManager/Session-Manager-Project/project-session-manager.service';
import { AuthGuard } from '@nestjs/passport';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileDaoService } from '../../Model/DAO/file-dao/file-dao.service';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { FileMetadataDaoService } from '../../Model/DAO/file-metadata-dao/file-metadata-dao.service';
import { FileMetadataDto, FileTypeEnum } from '../../Model/DTO/FileMetadataDto/file-metadata-dto';
import { SocketManagerService } from '../../Model/socket-service/socket-manager.service';
import { GridFSBucketReadStream } from 'mongodb';
import { Response } from 'express';
import { HttpHelper } from '../../Model/Helper/HttpHelper/HttpHelper';

@Controller('cloudStorage')
export class CloudStorageController {
  constructor(
    private userDao: UserDaoService,
    private projectDaoService: ProjectDaoService,
    private kanbanDataDao:KanbanDataDaoService,
    private projectSessionManagerService:ProjectSessionManagerService,
    private fileDaoService:FileDaoService,
    private fileMetadataDaoService:FileMetadataDaoService,
    private socketManagerService:SocketManagerService,
  ){

  }

  async checkAuthority(userDto:UserDto, projectDto:ProjectDto, res:Response){
    let isParticipant = false;
    //2. 요청자의 권한을 검사
    for (let currParticipant of projectDto.participantList) {
      if (currParticipant.idToken === userDto.idToken) {
        isParticipant = true;
      }
    }
    //3. 권한없다면 access denied메세지를 전송한다
    return isParticipant;

  }

  @Get("file")
  @UseGuards(AuthGuard('jwt'))
  async downloadFile(@Query() param, @Req() req, @Res() res:Response){
    try {
      //1. 요청자가 해당 파일을 다운로드할 권한이 있는지 검사하기 위한 정보를 불러온다.
      let userDto: UserDto = await this.userDao.findOne(req.user);
      let fileMetadataDto: FileMetadataDto = await this.fileMetadataDaoService.findOneByFilePointer(param.id);
      let projectDto: ProjectDto = await this.projectDaoService.findOne(fileMetadataDto.projectId);

      if(!await this.checkAuthority(userDto, projectDto, res)){
        throw new Error("access denied");
      }

      //4. 권한이 있다면 파일의 읽기스트림을 생성하고, 요청자에게 전송한다.
      let foundFile: GridFSBucketReadStream = await this.fileDaoService.readStream(param.id);
      let fileInfo = await this.fileDaoService.findInfo(param.id);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${encodeURI(fileInfo.filename)}`,
      );
      res.setHeader("contentType", fileInfo.contentType);

      foundFile.pipe(res);
    } catch (e) {
      console.error("CloudStorageController >> downloadFile >> e : ",e);
      res.status(HttpStatus.BAD_REQUEST).send({ msg: e.message });
    }
  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllMetadata(@Req() req, @Res() res,  @Query() param){
    let path = param.path;
    try {
      let userDto: UserDto = await this.userDao.findOne(req.user);
      let projectDto: ProjectDto = await this.projectDaoService.findOne(param.projectId);
      if (!path) {
        throw new Error('failed');
      }
      let rootFolder = await this.fileMetadataDaoService.findRootByProjectId(projectDto._id.toString());
      if(path === "," && !rootFolder){
        await this.fileMetadataDaoService.createFolder(
          projectDto, userDto,"root",null
        )
      }

      //찾은 폴더의 메타데이터를 가져온다
      let tgtDirectory: FileMetadataDto = await this.fileMetadataDaoService.getParentDirectory(path, projectDto);

      res.status(HttpStatus.CREATED).send(tgtDirectory);
    } catch (e) {
      console.error("CloudStorageController >> getAllMetadata >> e : ",e);

      res.status(HttpStatus.BAD_REQUEST).send({ msg: e.message });
    }
  }
  @Post("file")
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFile(@Res() res, @Req() req, @UploadedFiles() files, @Body() param){
    try {
      let userDto: UserDto = await this.userDao.findOne(req.user);
      let projectDto: ProjectDto = await this.projectDaoService.findOne(param.projectId);

      if(!await this.checkAuthority(userDto, projectDto, res)){
        throw new Error("access denied");
      }

      let path = param.path;
      if (!userDto || !projectDto) {
        throw new Error('file upload failed');
      }
      for (let file of files) {
        //GridFS를 써서 파일 저장
        const createdFile = await this.fileDaoService.writeFile(file, file.metadata);

        //파일 메타데이터 저장
        let createdMetadata: FileMetadataDto = await this.fileMetadataDaoService.create(
          new FileMetadataDto(
            projectDto._id,
            path,
            createdFile.filename,
            this.fileMetadataDaoService.getFileType(createdFile.filename, createdFile.contentType),
            createdFile.length,
            userDto.idToken,
            userDto.userName,
            new Date(),
            createdFile._id));
      }

      let tgtDirectory: FileMetadataDto = await this.fileMetadataDaoService.getParentDirectory(path, projectDto);
      res.status(HttpStatus.CREATED).send(tgtDirectory);
      this.socketManagerService.broadcastMsgToProjectSession(HttpHelper.websocketApi.cloudStorage.updated, projectDto, tgtDirectory, userDto.idToken);
    } catch (e) {
      console.error("CloudStorageController >> uploadFile >> e : ",e);
      res.status(HttpStatus.BAD_REQUEST).send({ msg: e.message });
    }
  }
  @Post('folder')
  @UseGuards(AuthGuard('jwt'))
  async createFolder(@Req() req, @Body() param, @Res() res ){
    try {

      let userDto: UserDto = await this.userDao.findOne(req.user);
      let projectDto: ProjectDto = await this.projectDaoService.findOne(param.projectId);
      let folderName = param.folderName;
      let path = param.path;

      if(!await this.checkAuthority(userDto, projectDto, res)){
        throw new Error("access denied");
      }


      if (!userDto || !projectDto || !folderName) {
        throw new Error("bad request");
      }
      let createdFolder = this.fileMetadataDaoService
        .createFolder(projectDto, userDto, folderName, path);

      if (!createdFolder) {
        throw new Error("bad request");
      }

      let refreshedDirectory = await this.fileMetadataDaoService.getParentDirectory(path, projectDto);
      res.status(HttpStatus.CREATED).send(refreshedDirectory);
      this.socketManagerService.broadcastMsgToProjectSession(HttpHelper.websocketApi.cloudStorage.updated, projectDto, refreshedDirectory, userDto.idToken);
    } catch (e) {
      console.error("CloudStorageController >> createFolder >> e : ",e);
      res.status(HttpStatus.BAD_REQUEST).send({ msg: e.message });
    }
  }
  @Patch()
  @UseGuards(AuthGuard('jwt'))
  async renameFile(@Req() req, @Body() param, @Res() res ){
    try {
      let userDto: UserDto = await this.userDao.findOne(req.user);
      let projectDto: ProjectDto = await this.projectDaoService.findOne(param.projectId);
      let newName = param.newName;
      let fileMetadataId = param.fileMetadataId;
      let fileMetadataDto:FileMetadataDto = await this.fileMetadataDaoService.findOne(fileMetadataId);


      if(!await this.checkAuthority(userDto, projectDto, res)){
        throw new Error("access denied");
      }

      if (!userDto || !projectDto || !newName || !fileMetadataDto) {
        throw new Error("bad request");
      }

      fileMetadataDto.title = newName;
      await this.fileMetadataDaoService.update(fileMetadataDto._id, fileMetadataDto);

      let refreshedDirectory = await this.fileMetadataDaoService.getParentDirectory(fileMetadataDto.path, projectDto);
      res.status(HttpStatus.CREATED).send(refreshedDirectory);
      this.socketManagerService.broadcastMsgToProjectSession(HttpHelper.websocketApi.cloudStorage.updated, projectDto, refreshedDirectory, userDto.idToken);
    } catch (e) {
      console.error("CloudStorageController >> renameFile >> e : ",e);
      res.status(HttpStatus.BAD_REQUEST).send({ msg: e.message });
    }
  }
  @Delete()
  @UseGuards(AuthGuard('jwt'))
  async deleteFile(@Req() req, @Body() param, @Res() res ){
    try {
      let userDto: UserDto = await this.userDao.findOne(req.user);
      let projectDto: ProjectDto = await this.projectDaoService.findOne(param.projectId);
      let fileMetadataId = param.fileMetadataId;
      let fileMetadataDto:FileMetadataDto = await this.fileMetadataDaoService.findOne(fileMetadataId);


      if(!await this.checkAuthority(userDto, projectDto, res)){
        throw new Error("access denied");
      }

      if (!userDto || !projectDto || !fileMetadataDto) {
        throw new Error("bad request");
      }

      if(fileMetadataDto.type === FileTypeEnum.DIRECTORY){
        let tgtPath = `${fileMetadataDto.path}${fileMetadataDto._id.toString()},`;
        let fileMetadataDtos:Array<FileMetadataDto>
          = await this.fileMetadataDaoService.findDescendentByPath(tgtPath);
        for (let metadata of fileMetadataDtos){
          if(metadata.type === FileTypeEnum.DIRECTORY){
            await this.fileMetadataDaoService.deleteOne(metadata._id);
          }else{
            await this.fileDaoService.deleteOne(metadata.filePointer);
            await this.fileMetadataDaoService.deleteOne(metadata._id);
          }
        }
        await this.fileMetadataDaoService.deleteOne(fileMetadataDto._id);
      }else{
        await this.fileDaoService.deleteOne(fileMetadataDto.filePointer);
        await this.fileMetadataDaoService.deleteOne(fileMetadataDto._id);
      }

      let refreshedDirectory = await this.fileMetadataDaoService.getParentDirectory(fileMetadataDto.path, projectDto);
      res.status(HttpStatus.CREATED).send(refreshedDirectory);
      this.socketManagerService.broadcastMsgToProjectSession(HttpHelper.websocketApi.cloudStorage.deleted, projectDto, fileMetadataDto, userDto.idToken);
    } catch (e) {
      console.error("CloudStorageController >> renameFile >> e : ",e);
      res.status(HttpStatus.BAD_REQUEST).send({ msg: e.message });
    }
  }
}

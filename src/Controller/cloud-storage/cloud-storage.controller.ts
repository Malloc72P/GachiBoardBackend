import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { KanbanDataDaoService } from '../../Model/DAO/kanban-data-dao/kanban-data-dao.service';
import { ProjectSessionManagerService } from '../../Model/SessionManager/Session-Manager-Project/project-session-manager.service';
import { AuthGuard } from '@nestjs/passport';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDaoService } from '../../Model/DAO/file-dao/file-dao.service';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { FileMetadataDaoService } from '../../Model/DAO/file-metadata-dao/file-metadata-dao.service';
import { FileMetadataDto, FileTypeEnum } from '../../Model/DTO/FileMetadataDto/file-metadata-dto';
import { SocketManagerService } from '../../Model/socket-service/socket-manager.service';

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
  @Get("file")
  @UseGuards(AuthGuard('jwt'))
  async downloadFile(@Body() param, @Res() res){
    console.log("CloudStorageController >> test >> param : ",param);
    let foundFile = await this.fileDaoService.readStream(param.id);
    console.log("CloudStorageController >> test >> foundFile : ",foundFile);
    foundFile.pipe(res);
  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllMetadata(@Res() res, @Query() param){
    let projectDto:ProjectDto = await this.projectDaoService.findOne(param.projectId);
    console.log("CloudStorageController >> getAllMetadata >> 진입함");
    let path = param.path;
    if(!path){
      return "failed";
    }
    //찾은 폴더의 메타데이터를 가져온다
    let tgtDirectory:FileMetadataDto = await this.fileMetadataDaoService.getParentDirectory(path, projectDto);
    // let foundFiles =  await this.fileMetadataDaoService.findDescendentByPath(path);
    console.log("CloudStorageController >> getAllMetadata >> tgtDirectory : ",tgtDirectory);
    res.status(HttpStatus.CREATED).send(tgtDirectory);
  }
  @Post("file")
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Res() res, @Req() req, @UploadedFile() file, @Body() param){
    console.log("CloudStorageController >> uploadFile >> file : ",file);
    let userDto:UserDto = await this.userDao.findOne(req.user);
    let projectDto:ProjectDto = await this.projectDaoService.findOne(param.projectId);
    let path = param.path;
    if(!userDto || !projectDto){
      return "failed";
    }

    //GridFS를 써서 파일 저장
    const createdFile = await this.fileDaoService.writeFile(file, file.metadata);
    console.log("CloudStorageController >> uploadFile >> createdFile : ",createdFile);
    //파일 메타데이터 저장
    let createdMetadata:FileMetadataDto = await this.fileMetadataDaoService.create(
      new FileMetadataDto(projectDto._id,path,createdFile.filename,FileTypeEnum.ETC,
                          createdFile.length,userDto.idToken,userDto.userName,new Date(), createdFile._id));
    console.log("CloudStorageController >> uploadFile >> createdMetadata : ",createdMetadata);

    let tgtDirectory:FileMetadataDto = await this.fileMetadataDaoService.getParentDirectory(path, projectDto);
    res.status(HttpStatus.CREATED).send(tgtDirectory);
  }
  @Post('folder')
  @UseGuards(AuthGuard('jwt'))
  async createFolder(@Req() req, @Body() param ){
    console.log("CloudStorageController >> createFolder >> 진입함");
    
    let userDto:UserDto = await this.userDao.findOne(req.user);
    let projectDto:ProjectDto = await this.projectDaoService.findOne(param.projectId);
    let folderName = param.folderName;
    let path = param.path;

    if(!userDto || !projectDto || !folderName){
      return "failed";
    }
    let createdFolder = this.fileMetadataDaoService
      .createFolder(projectDto, userDto, folderName, path);

    if(!createdFolder){
      return "failed";
    }

    return this.fileMetadataDaoService.getParentDirectory(path, projectDto);
  }
}

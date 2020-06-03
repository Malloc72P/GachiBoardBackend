import { Body, Controller, Get, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { KanbanDataDaoService } from '../../Model/DAO/kanban-data-dao/kanban-data-dao.service';
import { ProjectSessionManagerService } from '../../Model/SessionManager/Session-Manager-Project/project-session-manager.service';
import { AuthGuard } from '@nestjs/passport';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDaoService } from '../../Model/DAO/file-dao/file-dao.service';

@Controller('cloudStorage')
export class CloudStorageController {
  constructor(
    private userDao: UserDaoService,
    private projectDaoService: ProjectDaoService,
    private kanbanDataDao:KanbanDataDaoService,
    private projectSessionManagerService:ProjectSessionManagerService,
    private fileDaoService:FileDaoService
  ){

  }
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async test(@Body() param, @Res() res){
    console.log("CloudStorageController >> test >> param : ",param);
    let foundFile = await this.fileDaoService.readStream(param.id);
    console.log("CloudStorageController >> test >> foundFile : ",foundFile);
    foundFile.pipe(res);
  }
  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file){
    console.log("CloudStorageController >> uploadFile >> file : ",file);
    const createdFile = await this.fileDaoService.writeFile(file, file.metadata);
  }
}

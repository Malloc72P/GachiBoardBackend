import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { ParticipantDto } from '../../Model/DTO/ProjectDto/ParticipantDto/participant-dto';
import { AuthorityLevel } from '../../Model/DTO/ProjectDto/ParticipantDto/authority-level.enum';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { KanbanDataDaoService } from '../../Model/DAO/kanban-data-dao/kanban-data-dao.service';
import { KanbanDataDto } from '../../Model/DTO/KanbanDataDto/kanban-data-dto';

@Controller('project')
export class ProjectController {

  constructor(
    private userDao: UserDaoService,
    private projectDaoService: ProjectDaoService,
    private kanbanDataDao:KanbanDataDaoService
  ){

  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  onCreateProject(@Req() req, @Res() res, @Body() projectDto:ProjectDto)
  {
    console.log("ProjectController >> onCreateProject >> 진입함");
    console.log("ProjectController >> protectedResource >> req : ",req.user);

    this.userDao.findOne(req.user).then((userDto:UserDto)=>{
      console.log("ProjectController >>  >> userDto : ",userDto);
      let newProjectDto = new ProjectDto();
      newProjectDto.projectTitle = projectDto.projectTitle;

      let newParticipant = ParticipantDto.createPriticipantDto(userDto);
      newProjectDto.participantList.push( newParticipant );

      newProjectDto.createdBy = userDto.idToken;
      newProjectDto.startDate = new Date();

      this.projectDaoService.create(newProjectDto).then((createdProject:ProjectDto)=>{
        console.log("ProjectController >>  >> data : ",createdProject);

        userDto.participatingProjects.push(createdProject._id);
        this.userDao.update( userDto._id, userDto ).then(()=>{

          this.kanbanDataDao.create(new KanbanDataDto()).then((createdKanbanData:KanbanDataDto)=>{
            createdProject.kanbanData = createdKanbanData._id;
            this.projectDaoService.update(createdProject._id, createdProject)
              .then((updateResult)=>{
                res.status(HttpStatus.CREATED).send(createdProject);
            }).catch((e)=>{console.log("ProjectController >> projectDaoService.update >> e : ",e);});
          }).catch((e)=>{console.log("ProjectController >> kanbanDataDao.create >> e : ",e);});
        }).catch((e)=>{console.log("ProjectController >> userDao.update >> e : ",e);});
      }).catch((e)=>{console.log("ProjectController >> projectDaoService.create >> e : ",e);});
    }).catch((e)=>{console.log("ProjectController >> userDao.findOne >> e : ",e);});
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  onGetProjects(@Req() req, @Res() res)
  {
    console.log("ProjectController >> onGetProjects >> 진입함");
    console.log("ProjectController >> onGetProjects >> req : ",req.user);

  }


}

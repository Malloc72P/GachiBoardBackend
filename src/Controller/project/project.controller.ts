import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { ParticipantDto } from '../../Model/DTO/ProjectDto/ParticipantDto/participant-dto';
import { AuthorityLevel } from '../../Model/DTO/ProjectDto/ParticipantDto/authority-level.enum';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';

@Controller('project')
export class ProjectController {

  constructor(
    private userDao: UserDaoService,
    private projectDaoService: ProjectDaoService
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

      this.projectDaoService.create(newProjectDto).then((createdProject)=>{
        console.log("ProjectController >>  >> data : ",createdProject);

        userDto.participatingProjects.push(createdProject._id);
        this.userDao.update( userDto._id, userDto ).then(()=>{
          res.status(HttpStatus.CREATED).send(createdProject);
        });
      });
    });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  onGetProjects(@Req() req, @Res() res)
  {
    console.log("ProjectController >> onGetProjects >> 진입함");
    console.log("ProjectController >> onGetProjects >> req : ",req.user);

  }


}

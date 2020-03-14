import { Body, Controller, Delete, Get, HttpStatus, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectDto } from '../../Model/DTO/ProjectDto/project-dto';
import { ParticipantDto, ParticipantState } from '../../Model/DTO/ProjectDto/ParticipantDto/participant-dto';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../Model/DAO/project-dao/project-dao.service';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { KanbanDataDaoService } from '../../Model/DAO/kanban-data-dao/kanban-data-dao.service';
import { KanbanDataDto } from '../../Model/DTO/KanbanDataDto/kanban-data-dto';
import { AuthorityLevel } from '../../Model/DTO/ProjectDto/ParticipantDto/authority-level.enum';
import { HttpHelper, REST_RESPONSE } from '../../Model/Helper/HttpHelper/HttpHelper';
import { RestPacketDto } from '../../Model/DTO/RestPacketDto/RestPacketDto';
import { ProjectSessionManagerService } from '../../Model/SessionManager/Session-Manager-Project/project-session-manager.service';
import { WebsocketPacketActionEnum } from '../../Model/DTO/WebsocketPacketDto/WebsocketPacketActionEnum';

@Controller('project')
export class ProjectController {

  constructor(
    private userDao: UserDaoService,
    private projectDaoService: ProjectDaoService,
    private kanbanDataDao:KanbanDataDaoService,
    private projectSessionManagerService:ProjectSessionManagerService
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

  @Delete()
  @UseGuards(AuthGuard('jwt'))
  onExitProject(@Req() req, @Res() res, @Body() param)
  {
    console.log("ProjectController >> onExitProject >> 진입함");
    console.log("ProjectController >> protectedResource >> req : ",req.user);
    let projectId = param.projectId;

    this.userDao.findOne(req.user).then((userDto:UserDto)=>{
      console.log("ProjectController >> onExitProject >> projectId : ",projectId);
      this.projectDaoService.findOne(projectId).then((foundProjectDto:ProjectDto)=>{
        console.log("ProjectController >>  >> foundProjectDto : ",foundProjectDto);
        for(let participantDto of foundProjectDto.participantList){
          if(participantDto.idToken === userDto.idToken){
            participantDto.state = ParticipantState.NOT_AVAIL;
          }
        }

        let participatingProjects:Array<ProjectDto> = userDto.participatingProjects;
        let delIdx = participatingProjects.length;
        while (delIdx--){
          let currProjectDto = participatingProjects[delIdx];
          if(currProjectDto._id.toString() === projectId){
            participatingProjects.splice( delIdx, 1 );
          }
        }

        let numberOfAvailManager = this.getNumberOfAvailProjectManager(foundProjectDto.participantList);
        if(numberOfAvailManager <= 0){
          for(let participantDto of foundProjectDto.participantList){
            if(participantDto.state === ParticipantState.AVAIL){
              participantDto.authorityLevel = AuthorityLevel.PROJECT_MANAGER;
            }
          }
        }

        this.projectDaoService.update(foundProjectDto._id.toString(), foundProjectDto).then(()=>{
          this.userDao.update(userDto._id, userDto).then(()=>{
            res.status(HttpStatus.CREATED).send(userDto);
          });
        }).catch((e)=>{console.log("ProjectController >> userDao.findOne >> e : ",e);});
      }).catch((e)=>{console.log("ProjectController >> userDao.findOne >> e : ",e);});
    }).catch((e)=>{console.log("ProjectController >> userDao.findOne >> e : ",e);});
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  onEditProject(@Req() req, @Res() res, @Body() updateProjectDto:ProjectDto)
  {
    console.log("ProjectController >> onEditProject >> 진입함");
    let projectId = updateProjectDto._id;

    this.userDao.findOne(req.user).then((userDto:UserDto)=>{
      this.projectDaoService.findOne(projectId).then((foundProjectDto:ProjectDto)=>{

        for(let participantDto of foundProjectDto.participantList){
          if(participantDto.idToken === userDto.idToken && participantDto.authorityLevel !== AuthorityLevel.PROJECT_MANAGER){

            this.onFailed(res, REST_RESPONSE.NOT_AUTHORIZED, userDto);
            return;
          }
        }
        console.log("ProjectController >>  >> 진입함");
        for (let i = 0; i < foundProjectDto.participantList.length; i++) {
          let originDto:ParticipantDto = foundProjectDto.participantList[i];
          for(let j = 0 ; j < updateProjectDto.participantList.length; j++) {
            let updateDto: ParticipantDto = updateProjectDto.participantList[i];
            if(originDto.idToken === updateDto.idToken){
              originDto.authorityLevel = updateDto.authorityLevel;
              originDto.state = updateDto.state;
            }
          }
        }

        foundProjectDto.projectTitle = updateProjectDto.projectTitle;

        this.projectDaoService.update(foundProjectDto._id, foundProjectDto).then(()=>{

          // res.status(HttpStatus.CREATED).send({msg : "testing"});
          this.userDao.findOne(req.user).then((updatedUserDto:UserDto)=>{
            this.onSuccess(res, updatedUserDto);
            this.projectSessionManagerService.broadcastToProjectMember(
              projectId,
              WebsocketPacketActionEnum.UPDATE,
              HttpHelper.websocketApi.project.update,
              foundProjectDto
              )
          });


        }).catch((e)=>{console.warn("ProjectController >> userDao.findOne >> e : ",e);});
      }).catch((e)=>{console.warn("ProjectController >> userDao.findOne >> e : ",e);});
    }).catch((e)=>{console.warn("ProjectController >> userDao.findOne >> e : ",e);});
  }

  @Get("participantList")
  @UseGuards(AuthGuard('jwt'))
  onGetProjects(@Req() req, @Res() res, @Query() param)
  {
    let projectId = param.projectId;

    this.userDao.findOne(req.user).then((userDto:UserDto)=>{
      this.projectDaoService.findOne(projectId).then((foundProjectDto:ProjectDto)=>{

        this.onSuccess(res, foundProjectDto.participantList);

      }).catch((e)=>{console.warn("ProjectController >> userDao.findOne >> e : ",e);});
    })

  }

  onSuccess(res, data, additionalData?){
    let newPacket:RestPacketDto = new RestPacketDto(REST_RESPONSE.ACK, data, additionalData);
    res.status(HttpStatus.CREATED).send(newPacket);
  }
  onFailed(res, errorCode:REST_RESPONSE, msg?, additionalData?){
    let newPacket:RestPacketDto = new RestPacketDto(errorCode, msg, additionalData);
    res.status(HttpStatus.CREATED).send(newPacket);
  }

  getNumberOfAvailProjectManager(participantList:Array<ParticipantDto>){
    let count = 0;
    for(let participantDto of participantList){
      if( (participantDto.authorityLevel === AuthorityLevel.PROJECT_MANAGER) && (participantDto.state === ParticipantState.AVAIL) ){
        count++;
      }
    }
    return count;
  }

}

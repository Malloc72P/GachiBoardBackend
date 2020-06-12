import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectDto } from '../../../Model/DTO/ProjectDto/project-dto';
import { UserDaoService } from '../../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../../Model/DAO/project-dao/project-dao.service';
import { InviteCodeDto } from '../../../Model/DTO/ProjectDto/InviteCodeDto/InviteCodeDto';
import { UserDto } from '../../../Model/DTO/UserDto/user-dto';
import { ParticipantDto, ParticipantState } from '../../../Model/DTO/ProjectDto/ParticipantDto/participant-dto';
import { AuthorityLevel } from '../../../Model/DTO/ProjectDto/ParticipantDto/authority-level.enum';

const UniqueString = require('unique-string');

@Controller('inviteCode')
export class InviteCodeController {

  constructor(
    private userDao: UserDaoService,
    private projectDaoService: ProjectDaoService
  ){

  }

  @Post()//초대코드를 요청하는 경우
  @UseGuards(AuthGuard('jwt'))
  onRequestInviteCode(@Req() req, @Res() res, @Body() param){
    this.projectDaoService.verifyRequest(req.user, param.projectId)
      .then((verifyParam)=>{
        try{
          let userDto = verifyParam.userDto;
          let projectDto = verifyParam.projectDto;
          let uniqueCode = UniqueString();

          let remainCount = param.remainCount;
          if(!remainCount){
            remainCount = 1;
          }
          let inviteCodeString = projectDto._id + "_" + uniqueCode + "_" + userDto.idToken;

          let newInviteCode = new InviteCodeDto(inviteCodeString,remainCount);
          if(!projectDto.inviteCodeList){
            projectDto.inviteCodeList = new Array<InviteCodeDto>();
          }
          projectDto.inviteCodeList.push(newInviteCode);
          this.projectDaoService.update(projectDto._id, projectDto).then((updateRes)=>{
            res.status(HttpStatus.CREATED).send({ inviteCode : inviteCodeString });
          });
        }
        catch (e) {
          console.warn("InviteCodeController >>  >> e : ",e);
        }
      });
  }
  @Get()//초대코드를 가지고 오는 경우
  @UseGuards(AuthGuard('jwt'))
  async onInvitation(@Req() req, @Res() res, @Query() param) {

    try {
      let inviteCode = param.inviteCode;
      //console.log('InviteCodeController >> onInvitation >> inviteCode : ', inviteCode);
      let tokenizedInviteCode = inviteCode.split('_');
      let projectId = tokenizedInviteCode[0];
      let uniqueCode = tokenizedInviteCode[1];
      let inviterIdToken = tokenizedInviteCode[2];

      if (inviterIdToken === req.user) {
        throw "Inviter should  not be same with new one";
      }
      let resolveData = await this.projectDaoService.verifyRequest(req.user, projectId);
      let userDto:UserDto = resolveData.userDto;
      let projectDto:ProjectDto = resolveData.projectDto;
      let realInviteCode:InviteCodeDto = null;

      for (let currProject of userDto.participatingProjects){
        if(currProject._id.toString() === projectDto._id.toString()){
          res.status(HttpStatus.CREATED).send({result : userDto});
          return;
        }
      }

      for(let currCode of projectDto.inviteCodeList){
        if(currCode.inviteCode === inviteCode){
          realInviteCode = currCode;
          break;
        }
      }
      if(!realInviteCode){
        throw "InviteCode is expired";
      }
      if(realInviteCode.remainCount <= 0){
        throw "InviteCode is expired";
      }

      let newParticipant = ParticipantDto.createPriticipantDto(userDto);
      newParticipant.authorityLevel = AuthorityLevel.NORMAL;
      let isExist = false;
      for(let participantDto of projectDto.participantList){
        if(participantDto.idToken === newParticipant.idToken){
          isExist = true;
          participantDto.state = ParticipantState.AVAIL;
          participantDto.authorityLevel = AuthorityLevel.NORMAL;
          break;
        }
      }
      if (!isExist) {
        projectDto.participantList.push(newParticipant);
      }

      realInviteCode.remainCount--;
      if(realInviteCode.remainCount <= 0){
        let delIdx = projectDto.inviteCodeList.indexOf(realInviteCode);
        projectDto.inviteCodeList.splice(delIdx, 1);
      }
      await this.projectDaoService.update(projectDto._id, projectDto);
      userDto.participatingProjects.push(projectDto._id);
      this.userDao.update(userDto._id, userDto).then(()=>{
        this.userDao.findOne(userDto.idToken).then((resultUserDto:UserDto)=>{
          res.status(HttpStatus.CREATED).send({result : resultUserDto});
        });
      });

    } catch (e) {
      //console.log("InviteCodeController >> onInvitation >> e : ",e);
      res.status(HttpStatus.CREATED).send({result : "failed"});
    }



  }
}

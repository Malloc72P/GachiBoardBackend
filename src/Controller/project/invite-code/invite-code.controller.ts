import { Body, Controller, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectDto } from '../../../Model/DTO/ProjectDto/project-dto';
import { UserDaoService } from '../../../Model/DAO/user-dao/user-dao.service';
import { ProjectDaoService } from '../../../Model/DAO/project-dao/project-dao.service';
import { InviteCodeDto } from '../../../Model/DTO/ProjectDto/InviteCodeDto/InviteCodeDto';
const UniqueString = require('unique-string');

@Controller('inviteCode')
export class InviteCodeController {

  constructor(
    private userDao: UserDaoService,
    private projectDaoService: ProjectDaoService
  ){

  }

  @Post()
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

}

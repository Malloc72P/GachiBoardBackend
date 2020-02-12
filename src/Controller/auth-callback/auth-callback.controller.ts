import { Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { UserDto } from '../../Model/DTO/UserDto/user-dto';
import { ServerSetting } from "../../Config/server-setting";

@Controller('auth')
export class AuthCallbackController {

  constructor(
    private userDao: UserDaoService
  ){

  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin()
  {
    // initiates the Google OAuth2 login flow
  }

  //구글 로그인 성공시, 해당 메서드가 수행됨.
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req, @Res() res)
  {
    // handles the Google OAuth2 callback
    console.log("AuthCallbackController > googleLoginCallback > 호출됨");
    let usersDto:UserDto = req.user.usersDto;

    //#######
    //### 3 : 존재하는 유저인지 검색 실시후 계정생성작업 수행실시하거나 그냥 토큰반환함. 혹은 에러처리(ex : create api request failed)
    this.userDao.findOne(usersDto.idToken)
    //(1) api 요청 성공한 경우.
      .then( (data)=>{
        console.log("AuthCallbackController >> findOne >> data : ",data);

        //(1-1) 신규 가입인 경우
        if(data === null){
          this.userDao.create(usersDto)
            .then(()=>{
              //(1-1-1) 신규 유저정보 DB에 저장 성공
              this.redirectWithAccessToken(res, usersDto);
            })
            .catch((err)=>{
              //(1-1-2) 신규 유저정보 DB에 저장 실패! Rollback 및 로그인 실패처리
              console.log("GoogleStrategyService > catch > err : ", err);
              res.redirect(ServerSetting.ngRoutes.loginFailure);
            });
        }
        //(1-2) 가입된 유저인 경우
        else{
          this.userDao.update(data.id, usersDto)
            .then(()=>{
              this.redirectWithAccessToken(res, usersDto);
            })
            .catch((err)=>{
              console.error(err);
              res.redirect(ServerSetting.ngRoutes.loginFailure);
            });
        }
      })
      //(2) api 요청 실패. 네트워크 장애가 원인일 것으로 예상됨
      .catch((err)=>{
        console.log("GoogleStrategyService > catch > err : ", err);
        res.redirect(ServerSetting.ngRoutes.loginFailure);
        throw new Error("request failed");
      });
    //#######
  }


  redirectWithAccessToken(res, usersDto:UserDto){
    res.redirect(
      ServerSetting.ngRoutes.loginSuccess
      + usersDto.accessToken
      + "/" + usersDto.idToken
      + "/" + usersDto.email
      + "/" + usersDto.userName
    );
  }


  @Post('protected')
  @UseGuards(AuthGuard('jwt'))
  protectedResource(@Req() req, @Res() res)
  {
    let thirdPartId = req.user;
    this.userDao.findOne(thirdPartId)
      .then((userDto)=>{
        console.log("AuthCallbackController >>  >> user : ",userDto);
        if(userDto){
          res.status(HttpStatus.CREATED).send({userDto});
        }
        else {
          return "unauthorized";
        }
      });
  }

  @Post('signOut')
  @HttpCode(204)
  @UseGuards(AuthGuard('jwt'))
  signOut(@Req() req)
  {
    let usersDto:UserDto = req.user.usersDto;

    //console.log("AuthCallbackController >> signOut >> usersDto.userName : ",usersDto.userName);
    return "success";
  }


}

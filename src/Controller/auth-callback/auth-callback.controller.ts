import { Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDaoService } from '../../Model/DAO/user-dao/user-dao.service';
import { HttpHelper } from '../../Model/Helper/http-helper'
import { UserDto } from '../../DTO/UserDto/user-dto';

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
      .then( (data: UserDto)=>{
        //console.log("GoogleStrategyService > then > data : ", data);

        //(1-1) 신규 가입인 경우
        if(data === null){
          this.userDao.create(usersDto)
            .then(()=>{
              //(1-1-1) 신규 유저정보 DB에 저장 성공
              this.redirectWithAuthToken(res, usersDto);
            })
            .catch((err)=>{
              //(1-1-2) 신규 유저정보 DB에 저장 실패! Rollback 및 로그인 실패처리
              console.log("GoogleStrategyService > catch > err : ", err);
              res.redirect(HttpHelper.ngRoutes.loginfailure);
            });
        }
        //(1-2) 가입된 유저인 경우
        else{
          //console.log("GoogleStrategyService > validate > signed in user's idToken : ", data.idToken);
          this.userDao.update({_id : data._id}, usersDto)
            .then(()=>{
              this.redirectWithAuthToken(res, usersDto);
            })
            .catch((err)=>{
              console.error(err);
              res.redirect(HttpHelper.ngRoutes.loginfailure);
            });
        }
      })
      //(2) api 요청 실패. 네트워크 장애가 원인일 것으로 예상됨
      .catch((err)=>{
        console.log("GoogleStrategyService > catch > err : ", err);
        res.redirect(HttpHelper.ngRoutes.loginfailure);
        throw new Error("request failed");
      });
    //#######
  }


  redirectWithAuthToken(res, usersDto:UserDto){
    res.redirect(
      HttpHelper.ngRoutes.loginSuccess
      + usersDto.authToken
      + "/" + usersDto.idToken
      + "/" + usersDto.email
      + "/" + usersDto.userName
    );
  }


  @Post('protected')
  @UseGuards(AuthGuard('jwt'))
  protectedResource(@Req() req)
  {
    return req.user.usersDto;
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

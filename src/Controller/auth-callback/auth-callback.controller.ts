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
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  kakaoLogin()
  {
    // initiates the Google OAuth2 login flow
  }
  @Get('naver')
  @UseGuards(AuthGuard('naver'))
  naverLogin()
  {
    // initiates the Google OAuth2 login flow
  }

  //구글 로그인 성공시, 해당 메서드가 수행됨.
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleLoginCallback(@Req() req, @Res() res)
  {
    // handles the Google OAuth2 callback
    //console.log("AuthCallbackController > googleLoginCallback > 호출됨");
    let usersDto:UserDto = req.user.usersDto;
    this.userDao.loginProcess(usersDto).then((resolveParam)=>{
      this.redirectWithAccessToken(res, usersDto);
    }).catch(()=>{
      res.redirect(ServerSetting.ngRoutes.loginFailure);
    });
  }
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  kakaoLoginCallback(@Req() req, @Res() res)
  {
    // handles the Google OAuth2 callback
    //console.log("AuthCallbackController >> kakaoLoginCallback >> 진입함");
    let usersDto:UserDto = req.user.usersDto;

    this.userDao.loginProcess(usersDto).then((resolveParam)=>{
      this.redirectWithAccessToken(res, usersDto);
    }).catch(()=>{
      res.redirect(ServerSetting.ngRoutes.loginFailure);
    });
  }
  @Get('naver/callback')
  @UseGuards(AuthGuard('naver'))
  naverLoginCallback(@Req() req, @Res() res)
  {
    // handles the Google OAuth2 callback
    //console.log("AuthCallbackController >> naverLoginCallback >> 진입함");
    let usersDto:UserDto = req.user.usersDto;

    this.userDao.loginProcess(usersDto).then((resolveParam)=>{
      this.redirectWithAccessToken(res, usersDto);
    }).catch(()=>{
      res.redirect(ServerSetting.ngRoutes.loginFailure);
    });
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
        ////console.log("AuthCallbackController >>  >> user : ",userDto);
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

    ////console.log("AuthCallbackController >> signOut >> usersDto.userName : ",usersDto.userName);
    return "success";
  }


}

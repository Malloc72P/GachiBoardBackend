import { Injectable } from '@nestjs/common';
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import { AuthService, Provider  } from '../auth/auth.service';
import { UserDtoCreate } from '../../../DTO/UserDto/user-dto-create';
import { ServerSetting } from "../../../Config/server-setting";
import { ServerSecret } from "../../../Config/server-secret";

/*
* 구글 소셜 로그인 유효성 검사를 담당하는 개체임.
* 얘를 이용해서 클라이언트한테 로그인페이지도 보내줌.
* 따로 유효성검사를 하고 싶다면 할 수 있는 콜백도 제공해줌
*
*/
@Injectable()
export class GoogleStrategyService extends PassportStrategy(Strategy, 'google')
{

  constructor( private authService: AuthService){
    super({
      clientID          : ServerSecret.clientID,
      clientSecret      : ServerSecret.clientSecret,
      callbackURL       : ServerSetting.callbackURL,
      scope: ['email profile  openid'],
      passReqToCallback: true
    });
  }

  async validate(request: any, accessToken: string, refreshToken: string, profile, done: Function)
  {
    try {
      //TODO 뭔가 따로 구글 로그인에 대해 유효성검사를 해주고 싶다면 여기에서 하면 됨.
      // console.log("GoogleStrategyService >> validate >> profile : ",profile);
      // console.log("GoogleStrategyService > validate > profile.id : ", profile.id);
      // console.log("GoogleStrategyService > validate > profile.displayName : ", profile.displayName);
      // console.log("GoogleStrategyService > validate > profile.email : ", profile.emails[0].value);
      // console.log("GoogleStrategyService > validate > accessToken : ", accessToken);

      //### 1 : 토큰생성요청
      const jwt: string = await this.authService.validateOAuthLogin(profile.id, Provider.GOOGLE);

      //### 2 : UserDto로 생성
      let usersDto:UserDtoCreate = {
        idToken   : profile.id,
        userName  : profile.displayName,
        authToken : jwt,
        email     : profile.emails[0].value,
      };

      const user = { usersDto };
      done(null, user);
    }//가장 밖의 try문
    catch(err){
      // console.log(err)
      done(err, false);
    }//가장 밖의 catch문
  }//validate
}

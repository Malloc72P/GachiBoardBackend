import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService, Provider } from '../auth/auth.service';
import { ServerSecret } from '../../../Config/server-secret';
import { ServerSetting } from '../../../Config/server-setting';
import { UserDto } from '../../DTO/UserDto/user-dto';
import { Strategy } from "passport-naver";


@Injectable()
export class NaverStrategyService extends PassportStrategy(Strategy, 'naver')
{

  constructor( private authService: AuthService){
    super({
      clientID          : ServerSecret.naver_clientID,
      clientSecret      : ServerSecret.naver_clientSecret,
      callbackURL       : ServerSetting.naverCallbackURL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile, done: Function)
  {
    try {
      //console.log("NaverStrategyService >> validate >> 진입함");

      //### 1 : 토큰생성요청
      const jwt: string = await this.authService.validateOAuthLogin(profile.id, Provider.NAVER);

      //### 2 : UserDto로 생성
      // let profileImg = profile.photos[0].value;
      //console.log("NaverStrategyService >> validate >> profile : ",profile);
      let userName = profile.displayName;
      let email = profile._json.email;
      let profileImage = profile._json.profile_image;
      let usersDto:UserDto = new UserDto(email, profile.id, jwt, userName, profileImage);

      const user = { usersDto };

      done(null, user);
    }//가장 밖의 try문
    catch(err){
      // //console.log(err)
      done(err, false);
    }//가장 밖의 catch문
  }//validate
}

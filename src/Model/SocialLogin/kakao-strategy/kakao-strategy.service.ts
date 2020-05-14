import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService, Provider } from '../auth/auth.service';
import { ServerSecret } from '../../../Config/server-secret';
import { ServerSetting } from '../../../Config/server-setting';
import { Strategy } from "passport-kakao";
import { UserDto } from '../../DTO/UserDto/user-dto';

@Injectable()
export class KakaoStrategyService extends PassportStrategy(Strategy, 'kakao')
{

  constructor( private authService: AuthService){
    super({
      clientID          : ServerSecret.kakao_clientID,
      callbackURL       : ServerSetting.kakaoCallbackURL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile, done: Function)
  {
    try {
      //console.log("KakaoStrategyService >> validate >> 진입함");

      //### 1 : 토큰생성요청
      const jwt: string = await this.authService.validateOAuthLogin(profile.id, Provider.KAKAO);

      //### 2 : UserDto로 생성
      /*let usersDto:UserDto = {
        _id       : null,
        idToken   : profile.id,
        userName  : profile.displayName,
        authToken : jwt,
        email     : profile.emails[0].value,
      };*/
      // let profileImg = profile.photos[0].value;
      //console.log("KakaoStrategyService >> validate >> profile : ",profile);
      let userName = profile.displayName;
      let email = profile._json.kakao_account.email;
      let profileImage = profile._json.kakao_account.profile.profile_image_url;
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


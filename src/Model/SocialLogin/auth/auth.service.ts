import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { sign } from 'jsonwebtoken';

import { UserDaoService } from '../../DAO/user-dao/user-dao.service';

import { UserDtoIntf } from '../../DTO/UserDto/user-dto-intf.interface';
import { UserDto } from '../../DTO/UserDto/user-dto';

import { ServerSecret } from "../../../Config/server-secret";

export enum Provider
{
  GOOGLE = 'google'
}
/*
* Social Login Api서버에서 보내준 써드파티 아이디와 프로바이더를 이용해서 JWT토큰을 만들어주는 서비스개체임.
* 이쪽에서 화이트보드 로그인에 쓰이는 AccessToken을 만들어준다.
* */
@Injectable()
export class AuthService {
  private readonly JWT_SECRET_KEY;

  constructor(  private readonly userDao: UserDaoService){
    this.JWT_SECRET_KEY = ServerSecret.secretOrKey;
  };
  //요 메서드로 만들어줌.
  async validateOAuthLogin(thirdPartyId: string, provider: Provider): Promise<string>
  {
    try
    {
      // You can add some registration logic here,
      // to register the user using their thirdPartyId (in this case their googleId)
      // let user: IUser = await this.userDao.findOneByThirdPartyId(thirdPartyId, provider);

      // if (!user)
      // user = await this.userDao.registerOAuthUser(thirdPartyId, provider);

      const payload = {
        thirdPartyId,
        provider
      };

      return sign(payload, this.JWT_SECRET_KEY, { expiresIn: 18000 });
    }
    catch (err)
    {
      throw new InternalServerErrorException('validateOAuthLogin', err.message);
    }
  }
  async verifyTokenClaims(payload){
    let verifyFlag:boolean = false;
    if(!payload){
      return false;
    }
    const encodedPayload: string = await sign(payload, this.JWT_SECRET_KEY);
    await this.userDao.findOne(payload.thirdPartyId)
      .then((data: UserDto)=>{
        verifyFlag = ( data.accessToken === encodedPayload );
      })
      .catch((err)=>{
        console.error(err);
        verifyFlag = false;
      });
    return verifyFlag;
  }

  verifyAccessToken(accessToken, idToken) : Promise<UserDtoIntf>{
    return this.userDao.findOne( idToken );
  }

}

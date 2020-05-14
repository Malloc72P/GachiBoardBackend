import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserDaoService } from '../../DAO/user-dao/user-dao.service';
import { PassportStrategy } from '@nestjs/passport';
import { ServerSecret } from "../../../Config/server-secret";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategyService
    extends PassportStrategy(Strategy, 'jwt'){

  constructor(
    private readonly userDaoService: UserDaoService,
    private readonly authService: AuthService
  )
  {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: ServerSecret.secretOrKey
    });
  }

  async validate(payload, done: Function){
    try {
      //console.log("JwtStrategyService > validate > 호출됨");
      //console.log("JwtStrategyService >> validate >> payload : ",payload);
      /*
      TODO 여기서 토큰 유효성검사를 수행해야함.
        DB에 저장된 토큰값과 비교하는 작업을 여기서 해야할 것으로 보임.
      */
      const validClaims = await this.authService.verifyTokenClaims(payload);
      if (!validClaims){
        //console.log("JwtStrategyService >> validate >> deprecated token");
        return done(new UnauthorizedException('deprecated token'), false);
      }
      ////console.log("JwtStrategyService >> validate >> payload.thirdPartyId : ",payload);
      //console.log("JwtStrategyService >> validate >> token verified");
      return done(null, payload.thirdPartyId);
    }
    catch (err) {
      //console.log("JwtStrategyService >> validate >> err : ",err);
      throw new UnauthorizedException('unauthorized', err.message);
    }
  }

}

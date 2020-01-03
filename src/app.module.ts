import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthCallbackController } from './Controller/auth-callback/auth-callback.controller';
import { GoogleStrategyService } from './Model/SocialLogin/google-strategy/google-strategy.service';
import { UserDaoService } from './Model/DAO/user-dao/user-dao.service';
import { AuthService } from './Model/SocialLogin/auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerSetting } from "./Config/server-setting";
import { UsersSchema } from './DTO/UserDto/user.schema';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forRoot(ServerSetting.dbUrl),
    MongooseModule.forFeature(
        [
            { name: "USERS_MODEL",
              schema: UsersSchema }
        ])
  ],
  controllers:
    [
      AppController,
      AuthCallbackController,
    ],

  providers:
    [
      AppService,

      GoogleStrategyService,
      UserDaoService,
      AuthService,

    ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthCallbackController } from './Controller/auth-callback/auth-callback.controller';
import { GoogleStrategyService } from './Model/SocialLogin/google-strategy/google-strategy.service';
import { UserDaoService } from './Model/DAO/user-dao/user-dao.service';
import { AuthService } from './Model/SocialLogin/auth/auth.service';
import { usersProviders } from './DTO/UserDto/user.provider';
import { PassportModule } from '@nestjs/passport';
import { databaseProviders } from './Model/DatabaseConnector/database.provider';
@Module({
  imports: [
    PassportModule
  ],
  controllers: [
    AppController,
    AuthCallbackController
  ],
  providers:
    [
      AppService,
      GoogleStrategyService,
      UserDaoService,
      AuthService,
      ...usersProviders,
      ...databaseProviders
    ],
})
export class AppModule {}

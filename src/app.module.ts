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
import { UsersSchema } from './Model/DTO/UserDto/user.schema';
import { JwtStrategyService } from './Model/SocialLogin/jwt-strategy/jwt-strategy.service';
import { ProjectController } from './Controller/project/project.controller';
import { ProjectSchema } from './Model/DTO/ProjectDto/project.schema';
import { ProjectDaoService } from './Model/DAO/project-dao/project-dao.service';
import {ProjectWebsocketGateway} from './SocketController/Project-WebSocket-gateway/project-websocket.gateway';
import { ProjectSessionManagerService } from './Model/ProjectSessionManager/project-session-manager.service';
import { InviteCodeController } from './Controller/project/invite-code/invite-code.controller';
import { KanbanWebsocketGateway } from './SocketController/Kanban-WebSocket-gateway/kanban-websocket.gateway';
import { KanbanItemSchema } from './Model/DTO/KanbanItemDto/kanban-item.schema';
import { KanbanItemDaoService } from './Model/DAO/kanban-item-dao/kanban-item-dao.service';
import { KanbanDataSchema } from './Model/DTO/KanbanDataDto/kanban-data.schema';
import { KanbanDataDaoService } from './Model/DAO/kanban-data-dao/kanban-data-dao.service';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forRoot(ServerSetting.dbUrl),
    MongooseModule.forFeature(
        [
          {
            name: "PROJECT_MODEL",
            schema: ProjectSchema
          },
          {
            name: "USERS_MODEL",
            schema: UsersSchema
          },
          {
            name: "KANBAN_ITEM_MODEL",
            schema: KanbanItemSchema
          },
          {
            name: "KANBAN_DATA_MODEL",
            schema: KanbanDataSchema
          },

        ])
  ],
  controllers:
    [
      AppController,
      AuthCallbackController,
      ProjectController,
      InviteCodeController
    ],

  providers:
    [
      AppService,

      /* *************************************************** */
      /* Auth Service START */
      /* *************************************************** */
      GoogleStrategyService,
      JwtStrategyService,
      AuthService,
      /* **************************************************** */
      /* Auth Service END */
      /* **************************************************** */

      /* *************************************************** */
      /* Data Access Object START */
      /* *************************************************** */
      UserDaoService,
      ProjectDaoService,
      KanbanItemDaoService,
      KanbanDataDaoService,
      /* **************************************************** */
      /* Data Access Object END */
      /* **************************************************** */


      /* *************************************************** */
      /* WebSocket START */
      /* *************************************************** */
      ProjectWebsocketGateway,
      KanbanWebsocketGateway,
      /* **************************************************** */
      /* WebSocket END */
      /* **************************************************** */

      /* *************************************************** */
      /* Project Session Manager Family START */
      /* *************************************************** */
      ProjectSessionManagerService
      /* **************************************************** */
      /* Project Session Manager Family END */
      /* **************************************************** */


    ],
})
export class AppModule {}

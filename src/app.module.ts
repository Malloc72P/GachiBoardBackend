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
import {ProjectWebsocketGateway} from './Controller-Socket/Project-WebSocket-gateway/project-websocket.gateway';
import { ProjectSessionManagerService } from './Model/SessionManager/Session-Manager-Project/project-session-manager.service';
import { InviteCodeController } from './Controller/project/invite-code/invite-code.controller';
import { KanbanWebsocketGateway } from './Controller-Socket/Kanban-WebSocket-gateway/kanban-websocket.gateway';
import { KanbanItemSchema } from './Model/DTO/KanbanItemDto/kanban-item.schema';
import { KanbanItemDaoService } from './Model/DAO/kanban-item-dao/kanban-item-dao.service';
import { KanbanDataSchema } from './Model/DTO/KanbanDataDto/kanban-data.schema';
import { KanbanDataDaoService } from './Model/DAO/kanban-data-dao/kanban-data-dao.service';
import { KanbanTagDaoService } from './Model/DAO/kanban-tag-dao/kanban-tag-dao.service';
import { KanbanTagSchema } from './Model/DTO/KanbanTagDto/kanban-tag.schema';
import { WhiteboardSessionSchema } from './Model/DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session.schema';
import { WbSessionWebsocketGateway } from './Controller-Socket/Wb-Session-WebSocket-gateway/wb-Session-websocket.gateway';
import { WhiteboardSessionDaoService } from './Model/DAO/whiteboard-session-dao/whiteboard-session-dao.service';
import { WhiteboardSessionManagerService } from './Model/SessionManager/Session-Manager-Whiteboard/whiteboard-session-manager.service';
import { WbWebsocketGateway } from './Controller-Socket/Wb-WebSocket-gateway/wb-websocket.gateway';
import { WhiteboardItemDaoService } from './Model/DAO/whiteboard-item-dao/whiteboard-item-dao.service';
import { WbItemPacketSchema } from './Model/DTO/WebsocketPacketDto/WbItemPacketDto/WbItemPacket.schema';
import { KakaoStrategyService } from './Model/SocialLogin/kakao-strategy/kakao-strategy.service';
import { NaverStrategyService } from './Model/SocialLogin/naver-strategy/naver-strategy.service';
import { ChattingWebsocketGateway } from './Controller-Socket/Chatting-WebSocket-gateway/chatting-websocket.gateway';
import { VideoChatManagerService } from './Model/VideoChatManager/video-chat-manager/video-chat-manager.service';

import { ChatMessageSchema } from './Model/DTO/ChatMessageDto/chat-message-schema';
import { ChatMessageDaoService } from './Model/DAO/chat-message-dao/chat-message-dao.service';
import { MulterModule } from '@nestjs/platform-express';
import { CloudStorageController } from './Controller/cloud-storage/cloud-storage.controller';
import { FileDaoService } from './Model/DAO/file-dao/file-dao.service';
import { FileMetadataDaoService } from './Model/DAO/file-metadata-dao/file-metadata-dao.service';
import { FileMetadataSchema } from './Model/DTO/FileMetadataDto/file-metadata.schema';
import { SocketManagerService } from './Model/socket-service/socket-manager.service';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forRoot(ServerSetting.dbUrl,
      {
        useNewUrlParser: true,
        useUnifiedTopology : true,
        authSource: 'admin',
      }),
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
            name: "KANBAN_TAG_MODEL",
            schema: KanbanTagSchema
          },
          {
            name: "KANBAN_DATA_MODEL",
            schema: KanbanDataSchema
          },
          {
            name: "WHITEBOARD_SESSION_MODEL",
            schema: WhiteboardSessionSchema
          },
          {
            name: "WHITEBOARD_ITEM_PACKET_MODEL",
            schema: WbItemPacketSchema
          },
          {
            name: "CHAT_MESSAGE_MODEL",
            schema: ChatMessageSchema
          },
          {
            name: "FILE_METADATA_MODEL",
            schema: FileMetadataSchema
          },
        ]),
    MulterModule.registerAsync({
      useFactory: () => ({
        dest: '/upload',
      })
    })
  ],
  controllers:
    [
      AppController,
      AuthCallbackController,
      ProjectController,
      InviteCodeController,
      CloudStorageController,
    ],

  providers:
    [
      AppService,

      /* *************************************************** */
      /* Auth Service START */
      /* *************************************************** */
      GoogleStrategyService,
      KakaoStrategyService,
      NaverStrategyService,
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
      KanbanTagDaoService,
      WhiteboardSessionDaoService,
      WhiteboardItemDaoService,
      ChatMessageDaoService,
      FileDaoService,
      FileMetadataDaoService,
      /* **************************************************** */
      /* Data Access Object END */
      /* **************************************************** */


      /* *************************************************** */
      /* WebSocket START */
      /* *************************************************** */
      ProjectWebsocketGateway,
      KanbanWebsocketGateway,
      WbSessionWebsocketGateway,
      WbWebsocketGateway,
      ChattingWebsocketGateway,
      SocketManagerService,
      /* **************************************************** */
      /* WebSocket END */
      /* **************************************************** */

      /* *************************************************** */
      /* Project Session Manager Family START */
      /* *************************************************** */
      ProjectSessionManagerService,
      WhiteboardSessionManagerService,
      /* **************************************************** */
      /* Project Session Manager Family END */
      /* **************************************************** */

      /* *************************************************** */
      /* Video Chat Manager START */
      /* *************************************************** */
      VideoChatManagerService,
      /* **************************************************** */
      /* Video Chat Manager END */
      /* **************************************************** */
    ],
})
export class AppModule {}

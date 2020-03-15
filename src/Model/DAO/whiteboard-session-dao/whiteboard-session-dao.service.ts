import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WhiteboardSessionDtoIntf } from '../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto-int.interface';
import { WhiteboardSessionDto } from '../../DTO/ProjectDto/WhiteboardSessionDto/whiteboard-session-dto';
import { WebsocketPacketDto } from '../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import { ProjectDaoService } from '../project-dao/project-dao.service';
import { UserDto } from '../../DTO/UserDto/user-dto';
import { ProjectDto } from '../../DTO/ProjectDto/project-dto';
import { UserDaoService } from '../user-dao/user-dao.service';

@Injectable()
export class WhiteboardSessionDaoService {

  constructor(
    @InjectModel('WHITEBOARD_SESSION_MODEL') private readonly wbSessionModel: Model<WhiteboardSessionDtoIntf>,
    private projectDao:ProjectDaoService,
    private userDao:UserDaoService
  ){

  }

  async create(wbSessionDto: WhiteboardSessionDto): Promise<any> {

    const createdWbSession = new this.wbSessionModel(wbSessionDto);
    return createdWbSession.save();
  }

  async findAll(): Promise<WhiteboardSessionDtoIntf[]> {
    return await this.wbSessionModel.find().exec();
  }
  async findOne(_id:string): Promise<any> {
    return await this.wbSessionModel.findOne({ _id: _id })
      .populate("wbItemArray")
      .exec();
  }
  async update(_id, wbSessionDto:WhiteboardSessionDto): Promise<any> {
    return await this.wbSessionModel.updateOne({_id : _id}, wbSessionDto).exec();
  }
  async deleteOne(_id): Promise<any> {
    return await this.wbSessionModel.deleteOne({ _id: _id })
      .exec();
  }


  async createWbSession(packetDto:WebsocketPacketDto): Promise<any>{
    let wbSessionDto:WhiteboardSessionDto = packetDto.dataDto as WhiteboardSessionDto;
    return new Promise<any>((resolve, reject)=>{
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let projectDto = data.projectDto;

          wbSessionDto.createdBy          = userDto.idToken;
          wbSessionDto.recentlyModifiedBy = userDto.idToken;

          this.create(wbSessionDto).then((createdWbSession:WhiteboardSessionDto)=>{
            projectDto.whiteboardSessionList.push(createdWbSession._id);
            this.projectDao.update(projectDto._id, projectDto).then(()=>{
              this.projectDao.findOne(projectDto._id).then((updatedProjectDto:ProjectDto)=>{
                let resolveParam = this.createResolveParameter(userDto, projectDto, {
                  createdWbSession  : createdWbSession,
                  wbSessionList     : updatedProjectDto.whiteboardSessionList,
                });
                resolve(resolveParam);
              });
            })
          });
        });
    });
  }

  async getWbSessionListByProjectId(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let projectDto = data.projectDto;
          let resolveParam = this.createResolveParameter(userDto, projectDto);
          resolve(resolveParam);
        });
    });
  }
  async joinWbSession(packetDto:WebsocketPacketDto): Promise<any>{
    let wbSessionDto:WhiteboardSessionDto = packetDto.dataDto as WhiteboardSessionDto;
    return new Promise<any>((resolve, reject)=>{
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let projectDto = data.projectDto;

          let wbSessionId = wbSessionDto._id;
          console.log("WhiteboardSessionDaoService >> getWbSessionWithProtection >> wbSessionId : ",wbSessionId);

          this.findOne(wbSessionId).then((foundWbSessionDto:WhiteboardSessionDto)=>{
            for(let i = 0 ; i < foundWbSessionDto.connectedUsers.length; i++){
              let participantId = foundWbSessionDto.connectedUsers[i];
              console.log("WhiteboardSessionDaoService >> joinWbSession >> participantId : ",participantId);
              console.log("WhiteboardSessionDaoService >> joinWbSession >> userDto : ",userDto);
              if(participantId === userDto.idToken){
                foundWbSessionDto.connectedUsers.splice(i, 1);
              }
            }
            foundWbSessionDto.connectedUsers.push(userDto.idToken);

            this.update(foundWbSessionDto._id, foundWbSessionDto).then(()=>{
              let resolveParam = this.createResolveParameter(userDto, projectDto, foundWbSessionDto);
              resolve(resolveParam);
            });
          });
        });
    });
  }

  createResolveParameter(userDto:UserDto, projectDto:ProjectDto, additionalData?){
    return {
      userDto: userDto,
      projectDto: projectDto,
      additionalData: additionalData
    };
  }

  async verifyRequest(idToken, wbSessionId, accessToken?:string): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      this.userDao.findOne(idToken).then((userDto:UserDto)=>{
        if(!userDto){
          reject(new Error("INVALID USER ID TOKEN DETECTED"));
        }

        this.findOne(wbSessionId).then((wbSessionDto:WhiteboardSessionDto)=>{
          if(!wbSessionDto){
            reject(new Error("INVALID WB_SESSION OBJECT_ID DETECTED"));
          }
          //여기까지 도달하면 wbSessionDto와 userDto를 획득한 것
          //SocketIO를 위해 AccessToken을 검사하는 코드 추가
          if (accessToken && userDto.accessToken !== accessToken){
            reject(new Error("AccessToken Expired!"));
          }
          let resolveParam = {
            userDto : userDto,
            wbSessionDto : wbSessionDto
          };
          resolve(resolveParam);
        })//then
      })//then
    });
  }

  async updateWbSession(packetDto:WebsocketPacketDto): Promise<any>{
    let wbSessionDto:WhiteboardSessionDto = packetDto.dataDto as WhiteboardSessionDto;
    return new Promise<any>((resolve, reject)=>{
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let projectDto = data.projectDto;

          let wbSessionId = wbSessionDto._id;
          console.log("WhiteboardSessionDaoService >> updateWbSession >> wbSessionId : ",wbSessionId);

          this.findOne(wbSessionId).then((foundWbSessionDto:WhiteboardSessionDto)=>{
            foundWbSessionDto.title = wbSessionDto.title;
            this.update(foundWbSessionDto._id, foundWbSessionDto).then(()=>{
              let resolveParam = this.createResolveParameter(userDto, projectDto, foundWbSessionDto);
              resolve(resolveParam);
            });
          });
        });
    });
  }

  async deleteWbSession(packetDto:WebsocketPacketDto): Promise<any>{
    let wbSessionDto:WhiteboardSessionDto = packetDto.dataDto as WhiteboardSessionDto;
    return new Promise<any>((resolve, reject)=>{
      this.projectDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let projectDto = data.projectDto;

          let wbSessionId = wbSessionDto._id;
          console.log("WhiteboardSessionDaoService >> deleteWbSession >> wbSessionId : ",wbSessionId);

          this.findOne(wbSessionId).then((foundWbSessionDto:WhiteboardSessionDto)=>{
            if(foundWbSessionDto.connectedUsers.length > 0){
              reject(new Error("WB SESSION IS NOT EMPTY"));
              return;
            }
            foundWbSessionDto.title = wbSessionDto.title;
            this.deleteOne(foundWbSessionDto._id).then(()=>{
              let resolveParam = this.createResolveParameter(userDto, projectDto, foundWbSessionDto);
              resolve(resolveParam);
            });
          });
        });
    });
  }


}

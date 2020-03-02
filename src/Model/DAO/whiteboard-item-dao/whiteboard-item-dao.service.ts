import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { KanbanItemDtoIntf } from '../../DTO/KanbanItemDto/kanban-item-intf.interface';
import { ProjectDaoService } from '../project-dao/project-dao.service';
import { KanbanDataDaoService } from '../kanban-data-dao/kanban-data-dao.service';
import { WbItemPacketDtoIntf } from '../../DTO/WebsocketPacketDto/WbItemPacketDto/WbItemPacket-dto-int.interface';
import { KanbanItemDto } from '../../DTO/KanbanItemDto/kanban-item-dto';
import { WbItemPacketDto } from '../../DTO/WebsocketPacketDto/WbItemPacketDto/WbItemPacketDto';
import { WebsocketPacketDto } from '../../DTO/WebsocketPacketDto/WebsocketPacketDto';
import { RejectionEvent, RejectionEventEnum } from '../../Helper/PromiseHelper/RejectionEvent';
import { WhiteboardItemDto } from '../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import { WhiteboardSessionDaoService } from '../whiteboard-session-dao/whiteboard-session-dao.service';
import { TouchHistory } from '../../DTO/WebsocketPacketDto/WbItemPacketDto/TouchHistory/TouchHistory';
import { WhiteboardItemType } from '../../Helper/data-type-enum/data-type.enum';
import { EditableLinkDto } from '../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/editable-link-dto';

@Injectable()
export class WhiteboardItemDaoService {
  constructor(
    @InjectModel('WHITEBOARD_ITEM_PACKET_MODEL')
          private readonly wbItemPacketModel: Model<WbItemPacketDtoIntf>,
    private wbSessionDao:WhiteboardSessionDaoService,
  ){

  }
//WHITEBOARD_ITEM_PACKET_MODEL
  async create(wbItemPacketDto: WbItemPacketDto): Promise<any> {

    const createdWbItemPacket = new this.wbItemPacketModel(wbItemPacketDto);
    return createdWbItemPacket.save();
  }

  async findAll(): Promise<any[]> {
    return await this.wbItemPacketModel.find().exec();
  }
  async findOne(_id): Promise<any> {
    return await this.wbItemPacketModel.findOne({ _id: _id })
      .exec();
  }
  async update(_id, wbItemPacketDto: WbItemPacketDto): Promise<any> {
    return await this.wbItemPacketModel.updateOne({_id : _id}, wbItemPacketDto).exec();
  }

  async deleteOne(_id): Promise<any> {
    return await this.wbItemPacketModel.deleteOne({ _id: _id })
      .exec();
  }

  async saveWbItem(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let wbItemDto:WhiteboardItemDto = packetDto.dataDto as WhiteboardItemDto;
      this.wbSessionDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let wbSessionDto = data.wbSessionDto;

          let wbItemPacket:WbItemPacketDto = new WbItemPacketDto(userDto.idToken, wbItemDto);

          this.create(wbItemPacket)
            .then((createdWbItemPacket:WbItemPacketDto)=>{
              createdWbItemPacket.wbItemDto.id = createdWbItemPacket._id;
              // let newTouchHistory = new TouchHistory(userDto.idToken, createdWbItemPacket.version, createdWbItemPacket.wbItemDto);
              let newTouchHistory = new TouchHistory(userDto.idToken, createdWbItemPacket.version, null);
              createdWbItemPacket.touchHistory.push(newTouchHistory);
              this.update(createdWbItemPacket._id, createdWbItemPacket)
                .then(()=>{
                  wbSessionDto.wbItemArray.push(createdWbItemPacket._id);
                  this.wbSessionDao.update(wbSessionDto._id, wbSessionDto)
                    .then(()=>{
                      let resolveParam = {
                        userDto : userDto,
                        wbSessionDto : wbSessionDto,
                        createdWbItemPacket : createdWbItemPacket
                      };
                      resolve(resolveParam);
                    });
                });
            });

        });
    });
  }
  async saveMultipleWbItem(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let wbItemArray:Array<WhiteboardItemDto> = packetDto.dataDto as Array<WhiteboardItemDto>;
      this.wbSessionDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let wbSessionDto = data.wbSessionDto;

          this.saveMultipleDocument(userDto, wbItemArray).then((createdItemArray:Array<WbItemPacketDto>)=>{
            for(let createdItem of createdItemArray){
              wbSessionDto.wbItemArray.push(createdItem._id);
            }
            this.wbSessionDao.update(wbSessionDto._id, wbSessionDto)
              .then(()=>{
                let resolveParam = {
                  userDto : userDto,
                  wbSessionDto : wbSessionDto,
                  createdWbItemPacket : createdItemArray
                };
                resolve(resolveParam);
              });


          }).catch((e)=>{
            console.log("WhiteboardItemDaoService >> saveMultipleWbItem >> e : ",e);
            reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
          });

        });
    });
  }
  private async saveMultipleDocument(userDto, wbItemArray){
    let idMap:Map<any, any> = new Map<any, any>();
    let createdItemArray:Array<WbItemPacketDto> = new Array<WbItemPacketDto>();

    for(let wbItemDto of wbItemArray){
      //패러미터 파싱
      let wbItemPacket:WbItemPacketDto = new WbItemPacketDto(userDto.idToken, wbItemDto);

      //모델 생성
      const wbItemPacketModel = new this.wbItemPacketModel(wbItemPacket);
      let createdItem:WbItemPacketDto = await wbItemPacketModel.save();

      //아이디 맵에 저장
      idMap.set( wbItemPacket.wbItemDto.id ,createdItem._id );

      //wbItemDto 아이디 수정 및 터치 히스토리 추가
      createdItem.wbItemDto.id = createdItem._id;
      let newTouchHistory = new TouchHistory(userDto.idToken, createdItem.version, createdItem.wbItemDto);
      createdItem.touchHistory.push(newTouchHistory);

      await this.wbItemPacketModel.updateOne({_id : createdItem._id}, createdItem).exec();

      createdItemArray.push( createdItem );
    }
    for(let wbItemPacket of createdItemArray){
      let wbItemDto = wbItemPacket.wbItemDto;
      if(wbItemDto.type === WhiteboardItemType.EDITABLE_LINK){
        let edtLink:EditableLinkDto = wbItemDto as EditableLinkDto;
        if(!edtLink.fromLinkPort || !edtLink.toLinkPort){
          console.log("WhiteboardItemDaoService >> saveMultipleDocument >> trap");
        }
        if(edtLink.fromLinkPort){
          edtLink.fromLinkPort.ownerWbItemId = idMap.get(edtLink.fromLinkPort.ownerWbItemId);
        }
        if (edtLink.toLinkPort) {
          edtLink.toLinkPort.ownerWbItemId = idMap.get(edtLink.toLinkPort.ownerWbItemId);
        }
      }

    }
    return createdItemArray;
  }
  async updateWbItem(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let wbItemDto:WhiteboardItemDto = packetDto.dataDto as WhiteboardItemDto;
      this.wbSessionDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let wbSessionDto = data.wbSessionDto;

          let wbItemPacket:WbItemPacketDto;

          this.findOne(wbItemDto.id)
            .then((foundWbItemPacket:WbItemPacketDto)=>{
              // foundWbItemPacket.wbItemDto.id = foundWbItemPacket._id;
              foundWbItemPacket.version++;
              foundWbItemPacket.lastModifier = userDto.idToken;
              foundWbItemPacket.modifiedDate = new Date();
              foundWbItemPacket.wbItemDto = wbItemDto;

              // let newTouchHistory = new TouchHistory(userDto.idToken, foundWbItemPacket.version, foundWbItemPacket.wbItemDto);
              // let newTouchHistory = new TouchHistory(userDto.idToken, foundWbItemPacket.version, null);
              // foundWbItemPacket.touchHistory.push(newTouchHistory);

              this.update(foundWbItemPacket._id, foundWbItemPacket)
                .then(()=>{
                  let resolveParam = {
                    userDto : userDto,
                    wbSessionDto : wbSessionDto,
                    updatedWbItemPacket : foundWbItemPacket
                  };
                  resolve(resolveParam);
                })
                .catch((e)=>{
                reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
              });
            })
            .catch((e)=>{
              reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
            });

        })
        .catch((e)=>{
          reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
        });
    });
  }
  async occupyItem(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let wbItemDto:WhiteboardItemDto = packetDto.dataDto as WhiteboardItemDto;
      this.wbSessionDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let wbSessionDto = data.wbSessionDto;
          let wbItemPacket:WbItemPacketDto;

          this.findOne(wbItemDto.id)
            .then((foundWbItemPacket:WbItemPacketDto)=>{
              // foundWbItemPacket.wbItemDto.id = foundWbItemPacket._id;
              console.log("WhiteboardItemDaoService >> occupyItem >> foundWbItemPacket : ",foundWbItemPacket);
              if(foundWbItemPacket.occupiedBy && foundWbItemPacket.occupiedBy !== userDto.idToken){
                reject(new RejectionEvent(RejectionEventEnum.OCCUPIED_BY_ANOTHER_USER, foundWbItemPacket));
                return;
              }
              foundWbItemPacket.occupiedBy = userDto.idToken;

              this.update(foundWbItemPacket._id, foundWbItemPacket)
                .then(()=>{
                  let resolveParam = {
                    userDto : userDto,
                    wbSessionDto : wbSessionDto,
                    updatedWbItemPacket : foundWbItemPacket
                  };
                  resolve(resolveParam);
                })
                .catch((e)=>{
                  reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
                });
            })
            .catch((e)=>{
              reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
            });

        })
        .catch((e)=>{
          reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
        });
    });
  }
  async notOccupyItem(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let wbItemDto:WhiteboardItemDto = packetDto.dataDto as WhiteboardItemDto;
      this.wbSessionDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let wbSessionDto = data.wbSessionDto;
          let wbItemPacket:WbItemPacketDto;

          this.findOne(wbItemDto.id)
            .then((foundWbItemPacket:WbItemPacketDto)=>{
              // foundWbItemPacket.wbItemDto.id = foundWbItemPacket._id;
              console.log("WhiteboardItemDaoService >> occupyItem >> foundWbItemPacket : ",foundWbItemPacket);
              if(!foundWbItemPacket.occupiedBy){
                reject(new RejectionEvent(RejectionEventEnum.NOT_OCCUPIED, foundWbItemPacket));
                return;
              }
              if(foundWbItemPacket.occupiedBy && foundWbItemPacket.occupiedBy !== userDto.idToken){
                reject(new RejectionEvent(RejectionEventEnum.OCCUPIED_BY_ANOTHER_USER, foundWbItemPacket));
                return;
              }
              foundWbItemPacket.occupiedBy = null;

              this.update(foundWbItemPacket._id, foundWbItemPacket)
                .then(()=>{
                  let resolveParam = {
                    userDto : userDto,
                    wbSessionDto : wbSessionDto,
                    updatedWbItemPacket : foundWbItemPacket
                  };
                  resolve(resolveParam);
                })
                .catch((e)=>{
                  reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
                });
            })
            .catch((e)=>{
              reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
            });

        })
        .catch((e)=>{
          reject(new RejectionEvent(RejectionEventEnum.UPDATE_FAILED, e))
        });
    });
  }

  async deleteWbItem(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      let wbItemDto:WhiteboardItemDto = packetDto.dataDto as WhiteboardItemDto;
      this.wbSessionDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let wbSessionDto = data.wbSessionDto;

          let wbItemPacket:WbItemPacketDto;

          this.deleteOne(wbItemDto.id)
            .then(()=>{
              // foundWbItemPacket.wbItemDto.id = foundWbItemPacket._id;

              let resolveParam = {
                userDto : userDto,
                wbSessionDto : wbSessionDto
              };
              resolve(resolveParam);

            });

        });
    });
  }
  async getWbItemList(packetDto:WebsocketPacketDto): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      this.wbSessionDao.verifyRequest(packetDto.senderIdToken, packetDto.namespaceValue, packetDto.accessToken)
        .then((data)=>{
          let userDto = data.userDto;
          let wbSessionDto = data.wbSessionDto;

          this.findAll()
            .then((wbItemList:Array<WbItemPacketDto>)=>{
              let resolveParam = {
                userDto : userDto,
                wbSessionDto : wbSessionDto,
                wbItemList : wbItemList
              };
              resolve(resolveParam);

            });


        });
    });
  }




}

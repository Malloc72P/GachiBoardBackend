import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDtoIntf } from '../../DTO/UserDto/user-dto-intf.interface';
import { UserDto } from '../../DTO/UserDto/user-dto';
import { ServerSetting } from '../../../Config/server-setting';

@Injectable()
export class UserDaoService {
  constructor(
    @InjectModel('USERS_MODEL') private readonly usersModel: Model<UserDtoIntf>) {

  }

  async create(createUsersDto: UserDto): Promise<any> {

    const createdUsers = new this.usersModel(createUsersDto);
    //console.log("UserDaoService >> create >> createdUsers : ",createdUsers);
    return createdUsers.save();
  }

  async findAll(): Promise<UserDtoIntf[]> {
    return await this.usersModel.find().exec();
  }
  async findOne(idToken:string): Promise<any> {
    return await this.usersModel.findOne({ idToken: idToken })
      .populate("participatingProjects")
      .exec();
  }
  async update(_id, usersDto:UserDto): Promise<any> {
    return await this.usersModel.updateOne({_id : _id}, usersDto).exec();
  }

  loginProcess(usersDto:UserDto):Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      this.findOne(usersDto.idToken)
      //(1) api 요청 성공한 경우.
        .then( (data)=>{
          ////console.log("AuthCallbackController >> findOne >> data : ",data);

          //(1-1) 신규 가입인 경우
          if(data === null){
            this.create(usersDto)
              .then(()=>{
                //(1-1-1) 신규 유저정보 DB에 저장 성공
                // this.redirectWithAccessToken(res, usersDto);
                resolve(usersDto);
              })
              .catch((err)=>{
                //(1-1-2) 신규 유저정보 DB에 저장 실패! Rollback 및 로그인 실패처리
                //console.log("GoogleStrategyService > catch > err : ", err);
                // res.redirect(ServerSetting.ngRoutes.loginFailure);
                reject();
              });
          }
          //(1-2) 가입된 유저인 경우
          else{
            this.update(data.id, usersDto)
              .then(()=>{
                // this.redirectWithAccessToken(res, usersDto);
                resolve(usersDto);
              })
              .catch((err)=>{
                console.error(err);
                reject();
                // res.redirect(ServerSetting.ngRoutes.loginFailure);
              });
          }
        })

    });
  }

}


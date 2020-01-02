import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { UserDtoIntf } from '../../../DTO/UserDto/user-dto-intf.interface';
import { UserDto } from '../../../DTO/UserDto/user-dto';

@Injectable()
export class UserDaoService {
  constructor(@Inject('USERS_MODEL') private readonly usersModel: Model<UserDtoIntf>) {}

  async create(createUsersDto: UserDto): Promise<UserDtoIntf> {
    const createdUsers = new this.usersModel(createUsersDto);
    console.log("UsersService >> create >> createdUsers : ",createdUsers);
    return createdUsers.save();
  }



  async findAll(): Promise<UserDtoIntf[]> {
    return await this.usersModel.find().exec();
  }
  async findOne(idToken:string): Promise<UserDtoIntf> {
    return await this.usersModel.findOne({ idToken: idToken }).exec();
  }
  async update(_id, usersDto:UserDto): Promise<UserDtoIntf> {
    return await this.usersModel.updateOne(_id, usersDto).exec();
  }
}


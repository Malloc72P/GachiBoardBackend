import * as mongoose from 'mongoose';

export interface UserDtoIntf extends Document{
  _id;
  email      : string  ;
  regDate    : Date    ;
  idToken    : string  ;
  accessToken  : string  ;
  userName   : string  ;
  profileImg   : string  ;
}

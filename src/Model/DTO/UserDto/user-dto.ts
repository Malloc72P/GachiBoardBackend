import * as mongoose from 'mongoose';

export class UserDto {
  public email      : string;
  public regDate    : Date;
  public idToken    : string;
  public accessToken  : string;
  public userName   : string;

  constructor(email: string, idToken: string, accessToken: string, userName: string) {
    this.email = email;
    this.idToken = idToken;
    this.accessToken = accessToken;
    this.userName = userName;
  }
}

import * as mongoose from 'mongoose';

export class UserDto {
  public _id;
  public email      : string;
  public regDate    : Date;
  public idToken    : string;
  public accessToken  : string;
  public userName   : string;
  public profileImg   : string;
  public participatingProjects: Array<any>;

  constructor(email: string, idToken: string, accessToken: string, userName: string, profileImg:string) {
    this.email = email;
    this.idToken = idToken;
    this.accessToken = accessToken;
    this.userName = userName;
    this.profileImg = profileImg;
  }
}

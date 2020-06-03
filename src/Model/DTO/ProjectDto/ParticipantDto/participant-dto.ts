import {AuthorityLevel} from './authority-level.enum';
import { UserDto } from '../../UserDto/user-dto';

export class ParticipantDto {
  public _id;
  public authorityLevel:AuthorityLevel;
  public startDate:Date;
  public idToken    : string;
  public email      : string;
  public userName   : string;
  public profileImg : string;
  public state      : ParticipantState;
  public lastReadDate: Date;


  public static createPriticipantDto(userDto:UserDto){
    let newParticipant = new ParticipantDto();
    newParticipant.idToken = userDto.idToken;
    newParticipant.email = userDto.email;
    newParticipant.userName = userDto.userName;
    newParticipant.authorityLevel = AuthorityLevel.PROJECT_MANAGER;
    newParticipant.profileImg = userDto.profileImg;
    newParticipant.startDate = new Date();
    newParticipant.state = ParticipantState.AVAIL;
    newParticipant.lastReadDate = new Date();
    return newParticipant;
  }
}

export enum ParticipantState {
  AVAIL,
  NOT_AVAIL,
}

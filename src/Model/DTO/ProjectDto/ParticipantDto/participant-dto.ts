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

  public static createPriticipantDto(userDto:UserDto){
    let newParticipant = new ParticipantDto();
    newParticipant.idToken = userDto.idToken;
    newParticipant.email = userDto.email;
    newParticipant.userName = userDto.userName;
    newParticipant.authorityLevel = AuthorityLevel.PROJECT_MANAGER;
    newParticipant.profileImg = userDto.profileImg;
    newParticipant.startDate = new Date();
    return newParticipant;
  }
}

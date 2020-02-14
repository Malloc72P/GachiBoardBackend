import { ProjectDto } from '../../DTO/ProjectDto/project-dto';
import { ParticipantDto } from '../../DTO/ProjectDto/ParticipantDto/participant-dto';

export class ProjectSession {
  public projectId;
  public idToken;

  constructor(projectId, idToken) {
    this.projectId = projectId;
    this.idToken = idToken;
  }
}

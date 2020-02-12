import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDtoIntf } from '../../DTO/UserDto/user-dto-intf.interface';
import { ProjectDtoIntf } from '../../DTO/ProjectDto/project-dto-int.interface';
import { UserDto } from '../../DTO/UserDto/user-dto';
import { ProjectDto } from '../../DTO/ProjectDto/project-dto';

@Injectable()
export class ProjectDaoService {

  constructor(
    @InjectModel('PROJECT_MODEL') private readonly projectModel: Model<ProjectDtoIntf>
  ){

  }

  async create(createProjectDto: ProjectDto): Promise<any> {

    const createdProject = new this.projectModel(createProjectDto);
    console.log("ProjectDaoService >> create >> createdProject : ",createdProject);
    return createdProject.save();
  }

  async getList(): Promise<any>{
    return this.projectModel.find({});
  }


}

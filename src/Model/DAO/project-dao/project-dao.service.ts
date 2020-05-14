import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ProjectDtoIntf } from '../../DTO/ProjectDto/project-dto-int.interface';
import { UserDto } from '../../DTO/UserDto/user-dto';
import { ProjectDto } from '../../DTO/ProjectDto/project-dto';
import { UserDaoService } from '../user-dao/user-dao.service';
import { KanbanDataDaoService } from '../kanban-data-dao/kanban-data-dao.service';
import { KanbanDataDto } from '../../DTO/KanbanDataDto/kanban-data-dto';

@Injectable()
export class ProjectDaoService {

  constructor(
    @InjectModel('PROJECT_MODEL') private readonly projectModel: Model<ProjectDtoIntf>,
    private userDao:UserDaoService,
  ){

  }

  async create(createProjectDto: ProjectDto): Promise<any> {

    const createdProject = new this.projectModel(createProjectDto);
    return createdProject.save();
  }

  async getList(): Promise<any>{
    return this.projectModel.find({});
  }

  async findOne(_id:string): Promise<any> {
    return await this.projectModel.findOne({ _id: _id })
      .populate([
        {
          path  : "kanbanData",
          model :  "KANBAN_DATA_MODEL",
          populate  : [
            { path : "todoGroup", model : "KANBAN_ITEM_MODEL",
              populate  : [{path  : "tagIdList", model :  "KANBAN_TAG_MODEL",}]},
            { path : "inProgressGroup", model : "KANBAN_ITEM_MODEL",
            populate  : [{path  : "tagIdList", model :  "KANBAN_TAG_MODEL",}]},
            { path : "doneGroup", model : "KANBAN_ITEM_MODEL",
            populate  : [{path  : "tagIdList", model :  "KANBAN_TAG_MODEL",}]},
            { path : "kanbanTagListDto", model : "KANBAN_TAG_MODEL" }
          ]
        },
        { path : "whiteboardSessionList", model : "WHITEBOARD_SESSION_MODEL"}
      ])
      .exec();
  }

  public getParticipantByUserDto(projectDto:ProjectDto, userDto:UserDto){
    for (let i = 0; i < projectDto.participantList.length; i++) {
      let value = projectDto.participantList[i];
      if(value.idToken === userDto.idToken){
        return value;
      }
    }
    return false;
  }

  async update(_id, projectDto:ProjectDto): Promise<any> {
    return await this.projectModel.updateOne({_id : _id}, projectDto).exec();
  }
  async testUpdate(_id, projectDto:ProjectDto): Promise<any> {

  }

  async verifyRequest(idToken, projectId, accessToken?:string): Promise<any>{
    return new Promise<any>((resolve, reject)=>{
      this.userDao.findOne(idToken).then((userDto:UserDto)=>{
        if(!userDto){
          reject(new Error("INVALID USER ID TOKEN DETECTED"));
        }

        this.findOne(projectId).then((projectDto:ProjectDto)=>{
          if(!projectDto){
            reject(new Error("INVALID PROJECT OBJECT_ID DETECTED"));
          }
          //여기까지 도달하면 projectDto와 userDto를 획득한 것
          //SocketIO를 위해 AccessToken을 검사하는 코드 추가
          if (accessToken && userDto.accessToken !== accessToken){
            reject(new Error("AccessToken Expired!"));
          }
          let resolveParam = {
            userDto : userDto,
            projectDto : projectDto
          };
          resolve(resolveParam);
        })//then
      })//then
    });
  }
}

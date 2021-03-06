import {GachiPointDto} from './PointDto/gachi-point-dto';

export class WhiteboardItemDto {
  public id;
  public zIndex;
  public type;
  public center:GachiPointDto;
  public isLocked;

  public isGrouped;
  public parentEdtGroupId;

  public groupedIdList:Array<any> = new Array<any>();

  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, isLocked) {
    this.id = id;
    this.type = type;
    this.center = center;
    this.isGrouped = isGrouped;
    this.parentEdtGroupId = parentEdtGroupId;
    this.isLocked = isLocked
  }
}

import {EditableShapeDto} from '../editable-shape-dto';
import {LinkPortDto} from '../../LinkPortDto/link-port-dto';
import {GachiPointDto} from '../../../PointDto/gachi-point-dto';

export class EditableCardDto extends EditableShapeDto{
  public borderRadius: number;
  public tagList: Array<any>;


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>, textContent, rawTextContent, textStyle, borderRadius: number, tagList: Array<any>, isLocked) {
    super(id, type, center, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto, textContent, rawTextContent, textStyle, isLocked);
    this.borderRadius = borderRadius;
    this.tagList = tagList;
  }
}

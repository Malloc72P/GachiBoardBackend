import {EditableShapeDto} from '../editable-shape-dto';
import {LinkPortDto} from '../../LinkPortDto/link-port-dto';
import {GachiPointDto} from '../../../PointDto/gachi-point-dto';

export class EditableTriangleDto extends EditableShapeDto{


  constructor(id, type, center: GachiPointDto, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto: Array<LinkPortDto>, textContent, rawTextContent, textStyle, isLocked) {
    super(id, type, center, isGrouped, parentEdtGroupId, width, height, borderColor, borderWidth, fillColor, opacity, linkPortsDto, textContent, rawTextContent, textStyle, isLocked);
  }
}

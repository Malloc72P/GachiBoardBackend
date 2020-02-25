import {WhiteboardItemDto} from "../../../whiteboard-item-dto";
import {LinkPortDto} from "../link-port-dto";
import {GachiPointDto} from "../../../PointDto/gachi-point-dto";
import {GachiColorDto} from "../../../ColorDto/gachi-color-dto";
import { EditableLinkCapTypes } from './editable-link-types.enum';


export class EditableLinkDto extends WhiteboardItemDto {
  public toLinkPort: LinkPortDto;
  public toPoint: GachiPointDto;
  public fromLinkPort: LinkPortDto;
  public fromPoint: GachiPointDto;
  public linkHeadType: EditableLinkCapTypes;
  public linkTailType: EditableLinkCapTypes;
  public capSize: number;
  public linkColor: GachiColorDto;
  public linkWidth: number;
  public isDashed: boolean;
}

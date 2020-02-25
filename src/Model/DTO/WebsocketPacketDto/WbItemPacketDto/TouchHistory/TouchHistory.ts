import { WhiteboardItemDto } from '../../../WhiteboardItemDto/whiteboard-item-dto';

export class TouchHistory {
  timestamp:Date;
  touchedBy:string;
  version:number;
  wbItemDto:WhiteboardItemDto;

  constructor(touchedBy?: string, version?: number, wbItemDto?: WhiteboardItemDto) {
    this.timestamp = new Date();
    this.touchedBy = touchedBy;
    this.version = version;
    this.wbItemDto = wbItemDto;
  }
}

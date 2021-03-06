export class WhiteboardSessionDto {
  public _id;
  public title;
  public createdBy;
  public recentlyModifiedBy;
  public startDate:Date;
  public wbItemArray:Array<any>;
  public connectedUsers:Array<string>;

  public zIndexMinimum;
  public zIndexMaximum;

  constructor(id?, wbTitle?, createdBy?, recentlyModifiedBy?, startDate?: Date) {
    this._id = id;
    this.title = wbTitle;
    this.createdBy = createdBy;
    this.recentlyModifiedBy = recentlyModifiedBy;
    this.startDate = startDate;
    this.wbItemArray = new Array<any>();
    this.connectedUsers = new Array<any>();
    this.zIndexMinimum = 0;
    this.zIndexMaximum = 0;

  }
}

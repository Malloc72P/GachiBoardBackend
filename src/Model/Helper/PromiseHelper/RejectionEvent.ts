export class RejectionEvent {
  action:RejectionEventEnum;
  data;
  additionalData;

  constructor(action, data?, additionalData?) {
    this.action = action;
    this.data = data;
    this.additionalData = additionalData;
  }
}
export enum RejectionEventEnum {
  ALREADY_LOCKED,
  LOCKED_BY_ANOTHER_USER,
  OCCUPIED_BY_ANOTHER_USER,
  NOT_OCCUPIED,
  DEBUGING,
  RELOCATE_FAILED,
  JOINED_FAILED,
  UPDATE_FAILED,
  WB_SESSION_DELETE_FAILED
}

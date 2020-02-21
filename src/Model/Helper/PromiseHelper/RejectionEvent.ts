export class RejectionEvent {
  action:RejectionEventEnum;
  data;

  constructor(action, data?) {
    this.action = action;
    this.data = data;
  }
}
export enum RejectionEventEnum {
  ALREADY_LOCKED,
  LOCKED_BY_ANOTHER_USER,
  DEBUGING,
  RELOCATE_FAILED,
  JOINED_FAILED
}

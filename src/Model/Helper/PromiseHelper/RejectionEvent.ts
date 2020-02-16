export class RejectionEvent {
  action;
  data;

  constructor(action, data?) {
    this.action = action;
    this.data = data;
  }
}
export enum RejectionEventEnum {
  ALREADY_LOCKED
}

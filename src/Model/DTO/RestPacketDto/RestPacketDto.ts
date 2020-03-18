import { REST_RESPONSE } from '../../Helper/HttpHelper/HttpHelper';

export class RestPacketDto {
  public action:REST_RESPONSE;
  public data;
  public additionalData;

  constructor(action: REST_RESPONSE, data, additionalData?) {
    this.action = action;
    this.data = data;
    this.additionalData = additionalData;
  }
}

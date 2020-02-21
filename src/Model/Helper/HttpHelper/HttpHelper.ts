import { ServerSetting } from '../../../Config/server-setting';

class ApiRequest {
  constructor(url, requestType){
    this.uri = url;
    this.requestType = requestType;
  }
  public uri: string;
  public requestType: ApiRequestTypeEnum;
}
export class WebSocketRequest {
  constructor(event, requestType){
    this.event = event;
    this.requestType = requestType;
  }
  public event: string;
  public requestType: WebSocketTypeEnum;
}
export enum ApiRequestTypeEnum {
  GET,
  POST,
  PATCH,
  DELETE,
  REDIRECT
}
export enum WebSocketTypeEnum {
  CREATE,
  CREATE_TAG,
  READ,
  UPDATE,
  DELETE,
  DELETE_TAG,
  RELOCATE,
  LOCK,
  UNLOCK,
  JOIN
}

export enum WebsocketValidationCheck {
  INVALID_USER,
  INVALID_PROJECT,
  INVALID_PARTICIPANT,
}

export class HttpHelper {
  private static readonly contentType         =   'application/json; charset=utf-8';
  private static readonly tokenType           =   'bearer ';

  public static readonly ngUrl   =   ServerSetting.ngUrl;
  public static readonly apiUrl  =   ServerSetting.nestUrl;

  //TODO api정보를 담는 변수임. 얘는 반드시 uri값을 가져야 함.
  //url값을 가지면 안됨. url값을 쓰고 싶으면 apiUrl이랑 합쳐서 써야 함. 그래서 public으로 해놓음.
  public static readonly api = {
    authGoogle : new ApiRequest(
      "/auth/google",   ApiRequestTypeEnum.REDIRECT
    ),
    protected : new ApiRequest(
      "/auth/protected",     ApiRequestTypeEnum.POST
    ),
    signOut: new ApiRequest(
      "/auth/signOut", ApiRequestTypeEnum.POST
    ),
    project : {
      create : new ApiRequest(
        "/project", ApiRequestTypeEnum.POST
      ),
      getList : new ApiRequest(
        "/project", ApiRequestTypeEnum.GET
      )
    }
  };

  public static readonly websocketApi = {
    project : {
      joinProject : new WebSocketRequest(
        "project_join",WebSocketTypeEnum.READ
      )
    },
    kanban : {
      create : new WebSocketRequest(
        "kanban_create", WebSocketTypeEnum.CREATE
      ),
      create_tag : new WebSocketRequest(
        "kanban_create_tag", WebSocketTypeEnum.CREATE_TAG
      ),
      update : new WebSocketRequest(
        "kanban_update", WebSocketTypeEnum.UPDATE
      ),
      delete : new WebSocketRequest(
        "kanban_delete", WebSocketTypeEnum.DELETE
      ),
      delete_tag : new WebSocketRequest(
        "kanban_delete_tag", WebSocketTypeEnum.DELETE_TAG
      ),
      relocate : new WebSocketRequest(
        "kanban_relocate", WebSocketTypeEnum.RELOCATE
      ),
      lock : new WebSocketRequest(
        "kanban_lock", WebSocketTypeEnum.LOCK
      ),
      unlock : new WebSocketRequest(
        "kanban_unlock", WebSocketTypeEnum.UNLOCK
      ),
      read : new WebSocketRequest(
        "kanban_read", WebSocketTypeEnum.READ
      ),
    },
    whiteboardSession : {
      read : new WebSocketRequest(
        "wbSession_read", WebSocketTypeEnum.READ
      ),
      create : new WebSocketRequest(
        "wbSession_create", WebSocketTypeEnum.CREATE
      ),
      update : new WebSocketRequest(
        "wbSession_update", WebSocketTypeEnum.UPDATE
      ),
      delete : new WebSocketRequest(
        "wbSession_delete", WebSocketTypeEnum.DELETE
      ),
      lock : new WebSocketRequest(
        "wbSession_lock", WebSocketTypeEnum.LOCK
      ),
      unlock : new WebSocketRequest(
        "wbSession_unlock", WebSocketTypeEnum.UNLOCK
      ),
      join : new WebSocketRequest(
        "wbSession_join",WebSocketTypeEnum.JOIN
      )
    }
  };


  public static getContentType(){
    return HttpHelper.contentType;
  }
  public static getTokenType(){
    return HttpHelper.tokenType;
  }

  public static redirectTo(uri){
    window.location.href = HttpHelper.apiUrl + uri;
  }
}

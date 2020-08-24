import * as serverSecretJson from "./serverSecret.json";

export class ServerSetting {
  public static readonly serverProtocol   = serverSecretJson.serverProtocol;
  public static readonly dbProtocol       = serverSecretJson.dbProtocol;

  public static readonly dbAccount       = serverSecretJson.dbAccount;

  public static readonly frontendDomain   = serverSecretJson.frontendDomain;
  public static readonly backendDomain    = serverSecretJson.backendDomain;
  public static readonly databaseDomain    = serverSecretJson.databaseDomain;

  public static readonly ngPort           = serverSecretJson.ngPort;
  public static readonly nestPort         = serverSecretJson.nestPort;
  public static readonly dbPort           = serverSecretJson.dbPort;

  public static readonly dbName           = serverSecretJson.dbName;

  public static readonly ngUrl            = ServerSetting.serverProtocol + ServerSetting.frontendDomain + ServerSetting.ngPort;
  public static readonly dbUrl            = ServerSetting.dbProtocol + ServerSetting.dbAccount + "@" + ServerSetting.databaseDomain + ServerSetting.dbPort + ServerSetting.dbName;
  public static readonly nestUrl          = ServerSetting.serverProtocol + ServerSetting.backendDomain + ServerSetting.nestPort;

  public static readonly googleCallbackURL      = ServerSetting.nestUrl + "/auth/google/callback";
  public static readonly kakaoCallbackURL      = ServerSetting.nestUrl + "/auth/kakao/callback";
  public static readonly naverCallbackURL      = ServerSetting.nestUrl + "/auth/naver/callback";

  public static readonly ngRoutes = {
    "loginSuccess" : ServerSetting.ngUrl + "/login/success/",
    "loginFailure" : ServerSetting.ngUrl + "/login/failure"
  }
}

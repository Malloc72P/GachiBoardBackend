
import * as serverSecretJson from "./serverSecret.json";

export class ServerSetting {
  public static readonly serverProtocol   = serverSecretJson.serverProtocol;
  public static readonly dbProtocol       = serverSecretJson.dbProtocol;

  public static readonly frontendDomain   = serverSecretJson.deploy_frontendDomain;
  public static readonly backendDomain    = serverSecretJson.deploy_backendDomain;
  public static readonly databaseDomain    = serverSecretJson.deploy_databaseDomain;

  public static readonly ngPort           = serverSecretJson.deploy_ngPort;
  public static readonly nestPort         = serverSecretJson.deploy_nestPort;
  public static readonly dbPort           = serverSecretJson.deploy_dbPort;

  public static readonly dbName           = serverSecretJson.dbName;

  public static readonly ngUrl            = ServerSetting.serverProtocol + ServerSetting.frontendDomain + ServerSetting.ngPort;
  public static readonly dbUrl            = ServerSetting.dbProtocol + ServerSetting.databaseDomain + ServerSetting.dbPort + ServerSetting.dbName;
  public static readonly nestUrl          = ServerSetting.serverProtocol + ServerSetting.backendDomain + ServerSetting.nestPort;

  public static readonly googleCallbackURL      = ServerSetting.nestUrl + "/auth/google/callback";
  public static readonly kakaoCallbackURL      = ServerSetting.nestUrl + "/auth/kakao/callback";
  public static readonly naverCallbackURL      = ServerSetting.nestUrl + "/auth/naver/callback";

  public static readonly ngRoutes = {
    "loginSuccess" : ServerSetting.ngUrl + "/login/success/",
    "loginFailure" : ServerSetting.ngUrl + "/login/failure"
  }
}

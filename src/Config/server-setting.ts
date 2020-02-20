export class ServerSetting {
  public static readonly serverDomain  =   "skynet765.iptime.org";
  public static readonly dbServerDomain  =   "skynet765.iptime.org";
  public static readonly serverProtocol  =   "http://";

  public static readonly dbDomain  =   "mongodb://" + ServerSetting.dbServerDomain;
  public static readonly dbPort    =   ":44199";
  public static readonly dbName    =   "/Gachiboard";


  public static readonly ngDomain  =   ServerSetting.serverProtocol + ServerSetting.serverDomain;
  public static readonly ngPort    =   ":44172";

  public static readonly nestDomain  =   ServerSetting.serverProtocol + ServerSetting.serverDomain;
  public static readonly nestPort    =   ":44174";

  public static readonly dbUrl    = ServerSetting.dbDomain + ServerSetting.dbPort + ServerSetting.dbName;
  public static readonly ngUrl    = ServerSetting.ngDomain + ServerSetting.ngPort;
  public static readonly nestUrl  = ServerSetting.nestDomain + ServerSetting.nestPort;

  public static readonly callbackURL  = ServerSetting.nestUrl
                                        + "/auth/google/callback";

  public static readonly ngRoutes = {
    "loginSuccess" : ServerSetting.ngUrl + "/login/success/",
    "loginFailure" : ServerSetting.ngUrl + "/login/failure"
  }
}

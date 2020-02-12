export class ServerSetting {
  public static readonly serverDomain  =   "gachiboard.iptime.org";
  public static readonly dbServerDomain  =   "localhost";
  public static readonly serverProtocol  =   "http://";

  public static readonly dbDomain  =   "mongodb://" + ServerSetting.dbServerDomain;
  public static readonly dbPort    =   ":27017";
  public static readonly dbName    =   "/Gachiboard";


  public static readonly ngDomain  =   ServerSetting.serverProtocol + ServerSetting.serverDomain;
  public static readonly ngPort    =   ":4200";

  public static readonly nestDomain  =   ServerSetting.serverProtocol + ServerSetting.serverDomain;
  public static readonly nestPort    =   ":5200";

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

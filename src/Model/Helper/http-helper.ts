export class HttpHelper {
  private static readonly dbDomain  =   "mongodb://localhost";
  private static readonly dbPort    =   ":27017";
  private static readonly dbName    =   "/WhiteboardHub";

  private static readonly ngDomain  =   "http://localhost";
  private static readonly ngPort    =   ":4200";

  public static readonly dbUrl = HttpHelper.dbDomain + HttpHelper.dbPort + HttpHelper.dbName;

  public static readonly ngUrl = HttpHelper.ngDomain + HttpHelper.ngPort;

  public static readonly ngRoutes = {
    loginSuccess : HttpHelper.ngUrl + "/login/succes/",
    loginfailure : HttpHelper.ngUrl + "/login/failure",
  };
}

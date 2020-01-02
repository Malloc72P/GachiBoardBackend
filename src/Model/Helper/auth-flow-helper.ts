export class AuthFlowHelper {
  private static secretOrKey = "IU8wsLiwV+Mb3/nMP8KabG2DNDJ8uj7TKmnowzh1fvxHaK9czKtmURIWxyT2PeFWxlGEr469p/jeZa/a/qfxL3tTqNKlIilPUotx+" +
    "RvrWXPXVm9JdLbYnhtF9fH8dJi2vfKzn/GDDhfmbHjvNXBpJYwnklEgti4o2c8uBAOSfXt8n0jHFYKzgv7HuGA/d/mg6RwEr/PE4G1ISwgAiJndGORQ4dd433jVtlP9k+oIo" +
    "uyG5Qr8wO2w1Y2REURgTHvWbrUa7pM4/VyCG1A0+pm5CSPp2ikBKh3hjsY0TZPCCUW56ziHwwbNBBOtsOgbShEDVCDh0S84aU0er8rcTgaPew==";

  private static readonly googleOAuth = {
    clientID    : '54721894942-rpk8hlis1s62jgou1obrb09i32ip6of6.apps.googleusercontent.com',     // <- Replace this with your client id
    clientSecret: 'dHXEfz5SkRGZEz7d15DlRwEy', // <- Replace this with your client secret
    callbackURL : 'http://localhost:5200/auth/google/callback',
    passReqToCallback: true,
    scope: ['email profile  openid']
  };

  static getGoogleClientId(){
    return AuthFlowHelper.googleOAuth.clientID;
  }
  static getGoogleClientSecret(){
    return AuthFlowHelper.googleOAuth.clientSecret;
  }
  static getGoogleCallbackUrl(){
    return AuthFlowHelper.googleOAuth.callbackURL;
  }
  static getGoogleScope(){
    return AuthFlowHelper.googleOAuth.scope;
  }
  static getSecretOrKey(){
    return AuthFlowHelper.secretOrKey;
  }
}

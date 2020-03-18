import * as serverSecretJson from "./serverSecret.json";

export class ServerSecret {
  public static readonly secretOrKey   = serverSecretJson.secretOrKey;

  public static readonly google_clientID      = serverSecretJson.google_clientID;
  public static readonly google_clientSecret  = serverSecretJson.google_clientSecret;

  public static readonly kakao_clientID      = serverSecretJson.kakao_rest_api_key;

  public static readonly naver_clientID      = serverSecretJson.naver_clientID;
  public static readonly naver_clientSecret  = serverSecretJson.naver_clientSecret;

}

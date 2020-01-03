import * as serverSecretJson from "./serverSecret.json";

export class ServerSecret {
  public static readonly secretOrKey   = serverSecretJson.secretOrKey;
  public static readonly clientID      = serverSecretJson.clientID;
  public static readonly clientSecret  = serverSecretJson.clientSecret;
}

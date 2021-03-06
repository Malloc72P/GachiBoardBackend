import * as serverSecret from "src/Config/serverSecret.json"

export class Options {
  public static mediaCodecs = [{
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  }, {
    kind: "video",
    mimeType: "video/H264",
    clockRate: 90000,
    parameters: {
      "packetization-mode": 1,
      "profile-level-id": "42e01f",
      "level-asymmetry-allowed": 1,
    }
  }];

  public static transportOptions = {
    listenIps: [{ ip: serverSecret.mediaSoup_ip, announcedIp: serverSecret.mediaSoup_announceIp }],
    enableTcp: true,
    enableUdp: true,
    preferUdp: true,
  };

  public static workerOption = {
    rtcMinPort: serverSecret.mediaSoup_min_port,
    rtcMaxPort: serverSecret.mediaSoup_max_port,
  }
}

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
    listenIps: [{ ip: "192.168.0.3", announcedIp: "112.172.140.33" }],
    enableTcp: true,
    enableUdp: true,
    preferUdp: true,
  };
}

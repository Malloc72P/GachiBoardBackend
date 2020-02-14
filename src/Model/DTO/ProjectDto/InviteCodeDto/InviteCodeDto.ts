export class InviteCodeDto {
  public inviteCode:string;
  public remainCount:number;

  constructor(inviteCode: string, remainCount: number) {
    this.inviteCode = inviteCode;
    this.remainCount = remainCount;
  }
}

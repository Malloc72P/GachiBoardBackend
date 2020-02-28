export class GachiPointDto {
  public x:number;
  public y:number;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  public clone(): GachiPointDto {
    return new GachiPointDto(this.x, this.y);
  }
}

export class GachiColorDto {
  public red;
  public green;
  public blue;
  public alpha;

  constructor(red, green, blue, alpha?) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    if(alpha){
      this.alpha = alpha;
    }else{
      this.alpha = 1;
    }
  }

  public static clone(dto: GachiColorDto): GachiColorDto{
    return new GachiColorDto(dto.red, dto.green, dto.blue, dto.alpha);
  }



}

export class GachiColorList {
  public static getColor(idx){
    switch (idx) {
      case 0 :
        return "red";
      case 1 :
        return "blue";
      case 2 :
        return "yellow";
      case 3 :
        return "black";
      case 4 :
        return "purple";
      case 5 :
        return "cyan";
      case 6 :
        return "azure";
      case 7 :
        return "indigo";
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { KakaoStrategyService } from './kakao-strategy.service';

describe('KakaoStrategyService', () => {
  let service: KakaoStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KakaoStrategyService],
    }).compile();

    service = module.get<KakaoStrategyService>(KakaoStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

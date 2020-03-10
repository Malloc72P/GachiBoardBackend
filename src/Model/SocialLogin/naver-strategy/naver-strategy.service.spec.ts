import { Test, TestingModule } from '@nestjs/testing';
import { NaverStrategyService } from './naver-strategy.service';

describe('NaverStrategyService', () => {
  let service: NaverStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NaverStrategyService],
    }).compile();

    service = module.get<NaverStrategyService>(NaverStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

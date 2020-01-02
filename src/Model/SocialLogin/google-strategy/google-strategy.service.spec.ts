import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategyService } from './google-strategy.service';

describe('GoogleStrategyService', () => {
  let service: GoogleStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleStrategyService],
    }).compile();

    service = module.get<GoogleStrategyService>(GoogleStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

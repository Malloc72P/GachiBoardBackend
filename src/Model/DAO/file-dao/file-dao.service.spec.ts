import { Test, TestingModule } from '@nestjs/testing';
import { FileDaoService } from './file-dao.service';

describe('FileDaoService', () => {
  let service: FileDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileDaoService],
    }).compile();

    service = module.get<FileDaoService>(FileDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

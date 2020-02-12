import { Test, TestingModule } from '@nestjs/testing';
import { ProjectDaoService } from './project-dao.service';

describe('ProjectDaoService', () => {
  let service: ProjectDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectDaoService],
    }).compile();

    service = module.get<ProjectDaoService>(ProjectDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

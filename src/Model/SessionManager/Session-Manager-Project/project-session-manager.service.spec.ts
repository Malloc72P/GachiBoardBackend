import { Test, TestingModule } from '@nestjs/testing';
import { ProjectSessionManagerService } from './project-session-manager.service';

describe('ProjectSessionManagerService', () => {
  let service: ProjectSessionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectSessionManagerService],
    }).compile();

    service = module.get<ProjectSessionManagerService>(ProjectSessionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

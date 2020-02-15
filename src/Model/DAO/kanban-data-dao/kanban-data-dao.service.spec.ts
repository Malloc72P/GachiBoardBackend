import { Test, TestingModule } from '@nestjs/testing';
import { KanbanDataDaoService } from './kanban-data-dao.service';

describe('KanbanDataDaoService', () => {
  let service: KanbanDataDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KanbanDataDaoService],
    }).compile();

    service = module.get<KanbanDataDaoService>(KanbanDataDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

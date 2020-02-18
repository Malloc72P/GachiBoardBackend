import { Test, TestingModule } from '@nestjs/testing';
import { KanbanTagDaoService } from './kanban-tag-dao.service';

describe('KanbanTagDaoService', () => {
  let service: KanbanTagDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KanbanTagDaoService],
    }).compile();

    service = module.get<KanbanTagDaoService>(KanbanTagDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

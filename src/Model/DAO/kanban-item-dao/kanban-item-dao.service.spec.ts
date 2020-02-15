import { Test, TestingModule } from '@nestjs/testing';
import { KanbanItemDaoService } from './kanban-item-dao.service';

describe('KanbanItemDaoService', () => {
  let service: KanbanItemDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KanbanItemDaoService],
    }).compile();

    service = module.get<KanbanItemDaoService>(KanbanItemDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

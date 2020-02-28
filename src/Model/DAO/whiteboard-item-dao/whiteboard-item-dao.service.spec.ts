import { Test, TestingModule } from '@nestjs/testing';
import { WhiteboardItemDaoService } from './whiteboard-item-dao.service';

describe('WhiteboardItemDaoService', () => {
  let service: WhiteboardItemDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhiteboardItemDaoService],
    }).compile();

    service = module.get<WhiteboardItemDaoService>(WhiteboardItemDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

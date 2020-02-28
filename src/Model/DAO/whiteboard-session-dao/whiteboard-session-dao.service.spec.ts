import { Test, TestingModule } from '@nestjs/testing';
import { WhiteboardSessionDaoService } from './whiteboard-session-dao.service';

describe('WhiteboardSessionDaoService', () => {
  let service: WhiteboardSessionDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhiteboardSessionDaoService],
    }).compile();

    service = module.get<WhiteboardSessionDaoService>(WhiteboardSessionDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { WhiteboardSessionManagerService } from './whiteboard-session-manager.service';

describe('WhiteboardSessionManagerService', () => {
  let service: WhiteboardSessionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WhiteboardSessionManagerService],
    }).compile();

    service = module.get<WhiteboardSessionManagerService>(WhiteboardSessionManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

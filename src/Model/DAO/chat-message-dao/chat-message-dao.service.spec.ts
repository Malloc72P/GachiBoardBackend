import { Test, TestingModule } from '@nestjs/testing';
import { ChatMessageDaoService } from './chat-message-dao.service';

describe('ChatMessageDaoService', () => {
  let service: ChatMessageDaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatMessageDaoService],
    }).compile();

    service = module.get<ChatMessageDaoService>(ChatMessageDaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { VideoChatManagerService } from './video-chat-manager.service';

describe('VideoChatManagerService', () => {
  let service: VideoChatManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoChatManagerService],
    }).compile();

    service = module.get<VideoChatManagerService>(VideoChatManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

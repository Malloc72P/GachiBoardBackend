import { Test, TestingModule } from '@nestjs/testing';
import { AuthCallbackController } from './auth-callback.controller';

describe('AuthCallback Controller', () => {
  let controller: AuthCallbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthCallbackController],
    }).compile();

    controller = module.get<AuthCallbackController>(AuthCallbackController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

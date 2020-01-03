import { ServerSecret } from './server-secret';

describe('ServerSecret', () => {
  it('should be defined', () => {
    expect(new ServerSecret()).toBeDefined();
  });
});

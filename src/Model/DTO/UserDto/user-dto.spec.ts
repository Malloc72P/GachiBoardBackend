import { UserDto } from './user-dto';

describe('UserDto', () => {
  it('should be defined', () => {
    // @ts-ignore
    expect(new UserDto()).toBeDefined();
  });
});

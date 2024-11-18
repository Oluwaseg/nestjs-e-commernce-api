import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  // Mock AuthService
  const mockAuthService = {
    register: jest.fn().mockResolvedValue({ id: 1, username: 'testuser' }),
    login: jest.fn().mockResolvedValue({ access_token: 'mock-token' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController], // Register controller
      providers: [
        {
          provide: AuthService, // Inject mock AuthService
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call AuthService.register on register()', async () => {
    const mockUserDto = { username: 'testuser', password: 'testpass' };
    const result = await controller.register(mockUserDto);
    expect(mockAuthService.register).toHaveBeenCalledWith(mockUserDto);
    expect(result).toEqual({ id: 1, username: 'testuser' });
  });

  it('should call AuthService.login on login()', async () => {
    const mockUserDto = { username: 'testuser', password: 'testpass' };
    const result = await controller.login(mockUserDto);
    expect(mockAuthService.login).toHaveBeenCalledWith(mockUserDto);
    expect(result).toEqual({ access_token: 'mock-token' });
  });
});

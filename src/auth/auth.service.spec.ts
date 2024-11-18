import { JwtService } from '@nestjs/jwt'; // If JwtService is used
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../users/users.service'; // Assuming UserService is used
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  // Mock services
  const mockUserService = {
    create: jest.fn().mockResolvedValue({ id: 1, username: 'testuser' }),
  };
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a user and return user data', async () => {
    const mockUserDto = { username: 'testuser', password: 'testpass' };
    const result = await service.register(mockUserDto);
    expect(mockUserService.create).toHaveBeenCalledWith({
      ...mockUserDto,
      password: expect.any(String), // The password should be hashed, expect a string
    });
    expect(result).toEqual({ id: 1, username: 'testuser' });
  });

  it('should generate a JWT token on login', async () => {
    // Update the mock user to match the expected type
    const mockUser = { id: '1', username: 'testuser', password: 'testpass' }; // id should be a string

    const result = await service.login(mockUser);

    expect(mockJwtService.sign).toHaveBeenCalledWith({
      username: mockUser.username,
      id: mockUser.id,
    });
    expect(result).toEqual({ access_token: 'mock-token' });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { UserService } from './users.service';

describe('UserService', () => {
  let service: UserService;

  // Mock UserRepository
  const mockUserRepository = {
    findOne: jest.fn().mockResolvedValue({
      id: 1,
      username: 'testuser',
      password: 'hashedpassword',
    }),
    save: jest.fn().mockResolvedValue({ id: 1, username: 'testuser' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User), // Mock the repository
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

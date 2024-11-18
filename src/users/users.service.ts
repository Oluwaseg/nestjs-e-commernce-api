import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userDto: Partial<User>): Promise<User> {
    // Ensure userDto is an object and not an array
    if (Array.isArray(userDto)) {
      throw new Error('Invalid input: userDto should not be an array');
    }

    const user = this.userRepository.create(userDto); // Create a user entity from the DTO
    return await this.userRepository.save(user); // Save and return the user entity
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { randomBytes } from 'crypto';
import * as jwt from 'jsonwebtoken';
import { sendOtpEmail, sendWelcomeEmail } from 'src/utils/email.utils';
import { DataSource, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { VerifyOtpDto } from './dto/verify.otp.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource, // For managing transactions
  ) {}

  async register(createUserDto: CreateUserDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { username, email, password } = createUserDto;

      // Check if the user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash the password before saving
      const hashedPassword = await hash(password, 10);

      // Generate OTP
      const otp = randomBytes(3).toString('hex');

      // Generate token (can be JWT or another type)
      const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      // Create a new user with all required fields
      const user = this.userRepository.create({
        username,
        email,
        password: hashedPassword,
        otp,
        token,
        isVerified: false, // Set isVerified to false initially
      });

      await queryRunner.manager.save(User, user);

      // Send OTP email
      await sendOtpEmail(email, otp);

      await queryRunner.commitTransaction();

      return {
        message: 'Registration successful. Please verify your email.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error in register:', error.message);
      throw new Error('Registration failed');
    } finally {
      await queryRunner.release();
    }
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, otp } = verifyOtpDto;

    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    user.isVerified = true;
    user.otp = null;

    await this.userRepository.save(user);

    await sendWelcomeEmail(user.email, user.username);

    return {
      message: 'OTP verified successfully. Your email is now verified.',
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  }
}

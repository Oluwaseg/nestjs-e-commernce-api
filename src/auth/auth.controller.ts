import { Body, Controller, Logger, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create.user.dto';
import { VerifyOtpDto } from './dto/verify.otp.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    this.logger.log(`Incoming payload: ${JSON.stringify(verifyOtpDto)}`);

    if (!verifyOtpDto.email || !verifyOtpDto.otp) {
      this.logger.error('Missing email or OTP');
      throw new Error('Email and OTP are required');
    }

    return this.authService.verifyOtp(verifyOtpDto);
  }
}

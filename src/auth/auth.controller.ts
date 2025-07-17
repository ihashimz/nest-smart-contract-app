import { Controller, Post, Body, UseGuards, Request, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Login successful',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Registration successful',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getProfile(@Request() req: any): Promise<any> {
    return this.authService.getProfile(req.user.id);
  }
} 
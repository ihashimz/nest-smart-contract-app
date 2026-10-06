import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/login.dto';
import { UserRole } from '../common/decorators/roles.decorator';
import { AuthenticatedUser } from './authenticated-user';
import { BanksService } from '../banks/banks.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly banksService: BanksService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['bank'],
    });

    if (
      user?.bank?.isActive &&
      (await bcrypt.compare(password, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles,
      bankId: user.bankId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        bankId: user.bankId,
      },
    };
  }

  async register(
    registerDto: RegisterDto,
    actor: AuthenticatedUser,
  ): Promise<AuthResponseDto> {
    if (!actor?.bankId || !actor.roles?.includes(UserRole.BANK_ADMIN)) {
      throw new ForbiddenException(
        'Only bank administrators can provision users',
      );
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Verify bank exists
    await this.banksService.findOne(actor.bankId);

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const user = this.userRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      bankId: actor.bankId,
      roles: [UserRole.TRADER],
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    // Generate JWT token
    const payload = {
      email: savedUser.email,
      sub: savedUser.id,
      roles: savedUser.roles,
      bankId: savedUser.bankId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        roles: savedUser.roles,
        bankId: savedUser.bankId,
      },
    };
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['bank'],
    });

    if (!user?.bank?.isActive) {
      throw new UnauthorizedException('User not found or bank inactive');
    }

    const { password, ...result } = user;
    return result;
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any): Promise<any> {
    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new UnauthorizedException('Invalid token subject');
    }
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
      relations: ['bank'],
    });

    if (!user?.bank?.isActive) {
      throw new UnauthorizedException('User or bank not found or inactive');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      bankId: user.bankId,
      bank: user.bank,
    };
  }
}

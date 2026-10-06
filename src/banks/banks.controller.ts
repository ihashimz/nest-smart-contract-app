import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/authenticated-user';
import { BanksService } from './banks.service';
import { UpdateBankDto, BankResponseDto } from './dto/bank.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';

@ApiTags('banks')
@Controller('banks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  @ApiOperation({ summary: 'Get the authenticated bank' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Authenticated bank',
    type: [BankResponseDto],
  })
  async findAll(
    @Request() req: { user: AuthenticatedUser },
  ): Promise<BankResponseDto[]> {
    return this.banksService.findAll(req.user.bankId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bank by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank found',
    type: BankResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank not found' })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<BankResponseDto> {
    return this.banksService.findOne(id, req.user.bankId);
  }

  @Get('address/:address')
  @ApiOperation({ summary: 'Get a bank by blockchain address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank found',
    type: BankResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank not found' })
  async findByBlockchainAddress(
    @Param('address') address: string,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<BankResponseDto> {
    return this.banksService.findByBlockchainAddress(address, req.user.bankId);
  }

  @Patch(':id')
  @Roles(UserRole.BANK_ADMIN)
  @ApiOperation({ summary: 'Update a bank' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank updated successfully',
    type: BankResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank not found' })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Bank already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBankDto: UpdateBankDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<BankResponseDto> {
    return this.banksService.update(id, updateBankDto, req.user.bankId);
  }

  @Delete(':id')
  @Roles(UserRole.BANK_ADMIN)
  @ApiOperation({ summary: 'Delete a bank (soft delete)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bank deleted successfully',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank not found' })
  async remove(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<void> {
    return this.banksService.remove(id, req.user.bankId);
  }
}

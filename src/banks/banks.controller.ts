import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BanksService } from './banks.service';
import { CreateBankDto, UpdateBankDto, BankResponseDto } from './dto/bank.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';

@ApiTags('banks')
@Controller('banks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Post()
  @Roles(UserRole.BANK_ADMIN)
  @ApiOperation({ summary: 'Create a new bank' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Bank created successfully',
    type: BankResponseDto 
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Bank already exists' })
  async create(@Body() createBankDto: CreateBankDto): Promise<BankResponseDto> {
    return this.banksService.create(createBankDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active banks' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'List of all active banks',
    type: [BankResponseDto] 
  })
  async findAll(): Promise<BankResponseDto[]> {
    return this.banksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bank by ID' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Bank found',
    type: BankResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank not found' })
  async findOne(@Param('id') id: string): Promise<BankResponseDto> {
    return this.banksService.findOne(id);
  }

  @Get('address/:address')
  @ApiOperation({ summary: 'Get a bank by blockchain address' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Bank found',
    type: BankResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank not found' })
  async findByBlockchainAddress(@Param('address') address: string): Promise<BankResponseDto> {
    return this.banksService.findByBlockchainAddress(address);
  }

  @Patch(':id')
  @Roles(UserRole.BANK_ADMIN)
  @ApiOperation({ summary: 'Update a bank' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Bank updated successfully',
    type: BankResponseDto 
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Bank already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateBankDto: UpdateBankDto,
  ): Promise<BankResponseDto> {
    return this.banksService.update(id, updateBankDto);
  }

  @Delete(':id')
  @Roles(UserRole.BANK_ADMIN)
  @ApiOperation({ summary: 'Delete a bank (soft delete)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Bank deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Bank not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.banksService.remove(id);
  }
} 
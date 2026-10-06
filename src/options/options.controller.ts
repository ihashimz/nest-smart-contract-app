import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/authenticated-user';
import { OptionsService } from './options.service';
import { CreateOptionDto } from './dto/create-option.dto';
import {
  TransferOptionDto,
  TransferResponseDto,
} from './dto/transfer-option.dto';
import {
  OptionResponseDto,
  OptionWithOwnerDto,
} from './dto/option-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';

@ApiTags('options')
@Controller('options')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Post()
  @Roles(UserRole.TRADER, UserRole.BANK_ADMIN)
  @ApiOperation({ summary: 'Create a new option' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Option created successfully',
    type: OptionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid option data',
  })
  async create(
    @Body() createOptionDto: CreateOptionDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<OptionResponseDto> {
    return this.optionsService.create(createOptionDto, req.user.bankId);
  }

  @Get()
  @ApiOperation({ summary: 'Get options owned by the authenticated bank' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of options',
    type: [OptionWithOwnerDto],
  })
  async findAll(
    @Request() req: { user: AuthenticatedUser },
  ): Promise<OptionWithOwnerDto[]> {
    return this.optionsService.findAll(req.user.bankId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an option by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Option found',
    type: OptionWithOwnerDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Option not found',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<OptionWithOwnerDto> {
    return this.optionsService.findOne(id, req.user.bankId);
  }

  @Post(':id/transfer')
  @Roles(UserRole.TRADER, UserRole.BANK_ADMIN)
  @ApiOperation({ summary: 'Transfer an option to another bank' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transfer initiated successfully',
    type: TransferResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Option not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Transfer failed',
  })
  async transfer(
    @Param('id') id: string,
    @Body() transferDto: TransferOptionDto,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<TransferResponseDto> {
    // JwtStrategy reloads the user's current bank membership from the database.
    const fromBankId = req.user.bankId;
    return this.optionsService.transfer(id, fromBankId, transferDto);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get transfer history for an option' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Transfer history',
    type: [TransferResponseDto],
  })
  async getTransferHistory(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ): Promise<TransferResponseDto[]> {
    return this.optionsService.getTransferHistory(id, req.user.bankId);
  }
}

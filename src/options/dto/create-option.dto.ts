import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsDateString, 
  IsEnum, 
  IsOptional, 
  IsObject,
  Min,
  IsUUID 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OptionType } from '../entities/option.entity';

export class CreateOptionDto {
  @ApiProperty({ description: 'Option symbol (e.g., AAPL-CALL-150-2024-12-15)' })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({ description: 'Strike price of the option' })
  @IsNumber()
  @Min(0)
  strikePrice: number;

  @ApiProperty({ description: 'Expiration date of the option' })
  @IsDateString()
  expirationDate: string;

  @ApiProperty({ description: 'Type of option', enum: OptionType })
  @IsEnum(OptionType)
  optionType: OptionType;

  @ApiProperty({ description: 'Premium price of the option' })
  @IsNumber()
  @Min(0)
  premium: number;

  @ApiProperty({ description: 'Quantity of options' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Underlying asset (e.g., AAPL)' })
  @IsString()
  @IsNotEmpty()
  underlyingAsset: string;

  @ApiProperty({ description: 'Smart contract address' })
  @IsString()
  @IsNotEmpty()
  blockchainAddress: string;

  @ApiProperty({ description: 'NFT token ID' })
  @IsString()
  @IsNotEmpty()
  tokenId: string;

  @ApiProperty({ description: 'ID of the bank that owns this option' })
  @IsUUID()
  currentOwnerId: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 
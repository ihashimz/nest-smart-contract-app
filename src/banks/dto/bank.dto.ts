import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankDto {
  @ApiProperty({ description: 'Bank name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Bank identifier code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Blockchain address of the bank' })
  @IsString()
  @IsNotEmpty()
  blockchainAddress: string;

  @ApiPropertyOptional({ description: 'Bank description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateBankDto {
  @ApiPropertyOptional({ description: 'Bank name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'Bank identifier code' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @ApiPropertyOptional({ description: 'Blockchain address of the bank' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  blockchainAddress?: string;

  @ApiPropertyOptional({ description: 'Bank description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Bank active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class BankResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  blockchainAddress: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  metadata: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 
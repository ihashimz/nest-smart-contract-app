import { IsUUID, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TransferOptionDto {
  @ApiProperty({ description: 'ID of the bank to transfer the option to' })
  @IsUUID()
  toBankId: string;

  @ApiPropertyOptional({ description: 'Additional metadata for the transfer' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class TransferResponseDto {
  @ApiProperty()
  transferId: string;

  @ApiProperty()
  optionId: string;

  @ApiProperty()
  fromBankId: string;

  @ApiProperty()
  toBankId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  transactionHash?: string;

  @ApiProperty()
  createdAt: Date;
} 
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OptionType, OptionStatus } from '../entities/option.entity';

export class OptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  strikePrice: number;

  @ApiProperty()
  expirationDate: Date;

  @ApiProperty({ enum: OptionType })
  optionType: OptionType;

  @ApiProperty()
  premium: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  underlyingAsset: string;

  @ApiProperty()
  blockchainAddress: string;

  @ApiProperty()
  tokenId: string;

  @ApiProperty({ enum: OptionStatus })
  status: OptionStatus;

  @ApiProperty()
  currentOwnerId: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OptionWithOwnerDto extends OptionResponseDto {
  @ApiProperty()
  currentOwner: {
    id: string;
    name: string;
    code: string;
    blockchainAddress: string;
  };
} 
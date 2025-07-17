import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Option, OptionStatus } from './entities/option.entity';
import { OptionTransfer, TransferStatus } from './entities/option-transfer.entity';
import { CreateOptionDto } from './dto/create-option.dto';
import { TransferOptionDto, TransferResponseDto } from './dto/transfer-option.dto';
import { OptionResponseDto, OptionWithOwnerDto } from './dto/option-response.dto';
import { BanksService } from '../banks/banks.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class OptionsService {
  constructor(
    @InjectRepository(Option)
    private readonly optionRepository: Repository<Option>,
    @InjectRepository(OptionTransfer)
    private readonly transferRepository: Repository<OptionTransfer>,
    private readonly banksService: BanksService,
    private readonly blockchainService: BlockchainService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOptionDto: CreateOptionDto): Promise<OptionResponseDto> {
    // Verify the bank exists
    await this.banksService.findOne(createOptionDto.currentOwnerId);

    // Check if option with same blockchain address and token ID already exists
    const existingOption = await this.optionRepository.findOne({
      where: {
        blockchainAddress: createOptionDto.blockchainAddress,
        tokenId: createOptionDto.tokenId,
      },
    });

    if (existingOption) {
      throw new BadRequestException('Option with this blockchain address and token ID already exists');
    }

    const option = this.optionRepository.create(createOptionDto);
    const savedOption = await this.optionRepository.save(option);
    
    return this.mapToResponseDto(savedOption);
  }

  async findAll(bankId?: string): Promise<OptionWithOwnerDto[]> {
    const query = this.optionRepository
      .createQueryBuilder('option')
      .leftJoinAndSelect('option.currentOwner', 'owner')
      .orderBy('option.createdAt', 'DESC');

    if (bankId) {
      query.where('option.currentOwnerId = :bankId', { bankId });
    }

    const options = await query.getMany();
    return options.map(option => this.mapToWithOwnerDto(option));
  }

  async findOne(id: string): Promise<OptionWithOwnerDto> {
    const option = await this.optionRepository.findOne({
      where: { id },
      relations: ['currentOwner'],
    });

    if (!option) {
      throw new NotFoundException(`Option with ID ${id} not found`);
    }

    return this.mapToWithOwnerDto(option);
  }

  async transfer(
    optionId: string,
    fromBankId: string,
    transferDto: TransferOptionDto,
  ): Promise<TransferResponseDto> {
    // Verify the option exists and belongs to the fromBank
    const option = await this.optionRepository.findOne({
      where: { id: optionId, currentOwnerId: fromBankId },
    });

    if (!option) {
      throw new NotFoundException('Option not found or not owned by the specified bank');
    }

    if (option.status !== OptionStatus.ACTIVE) {
      throw new BadRequestException('Option is not available for transfer');
    }

    // Verify the target bank exists
    const toBank = await this.banksService.findOne(transferDto.toBankId);

    // Create transfer record
    const transfer = this.transferRepository.create({
      optionId,
      fromBankId,
      toBankId: transferDto.toBankId,
      metadata: transferDto.metadata,
    });

    const savedTransfer = await this.transferRepository.save(transfer);

    try {
      // Execute blockchain transfer
      const transactionResult = await this.blockchainService.transferOption(
        option.blockchainAddress,
        option.tokenId,
        toBank.blockchainAddress,
      );

      // Update transfer record with transaction details
      savedTransfer.status = TransferStatus.CONFIRMED;
      savedTransfer.transactionHash = transactionResult.hash;
      savedTransfer.blockNumber = transactionResult.blockNumber;
      savedTransfer.gasUsed = transactionResult.gasUsed;
      savedTransfer.gasPrice = transactionResult.gasPrice;

      await this.transferRepository.save(savedTransfer);

      // Update option ownership
      option.currentOwnerId = transferDto.toBankId;
      option.status = OptionStatus.TRANSFERRED;
      await this.optionRepository.save(option);

      return this.mapToTransferResponseDto(savedTransfer);
    } catch (error) {
      // Update transfer record with failure details
      savedTransfer.status = TransferStatus.FAILED;
      savedTransfer.failureReason = error.message;
      await this.transferRepository.save(savedTransfer);

      throw new BadRequestException(`Transfer failed: ${error.message}`);
    }
  }

  async getTransferHistory(optionId: string): Promise<TransferResponseDto[]> {
    const transfers = await this.transferRepository.find({
      where: { optionId },
      relations: ['fromBank', 'toBank'],
      order: { createdAt: 'DESC' },
    });

    return transfers.map(transfer => this.mapToTransferResponseDto(transfer));
  }

  private mapToResponseDto(option: Option): OptionResponseDto {
    return {
      id: option.id,
      symbol: option.symbol,
      strikePrice: option.strikePrice,
      expirationDate: option.expirationDate,
      optionType: option.optionType,
      premium: option.premium,
      quantity: option.quantity,
      underlyingAsset: option.underlyingAsset,
      blockchainAddress: option.blockchainAddress,
      tokenId: option.tokenId,
      status: option.status,
      currentOwnerId: option.currentOwnerId,
      metadata: option.metadata,
      createdAt: option.createdAt,
      updatedAt: option.updatedAt,
    };
  }

  private mapToWithOwnerDto(option: Option): OptionWithOwnerDto {
    return {
      ...this.mapToResponseDto(option),
      currentOwner: {
        id: option.currentOwner.id,
        name: option.currentOwner.name,
        code: option.currentOwner.code,
        blockchainAddress: option.currentOwner.blockchainAddress,
      },
    };
  }

  private mapToTransferResponseDto(transfer: OptionTransfer): TransferResponseDto {
    return {
      transferId: transfer.id,
      optionId: transfer.optionId,
      fromBankId: transfer.fromBankId,
      toBankId: transfer.toBankId,
      status: transfer.status,
      transactionHash: transfer.transactionHash,
      createdAt: transfer.createdAt,
    };
  }
} 
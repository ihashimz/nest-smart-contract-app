import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bank } from './entities/bank.entity';
import { CreateBankDto, UpdateBankDto, BankResponseDto } from './dto/bank.dto';
import { Not } from 'typeorm';

@Injectable()
export class BanksService {
  constructor(
    @InjectRepository(Bank)
    private readonly bankRepository: Repository<Bank>,
  ) {}

  async create(createBankDto: CreateBankDto): Promise<BankResponseDto> {
    // Check if bank with same name or blockchain address already exists
    const existingBank = await this.bankRepository.findOne({
      where: [
        { name: createBankDto.name },
        { blockchainAddress: createBankDto.blockchainAddress },
      ],
    });

    if (existingBank) {
      throw new ConflictException('Bank with this name or blockchain address already exists');
    }

    const bank = this.bankRepository.create(createBankDto);
    const savedBank = await this.bankRepository.save(bank);
    
    return this.mapToResponseDto(savedBank);
  }

  async findAll(): Promise<BankResponseDto[]> {
    const banks = await this.bankRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
    
    return banks.map(bank => this.mapToResponseDto(bank));
  }

  async findOne(id: string): Promise<BankResponseDto> {
    const bank = await this.bankRepository.findOne({
      where: { id, isActive: true },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    return this.mapToResponseDto(bank);
  }

  async findByBlockchainAddress(address: string): Promise<BankResponseDto> {
    const bank = await this.bankRepository.findOne({
      where: { blockchainAddress: address, isActive: true },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with blockchain address ${address} not found`);
    }

    return this.mapToResponseDto(bank);
  }

  async update(id: string, updateBankDto: UpdateBankDto): Promise<BankResponseDto> {
    const bank = await this.bankRepository.findOne({
      where: { id, isActive: true },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    // Check for conflicts if name or blockchain address is being updated
    if (updateBankDto.name || updateBankDto.blockchainAddress) {
      const existingBank = await this.bankRepository.findOne({
        where: [
          { name: updateBankDto.name || bank.name, id: Not(id) },
          { blockchainAddress: updateBankDto.blockchainAddress || bank.blockchainAddress, id: Not(id) },
        ],
      });

      if (existingBank) {
        throw new ConflictException('Bank with this name or blockchain address already exists');
      }
    }

    Object.assign(bank, updateBankDto);
    const updatedBank = await this.bankRepository.save(bank);
    
    return this.mapToResponseDto(updatedBank);
  }

  async remove(id: string): Promise<void> {
    const bank = await this.bankRepository.findOne({
      where: { id, isActive: true },
    });

    if (!bank) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    bank.isActive = false;
    await this.bankRepository.save(bank);
  }

  private mapToResponseDto(bank: Bank): BankResponseDto {
    return {
      id: bank.id,
      name: bank.name,
      code: bank.code,
      blockchainAddress: bank.blockchainAddress,
      description: bank.description,
      isActive: bank.isActive,
      metadata: bank.metadata,
      createdAt: bank.createdAt,
      updatedAt: bank.updatedAt,
    };
  }
} 
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  gasUsed: number;
  gasPrice: string;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private configService: ConfigService) {
    this.initializeProvider();
  }

  private initializeProvider(): void {
    const rpcUrl = this.configService.get<string>('BLOCKCHAIN_RPC_URL');
    const privateKey = this.configService.get<string>('PRIVATE_KEY');
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

    if (!rpcUrl || !privateKey || !contractAddress) {
      this.logger.error('Missing blockchain configuration');
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      
      // Basic ERC-721 ABI for option transfers
      const abi = [
        'function transferFrom(address from, address to, uint256 tokenId) external',
        'function ownerOf(uint256 tokenId) external view returns (address)',
        'function safeTransferFrom(address from, address to, uint256 tokenId) external',
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
      ];

      this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
      this.logger.log('Blockchain provider initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain provider', error);
    }
  }

  async transferOption(
    contractAddress: string,
    tokenId: string,
    toAddress: string,
  ): Promise<TransactionResult> {
    try {
      this.logger.log(`Initiating transfer of token ${tokenId} to ${toAddress}`);

      // Validate addresses
      if (!ethers.isAddress(contractAddress)) {
        throw new Error('Invalid contract address');
      }
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Create contract instance for the specific option contract
      const optionContract = new ethers.Contract(
        contractAddress,
        this.contract.interface.fragments,
        this.wallet,
      );

      // Estimate gas for the transaction
      const gasEstimate = await optionContract.safeTransferFrom.estimateGas(
        this.wallet.address,
        toAddress,
        tokenId,
      );

      // Execute the transfer
      const tx = await optionContract.safeTransferFrom(
        this.wallet.address,
        toAddress,
        tokenId,
        {
          gasLimit: gasEstimate,
        },
      );

      this.logger.log(`Transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      this.logger.log(`Transaction confirmed in block ${receipt.blockNumber}`);

      return {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        gasPrice: tx.gasPrice.toString(),
      };
    } catch (error) {
      this.logger.error('Transfer failed', error);
      throw new Error(`Blockchain transfer failed: ${error.message}`);
    }
  }

  async getTransactionStatus(txHash: string): Promise<any> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        confirmations: receipt.confirmations,
      };
    } catch (error) {
      this.logger.error('Failed to get transaction status', error);
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  async getOptionOwner(contractAddress: string, tokenId: string): Promise<string> {
    try {
      const optionContract = new ethers.Contract(
        contractAddress,
        this.contract.interface.fragments,
        this.provider,
      );

      const owner = await optionContract.ownerOf(tokenId);
      return owner;
    } catch (error) {
      this.logger.error('Failed to get option owner', error);
      throw new Error(`Failed to get option owner: ${error.message}`);
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    return ethers.isAddress(address);
  }

  async getNetworkInfo(): Promise<any> {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      
      return {
        chainId: network.chainId,
        name: network.name,
        blockNumber,
      };
    } catch (error) {
      this.logger.error('Failed to get network info', error);
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }
} 
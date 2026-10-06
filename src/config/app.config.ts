import { registerAs } from '@nestjs/config';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  blockchainRpcUrl: string;
  privateKey: string;
  contractAddress: string;
  chainId: number;
}

export default registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    blockchainRpcUrl:
      process.env.BLOCKCHAIN_RPC_URL || 'https://polygon-rpc.com',
    privateKey: process.env.PRIVATE_KEY || '',
    contractAddress: process.env.CONTRACT_ADDRESS || '',
    chainId: parseInt(process.env.CHAIN_ID || '137', 10),
  }),
);

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const CRONOS_TESTNET_CHAIN_ID = 338;
export const CRONOS_TESTNET_RPC = 'https://evm-t3.cronos.org';
export const CRONOS_EXPLORER = 'https://cronos.org/explorer/testnet3';

export const ESCROW_CONTRACT_ADDRESS = '0x92c4f6C65a1b1A547589f6a7EbF9cBf98982150b';
// Use a valid test address that can receive CRO
export const VAULT_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000001';

export const ORDER_STATUS = {
  CREATED: 'CREATED',
  FUNDED: 'FUNDED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED',
  REFUNDED: 'REFUNDED'
} as const;

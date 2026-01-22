import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

class ContractService {
  private provider: ethers.JsonRpcProvider;
  private escrowContract: ethers.Contract | null = null;
  private vaultContract: ethers.Contract | null = null;

  constructor() {
    const rpcUrl = process.env.CRONOS_RPC || 'https://evm-t3.cronos.org';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.initializeContracts();
  }

  private async initializeContracts() {
    try {
      const deployedPath = path.join(__dirname, '../../contracts/deployed.json');
      const deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf8'));

      // Load ABIs (assuming they exist)
      const escrowAbiPath = path.join(__dirname, '../config/abi/Escrow.json');
      const vaultAbiPath = path.join(__dirname, '../config/abi/Vault.json');

      if (fs.existsSync(escrowAbiPath) && fs.existsSync(vaultAbiPath)) {
        const escrowAbi = JSON.parse(fs.readFileSync(escrowAbiPath, 'utf8')).abi;
        const vaultAbi = JSON.parse(fs.readFileSync(vaultAbiPath, 'utf8')).abi;

        this.escrowContract = new ethers.Contract(deployed.escrow, escrowAbi, this.provider);
        this.vaultContract = new ethers.Contract(deployed.vault, vaultAbi, this.provider);
      }
    } catch (error) {
      console.warn('Contract initialization failed:', error);
    }
  }

  async getEscrowStatus(orderId: string) {
    if (!this.escrowContract) return null;
    try {
      const order = await this.escrowContract.orders(orderId);
      return {
        buyer: order.buyer,
        seller: order.seller,
        token: order.token,
        amount: order.amount.toString(),
        status: order.status,
        createdAt: order.createdAt.toString(),
      };
    } catch (error) {
      console.error('Error getting escrow status:', error);
      return null;
    }
  }

  async getVaultBalance(walletAddress: string, tokenAddress: string = '0x0000000000000000000000000000000000000000') {
    if (!this.vaultContract) return '0';
    try {
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        const balance = await this.vaultContract.nativeBalances(walletAddress);
        return balance.toString();
      } else {
        const balance = await this.vaultContract.tokenBalances(walletAddress, tokenAddress);
        return balance.toString();
      }
    } catch (error) {
      console.error('Error getting vault balance:', error);
      return '0';
    }
  }

  async verifyTx(txHash: string) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return {
        exists: !!tx,
        confirmed: !!receipt,
        status: receipt?.status,
        blockNumber: receipt?.blockNumber,
      };
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return { exists: false, confirmed: false };
    }
  }
}

export default new ContractService();
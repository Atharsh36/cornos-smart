import { createPublicClient, http, parseAbiItem, Log } from 'viem';
import { cronosTestnet } from 'viem/chains';
import { ContractEvent } from '../types';
import { AuditLog } from '../models/AuditLog';

export class ContractMonitorService {
  private client;
  private escrowAddress: string;
  private vaultAddress: string;

  constructor() {
    this.client = createPublicClient({
      chain: cronosTestnet,
      transport: http(process.env.CRONOS_RPC)
    });
    this.escrowAddress = process.env.ESCROW_ADDRESS!;
    this.vaultAddress = process.env.VAULT_ADDRESS!;
  }

  async scanEscrowEvents(fromBlock: bigint, toBlock: bigint): Promise<ContractEvent[]> {
    try {
      const events: ContractEvent[] = [];

      // Define event signatures
      const eventSignatures = [
        'event OrderFunded(bytes32 indexed orderId, address indexed buyer, address indexed seller, uint256 amount)',
        'event OrderShipped(bytes32 indexed orderId)',
        'event OrderDelivered(bytes32 indexed orderId)',
        'event FundsReleased(bytes32 indexed orderId, address indexed seller, uint256 amount)',
        'event Disputed(bytes32 indexed orderId, address indexed disputer)',
        'event Refunded(bytes32 indexed orderId, address indexed buyer, uint256 amount)'
      ];

      for (const signature of eventSignatures) {
        try {
          const logs = await this.client.getLogs({
            address: this.escrowAddress as `0x${string}`,
            event: parseAbiItem(signature),
            fromBlock,
            toBlock
          });

          for (const log of logs) {
            const block = await this.client.getBlock({ blockNumber: log.blockNumber });
            events.push({
              eventName: signature.split(' ')[1].split('(')[0],
              blockNumber: Number(log.blockNumber),
              transactionHash: log.transactionHash,
              args: log.args,
              timestamp: new Date(Number(block.timestamp) * 1000)
            });
          }
        } catch (error) {
          console.error(`Error scanning event ${signature}:`, error);
        }
      }

      // Log scan results
      await AuditLog.create({
        type: 'contract_scan',
        contractAddress: this.escrowAddress,
        blockNumber: Number(toBlock),
        metadata: { eventsFound: events.length, fromBlock: Number(fromBlock) },
        severity: 'info'
      });

      return events.sort((a, b) => a.blockNumber - b.blockNumber);
    } catch (error) {
      await AuditLog.create({
        type: 'contract_scan',
        contractAddress: this.escrowAddress,
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'error'
      });
      throw error;
    }
  }

  async getLatestBlockNumber(): Promise<bigint> {
    return await this.client.getBlockNumber();
  }

  async getContractBalance(address: string): Promise<bigint> {
    return await this.client.getBalance({ address: address as `0x${string}` });
  }
}
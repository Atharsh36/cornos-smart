import axios from 'axios';
import { X402PaymentRequest, DeepScanResult } from '../types';
import { AuditLog } from '../models/AuditLog';
import { Order } from '../../models/Order';
import { ContractMonitorService } from './ContractMonitorService';

export class X402PaymentService {
  private facilitatorUrl: string;
  private contractMonitor: ContractMonitorService;

  constructor() {
    this.facilitatorUrl = process.env.X402_FACILITATOR_URL || 'https://facilitator.cronos.org';
    this.contractMonitor = new ContractMonitorService();
  }

  generatePaymentRequest(feature: string, amount: string): X402PaymentRequest {
    return {
      amount,
      token: process.env.DEEP_SCAN_TOKEN || 'USDC',
      receiver: process.env.PLATFORM_RECEIVER_WALLET!,
      memo: `CronoSmart-${feature}-${Date.now()}`,
      paymentId: `payment-${feature}-${Date.now()}`
    };
  }

  async verifyPayment(txHash: string): Promise<boolean> {
    try {
      // Simple verification - check if transaction exists on Cronos
      const response = await axios.post(process.env.CRONOS_RPC!, {
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1
      });

      const tx = response.data.result;
      if (!tx) return false;

      // Verify transaction is to our receiver wallet
      const isValidReceiver = tx.to?.toLowerCase() === process.env.PLATFORM_RECEIVER_WALLET?.toLowerCase();
      
      // Verify minimum amount (simplified - in production, check exact token transfer)
      const minValue = BigInt('20000000000000000'); // 0.02 ETH equivalent
      const txValue = BigInt(tx.value || '0');
      const isValidAmount = txValue >= minValue;

      const isValid = isValidReceiver && isValidAmount;

      // Log verification attempt
      await AuditLog.create({
        type: 'fraud_detection',
        metadata: {
          txHash,
          verified: isValid,
          receiver: tx.to,
          value: tx.value
        },
        severity: isValid ? 'info' : 'warning'
      });

      return isValid;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  async performDeepScan(orderId: string): Promise<DeepScanResult> {
    try {
      // Get order from database
      const order = await Order.findById(orderId).lean();
      if (!order) {
        throw new Error('Order not found');
      }

      // Get blockchain events for this order
      const latestBlock = await this.contractMonitor.getLatestBlockNumber();
      const events = await this.contractMonitor.scanEscrowEvents(latestBlock - 5000n, latestBlock);
      const orderEvents = events.filter(e => 
        e.args && e.args.orderId && e.args.orderId.toString().includes(orderId)
      );

      // Analyze timing patterns
      const timingScore = this.analyzeTimingPatterns(order, orderEvents);
      
      // Analyze value patterns
      const valueScore = this.analyzeValuePatterns(order);
      
      // Analyze behavioral patterns
      const patternScore = await this.analyzeBehavioralPatterns(order);
      
      // Analyze blockchain consistency
      const blockchainScore = this.analyzeBlockchainConsistency(order, orderEvents);

      const overallRisk = Math.round((timingScore + valueScore + patternScore + blockchainScore) / 4);

      const findings: string[] = [];
      const recommendations: string[] = [];

      if (timingScore > 70) {
        findings.push('Suspicious timing patterns detected');
        recommendations.push('Manual review of shipping timeline');
      }

      if (valueScore > 70) {
        findings.push('Unusual transaction value patterns');
        recommendations.push('Verify order value against market rates');
      }

      if (patternScore > 70) {
        findings.push('Behavioral anomalies detected');
        recommendations.push('Review user transaction history');
      }

      if (blockchainScore > 70) {
        findings.push('Blockchain inconsistencies found');
        recommendations.push('Verify smart contract interactions');
      }

      const result: DeepScanResult = {
        orderId,
        riskAssessment: {
          overall: overallRisk,
          factors: {
            timing: timingScore,
            value: valueScore,
            pattern: patternScore,
            blockchain: blockchainScore
          }
        },
        findings,
        recommendations,
        confidence: Math.min(95, Math.max(60, 100 - (findings.length * 10)))
      };

      // Log deep scan
      await AuditLog.create({
        type: 'fraud_detection',
        metadata: {
          orderId,
          deepScan: true,
          riskScore: overallRisk,
          findings: findings.length
        },
        severity: overallRisk > 70 ? 'warning' : 'info'
      });

      return result;
    } catch (error) {
      console.error('Deep scan error:', error);
      throw error;
    }
  }

  private analyzeTimingPatterns(order: any, events: any[]): number {
    let riskScore = 0;

    // Check if shipped too quickly after funding
    const fundedEvent = events.find(e => e.eventName === 'OrderFunded');
    const shippedEvent = events.find(e => e.eventName === 'OrderShipped');

    if (fundedEvent && shippedEvent) {
      const timeDiff = shippedEvent.timestamp.getTime() - fundedEvent.timestamp.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff < 1) {
        riskScore += 40; // Very suspicious
      } else if (hoursDiff < 6) {
        riskScore += 20; // Somewhat suspicious
      }
    }

    return Math.min(100, riskScore);
  }

  private analyzeValuePatterns(order: any): number {
    let riskScore = 0;

    // Check for unusual values
    if (order.amount > 1000) {
      riskScore += 20; // High value orders are riskier
    }

    if (order.amount < 1) {
      riskScore += 30; // Very low value orders can be test transactions
    }

    // Check for round numbers (potential fake orders)
    if (order.amount % 100 === 0 && order.amount > 100) {
      riskScore += 15;
    }

    return Math.min(100, riskScore);
  }

  private async analyzeBehavioralPatterns(order: any): Promise<number> {
    let riskScore = 0;

    try {
      // Check buyer's order history
      const buyerOrders = await Order.find({ buyer: order.buyer }).lean();
      
      // New buyer with high-value order
      if (buyerOrders.length === 1 && order.amount > 500) {
        riskScore += 25;
      }

      // Multiple orders in short time
      const recentOrders = buyerOrders.filter(o => 
        new Date(o.createdAt).getTime() > Date.now() - (24 * 60 * 60 * 1000)
      );
      
      if (recentOrders.length > 5) {
        riskScore += 20;
      }

      // Check seller's history
      const sellerOrders = await Order.find({ seller: order.seller }).lean();
      const disputedSellerOrders = sellerOrders.filter(o => o.status === 'DISPUTED');
      
      if (disputedSellerOrders.length / sellerOrders.length > 0.2) {
        riskScore += 30;
      }

    } catch (error) {
      console.error('Error analyzing behavioral patterns:', error);
    }

    return Math.min(100, riskScore);
  }

  private analyzeBlockchainConsistency(order: any, events: any[]): number {
    let riskScore = 0;

    // Check if order status matches blockchain events
    const hasExpectedEvents = this.hasExpectedEventsForStatus(order.status, events);
    if (!hasExpectedEvents) {
      riskScore += 40;
    }

    // Check for missing events
    if (order.status === 'COMPLETED' && !events.some(e => e.eventName === 'FundsReleased')) {
      riskScore += 50;
    }

    return Math.min(100, riskScore);
  }

  private hasExpectedEventsForStatus(status: string, events: any[]): boolean {
    switch (status) {
      case 'FUNDED':
        return events.some(e => e.eventName === 'OrderFunded');
      case 'SHIPPED':
        return events.some(e => e.eventName === 'OrderShipped');
      case 'DELIVERED':
        return events.some(e => e.eventName === 'OrderDelivered');
      case 'COMPLETED':
        return events.some(e => e.eventName === 'FundsReleased');
      case 'DISPUTED':
        return events.some(e => e.eventName === 'Disputed');
      case 'REFUNDED':
        return events.some(e => e.eventName === 'Refunded');
      default:
        return true;
    }
  }
}
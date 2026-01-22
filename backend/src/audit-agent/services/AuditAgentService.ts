import { ContractMonitorService } from './ContractMonitorService';
import { HealthMonitorService } from './HealthMonitorService';
import { FraudDetectionService } from './FraudDetectionService';
import { AuditLog } from '../models/AuditLog';
import { AuditAlert } from '../models/AuditAlert';
import { Order } from '../../models/Order';
import { AuditReport, OrderMismatch } from '../types';

export class AuditAgentService {
  private contractMonitor: ContractMonitorService;
  private healthMonitor: HealthMonitorService;
  private fraudDetection: FraudDetectionService;
  private isRunning: boolean = false;
  private intervalId?: NodeJS.Timeout;

  constructor() {
    this.contractMonitor = new ContractMonitorService();
    this.healthMonitor = new HealthMonitorService();
    this.fraudDetection = new FraudDetectionService();
  }

  // Cronos Agent SDK Tool Definitions
  private tools = {
    checkBackendHealth: async () => {
      console.log('🔍 Running backend health check...');
      return await this.healthMonitor.runHealthChecks();
    },

    auditEndpoints: async () => {
      console.log('🔍 Auditing API endpoints...');
      const endpoints = ['/api/products', '/api/orders', '/health'];
      const results = [];
      for (const endpoint of endpoints) {
        results.push(await this.healthMonitor.checkEndpoint(endpoint));
      }
      return results;
    },

    scanEscrowEvents: async () => {
      console.log('🔍 Scanning escrow contract events...');
      const latestBlock = await this.contractMonitor.getLatestBlockNumber();
      const fromBlock = latestBlock - 1000n; // Last ~1000 blocks
      return await this.contractMonitor.scanEscrowEvents(fromBlock, latestBlock);
    },

    compareOrderStatus: async () => {
      console.log('🔍 Comparing order status between backend and blockchain...');
      return await this.detectOrderMismatches();
    },

    fraudRiskScoring: async () => {
      console.log('🔍 Running fraud risk analysis...');
      return await this.fraudDetection.detectFraudPatterns();
    },

    generateReport: async () => {
      console.log('🔍 Generating audit report...');
      return await this.generateAuditReport();
    }
  };

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ Audit agent is already running');
      return;
    }

    console.log('🚀 Starting CronoSmart Audit Agent...');
    this.isRunning = true;

    // Run initial audit
    await this.runFullAudit();

    // Set up periodic monitoring
    const intervalSeconds = parseInt(process.env.AUDIT_INTERVAL_SECONDS || '30');
    this.intervalId = setInterval(async () => {
      try {
        await this.runPeriodicChecks();
      } catch (error) {
        console.error('Error in periodic checks:', error);
      }
    }, intervalSeconds * 1000);

    console.log(`✅ Audit agent started with ${intervalSeconds}s interval`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log('🛑 Stopping audit agent...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('✅ Audit agent stopped');
  }

  async runFullAudit(): Promise<void> {
    console.log('🔄 Running full audit cycle...');
    
    try {
      // Run all tools
      await this.tools.checkBackendHealth();
      await this.tools.scanEscrowEvents();
      await this.tools.compareOrderStatus();
      await this.tools.fraudRiskScoring();
      
      console.log('✅ Full audit cycle completed');
    } catch (error) {
      console.error('❌ Error in full audit:', error);
      await AuditLog.create({
        type: 'health_check',
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'error'
      });
    }
  }

  private async runPeriodicChecks(): Promise<void> {
    // Light checks every interval
    await this.tools.checkBackendHealth();
    
    // Heavy checks less frequently
    const now = new Date();
    if (now.getMinutes() % 5 === 0) { // Every 5 minutes
      await this.tools.scanEscrowEvents();
      await this.tools.compareOrderStatus();
    }
    
    if (now.getMinutes() % 15 === 0) { // Every 15 minutes
      await this.tools.fraudRiskScoring();
    }
  }

  private async detectOrderMismatches(): Promise<OrderMismatch[]> {
    const mismatches: OrderMismatch[] = [];
    
    try {
      // Get recent orders from database
      const recentOrders = await Order.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      }).lean();

      // Get blockchain events
      const latestBlock = await this.contractMonitor.getLatestBlockNumber();
      const events = await this.contractMonitor.scanEscrowEvents(latestBlock - 2000n, latestBlock);

      // Compare statuses
      for (const order of recentOrders) {
        const orderEvents = events.filter(e => 
          e.args && e.args.orderId && e.args.orderId.toString().includes(order.id)
        );

        let blockchainStatus = 'CREATED';
        if (orderEvents.some(e => e.eventName === 'OrderFunded')) blockchainStatus = 'FUNDED';
        if (orderEvents.some(e => e.eventName === 'OrderShipped')) blockchainStatus = 'SHIPPED';
        if (orderEvents.some(e => e.eventName === 'OrderDelivered')) blockchainStatus = 'DELIVERED';
        if (orderEvents.some(e => e.eventName === 'FundsReleased')) blockchainStatus = 'COMPLETED';
        if (orderEvents.some(e => e.eventName === 'Disputed')) blockchainStatus = 'DISPUTED';
        if (orderEvents.some(e => e.eventName === 'Refunded')) blockchainStatus = 'REFUNDED';

        if (order.status !== blockchainStatus) {
          const mismatch: OrderMismatch = {
            orderId: order.id,
            backendStatus: order.status,
            blockchainStatus,
            severity: this.getMismatchSeverity(order.status, blockchainStatus),
            recommendedAction: `Update order ${order.id} status from ${order.status} to ${blockchainStatus}`
          };

          mismatches.push(mismatch);

          // Create alert
          await AuditAlert.create({
            alertId: `mismatch-${order.id}-${Date.now()}`,
            type: 'mismatch',
            title: 'Order Status Mismatch',
            description: `Order ${order.id}: Backend shows ${order.status}, blockchain shows ${blockchainStatus}`,
            severity: mismatch.severity,
            orderId: order.id,
            metadata: { backendStatus: order.status, blockchainStatus },
            recommendedAction: mismatch.recommendedAction
          });
        }
      }

      return mismatches;
    } catch (error) {
      console.error('Error detecting order mismatches:', error);
      return [];
    }
  }

  private getMismatchSeverity(backendStatus: string, blockchainStatus: string): 'low' | 'medium' | 'high' {
    // Critical mismatches
    if (backendStatus === 'COMPLETED' && blockchainStatus !== 'COMPLETED') return 'high';
    if (backendStatus === 'REFUNDED' && blockchainStatus !== 'REFUNDED') return 'high';
    
    // Medium mismatches
    if (backendStatus === 'SHIPPED' && blockchainStatus === 'FUNDED') return 'medium';
    
    // Low priority mismatches
    return 'low';
  }

  async generateAuditReport(): Promise<AuditReport> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    // Get metrics
    const logs = await AuditLog.find({
      timestamp: { $gte: startDate, $lte: endDate }
    }).lean();

    const healthLogs = logs.filter(l => l.type === 'health_check' || l.type === 'endpoint_test');
    const upCount = healthLogs.filter(l => l.statusCode && l.statusCode < 400).length;
    const uptime = healthLogs.length > 0 ? (upCount / healthLogs.length) * 100 : 100;

    const avgResponseTime = healthLogs.length > 0 
      ? healthLogs.reduce((sum, l) => sum + (l.responseTime || 0), 0) / healthLogs.length 
      : 0;

    const errorRate = logs.filter(l => l.severity === 'error').length / Math.max(logs.length, 1) * 100;

    // Get alerts
    const alerts = await AuditAlert.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean();

    const alertCounts = {
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length
    };

    // Get top risky wallets
    const topRiskyWallets = await this.getTopRiskyWallets();

    const report: AuditReport = {
      reportId: `audit-${Date.now()}`,
      period: { start: startDate, end: endDate },
      metrics: {
        uptime: Math.round(uptime * 100) / 100,
        avgResponseTime: Math.round(avgResponseTime),
        errorRate: Math.round(errorRate * 100) / 100,
        escrowSuccessRate: 95, // TODO: Calculate from actual data
        disputeRate: 5 // TODO: Calculate from actual data
      },
      alerts: alertCounts,
      topRiskyWallets,
      recommendations: this.generateRecommendations(alertCounts, uptime, errorRate),
      generatedAt: new Date()
    };

    return report;
  }

  private async getTopRiskyWallets() {
    const { RiskScore } = await import('../models/RiskScore');
    return await RiskScore.find({ flagged: true })
      .sort({ riskScore: -1 })
      .limit(10)
      .select('walletAddress riskScore userType')
      .lean()
      .then(scores => scores.map(s => ({
        address: s.walletAddress,
        riskScore: s.riskScore,
        type: s.userType as 'buyer' | 'seller'
      })));
  }

  private generateRecommendations(alerts: any, uptime: number, errorRate: number): string[] {
    const recommendations: string[] = [];

    if (uptime < 99) {
      recommendations.push('Investigate backend stability issues - uptime below 99%');
    }

    if (errorRate > 5) {
      recommendations.push('High error rate detected - review application logs');
    }

    if (alerts.critical > 0) {
      recommendations.push('Address critical alerts immediately');
    }

    if (alerts.high > 5) {
      recommendations.push('Review high-priority alerts and implement fixes');
    }

    return recommendations;
  }
}
import { FraudPattern } from '../types';
import { RiskScore } from '../models/RiskScore';
import { AuditAlert } from '../models/AuditAlert';
import { Order } from '../../models/Order';

export class FraudDetectionService {
  async analyzeWalletRisk(walletAddress: string, userType: 'buyer' | 'seller'): Promise<number> {
    try {
      // Get all orders for this wallet
      const orders = await Order.find({
        [userType]: walletAddress
      }).lean();

      if (orders.length === 0) {
        return 50; // Neutral score for new users
      }

      let riskScore = 0;
      const factors = {
        disputeRate: 0,
        refundRate: 0,
        orderCount: orders.length,
        avgOrderValue: 0,
        accountAge: 0,
        suspiciousPatterns: [] as string[]
      };

      // Calculate dispute rate
      const disputedOrders = orders.filter(o => o.status === 'DISPUTED').length;
      factors.disputeRate = disputedOrders / orders.length;

      // Calculate refund rate
      const refundedOrders = orders.filter(o => o.status === 'REFUNDED').length;
      factors.refundRate = refundedOrders / orders.length;

      // Calculate average order value
      factors.avgOrderValue = orders.reduce((sum, o) => sum + o.amount, 0) / orders.length;

      // Calculate account age (days since first order)
      const firstOrder = orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
      factors.accountAge = Math.floor((Date.now() - new Date(firstOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24));

      // Risk scoring algorithm
      riskScore = 50; // Base score

      // High dispute rate increases risk
      if (factors.disputeRate > 0.3) {
        riskScore += 30;
        factors.suspiciousPatterns.push('High dispute rate');
      } else if (factors.disputeRate > 0.1) {
        riskScore += 15;
      }

      // High refund rate increases risk
      if (factors.refundRate > 0.2) {
        riskScore += 25;
        factors.suspiciousPatterns.push('High refund rate');
      }

      // Very new accounts are riskier
      if (factors.accountAge < 7) {
        riskScore += 20;
        factors.suspiciousPatterns.push('New account');
      }

      // Unusual order values
      if (factors.avgOrderValue > 1000) {
        riskScore += 10;
        factors.suspiciousPatterns.push('High value orders');
      }

      // Many orders in short time (velocity check)
      const recentOrders = orders.filter(o => 
        new Date(o.createdAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
      );
      if (recentOrders.length > 10) {
        riskScore += 15;
        factors.suspiciousPatterns.push('High order velocity');
      }

      // Cap at 100
      riskScore = Math.min(100, Math.max(0, riskScore));

      const riskLevel = riskScore >= 80 ? 'critical' : 
                       riskScore >= 60 ? 'high' : 
                       riskScore >= 40 ? 'medium' : 'low';

      // Update or create risk score
      await RiskScore.findOneAndUpdate(
        { walletAddress },
        {
          walletAddress,
          userType,
          riskScore,
          riskLevel,
          factors,
          lastUpdated: new Date(),
          flagged: riskScore >= 70
        },
        { upsert: true, new: true }
      );

      // Create alert for high-risk users
      if (riskScore >= 70) {
        await AuditAlert.create({
          alertId: `risk-${walletAddress}-${Date.now()}`,
          type: 'fraud',
          title: `High Risk ${userType} Detected`,
          description: `Wallet ${walletAddress} has risk score ${riskScore}. Patterns: ${factors.suspiciousPatterns.join(', ')}`,
          severity: riskScore >= 80 ? 'critical' : 'high',
          walletAddress,
          metadata: { riskScore, factors },
          recommendedAction: riskScore >= 80 ? 'Suspend account pending review' : 'Monitor closely'
        });
      }

      return riskScore;
    } catch (error) {
      console.error('Error analyzing wallet risk:', error);
      return 50; // Return neutral score on error
    }
  }

  async detectFraudPatterns(): Promise<FraudPattern[]> {
    const patterns: FraudPattern[] = [];

    try {
      // Find wallets with multiple disputes
      const disputeAggregation = await Order.aggregate([
        { $match: { status: 'DISPUTED' } },
        { $group: { _id: '$buyer', count: { $sum: 1 } } },
        { $match: { count: { $gte: 3 } } }
      ]);

      for (const result of disputeAggregation) {
        patterns.push({
          type: 'repeated_disputes',
          walletAddress: result._id,
          confidence: Math.min(100, result.count * 20),
          evidence: [`${result.count} disputed orders`],
          riskScore: await this.analyzeWalletRisk(result._id, 'buyer')
        });
      }

      // Find rapid refund patterns
      const rapidRefunds = await Order.aggregate([
        { $match: { status: 'REFUNDED' } },
        { $group: { 
          _id: '$buyer', 
          count: { $sum: 1 },
          avgDays: { $avg: { $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60 * 24] } }
        }},
        { $match: { count: { $gte: 2 }, avgDays: { $lt: 2 } } }
      ]);

      for (const result of rapidRefunds) {
        patterns.push({
          type: 'rapid_refunds',
          walletAddress: result._id,
          confidence: 80,
          evidence: [`${result.count} refunds averaging ${result.avgDays.toFixed(1)} days`],
          riskScore: await this.analyzeWalletRisk(result._id, 'buyer')
        });
      }

      return patterns;
    } catch (error) {
      console.error('Error detecting fraud patterns:', error);
      return [];
    }
  }
}
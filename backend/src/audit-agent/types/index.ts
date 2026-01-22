export interface HealthCheckResult {
  endpoint: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
  statusCode?: number;
  error?: string;
  timestamp: Date;
}

export interface ContractEvent {
  eventName: string;
  blockNumber: number;
  transactionHash: string;
  args: any;
  timestamp: Date;
}

export interface OrderMismatch {
  orderId: string;
  backendStatus: string;
  blockchainStatus: string;
  severity: 'low' | 'medium' | 'high';
  recommendedAction: string;
}

export interface FraudPattern {
  type: 'repeated_disputes' | 'rapid_refunds' | 'suspicious_shipping' | 'value_anomaly';
  walletAddress: string;
  confidence: number;
  evidence: string[];
  riskScore: number;
}

export interface AuditReport {
  reportId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    uptime: number;
    avgResponseTime: number;
    errorRate: number;
    escrowSuccessRate: number;
    disputeRate: number;
  };
  alerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  topRiskyWallets: Array<{
    address: string;
    riskScore: number;
    type: 'buyer' | 'seller';
  }>;
  recommendations: string[];
  generatedAt: Date;
}

export interface X402PaymentRequest {
  amount: string;
  token: string;
  receiver: string;
  memo: string;
  paymentId: string;
}

export interface DeepScanResult {
  orderId: string;
  riskAssessment: {
    overall: number;
    factors: {
      timing: number;
      value: number;
      pattern: number;
      blockchain: number;
    };
  };
  findings: string[];
  recommendations: string[];
  confidence: number;
}
import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  timestamp: Date;
  type: 'health_check' | 'endpoint_test' | 'contract_scan' | 'fraud_detection';
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  contractAddress?: string;
  blockNumber?: number;
  eventName?: string;
  metadata?: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

const AuditLogSchema = new Schema<IAuditLog>({
  timestamp: { type: Date, default: Date.now, index: true },
  type: { type: String, required: true, index: true },
  endpoint: String,
  method: String,
  statusCode: Number,
  responseTime: Number,
  error: String,
  contractAddress: String,
  blockNumber: Number,
  eventName: String,
  metadata: Schema.Types.Mixed,
  severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'info', index: true }
}, {
  timestamps: true
});

// TTL index to auto-delete logs after 30 days
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
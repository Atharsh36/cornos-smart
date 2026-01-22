import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditAlert extends Document {
  alertId: string;
  type: 'mismatch' | 'fraud' | 'downtime' | 'performance' | 'security';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  orderId?: string;
  walletAddress?: string;
  contractAddress?: string;
  metadata?: any;
  recommendedAction?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
}

const AuditAlertSchema = new Schema<IAuditAlert>({
  alertId: { type: String, required: true, unique: true, index: true },
  type: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },
  status: { type: String, enum: ['open', 'investigating', 'resolved', 'false_positive'], default: 'open', index: true },
  orderId: String,
  walletAddress: String,
  contractAddress: String,
  metadata: Schema.Types.Mixed,
  recommendedAction: String,
  resolvedAt: Date,
  resolvedBy: String
}, {
  timestamps: true
});

export const AuditAlert = mongoose.model<IAuditAlert>('AuditAlert', AuditAlertSchema);
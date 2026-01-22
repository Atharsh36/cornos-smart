import mongoose, { Schema, Document } from 'mongoose';

export interface IRiskScore extends Document {
  walletAddress: string;
  userType: 'buyer' | 'seller';
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: {
    disputeRate: number;
    refundRate: number;
    orderCount: number;
    avgOrderValue: number;
    accountAge: number;
    suspiciousPatterns: string[];
  };
  lastUpdated: Date;
  flagged: boolean;
  notes?: string;
}

const RiskScoreSchema = new Schema<IRiskScore>({
  walletAddress: { type: String, required: true, unique: true, index: true },
  userType: { type: String, enum: ['buyer', 'seller'], required: true },
  riskScore: { type: Number, required: true, min: 0, max: 100, index: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },
  factors: {
    disputeRate: { type: Number, default: 0 },
    refundRate: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    accountAge: { type: Number, default: 0 },
    suspiciousPatterns: [String]
  },
  lastUpdated: { type: Date, default: Date.now },
  flagged: { type: Boolean, default: false, index: true },
  notes: String
}, {
  timestamps: true
});

export const RiskScore = mongoose.model<IRiskScore>('RiskScore', RiskScoreSchema);
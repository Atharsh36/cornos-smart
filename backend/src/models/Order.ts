import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  productId: mongoose.Types.ObjectId;
  buyerAddress: string;
  sellerAddress: string;
  quantity: number;
  amount: number;
  tokenAddress: string;
  paymentMode: 'CRYPTO' | 'COD';
  status: 'CREATED' | 'FUNDED' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'DISPUTED' | 'REFUNDED';
  txHash: string;
  shippingAddress: string;
  disputeReason?: string;
  evidenceUrls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    buyerAddress: { type: String, required: true, index: true },
    sellerAddress: { type: String, required: true, index: true },
    quantity: { type: Number, required: true, default: 1 },
    amount: { type: Number, required: true },
    tokenAddress: { type: String, required: true },
    paymentMode: { type: String, enum: ["CRYPTO", "COD"], default: "CRYPTO" },
    status: {
      type: String,
      enum: ["CREATED", "FUNDED", "SHIPPED", "DELIVERED", "COMPLETED", "DISPUTED", "REFUNDED"],
      default: "CREATED",
      index: true,
    },
    txHash: { type: String, default: "" },
    shippingAddress: { type: String, required: true },
    disputeReason: { type: String },
    evidenceUrls: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  sellerAddress: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  price: number;
  tokenAddress: string;
  stock: number;
  rating: number;
  deliveryDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sellerAddress: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    images: [{ type: String }],
    price: { type: Number, required: true },
    tokenAddress: { type: String, default: "0x0000000000000000000000000000000000000000" },
    stock: { type: Number, default: 1 },
    rating: { type: Number, default: 4.0 },
    deliveryDays: { type: Number, default: 3 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
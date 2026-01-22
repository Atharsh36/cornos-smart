import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  name?: string;
  phone?: string;
  address?: string;
  nonce: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    nonce: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
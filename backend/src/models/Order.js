const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true }, // bytes32 hex string
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    buyerAddress: { type: String, required: true, index: true },
    sellerAddress: { type: String, required: true, index: true },

    amount: { type: Number, required: true },
    tokenAddress: { type: String, required: true },

    paymentMode: { type: String, enum: ["CRYPTO", "COD"], default: "CRYPTO" },

    status: {
      type: String,
      enum: [
        "CREATED",
        "FUNDED",
        "SHIPPED",
        "DELIVERED",
        "COMPLETED",
        "DISPUTED",
        "REFUNDED"
      ],
      default: "CREATED",
      index: true,
    },

    txHash: { type: String, default: "" },

    shippingAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);

const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    sellerAddress: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },

    description: { type: String, default: "" },
    images: [{ type: String }],

    price: { type: Number, required: true }, // store in fiat-like for UI
    tokenAddress: { type: String, default: "0x0000000000000000000000000000000000000000" }, // CRO as default

    stock: { type: Number, default: 1 },
    rating: { type: Number, default: 4.0 },
    deliveryDays: { type: Number, default: 3 },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);

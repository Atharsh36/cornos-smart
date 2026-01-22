import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, shippingAddress } = req.body;

    if (!productId || !quantity || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, quantity, and shipping address are required',
        data: null,
      });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        data: null,
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
        data: null,
      });
    }

    const orderId = `0x${randomBytes(16).toString('hex')}`;
    const amount = product.price * quantity;

    const order = new Order({
      orderId,
      productId,
      buyerAddress: req.user?.walletAddress,
      sellerAddress: product.sellerAddress,
      quantity,
      amount,
      tokenAddress: product.tokenAddress,
      shippingAddress,
    });

    await order.save();

    // Reduce stock
    await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('productId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null,
      });
    }

    res.json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getBuyerOrders = async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ buyerAddress: wallet })
      .populate('productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ buyerAddress: wallet });

    res.json({
      success: true,
      message: 'Buyer orders retrieved successfully',
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const getSellerOrders = async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ sellerAddress: wallet })
      .populate('productId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ sellerAddress: wallet });

    res.json({
      success: true,
      message: 'Seller orders retrieved successfully',
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status, txHash } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null,
      });
    }

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      CREATED: ['FUNDED'],
      FUNDED: ['SHIPPED', 'DISPUTED'],
      SHIPPED: ['DELIVERED', 'DISPUTED'],
      DELIVERED: ['COMPLETED'],
      DISPUTED: ['REFUNDED', 'COMPLETED'],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.status} to ${status}`,
        data: null,
      });
    }

    // Authorization checks
    if (status === 'SHIPPED' && order.sellerAddress !== req.user?.walletAddress) {
      return res.status(403).json({
        success: false,
        message: 'Only seller can mark as shipped',
        data: null,
      });
    }

    if (status === 'DELIVERED' && order.buyerAddress !== req.user?.walletAddress) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer can confirm delivery',
        data: null,
      });
    }

    const updateData: any = { status };
    if (txHash) updateData.txHash = txHash;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const raiseDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { reason, evidenceUrls } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null,
      });
    }

    if (order.buyerAddress !== req.user?.walletAddress) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer can raise dispute',
        data: null,
      });
    }

    if (!['FUNDED', 'SHIPPED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot dispute order in current status',
        data: null,
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status: 'DISPUTED',
        disputeReason: reason,
        evidenceUrls: evidenceUrls || [],
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Dispute raised successfully',
      data: updatedOrder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
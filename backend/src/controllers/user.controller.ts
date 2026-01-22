import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findOne({ walletAddress: req.user?.walletAddress });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    res.json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        walletAddress: user.walletAddress,
        name: user.name,
        phone: user.phone,
        address: user.address,
        createdAt: user.createdAt,
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

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findOneAndUpdate(
      { walletAddress: req.user?.walletAddress },
      { 
        $set: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(address && { address }),
        }
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null,
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        walletAddress: user.walletAddress,
        name: user.name,
        phone: user.phone,
        address: user.address,
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
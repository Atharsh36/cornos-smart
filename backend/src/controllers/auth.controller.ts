import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import User from '../models/User';
import { AuthRequest } from '../middleware';

export const getNonce = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Valid wallet address is required',
        data: null,
      });
    }

    const nonce = Math.floor(Math.random() * 1000000).toString();

    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = new User({
        walletAddress: walletAddress.toLowerCase(),
        nonce,
      });
    } else {
      user.nonce = nonce;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Nonce generated successfully',
      data: { nonce },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};

export const verifySignature = async (req: Request, res: Response) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address and signature are required',
        data: null,
      });
    }

    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please get nonce first.',
        data: null,
      });
    }

    const message = `Sign this message to authenticate with CronoSmart: ${user.nonce}`;
    
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        return res.status(401).json({
          success: false,
          message: 'Invalid signature',
          data: null,
        });
      }
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature format',
        data: null,
      });
    }

    // Generate new nonce for next login
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();

    const token = jwt.sign(
      { walletAddress: user.walletAddress },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          walletAddress: user.walletAddress,
          name: user.name,
          phone: user.phone,
          address: user.address,
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
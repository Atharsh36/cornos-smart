import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';
import { ESCROW_CONTRACT_ADDRESS } from '../utils/constants';
import toast from 'react-hot-toast';

export interface OrderData {
  productId: string;
  sellerId: string;
  amount: string;
  quantity: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export function useOrderProcessing() {
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createOrder = async (orderData: OrderData) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsProcessing(true);
    
    try {
      // Generate unique order ID
      const orderId = keccak256(toBytes(`${address}-${orderData.productId}-${Date.now()}`));
      
      console.log('Creating order:', {
        orderId,
        seller: orderData.sellerId,
        amount: orderData.amount
      });

      // Send transaction to escrow contract
      await sendTransaction({
        to: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
        value: parseEther(orderData.amount),
        data: orderId, // Simple data payload
        gas: 100000n,
      });

      // Store order data locally for now
      const orderRecord = {
        orderId: orderId.slice(0, 10),
        ...orderData,
        buyerAddress: address,
        status: 'CREATED',
        createdAt: new Date().toISOString(),
        txHash: hash
      };

      localStorage.setItem(`order_${orderId.slice(0, 10)}`, JSON.stringify(orderRecord));
      
      toast.success('Order created successfully!');
      return orderRecord;
      
    } catch (err: any) {
      console.error('Order creation failed:', err);
      if (err.message.includes('insufficient funds')) {
        throw new Error('Insufficient funds for order');
      } else if (err.message.includes('rejected')) {
        throw new Error('Transaction rejected by user');
      } else {
        throw new Error('Order creation failed: ' + err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getOrders = () => {
    const orders = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('order_')) {
        const order = JSON.parse(localStorage.getItem(key) || '{}');
        orders.push(order);
      }
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const completeOrder = async (orderId: string) => {
    try {
      // In a real implementation, this would call the escrow contract
      const orderKey = `order_${orderId}`;
      const order = JSON.parse(localStorage.getItem(orderKey) || '{}');
      order.status = 'COMPLETED';
      order.completedAt = new Date().toISOString();
      localStorage.setItem(orderKey, JSON.stringify(order));
      
      toast.success('Order completed!');
      return order;
    } catch (error) {
      toast.error('Failed to complete order');
      throw error;
    }
  };

  return {
    createOrder,
    getOrders,
    completeOrder,
    isProcessing,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash
  };
}
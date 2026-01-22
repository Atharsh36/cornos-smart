import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { VAULT_CONTRACT_ADDRESS } from '../utils/constants';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export function useVault() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  // Get vault balance
  const { data: vaultBalance, refetch: refetchBalance } = useBalance({
    address: VAULT_CONTRACT_ADDRESS as `0x${string}`,
  });

  const { sendTransaction, data: hash, isPending, error, reset } = useSendTransaction();
  
  const { isLoading: isConfirming, isSuccess, isError: txError } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess && hash) {
      toast.success('✅ Deposit successful! Transaction confirmed.');
      refreshBalance();
      reset(); // Reset transaction state
    }
  }, [isSuccess, hash, reset]);

  // Handle transaction error
  useEffect(() => {
    if (txError) {
      toast.error('❌ Transaction failed! Please try again.');
      reset();
    }
  }, [txError, reset]);

  // Handle send transaction error
  useEffect(() => {
    if (error) {
      console.error('Send transaction error:', error);
      if (error.message.includes('insufficient funds')) {
        toast.error('❌ Insufficient funds for transaction');
      } else if (error.message.includes('rejected')) {
        toast.error('❌ Transaction rejected by user');
      } else {
        toast.error('❌ Transaction failed: ' + error.message);
      }
    }
  }, [error]);

  const deposit = async (amount: string) => {
    if (!address) {
      toast.error('❌ Wallet not connected');
      throw new Error('Wallet not connected');
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('❌ Please enter a valid amount');
      throw new Error('Invalid amount');
    }
    
    try {
      console.log('Initiating deposit:', amount, 'CRO to', VAULT_CONTRACT_ADDRESS);
      
      // Show loading toast
      toast.loading('🔄 Preparing transaction...', { id: 'deposit-loading' });
      
      // Send transaction to vault address
      sendTransaction({
        to: VAULT_CONTRACT_ADDRESS as `0x${string}`,
        value: parseEther(amount),
        gas: 21000n, // Standard gas limit for simple transfer
      });
      
      // Remove loading toast
      toast.dismiss('deposit-loading');
      toast.loading('⏳ Confirm transaction in your wallet...', { id: 'wallet-confirm' });
      
    } catch (err: any) {
      toast.dismiss('deposit-loading');
      toast.dismiss('wallet-confirm');
      console.error('Deposit error:', err);
      
      if (err.message.includes('insufficient funds')) {
        toast.error('❌ Insufficient funds for transaction');
        throw new Error('Insufficient funds for transaction');
      } else if (err.message.includes('rejected')) {
        toast.error('❌ Transaction rejected by user');
        throw new Error('Transaction rejected by user');
      } else {
        toast.error('❌ Deposit failed: ' + err.message);
        throw new Error('Deposit failed: ' + err.message);
      }
    }
  };

  // Handle pending state changes
  useEffect(() => {
    if (isPending) {
      toast.dismiss('wallet-confirm');
      toast.loading('📡 Transaction sent, waiting for confirmation...', { id: 'tx-pending' });
    } else {
      toast.dismiss('tx-pending');
    }
  }, [isPending]);

  // Handle confirming state changes
  useEffect(() => {
    if (isConfirming) {
      toast.loading('⏳ Transaction confirming on blockchain...', { id: 'tx-confirming' });
    } else {
      toast.dismiss('tx-confirming');
    }
  }, [isConfirming]);

  const refreshBalance = () => {
    refetchBalance();
    queryClient.invalidateQueries({ queryKey: ['vault-balance'] });
  };

  return {
    vaultBalance: vaultBalance ? formatEther(vaultBalance.value) : '0',
    vaultBalanceRaw: vaultBalance?.value || 0n,
    deposit,
    refreshBalance,
    isPending,
    isConfirming,
    isSuccess,
    isError: txError || !!error,
    hash,
    error: error || (txError ? new Error('Transaction failed') : null),
  };
}
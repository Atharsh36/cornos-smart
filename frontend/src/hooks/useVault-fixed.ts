import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, isAddress } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { VAULT_CONTRACT_ADDRESS } from '../utils/constants';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export function useVault() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  
  // Validate vault address
  if (!isAddress(VAULT_CONTRACT_ADDRESS)) {
    console.error('Invalid vault address:', VAULT_CONTRACT_ADDRESS);
  }
  
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
      toast.success('✅ Deposit successful! CRO sent to vault.');
      refreshBalance();
    }
  }, [isSuccess, hash]);

  // Handle transaction error
  useEffect(() => {
    if (txError) {
      toast.error('❌ Transaction failed on blockchain!');
    }
  }, [txError]);

  // Handle send transaction error
  useEffect(() => {
    if (error) {
      console.error('Send transaction error:', error);
      let errorMessage = '❌ Transaction failed!';
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = '❌ Insufficient CRO balance';
      } else if (error.message.includes('rejected') || error.message.includes('denied')) {
        errorMessage = '❌ Transaction rejected by user';
      } else if (error.message.includes('invalid') || error.message.includes('Invalid')) {
        errorMessage = '❌ Invalid transaction parameters';
      } else if (error.message.includes('gas')) {
        errorMessage = '❌ Gas estimation failed';
      }
      
      toast.error(errorMessage);
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
    
    if (!isAddress(VAULT_CONTRACT_ADDRESS)) {
      toast.error('❌ Invalid vault address configuration');
      throw new Error('Invalid vault address');
    }
    
    try {
      console.log('Sending', amount, 'CRO to vault:', VAULT_CONTRACT_ADDRESS);
      
      // Reset any previous errors
      reset();
      
      // Send simple CRO transfer
      sendTransaction({
        to: VAULT_CONTRACT_ADDRESS as `0x${string}`,
        value: parseEther(amount),
      });
      
    } catch (err: any) {
      console.error('Deposit error:', err);
      toast.error('❌ Failed to initiate transaction');
      throw err;
    }
  };

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
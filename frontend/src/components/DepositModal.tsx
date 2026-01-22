import { useState, useEffect } from 'react';
import { X, Wallet, ArrowDownToLine, Globe } from 'lucide-react';
import { useAccount, useBalance, useSwitchChain } from 'wagmi';
import { formatEther } from 'viem';
import { cronosTestnet } from 'wagmi/chains';
import toast from 'react-hot-toast';
import { useVault } from '../hooks/useVault-fixed';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { vaultBalance, deposit, isPending, isConfirming, isSuccess, isError, refreshBalance, error } = useVault();
  
  const { data: walletBalance } = useBalance({
    address,
  });

  useEffect(() => {
    if (isSuccess) {
      refreshBalance();
      setAmount('');
      // Don't close modal immediately, let user see success state
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isSuccess, refreshBalance, onClose]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (chainId !== cronosTestnet.id) {
      toast.error('Please switch to Cronos Testnet first');
      return;
    }

    if (!walletBalance || parseFloat(amount) > parseFloat(formatEther(walletBalance.value))) {
      toast.error('Insufficient wallet balance');
      return;
    }

    try {
      console.log('Starting deposit:', amount);
      await deposit(amount);
    } catch (error) {
      console.error('Deposit failed:', error);
      // Error handling is now done in useVault hook
    }
  };

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: cronosTestnet.id });
    } catch (error) {
      // If switching fails, show manual instructions
      toast.error('Please add Cronos Testnet to your wallet manually');
    }
  };

  const addNetworkManually = () => {
    const networkDetails = {
      chainId: '0x152', // 338 in hex
      chainName: 'Cronos Testnet',
      rpcUrls: ['https://evm-t3.cronos.org'],
      nativeCurrency: {
        name: 'CRO',
        symbol: 'CRO',
        decimals: 18
      },
      blockExplorerUrls: ['https://cronos.org/explorer/testnet3']
    };
    
    if (window.ethereum) {
      window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkDetails]
      }).catch(() => {
        toast.error('Failed to add network');
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Deposit to Vault</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Network Check */}
          {chainId !== cronosTestnet.id && (
            <div className="bg-orange-900/20 border border-orange-500/20 p-4 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <Globe className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-100">Wrong Network</p>
                  <p className="text-xs text-orange-300 mt-1">Switch to Cronos Testnet to deposit</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <button
                  onClick={handleSwitchNetwork}
                  className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
                >
                  Switch Network
                </button>
                <button
                  onClick={addNetworkManually}
                  className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm transition-colors"
                >
                  Add Network
                </button>
              </div>
              
              <div className="text-xs text-orange-300 space-y-1">
                <p className="font-medium">Manual Setup:</p>
                <div className="grid grid-cols-1 gap-1 pl-2">
                  <p>• Network: Cronos Testnet</p>
                  <p>• RPC: https://evm-t3.cronos.org</p>
                  <p>• Chain ID: 338</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Balances */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Wallet Balance</p>
              <p className="text-lg font-bold truncate">{walletBalance ? formatEther(walletBalance.value) : '0'} CRO</p>
            </div>
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-400 mb-1">Vault Balance</p>
              <p className="text-lg font-bold text-blue-300 truncate">{vaultBalance} CRO</p>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Amount to Deposit</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full glass-input pr-16"
                step="0.01"
                min="0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                CRO
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {['0.1', '1', '10'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                >
                  {preset} CRO
                </button>
              ))}
            </div>
          </div>

          {/* Deposit Button */}
          <button
            onClick={handleDeposit}
            disabled={isPending || isConfirming || !amount || parseFloat(amount) <= 0 || chainId !== cronosTestnet.id}
            className={`w-full py-3 flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${
              isPending || isConfirming
                ? 'bg-yellow-600 text-white cursor-not-allowed'
                : isSuccess
                ? 'bg-green-600 text-white'
                : error
                ? 'bg-red-600 text-white'
                : 'btn-primary hover:shadow-lg'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                'Confirm in Wallet...'
              </>
            ) : isConfirming ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                'Transaction Pending...'
              </>
            ) : isSuccess ? (
              <>
                <span className="text-lg">✅</span>
                'Deposit Successful!'
              </>
            ) : error ? (
              <>
                <span className="text-lg">❌</span>
                'Deposit Failed - Try Again'
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4" />
                Deposit to Vault
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-lg">
            <div className="flex gap-3">
              <Wallet className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200/80">
                <p className="font-medium text-blue-100 mb-1">About Vault Deposits</p>
                <p>Deposited CRO will be stored in the Vault contract and can be used for instant payments in the marketplace.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
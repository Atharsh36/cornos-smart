import { useAccount } from 'wagmi';
import { cronosTestnet } from 'wagmi/chains';
import { CheckCircle, AlertCircle, Wallet, Globe, CreditCard } from 'lucide-react';
import { useVault } from '../../hooks/useVault';

interface AICheckoutHelperProps {
  orderAmount: number;
  onProceed: () => void;
}

export default function AICheckoutHelper({ orderAmount, onProceed }: AICheckoutHelperProps) {
  const { address, isConnected, chainId } = useAccount();
  const { vaultBalance } = useVault();

  const checks = [
    {
      id: 'wallet',
      label: 'Wallet Connected',
      passed: isConnected && !!address,
      icon: Wallet
    },
    {
      id: 'network',
      label: 'Cronos Testnet',
      passed: chainId === cronosTestnet.id,
      icon: Globe
    },
    {
      id: 'balance',
      label: 'Sufficient Vault Balance',
      passed: parseFloat(vaultBalance) >= orderAmount,
      icon: CreditCard
    }
  ];

  const allChecksPassed = checks.every(check => check.passed);

  return (
    <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle className="w-6 h-6 text-green-400" />
        <h3 className="text-xl font-bold text-white">AI Checkout Assistant</h3>
        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">FREE</span>
      </div>
      
      <p className="text-slate-300 mb-6">Let me check if you're ready to proceed with payment</p>
      
      <div className="space-y-3 mb-6">
        {checks.map((check) => {
          const Icon = check.icon;
          return (
            <div key={check.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                check.passed ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {check.passed ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <Icon className={`w-5 h-5 ${check.passed ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`${check.passed ? 'text-green-300' : 'text-red-300'}`}>
                {check.label}
              </span>
            </div>
          );
        })}
      </div>

      {!allChecksPassed && (
        <div className="bg-orange-900/20 border border-orange-500/20 p-4 rounded-lg mb-4">
          <p className="text-orange-300 text-sm">
            Please resolve the issues above before proceeding with payment.
          </p>
        </div>
      )}

      <button
        onClick={onProceed}
        disabled={!allChecksPassed}
        className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle className="w-5 h-5" />
        {allChecksPassed ? 'Proceed to Pay' : 'Fix Issues to Continue'}
      </button>
    </div>
  );
}
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { X, Shield, AlertTriangle, Loader2, CreditCard } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../utils/constants';

interface TrustCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerId: string;
  orders: any[];
}

interface PaymentInfo {
  price: string;
  token: string;
  receiver: string;
  paymentId: string;
}

interface TrustReport {
  trustScore: number;
  flags: string[];
  explanation: string;
}

export default function TrustCheckModal({ isOpen, onClose, sellerId, orders }: TrustCheckModalProps) {
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [trustReport, setTrustReport] = useState<TrustReport | null>(null);
  const [paymentTx, setPaymentTx] = useState<string>('');

  const { writeContract, data: hash, isPending: isPaymentPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isPaymentSuccess } = useWaitForTransactionReceipt({ hash });

  const trustCheckMutation = useMutation({
    mutationFn: async (txHash?: string) => {
      const headers: any = { 'Content-Type': 'application/json' };
      if (txHash) headers['x-payment-tx'] = txHash;

      const response = await fetch(`${API_BASE_URL}/api/ai/trust-check`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sellerId, orders })
      });

      if (response.status === 402) {
        const paymentData = await response.json();
        setPaymentInfo(paymentData);
        return null;
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    onSuccess: (data) => {
      if (data) {
        setTrustReport(data);
        toast.success('Trust report generated!');
      }
    },
    onError: (error) => {
      toast.error('Trust check failed');
      console.error(error);
    }
  });

  const handlePayment = () => {
    if (!paymentInfo) return;
    
    writeContract({
      address: paymentInfo.receiver as `0x${string}`,
      abi: [],
      functionName: 'fallback',
      value: parseEther('0.02'), // 0.02 CRO as USDC equivalent
    });
  };

  const handlePaymentSuccess = () => {
    if (hash) {
      setPaymentTx(hash);
      trustCheckMutation.mutate(hash);
    }
  };

  if (isPaymentSuccess && !trustReport) {
    handlePaymentSuccess();
  }

  if (!isOpen) return null;

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrustBg = (score: number) => {
    if (score >= 80) return 'bg-green-900/20 border-green-500/20';
    if (score >= 60) return 'bg-yellow-900/20 border-yellow-500/20';
    return 'bg-red-900/20 border-red-500/20';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl border border-white/10 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold">AI Trust Check</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!paymentInfo && !trustReport && (
            <div className="text-center">
              <button
                onClick={() => trustCheckMutation.mutate()}
                disabled={trustCheckMutation.isPending}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {trustCheckMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                Get Trust Report
              </button>
            </div>
          )}

          {paymentInfo && !trustReport && (
            <div className="space-y-4">
              <div className="bg-orange-900/20 border border-orange-500/20 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-orange-400" />
                  <span className="font-medium text-orange-100">Payment Required</span>
                </div>
                <p className="text-sm text-orange-300">
                  Pay {paymentInfo.price} {paymentInfo.token} to unlock detailed trust analysis
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={isPaymentPending || isConfirming}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                {isPaymentPending ? 'Confirm in Wallet...' :
                 isConfirming ? 'Processing Payment...' :
                 `Pay ${paymentInfo.price} ${paymentInfo.token}`}
              </button>
            </div>
          )}

          {trustReport && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${getTrustBg(trustReport.trustScore)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Trust Score</span>
                  <span className={`text-2xl font-bold ${getTrustColor(trustReport.trustScore)}`}>
                    {trustReport.trustScore}/100
                  </span>
                </div>
                <p className="text-sm text-slate-300">{trustReport.explanation}</p>
              </div>

              {trustReport.flags.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-red-400">Risk Flags</span>
                  </div>
                  <ul className="text-sm text-red-300 space-y-1">
                    {trustReport.flags.map((flag, idx) => (
                      <li key={idx}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
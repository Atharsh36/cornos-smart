import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface AgentPanelProps {
    type: 'trust' | 'safety' | 'escrow';
    productId?: string;
    orderId?: string;
    txData?: {
        wallet: string;
        productId: string;
        sellerWallet: string;
        amount: number;
        currency: string;
        escrowAddress: string;
    };
    onSafetyResult?: (result: any) => void;
}

export default function AgentPanel({ type, productId, orderId, txData, onSafetyResult }: AgentPanelProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (type === 'trust' && productId) {
            fetchSellerTrust();
        } else if (type === 'safety' && txData) {
            fetchTxSafety();
        } else if (type === 'escrow' && orderId) {
            fetchEscrowExplain();
        }
    }, [type, productId, orderId, txData]);

    const fetchSellerTrust = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/agent/sellerTrust/${productId}`, {
                method: 'POST'
            });
            const result = await response.json();
            if (result.success) setData(result.data);
        } catch (error) {
            console.error('Agent error:', error);
        }
        setLoading(false);
    };

    const fetchTxSafety = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/agent/txSafetyCheck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(txData)
            });
            const result = await response.json();
            if (result.success) {
                setData(result.data);
                onSafetyResult?.(result.data);
            }
        } catch (error) {
            console.error('Agent error:', error);
        }
        setLoading(false);
    };

    const fetchEscrowExplain = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/agent/escrowExplain/${orderId}`, {
                method: 'POST'
            });
            const result = await response.json();
            if (result.success) setData(result.data);
        } catch (error) {
            console.error('Agent error:', error);
        }
        setLoading(false);
    };

    if (!visible) return null;

    const renderTrustWidget = () => (
        <div className="glass-card p-4 border-l-4 border-blue-500">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <span className="font-medium text-white">Seller Trust Score</span>
                </div>
                <button onClick={() => setVisible(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            {loading ? (
                <div className="animate-pulse">Loading trust score...</div>
            ) : data ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">{data.trustScore}/100</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                            data.badge === 'Trusted Seller' ? 'bg-green-500/20 text-green-400' :
                            data.badge === 'High Risk' ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                        }`}>
                            {data.badge}
                        </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                        {data.reasons.map((reason: string, i: number) => (
                            <div key={i}>• {reason}</div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );

    const renderSafetyWidget = () => (
        <div className={`glass-card p-4 border-l-4 ${
            data?.safeLevel === 'SAFE' ? 'border-green-500' :
            data?.safeLevel === 'RISKY' ? 'border-yellow-500' :
            'border-red-500'
        }`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    {data?.safeLevel === 'SAFE' ? <CheckCircle className="w-5 h-5 text-green-400" /> :
                     data?.safeLevel === 'RISKY' ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
                     <AlertTriangle className="w-5 h-5 text-red-400" />}
                    <span className="font-medium text-white">Transaction Safety</span>
                </div>
                <button onClick={() => setVisible(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            {loading ? (
                <div className="animate-pulse">Checking transaction safety...</div>
            ) : data ? (
                <div className="space-y-2">
                    <div className={`font-medium ${
                        data.safeLevel === 'SAFE' ? 'text-green-400' :
                        data.safeLevel === 'RISKY' ? 'text-yellow-400' :
                        'text-red-400'
                    }`}>
                        {data.safeLevel}
                    </div>
                    <div className="text-xs text-slate-400 space-y-1">
                        {data.reasons.map((reason: string, i: number) => (
                            <div key={i}>• {reason}</div>
                        ))}
                    </div>
                    <div className="text-xs text-blue-400 mt-2">
                        {data.recommendedAction}
                    </div>
                </div>
            ) : null}
        </div>
    );

    const renderEscrowWidget = () => (
        <div className="glass-card p-4 border-l-4 border-purple-500">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">Escrow Status</span>
                </div>
                <button onClick={() => setVisible(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            {loading ? (
                <div className="animate-pulse">Checking escrow status...</div>
            ) : data ? (
                <div className="space-y-2">
                    <div className="font-medium text-purple-400">{data.currentStage}</div>
                    <div className="text-sm text-slate-300">{data.whatItMeans}</div>
                    <div className="text-xs text-slate-400">
                        Next: {data.nextSteps}
                    </div>
                    <div className="text-xs text-blue-400">
                        Est. time: {data.estimatedTime}
                    </div>
                </div>
            ) : null}
        </div>
    );

    return (
        <div className="fixed bottom-4 right-4 max-w-sm z-50">
            {type === 'trust' && renderTrustWidget()}
            {type === 'safety' && renderSafetyWidget()}
            {type === 'escrow' && renderEscrowWidget()}
        </div>
    );
}
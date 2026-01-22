import { AlertTriangle, Shield, XCircle } from 'lucide-react';

interface RiskBannerProps {
    riskLevel: 'SAFE' | 'RISKY' | 'BLOCK';
    reasons: string[];
    recommendations?: string[];
    onDismiss?: () => void;
}

export default function RiskBanner({ riskLevel, reasons, recommendations = [], onDismiss }: RiskBannerProps) {
    const getBannerStyle = () => {
        switch (riskLevel) {
            case 'SAFE': return 'bg-green-500/10 border-green-500/30 text-green-400';
            case 'RISKY': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
            case 'BLOCK': return 'bg-red-500/10 border-red-500/30 text-red-400';
        }
    };

    const getIcon = () => {
        switch (riskLevel) {
            case 'SAFE': return <Shield className="w-5 h-5" />;
            case 'RISKY': return <AlertTriangle className="w-5 h-5" />;
            case 'BLOCK': return <XCircle className="w-5 h-5" />;
        }
    };

    const getTitle = () => {
        switch (riskLevel) {
            case 'SAFE': return 'Safe to Proceed';
            case 'RISKY': return 'Proceed with Caution';
            case 'BLOCK': return 'High Risk - Do Not Proceed';
        }
    };

    return (
        <div className={`p-4 rounded-lg border ${getBannerStyle()}`}>
            <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1">
                    <h4 className="font-medium mb-1">{getTitle()}</h4>
                    <div className="text-sm opacity-90 space-y-1">
                        {reasons.map((reason, i) => (
                            <div key={i}>• {reason}</div>
                        ))}
                    </div>
                    {recommendations.length > 0 && (
                        <div className="mt-2 text-sm opacity-80">
                            <strong>Recommendations:</strong>
                            {recommendations.map((rec, i) => (
                                <div key={i}>• {rec}</div>
                            ))}
                        </div>
                    )}
                </div>
                {onDismiss && (
                    <button onClick={onDismiss} className="opacity-60 hover:opacity-100">
                        <XCircle className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
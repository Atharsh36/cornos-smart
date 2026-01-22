import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface TrustBadgeProps {
    trustScore: number;
    badge: 'VERIFIED' | 'NORMAL' | 'HIGH_RISK';
    reasons: string[];
    compact?: boolean;
}

export default function TrustBadge({ trustScore, badge, reasons, compact = false }: TrustBadgeProps) {
    const getBadgeColor = () => {
        switch (badge) {
            case 'VERIFIED': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'HIGH_RISK': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        }
    };

    const getIcon = () => {
        switch (badge) {
            case 'VERIFIED': return <CheckCircle className="w-3 h-3" />;
            case 'HIGH_RISK': return <AlertTriangle className="w-3 h-3" />;
            default: return <Shield className="w-3 h-3" />;
        }
    };

    if (compact) {
        return (
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor()}`}>
                {getIcon()}
                <span>{trustScore}</span>
            </div>
        );
    }

    return (
        <div className={`p-3 rounded-lg border ${getBadgeColor()}`}>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <span className="font-medium">{badge}</span>
                </div>
                <span className="text-lg font-bold">{trustScore}/100</span>
            </div>
            <div className="text-xs opacity-80">
                {reasons.slice(0, 2).map((reason, i) => (
                    <div key={i}>• {reason}</div>
                ))}
            </div>
        </div>
    );
}
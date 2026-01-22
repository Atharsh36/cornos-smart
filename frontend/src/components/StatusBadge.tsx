import clsx from 'clsx';

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const styles = {
        PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        FUNDED: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        SHIPPED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        DELIVERED: 'bg-green-500/10 text-green-500 border-green-500/20',
        COMPLETED: 'bg-green-500/10 text-green-500 border-green-500/20',
        CANCELLED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    const normalizedStatus = status.toUpperCase() as keyof typeof styles;

    return (
        <span className={clsx(
            'px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider',
            styles[normalizedStatus] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        )}>
            {status}
        </span>
    );
}

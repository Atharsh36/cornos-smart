import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import AgentPanel from '../components/AgentPanel';
import { orderApi } from '../api/orderApi';
import type { Order } from '../api/orderApi';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface LocalOrder {
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    totalAmount: number;
    buyerAddress: string;
    sellerAddress: string;
    status: string;
    txHash: string;
    shippingAddress: string;
    createdAt: string;
}

export default function Orders() {
    const { address, isConnected } = useAccount();
    const [localOrders, setLocalOrders] = useState<LocalOrder[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    // Load orders from localStorage
    useEffect(() => {
        const loadLocalOrders = () => {
            const orders: LocalOrder[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith('order_')) {
                    try {
                        const order = JSON.parse(localStorage.getItem(key) || '{}');
                        if (order.buyerAddress === address) {
                            orders.push(order);
                        }
                    } catch (error) {
                        console.error('Error parsing order:', error);
                    }
                }
            }
            orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLocalOrders(orders);
        };

        if (address) {
            loadLocalOrders();
        }
    }, [address]);

    const { data: apiOrders, isLoading } = useQuery({
        queryKey: ['my-orders', address],
        queryFn: () => orderApi.getOrders(address!),
        enabled: !!address
    });

    // Combine local and API orders
    const allOrders = [...localOrders, ...(apiOrders || [])];

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-slate-950">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[80vh]">
                    <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
                    <p className="text-slate-400 mb-8">Please connect your wallet to view your orders.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>

                {isLoading ? (
                    <Loader />
                ) : allOrders?.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-xl">
                        <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                        <p className="text-slate-400">Start shopping in the marketplace!</p>
                        <Link to="/marketplace" className="inline-block mt-4 btn-outline">Browse Products</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {allOrders?.map((order: any) => (
                            <div key={order.orderId || order.id} className="glass-card p-6">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                                <Package className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{order.productName || order.product?.name || `Order #${(order.orderId || order.id)?.slice(0, 8)}`}</h4>
                                            <p className="text-slate-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            <p className="font-mono text-xs text-slate-500 mt-1">ID: {order.orderId || order.id}</p>
                                            {order.txHash && (
                                                <p className="font-mono text-xs text-blue-400 mt-1">
                                                    TX: {order.txHash.slice(0, 10)}...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-white mb-2">{order.totalAmount || order.amount} CRO</p>
                                        <StatusBadge status={order.status} />
                                    </div>
                                </div>

                                {/* Timeline Visualization */}
                                <div className="relative pt-6 border-t border-white/5">
                                    <div className="absolute top-9 left-0 w-full h-0.5 bg-slate-800" />
                                    <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                                        {['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'].map((step, idx) => {
                                            const currentStatus = (order.status || '').toUpperCase();
                                            const statusOrder = ['PAID', 'SHIPPED', 'DELIVERED', 'COMPLETED'];
                                            const isCompleted = statusOrder.indexOf(currentStatus) >= idx;

                                            return (
                                                <div key={step} className="flex flex-col items-center">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${
                                                        isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-600'
                                                    }`}>
                                                        {idx === 0 && <CheckCircle className="w-4 h-4" />}
                                                        {idx === 1 && <Truck className="w-4 h-4" />}
                                                        {idx === 2 && <Package className="w-4 h-4" />}
                                                        {idx === 3 && <Clock className="w-4 h-4" />}
                                                    </div>
                                                    <span className={`text-[10px] font-bold tracking-wider ${
                                                        isCompleted ? 'text-blue-400' : 'text-slate-600'
                                                    }`}>
                                                        {step}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                {order.status === 'PAID' && (
                                    <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                                        <button 
                                            onClick={() => {
                                                // Update order status
                                                const updatedOrder = { ...order, status: 'SHIPPED' };
                                                localStorage.setItem(`order_${order.orderId}`, JSON.stringify(updatedOrder));
                                                setLocalOrders(prev => prev.map(o => o.orderId === order.orderId ? updatedOrder : o));
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                                        >
                                            Mark as Shipped
                                        </button>
                                        <button 
                                            onClick={() => setSelectedOrderId(order.orderId)}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                                        >
                                            Explain Escrow
                                        </button>
                                    </div>
                                )}
                                
                                {order.status === 'SHIPPED' && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <button 
                                            onClick={() => {
                                                // Update order status
                                                const updatedOrder = { ...order, status: 'DELIVERED' };
                                                localStorage.setItem(`order_${order.orderId}`, JSON.stringify(updatedOrder));
                                                setLocalOrders(prev => prev.map(o => o.orderId === order.orderId ? updatedOrder : o));
                                            }}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                                        >
                                            Mark as Delivered
                                        </button>
                                    </div>
                                )}
                                
                                {order.status === 'DELIVERED' && (
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <button 
                                            onClick={() => {
                                                // Update order status
                                                const updatedOrder = { ...order, status: 'COMPLETED' };
                                                localStorage.setItem(`order_${order.orderId}`, JSON.stringify(updatedOrder));
                                                setLocalOrders(prev => prev.map(o => o.orderId === order.orderId ? updatedOrder : o));
                                            }}
                                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                                        >
                                            Complete Order
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Agent Panel for Escrow Explanation */}
            {selectedOrderId && (
                <AgentPanel 
                    type="escrow" 
                    orderId={selectedOrderId}
                />
            )}
        </div>
    );
}

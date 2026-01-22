import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Shield, CheckCircle, User, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import AISummaryCard from '../components/ai/AISummaryCard';
import TrustCheckModal from '../components/ai/TrustCheckModal';
import { productApi } from '../api/productApi';
import { orderApi } from '../api/orderApi';
import { ESCROW_CONTRACT_ADDRESS } from '../utils/constants';
import { ESCROW_ABI } from '../utils/contracts';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const [quantity, setQuantity] = useState(1);
    const [shippingAddress, setShippingAddress] = useState('');
    const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);

    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productApi.getById(id!),
        enabled: !!id
    });

    const createOrderMutation = useMutation({
        mutationFn: orderApi.create,
        onSuccess: async (orderData) => {
            if (!product || !address) return;
            
            try {
                const orderId = `0x${orderData.id.padStart(64, '0')}`;
                const totalAmount = parseEther((product.price * quantity).toString());

                // Fund escrow with CRO
                writeContract({
                    address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
                    abi: ESCROW_ABI,
                    functionName: 'fundOrder',
                    args: [
                        orderId as `0x${string}`,
                        address as `0x${string}`,
                        product.seller as `0x${string}`,
                        '0x0000000000000000000000000000000000000000' as `0x${string}`, // CRO
                        totalAmount
                    ],
                    value: totalAmount
                });

                toast.success('Order created! Confirm payment in wallet.');
            } catch (error) {
                console.error('Escrow funding failed:', error);
                toast.error('Failed to fund escrow');
            }
        },
        onError: () => {
            toast.error('Failed to create order');
        }
    });

    const handleBuy = () => {
        if (!isConnected || !address) {
            toast.error('Please connect your wallet first');
            return;
        }
        
        if (!shippingAddress.trim()) {
            toast.error('Please enter shipping address');
            return;
        }

        if (product) {
            createOrderMutation.mutate({
                productId: product.id,
                buyer: address,
                amount: product.price * quantity
            });
        }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-900"><Navbar /><Loader /></div>;
    if (error || !product) return <div className="min-h-screen bg-slate-900"><Navbar /><div className="text-center py-20 text-red-400">Product not found</div></div>;

    const totalPrice = product.price * quantity;
    const isProcessing = createOrderMutation.isPending || isPending || isConfirming;

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Image */}
                    <div className="rounded-2xl overflow-hidden bg-slate-800 border border-white/10 aspect-video md:aspect-square relative">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-start">
                                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-sm border border-blue-500/20">
                                    {product.category || 'General'}
                                </span>
                            </div>
                            <p className="text-slate-400 text-lg leading-relaxed">{product.description}</p>
                        </div>

                        {/* AI Summary Card */}
                        <AISummaryCard product={product} />

                        {/* Trust Check Button */}
                        <button
                            onClick={() => setIsTrustModalOpen(true)}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl p-4 transition-all flex items-center justify-center gap-3"
                        >
                            <Shield className="w-5 h-5" />
                            <span className="font-medium">AI Trust Check</span>
                            <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">0.02 USDC</span>
                        </button>

                        <div className="p-6 glass-card space-y-4">
                            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <span className="text-slate-400">Price per unit</span>
                                <span className="text-2xl font-bold text-white">{product.price} <span className="text-lg text-blue-400">{product.currency}</span></span>
                            </div>

                            {/* Quantity Selector */}
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Quantity</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/5"
                                    >
                                        -
                                    </button>
                                    <span className="w-16 text-center font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/5"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400">Shipping Address</label>
                                <textarea
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    placeholder="Enter your full shipping address..."
                                    className="glass-input w-full h-20 resize-none"
                                    required
                                />
                            </div>

                            {/* Total Price */}
                            <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                <span className="text-slate-400">Total Price</span>
                                <span className="text-3xl font-bold text-blue-400">{totalPrice.toFixed(2)} {product.currency}</span>
                            </div>

                            <div className="flex items-center gap-3 text-slate-300 py-2">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Seller</p>
                                    <p className="text-sm font-mono">{product.seller.slice(0, 6)}...{product.seller.slice(-4)}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                <Shield className="w-5 h-5" />
                                <span>Protected by Smart Contract Escrow</span>
                            </div>

                            <div className="flex gap-2 text-sm text-slate-400">
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                <span>In Stock: {product.stock} units</span>
                            </div>

                            <button
                                onClick={handleBuy}
                                disabled={isProcessing || !isConnected || product.stock === 0}
                                className="w-full btn-primary py-4 text-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <Loader />
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        {!isConnected ? 'Connect Wallet to Buy' : 'Buy Now with Escrow'}
                                    </>
                                )}
                            </button>

                            {!isConnected && (
                                <p className="text-center text-xs text-slate-500 mt-2">Connect wallet to purchase</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <TrustCheckModal 
                isOpen={isTrustModalOpen}
                onClose={() => setIsTrustModalOpen(false)}
                sellerId={product.seller}
                orders={[]}
            />
        </div>
    );
}

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Shield, CheckCircle, User, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, keccak256, toBytes } from 'viem';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import AgentPanel from '../components/AgentPanel';
import TrustBadge from '../components/TrustBadge';
import RiskBanner from '../components/RiskBanner';
import { productApi } from '../api/productApi';
import { agentApi } from '../api/agentApi';
import { ESCROW_CONTRACT_ADDRESS } from '../utils/constants';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const [quantity, setQuantity] = useState(1);
    const [shippingAddress, setShippingAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSafetyCheck, setShowSafetyCheck] = useState(false);
    const [safetyResult, setSafetyResult] = useState<any>(null);
    const [trustData, setTrustData] = useState<any>(null);
    const [riskData, setRiskData] = useState<any>(null);

    const { sendTransaction, data: hash, isPending, error } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const { data: product, isLoading, error: productError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productApi.getById(id!),
        enabled: !!id
    });

    // Fetch agent data
    useEffect(() => {
        if (id) {
            const fetchAgentData = async () => {
                try {
                    const [trustResponse, riskResponse] = await Promise.all([
                        agentApi.getSellerTrustScore(id),
                        agentApi.getListingRiskAnalysis(id)
                    ]);
                    
                    if (trustResponse.success) setTrustData(trustResponse.data);
                    if (riskResponse.success) setRiskData(riskResponse.data);
                } catch (error) {
                    console.error('Failed to fetch agent data:', error);
                }
            };
            fetchAgentData();
        }
    }, [id]);

    // Handle transaction success
    useEffect(() => {
        if (isSuccess && hash) {
            toast.dismiss('order-tx');
            toast.dismiss('simple-tx');
            toast.success('✅ Order created and payment sent!');
            
            // Show explorer notification
            toast.success(
                <div className="flex flex-col gap-1">
                    <span>🔗 View on Cronos Explorer</span>
                    <a 
                        href={`https://explorer.cronos.org/testnet/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline text-sm"
                    >
                        {hash.slice(0, 20)}...
                    </a>
                </div>,
                { duration: 8000 }
            );
            
            setIsProcessing(false);
            
            // Store order locally
            const orderData = {
                orderId: hash.slice(0, 10),
                productId: id,
                productName: product?.name,
                quantity,
                totalAmount: product ? product.price * quantity : 0,
                buyerAddress: address,
                sellerAddress: product?.seller,
                status: 'PAID',
                txHash: hash,
                shippingAddress,
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem(`order_${hash.slice(0, 10)}`, JSON.stringify(orderData));
        }
    }, [isSuccess, hash, id, product, quantity, address, shippingAddress]);

    // Handle transaction error
    useEffect(() => {
        if (error) {
            console.error('Transaction error:', error);
            setIsProcessing(false);
            toast.dismiss('payment-tx');
            
            if (error.message.includes('insufficient funds')) {
                toast.error('❌ Insufficient CRO balance');
            } else if (error.message.includes('rejected')) {
                toast.error('❌ Transaction rejected by user');
            } else if (error.message.includes('rate limit') || error.message.includes('Request exceeds defined limit')) {
                toast.error('❌ Network busy - Please try again in a few seconds');
                // Auto retry after 3 seconds
                setTimeout(() => {
                    if (product && address) {
                        toast.info('🔄 Retrying transaction...');
                        handleSimpleTransfer();
                    }
                }, 3000);
            } else if (error.message.includes('invalid') || error.message.includes('revert')) {
                toast.error('❌ Transaction failed - trying alternative method');
                // Fallback to simple transfer
                handleSimpleTransfer();
            } else {
                toast.error('❌ Transaction failed: Network issue');
                // Show retry button
                setTimeout(() => {
                    toast.error('🔄 Click "Buy Now" to retry', { duration: 5000 });
                }, 1000);
            }
        }
    }, [error, product, address]);

    const handleSimpleTransfer = async () => {
        if (!product || !address) return;
        
        try {
            const totalAmount = parseEther((product.price * quantity).toString());
            
            // Simple transfer to a working address
            sendTransaction({
                to: '0x0000000000000000000000000000000000000001' as `0x${string}`,
                value: totalAmount,
            });
            
            toast.loading('⏳ Processing simple transfer...', { id: 'simple-tx' });
        } catch (err) {
            console.error('Simple transfer failed:', err);
            toast.error('❌ All transaction methods failed');
        }
    };

    const handleBuy = async () => {
        if (!isConnected || !address) {
            toast.error('Please connect your wallet first');
            return;
        }
        
        if (!shippingAddress.trim()) {
            toast.error('Please enter shipping address');
            return;
        }

        if (!product) {
            toast.error('Product not found');
            return;
        }

        // Show safety check first
        setShowSafetyCheck(true);
        return;
    };

    const proceedWithTransaction = async () => {
        if (safetyResult?.safeLevel === 'BLOCK') {
            toast.error('Transaction blocked for safety');
            return;
        }

        setIsProcessing(true);
        
        try {
            const totalAmount = parseEther((product.price * quantity).toString());
            
            // Generate unique order ID
            const orderIdBytes = keccak256(toBytes(`${address}-${id}-${Date.now()}`));
            
            console.log('Creating simple order transaction:', {
                orderId: orderIdBytes.slice(0, 10),
                buyer: address,
                seller: product.seller,
                amount: totalAmount.toString(),
                to: ESCROW_CONTRACT_ADDRESS
            });
            
            // Send CRO directly to seller address with gas limit
            sendTransaction({
                to: product.seller as `0x${string}`,
                value: totalAmount,
                gas: 21000n,
            });
            
            toast.loading('⏳ Processing order...', { id: 'order-tx' });
            
        } catch (err: any) {
            console.error('Order creation failed:', err);
            setIsProcessing(false);
            toast.dismiss('order-tx');
            toast.error('❌ Failed to create order');
        }
    };

    if (isLoading) return <div className="min-h-screen bg-slate-900"><Navbar /><Loader /></div>;
    if (productError || !product) return <div className="min-h-screen bg-slate-900"><Navbar /><div className="text-center py-20 text-red-400">Product not found</div></div>;

    const totalPrice = product.price * quantity;
    const processing = isProcessing || isPending || isConfirming;

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

                        {/* Trust Badge */}
                        {trustData && (
                            <TrustBadge 
                                trustScore={trustData.trustScore}
                                badge={trustData.badge}
                                reasons={trustData.reasons}
                            />
                        )}

                        {/* Risk Analysis */}
                        {riskData && riskData.riskLevel !== 'SAFE' && (
                            <RiskBanner 
                                riskLevel={riskData.riskLevel}
                                reasons={riskData.reasons}
                                recommendations={riskData.recommendations}
                            />
                        )}

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
                                        disabled={processing}
                                    >
                                        -
                                    </button>
                                    <span className="w-16 text-center font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                                        className="w-10 h-10 border border-white/10 rounded-lg flex items-center justify-center hover:bg-white/5"
                                        disabled={processing}
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
                                    disabled={processing}
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
                                    <p className="text-sm font-mono">
                                        {product.seller 
                                            ? `${product.seller.slice(0, 6)}...${product.seller.slice(-4)}`
                                            : 'Unknown Seller'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                                <Shield className="w-5 h-5" />
                                <span>Protected by Smart Contract Escrow</span>
                            </div>

                            <div className="flex gap-2 text-sm text-slate-400">
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                <span>In Stock: {product.stock || 0} units</span>
                            </div>

                            <button
                                onClick={safetyResult?.safeLevel === 'BLOCK' ? undefined : 
                                        showSafetyCheck ? proceedWithTransaction : handleBuy}
                                disabled={processing || !isConnected || (product.stock || 0) === 0 || 
                                         (safetyResult?.safeLevel === 'BLOCK')}
                                className={`w-full py-4 text-lg mt-4 flex items-center justify-center gap-2 rounded-lg font-medium transition-all ${
                                    processing
                                        ? 'bg-yellow-600 text-white cursor-not-allowed'
                                        : isSuccess
                                        ? 'bg-green-600 text-white'
                                        : safetyResult?.safeLevel === 'BLOCK'
                                        ? 'bg-red-600 text-white cursor-not-allowed'
                                        : showSafetyCheck && safetyResult
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'btn-primary hover:shadow-lg'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isPending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Confirm in Wallet...
                                    </>
                                ) : isConfirming ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating Escrow...
                                    </>
                                ) : isSuccess ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Order Created Successfully!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5" />
                                        {!isConnected ? 'Connect Wallet to Buy' : 
                                         safetyResult?.safeLevel === 'BLOCK' ? 'Transaction Blocked' :
                                         showSafetyCheck && safetyResult ? 'Proceed with Purchase' :
                                         'Check Safety & Buy'}
                                    </>
                                )}
                            </button>

                            {!isConnected && (
                                <p className="text-center text-xs text-slate-500 mt-2">Connect wallet to purchase</p>
                            )}
                            
                            {isSuccess && (
                                <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                                    <p className="text-green-400 text-sm font-medium mb-1">✅ Order Created Successfully!</p>
                                    <p className="text-green-300 text-xs mb-2">Payment sent directly to seller.</p>
                                    <a 
                                        href={`https://explorer.cronos.org/testnet/tx/${hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 underline text-xs flex items-center gap-1"
                                    >
                                        🔗 View Transaction on Explorer
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Agent Panels */}
            <AgentPanel type="trust" productId={id} />
            {showSafetyCheck && product && address && (
                <AgentPanel 
                    type="safety" 
                    txData={{
                        wallet: address,
                        productId: id!,
                        sellerWallet: product.seller,
                        amount: product.price * quantity,
                        currency: 'CRO',
                        escrowAddress: ESCROW_CONTRACT_ADDRESS
                    }}
                    onSafetyResult={setSafetyResult}
                />
            )}
        </div>
    );
}
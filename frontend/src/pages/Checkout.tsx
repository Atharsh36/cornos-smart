import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, keccak256, toHex } from 'viem';
import toast from 'react-hot-toast';
import { ShieldCheck, Wallet, ArrowRight, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import DepositModal from '../components/DepositModal';
import AICheckoutHelper from '../components/ai/AICheckoutHelper';
import { orderApi } from '../api/orderApi';
import { useVault } from '../hooks/useVault';
import { ESCROW_CONTRACT_ADDRESS, VAULT_CONTRACT_ADDRESS } from '../utils/constants';
import VaultABI from '../contracts/abi/Vault.json';

// Minimal ABI for fundOrder
const ESCROW_ABI = [
    {
        "inputs": [
            { "internalType": "bytes32", "name": "orderId", "type": "bytes32" },
            { "internalType": "address", "name": "buyer", "type": "address" },
            { "internalType": "address", "name": "seller", "type": "address" },
            { "internalType": "address", "name": "token", "type": "address" },
            { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "fundOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    }
] as const;

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const navigate = useNavigate();
    const { address, isConnected } = useAccount();
    const { writeContract, data: hash, isPending: isWritePending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const { vaultBalance, vaultBalanceRaw, refreshBalance } = useVault();

    const { data: order, isLoading: isOrderLoading } = useQuery({
        queryKey: ['order', orderId],
        queryFn: () => orderApi.getById(orderId!),
        enabled: !!orderId
    });

    const updateStatusMutation = useMutation({
        mutationFn: (txHash: string) => orderApi.updateStatus(orderId!, 'FUNDED', txHash),
        onSuccess: () => {
            toast.success('Order funded successfully!');
            navigate('/orders');
        }
    });

    useEffect(() => {
        if (isConfirmed && hash) {
            updateStatusMutation.mutate(hash);
            refreshBalance(); // Refresh vault balance after payment
        }
    }, [isConfirmed, hash, refreshBalance]);

    const handlePayment = () => {
        if (!order || !address) return;

        // Generate bytes32 ID from ID string
        const finalOrderId = keccak256(toHex(order.id));

        try {
            writeContract({
                address: ESCROW_CONTRACT_ADDRESS as `0x${string}`,
                abi: ESCROW_ABI,
                functionName: 'fundOrder',
                args: [
                    finalOrderId,
                    address,
                    (order.product?.seller || order.seller) as `0x${string}`,
                    '0x0000000000000000000000000000000000000000', // CRO
                    parseEther(order.amount.toString())
                ],
                value: parseEther(order.amount.toString())
            });
        } catch (err) {
            console.error(err);
            toast.error('Transaction failed to prepare');
        }
    };

    const handleVaultPayment = () => {
        if (!order || !address) return;

        const orderAmount = parseEther(order.amount.toString());
        if (vaultBalanceRaw < orderAmount) {
            toast.error('Insufficient vault balance');
            return;
        }

        try {
            writeContract({
                address: VAULT_CONTRACT_ADDRESS as `0x${string}`,
                abi: VaultABI,
                functionName: 'transferTo',
                args: [
                    ESCROW_CONTRACT_ADDRESS as `0x${string}`,
                    orderAmount
                ]
            });
        } catch (err) {
            console.error(err);
            toast.error('Vault payment failed to prepare');
        }
    };

    if (isOrderLoading) return <div className="min-h-screen bg-slate-950"><Navbar /><Loader /></div>;
    if (!order) return <div className="min-h-screen bg-slate-950"><Navbar /><div className="text-center py-20 text-red-500">Invalid Order</div></div>;

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Secure Checkout</h1>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            {/* Order Item */}
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-slate-800 rounded-lg overflow-hidden">
                                        {order.product?.image ? (
                                            <img src={order.product.image} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-700" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-lg">{order.product?.name || 'Product'}</h4>
                                        <p className="text-slate-400 text-sm">{order.product?.description?.slice(0, 50)}...</p>
                                        <p className="mt-2 font-bold text-blue-400">{order.amount} CRO</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Checkout Helper */}
                        <AICheckoutHelper 
                            orderAmount={order.amount}
                            onProceed={() => {/* Scroll to payment section */}}
                        />

                        {/* Escrow Info */}
                            <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-xl flex gap-4">
                                <ShieldCheck className="w-12 h-12 text-blue-400 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-blue-100">Smart Contract Escrow</h4>
                                    <p className="text-sm text-blue-200/70 mt-1">
                                        Your funds will be locked in the smart contract (Address: {ESCROW_CONTRACT_ADDRESS.slice(0, 8)}...).
                                        The seller will only receive funds after you confirm delivery.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Actions */}
                        <div className="space-y-6">
                            <div className="glass-card p-6 sticky top-24">
                                <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Subtotal</span>
                                        <span>{order.amount} CRO</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Escrow Fee</span>
                                        <span>0.00 CRO</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-xl">
                                        <span>Total</span>
                                        <span>{order.amount} CRO</span>
                                    </div>
                                </div>

                                {/* Vault Balance Display */}
                                {isConnected && parseFloat(vaultBalance) > 0 && (
                                    <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-blue-400">Vault Balance</span>
                                            <span className="font-bold text-blue-300">{parseFloat(vaultBalance).toFixed(2)} CRO</span>
                                        </div>
                                    </div>
                                )}

                                {!isConnected ? (
                                    <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20 text-red-400 text-sm">
                                        Connect wallet to pay
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Vault Payment Button */}
                                        {parseFloat(vaultBalance) >= order.amount ? (
                                            <button
                                                onClick={handleVaultPayment}
                                                disabled={isWritePending || isConfirming || updateStatusMutation.isPending}
                                                className="w-full btn-primary py-3 flex items-center justify-center gap-2 group"
                                            >
                                                {isWritePending ? 'Confirming in Wallet...' :
                                                    isConfirming ? 'Transaction Pending...' :
                                                        updateStatusMutation.isPending ? 'Updating Order...' :
                                                            <>Pay from Vault <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
                                            </button>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-400 text-sm">
                                                    Insufficient Vault Balance
                                                </div>
                                                <button
                                                    onClick={() => setIsDepositModalOpen(true)}
                                                    className="w-full btn-outline py-2 flex items-center justify-center gap-2"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Deposit CRO
                                                </button>
                                            </div>
                                        )}
                                        
                                        {/* Wallet Payment Button */}
                                        <button
                                            onClick={handlePayment}
                                            disabled={isWritePending || isConfirming || updateStatusMutation.isPending}
                                            className="w-full btn-outline py-3 flex items-center justify-center gap-2 group"
                                        >
                                            {isWritePending ? 'Confirming in Wallet...' :
                                                isConfirming ? 'Transaction Pending...' :
                                                    updateStatusMutation.isPending ? 'Updating Order...' :
                                                        <>Pay With Wallet <Wallet className="w-4 h-4" /></>}
                                        </button>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                                    <Wallet className="w-3 h-3" />
                                    <span>Powered by Cronos Testnet</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <DepositModal 
                isOpen={isDepositModalOpen} 
                onClose={() => setIsDepositModalOpen(false)} 
            />
        </div>
    );
}

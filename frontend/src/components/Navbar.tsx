import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { ShoppingCart, Menu, X, Search, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, tokenManager } from '../api/authApi';
import { useVault } from '../hooks/useVault-fixed';
import DepositModal from './DepositModal';

export default function Navbar() {
    const { address, isConnected } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { signMessage } = useSignMessage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);
    const { vaultBalance, refreshBalance } = useVault();

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const handleConnect = async () => {
        try {
            connect({ connector: connectors[0] });
        } catch (error) {
            toast.error('Failed to connect wallet');
        }
    };

    const handleAuthenticate = async () => {
        if (!address) return;

        try {
            setIsAuthenticating(true);

            // Get nonce from backend
            const nonceResponse = await authApi.getNonce(address);
            const nonce = nonceResponse.data.nonce;

            // Sign message
            const message = `Sign this message to authenticate with CronoSmart: ${nonce}`;

            signMessage(
                { message },
                {
                    onSuccess: async (signature) => {
                        try {
                            // Verify signature and get JWT
                            const authResponse = await authApi.verifySignature(address, signature);

                            // Store token
                            tokenManager.setToken(authResponse.data.token);

                            toast.success('Authenticated successfully!');
                        } catch (error: any) {
                            console.error('Verification failed:', error);
                            toast.error('Authentication failed');
                        }
                    },
                    onError: (error) => {
                        console.error('Signing failed:', error);
                        localStorage.setItem('auth_rejected', 'true');
                        if (error.message.includes('rejected')) {
                            toast.error('Signature rejected');
                        } else {
                            toast.error('Failed to sign message');
                        }
                    }
                }
            );
        } catch (error: any) {
            console.error('Authentication failed:', error);
            toast.error('Authentication failed');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        tokenManager.removeToken();
        toast.success('Wallet disconnected');
    };

    // Auto-authenticate when wallet connects (but don't force it)
    useEffect(() => {
        // Only auto-authenticate if user hasn't rejected before and hasn't attempted yet
        if (isConnected && address && !tokenManager.getToken() && !localStorage.getItem('auth_rejected') && !hasAttemptedAuth && !isAuthenticating) {
            setHasAttemptedAuth(true);
            // Add a small delay to let wallet connection settle
            setTimeout(() => {
                handleAuthenticate();
            }, 1000);
        }
        // Refresh vault balance when wallet connects
        if (isConnected && address) {
            refreshBalance();
        }
    }, [isConnected, address, hasAttemptedAuth, isAuthenticating]);

    // Reset auth attempt when wallet disconnects
    useEffect(() => {
        if (!isConnected) {
            setHasAttemptedAuth(false);
        }
    }, [isConnected]);

    return (
        <header className="sticky top-0 z-50 bg-[#131921] text-white shadow-lg">
            {/* Main Header Row */}
            <div className="container mx-auto px-4 h-16 flex items-center gap-4">
                {/* Logo */}
                <Link to="/" className="flex flex-col leading-none hover:opacity-90 transition-opacity">
                    <span className="text-2xl font-bold tracking-tight">CronoSmart</span>
                    <span className="text-xs text-blue-400 font-medium tracking-wider text-right -mt-1">ECOMMERCE</span>
                </Link>

                {/* Location/Delivery (Hidden on mobile) */}
                <div className="hidden lg:flex flex-col text-xs text-slate-300 ml-2 hover:outline outline-1 outline-white p-2 rounded cursor-pointer">
                    <span className="text-slate-400">Deliver to</span>
                    <span className="font-bold text-white">Cronos Testnet</span>
                </div>

                {/* Search Bar - The Centerpiece */}
                <div className="flex-1 max-w-3xl hidden md:flex h-10 rounded-lg focus-within:ring-2 focus-within:ring-amazon-DEFAULT overflow-hidden">
                    <button className="bg-slate-200 text-slate-700 px-3 text-xs hover:bg-slate-300 border-r border-slate-300 flex items-center gap-1">
                        All <ChevronDown className="w-3 h-3" />
                    </button>
                    <input
                        type="text"
                        placeholder="Search CronoSmart"
                        className="flex-1 px-4 text-black outline-none border-none placeholder:text-slate-500"
                    />
                    <button className="bg-amazon-DEFAULT hover:bg-amazon-hover px-5 flex items-center justify-center transition-colors">
                        <Search className="w-5 h-5 text-slate-900" />
                    </button>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-1 ml-auto">
                    {/* Wallet/Account */}
                    <div className="relative group">
                        {isConnected ? (
                            <button className="flex flex-col text-xs hover:outline outline-1 outline-white p-2 rounded text-left">
                                <span className="text-slate-300">Hello, {formatAddress(address!)}</span>
                                <span className="font-bold text-sm flex items-center gap-1">
                                    Account & Lists <ChevronDown className="w-3 h-3" />
                                </span>
                            </button>
                        ) : (
                            <button
                                onClick={handleConnect}
                                className="flex flex-col text-xs hover:outline outline-1 outline-white p-2 rounded text-left"
                            >
                                <span className="text-slate-300">Hello, sign in</span>
                                <span className="font-bold text-sm">Connect Wallet</span>
                            </button>
                        )}

                        {/* Dropdown Menu (Simplified for brevity, would usually be complex) */}
                        {isConnected && (
                            <div className="absolute right-0 top-full w-48 bg-white text-black rounded shadow-xl hidden group-hover:block p-2 z-50">
                                <div className="text-xs text-slate-500 mb-2 px-2">Your Wallet</div>
                                <div className="font-mono text-xs px-2 mb-2 bg-slate-100 p-1 rounded overflow-hidden text-ellipsis">{address}</div>
                                {parseFloat(vaultBalance) > 0 && (
                                    <div className="px-2 mb-2 text-sm font-bold text-green-600">
                                        Vault: {parseFloat(vaultBalance).toFixed(2)} CRO
                                    </div>
                                )}
                                <hr className="my-1" />
                                <button onClick={() => setIsDepositModalOpen(true)} className="w-full text-left px-2 py-1 hover:bg-slate-100 text-sm">Deposit Funds</button>
                                <Link to="/orders" className="block px-2 py-1 hover:bg-slate-100 text-sm">Your Orders</Link>
                                {!tokenManager.getToken() && (
                                    <button onClick={handleAuthenticate} className="w-full text-left px-2 py-1 hover:bg-slate-100 text-sm text-blue-600">Sign In to API</button>
                                )}
                                <button onClick={handleDisconnect} className="w-full text-left px-2 py-1 hover:bg-slate-100 text-sm text-red-600">Disconnect</button>
                            </div>
                        )}
                    </div>

                    <Link to="/orders" className="hidden sm:flex flex-col text-xs hover:outline outline-1 outline-white p-2 rounded">
                        <span className="text-slate-300">Returns</span>
                        <span className="font-bold">& Orders</span>
                    </Link>

                    <Link to="/cart" className="flex items-end gap-1 hover:outline outline-1 outline-white p-2 rounded relative">
                        <div className="relative">
                            <ShoppingCart className="w-8 h-8" />
                            <span className="absolute -top-1 -right-1 bg-amazon-DEFAULT text-slate-900 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">0</span>
                        </div>
                        <span className="font-bold text-sm mb-1 hidden sm:inline">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Secondary Option Bar (Categories) */}
            <div className="bg-[#232f3e] text-white text-sm flex items-center px-4 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-1 font-bold p-2 hover:bg-white/10 rounded cursor-pointer whitespace-nowrap"
                >
                    <Menu className="w-5 h-5" /> All
                </button>
                <div className="flex items-center gap-1 ml-2">
                    {['Today\'s Deals', 'Customer Service', 'Registry', 'Gift Cards', 'Sell'].map((item) => (
                        <Link key={item} to="/marketplace" className="p-2 hover:bg-white/10 rounded hover:text-white whitespace-nowrap text-slate-200">
                            {item}
                        </Link>
                    ))}
                    <Link to="/marketplace" className="p-2 hover:bg-white/10 rounded hover:text-white whitespace-nowrap text-slate-200 font-bold hidden md:block">
                        Electronics
                    </Link>
                    <Link to="/marketplace" className="p-2 hover:bg-white/10 rounded hover:text-white whitespace-nowrap text-slate-200 font-bold hidden md:block">
                        Home & Kitchen
                    </Link>
                </div>
                <div className="ml-auto p-2 font-bold text-amazon-DEFAULT hidden md:block hover:text-amazon-hover cursor-pointer">
                    Shop the Gaming Store
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="w-80 bg-white h-full relative text-black overflow-y-auto anima-slide-in">
                        <div className="p-4 bg-[#232f3e] text-white font-bold text-lg flex items-center gap-2">
                            <span className="w-8 h-8 bg-slate-100 rounded-full text-slate-900 flex items-center justify-center">
                                <Menu className="w-5 h-5" />
                            </span>
                            Browse CronoSmart
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-2">Trending</h3>
                            <Link to="/marketplace" className="block py-3 border-b border-slate-100">Best Sellers</Link>
                            <Link to="/marketplace" className="block py-3 border-b border-slate-100">New Releases</Link>

                            <h3 className="font-bold text-lg mb-2 mt-4">Shop By Category</h3>
                            <Link to="/marketplace" className="block py-3 border-b border-slate-100">Electronics</Link>
                            <Link to="/marketplace" className="block py-3 border-b border-slate-100">Computers</Link>
                            <Link to="/marketplace" className="block py-3 border-b border-slate-100">Smart Home</Link>
                        </div>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="absolute top-2 right-2 text-white p-2"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 bg-black/50" onClick={() => setIsMenuOpen(false)} />
                </div>
            )}

            <DepositModal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
            />
        </header>
    );
}

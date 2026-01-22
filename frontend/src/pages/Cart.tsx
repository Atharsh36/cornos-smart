import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Cart() {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-slate-500" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-slate-400 max-w-md mb-8">
                    Looks like you haven't added anything to your cart yet.
                    The marketplace is full of amazing digital assets waiting for you!
                </p>
                <Link to="/marketplace" className="btn-primary flex items-center gap-2">
                    Start Shopping <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

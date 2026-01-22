import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import Home from '../pages/Home';
import Marketplace from '../pages/Marketplace';
import ProductDetail from '../pages/ProductDetail-simple';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import Loader from '../components/Loader';
import ErrorBoundary from '../components/ErrorBoundary';

export default function AppRoutes() {
    return (
        <ErrorBoundary>
            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="*" element={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1><p className="text-slate-400">The page you're looking for doesn't exist.</p></div></div>} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
}

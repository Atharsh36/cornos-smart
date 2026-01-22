import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import { productApi } from '../api/productApi';
import type { Product } from '../api/productApi';
import { Loader } from 'lucide-react';

export default function Home() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                // Fetch all products (which are currently faked/mocked)
                const data = await productApi.getAll();
                // Ensure data is an array
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error("Product API returned non-array:", data);
                    setProducts([]);
                }
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);



    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <Navbar />

            <HeroCarousel />

            {/* Negative margin to pull content up over the carousel bottom like Amazon often does, 
                or just standard spacing. Let's do standard spacing for valid CSS flow but 
                make it look dense. */}

            <div className="container mx-auto px-4 -mt-20 relative z-20">
                {/* Category / Promo Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Gaming Essentials</h3>
                        <div className="flex-1 bg-slate-800 rounded-lg mb-4 overflow-hidden relative group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <Link to="/marketplace?category=Electronics" className="text-blue-400 hover:text-blue-300 text-sm font-medium">See more</Link>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Metaverse Wearables</h3>
                        <div className="flex-1 bg-slate-800 rounded-lg mb-4 overflow-hidden relative group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <Link to="/marketplace" className="text-blue-400 hover:text-blue-300 text-sm font-medium">Explore now</Link>
                    </div>

                    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Home & Smart Living</h3>
                        <div className="flex-1 bg-slate-800 rounded-lg mb-4 overflow-hidden relative group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1558002038-1091a166111c?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <Link to="/marketplace" className="text-blue-400 hover:text-blue-300 text-sm font-medium">Shop designs</Link>
                    </div>

                    <div className="bg-white/5 backdrop-blur border border-slate-700 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
                        <h3 className="text-xl font-bold mb-2">Sign in for best experience</h3>
                        <button className="btn-primary w-full py-2 mb-2 rounded-lg text-sm">Sign in securely</button>
                        <div className="text-xs text-slate-400">New customer? <Link to="#" className="text-blue-400">Start here.</Link></div>
                    </div>
                </div>

                {/* Product Rows */}
                <div className="space-y-12">
                    {/* Row 1 */}
                    <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="bg-amber-500 w-1.5 h-6 rounded-full"></span>
                                Top Picks for You
                            </h2>
                            <Link to="/marketplace" className="text-blue-400 text-sm hover:underline">See more</Link>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12"><Loader className="animate-spin w-8 h-8 text-blue-500" /></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                                {products.slice(0, 4).map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Row 2 */}
                    <section className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <span className="bg-blue-500 w-1.5 h-6 rounded-full"></span>
                                New Arrivals
                            </h2>
                            <Link to="/marketplace" className="text-blue-400 text-sm hover:underline">See more</Link>
                        </div>

                        {loading ? (
                            <div className="flex justify-center p-12"><Loader className="animate-spin w-8 h-8 text-blue-500" /></div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                                {products.slice(4, 8).length > 0 ? products.slice(4, 8).map(product => (
                                    <ProductCard key={product.id} product={product} />
                                )) : <div className="text-slate-500 col-span-4 text-center py-10">More products coming soon...</div>}
                            </div>
                        )}
                    </section>

                    {/* Banner Strip */}
                    <section className="relative overflow-hidden rounded-2xl h-64 flex items-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900" />
                        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=2000" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
                        <div className="relative z-10 p-10 max-w-2xl">
                            <h2 className="text-3xl font-bold mb-4">Sell on CronoSmart</h2>
                            <p className="text-lg text-slate-200 mb-6">Join thousands of sellers and reach global customers with crypto-native payments.</p>
                            <button className="btn-secondary px-8 py-3 rounded-lg font-bold">Start Selling</button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}


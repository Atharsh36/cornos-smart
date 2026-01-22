import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { productApi } from '../api/productApi';

export default function Marketplace() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('newest');

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products', search, category, sort],
        queryFn: () => productApi.getAll({ search, category, sort })
    });

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Marketplace</h1>
                        <p className="text-slate-400 mt-1">Discover, buy, and sell digital & physical goods</p>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full glass-input pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="relative">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="glass-input appearance-none pr-8 cursor-pointer"
                            >
                                <option value="newest">Newest</option>
                                <option value="priceLow">Price: Low to High</option>
                                <option value="priceHigh">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-6 mb-4 scrollbar-hide">
                    {['All', 'Electronics', 'Fashion', 'Gaming', 'Home', 'Collectibles', 'Digital'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${category === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <Loader />
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400">Failed to load products. Please try again later.</p>
                    </div>
                ) : products?.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-400">No products found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products?.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import type { Product } from '../api/productApi';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import TrustBadge from './TrustBadge';
import { agentApi } from '../api/agentApi';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const [trustData, setTrustData] = useState<any>(null);

    useEffect(() => {
        const fetchTrustScore = async () => {
            try {
                const response = await agentApi.getSellerTrustScore(product.id);
                if (response.success) {
                    setTrustData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch trust score:', error);
            }
        };
        fetchTrustScore();
    }, [product.id]);
    return (
        <div className="group glass-card overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="relative aspect-square overflow-hidden bg-slate-800">
                <img
                    src={product.image || 'https://images.unsplash.com/photo-1550029402-226115b7c579?w=800&auto=format&fit=crop&q=60'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                    <Link
                        to={`/products/${product.id}`}
                        className="w-full btn-primary text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                        View Details
                    </Link>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{product.name}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                        {product.category || 'Item'}
                    </span>
                </div>

                {trustData && (
                    <div className="mb-3">
                        <TrustBadge 
                            trustScore={trustData.trustScore}
                            badge={trustData.badge}
                            reasons={trustData.reasons}
                            compact
                        />
                    </div>
                )}

                <p className="text-slate-400 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>

                <div className="flex items-center justify-between mt-auto">
                    <div>
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="text-xl font-bold text-white">{product.price} {product.currency}</p>
                    </div>
                    <button className="p-2 btn-outline rounded-full hover:bg-blue-500 hover:border-blue-500 hover:text-white group/btn">
                        <ShoppingBag className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

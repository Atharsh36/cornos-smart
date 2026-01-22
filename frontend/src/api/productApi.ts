import api from './axios';

export interface Product {
    id: string;
    _id?: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    image: string;
    images?: string[];
    seller: string;
    sellerAddress?: string;
    stock: number;
    category?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

import { FAKE_PRODUCTS } from '../utils/fakeProducts';

export const productApi = {
    getAll: async (params?: { search?: string; category?: string; sort?: string }) => {
        // Always use fake products for consistent pricing
        console.warn('Using fake products with updated prices');
        let fakes = [...FAKE_PRODUCTS];

        if (params?.search) {
            const lowerSearch = params.search.toLowerCase();
            fakes = fakes.filter(p =>
                p.name.toLowerCase().includes(lowerSearch) ||
                p.description.toLowerCase().includes(lowerSearch)
            );
        }
        if (params?.category && params.category !== 'All') {
            fakes = fakes.filter(p => p.category === params.category);
        }
        if (params?.sort === 'priceLow') {
            fakes.sort((a, b) => a.price - b.price);
        } else if (params?.sort === 'priceHigh') {
            fakes.sort((a, b) => b.price - a.price);
        }

        return fakes;
    },

    getById: async (id: string) => {
        // Always check fake products first for consistent pricing
        const fakeProduct = FAKE_PRODUCTS.find(p => p.id === id);
        if (fakeProduct) {
            return fakeProduct;
        }
        
        // Return a default product with low price if not found
        return {
            id: id,
            name: 'Sample Product',
            description: 'Sample product description',
            price: 0.1,
            currency: 'CRO',
            image: 'https://images.unsplash.com/photo-1550029402-226115b7c579?w=400',
            seller: '0x1234567890123456789012345678901234567890',
            stock: 5,
            category: 'Electronics'
        };
    },

    create: async (data: Omit<Product, 'id'>) => {
        const response = await api.post<ApiResponse<Product>>('/api/products', data);
        return response.data.data;
    }
};

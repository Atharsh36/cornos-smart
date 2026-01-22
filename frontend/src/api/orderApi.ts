import api from './axios';
import type { Product, ApiResponse } from './productApi';


export interface Order {
    id: string;
    productId: string;
    buyer: string;
    seller: string; // derived from product usually
    amount: number;
    status: 'PENDING' | 'FUNDED' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    txHash?: string;
    product?: Product;
}

export const orderApi = {
    create: async (data: { productId: string; buyer: string; amount: number }) => {
        // For MVP with fake products, simulate order creation
        if (data.productId.startsWith('fake-')) {
            const fakeOrder = {
                id: `order-${Date.now()}`,
                productId: data.productId,
                buyer: data.buyer,
                seller: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87', // Default seller
                amount: data.amount,
                status: 'PENDING' as const,
                createdAt: new Date().toISOString(),
                txHash: ''
            };
            
            // Store in localStorage for demo
            const orders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
            orders.push(fakeOrder);
            localStorage.setItem('demo_orders', JSON.stringify(orders));
            
            return fakeOrder;
        }
        
        // Try real API
        try {
            const response = await api.post<ApiResponse<Order>>('/api/orders', data);
            return response.data.data;
        } catch (error) {
            throw new Error('Failed to create order');
        }
    },

    getById: async (id: string) => {
        // Check localStorage first for demo orders
        const orders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        const demoOrder = orders.find((o: any) => o.id === id);
        if (demoOrder) return demoOrder;
        
        try {
            const response = await api.get<ApiResponse<Order>>(`/api/orders/${id}`);
            return response.data.data;
        } catch (error) {
            return null;
        }
    },

    updateStatus: async (id: string, status: string, txHash?: string) => {
        // Update localStorage for demo orders
        const orders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
        const orderIndex = orders.findIndex((o: any) => o.id === id);
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            if (txHash) orders[orderIndex].txHash = txHash;
            localStorage.setItem('demo_orders', JSON.stringify(orders));
            return orders[orderIndex];
        }
        
        try {
            const response = await api.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { status, txHash });
            return response.data.data;
        } catch (error) {
            throw new Error('Failed to update order');
        }
    },

    getOrders: async (walletAddress: string) => {
        // Get demo orders from localStorage
        const demoOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]')
            .filter((o: any) => o.buyer === walletAddress);
        
        try {
            const response = await api.get<ApiResponse<Order[]>>(`/api/orders/buyer/${walletAddress}`);
            const realOrders = response.data.data || [];
            return [...realOrders, ...demoOrders];
        } catch (error) {
            // Return only demo orders if API fails
            return demoOrders;
        }
    }
};

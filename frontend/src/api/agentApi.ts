import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/agent';

export const agentApi = {
    // Seller Trust Score
    async getSellerTrustScore(productId: string) {
        const response = await axios.post(`${API_BASE}/sellerTrustScore`, { productId });
        return response.data;
    },

    // Listing Risk Analysis
    async getListingRiskAnalysis(productId: string) {
        const response = await axios.post(`${API_BASE}/listingRiskAnalysis`, { productId });
        return response.data;
    },

    // Cart Risk Summary
    async getCartRiskSummary(cartItems: any[]) {
        const response = await axios.post(`${API_BASE}/cartRiskSummary`, { cartItems });
        return response.data;
    },

    // Transaction Safety Check
    async checkTransactionSafety(orderId: string, txPreview: any) {
        const response = await axios.post(`${API_BASE}/txSafetyCheck`, { orderId, txPreview });
        return response.data;
    },

    // Escrow Explainer
    async getEscrowExplanation(orderId: string) {
        const response = await axios.post(`${API_BASE}/escrowExplainer`, { orderId });
        return response.data;
    },

    // Dispute Assistant
    async submitDispute(orderId: string, userIssueText: string, evidenceFiles: string[] = []) {
        const response = await axios.post(`${API_BASE}/disputeAssistant`, { 
            orderId, 
            userIssueText, 
            evidenceFiles 
        });
        return response.data;
    },

    // Deep Verify (x402)
    async requestDeepVerify(orderId: string) {
        try {
            const response = await axios.post(`${API_BASE}/deepVerify/${orderId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 402) {
                return {
                    success: false,
                    requiresPayment: true,
                    paymentDetails: error.response.data.data
                };
            }
            throw error;
        }
    }
};

export default agentApi;
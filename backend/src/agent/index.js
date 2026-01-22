const { ethers } = require('ethers');

class CronoSmartGuardianAgent {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.CRONOS_RPC);
        this.escrowAddress = process.env.ESCROW_ADDRESS;
        this.vaultAddress = process.env.VAULT_ADDRESS;
        this.cache = new Map();
    }

    async toolTxSafety({ wallet, productId, sellerWallet, amount, currency, escrowAddress }) {
        try {
            const reasons = [];
            let safeLevel = 'SAFE';

            // Check network
            const network = await this.provider.getNetwork();
            if (network.chainId !== 338n) {
                reasons.push('Wrong network - must use Cronos testnet');
                safeLevel = 'BLOCK';
            }

            // Check escrow address
            if (escrowAddress.toLowerCase() !== this.escrowAddress.toLowerCase()) {
                reasons.push('Invalid escrow contract address');
                safeLevel = 'BLOCK';
            }

            // Check currency
            if (currency !== 'CRO') {
                reasons.push('Only CRO payments supported');
                safeLevel = 'RISKY';
            }

            // Check amount
            if (amount <= 0 || amount > 10) {
                reasons.push('Unusual transaction amount');
                safeLevel = 'RISKY';
            }

            // Check balance
            try {
                const balance = await this.provider.getBalance(wallet);
                const balanceInCRO = parseFloat(ethers.formatEther(balance));
                if (balanceInCRO < amount * 1.1) {
                    reasons.push('Insufficient balance for transaction + gas');
                    safeLevel = 'RISKY';
                }
            } catch (e) {
                reasons.push('Could not verify wallet balance');
            }

            if (reasons.length === 0) {
                reasons.push('Transaction appears safe');
            }

            return {
                safeLevel,
                reasons,
                recommendedAction: safeLevel === 'SAFE' ? 'Proceed with transaction' : 
                                 safeLevel === 'RISKY' ? 'Review carefully before proceeding' : 
                                 'Do not proceed'
            };
        } catch (error) {
            return {
                safeLevel: 'RISKY',
                reasons: ['Error validating transaction'],
                recommendedAction: 'Try again or contact support'
            };
        }
    }

    async toolSellerTrust(productId) {
        try {
            // Mock trust calculation based on productId
            const trustScores = {
                '1': { score: 85, disputes: 2, completions: 48 },
                '2': { score: 92, disputes: 1, completions: 67 },
                '3': { score: 78, disputes: 5, completions: 34 },
                '4': { score: 95, disputes: 0, completions: 89 }
            };

            const data = trustScores[productId] || { score: 75, disputes: 3, completions: 25 };
            
            let badge = 'Verified';
            if (data.score >= 90) badge = 'Trusted Seller';
            else if (data.score < 70) badge = 'High Risk';

            const reasons = [];
            if (data.score >= 90) reasons.push('Excellent completion rate');
            if (data.disputes === 0) reasons.push('No recent disputes');
            if (data.disputes > 3) reasons.push('Multiple recent disputes');
            if (data.completions > 50) reasons.push('Experienced seller');

            return {
                trustScore: data.score,
                badge,
                reasons,
                stats: {
                    completions: data.completions,
                    disputes: data.disputes
                }
            };
        } catch (error) {
            return {
                trustScore: 50,
                badge: 'Unknown',
                reasons: ['Unable to verify seller'],
                stats: { completions: 0, disputes: 0 }
            };
        }
    }

    async toolEscrowExplain(orderId) {
        try {
            // Mock escrow stages
            const stages = [
                'Payment Received',
                'Seller Notified',
                'Item Shipped',
                'Delivery Confirmed',
                'Funds Released'
            ];

            const currentStage = Math.floor(Math.random() * stages.length);
            const stage = stages[currentStage];

            const explanations = {
                'Payment Received': 'Your CRO is safely held in escrow',
                'Seller Notified': 'Seller has been notified to ship your item',
                'Item Shipped': 'Item is on its way to you',
                'Delivery Confirmed': 'Waiting for delivery confirmation',
                'Funds Released': 'Transaction completed successfully'
            };

            const nextSteps = {
                'Payment Received': 'Wait for seller to ship item',
                'Seller Notified': 'Seller will ship within 2-3 days',
                'Item Shipped': 'Track your package',
                'Delivery Confirmed': 'Confirm receipt to release funds',
                'Funds Released': 'Transaction complete'
            };

            return {
                currentStage: stage,
                whatItMeans: explanations[stage],
                nextSteps: nextSteps[stage],
                estimatedTime: '1-3 days'
            };
        } catch (error) {
            return {
                currentStage: 'Unknown',
                whatItMeans: 'Unable to determine escrow status',
                nextSteps: 'Contact support',
                estimatedTime: 'Unknown'
            };
        }
    }
}

module.exports = CronoSmartGuardianAgent;
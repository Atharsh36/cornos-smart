const { createPublicClient, http } = require('viem');
const { cronosTestnet } = require('viem/chains');
const OpenAI = require('openai');

class CronosSmartGuardianAgent {
    constructor() {
        this.client = createPublicClient({
            chain: cronosTestnet,
            transport: http(process.env.CRONOS_RPC)
        });
        
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        this.escrowAddress = process.env.ESCROW_ADDRESS;
        this.vaultAddress = process.env.VAULT_ADDRESS;
        this.cache = new Map();
    }

    async sellerTrustScore(productId) {
        const cacheKey = `trust_${productId}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Mock seller data - in production, query MongoDB
            const sellerData = {
                '1': { disputes: 1, completions: 45, refunds: 2, cancellations: 0 },
                '2': { disputes: 0, completions: 67, refunds: 1, cancellations: 0 },
                '3': { disputes: 4, completions: 23, refunds: 8, cancellations: 2 },
                '4': { disputes: 0, completions: 89, refunds: 0, cancellations: 0 }
            };

            const data = sellerData[productId] || { disputes: 2, completions: 15, refunds: 3, cancellations: 1 };
            
            const completionRate = data.completions / (data.completions + data.cancellations + 1);
            const disputeRate = data.disputes / (data.completions + 1);
            const refundRate = data.refunds / (data.completions + 1);
            
            let trustScore = Math.max(0, Math.min(100, 
                (completionRate * 60) + 
                ((1 - disputeRate) * 25) + 
                ((1 - refundRate) * 15)
            ));

            let badge = 'NORMAL';
            if (trustScore >= 85) badge = 'VERIFIED';
            else if (trustScore < 60) badge = 'HIGH_RISK';

            const reasons = [];
            if (completionRate > 0.9) reasons.push('High completion rate');
            if (disputeRate < 0.05) reasons.push('Low dispute rate');
            if (data.disputes > 5) reasons.push('Multiple disputes');
            if (data.refunds > 10) reasons.push('High refund rate');

            const result = {
                trustScore: Math.round(trustScore),
                badge,
                reasons,
                stats: data
            };

            this.cache.set(cacheKey, result);
            setTimeout(() => this.cache.delete(cacheKey), 300000); // 5 min cache
            
            return result;
        } catch (error) {
            return {
                trustScore: 50,
                badge: 'NORMAL',
                reasons: ['Unable to verify seller'],
                stats: {}
            };
        }
    }

    async listingRiskAnalysis(productId) {
        try {
            // Mock risk analysis
            const riskFactors = {
                '1': { priceOutlier: false, suspiciousImages: false, flaggedSeller: false },
                '2': { priceOutlier: false, suspiciousImages: false, flaggedSeller: false },
                '3': { priceOutlier: true, suspiciousImages: true, flaggedSeller: false },
                '4': { priceOutlier: false, suspiciousImages: false, flaggedSeller: false }
            };

            const risks = riskFactors[productId] || { priceOutlier: false, suspiciousImages: false, flaggedSeller: false };
            
            let riskLevel = 'SAFE';
            const reasons = [];
            const recommendations = [];

            if (risks.priceOutlier) {
                riskLevel = 'RISKY';
                reasons.push('Price significantly below market average');
                recommendations.push('Verify product authenticity before purchase');
            }
            
            if (risks.suspiciousImages) {
                riskLevel = 'RISKY';
                reasons.push('Images appear in multiple listings');
                recommendations.push('Request additional product photos');
            }
            
            if (risks.flaggedSeller) {
                riskLevel = 'BLOCK';
                reasons.push('Seller has been flagged for suspicious activity');
                recommendations.push('Do not proceed with purchase');
            }

            if (reasons.length === 0) {
                reasons.push('No suspicious patterns detected');
                recommendations.push('Listing appears legitimate');
            }

            return { riskLevel, reasons, recommendations };
        } catch (error) {
            return {
                riskLevel: 'RISKY',
                reasons: ['Unable to analyze listing'],
                recommendations: ['Proceed with caution']
            };
        }
    }

    async cartRiskSummary(cartItems) {
        try {
            let totalRisk = 0;
            let riskySellers = 0;
            const warnings = [];

            for (const item of cartItems) {
                const trust = await this.sellerTrustScore(item.productId);
                const risk = await this.listingRiskAnalysis(item.productId);
                
                if (trust.badge === 'HIGH_RISK') riskySellers++;
                if (risk.riskLevel === 'RISKY' || risk.riskLevel === 'BLOCK') totalRisk++;
            }

            if (riskySellers > 0) warnings.push(`${riskySellers} high-risk sellers in cart`);
            if (totalRisk > 0) warnings.push(`${totalRisk} risky listings detected`);

            const score = Math.max(0, 100 - (riskySellers * 30) - (totalRisk * 20));
            const summary = warnings.length > 0 ? 
                'Cart contains risky items - review before checkout' : 
                'Cart appears safe for checkout';

            return { summary, score, warnings };
        } catch (error) {
            return {
                summary: 'Unable to analyze cart',
                score: 50,
                warnings: ['Analysis failed - proceed with caution']
            };
        }
    }

    async txSafetyCheck(orderId, txPreview) {
        try {
            const reasons = [];
            let safeLevel = 'SAFE';
            const actionSteps = [];

            // Check network
            const chainId = await this.client.getChainId();
            if (chainId !== 338) {
                safeLevel = 'BLOCK';
                reasons.push('Wrong network - must use Cronos testnet (338)');
                actionSteps.push('Switch to Cronos testnet in wallet');
            }

            // Check escrow address
            if (txPreview.escrowAddress?.toLowerCase() !== this.escrowAddress.toLowerCase()) {
                safeLevel = 'BLOCK';
                reasons.push('Invalid escrow contract address');
                actionSteps.push('Do not proceed - contact support');
            }

            // Check vault address
            if (txPreview.vaultAddress?.toLowerCase() !== this.vaultAddress.toLowerCase()) {
                safeLevel = 'RISKY';
                reasons.push('Vault address mismatch');
                actionSteps.push('Verify vault contract address');
            }

            // Check amount
            if (txPreview.amount <= 0 || txPreview.amount > 100) {
                safeLevel = 'RISKY';
                reasons.push('Unusual transaction amount');
                actionSteps.push('Verify order total is correct');
            }

            // Check balance
            try {
                const balance = await this.client.getBalance({ 
                    address: txPreview.userAddress 
                });
                const balanceInCRO = Number(balance) / 1e18;
                if (balanceInCRO < txPreview.amount * 1.1) {
                    safeLevel = 'RISKY';
                    reasons.push('Insufficient balance for transaction + gas');
                    actionSteps.push('Add more CRO to wallet');
                }
            } catch (e) {
                reasons.push('Could not verify wallet balance');
            }

            if (reasons.length === 0) {
                reasons.push('Transaction passes all safety checks');
                actionSteps.push('Safe to proceed with payment');
            }

            return { safeLevel, reasons, actionSteps };
        } catch (error) {
            return {
                safeLevel: 'RISKY',
                reasons: ['Safety check failed'],
                actionSteps: ['Try again or contact support']
            };
        }
    }

    async escrowExplainer(orderId) {
        try {
            // Mock order status - in production, query MongoDB + blockchain
            const orderStages = [
                'CREATED', 'FUNDED', 'SHIPPED', 'DELIVERED', 'COMPLETED'
            ];
            
            const currentStage = orderStages[Math.floor(Math.random() * orderStages.length)];
            
            const explanations = {
                'CREATED': 'Order created, waiting for payment',
                'FUNDED': 'Payment received and held in escrow',
                'SHIPPED': 'Seller has shipped the item',
                'DELIVERED': 'Item delivered, awaiting confirmation',
                'COMPLETED': 'Transaction completed successfully'
            };

            const nextSteps = {
                'CREATED': 'Complete payment to proceed',
                'FUNDED': 'Seller will ship within 2-3 days',
                'SHIPPED': 'Track your package',
                'DELIVERED': 'Confirm receipt to release funds',
                'COMPLETED': 'Transaction complete'
            };

            const timers = {
                'CREATED': 'Payment expires in 24 hours',
                'FUNDED': 'Auto-refund if not shipped in 7 days',
                'SHIPPED': 'Auto-complete if not disputed in 7 days',
                'DELIVERED': 'Funds released automatically in 3 days',
                'COMPLETED': 'No further action needed'
            };

            return {
                currentStage,
                explanation: explanations[currentStage],
                nextSteps: nextSteps[currentStage],
                timers: timers[currentStage]
            };
        } catch (error) {
            return {
                currentStage: 'UNKNOWN',
                explanation: 'Unable to determine escrow status',
                nextSteps: 'Contact support for assistance',
                timers: 'Unknown'
            };
        }
    }

    async disputeAssistant(orderId, userIssueText, evidenceFiles = []) {
        try {
            const prompt = `Analyze this e-commerce dispute and classify it:
Issue: "${userIssueText}"
Evidence files: ${evidenceFiles.length}

Classify as: non-delivery, wrong-product, scam, delayed-shipping, or other
Recommend resolution: refund, release, partial-refund
Generate a professional dispute summary.`;

            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200
            });

            const response = completion.choices[0].message.content;
            
            // Parse AI response (simplified)
            let classification = 'other';
            let resolution = 'refund';
            
            if (response.toLowerCase().includes('non-delivery')) classification = 'non-delivery';
            else if (response.toLowerCase().includes('wrong')) classification = 'wrong-product';
            else if (response.toLowerCase().includes('scam')) classification = 'scam';
            else if (response.toLowerCase().includes('delay')) classification = 'delayed-shipping';
            
            if (response.toLowerCase().includes('release')) resolution = 'release';
            else if (response.toLowerCase().includes('partial')) resolution = 'partial-refund';

            return {
                classification,
                resolution,
                summary: response,
                confidence: 0.85
            };
        } catch (error) {
            return {
                classification: 'other',
                resolution: 'refund',
                summary: `Dispute: ${userIssueText}. Requires manual review.`,
                confidence: 0.5
            };
        }
    }

    async deepVerify(orderId) {
        // x402 payment required endpoint
        return {
            requiresPayment: true,
            price: process.env.DEEP_SCAN_PRICE || '0.05',
            token: process.env.DEEP_SCAN_TOKEN || 'USDC',
            facilitatorUrl: process.env.X402_FACILITATOR_URL,
            description: 'Deep verification includes blockchain analysis, seller background check, and fraud detection'
        };
    }
}

module.exports = CronosSmartGuardianAgent;
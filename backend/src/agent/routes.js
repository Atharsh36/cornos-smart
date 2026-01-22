const express = require('express');
const CronosSmartGuardianAgent = require('./agent');

const router = express.Router();
const agent = new CronosSmartGuardianAgent();

// Seller Trust Score
router.post('/sellerTrustScore', async (req, res) => {
    try {
        const { productId } = req.body;
        const result = await agent.sellerTrustScore(productId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Listing Risk Analysis
router.post('/listingRiskAnalysis', async (req, res) => {
    try {
        const { productId } = req.body;
        const result = await agent.listingRiskAnalysis(productId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cart Risk Summary
router.post('/cartRiskSummary', async (req, res) => {
    try {
        const { cartItems } = req.body;
        const result = await agent.cartRiskSummary(cartItems);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Transaction Safety Check
router.post('/txSafetyCheck', async (req, res) => {
    try {
        const { orderId, txPreview } = req.body;
        const result = await agent.txSafetyCheck(orderId, txPreview);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Escrow Explainer
router.post('/escrowExplainer', async (req, res) => {
    try {
        const { orderId } = req.body;
        const result = await agent.escrowExplainer(orderId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Dispute Assistant
router.post('/disputeAssistant', async (req, res) => {
    try {
        const { orderId, userIssueText, evidenceFiles } = req.body;
        const result = await agent.disputeAssistant(orderId, userIssueText, evidenceFiles);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Deep Verify (x402 payment required)
router.post('/deepVerify/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await agent.deepVerify(orderId);
        
        if (result.requiresPayment) {
            res.status(402).json({
                success: false,
                message: 'Payment Required',
                data: result
            });
        } else {
            res.json({ success: true, data: result });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
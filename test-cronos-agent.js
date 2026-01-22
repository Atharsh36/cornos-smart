const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/agent';

async function testCronosGuardianAgent() {
    console.log('🤖 Testing CronoSmart Guardian Agent - Full Integration\n');

    try {
        // 1. Test Seller Trust Score
        console.log('1️⃣ Testing Seller Trust Score...');
        const trustResponse = await axios.post(`${BASE_URL}/sellerTrustScore`, {
            productId: '1'
        });
        console.log('✅ Trust Score:', trustResponse.data.data);
        console.log('');

        // 2. Test Listing Risk Analysis
        console.log('2️⃣ Testing Listing Risk Analysis...');
        const riskResponse = await axios.post(`${BASE_URL}/listingRiskAnalysis`, {
            productId: '3' // High risk product
        });
        console.log('✅ Risk Analysis:', riskResponse.data.data);
        console.log('');

        // 3. Test Cart Risk Summary
        console.log('3️⃣ Testing Cart Risk Summary...');
        const cartResponse = await axios.post(`${BASE_URL}/cartRiskSummary`, {
            cartItems: [
                { productId: '1', quantity: 1 },
                { productId: '3', quantity: 2 }
            ]
        });
        console.log('✅ Cart Risk:', cartResponse.data.data);
        console.log('');

        // 4. Test Transaction Safety Check
        console.log('4️⃣ Testing Transaction Safety Check...');
        const safetyResponse = await axios.post(`${BASE_URL}/txSafetyCheck`, {
            orderId: 'order_123',
            txPreview: {
                userAddress: '0x1234567890123456789012345678901234567890',
                escrowAddress: '0x9c088f7387D49cbe6340b9754d6E47D7dE107C5c',
                vaultAddress: '0x57e0dc93157888bfA28E2AcE99b31d75341c2979',
                amount: 0.1,
                sellerAddress: '0x0987654321098765432109876543210987654321'
            }
        });
        console.log('✅ Safety Check:', safetyResponse.data.data);
        console.log('');

        // 5. Test Escrow Explainer
        console.log('5️⃣ Testing Escrow Explainer...');
        const escrowResponse = await axios.post(`${BASE_URL}/escrowExplainer`, {
            orderId: 'order_123'
        });
        console.log('✅ Escrow Explanation:', escrowResponse.data.data);
        console.log('');

        // 6. Test Dispute Assistant
        console.log('6️⃣ Testing Dispute Assistant...');
        const disputeResponse = await axios.post(`${BASE_URL}/disputeAssistant`, {
            orderId: 'order_123',
            userIssueText: 'Product never arrived after 2 weeks',
            evidenceFiles: ['tracking_screenshot.png']
        });
        console.log('✅ Dispute Assistant:', disputeResponse.data.data);
        console.log('');

        // 7. Test Deep Verify (x402)
        console.log('7️⃣ Testing Deep Verify (x402)...');
        try {
            const deepVerifyResponse = await axios.post(`${BASE_URL}/deepVerify/order_123`);
            console.log('✅ Deep Verify:', deepVerifyResponse.data.data);
        } catch (error) {
            if (error.response?.status === 402) {
                console.log('✅ Deep Verify (Payment Required):', error.response.data.data);
            } else {
                throw error;
            }
        }
        console.log('');

        console.log('🎉 All CronoSmart Guardian Agent endpoints working correctly!');
        console.log('🔗 Agent is ready for full website integration');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testCronosGuardianAgent();
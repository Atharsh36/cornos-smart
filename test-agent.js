const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/agent';

async function testAgent() {
    console.log('🧪 Testing CronoSmart Guardian Agent...\n');

    try {
        // Test Seller Trust
        console.log('1. Testing Seller Trust...');
        const trustResponse = await axios.post(`${BASE_URL}/sellerTrust/1`);
        console.log('✅ Seller Trust:', trustResponse.data.data);
        console.log('');

        // Test Transaction Safety
        console.log('2. Testing Transaction Safety...');
        const safetyResponse = await axios.post(`${BASE_URL}/txSafetyCheck`, {
            wallet: '0x1234567890123456789012345678901234567890',
            productId: '1',
            sellerWallet: '0x0987654321098765432109876543210987654321',
            amount: 0.1,
            currency: 'CRO',
            escrowAddress: '0x12a09612eFc1538406f23B78E89a1dB094dc4Ac6'
        });
        console.log('✅ Transaction Safety:', safetyResponse.data.data);
        console.log('');

        // Test Escrow Explanation
        console.log('3. Testing Escrow Explanation...');
        const escrowResponse = await axios.post(`${BASE_URL}/escrowExplain/order123`);
        console.log('✅ Escrow Explanation:', escrowResponse.data.data);
        console.log('');

        console.log('🎉 All agent endpoints working correctly!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

testAgent();
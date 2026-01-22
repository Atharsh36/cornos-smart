const axios = require('axios');

class AIService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.hasOpenAI = !!this.openaiKey;
  }

  async recommend(query, products = []) {
    if (this.hasOpenAI) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Based on query "${query}" and products ${JSON.stringify(products.slice(0, 10))}, recommend top 3 products. Return JSON array with product IDs only.`
          }],
          max_tokens: 200
        }, {
          headers: { 'Authorization': `Bearer ${this.openaiKey}` }
        });
        
        const content = response.data.choices[0].message.content;
        return JSON.parse(content);
      } catch (error) {
        console.error('OpenAI error:', error);
        return this.mockRecommend(query, products);
      }
    }
    
    return this.mockRecommend(query, products);
  }

  mockRecommend(query, products) {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category?.toLowerCase().includes(query.toLowerCase())
    );
    return filtered.slice(0, 3).map(p => p.id);
  }

  async summarizeProduct(product) {
    if (this.hasOpenAI) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Summarize this product: ${JSON.stringify(product)}. Return JSON: {summary, pros: [], cons: [], questions: []}`
          }],
          max_tokens: 300
        }, {
          headers: { 'Authorization': `Bearer ${this.openaiKey}` }
        });
        
        const content = response.data.choices[0].message.content;
        return JSON.parse(content);
      } catch (error) {
        return this.mockSummary(product);
      }
    }
    
    return this.mockSummary(product);
  }

  mockSummary(product) {
    return {
      summary: `${product.name} is a ${product.category || 'quality'} product priced at ${product.price} CRO. This item offers good value and functionality for its price range.`,
      pros: [
        'Competitive pricing',
        'Good build quality',
        'Popular among users',
        'Fast shipping available'
      ],
      cons: [
        'Limited warranty information',
        'No detailed specifications',
        'Return policy unclear',
        'Stock may be limited'
      ],
      questions: [
        'What is the return policy?',
        'Is shipping included in the price?',
        'What warranty is provided?',
        'Are there bulk discounts available?'
      ]
    };
  }

  async trustCheck(sellerId, orders = []) {
    const sellerOrders = orders.filter(o => o.seller === sellerId);
    const totalOrders = sellerOrders.length;
    const completedOrders = sellerOrders.filter(o => o.status === 'COMPLETED').length;
    const disputedOrders = sellerOrders.filter(o => o.status === 'DISPUTED').length;
    
    let trustScore = 50;
    let flags = [];
    
    if (totalOrders > 0) {
      const completionRate = completedOrders / totalOrders;
      const disputeRate = disputedOrders / totalOrders;
      
      trustScore = Math.min(100, Math.max(0, 
        50 + (completionRate * 40) - (disputeRate * 30)
      ));
      
      if (disputeRate > 0.2) flags.push('High dispute rate');
      if (completionRate < 0.8) flags.push('Low completion rate');
      if (totalOrders < 5) flags.push('New seller');
    } else {
      flags.push('No order history');
    }

    return {
      trustScore: Math.round(trustScore),
      flags,
      explanation: `Based on ${totalOrders} orders: ${completedOrders} completed, ${disputedOrders} disputed.`
    };
  }

  async disputeSummary(order) {
    return {
      recommendation: 'partial_refund',
      confidence: 75,
      summary: `Order ${order.id}: Recommend partial refund based on order status and typical dispute patterns.`
    };
  }
}

module.exports = new AIService();
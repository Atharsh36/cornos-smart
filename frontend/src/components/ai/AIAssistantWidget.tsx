import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../utils/constants';

interface AIAssistantWidgetProps {
  products: any[];
  onRecommendations: (productIds: string[]) => void;
}

export default function AIAssistantWidget({ products, onRecommendations }: AIAssistantWidgetProps) {
  const [query, setQuery] = useState('');

  const recommendMutation = useMutation({
    mutationFn: async (searchQuery: string) => {
      try {
        console.log('Making AI request to:', `${API_BASE_URL}/api/ai/recommend`);
        console.log('Request payload:', { query: searchQuery, products: products.slice(0, 5) });
        
        const response = await fetch(`${API_BASE_URL}/api/ai/recommend`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            query: searchQuery, 
            products: products.slice(0, 10) // Limit products to avoid large payload
          })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('AI Recommendations response:', data);
        
        if (!data.success) {
          throw new Error(data.error || 'AI recommendation failed');
        }
        
        return data.data || [];
      } catch (error) {
        console.error('AI Recommendation error:', error);
        // Return mock recommendations as fallback
        const lowerQuery = searchQuery.toLowerCase();
        const keywords = lowerQuery.split(' ').filter(word => word.length > 2);
        
        const scored = products.map(product => {
          let score = 0;
          const name = product.name.toLowerCase();
          const description = (product.description || '').toLowerCase();
          const category = (product.category || '').toLowerCase();
          
          if (name.includes(lowerQuery)) score += 10;
          if (description.includes(lowerQuery)) score += 8;
          if (category.includes(lowerQuery)) score += 6;
          
          keywords.forEach(keyword => {
            if (name.includes(keyword)) score += 5;
            if (description.includes(keyword)) score += 3;
            if (category.includes(keyword)) score += 2;
          });
          
          if (product.price < 50) score += 1;
          return { ...product, score };
        });
        
        const mockRecs = scored
          .filter(p => p.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(p => p.id);
          
        console.log('Using smart mock recommendations:', mockRecs);
        return mockRecs;
      }
    },
    onSuccess: (recommendations) => {
      onRecommendations(recommendations);
      toast.success(`Found ${recommendations.length} AI recommendations!`);
    },
    onError: (error: any) => {
      toast.error('Using mock recommendations due to: ' + error.message);
      console.error('Recommendation error:', error);
    }
  });

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }
    recommendMutation.mutate(query);
  };

  return (
    <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-bold text-white">AI Shopping Assistant</h3>
        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">FREE</span>
      </div>
      
      <p className="text-slate-300 mb-4">Ask AI to find the best products for you</p>
      
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'best gaming headphones under 50 CRO'"
            className="w-full glass-input pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={recommendMutation.isPending}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {recommendMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Ask AI
        </button>
      </div>
    </div>
  );
}
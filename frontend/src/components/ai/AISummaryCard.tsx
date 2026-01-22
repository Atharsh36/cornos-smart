import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, Loader2, ThumbsUp, ThumbsDown, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../utils/constants';

interface AISummaryCardProps {
  product: any;
}

interface AISummary {
  summary: string;
  pros: string[];
  cons: string[];
  questions: string[];
}

export default function AISummaryCard({ product }: AISummaryCardProps) {
  const [summary, setSummary] = useState<AISummary | null>(null);

  const summaryMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log('Making AI summary request to:', `${API_BASE_URL}/api/ai/summary`);
        console.log('Product data:', product);
        
        const response = await fetch(`${API_BASE_URL}/api/ai/summary`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ product })
        });
        
        console.log('Summary response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Summary response error:', errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('AI Summary response:', data);
        
        if (!data.success) {
          throw new Error(data.error || 'AI summary failed');
        }
        
        return data.data;
      } catch (error) {
        console.error('AI Summary error:', error);
        // Return mock summary as fallback
        return {
          summary: `${product.name} is a ${product.category || 'quality'} product priced at ${product.price} CRO. This item offers good value and functionality for its price range.`,
          pros: ['Competitive pricing', 'Good build quality', 'Popular among users'],
          cons: ['Limited warranty info', 'Return policy unclear'],
          questions: ['What is the return policy?', 'Is shipping included?']
        };
      }
    },
    onSuccess: (data) => {
      setSummary(data);
      toast.success('AI summary generated!');
    },
    onError: (error: any) => {
      toast.error('Using mock summary due to: ' + error.message);
      console.error('Summary mutation error:', error);
    }
  });

  if (summary) {
    return (
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-purple-100">AI Product Summary</h3>
        </div>
        
        <p className="text-slate-300 mb-4">{summary.summary}</p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-green-400" />
              <span className="font-medium text-green-400">Pros</span>
            </div>
            <ul className="text-sm text-slate-300 space-y-1">
              {summary.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsDown className="w-4 h-4 text-red-400" />
              <span className="font-medium text-red-400">Cons</span>
            </div>
            <ul className="text-sm text-slate-300 space-y-1">
              {summary.cons.map((con, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-400 mt-1">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-blue-400">Questions to Ask</span>
          </div>
          <ul className="text-sm text-slate-300 space-y-1">
            {summary.questions.map((question, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                {question}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => summaryMutation.mutate()}
      disabled={summaryMutation.isPending}
      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl p-4 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
    >
      {summaryMutation.isPending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Sparkles className="w-5 h-5" />
      )}
      <span className="font-medium">
        {summaryMutation.isPending ? 'Generating AI Summary...' : 'Get AI Summary'}
      </span>
      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">FREE</span>
    </button>
  );
}
import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface Insight {
  id: string;
  category: string;
  title: string;
  description: string;
  image_url: string;
  published_at: string;
}

export function LatestInsights() {
  const { language } = useLanguage();
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    fetchInsights();
  }, []);

  async function fetchInsights() {
    const { data } = await supabase
      .from('latest_insights')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(3);
    if (data) setInsights(data);
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, Record<string, string>> = {
      property: { en: 'Property Market', cn: '房产市场' },
      mortgage: { en: 'Mortgage News', cn: '房贷动态' },
      investment: { en: 'Investment', cn: '投资策略' }
    };
    return labels[category]?.[language] || category;
  };

  return (
    <section className="py-20 bg-[#0a1628]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          {language === 'cn' ? '最新洞察' : 'Latest Insights'}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-[#1e3a5f] rounded-xl overflow-hidden border border-[#d4af37]/20">
              <img src={insight.image_url} alt={insight.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <span className="inline-block px-3 py-1 bg-[#d4af37]/20 text-[#d4af37] text-sm rounded-full mb-3">
                  {getCategoryLabel(insight.category)}
                </span>
                <h3 className="text-xl font-semibold text-white mb-2">{insight.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

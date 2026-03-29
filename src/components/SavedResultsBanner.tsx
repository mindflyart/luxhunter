import React, { useState, useEffect } from 'react';
import { TrendingUp, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SavedResultsBannerProps {
  onViewDetails: () => void;
}

const SavedResultsBanner: React.FC<SavedResultsBannerProps> = ({ onViewDetails }) => {
  const { language } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [borrowingCapacity, setBorrowingCapacity] = useState(0);

  useEffect(() => {
    const savedData = localStorage.getItem('luxhunter_calculator');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.borrowingCapacity) {
          setBorrowingCapacity(parsed.borrowingCapacity);
          setShowBanner(true);
        }
      } catch (error) {
        console.error('Error parsing saved calculator data:', error);
      }
    }
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-gradient-to-r from-[#C9A84C]/20 to-[#C9A84C]/10 border-b border-[#C9A84C]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="p-2 bg-[#C9A84C]/20 rounded-full">
              <TrendingUp className="text-[#C9A84C]" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">
                {language === 'en' ? 'Welcome back!' : '欢迎回来！'}
              </p>
              <p className="text-gray-300 text-sm">
                {language === 'en'
                  ? `Your last estimate: ${formatCurrency(borrowingCapacity)} borrowing capacity.`
                  : `您上次的估算：${formatCurrency(borrowingCapacity)} 借款能力。`}
                <button
                  onClick={onViewDetails}
                  className="ml-2 text-[#C9A84C] hover:text-[#d4b865] underline font-medium"
                >
                  {language === 'en' ? 'View details' : '查看详情'}
                </button>
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close banner"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedResultsBanner;

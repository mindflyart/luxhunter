import React from 'react';
import { Calculator, ArrowDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const BudgetCheckWidget: React.FC = () => {
  const { language } = useLanguage();

  const scrollToCalculator = () => {
    const calculatorSection = document.getElementById('budget-calculator');
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <button
      onClick={scrollToCalculator}
      className="group flex items-center space-x-3 px-8 py-4 bg-transparent border-2 border-[#C9A84C] rounded text-white font-bold text-lg hover:bg-[#C9A84C]/10 transition-all transform hover:scale-105"
    >
      <Calculator className="text-[#C9A84C]" size={20} />
      <span>
        {language === 'en' ? 'Check Your Budget' : '检查您的预算'}
      </span>
      <ArrowDown className="text-[#C9A84C] group-hover:translate-y-1 transition-transform" size={20} />
    </button>
  );
};

export default BudgetCheckWidget;

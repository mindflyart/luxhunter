import React, { useState } from 'react';
import { Calculator as CalcIcon, Home, DollarSign, TrendingUp, PiggyBank } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { calculateStampDuty, type AustralianState } from '../lib/stampDuty';
import { calculateRepayments } from '../lib/ribbonRates';

interface CalculatorProps {
  onGetFreeReport: (data: any) => void;
}

const Calculator: React.FC<CalculatorProps> = ({ onGetFreeReport }) => {
  const { t } = useLanguage();
  const [propertyPrice, setPropertyPrice] = useState<number>(800000);
  const [deposit, setDeposit] = useState<number>(160000);
  const [state, setState] = useState<string>('NSW');
  const [weeklyRent, setWeeklyRent] = useState<number>(650);

  const australianStates = [
    { code: 'NSW', name: 'New South Wales' },
    { code: 'VIC', name: 'Victoria' },
    { code: 'QLD', name: 'Queensland' },
    { code: 'WA', name: 'Western Australia' },
    { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' },
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NT', name: 'Northern Territory' }
  ];

  const loanAmount = propertyPrice - deposit;
  const stampDuty = calculateStampDuty(propertyPrice, state as AustralianState);
  const totalCashRequired = deposit + stampDuty;
  const yearlyRent = weeklyRent * 52;
  const grossYield = propertyPrice > 0 ? (yearlyRent / propertyPrice) * 100 : 0;

  const monthlyRepayment = calculateRepayments(loanAmount, 6.5, 30);
  const yearlyRepayment = monthlyRepayment * 12;
  const netYield = propertyPrice > 0 ? ((yearlyRent - yearlyRepayment) / propertyPrice) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">{t('calculator.title')}</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('calculator.subtitle')}
          </p>
        </div>

        <div className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-8 space-y-6">

          {/* Property Price */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">
              {t('calculator.propertyPrice')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
              <input
                type="number"
                value={propertyPrice || ''}
                onChange={(e) => setPropertyPrice(Number(e.target.value))}
                className="w-full bg-[#0A1628] border border-gray-600 rounded-lg px-10 py-3 text-white text-lg focus:outline-none focus:border-[#C9A84C]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Property Location */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">
              {t('calculator.propertyLocation')}
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-[#0A1628] border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:border-[#C9A84C]"
            >
              {australianStates.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Deposit Amount */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">
              {t('calculator.depositAmount')}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
              <input
                type="number"
                value={deposit || ''}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full bg-[#0A1628] border border-gray-600 rounded-lg px-10 py-3 text-white text-lg focus:outline-none focus:border-[#C9A84C]"
                placeholder="0"
              />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {propertyPrice > 0 && ((deposit / propertyPrice) * 100).toFixed(1)}% of property price
            </p>
          </div>

          {/* Weekly Rent */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2 uppercase tracking-wide">
              Expected Weekly Rent
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
              <input
                type="number"
                value={weeklyRent || ''}
                onChange={(e) => setWeeklyRent(Number(e.target.value))}
                className="w-full bg-[#0A1628] border border-gray-600 rounded-lg px-10 py-3 text-white text-lg focus:outline-none focus:border-[#C9A84C]"
                placeholder="0"
              />
            </div>
          </div>

          {/* Results Summary */}
          {propertyPrice > 0 && (
            <div className="bg-[#0A1628] border border-[#C9A84C]/30 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-bold text-[#C9A84C] mb-4">Investment Summary</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Home size={20} className="text-[#C9A84C]" />
                    <p className="text-sm text-gray-400">Loan Amount</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(loanAmount)}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign size={20} className="text-[#C9A84C]" />
                    <p className="text-sm text-gray-400">Stamp Duty ({state})</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stampDuty)}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <PiggyBank size={20} className="text-[#C9A84C]" />
                    <p className="text-sm text-gray-400">Total Cash Required</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totalCashRequired)}</p>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp size={20} className="text-[#C9A84C]" />
                    <p className="text-sm text-gray-400">Gross Rental Yield</p>
                  </div>
                  <p className="text-2xl font-bold text-white">{grossYield.toFixed(2)}%</p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Monthly Repayment (6.5% over 30 years)</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(monthlyRepayment)}</p>
                  <p className="text-sm text-gray-400 mt-2">Net Yield: {netYield.toFixed(2)}%</p>
                </div>
              </div>

              <div className="pt-4 text-center">
                <button
                  onClick={() => onGetFreeReport({
                    propertyPrice,
                    state,
                    deposit,
                    loanAmount,
                    weeklyRent
                  })}
                  className="px-8 py-3 bg-[#C9A84C] text-[#0A1628] font-bold text-lg rounded hover:bg-[#d4b865] transition-all"
                >
                  Get Free Detailed Report
                </button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="border-t border-gray-700 pt-6">
            <p className="text-xs text-gray-500 italic text-center">
              {t('calculator.disclaimer')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;

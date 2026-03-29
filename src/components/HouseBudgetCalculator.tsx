import React, { useState, useEffect } from 'react';
import { Calculator, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { classifyPostcode, getLVRLimits, calculateLVR, formatCurrency as formatCurr, type LocationClassification } from '../lib/postcodeClassification';

interface CalculatorResults {
  borrowingCapacity: number;
  monthlyRepayment: number;
  stampDuty: number;
  annualIncome: string;
  deposit: string;
  loanTerm: string;
  timestamp: number;
}

interface HouseBudgetCalculatorProps {
  onGetFreeReport: () => void;
}

const AUSTRALIAN_STATES = [
  { value: 'NSW', label: 'New South Wales (NSW)' },
  { value: 'VIC', label: 'Victoria (VIC)' },
  { value: 'QLD', label: 'Queensland (QLD)' },
  { value: 'WA', label: 'Western Australia (WA)' },
  { value: 'SA', label: 'South Australia (SA)' },
  { value: 'TAS', label: 'Tasmania (TAS)' },
  { value: 'ACT', label: 'Australian Capital Territory (ACT)' },
  { value: 'NT', label: 'Northern Territory (NT)' },
];

const HouseBudgetCalculator: React.FC<HouseBudgetCalculatorProps> = ({ onGetFreeReport }) => {
  const { language } = useLanguage();
  const [annualIncome, setAnnualIncome] = useState('');
  const [deposit, setDeposit] = useState('');
  const [loanTerm, setLoanTerm] = useState('30');
  const [selectedState, setSelectedState] = useState('NSW');
  const [postcode, setPostcode] = useState('');
  const [locationClassification, setLocationClassification] = useState<LocationClassification | null>(null);
  const [results, setResults] = useState<CalculatorResults | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showUnlockForm, setShowUnlockForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    fullName: '',
    email: '',
    state: 'NSW',
  });
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('luxhunter_calculator');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setAnnualIncome(parsed.annualIncome);
      setDeposit(parsed.deposit);
      setLoanTerm(parsed.loanTerm);
    }

    const unlocked = localStorage.getItem('lh_unlocked');
    if (unlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const calculateBorrowingCapacity = (income: number): number => {
    return income * 6;
  };

  const calculateMonthlyRepayment = (principal: number, years: number): number => {
    const monthlyRate = 0.06 / 12;
    const numPayments = years * 12;
    const monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    return monthlyPayment;
  };

  const calculateStampDuty = (propertyValue: number): number => {
    if (propertyValue <= 150000) return propertyValue * 0.014;
    if (propertyValue <= 360000) return 2100 + (propertyValue - 150000) * 0.024;
    if (propertyValue <= 725000) return 7140 + (propertyValue - 360000) * 0.06;
    return 29040 + (propertyValue - 725000) * 0.055;
  };

  useEffect(() => {
    if (postcode && postcode.length === 4) {
      const classification = classifyPostcode(postcode, selectedState);
      setLocationClassification(classification);
    } else {
      setLocationClassification(null);
    }
  }, [postcode, selectedState]);

  const handleCalculate = () => {
    const income = parseFloat(annualIncome);
    const depositAmount = parseFloat(deposit);
    const term = parseInt(loanTerm);

    if (!income || !depositAmount || !term || !postcode || postcode.length !== 4) {
      alert(language === 'en' ? 'Please fill in all required fields.' : '请填写所有必填字段。');
      return;
    }

    const borrowing = calculateBorrowingCapacity(income);
    const propertyValue = borrowing + depositAmount;
    const monthly = calculateMonthlyRepayment(borrowing, term);
    const stamp = calculateStampDuty(propertyValue);

    const calculatedResults: CalculatorResults = {
      borrowingCapacity: borrowing,
      monthlyRepayment: monthly,
      stampDuty: stamp,
      annualIncome,
      deposit,
      loanTerm,
      timestamp: Date.now(),
    };

    setResults(calculatedResults);
    setShowResults(true);
  };

  useEffect(() => {
    if (showResults && !isUnlocked) {
      setLeadFormData((prev) => ({ ...prev, state: selectedState }));
    }
  }, [showResults, selectedState, isUnlocked]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leadFormData.fullName || !leadFormData.email || !leadFormData.state) {
      alert(language === 'en' ? 'Please fill in all required fields.' : '请填写所有必填字段。');
      return;
    }

    if (!results) return;

    setIsSubmittingLead(true);

    try {
      const { error } = await supabase.from('calculator_unlocks').insert({
        full_name: leadFormData.fullName,
        email: leadFormData.email,
        state: leadFormData.state,
      });

      if (error) throw error;

      const airtableData = {
        name: leadFormData.fullName,
        email: leadFormData.email,
        phone: '',
        source: 'Calculator',
        interest: ['Property Calculator'],
        budget: parseFloat(deposit) + results.borrowingCapacity,
        notes: `Loan Term: ${loanTerm} years, Postcode: ${postcode}`,
        landingPage: window.location.pathname,
        state: leadFormData.state,
        propertyPrice: parseFloat(deposit) + results.borrowingCapacity,
        deposit: parseFloat(deposit),
        loanTerm: parseInt(loanTerm),
        postcode: postcode,
      };

      console.log('Sending to Airtable:', airtableData);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-to-airtable`;
      const airtableResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(airtableData),
      });

      const airtableResult = await airtableResponse.json();
      console.log('Airtable response:', airtableResult);

      if (!airtableResponse.ok) {
        console.error('Failed to save to Airtable:', airtableResult);
        throw new Error(`Airtable save failed: ${airtableResult.error || 'Unknown error'}`);
      }

      console.log('Successfully saved to Airtable');

      localStorage.setItem('lh_unlocked', 'true');
      setIsUnlocked(true);
      setLeadSubmitted(true);
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert(language === 'en' ? 'Failed to submit. Please try again.' : '提交失败。请重试。');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const handleSaveResults = () => {
    if (results) {
      localStorage.setItem('luxhunter_calculator', JSON.stringify(results));
      alert(language === 'en' ? 'Results saved successfully!' : '结果保存成功！');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-[#C9A84C]/10 to-[#C9A84C]/5 border border-[#C9A84C]/30 rounded-2xl p-8 md:p-10">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-[#C9A84C]/10 rounded-full">
            <Calculator className="text-[#C9A84C]" size={32} />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          {language === 'en' ? 'Your Borrowing Capacity' : '您的贷款能力'}
        </h2>
        <p className="text-gray-300">
          {language === 'en'
            ? 'Calculate your borrowing capacity in seconds'
            : '在几秒钟内计算您的借款能力'}
        </p>
      </div>

      <div className="relative">
        {showResults && results && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#0D1F35] border border-[#C9A84C]/30 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">🏠</div>
                <p className="text-gray-400 text-sm mb-2">
                  {language === 'en' ? 'Borrowing Power' : '借款能力'}
                </p>
                <p className="text-xl font-bold text-white">
                  {!isUnlocked ? '$---,---' : formatCurrency(results.borrowingCapacity)}
                </p>
              </div>
              <div className="bg-[#0D1F35] border border-[#C9A84C]/30 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-gray-400 text-sm mb-2">
                  {language === 'en' ? 'Monthly Repayment' : '月还款额'}
                </p>
                <p className="text-xl font-bold text-white">
                  {!isUnlocked ? '$-,---/mo' : `${formatCurrency(results.monthlyRepayment)}/mo`}
                </p>
              </div>
              <div className="bg-[#0D1F35] border border-[#C9A84C]/30 rounded-lg p-4 text-center">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-gray-400 text-sm mb-2">
                  {language === 'en' ? 'Stamp Duty' : '印花税'}
                </p>
                <p className="text-xl font-bold text-white">
                  {!isUnlocked ? '—' : formatCurrency(results.stampDuty)}
                </p>
              </div>
            </div>

            {!isUnlocked && (
              <div className="bg-[#0A1628]/80 border border-[#C9A84C]/50 rounded-lg p-6 mb-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-[#C9A84C] mb-2">
                    {language === 'en' ? 'Unlock Your Full Results' : '解锁完整结果'}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {language === 'en'
                      ? 'Enter your details to see your borrowing capacity, monthly repayment, and stamp duty estimate.'
                      : '输入您的信息以查看借款能力、月还款额和印花税估算。'}
                  </p>
                </div>

                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        value={leadFormData.fullName}
                        onChange={(e) =>
                          setLeadFormData({ ...leadFormData, fullName: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                        placeholder={language === 'en' ? 'Your Name' : '您的姓名'}
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        value={leadFormData.email}
                        onChange={(e) =>
                          setLeadFormData({ ...leadFormData, email: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                        placeholder={language === 'en' ? 'Your Email' : '您的邮箱'}
                      />
                    </div>
                    <div>
                      <select
                        value={leadFormData.state}
                        onChange={(e) =>
                          setLeadFormData({ ...leadFormData, state: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white focus:outline-none focus:border-[#C9A84C] transition-colors [&>option]:text-gray-900 [&>option]:bg-white"
                      >
                        {AUSTRALIAN_STATES.map((state) => (
                          <option key={state.value} value={state.value}>
                            {state.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isSubmittingLead}
                      className="px-10 py-4 bg-[#C9A84C] text-[#0A1628] font-bold text-lg rounded hover:bg-[#d4b865] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingLead
                        ? language === 'en'
                          ? 'Submitting...'
                          : '提交中...'
                        : language === 'en'
                        ? 'Unlock & View Results'
                        : '解锁并查看结果'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div>
            <label className="block text-[#C9A84C] font-semibold mb-2">
              {language === 'en' ? 'Annual Income' : '年收入'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="120000"
                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[#C9A84C] font-semibold mb-2">
              {language === 'en' ? 'Deposit Amount' : '首付金额'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                placeholder="100000"
                className="w-full pl-8 pr-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[#C9A84C] font-semibold mb-2">
              {language === 'en' ? 'Loan Term (years)' : '贷款期限（年）'}
            </label>
            <select
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white focus:outline-none focus:border-[#C9A84C] transition-colors [&>option]:text-gray-900 [&>option]:bg-white"
            >
              <option value="15">{language === 'en' ? '15 years' : '15年'}</option>
              <option value="20">{language === 'en' ? '20 years' : '20年'}</option>
              <option value="25">{language === 'en' ? '25 years' : '25年'}</option>
              <option value="30">{language === 'en' ? '30 years' : '30年'}</option>
            </select>
          </div>
          <div>
            <label className="block text-[#C9A84C] font-semibold mb-2">
              {language === 'en' ? 'State' : '州'}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white focus:outline-none focus:border-[#C9A84C] transition-colors [&>option]:text-gray-900 [&>option]:bg-white"
            >
              {AUSTRALIAN_STATES.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.value}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[#C9A84C] font-semibold mb-2">
              {language === 'en' ? 'Postcode' : '邮编'}
            </label>
            <input
              type="text"
              value={postcode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPostcode(value);
              }}
              maxLength={4}
              placeholder="2000"
              className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>
        </div>

        {locationClassification && (
          <div className={`mb-6 p-4 rounded-lg border ${
            locationClassification === 'Unacceptable'
              ? 'bg-red-900/20 border-red-500/50'
              : locationClassification === 'High-Risk'
              ? 'bg-yellow-900/20 border-yellow-500/50'
              : 'bg-[#0D1F35]/50 border-[#C9A84C]/30'
          }`}>
            <div className="flex items-start gap-3">
              {(locationClassification === 'Unacceptable' || locationClassification === 'High-Risk') && (
                <AlertTriangle className={locationClassification === 'Unacceptable' ? 'text-red-400' : 'text-yellow-400'} size={20} />
              )}
              <div className="flex-1">
                <p className="text-white font-semibold mb-2">
                  {language === 'en' ? 'Location Classification:' : '地区分类：'} {locationClassification}
                </p>
                {locationClassification === 'Unacceptable' ? (
                  <p className="text-red-300 text-sm">
                    {language === 'en'
                      ? 'This postcode is not acceptable for lending. Please contact us for alternative options.'
                      : '此邮编不接受贷款。请联系我们寻求替代方案。'}
                  </p>
                ) : locationClassification === 'High-Risk' ? (
                  <p className="text-yellow-300 text-sm">
                    {language === 'en'
                      ? 'This postcode is classified as high-risk and may have additional restrictions.'
                      : '此邮编被归类为高风险，可能有额外限制。'}
                  </p>
                ) : (
                  (() => {
                    const limits = getLVRLimits(locationClassification);
                    return limits ? (
                      <div className="text-sm text-gray-300 space-y-1">
                        <p className="font-semibold text-[#C9A84C]">
                          {language === 'en' ? 'Loan Amount Limits by LVR:' : 'LVR贷款金额限制：'}
                        </p>
                        <p>• 0-70% LVR: {formatCurr(limits.lvr0_70)}</p>
                        <p>• 70-80% LVR: {formatCurr(limits.lvr70_80)}</p>
                        {limits.lvr80_90 ? (
                          <p>• 80-90% LVR: {formatCurr(limits.lvr80_90)}</p>
                        ) : (
                          <p className="text-gray-500">• 80-90% LVR: {language === 'en' ? 'Not available' : '不可用'}</p>
                        )}
                        {limits.lvr90_95 ? (
                          <p>• 90-95% LVR: {formatCurr(limits.lvr90_95)}</p>
                        ) : (
                          <p className="text-gray-500">• 90-95% LVR: {language === 'en' ? 'Not available' : '不可用'}</p>
                        )}
                      </div>
                    ) : null;
                  })()
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-6">
          <button
            onClick={handleCalculate}
            className="px-10 py-4 bg-[#C9A84C] text-[#0A1628] font-bold text-lg rounded hover:bg-[#d4b865] transition-all transform hover:scale-105"
          >
            {language === 'en' ? 'Calculate Now' : '立即计算'}
          </button>
        </div>

        {showResults && results && isUnlocked && (
          <div className="bg-white/5 border border-[#C9A84C]/30 rounded-lg p-6 md:p-8">
            {leadSubmitted && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center justify-center space-x-2">
                <CheckCircle className="text-green-400" size={20} />
                <p className="text-green-300 font-semibold">
                  {language === 'en'
                    ? 'Results unlocked! Thank you for your details.'
                    : '结果已解锁！感谢您提供信息。'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSaveResults}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/10 border border-[#C9A84C]/30 text-white font-semibold rounded hover:bg-white/20 transition-colors"
              >
                <Save size={20} />
                <span>{language === 'en' ? 'Save My Results' : '保存结果'}</span>
              </button>
              <a
                href="https://www.ribbonfinance.com.au/apply"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-bold rounded hover:bg-[#d4b865] transition-colors text-center"
              >
                {language === 'en' ? 'Get Expert Assessment' : '获取专家评估'}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseBudgetCalculator;

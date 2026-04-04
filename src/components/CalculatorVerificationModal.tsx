import React, { useState } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface CalculatorVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSent?: () => void;
  calculatorResults: {
    borrowingCapacity: number;
    monthlyRepayment: number;
    stampDuty: number;
    annualIncome: string;
    deposit: string;
    loanTerm: string;
    postcode: string;
    state: string;
    locationClassification?: string;
  };
}

const CalculatorVerificationModal: React.FC<CalculatorVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerificationSent,
  calculatorResults
}) => {
  const { language } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const propertyPrice = parseFloat(calculatorResults.deposit) + calculatorResults.borrowingCapacity;

      const leadData = {
        name: fullName,
        email,
        state: calculatorResults.state,
        source: 'Calculator',
        propertyPrice,
        deposit: parseFloat(calculatorResults.deposit),
        loanTerm: parseInt(calculatorResults.loanTerm),
        postcode: calculatorResults.postcode,
        annualIncome: parseFloat(calculatorResults.annualIncome),
        borrowingCapacity: calculatorResults.borrowingCapacity,
        monthlyRepayment: calculatorResults.monthlyRepayment,
        stampDuty: calculatorResults.stampDuty,
        locationClassification: calculatorResults.locationClassification || 'N/A',
      };

      const response = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: fullName,
          type: 'verification',
          leadData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification email');
      }

      setSubmitted(true);
      if (onVerificationSent) {
        onVerificationSent();
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(language === 'en' ? 'Failed to send verification email. Please try again.' : '发送验证邮件失败。请重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-[#0A1628] border border-[#C9A84C]/30 rounded-lg max-w-md w-full p-8 relative text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-500/10 rounded-full">
              <CheckCircle className="text-green-400" size={48} />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-4">
            {language === 'en' ? 'Your Results Have Been Sent!' : '您的结果已发送！'}
          </h2>

          <p className="text-gray-300 mb-6 leading-relaxed">
            {language === 'en'
              ? `Check your email inbox for your complete borrowing capacity report sent to ${email}.`
              : `检查您的电子邮件收件箱，查看发送至 ${email} 的完整借款能力报告。`}
          </p>

          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-300">
              {language === 'en'
                ? "Don't see it? Check your spam folder."
                : '看不到？检查您的垃圾邮件文件夹。'}
            </p>
          </div>

          <a
            href="/contact"
            className="block w-full px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-bold rounded hover:bg-[#d4b865] transition-colors text-center"
          >
            {language === 'en' ? 'Book a Free Consultation' : '预约免费咨询'}
          </a>

          <button
            onClick={onClose}
            className="mt-4 text-gray-400 hover:text-white transition-colors text-sm"
          >
            {language === 'en' ? 'Close' : '关闭'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0A1628] border border-[#C9A84C]/30 rounded-lg max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#C9A84C]/10 rounded-full">
            <Mail className="text-[#C9A84C]" size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {language === 'en' ? 'Unlock Your Full Results' : '解锁完整结果'}
        </h2>

        <p className="text-gray-400 text-center mb-6">
          {language === 'en'
            ? 'Enter your details to receive your full calculator results and detailed property report via email'
            : '输入您的信息，通过电子邮件接收完整的计算器结果和详细的房产报告'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder={language === 'en' ? 'Full Name' : '您的姓名'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder={language === 'en' ? 'Email Address' : '您的邮箱'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-bold rounded hover:bg-[#d4b865] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? (language === 'en' ? 'Sending...' : '发送中...')
              : (language === 'en' ? 'Send Verification Email' : '发送验证邮件')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CalculatorVerificationModal;

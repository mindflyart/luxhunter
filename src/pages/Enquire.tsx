import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Send, CheckCircle } from 'lucide-react';

const Enquire: React.FC = () => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    state: '',
    propertyType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const australianStates = [
    { value: '', label: language === 'en' ? 'Select State' : '选择州' },
    { value: 'NSW', label: 'NSW' },
    { value: 'VIC', label: 'VIC' },
    { value: 'QLD', label: 'QLD' },
    { value: 'WA', label: 'WA' },
    { value: 'SA', label: 'SA' },
    { value: 'TAS', label: 'TAS' },
    { value: 'ACT', label: 'ACT' },
    { value: 'NT', label: 'NT' },
  ];

  const propertyTypes = language === 'en'
    ? [
        { value: '', label: 'Select Property Type Interest' },
        { value: 'first-home', label: 'First Home' },
        { value: 'investment', label: 'Investment' },
        { value: 'refinance', label: 'Refinance' },
        { value: 'commercial', label: 'Commercial' },
      ]
    : [
        { value: '', label: '选择房产类型兴趣' },
        { value: 'first-home', label: '首次购房' },
        { value: 'investment', label: '投资' },
        { value: 'refinance', label: '再融资' },
        { value: 'commercial', label: '商业' },
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.state || !formData.propertyType) {
      alert(language === 'en' ? 'Please fill in all required fields.' : '请填写所有必填字段。');
      return;
    }

    setIsSubmitting(true);

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        state: '',
        propertyType: '',
        message: '',
      });

      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#C9A84C]/10 rounded-full">
              <Send className="text-[#C9A84C]" size={48} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'en' ? 'Make an Enquiry' : '提交咨询'}
          </h1>
          <p className="text-gray-400 text-lg">
            {language === 'en'
              ? 'Let us know how we can help you achieve your property goals'
              : '让我们知道如何帮助您实现房产目标'}
          </p>
        </div>

        {showSuccess && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-6 mb-8 flex items-center space-x-3">
            <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
            <div>
              <p className="text-green-300 font-semibold">
                {language === 'en' ? 'Enquiry Submitted Successfully!' : '咨询提交成功！'}
              </p>
              <p className="text-green-400 text-sm mt-1">
                {language === 'en'
                  ? 'Thank you for your enquiry. Our team will contact you shortly.'
                  : '感谢您的咨询。我们的团队将很快与您联系。'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-[#C9A84C] font-semibold mb-2">
                {language === 'en' ? 'Full Name' : '全名'} *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0A1628] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                placeholder={language === 'en' ? 'John Smith' : '张三'}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#C9A84C] font-semibold mb-2">
                {language === 'en' ? 'Email' : '邮箱'} *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0A1628] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[#C9A84C] font-semibold mb-2">
                {language === 'en' ? 'Phone' : '电话'}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#0A1628] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                placeholder={language === 'en' ? '+61 4XX XXX XXX' : '+61 4XX XXX XXX'}
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-[#C9A84C] font-semibold mb-2">
                {language === 'en' ? 'State' : '州'} *
              </label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0A1628] border border-gray-600 rounded text-white focus:outline-none focus:border-[#C9A84C] transition-colors [&>option]:text-gray-900 [&>option]:bg-white"
              >
                {australianStates.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Type Interest */}
            <div>
              <label className="block text-[#C9A84C] font-semibold mb-2">
                {language === 'en' ? 'Property Type Interest' : '房产类型兴趣'} *
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                required
                className="w-full px-4 py-3 bg-[#0A1628] border border-gray-600 rounded text-white focus:outline-none focus:border-[#C9A84C] transition-colors [&>option]:text-gray-900 [&>option]:bg-white"
              >
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-[#C9A84C] font-semibold mb-2">
                {language === 'en' ? 'Message' : '留言'}
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 bg-[#0A1628] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors resize-none"
                placeholder={
                  language === 'en'
                    ? 'Tell us about your property goals and how we can help...'
                    : '告诉我们您的房产目标以及我们如何帮助您...'
                }
              />
            </div>

            {/* Submit Button */}
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-10 py-4 bg-[#C9A84C] text-[#0A1628] font-bold text-lg rounded hover:bg-[#d4b865] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting
                  ? language === 'en'
                    ? 'Submitting...'
                    : '提交中...'
                  : language === 'en'
                  ? 'Submit Enquiry'
                  : '提交咨询'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            {language === 'en'
              ? 'By submitting this form, you agree to be contacted by LuxHunter and our licensed partner Ribbon Finance regarding your enquiry.'
              : '提交此表格即表示您同意 LuxHunter 和我们的持牌合作伙伴 Ribbon Finance 就您的咨询与您联系。'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Enquire;

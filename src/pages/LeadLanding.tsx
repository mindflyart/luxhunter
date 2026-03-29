import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const LeadLanding: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: [] as string[],
    budget: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInterestChange = (value: string) => {
    setFormData(prev => {
      const interests = prev.interest.includes(value)
        ? prev.interest.filter(i => i !== value)
        : [...prev.interest, value];
      return { ...prev, interest: interests };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      alert('请填写所有必填字段');
      return;
    }

    setIsSubmitting(true);

    try {
      const airtableData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: 'Landing Page',
        interest: formData.interest,
        budget: parseInt(formData.budget) || 0,
        notes: formData.notes,
        landingPage: window.location.pathname,
      };

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-to-airtable`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(airtableData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        interest: [],
        budget: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <section className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1a1a] mb-6">
            澳洲房产投资<br />首购者完整指南
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">
            专业的房产顾问与贷款优化服务，帮您找到最优购房方案，节省数万利息
          </p>
        </div>
      </section>

      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-12">
            为什么90%的澳洲购房者多付了数万利息？
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#FEF3C7] rounded-xl p-8 text-left">
              <h3 className="text-2xl font-bold text-[#92400e] mb-4">收入不够银行要求？</h3>
              <p className="text-gray-700">
                很多优质贷款产品因为不了解而错过，银行不会主动告诉您有更好的选择
              </p>
            </div>
            <div className="bg-[#FEF3C7] rounded-xl p-8 text-left">
              <h3 className="text-2xl font-bold text-[#92400e] mb-4">担心多付数万利息？</h3>
              <p className="text-gray-700">
                随便选的贷款方案，可能让您多付 $50,000+ 利息，差别就在贷款结构
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1a1a1a] mb-12">
            LuxHunter 为您提供
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-[#059669] mb-6">房产顾问服务</h3>
              <ul className="space-y-3">
                {['房源搜索与筛选', '市场分析与估值', '谈判与出价代表', '尽职调查与验房', '拍卖现场支持'].map(item => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="text-[#059669] mr-2 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-[#059669] mb-6">贷款优化服务</h3>
              <ul className="space-y-3">
                {['贷款产品比较', '利率谈判', '申请流程管理', '再融资方案', '收入灵活方案'].map(item => (
                  <li key={item} className="flex items-start">
                    <CheckCircle className="text-[#059669] mr-2 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-8">
            普通人的澳洲房产梦<br />从这一步开始
          </h2>
          <div className="bg-white/60 backdrop-blur rounded-xl p-8 mb-8">
            <p className="text-lg md:text-xl text-gray-800 italic leading-relaxed">
              "我见过太多人因为收入不够被银行拒绝，或者随便选了贷款多付了数万利息。其实有更好的渠道，只是银行不会告诉您。我们 LuxHunter 整合了澳洲最优的房产和贷款顾问，帮您找到一般人找不到的解决方案。恭喜您，已经打开了激发您购房能力的第一步。"
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-4">
              获取您的免费房产报告
            </h2>
            <p className="text-lg text-gray-600">
              输入您的信息，我们将发送个性化分析报告到您的邮箱
            </p>
          </div>

          {submitted ? (
            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-8 text-center">
              <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold text-green-800 mb-2">感谢您的提交！</h3>
              <p className="text-green-700">我们将尽快发送报告到您的邮箱。</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 rounded-xl p-8">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  姓名 *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  邮箱 *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  电话 *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  您感兴趣的服务
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'Property Advisory', label: '房产顾问服务' },
                    { value: 'Home Loan', label: '房屋贷款' },
                    { value: 'Investment Loan', label: '投资贷款' },
                    { value: 'Refinancing', label: '再融资' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.interest.includes(option.value)}
                        onChange={() => handleInterestChange(option.value)}
                        className="w-4 h-4 text-[#f59e0b] border-gray-300 rounded focus:ring-[#f59e0b]"
                      />
                      <span className="text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 mb-2">
                  预算范围（澳元）
                </label>
                <input
                  type="number"
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="例如：800000"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f59e0b] transition-colors"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
                  备注
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  placeholder="告诉我们您的具体需求..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#f59e0b] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#1a1a1a] text-white text-lg font-bold rounded-lg hover:bg-[#374151] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '提交中...' : '获取免费报告'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="bg-[#1a1a1a] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">&copy; 2026 LuxHunter. All rights reserved.</p>
          <p className="text-gray-500 text-sm mt-2">专业服务，值得信赖</p>
        </div>
      </footer>
    </div>
  );
};

export default LeadLanding;

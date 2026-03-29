import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FAQ {
  question: {
    en: string;
    cn: string;
  };
  answer: {
    en: string;
    cn: string;
  };
}

const FAQSection: React.FC = () => {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: {
        en: 'How much can I borrow for a home loan in Australia?',
        cn: '在澳大利亚我能借多少房贷？'
      },
      answer: {
        en: 'Your borrowing capacity depends on your income, expenses, deposit, and the lender\'s assessment. As a general guide, lenders will typically loan up to 6x your annual income, subject to responsible lending checks. Use our borrowing calculator above for a personalised estimate.',
        cn: '您的借款能力取决于您的收入、支出、首付款以及贷款方的评估。一般来说，贷款方通常可提供最高年收入6倍的贷款，但需符合负责任贷款要求。请使用上方的借款计算器获取个性化估算。'
      }
    },
    {
      question: {
        en: 'What deposit do I need to buy a property in Australia?',
        cn: '在澳大利亚购房需要多少首付？'
      },
      answer: {
        en: 'Most lenders require a minimum 5–10% deposit. With less than 20% deposit, you\'ll typically need to pay Lenders Mortgage Insurance (LMI). A 20% deposit avoids LMI and gives you access to more competitive rates. First home buyers may also qualify for government grants and stamp duty exemptions.',
        cn: '大多数贷款方要求最低5至10%的首付款。若首付不足20%，通常需要支付贷款抵押保险（LMI）。首付达到20%可免除LMI，并获得更具竞争力的利率。首次购房者还可能符合政府补贴和印花税豁免资格。'
      }
    },
    {
      question: {
        en: 'What is stamp duty and do I have to pay it?',
        cn: '什么是印花税，我需要支付吗？'
      },
      answer: {
        en: 'Stamp duty (also called transfer duty) is a state government tax paid when you purchase property. The amount varies by state and property value. First home buyers may be eligible for concessions or full exemptions. Our stamp duty calculator shows the exact amount for each Australian state.',
        cn: '印花税（也称转让税）是购买房产时需缴纳的州政府税款。税额因州和房产价值而异。首次购房者可能有资格享受优惠或全额豁免。我们的印花税计算器可显示澳大利亚各州的具体税额。'
      }
    },
    {
      question: {
        en: 'What\'s the difference between fixed and variable home loans?',
        cn: '固定利率和浮动利率房贷有什么区别？'
      },
      answer: {
        en: 'A fixed rate loan locks your interest rate for a set period (usually 1–5 years), giving you certainty on repayments. A variable rate loan moves with market changes — rates can go up or down. Many borrowers choose a split loan combining both. Our advisers can help you choose the right structure.',
        cn: '固定利率贷款将您的利率锁定在设定期限内（通常为1至5年），让您的还款额度更加确定。浮动利率贷款会随市场变化而变动——利率可能上升或下降。许多借款人选择将两者结合的拆分贷款。我们的顾问可以帮助您选择合适的结构。'
      }
    },
    {
      question: {
        en: 'Does LuxHunter hold an Australian Credit Licence?',
        cn: 'LuxHunter 持有澳大利亚信贷牌照吗？'
      },
      answer: {
        en: 'LuxHunter operates as a property advisory service and does not hold an Australian Credit Licence (ACL). All credit assistance and official loan applications are provided through our licensed partner, Ribbon Finance Mortgage Management Pty Ltd (ACL 525880). Any personalised credit advice will be provided by Ribbon Finance in compliance with the National Consumer Credit Protection Act 2009.',
        cn: 'LuxHunter 作为房产顾问服务平台运营，不持有澳大利亚信贷牌照（ACL）。所有信贷协助和正式贷款申请均通过我们的持牌合作伙伴 Ribbon Finance Mortgage Management Pty Ltd（ACL 525880）提供。个性化信贷建议将由 Ribbon Finance 依据《2009年国家消费者信贷保护法》提供。'
      }
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-gradient-to-b from-transparent to-[#C9A84C]/5 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            {language === 'en' ? 'Common Questions' : '常见问题'}
          </h2>
          <p className="text-gray-400 text-lg">
            {language === 'en'
              ? 'Find answers to frequently asked questions about our services'
              : '查找有关我们服务的常见问题解答'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white/5 border border-[#C9A84C]/20 rounded-lg overflow-hidden hover:border-[#C9A84C]/40 transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {language === 'en' ? faq.question.en : faq.question.cn}
                </h3>
                <div className="flex-shrink-0">
                  {openIndex === index ? (
                    <ChevronUp className="text-[#C9A84C]" size={24} />
                  ) : (
                    <ChevronDown className="text-[#C9A84C]" size={24} />
                  )}
                </div>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5 pt-2">
                  <div className="border-t border-[#C9A84C]/20 pt-4">
                    <p className="text-gray-300 leading-relaxed">
                      {language === 'en' ? faq.answer.en : faq.answer.cn}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-400 mb-4">
            {language === 'en'
              ? 'Still have questions?'
              : '还有其他问题？'}
          </p>
          <p className="text-sm text-gray-500">
            {language === 'en'
              ? 'Contact us for personalized advice and support.'
              : '联系我们获取个性化建议和支持。'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;

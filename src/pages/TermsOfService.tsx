import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TermsOfServiceProps {
  onNavigate?: (page: string) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [privacyRead, setPrivacyRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const content = {
    en: {
      title: 'Terms of Service',
      privacySection: {
        title: 'Privacy Policy Acknowledgment',
        intro: 'Before using our services, you must read and acknowledge our Privacy Policy.',
        checkbox: 'I have read and agree to the Privacy Policy',
        viewButton: 'View Privacy Policy',
        warning: 'Please read the Privacy Policy before proceeding'
      },
      termsSection: {
        title: 'Terms and Conditions',
        checkbox: 'I agree to the Terms and Conditions',
        items: [
          'LuxHunter operates as a property advisory service and does not hold an Australian Credit Licence (ACL)',
          'All credit assistance is provided through Ribbon Finance Mortgage Management Pty Ltd (ACL 525880)',
          'Services are provided in accordance with the National Consumer Credit Protection Act 2009',
          'All advice is general in nature and not personal financial advice',
          'Users must verify all information independently before making decisions'
        ]
      },
      consent: {
        title: 'Consent and Acknowledgment',
        text: 'By checking the boxes above and using our services, you acknowledge that you have read, understood, and agree to be bound by these terms and our Privacy Policy.',
        button: 'I Acknowledge and Agree'
      }
    },
    cn: {
      title: '服务条款',
      privacySection: {
        title: '隐私政策确认',
        intro: '在使用我们的服务之前，您必须阅读并确认我们的隐私政策。',
        checkbox: '我已阅读并同意隐私政策',
        viewButton: '查看隐私政策',
        warning: '请在继续之前阅读隐私政策'
      },
      termsSection: {
        title: '条款和条件',
        checkbox: '我同意条款和条件',
        items: [
          'LuxHunter 作为房产顾问服务平台运营，不持有澳大利亚信贷牌照（ACL）',
          '所有信贷协助均由 Ribbon Finance Mortgage Management Pty Ltd（ACL 525880）提供',
          '服务依据《2009年国家消费者信贷保护法》提供',
          '所有建议均为一般性建议，不构成个人财务建议',
          '用户在做出决定前必须独立核实所有信息'
        ]
      },
      consent: {
        title: '同意和确认',
        text: '通过勾选上述选项并使用我们的服务，您确认已阅读、理解并同意受这些条款和我们的隐私政策的约束。',
        button: '我确认并同意'
      }
    }
  };

  const c = content[language];

  const handleAcknowledge = () => {
    if (!privacyRead || !termsAccepted) {
      alert(language === 'cn' ? '请先阅读并同意隐私政策和条款' : 'Please read and agree to Privacy Policy and Terms');
      return;
    }
    localStorage.setItem('lh_terms_accepted', 'true');
    localStorage.setItem('lh_terms_date', new Date().toISOString());
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const handleViewPrivacy = () => {
    if (onNavigate) {
      onNavigate('privacy-policy');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">{c.title}</h1>

        <div className="bg-[#1e3a5f] rounded-xl p-6 border border-[#C9A84C]/20 mb-6">
          <h2 className="text-2xl font-semibold text-[#C9A84C] mb-4">{c.privacySection.title}</h2>
          <p className="text-gray-300 mb-4">{c.privacySection.intro}</p>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="privacy-read"
              checked={privacyRead}
              onChange={(e) => setPrivacyRead(e.target.checked)}
              className="w-5 h-5 accent-[#C9A84C] cursor-pointer"
            />
            <label htmlFor="privacy-read" className="text-white cursor-pointer">
              {c.privacySection.checkbox}
            </label>
          </div>

          <button
            onClick={handleViewPrivacy}
            className="text-[#C9A84C] hover:text-[#e5c158] underline transition-colors"
          >
            {c.privacySection.viewButton} →
          </button>

          {!privacyRead && (
            <p className="text-yellow-500 text-sm mt-2">{c.privacySection.warning}</p>
          )}
        </div>

        <div className="bg-[#1e3a5f] rounded-xl p-6 border border-[#C9A84C]/20 mb-6">
          <h2 className="text-2xl font-semibold text-[#C9A84C] mb-4">{c.termsSection.title}</h2>

          <ul className="list-disc list-inside space-y-3 text-gray-300 mb-6">
            {c.termsSection.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="terms-accepted"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-5 h-5 accent-[#C9A84C] cursor-pointer"
            />
            <label htmlFor="terms-accepted" className="text-white cursor-pointer">
              {c.termsSection.checkbox}
            </label>
          </div>
        </div>

        <div className="bg-[#1e3a5f] rounded-xl p-6 border border-[#C9A84C]/20 text-center">
          <h3 className="text-xl font-semibold text-white mb-3">{c.consent.title}</h3>
          <p className="text-gray-300 mb-6">{c.consent.text}</p>

          <button
            onClick={handleAcknowledge}
            disabled={!privacyRead || !termsAccepted}
            className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
              privacyRead && termsAccepted
                ? 'bg-[#C9A84C] text-[#0a1628] hover:bg-[#e5c158]'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {c.consent.button}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

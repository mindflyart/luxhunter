import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const cityLinksEN = "Property Advisory Sydney | Property Advisory Melbourne | Property Advisory Brisbane | Property Advisory Perth | Property Advisory Adelaide | Mortgage Broker Sydney | Mortgage Broker Melbourne | Home Loans Australia";
  const cityLinksCN = "悉尼房产顾问 | 墨尔本房产顾问 | 布里斯班房产顾问 | 珀斯房产顾问 | 阿德莱德房产顾问 | 悉尼贷款经纪人 | 墨尔本贷款经纪人 | 澳大利亚房贷";

  const seoDescEN = "LuxHunter provides expert property advisory and mortgage strategy services across Sydney, Melbourne, Brisbane, Perth and Adelaide. Our licensed partner Ribbon Finance (ACL 525880) helps Australian home buyers, investors and upgraders access competitive home loans, investment loans and commercial finance. Whether you're buying your first home, refinancing, or growing a property portfolio, LuxHunter is your trusted guide to Australian property.";
  const seoDescCN = "LuxHunter 为悉尼、墨尔本、布里斯班、珀斯和阿德莱德提供专业的房产顾问和贷款策略服务。我们的持牌合作伙伴 Ribbon Finance（ACL 525880）帮助澳大利亚购房者、投资者和换房者获得具竞争力的自住贷款、投资贷款和商业融资。无论您是首次购房、再融资，还是扩大房产投资组合，LuxHunter 都是您值得信赖的澳大利亚房产向导。";

  return (
    <footer className="bg-[#0A1628] border-t border-[#C9A84C]/20">
      {/* SEO Footer Section */}
      <div className="bg-[#081221] border-b border-[#C9A84C]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* City Links */}
          <div className="text-center mb-6">
            <p className="text-[#C9A84C] text-sm leading-relaxed">
              {language === 'en' ? cityLinksEN : cityLinksCN}
            </p>
          </div>
          {/* SEO Description */}
          <div className="text-center">
            <p className="text-gray-500 text-xs leading-relaxed max-w-5xl mx-auto">
              {language === 'en' ? seoDescEN : seoDescCN}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 border-b border-[#C9A84C]/10">
          <p className="text-[#C9A84C]/70 text-xs text-center leading-relaxed max-w-4xl mx-auto">
            {t('footer.disclaimer')}
          </p>
        </div>
        <div className="py-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center space-x-3">
            <img
              src="https://files.catbox.moe/4q65bc.jpg"
              alt="LuxHunter - Premium Property Services"
              style={{ height: '64px', width: 'auto' }}
            />
            <p className="text-gray-400 text-sm">
              © {currentYear} LuxHunter. {t('footer.rights')}.
            </p>
          </div>
          <div className="flex space-x-6">
            <button
              onClick={() => onNavigate('privacy-policy')}
              className="text-gray-400 hover:text-[#C9A84C] transition-colors text-sm"
            >
              {t('footer.privacy')}
            </button>
            <button
              onClick={() => onNavigate('terms-of-service')}
              className="text-gray-400 hover:text-[#C9A84C] transition-colors text-sm"
            >
              {t('footer.terms')}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

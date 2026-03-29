import React, { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onGetFreeReport: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, onGetFreeReport }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { key: 'home', label: t('nav.home') },
    { key: 'services', label: t('nav.services') },
    { key: 'calculator', label: t('nav.calculator') },
    { key: 'about', label: t('nav.about') },
    { key: 'contact', label: t('nav.contact') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  return (
    <nav className="bg-[#0A1628] border-b border-[#C9A84C]/20 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center"
            >
              <img
                src="https://files.catbox.moe/4q65bc.jpg"
                alt="LuxHunter - Premium Property Services"
                style={{ height: '80px', width: 'auto' }}
              />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.key
                    ? 'text-[#C9A84C]'
                    : 'text-gray-300 hover:text-[#C9A84C]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={onGetFreeReport}
              className="px-6 py-2 bg-[#C9A84C] text-[#0A1628] font-semibold rounded hover:bg-[#d4b865] transition-colors"
            >
              {t('hero.cta')}
            </button>
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-300 hover:text-[#C9A84C] transition-colors"
            >
              <Globe size={18} />
              <span className="text-sm font-medium">{language === 'en' ? 'EN' : '中文'}</span>
            </button>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="text-gray-300 hover:text-[#C9A84C] transition-colors"
            >
              <Globe size={20} />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-[#C9A84C]"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-[#0A1628] border-t border-[#C9A84C]/20">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left py-2 text-sm font-medium transition-colors ${
                  currentPage === item.key
                    ? 'text-[#C9A84C]'
                    : 'text-gray-300 hover:text-[#C9A84C]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onGetFreeReport();
                setIsMenuOpen(false);
              }}
              className="w-full px-6 py-2 bg-[#C9A84C] text-[#0A1628] font-semibold rounded hover:bg-[#d4b865] transition-colors"
            >
              {t('hero.cta')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;

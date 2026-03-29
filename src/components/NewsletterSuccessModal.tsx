import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NewsletterSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewsletterSuccessModal: React.FC<NewsletterSuccessModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#0D1F35] border-2 border-[#C9A84C] rounded-2xl p-8 max-w-md w-full relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-500/10 rounded-full">
              <CheckCircle className="text-green-400" size={64} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            {language === 'en' ? "You're subscribed!" : '订阅成功！'}
          </h2>

          <p className="text-gray-300 leading-relaxed mb-8">
            {language === 'en'
              ? "Thank you for subscribing to LuxHunter updates. We'll send you the latest property insights to your inbox."
              : '感谢您订阅 LuxHunter 更新。我们将把最新的房产资讯发送到您的邮箱。'}
          </p>

          <button
            onClick={onClose}
            className="px-8 py-3 bg-[#C9A84C] text-[#0A1628] font-bold rounded hover:bg-[#d4b865] transition-colors w-full"
          >
            {language === 'en' ? 'Close' : '关闭'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSuccessModal;

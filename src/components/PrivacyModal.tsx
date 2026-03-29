import React from 'react';
import { X, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookConsultation: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, onBookConsultation }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0A1628] border border-[#C9A84C]/30 rounded-lg max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#C9A84C]/10 rounded-full">
            <Shield className="text-[#C9A84C]" size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-4">
          {t('modal.privacy.title')}
        </h2>

        <p className="text-gray-300 leading-relaxed mb-6">{t('modal.privacy.message')}</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onBookConsultation}
            className="flex-1 px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-semibold rounded hover:bg-[#d4b865] transition-colors"
          >
            {t('modal.privacy.continue')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white/5 border border-[#C9A84C]/30 text-white font-semibold rounded hover:bg-white/10 transition-colors"
          >
            {t('modal.privacy.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;

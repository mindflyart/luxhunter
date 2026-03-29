import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const FloatingChatBot: React.FC = () => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-[#C9A84C] rounded-full shadow-2xl hover:bg-[#d4b865] transition-all transform hover:scale-110"
        aria-label={t('chat.button')}
      >
        {isOpen ? (
          <X className="text-[#0A1628]" size={28} />
        ) : (
          <MessageCircle className="text-[#0A1628]" size={28} />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-[#0A1628] border-2 border-[#C9A84C] rounded-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-gradient-to-r from-[#C9A84C] to-[#d4b865] p-4">
            <h3 className="text-[#0A1628] font-bold text-lg">
              {language === 'en' ? 'Talk to an Expert' : '联系专家'}
            </h3>
            <p className="text-[#0A1628]/80 text-sm">
              {language === 'en' ? 'Choose your preferred method' : '选择您喜欢的方式'}
            </p>
          </div>

          <div className="p-4 space-y-3">
            <a
              href="https://t.me/luxhunterbot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-4 bg-white/5 border border-[#C9A84C]/20 rounded-lg hover:border-[#C9A84C] hover:bg-white/10 transition-all group"
            >
              <div className="p-3 bg-[#C9A84C]/10 rounded-full group-hover:bg-[#C9A84C]/20 transition-colors">
                <Send className="text-[#C9A84C]" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">Telegram</h4>
                <p className="text-gray-400 text-sm">
                  {language === 'en' ? 'Chat instantly' : '即时聊天'}
                </p>
              </div>
            </a>

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-4 bg-white/5 border border-[#C9A84C]/20 rounded-lg hover:border-[#C9A84C] hover:bg-white/10 transition-all group"
            >
              <div className="p-3 bg-[#C9A84C]/10 rounded-full group-hover:bg-[#C9A84C]/20 transition-colors">
                <MessageCircle className="text-[#C9A84C]" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">WhatsApp</h4>
                <p className="text-gray-400 text-sm">
                  {language === 'en' ? 'Message us now' : '现在给我们留言'}
                </p>
              </div>
            </a>

            <div className="p-4 bg-white/5 border border-[#C9A84C]/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold">WeChat</h4>
                <p className="text-gray-400 text-xs">
                  {language === 'en' ? 'Scan QR code' : '扫描二维码'}
                </p>
              </div>
              <div className="bg-white p-4 rounded flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full"
                    style={{ imageRendering: 'pixelated' }}
                  >
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="10" height="10" fill="black" />
                    <rect x="20" y="10" width="10" height="10" fill="black" />
                    <rect x="30" y="10" width="10" height="10" fill="black" />
                    <rect x="70" y="10" width="10" height="10" fill="black" />
                    <rect x="80" y="10" width="10" height="10" fill="black" />
                    <rect x="10" y="20" width="10" height="10" fill="black" />
                    <rect x="30" y="20" width="10" height="10" fill="black" />
                    <rect x="70" y="20" width="10" height="10" fill="black" />
                    <rect x="80" y="20" width="10" height="10" fill="black" />
                    <rect x="10" y="30" width="10" height="10" fill="black" />
                    <rect x="30" y="30" width="10" height="10" fill="black" />
                    <rect x="50" y="30" width="10" height="10" fill="black" />
                    <rect x="70" y="30" width="10" height="10" fill="black" />
                    <rect x="80" y="30" width="10" height="10" fill="black" />
                    <rect x="10" y="70" width="10" height="10" fill="black" />
                    <rect x="20" y="70" width="10" height="10" fill="black" />
                    <rect x="30" y="70" width="10" height="10" fill="black" />
                    <rect x="70" y="70" width="10" height="10" fill="black" />
                    <rect x="80" y="70" width="10" height="10" fill="black" />
                    <rect x="10" y="80" width="10" height="10" fill="black" />
                    <rect x="30" y="80" width="10" height="10" fill="black" />
                    <rect x="70" y="80" width="10" height="10" fill="black" />
                    <rect x="80" y="80" width="10" height="10" fill="black" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center mt-2">
                {language === 'en' ? 'WeChat ID: LuxHunter' : '微信号：LuxHunter'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatBot;

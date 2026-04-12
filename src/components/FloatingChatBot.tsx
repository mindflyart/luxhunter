import React, { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useSiteSettings, getSetting } from '../lib/useSiteSettings';

const FloatingChatBot: React.FC = () => {
  const { language, t } = useLanguage();
  const settings = useSiteSettings();
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
              href={getSetting(settings, "telegram_link", "https://t.me/luxhunterbot")}
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
              href={`https://wa.me/${getSetting(settings, "whatsapp_number", "61466679195")}`}
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
                  {language === 'en' ? 'Add us on WeChat' : '添加我们的微信'}
                </p>
              </div>
              <div className="bg-[#C9A84C]/10 p-4 rounded flex flex-col items-center justify-center">
                <MessageCircle className="text-[#C9A84C] mb-2" size={32} />
                <p className="text-white font-mono font-bold text-lg tracking-wide">{getSetting(settings, "wechat_id", "auluxytc")}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {language === 'en' ? 'Search this ID in WeChat' : '在微信中搜索此ID'}
                </p>
              </div>
              <p className="text-gray-400 text-xs text-center mt-2">
                {language === 'en' ? 'WeChat ID: auluxytc' : '微信号：auluxytc'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatBot;

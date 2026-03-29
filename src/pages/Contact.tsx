import React, { useState } from 'react';
import { Mail, Phone, MessageCircle, Send, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const Contact: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredContact: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const { error } = await supabase.from('contact_submissions').insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          preferred_contact: formData.preferredContact,
        },
      ]);

      if (error) throw error;

      setSubmitMessage(t('success.contact'));
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        preferredContact: '',
      });
    } catch (error) {
      setSubmitMessage(t('error.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">{t('contact.title')}</h1>
          <p className="text-xl text-gray-300">{t('contact.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">{t('contact.quickConnect')}</h2>
            <div className="space-y-4 mb-8">
              <a
                href="https://calendly.com/luxhunter"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 bg-[#C9A84C]/10 border-2 border-[#C9A84C] rounded-lg p-6 hover:bg-[#C9A84C]/20 transition-all group"
              >
                <div className="p-3 bg-[#C9A84C]/20 rounded-full group-hover:bg-[#C9A84C]/30 transition-colors">
                  <Calendar className="text-[#C9A84C]" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Book a Consultation</h3>
                  <p className="text-gray-300">Schedule a meeting via Calendly</p>
                </div>
              </a>

              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 bg-white/5 border border-[#C9A84C]/20 rounded-lg p-6 hover:border-[#C9A84C] transition-all group"
              >
                <div className="p-3 bg-[#C9A84C]/10 rounded-full group-hover:bg-[#C9A84C]/20 transition-colors">
                  <Send className="text-[#C9A84C]" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{t('contact.telegram')}</h3>
                  <p className="text-gray-400">Connect via Telegram</p>
                </div>
              </a>

              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 bg-white/5 border border-[#C9A84C]/20 rounded-lg p-6 hover:border-[#C9A84C] transition-all group"
              >
                <div className="p-3 bg-[#C9A84C]/10 rounded-full group-hover:bg-[#C9A84C]/20 transition-colors">
                  <MessageCircle className="text-[#C9A84C]" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{t('contact.whatsapp')}</h3>
                  <p className="text-gray-400">Connect via WhatsApp</p>
                </div>
              </a>
            </div>

            <div className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Mail className="text-[#C9A84C] mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-white mb-1">Email</h3>
                  <p className="text-gray-400">info@luxhunter.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="text-[#C9A84C] mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-white mb-1">Phone</h3>
                  <p className="text-gray-400">Available upon request</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder={t('contact.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder={t('contact.email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder={t('contact.phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
              <div>
                <select
                  value={formData.preferredContact}
                  onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white focus:outline-none focus:border-[#C9A84C] transition-colors"
                >
                  <option value="">{t('contact.preferred')}</option>
                  <option value="telegram">{t('contact.telegram')}</option>
                  <option value="whatsapp">{t('contact.whatsapp')}</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
              <div>
                <textarea
                  placeholder={t('contact.message')}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-semibold rounded hover:bg-[#d4b865] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '...' : t('contact.submit')}
              </button>
              {submitMessage && (
                <div
                  className={`text-center py-2 px-4 rounded ${
                    submitMessage.includes('thank') || submitMessage.includes('谢谢')
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {submitMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import NewsletterSuccessModal from './NewsletterSuccessModal';

const Newsletter: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    propertyNews: false,
    personalLoanUpdates: false,
    commercialLoanUpdates: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage(t('error.fillFields') || 'Please fill in both Name and Email fields.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: formData.email,
        name: formData.name || '',
        preferences: {
          propertyNews: formData.propertyNews,
          personalLoanUpdates: formData.personalLoanUpdates,
          commercialLoanUpdates: formData.commercialLoanUpdates,
        },
        is_active: true,
      });

    if (error) {
      if (error.code === '23505') {
        setMessage(t('error.alreadySubscribed') || "You're already subscribed!");
      } else {
        console.error('Newsletter insert error:', error);
        setMessage(t('error.generic') || 'Something went wrong. Please try again.');
      }
      setIsSubmitting(false);
      return;
    }

    setMessage(t('success.newsletter') || 'Successfully subscribed!');
    setShowSuccessModal(true);
    setFormData({
      name: '',
      email: '',
      propertyNews: false,
      personalLoanUpdates: false,
      commercialLoanUpdates: false,
    });
    setIsSubmitting(false);


    // Sync subscriber to Airtable CRM
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-to-airtable`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        source: "Newsletter",
        interest: [
          formData.propertyNews && "Property News",
          formData.personalLoanUpdates && "Personal Loan Updates",
          formData.commercialLoanUpdates && "Commercial Loan Updates",
        ].filter(Boolean).join(", "),
      }),
    }).catch((err) => console.error("Airtable sync error:", err));
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: formData.email, name: formData.name, type: 'newsletter' }),
    }).catch((err) => console.error('Welcome email error:', err));
  };

  return (
    <div className="bg-[#0A1628] border-t border-[#C9A84C]/20 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-[#C9A84C]/10 rounded-full">
                <Mail className="text-[#C9A84C]" size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">{t('newsletter.title')}</h2>
            <p className="text-gray-400">{t('newsletter.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder={t('newsletter.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder={t('newsletter.email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.propertyNews}
                  onChange={(e) => setFormData({ ...formData, propertyNews: e.target.checked })}
                  className="w-5 h-5 bg-white/5 border border-[#C9A84C]/30 rounded text-[#C9A84C] focus:ring-[#C9A84C] focus:ring-offset-0"
                />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {t('newsletter.propertyNews')}
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.personalLoanUpdates}
                  onChange={(e) =>
                    setFormData({ ...formData, personalLoanUpdates: e.target.checked })
                  }
                  className="w-5 h-5 bg-white/5 border border-[#C9A84C]/30 rounded text-[#C9A84C] focus:ring-[#C9A84C] focus:ring-offset-0"
                />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {t('newsletter.personalLoan')}
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.commercialLoanUpdates}
                  onChange={(e) =>
                    setFormData({ ...formData, commercialLoanUpdates: e.target.checked })
                  }
                  className="w-5 h-5 bg-white/5 border border-[#C9A84C]/30 rounded text-[#C9A84C] focus:ring-[#C9A84C] focus:ring-offset-0"
                />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {t('newsletter.commercialLoan')}
                </span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-3 bg-[#C9A84C] text-[#0A1628] font-semibold rounded hover:bg-[#d4b865] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '...' : t('newsletter.subscribe')}
              </button>
            </div>

            {message && (
              <div
                className={`text-center py-2 px-4 rounded ${
                  message.includes('Success') || message.includes('成功')
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {message}
              </div>
            )}
          </form>
        </div>
      </div>

      <NewsletterSuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
    </div>
  );
};

export default Newsletter;

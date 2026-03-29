import React from 'react';
import { Target, Award, Users, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AboutProps {
  onGetFreeReport: () => void;
}

const About: React.FC<AboutProps> = ({ onGetFreeReport }) => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Target,
      title: t('about.values.clientFocused.title'),
      description: t('about.values.clientFocused.desc'),
    },
    {
      icon: Award,
      title: t('about.values.expertGuidance.title'),
      description: t('about.values.expertGuidance.desc'),
    },
    {
      icon: Users,
      title: t('about.values.trustedPartnerships.title'),
      description: t('about.values.trustedPartnerships.desc'),
    },
    {
      icon: Shield,
      title: t('about.values.confidential.title'),
      description: t('about.values.confidential.desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">{t('about.title')}</h1>
          <p className="text-2xl text-[#C9A84C] font-semibold mb-6">{t('about.intro')}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-20 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-8 md:p-10">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">{t('about.desc')}</p>
              <h2 className="text-2xl font-bold text-white mb-4">{t('about.mission')}</h2>
              <p className="text-gray-300 text-lg leading-relaxed">{t('about.missionDesc')}</p>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="relative h-[400px] rounded-lg overflow-hidden border border-[#C9A84C]/20">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
                alt="Professional Property Advisory"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">{t('about.ourValues')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-6 hover:border-[#C9A84C] transition-all hover:transform hover:scale-105"
              >
                <div className="p-3 bg-[#C9A84C]/10 rounded-full w-fit mb-4">
                  <value.icon className="text-[#C9A84C]" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                <p className="text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative bg-cover bg-center rounded-lg overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(rgba(10, 22, 40, 0.85), rgba(10, 22, 40, 0.85)), url(https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920)',
          }}
        >
          <div className="p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {t('about.cta.title')}
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              {t('about.cta.description')}
            </p>
            <button
              onClick={onGetFreeReport}
              className="px-10 py-4 bg-[#C9A84C] text-[#0A1628] font-bold text-lg rounded hover:bg-[#d4b865] transition-all transform hover:scale-105"
            >
              {t('hero.cta')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

import React from 'react';
import { Home, Calculator, TrendingUp, Building2, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ServicesProps {
  onGetFreeReport: () => void;
}

const Services: React.FC<ServicesProps> = ({ onGetFreeReport }) => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Home,
      title: t('services.property.title'),
      description: t('services.property.desc'),
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
      features: [
        t('services.property.feature1'),
        t('services.property.feature2'),
        t('services.property.feature3'),
        t('services.property.feature4'),
      ],
    },
    {
      icon: Calculator,
      title: t('services.mortgage.title'),
      description: t('services.mortgage.desc'),
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
      features: [
        t('services.mortgage.feature1'),
        t('services.mortgage.feature2'),
        t('services.mortgage.feature3'),
        t('services.mortgage.feature4'),
      ],
    },
    {
      icon: TrendingUp,
      title: t('services.investment.title'),
      description: t('services.investment.desc'),
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      features: [
        t('services.investment.feature1'),
        t('services.investment.feature2'),
        t('services.investment.feature3'),
        t('services.investment.feature4'),
      ],
    },
    {
      icon: Building2,
      title: t('services.commercial.title'),
      description: t('services.commercial.desc'),
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      features: [
        t('services.commercial.feature1'),
        t('services.commercial.feature2'),
        t('services.commercial.feature3'),
        t('services.commercial.feature4'),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">{t('services.title')}</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="space-y-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white/5 border border-[#C9A84C]/20 rounded-lg overflow-hidden hover:border-[#C9A84C] transition-all"
            >
              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-2 h-64 md:h-auto">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:col-span-3 p-8 md:p-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-[#C9A84C]/10 rounded-full">
                      <service.icon className="text-[#C9A84C]" size={32} />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-2">{service.title}</h2>
                      <p className="text-gray-300 text-lg mb-6">{service.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="text-[#C9A84C] flex-shrink-0 mt-1" size={20} />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-gradient-to-r from-[#C9A84C]/10 to-[#C9A84C]/5 border border-[#C9A84C]/30 rounded-lg p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('services.cta.title')}
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            {t('services.cta.description')}
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
  );
};

export default Services;

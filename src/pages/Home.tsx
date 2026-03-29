import React, { useState, useEffect } from 'react';
import { Home as HomeIcon, TrendingUp, Building2, Calculator, ArrowRight, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import BudgetCheckWidget from '../components/BudgetCheckWidget';
import FAQSection from '../components/FAQSection';
import HouseBudgetCalculator from '../components/HouseBudgetCalculator';
import { supabase } from '../lib/supabase';

interface HomeProps {
  onGetFreeReport: () => void;
  onNavigate: (page: string) => void;
}

interface FeaturedProperty {
  id?: string;
  title: string;
  location: string;
  state?: string;
  price?: string;
  description: string;
  image_url: string;
  tag?: string;
  image?: string;
  tagline?: string;
}

const Home: React.FC<HomeProps> = ({ onGetFreeReport, onNavigate }) => {
  const { t } = useLanguage();
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);

  useEffect(() => {
    loadFeaturedProperties();
  }, []);

  const loadFeaturedProperties = async () => {
    const { data, error } = await supabase
      .from('featured_properties')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (data && data.length > 0) {
      setFeaturedProperties(
        data.map((prop) => ({
          id: prop.id,
          title: prop.title,
          location: prop.location,
          state: prop.state,
          price: prop.price,
          description: prop.description,
          image_url: prop.image_url,
          tag: prop.tag,
        }))
      );
    } else {
      setFeaturedProperties([
        {
          title: 'Luxury Waterfront',
          image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600',
          location: t('home.property.sydney.location'),
          description: t('home.property.sydney'),
          tag: 'Premium Location',
        },
        {
          title: 'Modern Apartment',
          image_url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600',
          location: t('home.property.melbourne.location'),
          description: t('home.property.melbourne'),
          tag: 'City Living',
        },
        {
          title: 'Riverside Estate',
          image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600',
          location: t('home.property.brisbane.location'),
          description: t('home.property.brisbane'),
          tag: 'Family Home',
        },
      ]);
    }
  };

  const features = [
    {
      icon: HomeIcon,
      title: t('services.property.title'),
      description: t('services.property.desc'),
    },
    {
      icon: Calculator,
      title: t('services.mortgage.title'),
      description: t('services.mortgage.desc'),
    },
    {
      icon: TrendingUp,
      title: t('services.investment.title'),
      description: t('services.investment.desc'),
    },
    {
      icon: Building2,
      title: t('services.commercial.title'),
      description: t('services.commercial.desc'),
    },
  ];

  const latestInsights = [
    {
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
      category: t('home.news.category.marketUpdate'),
      date: t('home.news.article1.date'),
      headline: t('home.news.article1.headline'),
      excerpt: t('home.news.article1.excerpt'),
    },
    {
      image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600',
      category: t('home.news.category.financeTips'),
      date: t('home.news.article2.date'),
      headline: t('home.news.article2.headline'),
      excerpt: t('home.news.article2.excerpt'),
    },
    {
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
      category: t('home.news.category.investment'),
      date: t('home.news.article3.date'),
      headline: t('home.news.article3.headline'),
      excerpt: t('home.news.article3.excerpt'),
    },
  ];

  const testimonials = [
    {
      quote: t('home.testimonials.sarah.quote'),
      name: t('home.testimonials.sarah.name'),
      location: t('home.testimonials.sarah.location'),
    },
    {
      quote: t('home.testimonials.james.quote'),
      name: t('home.testimonials.james.name'),
      location: t('home.testimonials.james.location'),
    },
    {
      quote: t('home.testimonials.michelle.quote'),
      name: t('home.testimonials.michelle.name'),
      location: t('home.testimonials.michelle.location'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <div
        className="relative bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(10, 22, 40, 0.7), rgba(10, 22, 40, 0.85)), url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920)',
          minHeight: '600px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('hero.title.line1')}
              <br />
              {t('hero.title.line2')}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">{t('hero.subtitle')}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetFreeReport}
                className="px-8 py-4 bg-[#C9A84C] text-[#0A1628] font-bold text-lg rounded hover:bg-[#d4b865] transition-all transform hover:scale-105"
              >
                {t('hero.cta')}
              </button>
              <BudgetCheckWidget />
            </div>
          </div>

          <div id="budget-calculator" className="max-w-4xl mx-auto">
            <HouseBudgetCalculator onGetFreeReport={onGetFreeReport} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('home.featured.title')}
          </h2>
          <p className="text-xl text-gray-400">
            {t('home.featured.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {featuredProperties.map((property, index) => (
            <div
              key={property.id || index}
              className="bg-[#0D1F35] border border-[#C9A84C]/20 rounded-lg overflow-hidden hover:border-[#C9A84C] transition-all hover:transform hover:translate-y-[-8px] group cursor-pointer"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={property.image_url || property.image}
                  alt={property.title || property.location}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {property.tag && (
                  <div className="absolute top-4 right-4 bg-[#C9A84C]/90 text-[#0A1628] px-3 py-1 rounded text-xs font-bold">
                    {property.tag}
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-[#0A1628]/80 backdrop-blur-sm text-white px-3 py-1 rounded text-sm font-bold">
                  {property.location}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-white font-semibold text-lg mb-2">{property.title}</h3>
                {property.price && (
                  <p className="text-[#C9A84C] font-bold text-xl mb-3">{property.price}</p>
                )}
                <p className="text-gray-300 text-sm mb-4">{property.description || property.tagline}</p>
                <button
                  onClick={() => onNavigate('enquire')}
                  className="text-[#C9A84C] hover:text-[#d4b865] font-semibold text-sm flex items-center space-x-1 transition-colors"
                >
                  <span>{t('home.enquireNow')}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('home.insights.title')}
          </h2>
          <p className="text-xl text-gray-400">
            {t('home.insights.subtitle')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {latestInsights.map((insight, index) => {
            const articlePage = index === 0 ? 'article-sydney-prices' : index === 1 ? 'article-borrowing-capacity' : null;
            return (
              <div
                key={index}
                className="bg-[#0D1F35] border border-[#C9A84C]/20 rounded-lg overflow-hidden hover:border-[#C9A84C] transition-all hover:transform hover:translate-y-[-8px] group cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={insight.image}
                    alt={insight.headline}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-[#C9A84C] text-[#0A1628] px-3 py-1 rounded text-sm font-bold">
                    {insight.category}
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-500 mb-3">{insight.date}</p>
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">{insight.headline}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{insight.excerpt}</p>
                  {articlePage ? (
                    <button
                      onClick={() => onNavigate(articlePage)}
                      className="text-[#C9A84C] hover:text-[#d4b865] font-semibold text-sm flex items-center space-x-1 transition-colors"
                    >
                      <span>{t('home.readMore')}</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <div className="text-gray-500 font-semibold text-sm flex items-center space-x-1">
                      <span>{t('home.readMore')}</span>
                      <ArrowRight size={16} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('home.testimonials.title')}
            </h2>
            <p className="text-xl text-gray-400">
              {t('home.testimonials.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-[#0D1F35] border-l-4 border-[#C9A84C] rounded-lg p-6 hover:transform hover:translate-y-[-4px] transition-all"
              >
                <div className="flex space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#C9A84C" className="text-[#C9A84C]" />
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="text-white font-bold">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-6 hover:border-[#C9A84C] transition-all hover:transform hover:scale-105"
            >
              <div className="p-3 bg-[#C9A84C]/10 rounded-full w-fit mb-4">
                <feature.icon className="text-[#C9A84C]" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-b from-transparent to-[#C9A84C]/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            {t('home.propertyCta.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            {t('home.propertyCta.description')}
          </p>
          <button
            onClick={onGetFreeReport}
            className="px-10 py-4 bg-[#C9A84C] text-[#0A1628] font-bold text-lg rounded hover:bg-[#d4b865] transition-all transform hover:scale-105"
          >
            {t('hero.cta')}
          </button>
        </div>
      </div>

      <FAQSection />
    </div>
  );
};

export default Home;

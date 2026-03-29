import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { TrendingUp, Calendar } from 'lucide-react';

const ArticleSydneyPrices: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-[#C9A84C] mb-4">
            <TrendingUp size={20} />
            <span className="text-sm font-semibold uppercase">
              {language === 'en' ? 'Market Update' : '市场更新'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'en'
              ? 'Sydney Property Prices Show Strong Growth in Q1 2026'
              : '悉尼房价在2026年第一季度显示强劲增长'}
          </h1>
          <div className="flex items-center space-x-2 text-gray-400">
            <Calendar size={16} />
            <span className="text-sm">
              {language === 'en' ? '9 March 2026' : '2026年3月9日'}
            </span>
          </div>
        </div>

        <div className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-8 md:p-12 space-y-6">
          {language === 'en' ? (
            <>
              <div className="aspect-video bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 rounded-lg flex items-center justify-center mb-8">
                <TrendingUp className="text-[#C9A84C]" size={80} />
              </div>

              <p className="text-gray-300 leading-relaxed text-lg">
                Sydney's residential property market has demonstrated remarkable resilience in the first quarter of 2026, with median house prices rising by 4.2% across metropolitan areas. The sustained growth reflects renewed buyer confidence following a period of market stabilization in late 2025.
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                Premium Suburbs Lead the Charge
              </h2>

              <p className="text-gray-300 leading-relaxed">
                Inner-city and harbour-side suburbs continue to attract significant demand, with properties in areas such as Mosman, Double Bay, and Woollahra experiencing particularly strong buyer interest. Limited stock availability in these premium locations has contributed to competitive bidding at auctions, with clearance rates hovering above 75% throughout February and March. First-time buyers are increasingly turning to emerging growth corridors in Western Sydney, where relative affordability and improved infrastructure are driving steady price appreciation.
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                Investor Confidence Returns to the Market
              </h2>

              <p className="text-gray-300 leading-relaxed">
                Investment activity has picked up notably, with national and international investors viewing Sydney property as a stable long-term asset. Rental yields in suburban areas remain attractive, particularly for well-located apartments and townhouses. Financial advisers are recommending that prospective buyers lock in current interest rates, which remain historically competitive, before anticipated rate adjustments later in the year. For those considering entering the Sydney market, now presents a strategic window of opportunity to secure property with strong capital growth potential.
              </p>

              <div className="mt-12 pt-8 border-t border-[#C9A84C]/20">
                <p className="text-gray-500 text-sm italic">
                  Disclaimer: This article provides general market commentary and does not constitute investment advice. Property market conditions can change rapidly. Always seek professional advice before making property investment decisions.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="aspect-video bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 rounded-lg flex items-center justify-center mb-8">
                <TrendingUp className="text-[#C9A84C]" size={80} />
              </div>

              <p className="text-gray-300 leading-relaxed text-lg">
                悉尼的住宅房地产市场在2026年第一季度表现出了显著的韧性，大都市区的房屋中位价上涨了4.2%。这种持续增长反映了在2025年底市场稳定期之后买家信心的恢复。
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                高端郊区引领增长
              </h2>

              <p className="text-gray-300 leading-relaxed">
                内城和海港附近的郊区继续吸引大量需求，Mosman、Double Bay 和 Woollahra 等地区的房产受到买家的特别关注。这些高端地段的库存有限，导致拍卖会上的竞标竞争激烈，2月和3月的清盘率保持在75%以上。首次购房者越来越多地转向悉尼西部的新兴增长走廊，那里相对实惠的价格和改善的基础设施正在推动稳定的价格上涨。
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                投资者信心重返市场
              </h2>

              <p className="text-gray-300 leading-relaxed">
                投资活动显著增加，国内外投资者将悉尼房产视为稳定的长期资产。郊区的租金收益率仍然具有吸引力，特别是位置优越的公寓和联排别墅。财务顾问建议潜在买家在年底预期的利率调整之前锁定当前具有历史竞争力的利率。对于那些考虑进入悉尼市场的人来说，现在是获得具有强劲资本增长潜力房产的战略性机会窗口。
              </p>

              <div className="mt-12 pt-8 border-t border-[#C9A84C]/20">
                <p className="text-gray-500 text-sm italic">
                  免责声明：本文提供一般市场评论，不构成投资建议。房地产市场状况可能会迅速变化。在做出房产投资决策之前，请务必寻求专业建议。
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleSydneyPrices;

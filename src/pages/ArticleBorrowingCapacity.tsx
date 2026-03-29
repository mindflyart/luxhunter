import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Lightbulb, Calendar } from 'lucide-react';

const ArticleBorrowingCapacity: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-[#C9A84C] mb-4">
            <Lightbulb size={20} />
            <span className="text-sm font-semibold uppercase">
              {language === 'en' ? 'Finance Tips' : '理财技巧'}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'en'
              ? 'How to Maximize Your Borrowing Capacity in 2026'
              : '如何在2026年最大化您的借款能力'}
          </h1>
          <div className="flex items-center space-x-2 text-gray-400">
            <Calendar size={16} />
            <span className="text-sm">
              {language === 'en' ? '7 March 2026' : '2026年3月7日'}
            </span>
          </div>
        </div>

        <div className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-8 md:p-12 space-y-6">
          {language === 'en' ? (
            <>
              <div className="aspect-video bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 rounded-lg flex items-center justify-center mb-8">
                <Lightbulb className="text-[#C9A84C]" size={80} />
              </div>

              <p className="text-gray-300 leading-relaxed text-lg">
                Securing a competitive home loan with maximum borrowing capacity requires strategic financial preparation. Australian lenders assess multiple factors when determining how much they're willing to lend, and understanding these criteria can significantly improve your loan application outcome.
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                Reduce Existing Debts and Financial Commitments
              </h2>

              <p className="text-gray-300 leading-relaxed">
                One of the most effective ways to increase your borrowing capacity is to minimize your existing liabilities before applying for a home loan. Lenders calculate your debt-to-income ratio, which measures your total monthly debt obligations against your gross monthly income. Paying down credit card balances, personal loans, and car finance can dramatically improve this ratio. Even closing unused credit cards — which lenders count as potential debt — can add tens of thousands of dollars to your borrowing power. Financial experts recommend reducing non-mortgage debt to below 30% of your monthly income to position yourself as a low-risk borrower.
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                Maintain a Strong Credit Score and Financial History
              </h2>

              <p className="text-gray-300 leading-relaxed">
                Your credit score is a critical factor in loan approval and interest rate determination. A score above 700 is generally considered good, while scores above 800 unlock premium lending rates and higher loan amounts. To maintain or improve your credit rating, ensure all bills and existing loan repayments are made on time, avoid making multiple credit applications within a short period, and regularly review your credit report for errors or fraudulent activity. Consistent financial behavior over 12–24 months demonstrates reliability to lenders and can result in more favorable lending terms.
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                Work with a Professional Mortgage Broker
              </h2>

              <p className="text-gray-300 leading-relaxed">
                Engaging a licensed mortgage broker can be one of the smartest moves when seeking to maximize your borrowing capacity. Brokers have access to a wide panel of lenders — often including wholesale and specialist lenders not available to the general public. They understand each lender's assessment criteria and can match you with institutions most likely to approve your application at competitive rates. A skilled broker will also guide you through structuring your application to highlight strengths and mitigate potential weaknesses, such as irregular income or previous credit issues. Many borrowers discover they can borrow 10–20% more simply by working with an experienced broker who knows how to present their financial situation optimally.
              </p>

              <div className="mt-12 pt-8 border-t border-[#C9A84C]/20">
                <p className="text-gray-500 text-sm italic">
                  Disclaimer: This article provides general finance tips and does not constitute personal financial advice. Loan eligibility and terms vary between lenders. Always seek professional advice tailored to your individual circumstances.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="aspect-video bg-gradient-to-br from-[#C9A84C]/20 to-[#C9A84C]/5 rounded-lg flex items-center justify-center mb-8">
                <Lightbulb className="text-[#C9A84C]" size={80} />
              </div>

              <p className="text-gray-300 leading-relaxed text-lg">
                获得具有最大借款能力的竞争性房贷需要战略性的财务准备。澳大利亚贷款机构在决定愿意贷出多少资金时会评估多个因素，了解这些标准可以显著改善您的贷款申请结果。
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                减少现有债务和财务承诺
              </h2>

              <p className="text-gray-300 leading-relaxed">
                增加借款能力最有效的方法之一是在申请房贷之前将现有负债降至最低。贷款机构会计算您的债务收入比，该比率衡量您的月度债务总额与月总收入的关系。还清信用卡余额、个人贷款和汽车贷款可以显著改善这一比率。即使关闭未使用的信用卡——贷款机构将其视为潜在债务——也可以为您的借款能力增加数万澳元。财务专家建议将非抵押债务降至月收入的30%以下，以将自己定位为低风险借款人。
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                保持良好的信用评分和财务历史
              </h2>

              <p className="text-gray-300 leading-relaxed">
                您的信用评分是贷款批准和利率确定的关键因素。700分以上的评分通常被认为是良好的，而800分以上的评分可以解锁优质贷款利率和更高的贷款金额。为了保持或改善您的信用评级，请确保按时支付所有账单和现有贷款还款，避免在短时间内进行多次信贷申请，并定期检查您的信用报告是否有错误或欺诈活动。12至24个月的一致财务行为向贷款机构展示了可靠性，可以带来更有利的贷款条款。
              </p>

              <h2 className="text-2xl font-bold text-[#C9A84C] mt-8 mb-4">
                与专业贷款经纪人合作
              </h2>

              <p className="text-gray-300 leading-relaxed">
                聘请持牌贷款经纪人可能是在寻求最大化借款能力时最明智的举措之一。经纪人可以接触到广泛的贷款机构面板——通常包括公众无法获得的批发和专业贷款机构。他们了解每个贷款机构的评估标准，可以将您与最有可能以具有竞争力的利率批准您申请的机构匹配。熟练的经纪人还将指导您构建申请，以突出优势并减轻潜在弱点，例如不规则收入或以前的信用问题。许多借款人发现，仅通过与经验丰富的经纪人合作，他们可以多借10-20%，这些经纪人知道如何最优地呈现他们的财务状况。
              </p>

              <div className="mt-12 pt-8 border-t border-[#C9A84C]/20">
                <p className="text-gray-500 text-sm italic">
                  免责声明：本文提供一般理财技巧，不构成个人财务建议。贷款资格和条款因贷款机构而异。请务必寻求针对您个人情况的专业建议。
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleBorrowingCapacity;

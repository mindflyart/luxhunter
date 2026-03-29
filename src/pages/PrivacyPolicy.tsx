import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0A1628] py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#C9A84C]/10 rounded-full">
              <Shield className="text-[#C9A84C]" size={48} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {language === 'en' ? 'Privacy Policy' : '隐私政策'}
          </h1>
          <p className="text-gray-400 text-lg">
            {language === 'en'
              ? 'How we collect, use, and protect your information'
              : '我们如何收集、使用和保护您的信息'}
          </p>
        </div>

        <div className="bg-white/5 border border-[#C9A84C]/20 rounded-lg p-8 md:p-12">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-[#C9A84C] mb-6">Privacy Disclosure Statement and Consent</h2>

            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <p className="font-semibold text-white">Organization:</p>
                <p>B&C FAMILY CO PTY LTD (ABN 84 619 992 497)</p>
                <p>Trading As: RIBBON FINANCE MORTGAGE MANAGEMENT</p>
                <p>Address: 198 Whitehorse Road Boxhill VIC 3128</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">1. Collection and Use of Information</h3>
                <p className="mb-2">We collect and hold personal and credit-related information about you to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Verify your identity in accordance with the Anti-Money Laundering and Counter-Terrorism Financing Act 2006.</li>
                  <li>Assess your financial situation and the suitability of any credit product you are applying for.</li>
                  <li>Provide credit assistance and manage the application process with potential lenders.</li>
                  <li>Contact you regarding your application or other relevant financial products.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">2. Types of Information Collected</h3>
                <p className="mb-2">The information we collect includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Identity Data:</strong> Name, date of birth, address history, and government identifiers (e.g., Driver's Licence, Passport).</li>
                  <li><strong className="text-white">Financial Data:</strong> Income, expenses, employment history, assets, and liabilities.</li>
                  <li><strong className="text-white">Credit History:</strong> Information from Credit Reporting Bodies (CRBs) regarding your creditworthiness and repayment history.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">3. Disclosure to Third Parties</h3>
                <p className="mb-2">We may exchange your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-white">Lenders and Credit Providers:</strong> To assess and process your loan application.</li>
                  <li><strong className="text-white">Credit Reporting Bodies:</strong> To obtain a credit report on your behalf.</li>
                  <li><strong className="text-white">Professional Advisers:</strong> Such as your accountant, lawyer, or real estate agent.</li>
                  <li><strong className="text-white">Support Services:</strong> Valuers, mortgage insurers, and identity verification services.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">4. Credit Reporting Bodies</h3>
                <p>By signing this consent, you authorize us to act as your "access seeker" to obtain credit-related information from CRBs (such as Equifax, Illion, or Experian). The CRBs may include this information in reports provided to other credit providers to help them assess your creditworthiness.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">5. Overseas Disclosure</h3>
                <p>Some of our service providers or lenders may be located outside Australia. You consent to the disclosure of your information to these overseas recipients as required for the provision of our services.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">6. Electronic Communications</h3>
                <p>You consent to receiving notices and documents from us electronically (via email or SMS). You acknowledge that paper documents may no longer be given and you should check your electronic communications regularly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

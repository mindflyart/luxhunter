import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface CalculatorData {
  fullName?: string;
  email?: string;
  phone?: string;
  propertyPrice?: number;
  state?: string;
  deposit?: number;
  loanAmount?: number;
}

interface FreeReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  calculatorData?: CalculatorData | null;
}

const FreeReportModal: React.FC<FreeReportModalProps> = ({ isOpen, onClose, onSuccess, calculatorData }) => {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [interestType, setInterestType] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (calculatorData) {
      if (calculatorData.fullName) setFullName(calculatorData.fullName);
      if (calculatorData.email) setEmail(calculatorData.email);
      if (calculatorData.phone) setPhone(calculatorData.phone);
      if (calculatorData.state) setState(calculatorData.state);
    }
  }, [calculatorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Save to Supabase
      const { error: submitError } = await supabase
        .from('free_report_requests')
        .insert([{
          full_name: fullName,
          email,
          phone: phone || null,
          state,
          interest_type: interestType
        }]);

      if (submitError) throw submitError;

      // Send to Airtable
      const airtableData = {
        name: fullName,
        email,
        phone,
        state,
        interest: [interestType],
        source: 'Calculator Form',
        propertyPrice: calculatorData?.propertyPrice || 0,
        deposit: calculatorData?.deposit || 0,
        loanTerm: 30,
        notes: `Interest: ${interestType}${calculatorData ? ` | Loan Amount: $${calculatorData.loanAmount?.toLocaleString()}` : ''}`
      };

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/save-to-airtable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(airtableData)
      });

      setFullName('');
      setEmail('');
      setPhone('');
      setState('');
      setInterestType('');
      setPrivacyAccepted(false);
      onSuccess();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(t('error.generic'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0A1628] border border-[#C9A84C]/30 rounded-lg max-w-md w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#C9A84C]/10 rounded-full">
            <FileText className="text-[#C9A84C]" size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {t('modal.freeReport.title')}
        </h2>
        <p className="text-gray-400 text-center mb-6">{t('modal.freeReport.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
            />
          </div>

          <div>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white focus:outline-none focus:border-[#C9A84C] transition-colors [&>option]:bg-[#0A1628] [&>option]:text-white"
            >
              <option value="">Select State</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="QLD">QLD</option>
              <option value="WA">WA</option>
              <option value="SA">SA</option>
              <option value="TAS">TAS</option>
              <option value="ACT">ACT</option>
              <option value="NT">NT</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">I'm interested in</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="interestType"
                  value="Property Advisory"
                  checked={interestType === 'Property Advisory'}
                  onChange={(e) => setInterestType(e.target.value)}
                  required
                  className="w-4 h-4 text-[#C9A84C] bg-white/5 border-[#C9A84C]/30 focus:ring-[#C9A84C]"
                />
                <span className="text-white">Property Advisory</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="interestType"
                  value="Home Loan"
                  checked={interestType === 'Home Loan'}
                  onChange={(e) => setInterestType(e.target.value)}
                  required
                  className="w-4 h-4 text-[#C9A84C] bg-white/5 border-[#C9A84C]/30 focus:ring-[#C9A84C]"
                />
                <span className="text-white">Home Loan</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="interestType"
                  value="Investment Loan"
                  checked={interestType === 'Investment Loan'}
                  onChange={(e) => setInterestType(e.target.value)}
                  required
                  className="w-4 h-4 text-[#C9A84C] bg-white/5 border-[#C9A84C]/30 focus:ring-[#C9A84C]"
                />
                <span className="text-white">Investment Loan</span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 border border-[#C9A84C]/30 rounded p-4 max-h-[200px] overflow-y-scroll">
              <div className="text-xs text-gray-300 leading-relaxed space-y-3">
                <p className="font-semibold text-white text-sm">Privacy Disclosure Statement and Consent</p>

                <div>
                  <p className="font-semibold text-white">Organization:</p>
                  <p>B&C FAMILY CO PTY LTD (ABN 84 619 992 497)</p>
                  <p>Trading As: RIBBON FINANCE MORTGAGE MANAGEMENT</p>
                  <p>Address: 198 Whitehorse Road Boxhill VIC 3128</p>
                </div>

                <div>
                  <p className="font-semibold text-white">1. Collection and Use of Information</p>
                  <p>We collect and hold personal and credit-related information about you to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Verify your identity in accordance with the Anti-Money Laundering and Counter-Terrorism Financing Act 2006.</li>
                    <li>Assess your financial situation and the suitability of any credit product you are applying for.</li>
                    <li>Provide credit assistance and manage the application process with potential lenders.</li>
                    <li>Contact you regarding your application or other relevant financial products.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-white">2. Types of Information Collected</p>
                  <p>The information we collect includes:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Identity Data:</strong> Name, date of birth, address history, and government identifiers (e.g., Driver's Licence, Passport).</li>
                    <li><strong>Financial Data:</strong> Income, expenses, employment history, assets, and liabilities.</li>
                    <li><strong>Credit History:</strong> Information from Credit Reporting Bodies (CRBs) regarding your creditworthiness and repayment history.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-white">3. Disclosure to Third Parties</p>
                  <p>We may exchange your information with:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Lenders and Credit Providers:</strong> To assess and process your loan application.</li>
                    <li><strong>Credit Reporting Bodies:</strong> To obtain a credit report on your behalf.</li>
                    <li><strong>Professional Advisers:</strong> Such as your accountant, lawyer, or real estate agent.</li>
                    <li><strong>Support Services:</strong> Valuers, mortgage insurers, and identity verification services.</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-white">4. Credit Reporting Bodies</p>
                  <p>By signing this consent, you authorize us to act as your "access seeker" to obtain credit-related information from CRBs (such as Equifax, Illion, or Experian). The CRBs may include this information in reports provided to other credit providers to help them assess your creditworthiness.</p>
                </div>

                <div>
                  <p className="font-semibold text-white">5. Overseas Disclosure</p>
                  <p>Some of our service providers or lenders may be located outside Australia. You consent to the disclosure of your information to these overseas recipients as required for the provision of our services.</p>
                </div>

                <div>
                  <p className="font-semibold text-white">6. Electronic Communications</p>
                  <p>You consent to receiving notices and documents from us electronically (via email or SMS). You acknowledge that paper documents may no longer be given and you should check your electronic communications regularly.</p>
                </div>

                <div className="pt-2 border-t border-[#C9A84C]/20">
                  <p className="font-semibold text-white">Consent and Acknowledgment</p>
                  <p>By signing below, I/we acknowledge that I/we have read and understood this Privacy Disclosure Statement and Consent. I/we authorize B&C FAMILY CO PTY LTD (T/A Ribbon Finance Mortgage Management) to collect, use, and disclose my/our personal and credit information as described above.</p>
                </div>
              </div>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                required
                className="w-4 h-4 mt-0.5 text-[#C9A84C] bg-white/5 border-[#C9A84C]/30 rounded focus:ring-[#C9A84C] focus:ring-offset-0"
              />
              <span className="text-sm text-gray-300">
                I have read and agree to the Privacy Disclosure Statement and Consent
              </span>
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !privacyAccepted}
            className="w-full px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-bold rounded hover:bg-[#d4b865] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Request Free Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FreeReportModal;

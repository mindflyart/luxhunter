import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Newsletter from './components/Newsletter';
import FreeReportModal from './components/FreeReportModal';
import PrivacyModal from './components/PrivacyModal';
import SavedResultsBanner from './components/SavedResultsBanner';
import FloatingChatBot from './components/FloatingChatBot';
import SEOSchema from './components/SEOSchema';
import Home from './pages/Home';
import Services from './pages/Services';
import Calculator from './pages/Calculator';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ArticleSydneyPrices from './pages/ArticleSydneyPrices';
import ArticleBorrowingCapacity from './pages/ArticleBorrowingCapacity';
import Enquire from './pages/Enquire';
import Admin from './pages/Admin';
import LeadLanding from './pages/LeadLanding';

const getInitialPage = () => {
  const path = window.location.pathname.slice(1);
  const validPages = [
    'home', 'services', 'calculator', 'about', 'contact',
    'privacy-policy', 'terms-of-service', 'article-sydney-prices',
    'article-borrowing-capacity', 'enquire', 'admin', 'lead'
  ];
  return validPages.includes(path) ? path : 'home';
};

interface CalculatorData {
  fullName?: string;
  email?: string;
  phone?: string;
  propertyPrice?: number;
  state?: string;
  deposit?: number;
  loanAmount?: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState(getInitialPage());
  const [showFreeReportModal, setShowFreeReportModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [calculatorData, setCalculatorData] = useState<CalculatorData | null>(null);

  useEffect(() => {
    const path = currentPage === 'home' ? '/' : `/${currentPage}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, [currentPage]);

  const handleViewCalculatorDetails = () => {
    setCurrentPage('calculator');
  };

  const handleFreeReportSuccess = () => {
    setShowFreeReportModal(false);
    setShowPrivacyModal(true);
  };

  const handleBookConsultation = () => {
    setShowPrivacyModal(false);
    setCurrentPage('contact');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onGetFreeReport={() => setShowFreeReportModal(true)} onNavigate={setCurrentPage} />;
      case 'services':
        return <Services onGetFreeReport={() => setShowFreeReportModal(true)} />;
      case 'calculator':
        return <Calculator onGetFreeReport={(data) => {
          setCalculatorData(data);
          setShowFreeReportModal(true);
        }} />;
      case 'about':
        return <About onGetFreeReport={() => setShowFreeReportModal(true)} />;
      case 'contact':
        return <Contact />;
      case 'privacy-policy':
        return <PrivacyPolicy />;
      case 'terms-of-service':
        return <TermsOfService onNavigate={setCurrentPage} />;
      case 'article-sydney-prices':
        return <ArticleSydneyPrices />;
      case 'article-borrowing-capacity':
        return <ArticleBorrowingCapacity />;
      case 'enquire':
        return <Enquire />;
      case 'admin':
        return <Admin />;
      case 'lead':
        return <LeadLanding />;
      default:
        return <Home onGetFreeReport={() => setShowFreeReportModal(true)} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <LanguageProvider>
      <SEOSchema />
      <div className="min-h-screen bg-[#0A1628]">
        <Navigation
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onGetFreeReport={() => setShowFreeReportModal(true)}
        />
        <SavedResultsBanner onViewDetails={handleViewCalculatorDetails} />
        <main className="pt-20">{renderPage()}</main>
        <Newsletter />
        <Footer onNavigate={setCurrentPage} />

        <FloatingChatBot />

        <FreeReportModal
          isOpen={showFreeReportModal}
          onClose={() => {
            setShowFreeReportModal(false);
            setCalculatorData(null);
          }}
          onSuccess={handleFreeReportSuccess}
          calculatorData={calculatorData}
        />

        <PrivacyModal
          isOpen={showPrivacyModal}
          onClose={() => setShowPrivacyModal(false)}
          onBookConsultation={handleBookConsultation}
        />
      </div>
    </LanguageProvider>
  );
}

export default App;

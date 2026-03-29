import { useEffect } from 'react';

const SEOSchema = () => {
  useEffect(() => {
    const professionalServiceSchema = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      "name": "LuxHunter",
      "description": "Expert property advisory and mortgage strategy services across Australia. We partner with Ribbon Finance (ACL 525 880) to provide access to 30+ lenders.",
      "url": "https://luxhunter.com",
      "areaServed": "Australia",
      "serviceType": [
        "Property Advisory",
        "Mortgage Strategy",
        "Investment Consulting"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What services does LuxHunter provide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "LuxHunter is a property advisory service provider offering expert mortgage strategy, property investment guidance, and buyer advisory services across Australia. We work in strategic partnership with Ribbon Finance Mortgage Management (ACL 525 880) to provide access to 30+ lenders."
          }
        },
        {
          "@type": "Question",
          "name": "Is LuxHunter a licensed credit provider?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "LuxHunter is not a licensed credit provider. All financial products and loan information on this site are provided by our strategic finance partner, Ribbon Finance Mortgage Management Pty Ltd (ACL 525 880). This site provides general information only, not personal financial advice."
          }
        },
        {
          "@type": "Question",
          "name": "What lenders does Ribbon Finance work with?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Through our finance partner Ribbon Finance (ACL 525 880), clients can access products from 30+ lenders including major Australian banks. Ribbon Finance is an aggregator with a full lender panel."
          }
        },
        {
          "@type": "Question",
          "name": "How do I use the mortgage calculator?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Enter your property price, select your state, choose your loan purpose (owner-occupied or investment) and repayment type (principal & interest or interest only). The calculator shows estimated monthly repayments and the best available rate from Ribbon Finance's product range."
          }
        },
        {
          "@type": "Question",
          "name": "Do you serve Chinese-speaking clients?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. LuxHunter provides bilingual property advisory services in both English and Chinese (Mandarin). Our platform supports EN/CN language switching."
          }
        },
        {
          "@type": "Question",
          "name": "Which states do you cover?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "LuxHunter provides property advisory services across all Australian states and territories including NSW, VIC, QLD, WA, SA, TAS, ACT and NT."
          }
        }
      ]
    };

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "LuxHunter",
      "url": "https://luxhunter.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://luxhunter.com/calculator?query={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };

    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    const scriptProfessional = document.createElement('script');
    scriptProfessional.type = 'application/ld+json';
    scriptProfessional.text = JSON.stringify(professionalServiceSchema);
    document.head.appendChild(scriptProfessional);

    const scriptFAQ = document.createElement('script');
    scriptFAQ.type = 'application/ld+json';
    scriptFAQ.text = JSON.stringify(faqSchema);
    document.head.appendChild(scriptFAQ);

    const scriptWebsite = document.createElement('script');
    scriptWebsite.type = 'application/ld+json';
    scriptWebsite.text = JSON.stringify(websiteSchema);
    document.head.appendChild(scriptWebsite);

    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  return null;
};

export default SEOSchema;

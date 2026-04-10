import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

type Status = 'loading' | 'success' | 'already' | 'error' | 'missing';

const Unsubscribe = () => {
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');

    if (!email) {
      setStatus('missing');
      return;
    }

    (async () => {
      const { data: existing, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', email)
        .maybeSingle();

      if (fetchError || !existing) {
        setStatus('error');
        return;
      }

      if (!existing.is_active) {
        setStatus('already');
        return;
      }

      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
        .eq('email', email);

      if (updateError) {
        setStatus('error');
        return;
      }

      setStatus('success');
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-6">
      <div className="bg-[#0d1f35] border border-[#C9A84C]/20 rounded-2xl p-10 w-full max-w-md text-center shadow-2xl">
        <div className="flex justify-center mb-5">
          {status === 'loading' && (
            <div className="p-4 bg-[#C9A84C]/10 rounded-full">
              <Loader className="text-[#C9A84C] animate-spin" size={32} />
            </div>
          )}
          {(status === 'success' || status === 'already') && (
            <div className="p-4 bg-green-900/30 rounded-full">
              <CheckCircle className="text-green-400" size={32} />
            </div>
          )}
          {(status === 'error' || status === 'missing') && (
            <div className="p-4 bg-red-900/30 rounded-full">
              <AlertCircle className="text-red-400" size={32} />
            </div>
          )}
        </div>

        {status === 'loading' && (
          <>
            <h1 className="text-xl font-bold text-white mb-2">Processing...</h1>
            <p className="text-gray-400 text-sm">Please wait while we update your preferences.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-xl font-bold text-white mb-2">You've been unsubscribed</h1>
            <p className="text-gray-400 text-sm">
              You will no longer receive newsletter emails from LuxHunter. We're sorry to see you go.
            </p>
          </>
        )}

        {status === 'already' && (
          <>
            <h1 className="text-xl font-bold text-white mb-2">Already unsubscribed</h1>
            <p className="text-gray-400 text-sm">
              This email address has already been removed from our newsletter list.
            </p>
          </>
        )}

        {status === 'missing' && (
          <>
            <h1 className="text-xl font-bold text-white mb-2">Invalid link</h1>
            <p className="text-gray-400 text-sm">
              This unsubscribe link is missing an email address. Please use the link from your email.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 text-sm">
              We couldn't process your request. Please contact us at{' '}
              <a href="mailto:info@luxhunter.com" className="text-[#C9A84C] hover:underline">
                info@luxhunter.com
              </a>
              .
            </p>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-white/10">
          <a
            href="/"
            className="text-sm text-[#C9A84C]/60 hover:text-[#C9A84C] transition-colors"
          >
            Return to LuxHunter
          </a>
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;

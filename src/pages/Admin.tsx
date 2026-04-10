import { useState, useEffect, useCallback } from 'react';
import { Lock, Save, Plus, Trash2, CreditCard as Edit2, Eye, EyeOff, KeyRound, X, CheckCircle, AlertCircle, Users, FileText, Mail, BarChart2, Home, TrendingUp, Settings, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const getEffectivePassword = () => localStorage.getItem('adminPasswordOverride') || ADMIN_PASSWORD;

// ─── Types ────────────────────────────────────────────────────────────────────

interface LVRLimit {
  id: string;
  classification: string;
  lvr_0_70: number;
  lvr_70_80: number;
  lvr_80_90: number | null;
  lvr_90_95: number | null;
}

interface RiskPostcode {
  id: string;
  postcode: number;
  risk_level: string;
  notes: string;
  isNew?: boolean;
}

interface Insight {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  published_at: string;
}

interface FeaturedProperty {
  id: string;
  title: string;
  location: string;
  state: string;
  price: string;
  bedrooms: number | null;
  bathrooms: number | null;
  property_type: string;
  status: string;
  description: string;
  image_url: string;
  tag: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

interface InterestRate {
  id: string;
  lender_name: string;
  rate_type: string;
  interest_rate: number;
  comparison_rate: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  preferred_contact: string;
  created_at: string;
}

interface FreeReportRequest {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  state: string;
  interest_type: string;
  annual_income: number;
  deposit_amount: number;
  calculated_borrowing_capacity: number;
  created_at: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  subscribed_at: string;
  preferences: Record<string, boolean>;
}

interface CalculatorUnlock {
  id: string;
  full_name: string;
  email: string;
  state: string;
  created_at: string;
}

type TabId = 'leads' | 'insights' | 'properties' | 'rates' | 'lvr' | 'risk';
type LeadsTabId = 'contacts' | 'reports' | 'calculator' | 'subscribers';

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));
  return { toasts, show, dismiss };
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[#C9A84C] text-xs font-semibold uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 bg-[#0a1628] border border-[#C9A84C]/25 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A84C]/60 transition-colors text-sm";
const selectCls = `${inputCls} [&>option]:text-gray-900 [&>option]:bg-white`;
const textareaCls = `${inputCls} resize-none`;
const btnGold = "flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-[#0A1628] font-semibold rounded-lg hover:bg-[#d4b865] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost = "flex items-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm";

// ─── Admin Component ──────────────────────────────────────────────────────────

const Admin = () => {
  const { language } = useLanguage();
  const { toasts, show: showToast, dismiss } = useToast();

  // Auth
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Change password
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpShowCurrent, setCpShowCurrent] = useState(false);
  const [cpShowNew, setCpShowNew] = useState(false);
  const [cpShowConfirm, setCpShowConfirm] = useState(false);
  const [cpError, setCpError] = useState('');
  const [cpSuccess, setCpSuccess] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<TabId>('leads');
  const [leadsTab, setLeadsTab] = useState<LeadsTabId>('contacts');

  // Data
  const [lvrLimits, setLvrLimits] = useState<LVRLimit[]>([]);
  const [riskPostcodes, setRiskPostcodes] = useState<RiskPostcode[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);
  const [interestRates, setInterestRates] = useState<InterestRate[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [freeReports, setFreeReports] = useState<FreeReportRequest[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [calcUnlocks, setCalcUnlocks] = useState<CalculatorUnlock[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Inline edit state
  const [editingInsight, setEditingInsight] = useState<Insight | null>(null);
  const [editingProperty, setEditingProperty] = useState<FeaturedProperty | null>(null);

  // New forms
  const [newInsight, setNewInsight] = useState({ category: 'property', title: '', description: '', content: '' });
  const [newProperty, setNewProperty] = useState({
    title: '', location: '', state: 'NSW', price: '', bedrooms: null as number | null,
    bathrooms: null as number | null, property_type: 'House', status: 'For Sale',
    description: '', image_url: '', tag: '', display_order: 0, is_active: true,
  });
  const [showAddRate, setShowAddRate] = useState(false);
  const [newRate, setNewRate] = useState({
    lender_name: '', rate_type: 'Variable', interest_rate: 0, comparison_rate: 0,
    effective_date: new Date().toISOString().split('T')[0],
  });

  // ─── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!authenticated) return;
    loadData();
    const timer = setTimeout(() => {
      handleLogout();
      showToast('error', 'Session expired due to inactivity');
    }, 30 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [authenticated]);

  const loadData = async () => {
    setLoading(true);
    const [lvr, risk, ins, props, rates, cont, reps, subs, calc] = await Promise.all([
      supabase.from('lvr_limits').select('*').order('classification'),
      supabase.from('risk_postcodes').select('*').order('postcode'),
      supabase.from('latest_insights').select('*').order('published_at', { ascending: false }),
      supabase.from('featured_properties').select('*').order('display_order'),
      supabase.from('interest_rates').select('*').order('product_type'),
      supabase.from('contact_submissions').select('*').order('created_at', { ascending: false }),
      supabase.from('free_report_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false }),
      supabase.from('calculator_unlocks').select('*').order('created_at', { ascending: false }),
    ]);
    if (lvr.data) setLvrLimits(lvr.data);
    if (risk.data) setRiskPostcodes(risk.data);
    if (ins.data) setInsights(ins.data);
    if (props.data) setFeaturedProperties(props.data);
    if (rates.data) setInterestRates(rates.data);
    if (cont.data) setContacts(cont.data);
    if (reps.data) setFreeReports(reps.data);
    if (subs.data) setSubscribers(subs.data);
    if (calc.data) setCalcUnlocks(calc.data);
    setLoading(false);
  };

  // ─── Auth handlers ─────────────────────────────────────────────────────────

  const handleLogin = () => {
    if (isLocked) return;
    if (password === getEffectivePassword()) {
      setAuthenticated(true);
      setLoginAttempts(0);
    } else {
      const attempts = loginAttempts + 1;
      setLoginAttempts(attempts);
      if (attempts >= 5) {
        setIsLocked(true);
        setTimeout(() => { setIsLocked(false); setLoginAttempts(0); }, 15 * 60 * 1000);
      }
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword('');
    setLoginAttempts(0);
    setShowChangePwd(false);
  };

  const handleForgotPassword = async () => {
    setForgotStatus('sending');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-admin-password-reminder`,
        { method: 'POST', headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' } }
      );
      setForgotStatus(res.ok ? 'sent' : 'error');
    } catch {
      setForgotStatus('error');
    }
  };

  const handleChangePassword = () => {
    setCpError('');
    if (cpCurrent !== getEffectivePassword()) { setCpError('Current password is incorrect.'); return; }
    if (cpNew.length < 8) { setCpError('New password must be at least 8 characters.'); return; }
    if (cpNew !== cpConfirm) { setCpError('Passwords do not match.'); return; }
    localStorage.setItem('adminPasswordOverride', cpNew);
    setCpSuccess(true);
    setCpCurrent(''); setCpNew(''); setCpConfirm('');
    setTimeout(() => { setCpSuccess(false); setShowChangePwd(false); }, 2000);
  };

  // ─── LVR ──────────────────────────────────────────────────────────────────

  const saveLVR = async () => {
    setSaving(true);
    try {
      await Promise.all(lvrLimits.map(l =>
        supabase.from('lvr_limits').upsert({ ...l, updated_at: new Date().toISOString() })
      ));
      showToast('success', 'LVR limits saved');
    } catch {
      showToast('error', 'Failed to save LVR limits');
    } finally {
      setSaving(false);
    }
  };

  // ─── Risk Postcodes ────────────────────────────────────────────────────────

  const saveRisk = async () => {
    setSaving(true);
    try {
      const newOnes = riskPostcodes.filter(r => r.isNew);
      const existing = riskPostcodes.filter(r => !r.isNew);
      await Promise.all([
        ...newOnes.map(({ isNew, ...data }) =>
          supabase.from('risk_postcodes').insert({ ...data, updated_at: new Date().toISOString() })
        ),
        ...existing.map(r =>
          supabase.from('risk_postcodes').upsert({ ...r, updated_at: new Date().toISOString() })
        ),
      ]);
      showToast('success', 'Risk postcodes saved');
      await loadData();
    } catch {
      showToast('error', 'Failed to save risk postcodes');
    } finally {
      setSaving(false);
    }
  };

  const deleteRisk = async (id: string, isNew?: boolean) => {
    if (isNew) { setRiskPostcodes(prev => prev.filter(r => r.id !== id)); return; }
    const { error } = await supabase.from('risk_postcodes').delete().eq('id', id);
    if (error) { showToast('error', 'Failed to delete'); return; }
    setRiskPostcodes(prev => prev.filter(r => r.id !== id));
    showToast('success', 'Deleted');
  };

  // ─── Interest Rates ────────────────────────────────────────────────────────

  const saveRates = async () => {
    setSaving(true);
    try {
      await Promise.all(interestRates.map(r =>
        supabase.from('interest_rates').upsert({ ...r, updated_at: new Date().toISOString() })
      ));
      showToast('success', 'Interest rates saved');
    } catch {
      showToast('error', 'Failed to save interest rates');
    } finally {
      setSaving(false);
    }
  };

  const addRate = async () => {
    if (!newRate.lender_name) { showToast('error', 'Lender name is required'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('interest_rates').insert({ ...newRate, updated_at: new Date().toISOString() });
      if (error) throw error;
      setNewRate({ lender_name: '', rate_type: 'Variable', interest_rate: 0, comparison_rate: 0, effective_date: new Date().toISOString().split('T')[0] });
      setShowAddRate(false);
      await loadData();
      showToast('success', 'Rate added');
    } catch {
      showToast('error', 'Failed to add rate');
    } finally {
      setSaving(false);
    }
  };

  const deleteRate = async (id: string) => {
    if (!window.confirm('Delete this rate?')) return;
    const { error } = await supabase.from('interest_rates').delete().eq('id', id);
    if (error) { showToast('error', 'Failed to delete'); return; }
    setInterestRates(prev => prev.filter(r => r.id !== id));
    showToast('success', 'Rate deleted');
  };

  // ─── Insights ─────────────────────────────────────────────────────────────

  const addInsight = async () => {
    if (!newInsight.title || !newInsight.description || !newInsight.content) {
      showToast('error', 'Please fill in all fields'); return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('latest_insights').insert({ ...newInsight, published_at: new Date().toISOString() });
      if (error) throw error;
      setNewInsight({ category: 'property', title: '', description: '', content: '' });
      await loadData();
      showToast('success', 'Article published');
    } catch {
      showToast('error', 'Failed to publish article');
    } finally {
      setSaving(false);
    }
  };

  const saveInsight = async () => {
    if (!editingInsight) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('latest_insights').update({
        category: editingInsight.category,
        title: editingInsight.title,
        description: editingInsight.description,
        content: editingInsight.content,
      }).eq('id', editingInsight.id);
      if (error) throw error;
      setEditingInsight(null);
      await loadData();
      showToast('success', 'Article updated');
    } catch {
      showToast('error', 'Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  const deleteInsight = async (id: string) => {
    if (!window.confirm('Delete this article?')) return;
    const { error } = await supabase.from('latest_insights').delete().eq('id', id);
    if (error) { showToast('error', 'Failed to delete'); return; }
    setInsights(prev => prev.filter(i => i.id !== id));
    showToast('success', 'Article deleted');
  };

  // ─── Properties ───────────────────────────────────────────────────────────

  const addProperty = async () => {
    if (!newProperty.title || !newProperty.location || !newProperty.price || !newProperty.description || !newProperty.image_url) {
      showToast('error', 'Please fill in all required fields'); return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('featured_properties').insert(newProperty);
      if (error) throw error;
      setNewProperty({ title: '', location: '', state: 'NSW', price: '', bedrooms: null, bathrooms: null, property_type: 'House', status: 'For Sale', description: '', image_url: '', tag: '', display_order: 0, is_active: true });
      await loadData();
      showToast('success', 'Property added');
    } catch {
      showToast('error', 'Failed to add property');
    } finally {
      setSaving(false);
    }
  };

  const saveProperty = async () => {
    if (!editingProperty) return;
    setSaving(true);
    try {
      const { id, created_at, ...updates } = editingProperty;
      const { error } = await supabase.from('featured_properties').update(updates).eq('id', id);
      if (error) throw error;
      setEditingProperty(null);
      await loadData();
      showToast('success', 'Property updated');
    } catch {
      showToast('error', 'Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  const togglePropertyActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('featured_properties').update({ is_active: !current }).eq('id', id);
    if (error) { showToast('error', 'Failed to update'); return; }
    setFeaturedProperties(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    showToast('success', !current ? 'Property activated' : 'Property deactivated');
  };

  const deleteProperty = async (id: string) => {
    if (!window.confirm('Delete this property?')) return;
    const { error } = await supabase.from('featured_properties').delete().eq('id', id);
    if (error) { showToast('error', 'Failed to delete'); return; }
    setFeaturedProperties(prev => prev.filter(p => p.id !== id));
    showToast('success', 'Property deleted');
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtCurrency = (n?: number) => n != null ? `$${Number(n).toLocaleString()}` : '—';

  // ─── Login screen ─────────────────────────────────────────────────────────

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <div className="bg-[#0d1f35] border border-[#C9A84C]/20 p-8 rounded-2xl w-full max-w-md shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#C9A84C]/10 rounded-full">
              <Lock className="text-[#C9A84C]" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1 text-center">Admin Portal</h1>
          <p className="text-gray-500 text-sm text-center mb-6">LuxHunter CMS</p>

          {isLocked && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600/40 rounded-lg text-red-400 text-sm text-center">
              Too many failed attempts. Try again in 15 minutes.
            </div>
          )}
          {!isLocked && loginAttempts > 0 && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600/40 rounded-lg text-red-400 text-sm text-center">
              Incorrect password — {5 - loginAttempts} attempt{5 - loginAttempts !== 1 ? 's' : ''} remaining
            </div>
          )}

          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 bg-[#0a1628] text-white border border-[#C9A84C]/30 rounded-lg focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button onClick={handleLogin} disabled={isLocked}
            className="w-full bg-[#C9A84C] text-[#0a1628] py-3 rounded-lg font-bold hover:bg-[#d4b865] transition-colors disabled:opacity-40">
            Login
          </button>

          <div className="mt-4 text-center">
            {forgotStatus === 'sent' ? (
              <p className="text-sm text-green-400">Password reminder sent to info@luxhunter.com</p>
            ) : forgotStatus === 'error' ? (
              <p className="text-sm text-red-400">Failed to send. Please try again.</p>
            ) : (
              <button onClick={handleForgotPassword} disabled={forgotStatus === 'sending'}
                className="text-sm text-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors disabled:opacity-50">
                {forgotStatus === 'sending' ? 'Sending...' : 'Forgot Password?'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────

  const tabs: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'leads', label: 'Leads', icon: <Users size={15} />, badge: contacts.length + freeReports.length + calcUnlocks.length + subscribers.length },
    { id: 'insights', label: 'Articles', icon: <FileText size={15} />, badge: insights.length },
    { id: 'properties', label: 'Properties', icon: <Home size={15} />, badge: featuredProperties.length },
    { id: 'rates', label: 'Interest Rates', icon: <TrendingUp size={15} /> },
    { id: 'lvr', label: 'LVR Limits', icon: <BarChart2 size={15} /> },
    { id: 'risk', label: 'Risk Postcodes', icon: <Settings size={15} />, badge: riskPostcodes.length },
  ];

  return (
    <div className="min-h-screen bg-[#080f1e]">

      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium ${
            t.type === 'success'
              ? 'bg-green-900/95 border-green-600/40 text-green-300'
              : 'bg-red-900/95 border-red-600/40 text-red-300'
          }`}>
            {t.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
          </div>
        ))}
      </div>

      {/* Change password modal */}
      {showChangePwd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d1f35] border border-[#C9A84C]/30 rounded-2xl p-8 w-full max-w-md relative shadow-2xl">
            <button onClick={() => setShowChangePwd(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#C9A84C]/10 rounded-lg"><KeyRound className="text-[#C9A84C]" size={20} /></div>
              <h2 className="text-xl font-bold text-white">Change Password</h2>
            </div>
            {cpSuccess ? (
              <div className="text-center py-6">
                <CheckCircle className="text-green-400 mx-auto mb-3" size={48} />
                <p className="text-green-400 font-semibold text-lg">Password updated successfully!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="Current Password">
                  <div className="relative">
                    <input type={cpShowCurrent ? 'text' : 'password'} value={cpCurrent}
                      onChange={e => setCpCurrent(e.target.value)} className={inputCls + ' pr-12'} placeholder="Enter current password" />
                    <button type="button" onClick={() => setCpShowCurrent(!cpShowCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors">
                      {cpShowCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
                <Field label="New Password">
                  <div className="relative">
                    <input type={cpShowNew ? 'text' : 'password'} value={cpNew}
                      onChange={e => setCpNew(e.target.value)} className={inputCls + ' pr-12'} placeholder="At least 8 characters" />
                    <button type="button" onClick={() => setCpShowNew(!cpShowNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors">
                      {cpShowNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
                <Field label="Confirm New Password">
                  <div className="relative">
                    <input type={cpShowConfirm ? 'text' : 'password'} value={cpConfirm}
                      onChange={e => setCpConfirm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                      className={inputCls + ' pr-12'} placeholder="Repeat new password" />
                    <button type="button" onClick={() => setCpShowConfirm(!cpShowConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C9A84C]/50 hover:text-[#C9A84C] transition-colors">
                      {cpShowConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>
                {cpError && <p className="text-red-400 text-sm">{cpError}</p>}
                <div className="flex gap-3 pt-1">
                  <button onClick={handleChangePassword} className={btnGold + ' flex-1 justify-center'}>Update Password</button>
                  <button onClick={() => setShowChangePwd(false)} className={btnGhost}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#0d1f35] border-b border-[#C9A84C]/15 px-6 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-[#0a1628] font-black text-xs">LH</span>
            </div>
            <div>
              <h1 className="text-white font-bold leading-none">LuxHunter</h1>
              <p className="text-[#C9A84C]/50 text-xs">Admin CMS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} disabled={loading}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-40" title="Refresh">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => { setShowChangePwd(true); setCpError(''); setCpSuccess(false); }}
              className="flex items-center gap-2 px-3 py-2 bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/25 rounded-lg hover:bg-[#C9A84C]/20 transition-colors text-sm">
              <KeyRound size={14} /> Change Password
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 bg-red-600/10 text-red-400 border border-red-600/20 rounded-lg hover:bg-red-600/20 transition-colors text-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl p-1.5 flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#C9A84C] text-[#0A1628] shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-[#0a1628]/20 text-[#0a1628]' : 'bg-[#C9A84C]/20 text-[#C9A84C]'
                }`}>{tab.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── LEADS ── */}
        {activeTab === 'leads' && (
          <div className="space-y-5">
            <div className="flex gap-2 flex-wrap">
              {([
                { id: 'contacts' as LeadsTabId, label: 'Contacts', count: contacts.length },
                { id: 'reports' as LeadsTabId, label: 'Free Reports', count: freeReports.length },
                { id: 'calculator' as LeadsTabId, label: 'Calculator Unlocks', count: calcUnlocks.length },
                { id: 'subscribers' as LeadsTabId, label: 'Newsletter', count: subscribers.length },
              ]).map(st => (
                <button key={st.id} onClick={() => setLeadsTab(st.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    leadsTab === st.id
                      ? 'bg-[#C9A84C]/15 text-[#C9A84C] border-[#C9A84C]/30'
                      : 'text-gray-400 border-transparent hover:text-white hover:border-white/10'
                  }`}>
                  {st.label}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    leadsTab === st.id ? 'bg-[#C9A84C]/20 text-[#C9A84C]' : 'bg-white/10 text-gray-400'
                  }`}>{st.count}</span>
                </button>
              ))}
            </div>

            {/* Contacts */}
            {leadsTab === 'contacts' && (
              <div className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#C9A84C]/10">
                  <h2 className="text-white font-semibold">Contact Form Submissions</h2>
                </div>
                {contacts.length === 0
                  ? <p className="text-gray-500 text-center py-16">No submissions yet</p>
                  : <div className="divide-y divide-white/5">
                    {contacts.map(c => (
                      <div key={c.id} className="px-6 py-4 hover:bg-white/2 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-white font-medium">{c.name}</span>
                            <span className="text-gray-400 text-sm">{c.email}</span>
                            {c.phone && <span className="text-gray-500 text-sm">{c.phone}</span>}
                            {c.preferred_contact && (
                              <span className="px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] text-xs rounded">
                                via {c.preferred_contact}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-500 text-xs shrink-0 ml-4">{fmt(c.created_at)}</span>
                        </div>
                        <p className="text-gray-300 text-sm">{c.message}</p>
                      </div>
                    ))}
                  </div>
                }
              </div>
            )}

            {/* Free Reports */}
            {leadsTab === 'reports' && (
              <div className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#C9A84C]/10">
                  <h2 className="text-white font-semibold">Free Report Requests</h2>
                </div>
                {freeReports.length === 0
                  ? <p className="text-gray-500 text-center py-16">No requests yet</p>
                  : <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                      <thead className="border-b border-[#C9A84C]/10">
                        <tr>
                          {['Date', 'Name', 'Email', 'Phone', 'State', 'Interest', 'Income', 'Deposit', 'Borrowing Cap.'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[#C9A84C] text-xs font-semibold uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {freeReports.map(r => (
                          <tr key={r.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmt(r.created_at)}</td>
                            <td className="px-4 py-3 text-white whitespace-nowrap">{r.full_name || '—'}</td>
                            <td className="px-4 py-3 text-gray-300">{r.email}</td>
                            <td className="px-4 py-3 text-gray-400">{r.phone || '—'}</td>
                            <td className="px-4 py-3 text-gray-400">{r.state || '—'}</td>
                            <td className="px-4 py-3 text-gray-400">{r.interest_type || '—'}</td>
                            <td className="px-4 py-3 text-gray-300">{fmtCurrency(r.annual_income)}</td>
                            <td className="px-4 py-3 text-gray-300">{fmtCurrency(r.deposit_amount)}</td>
                            <td className="px-4 py-3 text-[#C9A84C] font-semibold">{fmtCurrency(r.calculated_borrowing_capacity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            )}

            {/* Calculator Unlocks */}
            {leadsTab === 'calculator' && (
              <div className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#C9A84C]/10">
                  <h2 className="text-white font-semibold">Calculator Unlocks</h2>
                </div>
                {calcUnlocks.length === 0
                  ? <p className="text-gray-500 text-center py-16">No calculator unlocks yet</p>
                  : <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-[#C9A84C]/10">
                        <tr>
                          {['Date', 'Name', 'Email', 'State'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[#C9A84C] text-xs font-semibold uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {calcUnlocks.map(u => (
                          <tr key={u.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmt(u.created_at)}</td>
                            <td className="px-4 py-3 text-white">{u.full_name}</td>
                            <td className="px-4 py-3 text-gray-300">{u.email}</td>
                            <td className="px-4 py-3 text-gray-400">{u.state || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            )}

            {/* Subscribers */}
            {leadsTab === 'subscribers' && (
              <div className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#C9A84C]/10">
                  <h2 className="text-white font-semibold">Newsletter Subscribers</h2>
                </div>
                {subscribers.length === 0
                  ? <p className="text-gray-500 text-center py-16">No subscribers yet</p>
                  : <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-[#C9A84C]/10">
                        <tr>
                          {['Date', 'Name', 'Email', 'Preferences', 'Status'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[#C9A84C] text-xs font-semibold uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {subscribers.map(s => {
                          const prefs = s.preferences || {};
                          const activePrefs = Object.entries(prefs).filter(([, v]) => v).map(([k]) =>
                            k === 'property_news' ? 'Property' : k === 'personal_loan_updates' ? 'Personal Loan' : k === 'commercial_loan_updates' ? 'Commercial Loan' : k
                          );
                          return (
                          <tr key={s.id} className="hover:bg-white/2 transition-colors">
                            <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmt(s.subscribed_at)}</td>
                            <td className="px-4 py-3 text-white">{s.name || '—'}</td>
                            <td className="px-4 py-3 text-gray-300">{s.email}</td>
                            <td className="px-4 py-3">
                              {activePrefs.length > 0
                                ? <div className="flex flex-wrap gap-1">{activePrefs.map(p => (
                                    <span key={p} className="px-1.5 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] text-xs rounded">{p}</span>
                                  ))}</div>
                                : <span className="text-gray-600 text-xs">None</span>
                              }
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.is_active ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                                {s.is_active ? 'Active' : 'Unsubscribed'}
                              </span>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                }
              </div>
            )}
          </div>
        )}

        {/* ── INSIGHTS ── */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-5">Publish New Article</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Category">
                  <select value={newInsight.category} onChange={e => setNewInsight({ ...newInsight, category: e.target.value })} className={selectCls}>
                    <option value="property">Property Market</option>
                    <option value="mortgage">Mortgage Trends</option>
                    <option value="investment">Investment</option>
                    <option value="interest_rate">Interest Rate Update</option>
                  </select>
                </Field>
                <Field label="Title">
                  <input type="text" value={newInsight.title} onChange={e => setNewInsight({ ...newInsight, title: e.target.value })}
                    placeholder="Article title" className={inputCls} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Short Description (shown on card)">
                    <textarea value={newInsight.description} onChange={e => setNewInsight({ ...newInsight, description: e.target.value })}
                      placeholder="Brief summary" className={textareaCls} rows={2} />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Full Content">
                    <textarea value={newInsight.content} onChange={e => setNewInsight({ ...newInsight, content: e.target.value })}
                      placeholder="Full article content" className={textareaCls} rows={6} />
                  </Field>
                </div>
              </div>
              <div className="mt-4">
                <button onClick={addInsight} disabled={saving} className={btnGold}>
                  <Plus size={16} />{saving ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </div>

            <h3 className="text-white font-semibold text-lg">Published Articles ({insights.length})</h3>
            {insights.length === 0 && <p className="text-gray-500 text-center py-12 bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl">No articles yet</p>}
            <div className="space-y-3">
              {insights.map(insight => (
                <div key={insight.id} className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl overflow-hidden">
                  {editingInsight?.id === insight.id ? (
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Category">
                          <select value={editingInsight.category} onChange={e => setEditingInsight({ ...editingInsight, category: e.target.value })} className={selectCls}>
                            <option value="property">Property Market</option>
                            <option value="mortgage">Mortgage Trends</option>
                            <option value="investment">Investment</option>
                            <option value="interest_rate">Interest Rate Update</option>
                          </select>
                        </Field>
                        <Field label="Title">
                          <input type="text" value={editingInsight.title}
                            onChange={e => setEditingInsight({ ...editingInsight, title: e.target.value })} className={inputCls} />
                        </Field>
                        <div className="md:col-span-2">
                          <Field label="Short Description">
                            <textarea value={editingInsight.description}
                              onChange={e => setEditingInsight({ ...editingInsight, description: e.target.value })}
                              className={textareaCls} rows={2} />
                          </Field>
                        </div>
                        <div className="md:col-span-2">
                          <Field label="Full Content">
                            <textarea value={editingInsight.content}
                              onChange={e => setEditingInsight({ ...editingInsight, content: e.target.value })}
                              className={textareaCls} rows={6} />
                          </Field>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={saveInsight} disabled={saving} className={btnGold}>
                          <Save size={16} />{saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={() => setEditingInsight(null)} className={btnGhost}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-[#C9A84C]/15 text-[#C9A84C] text-xs rounded font-medium capitalize">{insight.category}</span>
                          <span className="text-gray-500 text-xs">{fmt(insight.published_at)}</span>
                        </div>
                        <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                        <p className="text-gray-400 text-sm line-clamp-2">{insight.description}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setEditingInsight(insight)}
                          className="p-2 bg-blue-600/15 text-blue-400 border border-blue-600/25 rounded-lg hover:bg-blue-600/25 transition-colors">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => deleteInsight(insight.id)}
                          className="p-2 bg-red-600/15 text-red-400 border border-red-600/25 rounded-lg hover:bg-red-600/25 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROPERTIES ── */}
        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-5">Add New Property</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Title *">
                  <input type="text" value={newProperty.title} onChange={e => setNewProperty({ ...newProperty, title: e.target.value })}
                    placeholder="Luxury Waterfront Apartment" className={inputCls} />
                </Field>
                <Field label="Location *">
                  <input type="text" value={newProperty.location} onChange={e => setNewProperty({ ...newProperty, location: e.target.value })}
                    placeholder="Sydney Harbour, NSW" className={inputCls} />
                </Field>
                <Field label="State">
                  <select value={newProperty.state} onChange={e => setNewProperty({ ...newProperty, state: e.target.value })} className={selectCls}>
                    {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Price *">
                  <input type="text" value={newProperty.price} onChange={e => setNewProperty({ ...newProperty, price: e.target.value })}
                    placeholder="$2.5M" className={inputCls} />
                </Field>
                <Field label="Bedrooms">
                  <input type="number" min={0} max={20} value={newProperty.bedrooms ?? ''}
                    onChange={e => setNewProperty({ ...newProperty, bedrooms: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="0" className={inputCls} />
                </Field>
                <Field label="Bathrooms">
                  <input type="number" min={0} max={20} value={newProperty.bathrooms ?? ''}
                    onChange={e => setNewProperty({ ...newProperty, bathrooms: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="0" className={inputCls} />
                </Field>
                <Field label="Property Type">
                  <select value={newProperty.property_type} onChange={e => setNewProperty({ ...newProperty, property_type: e.target.value })} className={selectCls}>
                    {['House', 'Apartment', 'Townhouse', 'Unit', 'Land', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={newProperty.status} onChange={e => setNewProperty({ ...newProperty, status: e.target.value })} className={selectCls}>
                    {['For Sale', 'Sold', 'Under Contract', 'Leased'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Tag">
                  <input type="text" value={newProperty.tag} onChange={e => setNewProperty({ ...newProperty, tag: e.target.value })}
                    placeholder="Premium Location" className={inputCls} />
                </Field>
                <Field label="Display Order">
                  <input type="number" value={newProperty.display_order}
                    onChange={e => setNewProperty({ ...newProperty, display_order: parseInt(e.target.value) || 0 })} className={inputCls} />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Image URL *">
                    <input type="text" value={newProperty.image_url} onChange={e => setNewProperty({ ...newProperty, image_url: e.target.value })}
                      placeholder="https://images.pexels.com/..." className={inputCls} />
                    {newProperty.image_url && (
                      <img src={newProperty.image_url} alt="Preview" className="mt-2 w-48 h-32 object-cover rounded-lg bg-gray-800 border border-white/10" />
                    )}
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="Description *">
                    <textarea value={newProperty.description} onChange={e => setNewProperty({ ...newProperty, description: e.target.value })}
                      placeholder="3 bed, 2 bath with stunning harbour views" className={textareaCls} rows={3} />
                  </Field>
                </div>
              </div>
              <div className="mt-4">
                <button onClick={addProperty} disabled={saving} className={btnGold}>
                  <Plus size={16} />{saving ? 'Adding...' : 'Add Property'}
                </button>
              </div>
            </div>

            <h3 className="text-white font-semibold text-lg">Manage Properties ({featuredProperties.length})</h3>
            {featuredProperties.length === 0 && <p className="text-gray-500 text-center py-12 bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl">No properties yet</p>}
            <div className="space-y-3">
              {featuredProperties.map(prop => (
                <div key={prop.id} className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl overflow-hidden">
                  {editingProperty?.id === prop.id ? (
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Title">
                          <input type="text" value={editingProperty.title}
                            onChange={e => setEditingProperty({ ...editingProperty, title: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="Location">
                          <input type="text" value={editingProperty.location}
                            onChange={e => setEditingProperty({ ...editingProperty, location: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="State">
                          <select value={editingProperty.state} onChange={e => setEditingProperty({ ...editingProperty, state: e.target.value })} className={selectCls}>
                            {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </Field>
                        <Field label="Price">
                          <input type="text" value={editingProperty.price}
                            onChange={e => setEditingProperty({ ...editingProperty, price: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="Bedrooms">
                          <input type="number" min={0} max={20} value={editingProperty.bedrooms ?? ''}
                            onChange={e => setEditingProperty({ ...editingProperty, bedrooms: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="0" className={inputCls} />
                        </Field>
                        <Field label="Bathrooms">
                          <input type="number" min={0} max={20} value={editingProperty.bathrooms ?? ''}
                            onChange={e => setEditingProperty({ ...editingProperty, bathrooms: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="0" className={inputCls} />
                        </Field>
                        <Field label="Property Type">
                          <select value={editingProperty.property_type} onChange={e => setEditingProperty({ ...editingProperty, property_type: e.target.value })} className={selectCls}>
                            {['House', 'Apartment', 'Townhouse', 'Unit', 'Land', 'Other'].map(t => <option key={t}>{t}</option>)}
                          </select>
                        </Field>
                        <Field label="Status">
                          <select value={editingProperty.status} onChange={e => setEditingProperty({ ...editingProperty, status: e.target.value })} className={selectCls}>
                            {['For Sale', 'Sold', 'Under Contract', 'Leased'].map(s => <option key={s}>{s}</option>)}
                          </select>
                        </Field>
                        <Field label="Tag">
                          <input type="text" value={editingProperty.tag}
                            onChange={e => setEditingProperty({ ...editingProperty, tag: e.target.value })} className={inputCls} />
                        </Field>
                        <Field label="Display Order">
                          <input type="number" value={editingProperty.display_order}
                            onChange={e => setEditingProperty({ ...editingProperty, display_order: parseInt(e.target.value) || 0 })} className={inputCls} />
                        </Field>
                        <div className="md:col-span-2">
                          <Field label="Image URL">
                            <input type="text" value={editingProperty.image_url}
                              onChange={e => setEditingProperty({ ...editingProperty, image_url: e.target.value })} className={inputCls} />
                            {editingProperty.image_url && (
                              <img src={editingProperty.image_url} alt="Preview" className="mt-2 w-48 h-32 object-cover rounded-lg bg-gray-800 border border-white/10" />
                            )}
                          </Field>
                        </div>
                        <div className="md:col-span-2">
                          <Field label="Description">
                            <textarea value={editingProperty.description}
                              onChange={e => setEditingProperty({ ...editingProperty, description: e.target.value })}
                              className={textareaCls} rows={3} />
                          </Field>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={saveProperty} disabled={saving} className={btnGold}>
                          <Save size={16} />{saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button onClick={() => setEditingProperty(null)} className={btnGhost}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 flex gap-4 items-start">
                      {prop.image_url && (
                        <img src={prop.image_url} alt={prop.title} className="w-28 h-20 object-cover rounded-lg shrink-0 bg-gray-800" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <div>
                            <h4 className="text-white font-semibold">{prop.title}</h4>
                            <p className="text-gray-400 text-sm">{prop.location} · {prop.state}</p>
                            <p className="text-[#C9A84C] font-bold text-sm mt-0.5">{prop.price}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => togglePropertyActive(prop.id, prop.is_active)}
                              className={`p-2 rounded-lg border transition-colors ${prop.is_active ? 'bg-green-900/25 text-green-400 border-green-600/25 hover:bg-green-900/40' : 'bg-gray-800/60 text-gray-500 border-gray-600/25 hover:bg-gray-700/60'}`}
                              title={prop.is_active ? 'Active — click to deactivate' : 'Inactive — click to activate'}>
                              {prop.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                            </button>
                            <button onClick={() => setEditingProperty(prop)}
                              className="p-2 bg-blue-600/15 text-blue-400 border border-blue-600/25 rounded-lg hover:bg-blue-600/25 transition-colors">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => deleteProperty(prop.id)}
                              className="p-2 bg-red-600/15 text-red-400 border border-red-600/25 rounded-lg hover:bg-red-600/25 transition-colors">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs line-clamp-1">{prop.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {prop.tag && <span className="px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] text-xs rounded">{prop.tag}</span>}
                          <span className="text-gray-600 text-xs">Order: {prop.display_order}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── INTEREST RATES ── */}
        {activeTab === 'rates' && (
          <div className="space-y-6">
            <div className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-white font-semibold text-lg">Interest Rates</h2>
                  <p className="text-gray-500 text-sm mt-0.5">Lender rates displayed on the site</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowAddRate(v => !v)} className={btnGhost}>
                    <Plus size={16} />Add Rate
                  </button>
                  <button onClick={saveRates} disabled={saving} className={btnGold}>
                    <Save size={16} />{saving ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>
              </div>

              {showAddRate && (
                <div className="mb-6 p-5 bg-[#0a1628] border border-[#C9A84C]/20 rounded-xl">
                  <h3 className="text-white font-semibold mb-4 text-sm">New Rate</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Lender Name">
                      <input type="text" value={newRate.lender_name}
                        onChange={e => setNewRate({ ...newRate, lender_name: e.target.value })}
                        placeholder="Commonwealth Bank" className={inputCls} />
                    </Field>
                    <Field label="Rate Type">
                      <select value={newRate.rate_type} onChange={e => setNewRate({ ...newRate, rate_type: e.target.value })} className={selectCls}>
                        {['Variable', 'Fixed 1yr', 'Fixed 2yr', 'Fixed 3yr', 'Fixed 5yr'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </Field>
                    <Field label="Effective Date">
                      <input type="date" value={newRate.effective_date}
                        onChange={e => setNewRate({ ...newRate, effective_date: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Interest Rate (%)">
                      <input type="number" step="0.01" min="0" value={newRate.interest_rate}
                        onChange={e => setNewRate({ ...newRate, interest_rate: parseFloat(e.target.value) || 0 })} className={inputCls} />
                    </Field>
                    <Field label="Comparison Rate (%)">
                      <input type="number" step="0.01" min="0" value={newRate.comparison_rate}
                        onChange={e => setNewRate({ ...newRate, comparison_rate: parseFloat(e.target.value) || 0 })} className={inputCls} />
                    </Field>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={addRate} disabled={saving} className={btnGold}>
                      <Plus size={16} />{saving ? 'Adding...' : 'Add Rate'}
                    </button>
                    <button onClick={() => setShowAddRate(false)} className={btnGhost}>Cancel</button>
                  </div>
                </div>
              )}

              {interestRates.length === 0
                ? <p className="text-gray-500 text-center py-16">No interest rate records found. Click "+ Add Rate" to get started.</p>
                : <div className="space-y-3">
                  {interestRates.map(rate => (
                    <div key={rate.id} className="flex items-center gap-4 p-4 bg-[#0a1628] border border-[#C9A84C]/10 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-white font-semibold">{rate.lender_name}</span>
                          <span className="px-2 py-0.5 bg-[#C9A84C]/10 text-[#C9A84C] text-xs rounded font-medium">{rate.rate_type}</span>
                          <span className="text-gray-500 text-xs">Effective: {rate.effective_date ? new Date(rate.effective_date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-wide mb-1">Interest Rate (%)</p>
                            <input type="number" step="0.01" value={rate.interest_rate}
                              onChange={e => setInterestRates(prev => prev.map(r => r.id === rate.id ? { ...r, interest_rate: parseFloat(e.target.value) || 0 } : r))}
                              className={inputCls} />
                          </div>
                          <div>
                            <p className="text-[#C9A84C] text-xs font-semibold uppercase tracking-wide mb-1">Comparison Rate (%)</p>
                            <input type="number" step="0.01" value={rate.comparison_rate}
                              onChange={e => setInterestRates(prev => prev.map(r => r.id === rate.id ? { ...r, comparison_rate: parseFloat(e.target.value) || 0 } : r))}
                              className={inputCls} />
                          </div>
                        </div>
                      </div>
                      <button onClick={() => deleteRate(rate.id)}
                        className="p-2 bg-red-600/15 text-red-400 border border-red-600/25 rounded-lg hover:bg-red-600/25 transition-colors shrink-0">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        )}

        {/* ── LVR LIMITS ── */}
        {activeTab === 'lvr' && (
          <div className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">LVR Limits by Classification</h2>
                <p className="text-gray-500 text-sm mt-0.5">Maximum loan amounts ($) per LVR band</p>
              </div>
              <button onClick={saveLVR} disabled={saving} className={btnGold}>
                <Save size={16} />{saving ? 'Saving...' : 'Save All Changes'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#C9A84C]/15">
                  <tr>
                    {['Classification', '0–70% LVR ($)', '70–80% LVR ($)', '80–90% LVR ($)', '90–95% LVR ($)'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[#C9A84C] text-xs font-semibold uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {lvrLimits.map(limit => (
                    <tr key={limit.id} className="hover:bg-white/2">
                      <td className="px-4 py-3">
                        <input type="text" value={limit.classification} disabled
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 text-sm cursor-not-allowed" />
                      </td>
                      {([
                        { key: 'lvr_0_70' as keyof LVRLimit, val: limit.lvr_0_70, nullable: false },
                        { key: 'lvr_70_80' as keyof LVRLimit, val: limit.lvr_70_80, nullable: false },
                        { key: 'lvr_80_90' as keyof LVRLimit, val: limit.lvr_80_90, nullable: true },
                        { key: 'lvr_90_95' as keyof LVRLimit, val: limit.lvr_90_95, nullable: true },
                      ]).map(({ key, val, nullable }) => (
                        <td key={key} className="px-4 py-3">
                          <input type="number" value={val ?? ''} placeholder={nullable ? 'N/A' : ''}
                            onChange={e => setLvrLimits(prev => prev.map(l =>
                              l.id === limit.id ? { ...l, [key]: e.target.value ? parseFloat(e.target.value) : null } : l
                            ))}
                            className={inputCls} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── RISK POSTCODES ── */}
        {activeTab === 'risk' && (
          <div className="bg-[#0d1f35] border border-[#C9A84C]/15 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-semibold text-lg">Risk Postcodes</h2>
                <p className="text-gray-500 text-sm mt-0.5">Postcodes flagged as High-Risk or Unacceptable for lending</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRiskPostcodes(prev => [...prev, { id: crypto.randomUUID(), postcode: 0, risk_level: 'High-Risk', notes: '', isNew: true }])}
                  className={btnGhost}><Plus size={16} />Add Row</button>
                <button onClick={saveRisk} disabled={saving} className={btnGold}>
                  <Save size={16} />{saving ? 'Saving...' : 'Save All'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-[#C9A84C]/15">
                  <tr>
                    <th className="px-4 py-3 text-left text-[#C9A84C] text-xs font-semibold uppercase tracking-wide w-36">Postcode</th>
                    <th className="px-4 py-3 text-left text-[#C9A84C] text-xs font-semibold uppercase tracking-wide w-44">Risk Level</th>
                    <th className="px-4 py-3 text-left text-[#C9A84C] text-xs font-semibold uppercase tracking-wide">Notes</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {riskPostcodes.map(risk => (
                    <tr key={risk.id} className={risk.isNew ? 'bg-[#C9A84C]/5' : 'hover:bg-white/2'}>
                      <td className="px-4 py-2.5">
                        <input type="number" value={risk.postcode}
                          onChange={e => setRiskPostcodes(prev => prev.map(r => r.id === risk.id ? { ...r, postcode: parseInt(e.target.value) || 0 } : r))}
                          className={inputCls} />
                      </td>
                      <td className="px-4 py-2.5">
                        <select value={risk.risk_level}
                          onChange={e => setRiskPostcodes(prev => prev.map(r => r.id === risk.id ? { ...r, risk_level: e.target.value } : r))}
                          className={selectCls}>
                          <option value="High-Risk">High-Risk</option>
                          <option value="Unacceptable">Unacceptable</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="text" value={risk.notes}
                          onChange={e => setRiskPostcodes(prev => prev.map(r => r.id === risk.id ? { ...r, notes: e.target.value } : r))}
                          placeholder="Notes..." className={inputCls} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => deleteRisk(risk.id, risk.isNew)}
                          className="p-2 bg-red-600/15 text-red-400 border border-red-600/25 rounded-lg hover:bg-red-600/25 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {riskPostcodes.length === 0 && <p className="text-gray-500 text-center py-16">No risk postcodes yet</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;

import { useState, useEffect } from 'react';
import { Lock, Save, Plus, Trash2, CreditCard as Edit2, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '0309';

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
  description: string;
  image_url: string;
  tag: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

const Admin = () => {
  const { language } = useLanguage();
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'lvr' | 'risk' | 'properties'>('insights');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const [lvrLimits, setLvrLimits] = useState<LVRLimit[]>([]);
  const [riskPostcodes, setRiskPostcodes] = useState<RiskPostcode[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<FeaturedProperty[]>([]);

  const [newInsight, setNewInsight] = useState({
    category: 'property',
    title: '',
    description: '',
    content: ''
  });

  const [newProperty, setNewProperty] = useState({
    title: '',
    location: '',
    state: 'NSW',
    price: '',
    description: '',
    image_url: '',
    tag: '',
    display_order: 0,
    is_active: true
  });

  const [editingProperty, setEditingProperty] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authenticated) {
      loadData();
      const timeout = setTimeout(() => {
        handleLogout();
        alert(language === 'en' ? 'Session expired due to inactivity' : '由于不活动，会话已过期');
      }, 30 * 60 * 1000);

      return () => clearTimeout(timeout);
    }
  }, [authenticated, language]);

  const loadData = async () => {
    const { data: lvr } = await supabase.from('lvr_limits').select('*');
    const { data: risk } = await supabase.from('risk_postcodes').select('*');
    const { data: insightsData } = await supabase.from('latest_insights').select('*').order('published_at', { ascending: false });
    const { data: propertiesData } = await supabase.from('featured_properties').select('*').order('display_order', { ascending: true });

    if (lvr) setLvrLimits(lvr);
    if (risk) setRiskPostcodes(risk);
    if (insightsData) setInsights(insightsData);
    if (propertiesData) setFeaturedProperties(propertiesData);
  };

  const handleLogin = () => {
    if (isLocked) {
      alert(language === 'en' ? 'Too many failed attempts. Please try again in 15 minutes.' : '尝试次数过多。请在15分钟后重试。');
      return;
    }

    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setLoginAttempts(0);
      setIsLocked(false);
    } else {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setLoginAttempts(0);
        }, 15 * 60 * 1000);
        alert(language === 'en' ? 'Too many failed attempts. Locked for 15 minutes.' : '尝试次数过多。已锁定15分钟。');
      } else {
        alert(language === 'en' ? `Wrong password (${5 - newAttempts} attempts remaining)` : `密码错误 (剩余 ${5 - newAttempts} 次尝试)`);
      }
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setPassword('');
    setLoginAttempts(0);
  };

  const saveLVRLimits = async () => {
    setIsSaving(true);
    try {
      for (const limit of lvrLimits) {
        await supabase
          .from('lvr_limits')
          .upsert({
            id: limit.id,
            classification: limit.classification,
            lvr_0_70: limit.lvr_0_70,
            lvr_70_80: limit.lvr_70_80,
            lvr_80_90: limit.lvr_80_90,
            lvr_90_95: limit.lvr_90_95,
            updated_at: new Date().toISOString(),
          });
      }
      alert(language === 'en' ? 'LVR limits saved!' : 'LVR限制已保存！');
    } catch (error) {
      console.error('Error saving:', error);
      alert(language === 'en' ? 'Failed to save' : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const saveRiskPostcodes = async () => {
    setIsSaving(true);
    try {
      for (const risk of riskPostcodes) {
        await supabase
          .from('risk_postcodes')
          .upsert({
            id: risk.id,
            postcode: risk.postcode,
            risk_level: risk.risk_level,
            notes: risk.notes,
            updated_at: new Date().toISOString(),
          });
      }
      alert(language === 'en' ? 'Risk postcodes saved!' : '风险邮编已保存！');
    } catch (error) {
      console.error('Error saving:', error);
      alert(language === 'en' ? 'Failed to save' : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const addRiskPostcode = () => {
    setRiskPostcodes([
      ...riskPostcodes,
      {
        id: crypto.randomUUID(),
        postcode: 0,
        risk_level: 'High-Risk',
        notes: '',
      },
    ]);
  };

  const deleteRiskPostcode = async (id: string) => {
    try {
      await supabase.from('risk_postcodes').delete().eq('id', id);
      setRiskPostcodes(riskPostcodes.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const addInsight = async () => {
    if (!newInsight.title || !newInsight.description || !newInsight.content) {
      alert(language === 'en' ? 'Please fill in all fields' : '请填写所有字段');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('latest_insights').insert({
        ...newInsight,
        published_at: new Date().toISOString()
      });

      if (error) throw error;

      await loadData();
      setNewInsight({ category: 'property', title: '', description: '', content: '' });
      alert(language === 'en' ? 'Insight added successfully!' : '文章添加成功！');
    } catch (error) {
      console.error('Error adding insight:', error);
      alert(language === 'en' ? 'Failed to add insight' : '添加文章失败');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteInsight = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this insight?' : '删除此文章？')) return;

    try {
      await supabase.from('latest_insights').delete().eq('id', id);
      setInsights(insights.filter((i) => i.id !== id));
      alert(language === 'en' ? 'Insight deleted' : '文章已删除');
    } catch (error) {
      console.error('Error deleting:', error);
      alert(language === 'en' ? 'Failed to delete' : '删除失败');
    }
  };

  const addProperty = async () => {
    if (!newProperty.title || !newProperty.location || !newProperty.price || !newProperty.description || !newProperty.image_url) {
      alert(language === 'en' ? 'Please fill in all required fields' : '请填写所有必填字段');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('featured_properties').insert(newProperty);

      if (error) throw error;

      await loadData();
      setNewProperty({ title: '', location: '', state: 'NSW', price: '', description: '', image_url: '', tag: '', display_order: 0, is_active: true });
      alert(language === 'en' ? 'Property added successfully!' : '房产添加成功！');
    } catch (error) {
      console.error('Error adding property:', error);
      alert(language === 'en' ? 'Failed to add property' : '添加房产失败');
    } finally {
      setIsSaving(false);
    }
  };

  const updateProperty = async (id: string, updates: Partial<FeaturedProperty>) => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('featured_properties').update(updates).eq('id', id);

      if (error) throw error;

      await loadData();
      setEditingProperty(null);
      alert(language === 'en' ? 'Property updated!' : '房产已更新！');
    } catch (error) {
      console.error('Error updating property:', error);
      alert(language === 'en' ? 'Failed to update property' : '更新房产失败');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePropertyActive = async (id: string, currentStatus: boolean) => {
    await updateProperty(id, { is_active: !currentStatus });
  };

  const deleteProperty = async (id: string) => {
    if (!confirm(language === 'en' ? 'Delete this property?' : '删除此房产？')) return;

    try {
      await supabase.from('featured_properties').delete().eq('id', id);
      setFeaturedProperties(featuredProperties.filter((p) => p.id !== id));
      alert(language === 'en' ? 'Property deleted' : '房产已删除');
    } catch (error) {
      console.error('Error deleting:', error);
      alert(language === 'en' ? 'Failed to delete' : '删除失败');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <div className="bg-[#1e3a5f] p-8 rounded-xl border border-[#d4af37]/20 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#d4af37]/10 rounded-full">
              <Lock className="text-[#d4af37]" size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4 text-center">
            {language === 'en' ? 'Admin' : '管理员'}
          </h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={language === 'en' ? 'Password' : '密码'}
            className="w-full p-3 rounded bg-[#0a1628] text-white border border-[#d4af37]/30 mb-4"
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            disabled={isLocked}
            className="w-full bg-[#d4af37] text-[#0a1628] py-3 rounded font-semibold hover:bg-[#e5c158] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLocked ? (language === 'en' ? 'Locked' : '已锁定') : (language === 'en' ? 'Login' : '登录')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1628] px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            {language === 'en' ? 'Admin Dashboard' : '管理仪表板'}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            {language === 'en' ? 'Logout' : '登出'}
          </button>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-6 py-3 rounded font-semibold transition-colors ${
              activeTab === 'insights'
                ? 'bg-[#C9A84C] text-[#0A1628]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {language === 'en' ? 'Latest Insights' : '最新洞察'}
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-6 py-3 rounded font-semibold transition-colors ${
              activeTab === 'properties'
                ? 'bg-[#C9A84C] text-[#0A1628]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {language === 'en' ? 'Featured Properties' : '精选房产'}
          </button>
          <button
            onClick={() => setActiveTab('lvr')}
            className={`px-6 py-3 rounded font-semibold transition-colors ${
              activeTab === 'lvr'
                ? 'bg-[#C9A84C] text-[#0A1628]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {language === 'en' ? 'LVR Limits' : 'LVR限制'}
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-6 py-3 rounded font-semibold transition-colors ${
              activeTab === 'risk'
                ? 'bg-[#C9A84C] text-[#0A1628]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {language === 'en' ? 'Risk Postcodes' : '风险邮编'}
          </button>
        </div>

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="bg-[#0D1F35] border border-[#C9A84C]/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#C9A84C] mb-4">
                {language === 'en' ? 'Add New Article' : '添加新文章'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">
                    {language === 'en' ? 'Category' : '分类'}
                  </label>
                  <select
                    value={newInsight.category}
                    onChange={(e) => setNewInsight({...newInsight, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white [&>option]:text-gray-900 [&>option]:bg-white"
                  >
                    <option value="property">{language === 'en' ? 'Property Market' : '房产市场'}</option>
                    <option value="mortgage">{language === 'en' ? 'Mortgage Trends' : '房贷动态'}</option>
                    <option value="investment">{language === 'en' ? 'Investment' : '投资'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">
                    {language === 'en' ? 'Title' : '标题'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'Enter title' : '输入标题'}
                    value={newInsight.title}
                    onChange={(e) => setNewInsight({...newInsight, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">
                    {language === 'en' ? 'Description' : '描述'}
                  </label>
                  <textarea
                    placeholder={language === 'en' ? 'Enter description' : '输入描述'}
                    value={newInsight.description}
                    onChange={(e) => setNewInsight({...newInsight, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 h-24"
                  />
                </div>
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">
                    {language === 'en' ? 'Full Content' : '完整内容'}
                  </label>
                  <textarea
                    placeholder={language === 'en' ? 'Enter full content' : '输入完整内容'}
                    value={newInsight.content}
                    onChange={(e) => setNewInsight({...newInsight, content: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 h-32"
                  />
                </div>
                <button
                  onClick={addInsight}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] px-6 py-3 rounded font-semibold hover:bg-[#d4b865] transition-colors disabled:opacity-50"
                >
                  <Plus size={20} />
                  {isSaving ? (language === 'en' ? 'Adding...' : '添加中...') : language === 'en' ? 'Add Article' : '添加文章'}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                {language === 'en' ? 'Published Articles' : '已发布文章'}
              </h3>
              {insights.map((insight) => (
                <div key={insight.id} className="bg-[#0D1F35] border border-[#C9A84C]/30 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-[#C9A84C]/20 text-[#C9A84C] text-sm rounded mb-2">
                        {insight.category}
                      </span>
                      <h4 className="text-white font-semibold text-lg mb-2">{insight.title}</h4>
                      <p className="text-gray-400 text-sm mb-2">{insight.description}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(insight.published_at).toLocaleDateString(language === 'en' ? 'en-AU' : 'zh-CN')}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteInsight(insight.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors ml-4"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  {language === 'en' ? 'No articles yet' : '暂无文章'}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'lvr' && (
          <div className="bg-[#0D1F35] border border-[#C9A84C]/30 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              {language === 'en' ? 'LVR Limits by Classification' : 'LVR分类限制'}
            </h2>
            <div className="space-y-6">
              {lvrLimits.map((limit) => (
                <div key={limit.id} className="grid grid-cols-5 gap-4 items-center">
                  <div>
                    <label className="block text-[#C9A84C] text-sm mb-2">Classification</label>
                    <input
                      type="text"
                      value={limit.classification}
                      disabled
                      className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#C9A84C] text-sm mb-2">0-70% LVR</label>
                    <input
                      type="number"
                      value={limit.lvr_0_70}
                      onChange={(e) =>
                        setLvrLimits(
                          lvrLimits.map((l) =>
                            l.id === limit.id ? { ...l, lvr_0_70: parseFloat(e.target.value) } : l
                          )
                        )
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#C9A84C] text-sm mb-2">70-80% LVR</label>
                    <input
                      type="number"
                      value={limit.lvr_70_80}
                      onChange={(e) =>
                        setLvrLimits(
                          lvrLimits.map((l) =>
                            l.id === limit.id ? { ...l, lvr_70_80: parseFloat(e.target.value) } : l
                          )
                        )
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#C9A84C] text-sm mb-2">80-90% LVR</label>
                    <input
                      type="number"
                      value={limit.lvr_80_90 || ''}
                      onChange={(e) =>
                        setLvrLimits(
                          lvrLimits.map((l) =>
                            l.id === limit.id
                              ? { ...l, lvr_80_90: e.target.value ? parseFloat(e.target.value) : null }
                              : l
                          )
                        )
                      }
                      placeholder="N/A"
                      className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#C9A84C] text-sm mb-2">90-95% LVR</label>
                    <input
                      type="number"
                      value={limit.lvr_90_95 || ''}
                      onChange={(e) =>
                        setLvrLimits(
                          lvrLimits.map((l) =>
                            l.id === limit.id
                              ? { ...l, lvr_90_95: e.target.value ? parseFloat(e.target.value) : null }
                              : l
                          )
                        )
                      }
                      placeholder="N/A"
                      className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={saveLVRLimits}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-bold rounded hover:bg-[#d4b865] transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {isSaving ? (language === 'en' ? 'Saving...' : '保存中...') : language === 'en' ? 'Save Changes' : '保存更改'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="bg-[#0D1F35] border border-[#C9A84C]/30 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {language === 'en' ? 'Risk Postcodes' : '风险邮编'}
              </h2>
              <button
                onClick={addRiskPostcode}
                className="flex items-center gap-2 px-4 py-2 bg-[#C9A84C] text-[#0A1628] font-semibold rounded hover:bg-[#d4b865] transition-colors"
              >
                <Plus size={20} />
                {language === 'en' ? 'Add' : '添加'}
              </button>
            </div>
            <div className="space-y-4">
              {riskPostcodes.map((risk) => (
                <div key={risk.id} className="grid grid-cols-4 gap-4 items-center">
                  <div>
                    <label className="block text-[#C9A84C] text-sm mb-2">Postcode</label>
                    <input
                      type="number"
                      value={risk.postcode}
                      onChange={(e) =>
                        setRiskPostcodes(
                          riskPostcodes.map((r) =>
                            r.id === risk.id ? { ...r, postcode: parseInt(e.target.value) } : r
                          )
                        )
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#C9A84C] text-sm mb-2">Risk Level</label>
                    <select
                      value={risk.risk_level}
                      onChange={(e) =>
                        setRiskPostcodes(
                          riskPostcodes.map((r) =>
                            r.id === risk.id ? { ...r, risk_level: e.target.value } : r
                          )
                        )
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white [&>option]:text-gray-900 [&>option]:bg-white"
                    >
                      <option value="High-Risk">High-Risk</option>
                      <option value="Unacceptable">Unacceptable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#C9A84C] text-sm mb-2">Notes</label>
                    <input
                      type="text"
                      value={risk.notes}
                      onChange={(e) =>
                        setRiskPostcodes(
                          riskPostcodes.map((r) =>
                            r.id === risk.id ? { ...r, notes: e.target.value } : r
                          )
                        )
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => deleteRiskPostcode(risk.id)}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                onClick={saveRiskPostcodes}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#0A1628] font-bold rounded hover:bg-[#d4b865] transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {isSaving ? (language === 'en' ? 'Saving...' : '保存中...') : language === 'en' ? 'Save Changes' : '保存更改'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="space-y-6">
            <div className="bg-[#0D1F35] border border-[#C9A84C]/30 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-[#C9A84C] mb-4">
                {language === 'en' ? 'Add New Property' : '添加新房产'}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">Title*</label>
                  <input
                    type="text"
                    placeholder="Luxury Waterfront Apartment"
                    value={newProperty.title}
                    onChange={(e) => setNewProperty({...newProperty, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">Location*</label>
                  <input
                    type="text"
                    placeholder="Sydney Harbour, NSW"
                    value={newProperty.location}
                    onChange={(e) => setNewProperty({...newProperty, location: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">State*</label>
                  <select
                    value={newProperty.state}
                    onChange={(e) => setNewProperty({...newProperty, state: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white [&>option]:text-gray-900 [&>option]:bg-white"
                  >
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
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">Price*</label>
                  <input
                    type="text"
                    placeholder="$2.5M"
                    value={newProperty.price}
                    onChange={(e) => setNewProperty({...newProperty, price: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">Tag</label>
                  <input
                    type="text"
                    placeholder="Premium Location"
                    value={newProperty.tag}
                    onChange={(e) => setNewProperty({...newProperty, tag: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-[#C9A84C] text-sm mb-2">Display Order</label>
                  <input
                    type="number"
                    value={newProperty.display_order}
                    onChange={(e) => setNewProperty({...newProperty, display_order: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[#C9A84C] text-sm mb-2">Image URL*</label>
                  <input
                    type="text"
                    placeholder="https://images.pexels.com/..."
                    value={newProperty.image_url}
                    onChange={(e) => setNewProperty({...newProperty, image_url: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[#C9A84C] text-sm mb-2">Description*</label>
                  <textarea
                    placeholder="3 bed, 2 bath with stunning harbour views"
                    value={newProperty.description}
                    onChange={(e) => setNewProperty({...newProperty, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#C9A84C]/30 rounded text-white placeholder-gray-500 h-24"
                  />
                </div>
              </div>
              <button
                onClick={addProperty}
                disabled={isSaving}
                className="mt-4 flex items-center gap-2 bg-[#C9A84C] text-[#0A1628] px-6 py-3 rounded font-semibold hover:bg-[#d4b865] transition-colors disabled:opacity-50"
              >
                <Plus size={20} />
                {isSaving ? (language === 'en' ? 'Adding...' : '添加中...') : language === 'en' ? 'Add Property' : '添加房产'}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                {language === 'en' ? 'Manage Properties' : '管理房产'}
              </h3>
              {featuredProperties.map((property) => (
                <div key={property.id} className="bg-[#0D1F35] border border-[#C9A84C]/30 rounded-xl p-4">
                  {editingProperty === property.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#C9A84C] text-sm mb-2">Title</label>
                          <input
                            type="text"
                            defaultValue={property.title}
                            id={`title-${property.id}`}
                            className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[#C9A84C] text-sm mb-2">Location</label>
                          <input
                            type="text"
                            defaultValue={property.location}
                            id={`location-${property.id}`}
                            className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[#C9A84C] text-sm mb-2">Price</label>
                          <input
                            type="text"
                            defaultValue={property.price}
                            id={`price-${property.id}`}
                            className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[#C9A84C] text-sm mb-2">Display Order</label>
                          <input
                            type="number"
                            defaultValue={property.display_order}
                            id={`order-${property.id}`}
                            className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-[#C9A84C] text-sm mb-2">Description</label>
                          <textarea
                            defaultValue={property.description}
                            id={`desc-${property.id}`}
                            className="w-full px-4 py-2 bg-white/5 border border-[#C9A84C]/30 rounded text-white h-20"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const title = (document.getElementById(`title-${property.id}`) as HTMLInputElement).value;
                            const location = (document.getElementById(`location-${property.id}`) as HTMLInputElement).value;
                            const price = (document.getElementById(`price-${property.id}`) as HTMLInputElement).value;
                            const description = (document.getElementById(`desc-${property.id}`) as HTMLTextAreaElement).value;
                            const display_order = parseInt((document.getElementById(`order-${property.id}`) as HTMLInputElement).value);
                            updateProperty(property.id, { title, location, price, description, display_order });
                          }}
                          className="px-4 py-2 bg-[#C9A84C] text-[#0A1628] rounded font-semibold hover:bg-[#d4b865] transition-colors"
                        >
                          {language === 'en' ? 'Save' : '保存'}
                        </button>
                        <button
                          onClick={() => setEditingProperty(null)}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          {language === 'en' ? 'Cancel' : '取消'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <img src={property.image_url} alt={property.title} className="w-32 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-white font-semibold text-lg">{property.title}</h4>
                            <p className="text-gray-400 text-sm">{property.location}</p>
                            <p className="text-[#C9A84C] font-bold">{property.price}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => togglePropertyActive(property.id, property.is_active)}
                              className={`p-2 rounded transition-colors ${property.is_active ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                              title={property.is_active ? 'Active' : 'Inactive'}
                            >
                              {property.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <button
                              onClick={() => setEditingProperty(property.id)}
                              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => deleteProperty(property.id)}
                              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-500 text-sm">{property.description}</p>
                        {property.tag && (
                          <span className="inline-block mt-2 px-2 py-1 bg-[#C9A84C]/20 text-[#C9A84C] text-xs rounded">
                            {property.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {featuredProperties.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  {language === 'en' ? 'No properties yet' : '暂无房产'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

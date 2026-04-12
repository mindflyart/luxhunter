-- Site Settings: key-value store for admin-configurable site settings
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for frontend components)
CREATE POLICY "Allow anon read site_settings"
  ON site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can update settings
CREATE POLICY "Allow authenticated update site_settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anon to update (admin uses anon key with password check in frontend)
CREATE POLICY "Allow anon update site_settings"
  ON site_settings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('whatsapp_number', '61466679195'),
  ('wechat_id', 'auluxytc'),
  ('telegram_link', 'https://t.me/luxhunterbot'),
  ('calendly_url', 'https://calendly.com/newluxytc-pm/30min'),
  ('company_email', 'info@luxhunter.com'),
  ('company_name', 'LuxHunter'),
  ('company_abn', '84 619 992 497'),
  ('newsletter_subject', 'LuxHunter Property Brief | 房产速报'),
  ('newsletter_greeting', 'Hi there 你好'),
  ('newsletter_cta_text', 'Get Your Free Borrowing Report | 免费借贷报告'),
  ('newsletter_cta_url', '/calculator')
ON CONFLICT (key) DO NOTHING;

-- Editable content keys
INSERT INTO site_settings (key, value) VALUES
  ('content_hero_title_en', 'Expert Mortgage Strategy & Property Advisory'),
  ('content_hero_title_zh', '专业房产策略与贷款咨询'),
  ('content_hero_subtitle_en', 'Expert Property and mortgage advisory services for you'),
  ('content_hero_subtitle_zh', '为您提供专业的房产顾问与贷款咨询服务'),
  ('content_hero_cta_en', 'Get Free Report'),
  ('content_hero_cta_zh', '获取免费报告'),
  ('content_services_cta_title_en', 'Ready to get started?'),
  ('content_services_cta_title_zh', '准备好开始了吗？'),
  ('content_services_cta_desc_en', 'Discover how our expert advisory services can help you navigate the property market with confidence'),
  ('content_services_cta_desc_zh', '让我们的持牌专家为您提供专业指导，帮助您自信地进入房产市场'),
  ('content_newsletter_title_en', 'Stay Updated'),
  ('content_newsletter_title_zh', '保持更新'),
  ('content_newsletter_subtitle_en', 'Subscribe to receive the latest property insights and market updates'),
  ('content_newsletter_subtitle_zh', '订阅以接收最新的房产见解和市场更新'),
  ('content_footer_disclaimer_en', 'All financial information on this website is authorised and provided by Ribbon Finance Mortgage Management Pty Ltd (ACL 525880). This website is affiliated with Ribbon Finance. General advice only — not personal financial advice.'),
  ('content_footer_disclaimer_zh', '本网站所有财务信息均由 Ribbon Finance Mortgage Management Pty Ltd（ACL 525880）授权提供。本网站与 Ribbon Finance 合作。仅供一般建议之用，非个人财务建议。')
ON CONFLICT (key) DO NOTHING;

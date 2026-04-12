import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const settingsCache: Record<string, string> = {};
let loaded = false;

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>(settingsCache);

  useEffect(() => {
    if (loaded) return;
    supabase.from('site_settings').select('*').then(({ data }) => {
      if (data) {
        data.forEach((s: { key: string; value: string }) => { settingsCache[s.key] = s.value; });
        setSettings({ ...settingsCache });
        loaded = true;
      }
    });
  }, []);

  return settings;
};

// Helper to get a single setting with fallback
export const getSetting = (settings: Record<string, string>, key: string, fallback: string): string => {
  return settings[key] || fallback;
};

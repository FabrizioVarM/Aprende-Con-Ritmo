
"use client"

import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  appLogoUrl: string;
  darkMode: boolean;
  whatsappNumber: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  appLogoUrl: 'https://picsum.photos/seed/ritmologo/200/200',
  darkMode: false,
  whatsappNumber: '51999999999'
};

export function useSettingsStore() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(() => {
    const saved = localStorage.getItem('ac_app_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Error loading app settings", e);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
    const handleSync = () => loadSettings();
    window.addEventListener('ac_sync_settings', handleSync);
    return () => window.removeEventListener('ac_sync_settings', handleSync);
  }, [loadSettings]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    localStorage.setItem('ac_app_settings', JSON.stringify(updated));
    setSettings(updated);
    window.dispatchEvent(new CustomEvent('ac_sync_settings'));
  }, [settings]);

  return { settings, updateSettings, loading };
}

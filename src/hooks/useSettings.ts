/**
 * Hook para acceder a la configuración de la aplicación
 */
import { useState, useEffect } from 'react';
import AsyncStorageService from '../services/AsyncStorageService';
import { AppSettings } from '../types';
import { DEFAULT_CURRENCY } from '../constants/currencies';

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>({
    language: 'es',
    notifications: true,
    reminderDays: 7,
    currency: DEFAULT_CURRENCY,
    distanceUnit: 'km',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorageService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await loadSettings();
  };

  return {
    settings,
    loading,
    refreshSettings,
  };
};


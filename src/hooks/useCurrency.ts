/**
 * Hook para formatear moneda usando la configuración de la app
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorageService from '../services/AsyncStorageService';
import { formatCurrency as formatCurrencyUtil } from '../utils/helpers';
import { DEFAULT_CURRENCY } from '../constants/currencies';

export const useCurrency = () => {
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);

  const loadCurrency = useCallback(async () => {
    try {
      const settings = await AsyncStorageService.getSettings();
      setCurrency(settings.currency);
    } catch (error) {
      console.error('Error loading currency:', error);
      setCurrency(DEFAULT_CURRENCY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrency();
  }, [loadCurrency]);

  const formatCurrency = useCallback((amount: number, customCurrency?: string): string => {
    return formatCurrencyUtil(amount, customCurrency || currency);
  }, [currency]);

  return {
    currency,
    formatCurrency,
    loading,
    refreshCurrency: loadCurrency,
  };
};


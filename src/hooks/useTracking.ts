/**
 * Hook de App Tracking Transparency (ATT) para iOS.
 */
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  getAdvertisingId,
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';

export const useTrackingTransparency = () => {
  const [status, setStatus] = useState<string>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);
  const [advertisingId, setAdvertisingId] = useState<string | null>(null);

  const readTrackingStatus = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setStatus('not-applicable');
      setIsLoading(false);
      return;
    }

    try {
      const result = await getTrackingPermissionsAsync();
      setStatus(result.status);
      const granted = result.status === 'granted';
      if (granted) {
        const adId = await getAdvertisingId();
        setAdvertisingId(adId || null);
      } else {
        setAdvertisingId(null);
      }
    } catch (error) {
      console.error('Error leyendo permiso ATT:', error);
      setStatus('unavailable');
      setAdvertisingId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'ios') return;

    try {
      setHasRequested(true);
      const result = await requestTrackingPermissionsAsync();
      setStatus(result.status);

      if (result.status === 'granted') {
        const adId = await getAdvertisingId();
        setAdvertisingId(adId || null);
      } else {
        setAdvertisingId(null);
      }
    } catch (error) {
      console.error('Error solicitando permiso ATT:', error);
      setStatus('unavailable');
      setAdvertisingId(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      await readTrackingStatus();
      if (!isMounted || Platform.OS !== 'ios') return;

      // Flujo solicitado: pedir permiso al abrir la app si aún no fue decidido.
      const current = await getTrackingPermissionsAsync();
      if (current.status === 'undetermined') {
        await requestPermission();
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [readTrackingStatus, requestPermission]);

  const canTrack = status === 'granted';

  return {
    status,
    isLoading,
    canTrack,
    hasRequested,
    advertisingId,
    requestPermission,
  };
};

/**
 * Hook de integración con TikTok Analytics
 * 
 * Re-exporta el hook de TikTok para facilitar su uso
 */
export { useTikTok } from '../contexts/TikTokContext';
export { TikTokEvent } from '../services/TikTokAnalyticsService';
export { TikTokAnalyticsService } from '../services/TikTokAnalyticsService';

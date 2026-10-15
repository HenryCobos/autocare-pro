/**
 * Hook de App Tracking Transparency (ATT) para iOS.
 * La solicitud del diálogo se hace desde AttTrackingGate (app activa + UI lista).
 */
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  getAdvertisingId,
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
} from 'expo-tracking-transparency';

export type TrackingPermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'unavailable'
  | 'not-applicable';

export const useTrackingTransparency = () => {
  const [status, setStatus] = useState<TrackingPermissionStatus>('undetermined');
  const [isLoading, setIsLoading] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);
  const [advertisingId, setAdvertisingId] = useState<string | null>(null);

  const applyPermissionResult = useCallback(async (permissionStatus: string) => {
    setStatus(permissionStatus as TrackingPermissionStatus);
    if (permissionStatus === 'granted') {
      const adId = await getAdvertisingId();
      setAdvertisingId(adId || null);
    } else {
      setAdvertisingId(null);
    }
  }, []);

  const refreshTrackingStatus = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setStatus('not-applicable');
      setIsLoading(false);
      return;
    }

    try {
      const result = await getTrackingPermissionsAsync();
      await applyPermissionResult(result.status);
    } catch (error) {
      console.error('Error leyendo permiso ATT:', error);
      setStatus('unavailable');
      setAdvertisingId(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyPermissionResult]);

  const requestPermission = useCallback(async () => {
    if (Platform.OS !== 'ios') return;

    setHasRequested(true);
    try {
      const result = await requestTrackingPermissionsAsync();
      await applyPermissionResult(result.status);
    } catch (error) {
      console.error('Error solicitando permiso ATT:', error);
      setStatus('unavailable');
      setAdvertisingId(null);
    }
  }, [applyPermissionResult]);

  useEffect(() => {
    refreshTrackingStatus();
  }, [refreshTrackingStatus]);

  const canTrack = status === 'granted';

  /** Listo para mostrar la app y para inicializar TikTok (ATT resuelto o no aplica). */
  const attFlowComplete =
    Platform.OS !== 'ios' ||
    status === 'not-applicable' ||
    status === 'unavailable' ||
    status === 'granted' ||
    status === 'denied' ||
    status === 'restricted' ||
    (hasRequested && status !== 'undetermined');

  return {
    status,
    isLoading,
    canTrack,
    hasRequested,
    attFlowComplete,
    advertisingId,
    requestPermission,
    refreshTrackingStatus,
  };
};

export { useTikTok } from '../contexts/TikTokContext';
export {
  TikTokEvent,
  TikTokCustomEvent,
  TikTokAnalyticsService,
} from '../services/TikTokAnalyticsService';

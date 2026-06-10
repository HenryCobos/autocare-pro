/**
 * Contexto de TikTok Analytics
 * Proporciona acceso al servicio de TikTok en toda la aplicación
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { TikTokAnalyticsService, TikTokEvent } from '../services/TikTokAnalyticsService';
import Constants from 'expo-constants';

interface TikTokContextData {
  isInitialized: boolean;
  trackEvent: (event: TikTokEvent | string, properties?: any) => Promise<void>;
  trackCustomEvent: (eventName: string, properties?: any) => Promise<void>;
  trackSubscription: (planType: 'monthly' | 'annual', value: number, currency?: string) => Promise<void>;
  trackPurchase: (value: number, currency?: string, properties?: any) => Promise<void>;
  trackStartTrial: (properties?: any) => Promise<void>;
  trackCompleteRegistration: (properties?: any) => Promise<void>;
  trackCompleteTutorial: (properties?: any) => Promise<void>;
  trackViewContent: (contentType: string, contentId: string, properties?: any) => Promise<void>;
}

const TikTokContext = createContext<TikTokContextData>({} as TikTokContextData);

interface TikTokProviderProps {
  children: ReactNode;
}

export const TikTokProvider: React.FC<TikTokProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeTikTok();
  }, []);

  const initializeTikTok = async () => {
    try {
      const appExtra = Constants.expoConfig?.extra as Record<string, any> | undefined;
      const TIKTOK_APP_ID =
        process.env.EXPO_PUBLIC_TIKTOK_APP_ID ||
        process.env.TIKTOK_APP_ID ||
        appExtra?.tiktokAppId ||
        '7594619183767879698';
      // Preferir extra (inyectado en build por app.config.js desde EAS Secret); fallback a env
      const TIKTOK_ACCESS_TOKEN =
        appExtra?.tiktokAccessToken ||
        process.env.TIKTOK_ACCESS_TOKEN ||
        '';
      // Log seguro en runtime: solo indicar si el token está presente (nunca el valor)
      const hasToken = !!TIKTOK_ACCESS_TOKEN;
      console.log(`[TikTok] Access token at runtime: ${hasToken ? 'present' : 'missing'}${hasToken ? ` (length ${TIKTOK_ACCESS_TOKEN.length})` : ''}`);
      const TIKTOK_APP_STORE_ID =
        process.env.EXPO_PUBLIC_TIKTOK_APP_STORE_ID ||
        appExtra?.tiktokAppStoreId ||
        '6749963091';
      
      // En desarrollo, usa testMode: true para ver los eventos en consola.
      // Además, si no hay token, forzamos testMode aunque el build sea de producción.
      const baseTestMode = __DEV__;
      const effectiveTestMode = baseTestMode || !hasToken;
      
      await TikTokAnalyticsService.initialize({
        appId: TIKTOK_APP_ID,
        appStoreId: TIKTOK_APP_STORE_ID,
        accessToken: TIKTOK_ACCESS_TOKEN,
        testMode: effectiveTestMode,
      });

      setIsInitialized(true);
      console.log('✅ TikTok Context inicializado');
    } catch (error) {
      console.error('❌ Error al inicializar TikTok Context:', error);
    }
  };

  const value: TikTokContextData = {
    isInitialized,
    trackEvent: TikTokAnalyticsService.trackEvent.bind(TikTokAnalyticsService),
    trackCustomEvent: TikTokAnalyticsService.trackCustomEvent.bind(TikTokAnalyticsService),
    trackSubscription: TikTokAnalyticsService.trackSubscription.bind(TikTokAnalyticsService),
    trackPurchase: TikTokAnalyticsService.trackPurchase.bind(TikTokAnalyticsService),
    trackStartTrial: TikTokAnalyticsService.trackStartTrial.bind(TikTokAnalyticsService),
    trackCompleteRegistration: TikTokAnalyticsService.trackCompleteRegistration.bind(TikTokAnalyticsService),
    trackCompleteTutorial: TikTokAnalyticsService.trackCompleteTutorial.bind(TikTokAnalyticsService),
    trackViewContent: TikTokAnalyticsService.trackViewContent.bind(TikTokAnalyticsService),
  };

  return (
    <TikTokContext.Provider value={value}>
      {children}
    </TikTokContext.Provider>
  );
};

/**
 * Hook para usar TikTok Analytics en cualquier componente
 * 
 * @example
 * ```tsx
 * const { trackEvent } = useTikTok();
 * 
 * // Rastrea un evento personalizado
 * trackEvent(TikTokEvent.VIEW_CONTENT, {
 *   content_type: 'vehicle',
 *   content_id: vehicleId,
 * });
 * ```
 */
export const useTikTok = () => {
  const context = useContext(TikTokContext);
  
  if (!context) {
    throw new Error('useTikTok debe ser usado dentro de TikTokProvider');
  }
  
  return context;
};

export default TikTokContext;


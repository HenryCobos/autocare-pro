/**
 * Contexto de TikTok Analytics
 * Proporciona acceso al servicio de TikTok en toda la aplicación
 */

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import {
  TikTokAnalyticsService,
  TikTokCustomEventName,
  TikTokEventProperties,
} from '../services/TikTokAnalyticsService';
import Constants from 'expo-constants';

const DEFAULT_TIKTOK_APP_ID = '7594619183767879698';
const DEFAULT_APP_STORE_ID = '6749963091';

interface TikTokContextData {
  isInitialized: boolean;
  trackCustomEvent: (eventName: TikTokCustomEventName, properties?: TikTokEventProperties) => Promise<void>;
  trackCompleteTutorial: (properties?: TikTokEventProperties) => Promise<void>;
  trackViewContent: (contentType: string, contentId: string, properties?: TikTokEventProperties) => Promise<void>;
  trackCheckout: (value: number, currency: string, contentId: string) => Promise<void>;
  trackSubscriptionStarted: (params: {
    isTrial: boolean;
    value: number;
    currency: string;
    contentId: string;
  }) => Promise<void>;
}

const TikTokContext = createContext<TikTokContextData>({} as TikTokContextData);

interface TikTokProviderProps {
  children: ReactNode;
  /** True once the ATT prompt has been answered (or is not applicable). */
  trackingResolved: boolean;
}

export const TikTokProvider: React.FC<TikTokProviderProps> = ({ children, trackingResolved }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const initStarted = useRef(false);

  useEffect(() => {
    if (!trackingResolved || initStarted.current) return;
    initStarted.current = true;
    initializeTikTok();
  }, [trackingResolved]);

  const initializeTikTok = async () => {
    const appExtra = Constants.expoConfig?.extra as Record<string, any> | undefined;

    await TikTokAnalyticsService.initialize({
      tiktokAppId: appExtra?.tiktokAppId || DEFAULT_TIKTOK_APP_ID,
      appStoreId: appExtra?.tiktokAppStoreId || DEFAULT_APP_STORE_ID,
      accessToken: appExtra?.tiktokAccessToken || '',
    });

    setIsInitialized(TikTokAnalyticsService.isReady());
  };

  const value: TikTokContextData = {
    isInitialized,
    trackCustomEvent: TikTokAnalyticsService.trackCustomEvent.bind(TikTokAnalyticsService),
    trackCompleteTutorial: TikTokAnalyticsService.trackCompleteTutorial.bind(TikTokAnalyticsService),
    trackViewContent: TikTokAnalyticsService.trackViewContent.bind(TikTokAnalyticsService),
    trackCheckout: TikTokAnalyticsService.trackCheckout.bind(TikTokAnalyticsService),
    trackSubscriptionStarted: TikTokAnalyticsService.trackSubscriptionStarted.bind(TikTokAnalyticsService),
  };

  return (
    <TikTokContext.Provider value={value}>
      {children}
    </TikTokContext.Provider>
  );
};

export const useTikTok = () => {
  const context = useContext(TikTokContext);

  if (!context) {
    throw new Error('useTikTok debe ser usado dentro de TikTokProvider');
  }

  return context;
};

export default TikTokContext;

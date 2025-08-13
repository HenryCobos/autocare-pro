/**
 * Servicio de anuncios compatible con Expo Go
 * - Si el módulo 'react-native-google-mobile-ads' NO está disponible (Expo Go), hace no-op seguro
 * - Si está disponible (dev build / producción), usa los IDs de prueba o provistos
 */

import Constants from 'expo-constants';
// Carga dinámica controlada para no romper Expo Go
const IS_EXPO_GO = Constants?.appOwnership === 'expo';
let RNMAds: any = null;
if (!IS_EXPO_GO) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    RNMAds = require('react-native-google-mobile-ads');
  } catch (e) {
    RNMAds = null;
  }
}

const IS_TEST_MODE = process.env.EXPO_PUBLIC_ADMOB_TEST_MODE === 'true' || __DEV__;

const TestIds = RNMAds?.TestIds || {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

const AD_UNIT_IDS = {
  BANNER: IS_TEST_MODE ? TestIds.BANNER : process.env.EXPO_PUBLIC_ADS_BANNER_ID || '',
  INTERSTITIAL: IS_TEST_MODE ? TestIds.INTERSTITIAL : process.env.EXPO_PUBLIC_ADS_INTERSTITIAL_ID || '',
  REWARDED: IS_TEST_MODE ? TestIds.REWARDED : process.env.EXPO_PUBLIC_ADS_REWARDED_ID || '',
};

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ACTION_COUNTER: '@ads_action_counter',
  LAST_AD_TIME: '@ads_last_interstitial_time',
};

const INTERSTITIAL_RULES = {
  ACTION_THRESHOLD: (process.env.EXPO_PUBLIC_ADMOB_TEST_MODE === 'true' || __DEV__) ? 1 : 3,
  MIN_MS_BETWEEN_ADS: (process.env.EXPO_PUBLIC_ADMOB_TEST_MODE === 'true' || __DEV__) ? 0 : 60_000,
};

class AdsService {
  private initialized = false;
  private interstitial: any = null;
  private interstitialLoaded = false;

  isAvailable(): boolean {
    return !IS_EXPO_GO && !!RNMAds;
  }

  async initialize(): Promise<boolean> {
    try {
      if (IS_EXPO_GO || !RNMAds) return true; // En Expo Go no hay módulo; no bloquear
      if (this.initialized) return true;
      await RNMAds.default().initialize();
      this.setupInterstitial();
      this.initialized = true;
      return true;
    } catch (e) {
      console.warn('Ads init skipped/failed:', e);
      return false;
    }
  }

  getBannerAdUnitId(): string {
    return AD_UNIT_IDS.BANNER;
  }

  get BannerAdSize() {
    return RNMAds?.BannerAdSize || { ADAPTIVE_BANNER: 'ADAPTIVE_BANNER' };
  }

  private setupInterstitial() {
    if (!RNMAds) return;
    try {
      const { InterstitialAd, AdEventType } = RNMAds;
      this.interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL);
      this.interstitialLoaded = false;
      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.interstitialLoaded = true;
      });
      this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.preloadInterstitial();
      });
      this.interstitial.addAdEventListener(AdEventType.ERROR, () => {
        this.interstitialLoaded = false;
      });
      this.preloadInterstitial();
    } catch (e) {
      // Ignorar en Expo Go
    }
  }

  private async preloadInterstitial() {
    try {
      if (this.interstitial) {
        this.interstitialLoaded = false;
        await this.interstitial.load();
      }
    } catch {}
  }

  isInterstitialReady(): boolean {
    return !!this.interstitial && this.interstitialLoaded;
  }

  private async canShowByPolicy(): Promise<boolean> {
    try {
      const last = await AsyncStorage.getItem(STORAGE_KEYS.LAST_AD_TIME);
      if (last) {
        const elapsed = Date.now() - parseInt(last);
        if (elapsed < INTERSTITIAL_RULES.MIN_MS_BETWEEN_ADS) return false;
      }
      const counterStr = await AsyncStorage.getItem(STORAGE_KEYS.ACTION_COUNTER);
      const counter = counterStr ? parseInt(counterStr) : 0;
      return counter >= INTERSTITIAL_RULES.ACTION_THRESHOLD;
    } catch {
      return true;
    }
  }

  async bumpActionCounter(): Promise<void> {
    try {
      const counterStr = await AsyncStorage.getItem(STORAGE_KEYS.ACTION_COUNTER);
      const counter = counterStr ? parseInt(counterStr) + 1 : 1;
      await AsyncStorage.setItem(STORAGE_KEYS.ACTION_COUNTER, String(counter));
    } catch {}
  }

  private async resetCounterAndTimestamp() {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTION_COUNTER, '0');
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_AD_TIME, String(Date.now()));
    } catch {}
  }

  async showInterstitial(): Promise<boolean> {
    if (!RNMAds || !this.interstitial || !this.interstitialLoaded) return false;
    try {
      await this.interstitial.show();
      await this.resetCounterAndTimestamp();
      return true;
    } catch {
      return false;
    }
  }

  async showInterstitialSmart(): Promise<boolean> {
    if (!this.initialized) await this.initialize();
    const ok = await this.canShowByPolicy();
    if (!ok) return false;
    return await this.showInterstitial();
  }
}

export default new AdsService();
export { TestIds };



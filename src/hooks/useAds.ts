import { useCallback, useEffect, useState } from 'react';
import AdsService from '../services/AdsService';

export const useAds = () => {
  const [initialized, setInitialized] = useState(false);
  const [interstitialReady, setInterstitialReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const ok = await AdsService.initialize();
      setInitialized(ok);
      setInterstitialReady(AdsService.isInterstitialReady());
    };
    init();
  }, []);

  const bumpAction = useCallback(async () => {
    await AdsService.bumpActionCounter();
    setInterstitialReady(AdsService.isInterstitialReady());
  }, []);

  const showInterstitialSmart = useCallback(async () => {
    return await AdsService.showInterstitialSmart();
  }, []);

  return {
    initialized,
    interstitialReady,
    bumpAction,
    showInterstitialSmart,
  };
};



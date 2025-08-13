import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ViewStyle, Text } from 'react-native';
import AdsService from '../../services/AdsService';

interface BannerAdProps {
  position?: 'top' | 'bottom' | 'inline';
  style?: ViewStyle;
}

const BannerAd: React.FC<BannerAdProps> = ({ position = 'inline', style }) => {
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const ok = await AdsService.initialize();
      setReady(ok);
    };
    init();
  }, []);

  // En Expo Go (sin módulo nativo) o no listo: no mostrar nada
  const isAvailable = AdsService.isAvailable();
  if (!isAvailable || !ready) {
    // Placeholder en desarrollo/testing para verificar ubicación
    return (
      <View style={[styles.container, positionStyles[position], style, styles.placeholder]}>
        <Text style={styles.placeholderText}>Ad placeholder</Text>
      </View>
    );
  }

  const unitId = AdsService.getBannerAdUnitId();
  const RNMAds = require('react-native-google-mobile-ads');
  const { BannerAd: RNBannerAd, BannerAdSize } = RNMAds;

  return (
    <View style={[styles.container, positionStyles[position], style]}>
      <RNBannerAd
        unitId={unitId}
        size={BannerAdSize.ADAPTIVE_BANNER}
        onAdLoaded={() => { setLoaded(true); setError(null); }}
        onAdFailedToLoad={(e: any) => { setError(String(e?.message || 'error')); setLoaded(false); }}
      />
      {!loaded && (
        <View style={[styles.placeholder, { position: 'absolute', left: 0, right: 0 }]}>
          <Text style={styles.placeholderText}>{error ? 'Ad error' : 'Loading ad...'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    height: 50,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
});

const positionStyles = StyleSheet.create({
  top: { marginBottom: 8 },
  bottom: { marginTop: 8 },
  inline: { marginVertical: 8 },
});

export default BannerAd;



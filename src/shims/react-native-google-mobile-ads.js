// Shim para Expo Go: provee API mínima para que el import no falle
module.exports = {
  default: () => ({ initialize: async () => ({}) }),
  TestIds: {
    BANNER: 'ca-app-pub-3940256099942544/6300978111',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  },
  BannerAd: () => null,
  BannerAdSize: { ADAPTIVE_BANNER: 'ADAPTIVE_BANNER' },
};



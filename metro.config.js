const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Mapear a un shim cuando el módulo de AdMob no esté instalado (Expo Go)
let shouldAliasAds = false;
try {
  require.resolve('react-native-google-mobile-ads');
  shouldAliasAds = false;
} catch (e) {
  shouldAliasAds = true;
}

if (shouldAliasAds) {
  config.resolver = config.resolver || {};
  config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}),
    'react-native-google-mobile-ads': path.resolve(__dirname, 'src/shims/react-native-google-mobile-ads.js'),
  };
}

module.exports = config;

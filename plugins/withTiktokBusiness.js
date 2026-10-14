/**
 * Local Expo config plugin for TikTok Business SDK native setup.
 * Mirrors @layers/expo-tiktok-business/build/plugin.js using CJS so Expo can load it reliably.
 */
const { withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const TIKTOK_SKADNETWORK_IDS = ['22mmun2rn5.skadnetwork'];

const withTiktokBusiness = (config, props = {}) => {
  const validatedProps = {
    ios: props?.ios ? { ...props.ios } : undefined,
    android: props?.android ? { ...props.android } : undefined,
  };

  config = withInfoPlist(config, (iosConfig) => {
    const { ios = {} } = validatedProps;

    if (ios.tiktokAppId) {
      iosConfig.modResults.TikTokAppID = ios.tiktokAppId;
    }

    const customIds = ios.skAdNetworkIds ?? [];
    const includeDefaults = ios.includeDefaultSKAdNetworkIds !== false;
    const allIds = [...new Set([...customIds, ...(includeDefaults ? TIKTOK_SKADNETWORK_IDS : [])])];

    if (allIds.length > 0) {
      const existing = iosConfig.modResults.SKAdNetworkItems ?? [];
      const existingIds = new Set(existing.map((item) => item.SKAdNetworkIdentifier));
      const newItems = allIds
        .filter((id) => !existingIds.has(id))
        .map((id) => ({ SKAdNetworkIdentifier: id }));
      iosConfig.modResults.SKAdNetworkItems = [...existing, ...newItems];
    }

    if (ios.urlSchemes && ios.urlSchemes.length > 0) {
      iosConfig.modResults.CFBundleURLTypes = iosConfig.modResults.CFBundleURLTypes ?? [];
      const existingEntry = iosConfig.modResults.CFBundleURLTypes.find(
        (entry) => entry.CFBundleURLName === 'TiktokBusiness'
      );

      if (existingEntry) {
        const existingSchemes = new Set(existingEntry.CFBundleURLSchemes ?? []);
        for (const scheme of ios.urlSchemes) {
          if (!existingSchemes.has(scheme)) {
            existingEntry.CFBundleURLSchemes = existingEntry.CFBundleURLSchemes ?? [];
            existingEntry.CFBundleURLSchemes.push(scheme);
          }
        }
      } else {
        iosConfig.modResults.CFBundleURLTypes.push({
          CFBundleURLName: 'TiktokBusiness',
          CFBundleURLSchemes: ios.urlSchemes,
        });
      }
    }

    iosConfig.modResults.LSApplicationQueriesSchemes =
      iosConfig.modResults.LSApplicationQueriesSchemes ?? [];
    for (const scheme of ['tiktok', 'snssdk1233', 'snssdk1180']) {
      if (!iosConfig.modResults.LSApplicationQueriesSchemes.includes(scheme)) {
        iosConfig.modResults.LSApplicationQueriesSchemes.push(scheme);
      }
    }

    return iosConfig;
  });

  config = withAndroidManifest(config, (androidConfig) => {
    const { android = {} } = validatedProps;

    if (android.tiktokAppId) {
      const application = androidConfig.modResults.manifest.application?.[0];
      if (application) {
        const metaData = application['meta-data'] ?? [];
        application['meta-data'] = metaData.filter(
          (meta) => meta.$?.['android:name'] !== 'com.tiktok.sdk.AppId'
        );
        application['meta-data'].push({
          $: {
            'android:name': 'com.tiktok.sdk.AppId',
            'android:value': android.tiktokAppId,
          },
        });
      }
    }

    return androidConfig;
  });

  return config;
};

module.exports = withTiktokBusiness;

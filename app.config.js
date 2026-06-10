/**
 * Configuración dinámica de Expo.
 * En EAS Build, TIKTOK_ACCESS_TOKEN (EAS Secret) se inyecta aquí y se pasa a extra
 * para que esté disponible en runtime vía Constants.expoConfig.extra.tiktokAccessToken.
 * Así el token llega al bundle sin depender de process.env en el cliente.
 */
const base = require('./app.json');

module.exports = () => ({
  ...base.expo,
  extra: {
    ...base.expo.extra,
    // EAS Secret TIKTOK_ACCESS_TOKEN (App Secret de TikTok) disponible en build time
    ...(process.env.TIKTOK_ACCESS_TOKEN
      ? { tiktokAccessToken: process.env.TIKTOK_ACCESS_TOKEN }
      : {}),
  },
});

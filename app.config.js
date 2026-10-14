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
    // TikTok App ID inyectado desde eas.json env (disponible en runtime via Constants.expoConfig.extra)
    ...(process.env.TIKTOK_APP_ID
      ? { tiktokAppId: process.env.TIKTOK_APP_ID }
      : {}),
    // EAS Secret TIKTOK_ACCESS_TOKEN inyectado en build time desde EAS Environment Variables
    ...(process.env.TIKTOK_ACCESS_TOKEN
      ? { tiktokAccessToken: process.env.TIKTOK_ACCESS_TOKEN }
      : {}),
    // Pantalla de diagnóstico TikTok solo en builds internos (perfil preview)
    enableDiagnostics: process.env.APP_VARIANT === 'internal',
  },
});

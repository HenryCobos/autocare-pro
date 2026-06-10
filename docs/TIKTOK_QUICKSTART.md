# 🚀 TikTok App Events SDK - Guía Rápida

## Configuración en 5 Minutos

Esta es una guía rápida para configurar TikTok App Events SDK. Para la guía completa, ver [TIKTOK_INTEGRATION.md](./TIKTOK_INTEGRATION.md).

---

## Paso 1: Obtener tu TikTok App ID (2 min)

1. Ve a https://ads.tiktok.com
2. Navega a **Assets** → **Events** → **App Events**
3. Haz clic en **"Add App"**
4. Selecciona tu plataforma (iOS/Android)
5. Ingresa tu Bundle ID: `com.autocare.pro`
6. **Copia el App ID** que aparece

---

## Paso 2: Configurar Variables de Entorno (1 min)

Edita `eas.json` y reemplaza `YOUR_TIKTOK_APP_ID_PROD` con tu App ID:

```json
{
  "build": {
    "production": {
      "env": {
        "TIKTOK_APP_ID": "123456789",  // ← TU APP ID AQUÍ
        "TIKTOK_ACCESS_TOKEN": ""
      }
    }
  }
}
```

---

## Paso 3: Build con EAS (2 min + tiempo de build)

```bash
# Build de producción
eas build --profile production --platform ios
```

---

## ✅ ¡Listo!

Ya está todo configurado. Los eventos se enviarán automáticamente:

| Evento | Cuándo |
|--------|--------|
| **InstallApp** | Primera vez que se abre la app |
| **LaunchApp** | Cada vez que se abre la app |
| **CompleteTutorial** | Al terminar el onboarding |
| **ViewContent** | Al ver el paywall |
| **Subscribe** | Al completar una suscripción |
| **Purchase** | Al completar una compra |

---

## 🔍 Verificar que Funciona

1. Construye y publica tu app con el App ID configurado
2. Ve a **TikTok Ads Manager** → **Assets** → **Events**
3. Selecciona tu app
4. Verás eventos en tiempo real

---

## 🎯 Usar en Campañas

1. Crea una campaña en **TikTok Ads Manager**
2. Selecciona **"App Promotion"** como objetivo
3. En **Optimization Event**, selecciona **"Subscribe"** o **"Purchase"**
4. TikTok optimizará para mostrar anuncios a usuarios que probablemente se suscriban

---

## 🆘 ¿Problemas?

Ver la [Guía Completa de Troubleshooting](./TIKTOK_INTEGRATION.md#troubleshooting)

O contacta a:
- **Email**: [tu-email@ejemplo.com]
- **TikTok Ads Support**: https://ads.tiktok.com/help/contact-us

---

## 📚 Documentación Completa

Para configuración avanzada, eventos personalizados, y más:
- [Guía Completa de Integración](./TIKTOK_INTEGRATION.md)


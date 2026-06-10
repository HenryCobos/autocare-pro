# 📱 TikTok App Events SDK - AutoCare Pro

## 🎯 Resumen de la Integración

AutoCare Pro tiene integrado el **TikTok App Events SDK** para rastrear conversiones de campañas de TikTok Ads y optimizar el rendimiento de tus anuncios.

---

## 📂 Archivos de la Integración

### Servicios
- **`src/services/TikTokAnalyticsService.ts`**: Servicio principal de TikTok Analytics
  - Maneja el envío de eventos a la API de TikTok
  - Gestiona la cola de eventos
  - Tracking de instalaciones y lanzamientos

### Contextos
- **`src/contexts/TikTokContext.tsx`**: Contexto de React para TikTok
  - Inicializa el servicio al arrancar la app
  - Provee hooks para usar en toda la app
  - Configuración de modo test/producción

### Hooks
- **`src/hooks/useTracking.ts`**: Hook principal de tracking
  - Re-exporta `useTikTok()` para fácil acceso
  - Re-exporta `TikTokEvent` enum

### Pantallas con Tracking
- **`src/screens/OnboardingScreen.tsx`**: 
  - `CompleteTutorial` - cuando completa el onboarding
  
- **`src/screens/PaywallScreen.tsx`**: 
  - `ViewContent` - cuando ve el paywall
  - `InitiateCheckout` - cuando inicia la compra
  - `Subscribe` - cuando completa la suscripción
  - `Purchase` - cuando completa el pago

### Configuración
- **`eas.json`**: Variables de entorno para EAS Build
- **`App.tsx`**: TikTokProvider wrapper

---

## 🚀 Inicio Rápido

### 1. Obtener App ID de TikTok

```bash
1. Ve a https://ads.tiktok.com
2. Assets → Events → App Events
3. Add App → Selecciona iOS/Android
4. Bundle ID: com.autocare.pro
5. Copia el App ID
```

### 2. Configurar en eas.json

```json
{
  "build": {
    "production": {
      "env": {
        "TIKTOK_APP_ID": "123456789"  // ← Tu App ID aquí
      }
    }
  }
}
```

### 3. Build y Deploy

```bash
eas build --profile production --platform ios
```

---

## 📊 Eventos Rastreados

| Evento | Descripción | Ubicación |
|--------|-------------|-----------|
| **InstallApp** | Primera instalación | Automático |
| **LaunchApp** | Cada apertura de la app | Automático |
| **CompleteTutorial** | Onboarding completado | OnboardingScreen |
| **ViewContent** | Vista del paywall | PaywallScreen |
| **InitiateCheckout** | Inicio de compra | PaywallScreen |
| **Subscribe** | Suscripción completada | PaywallScreen |
| **Purchase** | Compra completada | PaywallScreen |

---

## 💻 Uso en Código

### Ejemplo básico

```typescript
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

const MiComponente = () => {
  const { trackEvent, trackViewContent } = useTikTok();
  
  const handleAction = async () => {
    // Evento simple
    await trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'mi_evento',
      custom_property: 'valor',
    });
    
    // Evento de contenido
    await trackViewContent('tipo', 'id', {
      extra_data: 'valor',
    });
  };
  
  return <View>...</View>;
};
```

### Eventos disponibles

```typescript
import { useTikTok } from '../hooks/useTracking';

const { 
  trackEvent,              // Evento genérico
  trackSubscription,       // Suscripción con valor
  trackPurchase,           // Compra con valor
  trackStartTrial,         // Inicio de trial
  trackCompleteRegistration, // Registro completo
  trackCompleteTutorial,   // Tutorial completo
  trackViewContent,        // Vista de contenido
} = useTikTok();
```

---

## 🧪 Modo de Prueba

En desarrollo, los eventos se muestran en consola en lugar de enviarse:

```typescript
// En TikTokContext.tsx
const isTestMode = __DEV__;  // true en desarrollo
```

Output en consola:
```
🧪 [TikTok Test Mode] Evento: LaunchApp { ... }
✅ Evento de TikTok enviado: LaunchApp
```

---

## 🔍 Verificación

### En Desarrollo
1. Abre la app en modo desarrollo
2. Revisa la consola de Metro
3. Busca logs de `🧪 [TikTok Test Mode]`

### En Producción
1. Construye con EAS Build incluyendo el App ID
2. Publica en TestFlight o producción
3. Ve a TikTok Ads Manager → Assets → Events
4. Selecciona tu app
5. Verás eventos en tiempo real

---

## 📚 Documentación

- **[Guía Completa de Integración](./TIKTOK_INTEGRATION.md)** - Configuración paso a paso detallada
- **[Guía Rápida](./TIKTOK_QUICKSTART.md)** - Configuración en 5 minutos
- **[TikTok For Business Help](https://ads.tiktok.com/help/)** - Documentación oficial

---

## 🛠️ Arquitectura

```
App.tsx
  └─ TikTokProvider (inicializa el servicio)
      └─ SubscriptionProvider
          └─ Navegación
              └─ Pantallas (usan useTikTok())

TikTokAnalyticsService
  ├─ initialize() - Configuración inicial
  ├─ trackEvent() - Envío de eventos
  ├─ buildEventData() - Construcción de payload
  └─ sendEventToTikTok() - API call

useTikTok() Hook
  ├─ trackEvent()
  ├─ trackSubscription()
  ├─ trackPurchase()
  └─ ... más helpers
```

---

## ⚙️ Configuración Avanzada

### Diferentes App IDs por Entorno

```json
{
  "build": {
    "development": {
      "env": {
        "TIKTOK_APP_ID": "DEV_APP_ID"
      }
    },
    "production": {
      "env": {
        "TIKTOK_APP_ID": "PROD_APP_ID"
      }
    }
  }
}
```

### Access Token (Opcional)

Para funcionalidades avanzadas, puedes agregar un Access Token:

```json
{
  "build": {
    "production": {
      "env": {
        "TIKTOK_APP_ID": "123456789",
        "TIKTOK_ACCESS_TOKEN": "tu_access_token"
      }
    }
  }
}
```

---

## 🎯 Optimización de Campañas

### 1. Crear Campaña en TikTok Ads

```
1. Ve a TikTok Ads Manager
2. Crea nueva campaña
3. Objetivo: App Promotion
4. Optimization Event: Subscribe o Purchase
5. TikTok optimizará automáticamente
```

### 2. Eventos de Valor

Los eventos más importantes para optimización:

1. **Subscribe** (conversión principal)
   - Incluye valor monetario
   - Identifica el tipo de plan

2. **Purchase** (conversión de pago)
   - Valor total de la compra
   - Moneda correcta

3. **CompleteTutorial** (engagement)
   - Usuarios que completan onboarding
   - Señal de alta calidad

---

## 🆘 Soporte

### Problemas Comunes

#### Los eventos no aparecen en TikTok
- ✅ Verifica que el App ID sea correcto
- ✅ Asegúrate de estar en modo producción (no test)
- ✅ Espera 1-5 minutos para que aparezcan
- ✅ Revisa los logs de consola en busca de errores

#### Error 401: Unauthorized
- ✅ Regenera el Access Token
- ✅ Actualiza en eas.json
- ✅ Reconstruye la app

#### Valores incorrectos
- ✅ Verifica que RevenueCat devuelva los precios correctos
- ✅ Asegúrate de usar la moneda del producto

### Contacto

- **Documentación**: Ver archivos en `/docs`
- **TikTok Support**: https://ads.tiktok.com/help/contact-us
- **Email**: ads_support@tiktok.com

---

## 📊 Métricas y KPIs

### Métricas a Rastrear

En TikTok Ads Manager podrás ver:

1. **Instalaciones atribuidas**
   - Usuarios que instalaron desde TikTok
   
2. **Conversiones (Suscripciones)**
   - Usuarios que se suscribieron
   - Valor total de suscripciones
   
3. **Cost Per Install (CPI)**
   - Cuánto cuesta cada instalación
   
4. **Cost Per Subscription**
   - Cuánto cuesta cada suscripción
   
5. **ROI (Return on Investment)**
   - Ingresos vs gasto en ads

### Optimización

- **Prueba diferentes creativos** de video
- **Segmenta por edad y ubicación**
- **Optimiza para Subscribe, no solo Install**
- **Usa audiencias similares** de usuarios que se suscribieron
- **A/B test** de diferentes mensajes

---

## ✅ Checklist de Implementación

- [x] Servicio de TikTok Analytics creado
- [x] Contexto de TikTok configurado
- [x] Hook useTikTok disponible
- [x] Eventos automáticos implementados
- [x] Eventos de usuario implementados
- [x] Modo test en desarrollo
- [x] Variables de entorno en eas.json
- [x] Documentación completa creada
- [ ] App ID de TikTok obtenido (usuario)
- [ ] Variables configuradas en eas.json (usuario)
- [ ] App construida con EAS Build (usuario)
- [ ] Eventos verificados en TikTok (usuario)
- [ ] Campaña de TikTok Ads creada (usuario)

---

## 🎉 ¡Todo Listo!

La integración de TikTok está completa. Solo necesitas:

1. ✅ Obtener tu App ID de TikTok
2. ✅ Configurarlo en `eas.json`
3. ✅ Construir con `eas build`
4. ✅ Crear tu campaña en TikTok Ads

**¡Éxito con tus campañas!** 🚀

---

**Última actualización**: Noviembre 2025  
**Versión de la app**: 1.1.0  
**Estado**: ✅ Implementación completa


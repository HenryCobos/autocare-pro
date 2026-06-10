# 🏗️ Arquitectura de TikTok App Events SDK

## Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.tsx                                 │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              TikTokProvider                             │    │
│  │  • Inicializa TikTokAnalyticsService                   │    │
│  │  • Provee contexto a toda la app                       │    │
│  │  • Envía LaunchApp/InstallApp automáticamente          │    │
│  └─────────────────┬──────────────────────────────────────┘    │
│                    │                                             │
│  ┌─────────────────▼──────────────────────────────────────┐    │
│  │         SubscriptionProvider                            │    │
│  │  • Gestiona estado de suscripción                      │    │
│  └─────────────────┬──────────────────────────────────────┘    │
│                    │                                             │
│  ┌─────────────────▼──────────────────────────────────────┐    │
│  │              AppNavigator                               │    │
│  │                                                          │    │
│  │  ┌──────────────────────────────────────────────┐     │    │
│  │  │     Pantallas con Tracking                    │     │    │
│  │  │                                                │     │    │
│  │  │  • OnboardingScreen                           │     │    │
│  │  │    → trackCompleteTutorial()                  │     │    │
│  │  │                                                │     │    │
│  │  │  • PaywallScreen                              │     │    │
│  │  │    → trackViewContent()                       │     │    │
│  │  │    → trackSubscription()                      │     │    │
│  │  │    → trackEvent(InitiateCheckout)             │     │    │
│  │  │                                                │     │    │
│  │  │  • DashboardScreen                            │     │    │
│  │  │  • VehiclesScreen                             │     │    │
│  │  │  • ExpensesScreen                             │     │    │
│  │  │  • MaintenanceScreen                          │     │    │
│  │  │  • SettingsScreen                             │     │    │
│  │  └──────────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    Hook Layer (useTikTok)                        │
│                                                                   │
│  import { useTikTok } from '../hooks/useTracking'               │
│                                                                   │
│  const {                                                         │
│    trackEvent,              // Evento genérico                   │
│    trackSubscription,       // Suscripción con valor            │
│    trackPurchase,           // Compra                            │
│    trackViewContent,        // Vista de contenido                │
│    trackCompleteTutorial,   // Tutorial completo                │
│  } = useTikTok();                                               │
│                                                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│              TikTokAnalyticsService                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Responsabilidades:                                 │         │
│  │                                                      │         │
│  │  • Gestionar cola de eventos                        │         │
│  │  • Construir payload de eventos                     │         │
│  │  • Agregar información del dispositivo              │         │
│  │  • Enviar a la API de TikTok                        │         │
│  │  • Manejar errores y reintentos                     │         │
│  │  • Modo test vs producción                          │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                   │
│  Métodos Principales:                                            │
│  • initialize(config)                                            │
│  • trackEvent(event, properties)                                 │
│  • trackSubscription(type, value, currency)                      │
│  • buildEventData(event, properties)                             │
│  • sendEventToTikTok(eventData)                                  │
│                                                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ HTTP POST
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│              TikTok Business API                                 │
│                                                                   │
│  URL: https://business-api.tiktok.com/open_api/v1.3/app/batch/ │
│                                                                   │
│  Headers:                                                        │
│  • Content-Type: application/json                               │
│  • Access-Token: [tu_token]                                     │
│                                                                   │
│  Body:                                                           │
│  {                                                               │
│    "app_id": "123456789",                                       │
│    "batch": [                                                    │
│      {                                                           │
│        "event": "Subscribe",                                     │
│        "timestamp": 1699999999,                                  │
│        "context": {                                              │
│          "app": { ... },                                         │
│          "device": { ... },                                      │
│          "os": { ... }                                           │
│        },                                                        │
│        "properties": {                                           │
│          "value": 99.99,                                         │
│          "currency": "USD",                                      │
│          ...                                                     │
│        }                                                         │
│      }                                                           │
│    ]                                                             │
│  }                                                               │
│                                                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          │ Response
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                  TikTok Ads Manager                              │
│                                                                   │
│  • Assets → Events → App Events                                 │
│  • Real-time event monitoring                                   │
│  • Event statistics and analytics                               │
│  • Campaign optimization based on events                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Eventos

### 1. Instalación y Primer Lanzamiento

```
Usuario instala app
       ↓
App.tsx se monta
       ↓
TikTokProvider inicializa
       ↓
TikTokAnalyticsService.initialize()
       ↓
Verifica si es primera vez
       ↓
Sí: Envía InstallApp
       ↓
Envía LaunchApp
       ↓
Eventos llegan a TikTok
```

### 2. Onboarding

```
Usuario completa onboarding
       ↓
OnboardingScreen.completeOnboarding()
       ↓
useTikTok().trackCompleteTutorial()
       ↓
TikTokAnalyticsService.trackEvent()
       ↓
buildEventData() agrega contexto
       ↓
sendEventToTikTok() envía a API
       ↓
TikTok registra CompleteTutorial
```

### 3. Suscripción

```
Usuario ve paywall
       ↓
PaywallScreen monta
       ↓
trackViewContent('paywall', ...)
       ↓
TikTok registra ViewContent
       ↓
Usuario inicia compra
       ↓
trackEvent(InitiateCheckout)
       ↓
TikTok registra InitiateCheckout
       ↓
Compra se completa exitosamente
       ↓
trackSubscription(type, price, currency)
       ↓
TikTok registra Subscribe + Purchase
       ↓
Campaña de TikTok optimiza para más suscripciones
```

---

## Estructura de Datos

### Evento Base

```typescript
{
  event: string,              // Ej: "Subscribe", "LaunchApp"
  timestamp: number,          // Unix timestamp en segundos
  context: {
    app: {
      name: string,           // "AutoCare Pro"
      namespace: string,      // "com.autocare.pro"
      version: string,        // "1.1.0"
      build: string           // "1.1.0"
    },
    device: {
      id: string,            // Anonymous ID
      manufacturer: string,   // "Apple"
      model: string,         // "iPhone 14 Pro"
      platform: string,      // "ios"
      platform_version: string // "17.0"
    },
    ip: string,              // Capturado por TikTok
    locale: string,          // "es"
    os: {
      name: string,          // "ios"
      version: string        // "17.0"
    }
  },
  properties: {
    // Propiedades específicas del evento
    _app_id: string,         // Tu TikTok App ID
    ...customProperties
  }
}
```

### Ejemplo: Evento Subscribe

```json
{
  "event": "Subscribe",
  "timestamp": 1699999999,
  "context": {
    "app": {
      "name": "AutoCare Pro",
      "namespace": "com.autocare.pro",
      "version": "1.1.0"
    },
    "device": {
      "id": "anon_1699999999_abc123",
      "manufacturer": "Apple",
      "model": "iPhone 14 Pro",
      "platform": "ios",
      "platform_version": "17.0"
    },
    "locale": "es",
    "os": {
      "name": "ios",
      "version": "17.0"
    }
  },
  "properties": {
    "_app_id": "123456789",
    "content_type": "subscription",
    "content_name": "Plan Anual",
    "content_id": "annual",
    "value": 99.99,
    "currency": "USD",
    "description": "Suscripción anual a AutoCare Pro"
  }
}
```

---

## Estados de la Integración

### Modo Test (Desarrollo)

```typescript
const isTestMode = __DEV__;  // true
```

**Comportamiento:**
- ✅ Eventos se loguean en consola
- ❌ NO se envían a TikTok
- 🧪 Útil para debugging
- 📝 Formato: `🧪 [TikTok Test Mode] Evento: ...`

### Modo Producción

```typescript
const isTestMode = __DEV__;  // false
```

**Comportamiento:**
- ❌ NO se loguea en consola (seguridad)
- ✅ Eventos se envían a TikTok
- 📊 Aparecen en TikTok Events Manager
- 🎯 Utilizados para optimización de campañas

---

## Gestión de Estado

### Cola de Eventos

```typescript
class TikTokAnalyticsService {
  private eventQueue: Array<{
    event: string;
    properties: any;
    timestamp: number;
  }> = [];
  
  // Si el servicio no está inicializado,
  // los eventos se guardan en cola
  async trackEvent(event, properties) {
    if (!this.isInitialized) {
      this.eventQueue.push({ event, properties, timestamp: Date.now() });
      return;
    }
    
    // Enviar evento normalmente
    await this.sendEventToTikTok(...);
  }
  
  // Cuando se inicializa, procesa la cola
  async initialize(config) {
    this.isInitialized = true;
    await this.flushEventQueue();
  }
}
```

### ID Anónimo

```typescript
// Se genera una vez y se guarda en AsyncStorage
private async initializeAnonymousId() {
  let storedId = await AsyncStorage.getItem(ANONYMOUS_ID_KEY);
  
  if (!storedId) {
    storedId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(ANONYMOUS_ID_KEY, storedId);
  }
  
  this.anonymousId = storedId;
}
```

---

## Optimización y Performance

### 1. Envío Asíncrono

```typescript
// Los eventos NO bloquean la UI
await trackEvent(TikTokEvent.SUBSCRIBE, { ... });
// El usuario puede continuar usando la app inmediatamente
```

### 2. Cola de Eventos

```typescript
// Si la app aún no está lista, los eventos se guardan
trackEvent(TikTokEvent.CUSTOM, { ... });  // ← Se guarda en cola
// ...
// Cuando se inicializa, se envían todos
initialize(config);  // ← Procesa cola automáticamente
```

### 3. Manejo de Errores

```typescript
try {
  await this.sendEventToTikTok(eventData);
} catch (error) {
  console.error('❌ Error al enviar evento:', error);
  // El error no rompe la app
  // El usuario puede continuar normalmente
}
```

---

## Seguridad y Privacidad

### ✅ Datos que SÍ se envían

- Eventos de comportamiento (anónimos)
- Valores de compra (sin info de pago)
- Información del dispositivo (modelo, OS)
- ID anónimo generado localmente

### ❌ Datos que NO se envían

- Nombres, emails, teléfonos
- Información de pago o tarjetas
- IDFA/GAID (sin permiso de tracking)
- Datos personales identificables (PII)

### Cumplimiento

```typescript
// Respeta la configuración de tracking del usuario
const canTrack = useTrackingTransparency();

// En este caso, usamos tracking NO personalizado
// que no requiere permiso ATT de iOS
```

---

## Extensibilidad

### Agregar Nuevos Eventos

```typescript
// 1. Importar el hook
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

// 2. Usar en tu componente
const MiComponente = () => {
  const { trackEvent } = useTikTok();
  
  const handleAction = async () => {
    // 3. Trackear evento
    await trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'mi_nuevo_evento',
      custom_property: 'valor',
    });
  };
  
  return <View>...</View>;
};
```

### Crear Helper Methods

```typescript
// En TikTokAnalyticsService.ts
async trackFeatureUsage(featureName: string, properties: any = {}) {
  await this.trackEvent(TikTokEvent.CUSTOM, {
    event_name: 'feature_used',
    feature_name: featureName,
    ...properties,
  });
}

// Uso:
TikTokAnalyticsService.trackFeatureUsage('export_pdf', {
  format: 'pdf',
  pages: 5,
});
```

---

## Testing

### Unit Tests (Ejemplo)

```typescript
import { TikTokAnalyticsService } from './TikTokAnalyticsService';

describe('TikTokAnalyticsService', () => {
  it('should initialize correctly', async () => {
    await TikTokAnalyticsService.initialize({
      appId: 'test_app_id',
      testMode: true,
    });
    
    expect(TikTokAnalyticsService.isReady()).toBe(true);
  });
  
  it('should queue events before initialization', async () => {
    // Reset service
    const service = new TikTokAnalyticsService();
    
    // Track before init
    await service.trackEvent('TestEvent', {});
    
    // Event should be in queue
    expect(service.eventQueue.length).toBe(1);
  });
});
```

### Integration Tests

```typescript
// En un test de integración
it('should send Subscribe event when user subscribes', async () => {
  // Mock de la API de TikTok
  const mockFetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ code: 0 }),
  });
  global.fetch = mockFetch;
  
  // Simular suscripción
  await handlePurchase();
  
  // Verificar que se llamó fetch con los datos correctos
  expect(mockFetch).toHaveBeenCalledWith(
    expect.stringContaining('business-api.tiktok.com'),
    expect.objectContaining({
      method: 'POST',
      body: expect.stringContaining('Subscribe'),
    })
  );
});
```

---

## Monitoreo en Producción

### Logs Importantes

```typescript
// En producción, solo se loguean eventos importantes
console.log('✅ TikTok Analytics inicializado correctamente');
console.log('✅ Evento de TikTok enviado:', eventName);
console.error('❌ Error al enviar evento a TikTok:', error);
```

### Debugging Avanzado

Para debugging en producción (temporal):

```typescript
// En TikTokAnalyticsService.ts
private async sendEventToTikTok(eventData: any): Promise<void> {
  // Activar temporalmente para debugging
  if (__DEV__ || DEBUG_TIKTOK) {
    console.log('📤 TikTok Event:', JSON.stringify(eventData, null, 2));
  }
  
  const response = await fetch(this.API_BASE_URL, { ... });
  
  if (__DEV__ || DEBUG_TIKTOK) {
    const result = await response.json();
    console.log('📥 TikTok Response:', JSON.stringify(result, null, 2));
  }
}
```

---

## Actualizaciones Futuras

### Posibles Mejoras

1. **Retry Logic**: Reintentar eventos fallidos
2. **Batch Events**: Enviar múltiples eventos en un solo request
3. **Offline Queue**: Guardar eventos cuando no hay internet
4. **Event Validation**: Validar estructura antes de enviar
5. **Analytics Dashboard**: Panel interno de métricas
6. **A/B Testing Integration**: Trackear variantes de tests

---

## Referencias

- [TikTok Business API Docs](https://business-api.tiktok.com/portal/docs)
- [App Events SDK Guide](https://ads.tiktok.com/help/article/app-events-sdk)
- [Best Practices](https://ads.tiktok.com/help/article/app-install-campaigns)

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0  
**Autor**: Henry Cobos


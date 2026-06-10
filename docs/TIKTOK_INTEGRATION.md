# 🎯 Integración de TikTok App Events SDK

## Guía Completa de Configuración

Esta guía te ayudará a configurar el TikTok App Events SDK en tu aplicación AutoCare Pro para poder rastrear conversiones y optimizar tus campañas de TikTok Ads.

---

## 📋 Tabla de Contenidos

1. [¿Qué es TikTok App Events SDK?](#qué-es-tiktok-app-events-sdk)
2. [Requisitos Previos](#requisitos-previos)
3. [Paso 1: Configurar TikTok For Business](#paso-1-configurar-tiktok-for-business)
4. [Paso 2: Obtener el TikTok App ID](#paso-2-obtener-el-tiktok-app-id)
5. [Paso 3: Configurar Variables de Entorno](#paso-3-configurar-variables-de-entorno)
6. [Paso 4: Verificar la Integración](#paso-4-verificar-la-integración)
7. [Eventos Implementados](#eventos-implementados)
8. [Mejores Prácticas](#mejores-prácticas)
9. [Troubleshooting](#troubleshooting)

---

## ¿Qué es TikTok App Events SDK?

El TikTok App Events SDK es una herramienta de medición que te permite:

- 📊 **Rastrear conversiones** de tus campañas de TikTok Ads
- 🎯 **Optimizar campañas** basándote en eventos de usuario
- 💰 **Medir ROI** de tus inversiones publicitarias
- 📈 **Crear audiencias personalizadas** para remarketing
- 🔍 **Analizar el comportamiento** de usuarios que vienen de TikTok

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Una cuenta de **TikTok For Business** (https://ads.tiktok.com)
- ✅ Tu aplicación publicada en **App Store** y/o **Google Play**
- ✅ Acceso a **TikTok Ads Manager**
- ✅ Los identificadores de tu app:
  - **iOS**: Bundle Identifier (com.autocare.pro)
  - **Android**: Package Name (com.autocare.pro)

---

## Paso 1: Configurar TikTok For Business

### 1.1. Crear Cuenta de TikTok For Business

1. Ve a https://ads.tiktok.com
2. Haz clic en **"Create an Ad"** o **"Sign Up"**
3. Completa el registro con:
   - Información de tu negocio
   - Método de pago
   - Verificación de identidad

### 1.2. Crear Pixel de TikTok

1. En **TikTok Ads Manager**, ve a **Assets** → **Events**
2. Haz clic en **"Manage"** → **"Web Events"**
3. Crea un nuevo **TikTok Pixel**
4. Dale un nombre descriptivo (ej: "AutoCare Pro Pixel")
5. Guarda el **Pixel ID** (lo necesitarás después)

---

## Paso 2: Obtener el TikTok App ID

### 2.1. Configurar App Events en TikTok

1. En **TikTok Ads Manager**, ve a **Assets** → **Events**
2. Haz clic en **"App Events"** o **"Mobile App Events"**
3. Haz clic en **"Create"** o **"Add App"**

### 2.2. Agregar tu Aplicación

**Para iOS:**
1. Selecciona **iOS** como plataforma
2. Ingresa tu **Bundle Identifier**: `com.autocare.pro`
3. Busca tu app en el App Store
4. Selecciona tu aplicación
5. Haz clic en **"Confirm"**

**Para Android:**
1. Selecciona **Android** como plataforma
2. Ingresa tu **Package Name**: `com.autocare.pro`
3. Busca tu app en Google Play
4. Selecciona tu aplicación
5. Haz clic en **"Confirm"**

### 2.3. Obtener el App ID

1. Una vez agregada tu app, verás un **App ID** único
2. **COPIA este App ID** - es el valor más importante para la integración
3. Formato típico: `123456789` (número de 9-10 dígitos)

### 2.4. Obtener Access Token (Opcional pero Recomendado)

1. En la misma pantalla, busca **"Access Token"** o **"API Token"**
2. Haz clic en **"Generate Token"** o **"Create Token"**
3. Copia el token generado
4. **IMPORTANTE**: Guarda este token en un lugar seguro, no se mostrará de nuevo

---

## Paso 3: Configurar Variables de Entorno

### 3.1. Actualizar eas.json

El archivo `eas.json` ya está configurado con las variables necesarias. Solo debes reemplazar los valores:

```json
{
  "build": {
    "production": {
      "env": {
        "TIKTOK_APP_ID": "TU_TIKTOK_APP_ID_AQUI",
        "TIKTOK_ACCESS_TOKEN": "TU_ACCESS_TOKEN_AQUI"
      }
    }
  }
}
```

**Reemplaza:**
- `TU_TIKTOK_APP_ID_AQUI` → El App ID que copiaste en el Paso 2.3
- `TU_ACCESS_TOKEN_AQUI` → El Access Token del Paso 2.4 (opcional)

### 3.2. Variables por Entorno

Puedes usar diferentes App IDs para cada entorno:

```json
{
  "build": {
    "development": {
      "env": {
        "TIKTOK_APP_ID": "123456789",  // App ID de desarrollo/testing
        "TIKTOK_ACCESS_TOKEN": ""
      }
    },
    "production": {
      "env": {
        "TIKTOK_APP_ID": "987654321",  // App ID de producción
        "TIKTOK_ACCESS_TOKEN": "your_production_token"
      }
    }
  }
}
```

### 3.3. Actualizar TikTokContext.tsx

El archivo `src/contexts/TikTokContext.tsx` ya está configurado para usar estas variables. Verifica que las líneas sean:

```typescript
const TIKTOK_APP_ID = process.env.TIKTOK_APP_ID || 'YOUR_TIKTOK_APP_ID';
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || '';
```

### 3.4. Construir con EAS

Para que las variables se incluyan en tu build:

```bash
# Build de desarrollo con variables
eas build --profile development --platform ios

# Build de producción con variables
eas build --profile production --platform ios
```

---

## Paso 4: Verificar la Integración

### 4.1. Modo de Prueba (Test Mode)

La app está configurada en **modo de prueba** por defecto durante el desarrollo:

```typescript
// En TikTokContext.tsx
const isTestMode = __DEV__;  // true en desarrollo, false en producción
```

En modo de prueba, los eventos se muestran en la consola en lugar de enviarse a TikTok:

```
🧪 [TikTok Test Mode] Evento: LaunchApp { ... }
✅ Evento de TikTok enviado: LaunchApp
```

### 4.2. Verificar en TikTok Events Manager

Una vez en producción:

1. Ve a **TikTok Ads Manager** → **Assets** → **Events**
2. Selecciona tu app
3. Ve a la pestaña **"Events"** o **"Real-time Events"**
4. Deberías ver eventos llegando en tiempo real

### 4.3. Eventos a Verificar

Prueba estos flujos para verificar que los eventos se envían:

| Acción | Evento Esperado | Dónde Verificar |
|--------|----------------|-----------------|
| Abrir la app | `LaunchApp` | TikTok Events Manager |
| Primera instalación | `InstallApp` | TikTok Events Manager |
| Completar onboarding | `CompleteTutorial` | TikTok Events Manager |
| Ver paywall | `ViewContent` | TikTok Events Manager |
| Suscribirse | `Subscribe` + `Purchase` | TikTok Events Manager + Conversiones |

### 4.4. Usar el TikTok Pixel Helper (Web)

Si también tienes una landing page:

1. Instala la extensión **TikTok Pixel Helper** para Chrome
2. Ve a tu landing page
3. Verifica que el pixel se active correctamente

---

## Eventos Implementados

### Eventos Automáticos

Estos eventos se envían automáticamente:

#### 1. **LaunchApp**
- **Cuándo**: Cada vez que el usuario abre la app
- **Propiedades**: 
  - `content_type: 'app_launch'`
- **Ubicación**: `TikTokAnalyticsService.initialize()`

#### 2. **InstallApp**
- **Cuándo**: Primera vez que el usuario abre la app
- **Propiedades**: 
  - `content_type: 'app_install'`
- **Ubicación**: `TikTokAnalyticsService.initialize()`

### Eventos de Usuario

#### 3. **CompleteTutorial**
- **Cuándo**: Usuario completa el onboarding
- **Propiedades**: 
  - `selected_plan`: 'free' | 'pro' | 'premium'
  - `vehicle_count`: número de vehículos seleccionados
- **Ubicación**: `OnboardingScreen.tsx`

#### 4. **ViewContent**
- **Cuándo**: Usuario ve el paywall
- **Propiedades**: 
  - `content_type: 'paywall'`
  - `content_id: 'subscription_plans'`
  - `source`: de dónde viene el usuario
  - `limit_type`: qué límite alcanzó (si aplica)
- **Ubicación**: `PaywallScreen.tsx`

#### 5. **Subscribe**
- **Cuándo**: Usuario completa una suscripción
- **Propiedades**: 
  - `content_type: 'subscription'`
  - `content_name`: 'Plan Mensual' o 'Plan Anual'
  - `content_id`: 'monthly' | 'annual'
  - `value`: precio de la suscripción
  - `currency`: moneda (USD, MXN, etc.)
- **Ubicación**: `PaywallScreen.tsx`

#### 6. **InitiateCheckout**
- **Cuándo**: Usuario inicia el proceso de compra
- **Propiedades**: 
  - `content_type: 'subscription'`
  - `content_name`: identificador del plan
  - `value`: precio
  - `currency`: moneda
- **Ubicación**: `PaywallScreen.tsx`

#### 7. **Purchase**
- **Cuándo**: Se completa una compra (automático con Subscribe)
- **Propiedades**: 
  - `value`: valor de la compra
  - `currency`: moneda
- **Ubicación**: `TikTokAnalyticsService.trackSubscription()`

### Eventos Personalizados Disponibles

Puedes agregar más eventos usando el hook `useTikTok`:

```typescript
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

const { trackEvent } = useTikTok();

// Ejemplo: Trackear cuando un usuario agrega un vehículo
trackEvent(TikTokEvent.CUSTOM, {
  event_name: 'add_vehicle',
  vehicle_type: 'car',
  vehicle_brand: 'Toyota',
});
```

---

## Mejores Prácticas

### 🎯 Optimización de Campañas

1. **Eventos de Conversión Principales**:
   - `Subscribe` (conversión más valiosa)
   - `Purchase` (valor monetario)
   - `CompleteTutorial` (engagement)

2. **Configurar Objetivos en TikTok**:
   - Ve a tu campaña en TikTok Ads Manager
   - Selecciona **"App Event Optimization"**
   - Elige `Subscribe` como evento de conversión
   - TikTok optimizará automáticamente para mostrar anuncios a usuarios que probablemente se suscriban

### 📊 Seguimiento de Valor

Siempre incluye el valor monetario en eventos de compra:

```typescript
trackSubscription(
  'annual',  // tipo de plan
  99.99,     // precio
  'USD'      // moneda
);
```

Esto permite a TikTok:
- Calcular el ROI de tus campañas
- Optimizar para maximizar ingresos
- Crear audiencias similares de alto valor

### 🔒 Privacidad y Cumplimiento

1. **No envíes datos personales identificables (PII)**:
   - ❌ No: emails, teléfonos, nombres
   - ✅ Sí: eventos anónimos, valores agregados

2. **Respeta las preferencias del usuario**:
   - El código ya está configurado para respetar la configuración de tracking
   - No se envía IDFA/GAID sin permiso del usuario

3. **Cumple con regulaciones**:
   - GDPR (Europa)
   - CCPA (California)
   - Otras leyes locales de privacidad

### ⚡ Rendimiento

1. **Los eventos se envían de forma asíncrona**: No bloquean la UI
2. **Cola de eventos**: Si la app no está inicializada, los eventos se guardan en cola
3. **Modo test en desarrollo**: Evita contaminar datos de producción

---

## Troubleshooting

### ❌ Los eventos no aparecen en TikTok

**Problema**: Envías eventos pero no aparecen en TikTok Events Manager

**Soluciones**:

1. **Verifica el App ID**:
   ```typescript
   // En TikTokContext.tsx, temporalmente logea el App ID
   console.log('TikTok App ID:', TIKTOK_APP_ID);
   ```
   - Asegúrate de que coincida con el de TikTok Ads Manager

2. **Verifica que no estés en Test Mode**:
   ```typescript
   const isTestMode = __DEV__;  // false en producción
   ```

3. **Espera unos minutos**: Los eventos pueden tardar 1-5 minutos en aparecer

4. **Revisa la consola**: Busca errores en los logs:
   ```
   ❌ Error al enviar evento a TikTok: ...
   ```

### ❌ Error: "TikTok API error: 401"

**Problema**: El Access Token es inválido

**Soluciones**:

1. Regenera el Access Token en TikTok Ads Manager
2. Actualiza la variable en `eas.json`
3. Reconstruye la app con `eas build`

### ❌ Error: "Network request failed"

**Problema**: La app no puede conectarse a la API de TikTok

**Soluciones**:

1. Verifica la conexión a internet
2. Verifica que no haya firewalls bloqueando la conexión
3. Asegúrate de que la URL de la API sea correcta

### ❌ Los valores de conversión son incorrectos

**Problema**: Los precios o monedas no coinciden

**Soluciones**:

1. Verifica que estés usando la moneda correcta del producto:
   ```typescript
   const price = packageToPurchase.product.price;
   const currency = packageToPurchase.product.currencyCode;
   ```

2. Asegúrate de que RevenueCat esté devolviendo los precios correctos

### 🔍 Debugging Avanzado

Activa logs detallados temporalmente:

```typescript
// En TikTokAnalyticsService.ts
private async sendEventToTikTok(eventData: any): Promise<void> {
  console.log('📤 Enviando a TikTok:', JSON.stringify(eventData, null, 2));
  
  const response = await fetch(this.API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': this.config.accessToken || '',
    },
    body: JSON.stringify({
      app_id: this.config.appId,
      batch: [eventData],
    }),
  });

  const result = await response.json();
  console.log('📥 Respuesta de TikTok:', JSON.stringify(result, null, 2));
}
```

---

## 🎓 Recursos Adicionales

### Documentación Oficial

- [TikTok For Business Help Center](https://ads.tiktok.com/help/)
- [TikTok App Events SDK Documentation](https://ads.tiktok.com/help/article/app-events-sdk)
- [TikTok API Reference](https://business-api.tiktok.com/portal/docs)

### Tutoriales

- [How to Set Up TikTok Ads for App Install Campaigns](https://ads.tiktok.com/help/article/app-install-campaigns)
- [Understanding App Events](https://ads.tiktok.com/help/article/understanding-app-events)

### Soporte

- **TikTok Ads Support**: https://ads.tiktok.com/help/contact-us
- **Email**: ads_support@tiktok.com

---

## 📝 Checklist de Implementación

Usa esta checklist para asegurarte de que todo está configurado:

- [ ] Cuenta de TikTok For Business creada
- [ ] Pixel de TikTok configurado
- [ ] App agregada en TikTok Events Manager
- [ ] App ID copiado y guardado
- [ ] Access Token generado (opcional)
- [ ] Variables de entorno configuradas en `eas.json`
- [ ] App construida con EAS Build
- [ ] App publicada en App Store / Google Play
- [ ] Eventos de prueba enviados
- [ ] Eventos visibles en TikTok Events Manager
- [ ] Campaña de TikTok Ads creada
- [ ] Evento de conversión configurado en la campaña
- [ ] ROI siendo rastreado

---

## 🎉 ¡Felicidades!

Has completado la integración de TikTok App Events SDK. Ahora puedes:

1. ✅ Crear campañas optimizadas en TikTok Ads
2. ✅ Rastrear conversiones y suscripciones
3. ✅ Medir el ROI de tus anuncios
4. ✅ Crear audiencias personalizadas
5. ✅ Escalar tus campañas con datos reales

---

## 📧 Soporte

Si tienes dudas o necesitas ayuda adicional:

- **Desarrollador**: Henry Cobos
- **Email**: [tu-email@ejemplo.com]
- **Documentación del Proyecto**: Ver otros archivos en `/docs`

---

**Última actualización**: Noviembre 2025
**Versión de la app**: 1.1.0
**Versión del SDK**: Custom Implementation

---

## Ejemplo de Código: Agregar un Evento Personalizado

Si quieres agregar más eventos de TikTok en otras pantallas:

```typescript
// 1. Importar el hook
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

// 2. Usar el hook en tu componente
const MiComponente = () => {
  const { trackEvent, trackViewContent } = useTikTok();
  
  // 3. Trackear eventos
  const handleAction = async () => {
    // Evento personalizado
    await trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'custom_action',
      custom_property: 'valor',
    });
    
    // O usar un método helper
    await trackViewContent('screen_name', 'content_id', {
      additional_info: 'valor',
    });
  };
  
  return (
    // Tu UI aquí
  );
};
```

### Eventos Disponibles

```typescript
enum TikTokEvent {
  LAUNCH_APP = 'LaunchApp',
  INSTALL_APP = 'InstallApp',
  COMPLETE_REGISTRATION = 'CompleteRegistration',
  COMPLETE_TUTORIAL = 'CompleteTutorial',
  VIEW_CONTENT = 'ViewContent',
  SEARCH = 'Search',
  START_TRIAL = 'StartTrial',
  SUBSCRIBE = 'Subscribe',
  ADD_TO_CART = 'AddToCart',
  INITIATE_CHECKOUT = 'InitiateCheckout',
  PURCHASE = 'Purchase',
  CUSTOM = 'Custom',
}
```

---

¡Éxito con tus campañas de TikTok Ads! 🚀


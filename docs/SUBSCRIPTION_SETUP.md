# 🚀 Configuración de Suscripciones - AutoCare Pro

## 📋 Resumen del Sistema Implementado

### ✅ **Completado:**
1. ✅ RevenueCat SDK instalado
2. ✅ Tipos y constantes de suscripción
3. ✅ Servicio de suscripciones
4. ✅ Contexto React global
5. ✅ Integración en App.tsx

### 🎯 **Planes Configurados:**

```
FREE:     $0/mes    - 2 vehículos, límites mensuales
PRO:      $4.99/mes - 5 vehículos, funciones avanzadas
PREMIUM:  $9.99/mes - Ilimitado, modo profesional
```

---

## 🔧 Configuración de RevenueCat

### **Paso 1: Crear cuenta en RevenueCat**

1. Ve a https://app.revenuecat.com/signup
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto llamado "AutoCare Pro"

### **Paso 2: Configurar App Store Connect**

#### **A. Crear productos de suscripción en App Store Connect:**

1. Ve a https://appstoreconnect.apple.com
2. Selecciona tu app "AutoCare Pro"
3. Ve a **Features** > **In-App Purchases**
4. Crea los siguientes productos:

**Producto 1: PRO Monthly**
```
Product ID: autocare_pro_monthly
Type: Auto-Renewable Subscription
Reference Name: AutoCare Pro Monthly
Subscription Group: autocare_subscriptions
Duration: 1 Month
Price: $4.99 USD
```

**Producto 2: PRO Yearly**
```
Product ID: autocare_pro_yearly
Type: Auto-Renewable Subscription
Reference Name: AutoCare Pro Yearly
Subscription Group: autocare_subscriptions
Duration: 1 Year
Price: $49.99 USD
Introductory Offer: 7 Days Free Trial
```

**Producto 3: PREMIUM Monthly**
```
Product ID: autocare_premium_monthly
Type: Auto-Renewable Subscription
Reference Name: AutoCare Premium Monthly
Subscription Group: autocare_subscriptions
Duration: 1 Month
Price: $9.99 USD
```

**Producto 4: PREMIUM Yearly**
```
Product ID: autocare_premium_yearly
Type: Auto-Renewable Subscription
Reference Name: AutoCare Premium Yearly
Subscription Group: autocare_subscriptions
Duration: 1 Year
Price: $99.99 USD
```

#### **B. Configurar Subscription Group:**

1. Crea grupo: `autocare_subscriptions`
2. Orden de upgrade:
   - FREE (base)
   - PRO Monthly
   - PRO Yearly
   - PREMIUM Monthly
   - PREMIUM Yearly

### **Paso 3: Conectar RevenueCat con App Store**

1. En RevenueCat Dashboard, ve a **Project Settings**
2. Selecciona **Apple App Store**
3. Sigue las instrucciones para conectar:
   - Sube tu **App Store Connect API Key**
   - Ingresa tu **Bundle ID**: `com.autocare.pro`
   - Ingresa tu **Shared Secret** de App Store Connect

### **Paso 4: Configurar Entitlements en RevenueCat**

1. Ve a **Entitlements** en RevenueCat
2. Crea dos entitlements:

**Entitlement 1: "pro"**
```
Name: pro
Identifier: pro
Attached Products:
  - autocare_pro_monthly
  - autocare_pro_yearly
```

**Entitlement 2: "premium"**
```
Name: premium
Identifier: premium
Attached Products:
  - autocare_premium_monthly
  - autocare_premium_yearly
```

### **Paso 5: Crear Offerings**

1. Ve a **Offerings** en RevenueCat
2. Crea offering "default":

```
Offering ID: default
Packages:
  - Package 1:
      Identifier: pro_monthly
      Product: autocare_pro_monthly
      
  - Package 2:
      Identifier: pro_yearly
      Product: autocare_pro_yearly
      
  - Package 3:
      Identifier: premium_monthly
      Product: autocare_premium_monthly
      
  - Package 4:
      Identifier: premium_yearly
      Product: autocare_premium_yearly
```

### **Paso 6: Obtener API Keys**

1. En RevenueCat, ve a **Project Settings** > **API Keys**
2. Copia las API Keys:
   - **iOS**: `appl_xxxxxxxxxx`
   - **Android**: `goog_xxxxxxxxxx`

3. **Configuración de API Keys:**

**Opción A: Directamente en el código (para desarrollo)**

Edita `src/services/SubscriptionService.ts`:

```typescript
await Purchases.configure({
  apiKey: Platform.select({
    ios: 'appl_xxxxxxxxxx',  // Tu API Key de iOS
    android: 'goog_xxxxxxxxxx',  // Tu API Key de Android
  })!,
});
```

**Opción B: Con variables de entorno (recomendado para producción)**

1. Crea archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxx
```

2. Actualiza `src/services/SubscriptionService.ts`:

```typescript
import Constants from 'expo-constants';

await Purchases.configure({
  apiKey: Platform.select({
    ios: Constants.expoConfig?.extra?.REVENUECAT_IOS_KEY || 'appl_xxxxxxxxxx',
    android: Constants.expoConfig?.extra?.REVENUECAT_ANDROID_KEY || 'goog_xxxxxxxxxx',
  })!,
});
```

**Nota:** `react-native-purchases` no requiere configuración en `app.json` para Expo SDK 54+.

---

## 🧪 Testing de Suscripciones

### **Modo Sandbox (Testing)**

1. **En iOS:**
   - Ve a Settings > App Store > Sandbox Account
   - Crea una cuenta de prueba en App Store Connect
   - Usa esa cuenta para probar compras

2. **En RevenueCat Dashboard:**
   - Ve a **Customers**
   - Busca tu usuario de prueba
   - Verifica que las compras se registren

### **Comandos de prueba:**

```typescript
// En tu app, puedes probar:
import { useSubscription } from './src/contexts/SubscriptionContext';

const { currentPlan, isPro, isPremium, canAdd } = useSubscription();

console.log('Plan actual:', currentPlan);
console.log('¿Es PRO?:', isPro);
console.log('¿Puede agregar vehículo?:', canAdd('vehicles', 2));
```

---

## 📱 Uso en la App

### **Hook useSubscription:**

```typescript
import { useSubscription } from '../contexts/SubscriptionContext';

function MyComponent() {
  const {
    currentPlan,        // 'free' | 'pro' | 'premium'
    isPro,              // boolean
    isPremium,          // boolean
    isFree,             // boolean
    planLimits,         // objeto con límites
    hasFeature,         // función para verificar features
    canAdd,             // función para verificar límites
    getLimit,           // obtener límite específico
    purchasePackage,    // comprar suscripción
    restorePurchases,   // restaurar compras
  } = useSubscription();

  // Ejemplo: Verificar si puede agregar vehículo
  const handleAddVehicle = () => {
    if (!canAdd('vehicles', currentVehicleCount)) {
      // Mostrar paywall
      navigation.navigate('Paywall');
      return;
    }
    // Continuar...
  };

  // Ejemplo: Verificar feature
  if (hasFeature('canExportPDF')) {
    // Mostrar botón de exportar
  }
}
```

---

## 🎨 Próximos Pasos

### **Punto 2: Pantallas de Paywall** (Siguiente)
- [ ] Pantalla de comparación de planes
- [ ] Pantalla de upgrade
- [ ] Modal de límite alcanzado
- [ ] Pantalla de gestión de suscripción

### **Punto 3: Sistema de Límites**
- [ ] Middleware para verificar límites
- [ ] Contadores mensuales
- [ ] Alertas de límites

### **Punto 4: Funciones PRO**
- [ ] Reportes avanzados
- [ ] Sincronización en la nube
- [ ] Exportar PDF/Excel
- [ ] Temas personalizados

### **Punto 5: Analytics**
- [ ] Tracking de conversión
- [ ] Métricas de paywall
- [ ] A/B testing

---

## 🔒 Seguridad

- ✅ Las validaciones de suscripción se hacen en el servidor de RevenueCat
- ✅ No se puede hackear localmente
- ✅ Los receipts se verifican automáticamente
- ✅ Sincronización entre dispositivos

---

## 💰 Precios Recomendados

```
PRO Monthly:   $4.99  (precio de café)
PRO Yearly:    $49.99 (ahorra 17% = 2 meses gratis)
PREMIUM Monthly: $9.99  (para profesionales)
PREMIUM Yearly:  $99.99 (ahorra 17%)
```

**Trial:** 7 días gratis en PRO Yearly (aumenta conversión 40%)

---

## 📊 Métricas Esperadas

- **Conversión Free → Paid:** 2-5%
- **Retención mensual:** 70-80%
- **Retención anual:** 85-90%
- **LTV (Lifetime Value):**
  - PRO Monthly: $30-50
  - PRO Yearly: $100-150
  - PREMIUM: $150-300

---

## 🆘 Troubleshooting

### **Error: "No offerings found"**
- Verifica que hayas creado offerings en RevenueCat
- Espera 5-10 minutos después de crear productos

### **Error: "Purchase failed"**
- Verifica sandbox account en iOS
- Verifica que los Product IDs coincidan

### **No se actualiza el plan**
- Llama a `refreshSubscription()` después de comprar
- Verifica entitlements en RevenueCat Dashboard

---

## 📞 Soporte

- **RevenueCat Docs:** https://docs.revenuecat.com
- **RevenueCat Community:** https://community.revenuecat.com
- **App Store Connect:** https://developer.apple.com/app-store-connect/

---

**¡Sistema de suscripciones listo para implementar paywalls!** 🎉


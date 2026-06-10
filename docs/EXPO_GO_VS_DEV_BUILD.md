# 📱 Expo Go vs Development Build

## 🎯 Resumen

AutoCare Pro está diseñada para funcionar tanto en **Expo Go** (para desarrollo rápido) como en **Development Builds** (para funcionalidad completa).

---

## 🆓 Expo Go - Modo Demo

### ✅ **Funciona:**
- ✅ Toda la UI y navegación
- ✅ Gestión de vehículos (con límites demo)
- ✅ Registro de mantenimientos y gastos
- ✅ Calendario y recordatorios
- ✅ Pantallas de paywall (UI solamente)
- ✅ Exportación simulada
- ✅ Todas las pantallas y componentes

### ❌ **NO Funciona:**
- ❌ RevenueCat (compras reales)
- ❌ Push notifications remotas
- ❌ Verificación real de suscripciones

### 📝 **Comportamiento:**
```typescript
// En Expo Go, el servicio detecta automáticamente y usa modo demo:
if (Constants.appOwnership === 'expo') {
  console.log('⚠️ Expo Go detectado - RevenueCat no disponible');
  // Siempre retorna plan FREE
  // Permite probar toda la UI sin errores
}
```

### 💡 **Uso Recomendado:**
- Desarrollo rápido de UI/UX
- Pruebas de navegación
- Validación de diseño
- Demos para stakeholders

---

## 🚀 Development Build - Producción

### ✅ **Funciona TODO:**
- ✅ RevenueCat completo
- ✅ Compras reales (sandbox y producción)
- ✅ Push notifications
- ✅ Verificación de suscripciones
- ✅ Todas las funcionalidades premium

### 📝 **Cómo Crear:**

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login en Expo
eas login

# 3. Configurar proyecto
eas build:configure

# 4. Crear development build
eas build --profile development --platform ios
eas build --profile development --platform android

# 5. Instalar en dispositivo
# iOS: Descargar desde el link generado
# Android: Instalar APK directamente
```

### 🔧 **Configuración en eas.json:**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_REVENUECAT_IOS_KEY": "appl_xxxxxxxxxx",
        "EXPO_PUBLIC_REVENUECAT_ANDROID_KEY": "goog_xxxxxxxxxx"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_REVENUECAT_IOS_KEY": "appl_xxxxxxxxxx",
        "EXPO_PUBLIC_REVENUECAT_ANDROID_KEY": "goog_xxxxxxxxxx"
      }
    }
  }
}
```

---

## 🔍 Detección Automática

El código detecta automáticamente el entorno:

```typescript
// src/services/SubscriptionService.ts

async initialize() {
  // Detectar Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';
  
  if (isExpoGo) {
    console.log('⚠️ Expo Go detectado - Modo demo');
    // No inicializar RevenueCat
    // Usar plan FREE por defecto
    return;
  }

  // Verificar API keys
  if (apiKey.includes('PLACEHOLDER')) {
    console.warn('⚠️ API Key no configurada - Modo demo');
    return;
  }

  // Inicializar RevenueCat normalmente
  await Purchases.configure({ apiKey });
}
```

---

## 📊 Comparación

| Característica | Expo Go | Development Build |
|----------------|---------|-------------------|
| **Velocidad de desarrollo** | ⚡ Muy rápida | 🐢 Lenta (rebuild necesario) |
| **RevenueCat** | ❌ No | ✅ Sí |
| **Push Notifications** | ❌ No | ✅ Sí |
| **Compras In-App** | ❌ No | ✅ Sí |
| **UI/UX Testing** | ✅ Sí | ✅ Sí |
| **Navegación** | ✅ Sí | ✅ Sí |
| **Modo Demo** | ✅ Automático | ⚠️ Si no hay API keys |
| **Instalación** | 📱 Desde App Store | 🔧 Build manual |

---

## 🎯 Flujo de Trabajo Recomendado

### 1️⃣ **Desarrollo Inicial (Expo Go)**
```bash
npm start
# Escanear QR con Expo Go
# Desarrollo rápido de UI/UX
```

**Usar para:**
- Diseño de pantallas
- Navegación
- Lógica de negocio
- Componentes visuales

---

### 2️⃣ **Testing de Suscripciones (Development Build)**
```bash
# Crear build de desarrollo
eas build --profile development --platform ios

# Instalar en dispositivo
# Probar compras en sandbox
```

**Usar para:**
- Probar flujo de compra
- Verificar RevenueCat
- Testing de suscripciones
- Push notifications

---

### 3️⃣ **Pre-Producción (Preview Build)**
```bash
# Build de preview
eas build --profile preview --platform all

# Distribuir a testers
# TestFlight (iOS) o Internal Testing (Android)
```

**Usar para:**
- Beta testing
- QA completo
- Validación de stakeholders

---

### 4️⃣ **Producción (Production Build)**
```bash
# Build de producción
eas build --profile production --platform all

# Submit a stores
eas submit --platform ios
eas submit --platform android
```

**Usar para:**
- Release final
- App Store / Play Store

---

## ⚠️ Warnings Comunes

### 1. **expo-notifications**
```
WARN expo-notifications: Android Push notifications functionality 
was removed from Expo Go with SDK 53
```

**Solución:** Ignorado automáticamente en `App.tsx`. No afecta funcionalidad en development build.

---

### 2. **RevenueCat en Expo Go**
```
LOG Expo Go app detected. Using RevenueCat in Browser Mode.
ERROR Invalid API key. Use your Web Billing API key.
```

**Solución:** Comportamiento esperado. El servicio detecta Expo Go y usa modo demo automáticamente.

---

### 3. **New Architecture**
```
WARN React Native's New Architecture is always enabled in Expo Go
```

**Solución:** Removido `"newArchEnabled": false` de `app.json`. Ahora usa la configuración por defecto.

---

## 🧪 Testing de Suscripciones

### En Expo Go:
```typescript
// Siempre retorna FREE
const { currentPlan } = useSubscription();
console.log(currentPlan); // 'free'

// Paywall se muestra pero compras no funcionan
navigation.navigate('Paywall'); // ✅ UI funciona
// Botón de compra muestra error amigable
```

### En Development Build:
```typescript
// Retorna plan real desde RevenueCat
const { currentPlan } = useSubscription();
console.log(currentPlan); // 'free', 'pro', o 'premium'

// Compras funcionan en sandbox
navigation.navigate('Paywall');
// Compra real con Apple/Google sandbox
```

---

## 📝 Checklist de Testing

### ✅ Expo Go (UI/UX):
- [ ] Todas las pantallas se muestran correctamente
- [ ] Navegación funciona sin errores
- [ ] Formularios validan correctamente
- [ ] Paywall UI se muestra (sin compras)
- [ ] Límites demo funcionan

### ✅ Development Build (Funcionalidad):
- [ ] RevenueCat inicializa correctamente
- [ ] Offerings se cargan desde RevenueCat
- [ ] Compra en sandbox funciona
- [ ] Suscripción se refleja en la app
- [ ] Restaurar compras funciona
- [ ] Límites reales se aplican

---

## 🚀 Comandos Útiles

```bash
# Desarrollo rápido
npm start

# Limpiar caché
npm start -- --clear

# Development build iOS
eas build --profile development --platform ios --local

# Development build Android
eas build --profile development --platform android --local

# Ver logs en tiempo real
npx expo start --dev-client

# Verificar configuración
eas build:configure

# Ver builds
eas build:list
```

---

## 💡 Tips

1. **Usa Expo Go para desarrollo diario** - Es mucho más rápido
2. **Crea development build solo cuando necesites probar:**
   - Compras in-app
   - Push notifications
   - Funcionalidades nativas específicas
3. **Mantén ambos entornos** - No son excluyentes
4. **Documenta diferencias** - Si algo funciona diferente entre entornos

---

## 📚 Recursos

- [Expo Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [RevenueCat + Expo](https://www.revenuecat.com/docs/getting-started/installation/reactnative)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Testing Subscriptions](https://www.revenuecat.com/docs/test-and-launch/sandbox)


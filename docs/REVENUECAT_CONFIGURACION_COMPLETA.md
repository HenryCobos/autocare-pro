# ✅ Configuración Completa de RevenueCat - AutoCare Pro

Resumen de toda la configuración de RevenueCat y cómo conectarla con App Store Connect.

---

## 📊 Resumen de Configuración

### ✅ Proyecto Creado
- **Nombre:** AutoCare Pro
- **Platform:** iOS
- **Bundle ID:** `com.autocare.pro`

### ✅ Entitlements Creados (2)

| Identifier | Display Name | Descripción |
|-----------|--------------|-------------|
| `pro` | Pro Access | Acceso a características Pro |
| `premium` | Premium Access | Acceso ilimitado Premium |

### ✅ Products Vinculados (4)

| Product ID | Type | Entitlement | Precio |
|-----------|------|-------------|--------|
| `com.autocarepro.monthly.pro` | Subscription | `pro` | $4.99/mes |
| `com.autocarepro.yearly.pro` | Subscription | `pro` | $49.99/año |
| `com.autocarepro.monthly.premium` | Subscription | `premium` | $9.99/mes |
| `com.autocarepro.yearly.premium` | Subscription | `premium` | $99.99/año |

### ✅ Offering Configurado

**Offering ID:** `default` (Current)

**Packages (4):**

| Package ID | Type | Product | Plan |
|-----------|------|---------|------|
| `pro_monthly` | Monthly | `com.autocarepro.monthly.pro` | Pro |
| `pro_yearly` | Annual | `com.autocarepro.yearly.pro` | Pro |
| `premium_monthly` | Monthly | `com.autocarepro.monthly.premium` | Premium |
| `premium_yearly` | Annual | `com.autocarepro.yearly.premium` | Premium |

---

## 🔗 Conexión con App Store Connect

### App-Specific Shared Secret
✅ Configurado en RevenueCat → Settings → Apple App Store

**Cómo obtenerlo:**
1. App Store Connect → Mis Apps → AutoCare Pro
2. Información General → App-Specific Shared Secret
3. Generar → Copiar
4. Pegar en RevenueCat

---

## 🔑 API Key

### Public iOS SDK Key
```
appl_MIyVquEayqtpDbkhbIsYlQDjAnT
```

**Ubicación en RevenueCat:**
- Project Settings → API Keys → Public iOS SDK Key

**Ubicación en el código:**
```typescript
// src/services/SubscriptionService.ts
const REVENUECAT_API_KEYS = {
  ios: 'appl_MIyVquEayqtpDbkhbIsYlQDjAnT',
  android: 'goog_PLACEHOLDER',
};
```

✅ **Estado:** API Key configurada correctamente

**Opción con Variables de Entorno (.env):**
```env
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_TuAPIKeyAqui
```

---

## 🧪 Verificación de Configuración

### Checklist RevenueCat:

```
✅ Cuenta creada y verificada
✅ Proyecto "AutoCare Pro" creado
✅ App iOS configurada con Bundle ID correcto
✅ App Store App ID agregado
✅ 2 Entitlements creados (pro, premium)
✅ 4 Products vinculados con IDs exactos
✅ 1 Offering "default" con 4 packages
✅ Offering marcado como "Current"
✅ Shared Secret de Apple configurado
✅ API Key copiada e integrada en el código
```

### Checklist App Store Connect:

```
✅ 4 productos de suscripción creados
✅ Pruebas gratuitas (7 días) en planes anuales
✅ Precios configurados
✅ Localizaciones agregadas (español/inglés)
✅ URLs de privacidad y términos configuradas
✅ App-Specific Shared Secret generado
```

---

## 🔄 Flujo de Sincronización

```
Usuario compra en App
        ↓
Apple procesa pago
        ↓
Apple notifica a RevenueCat (vía Shared Secret)
        ↓
RevenueCat otorga Entitlement
        ↓
Tu app verifica Entitlement
        ↓
Usuario obtiene acceso
```

---

## 📱 IDs Importantes para el Código

### IDs de Productos (App Store Connect):
```typescript
const PRODUCT_IDS = {
  PRO_MONTHLY: 'com.autocarepro.monthly.pro',
  PRO_YEARLY: 'com.autocarepro.yearly.pro',
  PREMIUM_MONTHLY: 'com.autocarepro.monthly.premium',
  PREMIUM_YEARLY: 'com.autocarepro.yearly.premium',
};
```

### Entitlements (RevenueCat):
```typescript
const ENTITLEMENTS = {
  PRO: 'pro',
  PREMIUM: 'premium',
};
```

### Offering (RevenueCat):
```typescript
const DEFAULT_OFFERING = 'default';
```

---

## 🧪 Cómo Probar

### 1. Preparar Sandbox

**En App Store Connect:**
1. Usuarios y acceso → Sandbox
2. Agregar probadores de Sandbox
3. Crear usuario con email y contraseña

**En tu iPhone de Prueba:**
1. Ajustes → App Store
2. Cerrar sesión (solo de App Store, no de iCloud)
3. NO iniciar sesión todavía

### 2. Ejecutar la App en Modo Debug

```bash
# Asegúrate de estar en un Development Build
# NO en Expo Go

npx expo run:ios --device
```

### 3. Realizar Compra de Prueba

1. Abre la app en tu dispositivo físico
2. Ve al Paywall
3. Intenta comprar un plan
4. iOS pedirá iniciar sesión → Usa la cuenta Sandbox
5. La compra es GRATIS en Sandbox
6. Se procesa inmediatamente

### 4. Verificar en RevenueCat Dashboard

1. Ve a RevenueCat → Customers
2. Busca por el App User ID (se muestra en logs)
3. Verifica que aparezca:
   - ✅ Entitlement activo (pro o premium)
   - ✅ Fecha de inicio
   - ✅ Fecha de expiración

### 5. Renovaciones Aceleradas en Sandbox

En Sandbox, las renovaciones están aceleradas:
- **1 mes** → 5 minutos en la vida real
- **1 año** → 1 hora en la vida real

Esto te permite probar renovaciones rápidamente.

---

## 🔍 Verificar Logs

### En Xcode:
```
✅ "RevenueCat configured successfully"
✅ "Current entitlements: [pro]" o "[premium]"
✅ "Subscription active: true"
```

### En RevenueCat Dashboard:
- Customers → Buscar tu usuario
- Event Log → Ver eventos de compra

---

## 🐛 Troubleshooting

### "No offerings available"
**Causa:** API Key incorrecta o no configurada
**Solución:** Verifica la API Key en `SubscriptionService.ts`

### "Invalid product IDs"
**Causa:** IDs no coinciden entre App Store Connect y RevenueCat
**Solución:** 
1. Verifica IDs en App Store Connect
2. Verifica IDs en RevenueCat → Products
3. Deben ser IDÉNTICOS

### "Purchase not processing"
**Causa:** Shared Secret no configurado o incorrecto
**Solución:**
1. Regenera Shared Secret en App Store Connect
2. Actualízalo en RevenueCat → Settings

### "Entitlement not granted"
**Causa:** Product no vinculado al Entitlement correcto
**Solución:**
1. RevenueCat → Products
2. Verifica que cada producto tenga el entitlement correcto:
   - Pro products → `pro` entitlement
   - Premium products → `premium` entitlement

### "Sandbox user not working"
**Causa:** Usuario ya usado o mal configurado
**Solución:**
1. Crea un NUEVO usuario Sandbox
2. Usa un email que NUNCA hayas usado antes
3. Cierra sesión del App Store en el dispositivo antes de probar

---

## 📊 Dashboard de RevenueCat

### Métricas Importantes:

**Overview:**
- Active Subscriptions
- Monthly Recurring Revenue (MRR)
- Trial Conversion Rate

**Customers:**
- Lista de todos los usuarios
- Estado de suscripción por usuario
- Historial de transacciones

**Charts:**
- Revenue over time
- New subscribers
- Churn rate

**Event Log:**
- Eventos de compra en tiempo real
- Renovaciones
- Cancelaciones

---

## 🔐 Seguridad

### ✅ Buenas Prácticas:

1. **API Key:**
   - ✅ Usa variables de entorno
   - ❌ NO hagas commit de la API Key en Git
   - ✅ Agrega `.env` al `.gitignore`

2. **Shared Secret:**
   - ✅ Usa App-Specific (no el general)
   - ❌ NO lo compartas públicamente
   - ✅ Rotar si se compromete

3. **Verificación Server-Side:** (Futuro)
   - RevenueCat hace la verificación
   - No necesitas un servidor propio inicialmente
   - Para escala grande, considera Webhooks

---

## 📈 Próximos Pasos

### Después de Configurar:

1. **Probar en Sandbox** (30 minutos)
   - Compra de cada plan
   - Cancelación
   - Restauración
   - Renovación

2. **Preparar Assets para App Store** (1-2 horas)
   - Capturas de pantalla (iPhone)
   - Ícono de la app
   - Descripción de la app

3. **Enviar para Revisión** (5 minutos)
   - App Store Connect → Preparar para enviar
   - Completar metadatos
   - Enviar para revisión

4. **Esperar Aprobación** (24-48 horas)
   - Apple revisa la app
   - Responde preguntas si las hay
   - Aprobación y lanzamiento

---

## 🎉 Estado Final

### ✅ Completado:
- App implementada con suscripciones
- Documentos legales publicados
- Productos creados en App Store Connect
- RevenueCat configurado completamente
- Código actualizado con API Key

### ⏳ Pendiente:
- Probar en Sandbox
- Assets para App Store
- Enviar para revisión

---

## 📞 Soporte

### RevenueCat:
- Docs: https://docs.revenuecat.com
- Community: https://community.revenuecat.com
- Support: support@revenuecat.com
- Chat: Dentro del dashboard

### Apple Developer:
- Forums: https://developer.apple.com/forums
- Support: https://developer.apple.com/support

---

## 🔗 Enlaces Rápidos

```
RevenueCat Dashboard:
https://app.revenuecat.com

App Store Connect:
https://appstoreconnect.apple.com

Documentos Legales:
https://henrycobos.github.io/documentos-legales-autocare-pro/
```

---

**Última actualización:** 13 de octubre 2025  
**Versión:** 1.0 - Configuración completa de RevenueCat


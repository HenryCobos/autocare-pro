# 📱 Guía de Configuración: App Store Connect & RevenueCat

Esta guía te ayudará a configurar los productos de suscripción en App Store Connect y conectarlos con RevenueCat.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configurar Productos en App Store Connect](#configurar-productos-en-app-store-connect)
3. [Configurar RevenueCat](#configurar-revenuecat)
4. [Conectar App Store Connect con RevenueCat](#conectar-app-store-connect-con-revenuecat)
5. [Verificación y Pruebas](#verificación-y-pruebas)
6. [Troubleshooting](#troubleshooting)

---

## 1️⃣ Requisitos Previos

### ✅ Checklist:
- [ ] Cuenta de Apple Developer (99 USD/año)
- [ ] App ID creado en App Store Connect
- [ ] Cuenta de RevenueCat (gratuita hasta $10K MRR)
- [ ] Xcode instalado con tu certificado de desarrollador
- [ ] Políticas de privacidad y términos publicados en GitHub Pages

### 📌 URLs de Documentos Legales:
Una vez publiques en GitHub Pages, tendrás:
```
Privacy Policy: https://TU-USUARIO.github.io/autocare-pro-legal/privacy.html
Terms of Service: https://TU-USUARIO.github.io/autocare-pro-legal/terms.html
Support URL: https://TU-USUARIO.github.io/autocare-pro-legal/support.html
```

---

## 2️⃣ Configurar Productos en App Store Connect

### Paso 1: Crear Grupo de Suscripciones

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Selecciona tu app **AutoCare Pro**
3. Ve a la pestaña **Monetización** → **Suscripciones**
4. Haz clic en **Crear** (si es tu primera suscripción)

#### Configuración del Grupo:
- **Nombre de referencia del grupo:** `AutoCare Pro Subscriptions`
- **Nombre para mostrar:** `AutoCare Pro Subscriptions` (en español)

### Paso 2: Crear Suscripción PRO (Mensual)

1. Dentro del grupo, haz clic en **Crear suscripción**

#### Información General:
- **Nombre de referencia:** `AutoCare Pro - Monthly`
- **ID del producto:** `com.autocarepro.monthly.pro`
  - ⚠️ **IMPORTANTE:** Este ID debe coincidir con lo que está en el código
  - 📝 Verifica en: `src/services/SubscriptionService.ts`

#### Precios:
- **País/Región:** Selecciona todos los países donde quieras vender
- **Precio base:** $4.99 USD
  - Apple ajustará automáticamente los precios para otros países

#### Duración:
- **Duración de suscripción:** 1 mes

#### Prueba Gratuita:
- **Prueba gratuita:** NO (solo para anual)

#### Metadatos (en español):
- **Nombre para mostrar:** `Plan Pro`
- **Descripción:**
  ```
  Lleva el control de hasta 5 vehículos con características avanzadas:
  • Hasta 5 vehículos
  • 25 mantenimientos por mes
  • 75 gastos por mes
  • Recordatorios ilimitados
  • Exportar a PDF
  • Historial completo
  • Hasta 10 fotos por registro
  ```

#### Opciones de Renovación:
- **Renovación automática:** ✅ Activado
- **Ofrecer descuento introductorio:** No (opcional para el futuro)

### Paso 3: Crear Suscripción PRO (Anual)

Repite el proceso con estos cambios:

#### Información General:
- **Nombre de referencia:** `AutoCare Pro - Yearly`
- **ID del producto:** `com.autocarepro.yearly.pro`

#### Precios:
- **Precio base:** $49.99 USD

#### Duración:
- **Duración de suscripción:** 1 año

#### Prueba Gratuita:
- **Prueba gratuita:** ✅ 7 días
  - ⚠️ Solo disponible una vez por usuario por Apple ID

#### Metadatos (en español):
- **Nombre para mostrar:** `Plan Pro - Anual`
- **Descripción:**
  ```
  Ahorra 17% con el plan anual. Incluye 7 días de prueba gratuita.
  
  • Hasta 5 vehículos
  • 25 mantenimientos por mes
  • 75 gastos por mes
  • Recordatorios ilimitados
  • Exportar a PDF
  • Historial completo
  • Hasta 10 fotos por registro
  
  Cancela cuando quieras, sin compromisos.
  ```

### Paso 4: Crear Suscripción PREMIUM (Mensual)

#### Información General:
- **Nombre de referencia:** `AutoCare Premium - Monthly`
- **ID del producto:** `com.autocarepro.monthly.premium`

#### Precios:
- **Precio base:** $9.99 USD

#### Duración:
- **Duración de suscripción:** 1 mes

#### Metadatos (en español):
- **Nombre para mostrar:** `Plan Premium`
- **Descripción:**
  ```
  La solución completa para gestión intensiva de vehículos:
  • Vehículos ilimitados
  • Mantenimientos ilimitados
  • Gastos ilimitados
  • Recordatorios ilimitados
  • Exportar a PDF
  • Historial completo sin límites
  • Fotos ilimitadas
  ```

### Paso 5: Crear Suscripción PREMIUM (Anual)

#### Información General:
- **Nombre de referencia:** `AutoCare Premium - Yearly`
- **ID del producto:** `com.autocarepro.yearly.premium`

#### Precios:
- **Precio base:** $99.99 USD

#### Duración:
- **Duración de suscripción:** 1 año

#### Prueba Gratuita:
- **Prueba gratuita:** ✅ 7 días

#### Metadatos (en español):
- **Nombre para mostrar:** `Plan Premium - Anual`
- **Descripción:**
  ```
  Ahorra 17% con el plan anual. Incluye 7 días de prueba gratuita.
  
  • Vehículos ilimitados
  • Mantenimientos ilimitados
  • Gastos ilimitados
  • Recordatorios ilimitados
  • Exportar a PDF
  • Historial completo sin límites
  • Fotos ilimitadas
  
  Perfecto para talleres y entusiastas con múltiples vehículos.
  ```

### Paso 6: Configurar Información de Suscripciones

1. En la sección del grupo de suscripciones, ve a **Información de App Store**

#### URLs Requeridas:
- **URL de política de privacidad:** 
  ```
  https://TU-USUARIO.github.io/autocare-pro-legal/privacy.html
  ```
- **Términos de uso (opcional pero recomendado):**
  ```
  https://TU-USUARIO.github.io/autocare-pro-legal/terms.html
  ```

#### Información de renovación automática (en español):
```
Tu suscripción se renovará automáticamente a menos que canceles al menos 24 horas antes del final del período actual. 

Se te cobrará el precio de renovación dentro de las 24 horas previas al final del período actual. 

Puedes administrar o cancelar tu suscripción en cualquier momento desde los Ajustes de tu iPhone, en la sección de Suscripciones.

No hay reembolsos por períodos parciales no utilizados.
```

### Paso 7: Enviar para Revisión

1. Marca todas las suscripciones como **Listas para enviar**
2. ⚠️ **NO** envíes aún para revisión
3. Primero configura RevenueCat

---

## 3️⃣ Configurar RevenueCat

### Paso 1: Crear Cuenta

1. Ve a [RevenueCat.com](https://www.revenuecat.com)
2. Regístrate con tu email (gratuito hasta $10,000 MRR)
3. Verifica tu email

### Paso 2: Crear Proyecto

1. Haz clic en **Create new project**
2. **Project name:** `AutoCare Pro`
3. **Platform:** iOS
4. Haz clic en **Create**

### Paso 3: Configurar iOS App

1. **App name:** `AutoCare Pro`
2. **Bundle ID:** El mismo de tu app en Xcode (ej: `com.tuempresa.autocarepro`)
3. **App Store App ID:** Obtén este número de App Store Connect
   - Ve a tu app en App Store Connect
   - En **Información General**, copia el **Apple ID**
4. Haz clic en **Save**

### Paso 4: Crear Productos (Entitlements)

Los "Entitlements" son los permisos que otorgas cuando alguien se suscribe.

1. Ve a **Entitlements**
2. Crea los siguientes:

#### Entitlement: `pro`
- **Identifier:** `pro`
- **Description:** `Pro plan features`

#### Entitlement: `premium`
- **Identifier:** `premium`
- **Description:** `Premium plan features`

### Paso 5: Crear Offerings

Los "Offerings" son las opciones de compra que muestras al usuario.

1. Ve a **Offerings**
2. Haz clic en **Create new offering**

#### Offering 1: Current (Default)
- **Identifier:** `default`
- **Description:** `Default offering for all users`
- **Packages:**

##### Package 1: Pro Monthly
- **Identifier:** `pro_monthly`
- **Product:** `com.autocarepro.monthly.pro` (debe coincidir con App Store Connect)
- **Entitlement:** `pro`

##### Package 2: Pro Yearly
- **Identifier:** `pro_yearly`
- **Product:** `com.autocarepro.yearly.pro`
- **Entitlement:** `pro`

##### Package 3: Premium Monthly
- **Identifier:** `premium_monthly`
- **Product:** `com.autocarepro.monthly.premium`
- **Entitlement:** `premium`

##### Package 4: Premium Yearly
- **Identifier:** `premium_yearly`
- **Product:** `com.autocarepro.yearly.premium`
- **Entitlement:** `premium`

3. Marca este offering como **Current**

---

## 4️⃣ Conectar App Store Connect con RevenueCat

### Paso 1: Obtener App-Specific Shared Secret

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Selecciona tu app
3. Ve a **Información General**
4. En **App-Specific Shared Secret**, haz clic en **Generar**
5. Copia el código generado (ej: `a1b2c3d4e5f6...`)

### Paso 2: Configurar en RevenueCat

1. En RevenueCat, ve a **Project Settings** → **Apple App Store**
2. Pega el **Shared Secret** en el campo correspondiente
3. Haz clic en **Save**

### Paso 3: Obtener API Key de RevenueCat

1. En RevenueCat, ve a **Project Settings** → **API Keys**
2. Copia la **Public iOS SDK Key** (ej: `appl_AbCdEfGhIjKl`)
3. Este es el valor que usas en tu código:

```typescript
// src/services/SubscriptionService.ts
const REVENUECAT_API_KEY = 'appl_AbCdEfGhIjKl'; // ⬅️ Reemplaza con tu key
```

### Paso 4: Actualizar Código

Asegúrate de que los IDs en tu código coincidan exactamente:

```typescript
// src/services/SubscriptionService.ts

// ✅ Estos IDs deben coincidir con App Store Connect
const SUBSCRIPTION_IDS = {
  PRO_MONTHLY: 'com.autocarepro.monthly.pro',
  PRO_YEARLY: 'com.autocarepro.yearly.pro',
  PREMIUM_MONTHLY: 'com.autocarepro.monthly.premium',
  PREMIUM_YEARLY: 'com.autocarepro.yearly.premium',
};
```

---

## 5️⃣ Verificación y Pruebas

### Paso 1: Crear Usuario de Prueba en Sandbox

1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. En la esquina superior, haz clic en tu nombre → **Usuarios y acceso**
3. Ve a **Sandbox**
4. Haz clic en **Agregar probadores de Sandbox**
5. Crea un usuario de prueba:
   - Email: `test@example.com` (ficticio, no tiene que ser real)
   - Contraseña: Crea una segura
   - País: México (o tu región)
   - Nombre: Test User

### Paso 2: Configurar Dispositivo de Prueba

En tu iPhone/iPad de prueba:
1. Ve a **Ajustes** → **App Store**
2. **Cierra sesión** de tu Apple ID real (solo en la App Store, no en iCloud)
3. NO inicies sesión todavía con la cuenta Sandbox

### Paso 3: Probar en Xcode

1. Abre tu proyecto en Xcode
2. Asegúrate de tener el esquema en **Debug**
3. Conecta tu iPhone de prueba
4. Ejecuta la app (⌘R)

### Paso 4: Realizar Compra de Prueba

1. En la app, ve al Paywall
2. Intenta comprar una suscripción
3. Cuando iOS te pida iniciar sesión, usa el usuario Sandbox creado
4. **Importante:** En Sandbox, las compras son gratuitas y se procesan instantáneamente

### Paso 5: Verificar en RevenueCat Dashboard

1. Ve a RevenueCat Dashboard → **Customers**
2. Busca el App User ID (se muestra en los logs de Xcode)
3. Verifica que la suscripción aparezca activa
4. Comprueba los detalles:
   - Entitlement activo
   - Fecha de inicio
   - Fecha de renovación

### Paso 6: Probar Renovaciones Aceleradas

En Sandbox, las renovaciones están aceleradas:
- 1 mes = 5 minutos
- 1 año = 1 hora

Esto te permite probar renovaciones rápidamente.

### Paso 7: Probar Cancelación

1. En tu iPhone de prueba:
   - **Ajustes** → **App Store** → **Apple ID** → **Suscripciones**
2. Busca AutoCare Pro
3. Cancela la suscripción
4. Verifica que en la app se refleje correctamente

---

## 6️⃣ Troubleshooting

### ❌ Problema: "No products found"

**Causas posibles:**
- IDs de productos no coinciden entre código y App Store Connect
- Productos no están en estado "Ready to Submit"
- App no está firmada con el mismo Bundle ID

**Solución:**
1. Verifica IDs en `SubscriptionService.ts`
2. Confirma que productos estén aprobados en App Store Connect
3. Espera 2-4 horas después de crear productos (propagación de Apple)

### ❌ Problema: "Invalid product IDs"

**Solución:**
```bash
# Limpia caché de productos en Xcode
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### ❌ Problema: "Purchases not showing in RevenueCat"

**Solución:**
1. Verifica que el Shared Secret esté configurado
2. Confirma que la API Key sea correcta
3. Revisa los logs en RevenueCat Dashboard → **Event Log**

### ❌ Problema: "Sandbox user login fails"

**Solución:**
- Asegúrate de cerrar sesión del App Store (no de iCloud)
- Usa un email único que no hayas usado antes
- Espera unos minutos después de crear el usuario

### ❌ Problema: "Purchase completes but entitlement not granted"

**Solución:**
1. Verifica que el Entitlement esté vinculado al producto en RevenueCat
2. Comprueba los logs:
```typescript
console.log('Current entitlements:', customerInfo.entitlements.active);
```

---

## 📊 Checklist Final Antes del Lanzamiento

### App Store Connect:
- [ ] 4 productos de suscripción creados
- [ ] Precios configurados para todos los países
- [ ] Pruebas gratuitas de 7 días en planes anuales
- [ ] Metadatos en español completos
- [ ] URLs de privacidad y términos configuradas
- [ ] Información de renovación automática agregada
- [ ] Productos marcados como "Ready to Submit"

### RevenueCat:
- [ ] Proyecto creado
- [ ] App configurada con Bundle ID correcto
- [ ] 2 Entitlements creados (pro, premium)
- [ ] 1 Offering con 4 packages
- [ ] Shared Secret configurado
- [ ] API Key copiada al código

### Código:
- [ ] API Key de RevenueCat actualizada
- [ ] IDs de productos coinciden exactamente
- [ ] Probado en Sandbox con múltiples escenarios
- [ ] Manejo de errores implementado
- [ ] Restauración de compras funciona correctamente

### Pruebas Realizadas:
- [ ] Compra mensual Pro
- [ ] Compra anual Pro (con trial)
- [ ] Compra mensual Premium
- [ ] Compra anual Premium (con trial)
- [ ] Cancelación de suscripción
- [ ] Restauración de compras
- [ ] Renovación automática (en Sandbox acelerado)
- [ ] Expiración de trial

---

## 📚 Recursos Adicionales

### Documentación Oficial:
- [App Store Connect - Suscripciones](https://help.apple.com/app-store-connect/#/devb57be10e7)
- [RevenueCat - Quickstart iOS](https://docs.revenuecat.com/docs/getting-started)
- [Apple - In-App Purchase Testing](https://developer.apple.com/in-app-purchase/sandbox-testing/)

### Dashboards Importantes:
- [App Store Connect](https://appstoreconnect.apple.com)
- [RevenueCat Dashboard](https://app.revenuecat.com)
- [Apple Developer](https://developer.apple.com/account)

### Soporte:
- RevenueCat: https://community.revenuecat.com
- Apple Developer Forums: https://developer.apple.com/forums

---

## 🎉 ¡Listo!

Una vez completados todos estos pasos, tu sistema de suscripciones estará completamente configurado y listo para producción.

**Siguiente paso:** Envía tu app para revisión en App Store Connect.

**Tiempo estimado de revisión de Apple:** 24-48 horas para primera revisión.

---

**Última actualización:** Octubre 2025  
**Versión de la guía:** 1.0


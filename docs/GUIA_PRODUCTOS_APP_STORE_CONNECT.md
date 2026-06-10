# 📱 Guía Paso a Paso: Crear Productos de Suscripción en App Store Connect

Esta guía te llevará de la mano para crear los 4 productos de suscripción de AutoCare Pro.

---

## 📋 Preparación Antes de Empezar

### ✅ Requisitos:
- [ ] Cuenta de Apple Developer activa ($99 USD/año)
- [ ] App creada en App Store Connect (Bundle ID configurado)
- [ ] Documentos legales publicados en GitHub Pages
- [ ] 30-45 minutos de tiempo disponible

### 📝 URLs que necesitarás:
```
Privacy Policy: https://henrycobos.github.io/documentos-legales-autocare-pro/privacy.html
Terms of Service: https://henrycobos.github.io/documentos-legales-autocare-pro/terms.html
Support URL: https://henrycobos.github.io/documentos-legales-autocare-pro/support.html
```

### 🆔 IDs de Productos que crearás:
```
1. com.autocarepro.monthly.pro       ($4.99/mes)
2. com.autocarepro.yearly.pro        ($49.99/año + 7 días gratis)
3. com.autocarepro.monthly.premium   ($9.99/mes)
4. com.autocarepro.yearly.premium    ($99.99/año + 7 días gratis)
```

---

## 🚀 PASO 1: Acceder a App Store Connect

### 1.1 Iniciar Sesión
1. Ve a: **https://appstoreconnect.apple.com**
2. Inicia sesión con tu Apple ID de desarrollador
3. Espera a que cargue el dashboard

### 1.2 Seleccionar tu App
1. Haz clic en **"Mis Apps"** en la parte superior
2. Busca **"AutoCare Pro"** en la lista
3. Haz clic en el nombre de la app para abrirla

---

## 📦 PASO 2: Crear Grupo de Suscripciones

### 2.1 Acceder a la Sección de Suscripciones
1. En el menú lateral izquierdo, busca la sección **"Monetización"**
2. Haz clic en **"Suscripciones"**
3. Si es la primera vez, verás un botón **"Crear"**
4. Si ya tienes suscripciones, verás **"+"** o **"Agregar nuevo grupo"**

### 2.2 Crear el Grupo de Suscripciones
1. Haz clic en **"Crear"** o **"+ Grupo de suscripciones"**
2. Aparecerá un formulario

#### Campos a Llenar:

**Nombre de Referencia del Grupo:**
```
AutoCare Pro Subscriptions
```
> ℹ️ Este nombre es solo para ti, los usuarios no lo verán

**Nombre del Grupo para App Store:**
- Selecciona idioma: **Español (México)** o **Español (España)**
- Nombre para mostrar:
```
Suscripciones AutoCare Pro
```

3. Haz clic en **"Crear"** o **"Guardar"**

---

## 🎯 PASO 3: Crear Suscripción #1 - Pro Mensual

### 3.1 Iniciar Creación
1. Dentro del grupo que acabas de crear, haz clic en **"+ Crear suscripción"**
2. Aparecerá el formulario de configuración

### 3.2 Información de Referencia

**Nombre de Referencia:**
```
AutoCare Pro - Monthly
```

**ID del Producto:**
```
com.autocarepro.monthly.pro
```

> ⚠️ **MUY IMPORTANTE:** 
> - Este ID NO se puede cambiar después
> - Debe coincidir EXACTAMENTE con el código
> - Usa minúsculas y puntos (sin guiones)
> - Copia y pega para evitar errores

**Estado:**
- Déjalo en **"Listo para enviar"** (lo cambiarás después)

### 3.3 Duración de la Suscripción

**Duración:**
- Selecciona: **1 mes**

### 3.4 Precio de la Suscripción

1. Haz clic en **"Agregar precio"** o **"Configurar precio"**

**Precio base:**
- Selecciona: **$4.99 USD** (Nivel de precio 5)
- O escribe manualmente: `4.99`

**Disponibilidad:**
- Selecciona todos los países donde quieras vender
- Recomendado: **"Todos los países"** o al menos:
  - 🇺🇸 Estados Unidos
  - 🇲🇽 México  
  - 🇨🇦 Canadá
  - 🇪🇸 España
  - 🇦🇷 Argentina
  - 🇨🇴 Colombia
  - 🇨🇱 Chile

> ℹ️ Apple ajusta automáticamente el precio para cada país

**Fecha de inicio:**
- Déjalo en **"Inmediatamente"** o selecciona la fecha de lanzamiento

### 3.5 Oferta Introductoria (Prueba Gratuita)

**Para el plan mensual NO configuraremos prueba gratuita**

- Deja esta sección **vacía** o en **"Ninguno"**
- Solo los planes anuales tendrán 7 días gratis

### 3.6 Renovación de Suscripción

**Renovación Automática:**
- ✅ Activada por defecto (no la desactives)

**Recordatorio de Incremento de Precio:**
- Déjalo en configuración predeterminada

### 3.7 Información de Localización (Metadatos)

Ahora configurarás lo que verán los usuarios en la App Store.

1. Haz clic en **"+ Localización"** o **"Agregar idioma"**
2. Selecciona: **Español (México)** o **Español (España)**

#### Campos en Español:

**Nombre para Mostrar:**
```
Plan Pro
```

**Descripción:**
```
Controla hasta 5 vehículos con todas las herramientas que necesitas:

• Hasta 5 vehículos
• 25 mantenimientos por mes
• 75 gastos por mes  
• Recordatorios ilimitados
• Exportar historial a PDF
• Historial completo sin límites
• Hasta 10 fotos por registro

Perfecto para entusiastas del motor y usuarios con varios vehículos. Cancela cuando quieras sin compromiso.
```

> 📝 **Nota:** La descripción tiene un límite de caracteres. Si se pasa, acorta un poco.

3. **(Opcional)** Agrega también **Inglés** si quieres vender en mercados angloparlantes:

**Display Name (English):**
```
Pro Plan
```

**Description (English):**
```
Manage up to 5 vehicles with all the tools you need:

• Up to 5 vehicles
• 25 maintenance records per month
• 75 expense records per month
• Unlimited reminders
• Export history to PDF
• Complete unlimited history
• Up to 10 photos per record

Perfect for car enthusiasts and users with multiple vehicles. Cancel anytime.
```

### 3.8 Información de Revisión (Screenshot opcional)

Apple puede pedirte una captura de pantalla de cómo se muestra la suscripción en tu app.

- **Por ahora:** Puedes dejarlo en blanco
- **Antes de enviar:** Toma una captura del Paywall mostrando el plan Pro

### 3.9 Guardar Producto #1

1. Revisa todos los campos
2. Haz clic en **"Guardar"** en la esquina superior derecha
3. ✅ **Producto #1 creado** - Pro Mensual

---

## 🎯 PASO 4: Crear Suscripción #2 - Pro Anual (CON TRIAL)

### 4.1 Iniciar Creación
1. Regresa al grupo de suscripciones
2. Haz clic en **"+ Crear suscripción"** nuevamente

### 4.2 Información de Referencia

**Nombre de Referencia:**
```
AutoCare Pro - Yearly
```

**ID del Producto:**
```
com.autocarepro.yearly.pro
```

> ⚠️ **CRÍTICO:** Copia exactamente este ID

### 4.3 Duración de la Suscripción

**Duración:**
- Selecciona: **1 año**

### 4.4 Precio de la Suscripción

**Precio base:**
- Selecciona: **$49.99 USD** (Nivel de precio 50)

**Disponibilidad:**
- Mismos países que el producto anterior

### 4.5 Oferta Introductoria - PRUEBA GRATUITA 🎉

Ahora SÍ configuraremos la prueba gratuita de 7 días.

1. En la sección **"Ofertas de Introducción"**, haz clic en **"Agregar"**
2. Selecciona el tipo: **"Prueba Gratuita"** (Free Trial)

#### Configuración de la Prueba Gratuita:

**Duración de la prueba:**
```
7 días
```

**Disponibilidad:**
- Selecciona: **Todos los países** (o los mismos que el precio)

**Tipo de oferta:**
- **"Oferta Introductoria"** (Intro Offer)

**Elegibilidad:**
- **"Solo nuevos suscriptores"**
- Esto significa que solo pueden usar el trial UNA VEZ por Apple ID

> ℹ️ **Importante:** 
> - Al final de los 7 días gratis, se cobrará automáticamente $49.99
> - El usuario puede cancelar durante el trial sin cargo
> - Solo disponible una vez por usuario (Apple lo controla)

3. Haz clic en **"Guardar"** para guardar el trial

### 4.6 Información de Localización

**Español - Nombre para Mostrar:**
```
Plan Pro - Anual
```

**Español - Descripción:**
```
Ahorra 17% con el plan anual. ¡Incluye 7 días de prueba GRATIS!

• Hasta 5 vehículos
• 25 mantenimientos por mes
• 75 gastos por mes
• Recordatorios ilimitados
• Exportar historial a PDF
• Historial completo sin límites
• Hasta 10 fotos por registro

Solo $4.17 al mes pagando anualmente. Cancela cuando quieras sin compromiso.
```

**Inglés (opcional):**
```
Pro Plan - Annual

Save 17% with the annual plan. Includes 7-day FREE trial!

• Up to 5 vehicles
• 25 maintenance per month
• 75 expenses per month
• Unlimited reminders
• Export to PDF
• Complete unlimited history
• Up to 10 photos per record

Only $4.17/month billed annually. Cancel anytime.
```

### 4.7 Guardar Producto #2

1. Revisa todo cuidadosamente
2. Verifica que la prueba gratuita de 7 días esté configurada
3. Haz clic en **"Guardar"**
4. ✅ **Producto #2 creado** - Pro Anual con Trial

---

## 👑 PASO 5: Crear Suscripción #3 - Premium Mensual

### 5.1 Iniciar Creación
1. Regresa al grupo de suscripciones
2. Haz clic en **"+ Crear suscripción"**

### 5.2 Información de Referencia

**Nombre de Referencia:**
```
AutoCare Premium - Monthly
```

**ID del Producto:**
```
com.autocarepro.monthly.premium
```

### 5.3 Duración

**Duración:**
- Selecciona: **1 mes**

### 5.4 Precio

**Precio base:**
- Selecciona: **$9.99 USD** (Nivel de precio 10)

**Disponibilidad:**
- Mismos países

### 5.5 Oferta Introductoria

- **NO configurar** prueba gratuita para el mensual
- Déjalo vacío

### 5.6 Información de Localización

**Español - Nombre para Mostrar:**
```
Plan Premium
```

**Español - Descripción:**
```
La solución completa para gestión intensiva de vehículos:

• Vehículos ILIMITADOS
• Mantenimientos ILIMITADOS
• Gastos ILIMITADOS
• Recordatorios ILIMITADOS
• Exportar historial a PDF
• Historial completo sin restricciones
• Fotos ILIMITADAS por registro
• Soporte prioritario

Ideal para talleres mecánicos, flotas pequeñas y coleccionistas. Cancela en cualquier momento.
```

**Inglés (opcional):**
```
Premium Plan

The complete solution for intensive vehicle management:

• UNLIMITED vehicles
• UNLIMITED maintenance records
• UNLIMITED expenses
• UNLIMITED reminders
• Export to PDF
• Complete unlimited history
• UNLIMITED photos per record
• Priority support

Perfect for mechanics, small fleets, and collectors. Cancel anytime.
```

### 5.7 Guardar Producto #3

1. Revisa todos los campos
2. Haz clic en **"Guardar"**
3. ✅ **Producto #3 creado** - Premium Mensual

---

## 👑 PASO 6: Crear Suscripción #4 - Premium Anual (CON TRIAL)

### 6.1 Iniciar Creación
1. Regresa al grupo de suscripciones
2. Haz clic en **"+ Crear suscripción"** por última vez

### 6.2 Información de Referencia

**Nombre de Referencia:**
```
AutoCare Premium - Yearly
```

**ID del Producto:**
```
com.autocarepro.yearly.premium
```

### 6.3 Duración

**Duración:**
- Selecciona: **1 año**

### 6.4 Precio

**Precio base:**
- Selecciona: **$99.99 USD** (Nivel de precio 100)

**Disponibilidad:**
- Mismos países

### 6.5 Oferta Introductoria - PRUEBA GRATUITA 🎉

1. En **"Ofertas de Introducción"**, haz clic en **"Agregar"**
2. Selecciona: **"Prueba Gratuita"**

**Duración:**
```
7 días
```

**Disponibilidad:**
- Todos los países

**Elegibilidad:**
- Solo nuevos suscriptores

### 6.6 Información de Localización

**Español - Nombre para Mostrar:**
```
Plan Premium - Anual
```

**Español - Descripción:**
```
Ahorra 17% con el plan anual. ¡Incluye 7 días de prueba GRATIS!

• Vehículos ILIMITADOS
• Mantenimientos ILIMITADOS
• Gastos ILIMITADOS
• Recordatorios ILIMITADOS
• Exportar historial a PDF
• Historial completo sin restricciones
• Fotos ILIMITADAS por registro
• Soporte prioritario

Solo $8.33 al mes pagando anualmente. Perfecto para uso profesional. Cancela cuando quieras.
```

**Inglés (opcional):**
```
Premium Plan - Annual

Save 17% with the annual plan. Includes 7-day FREE trial!

• UNLIMITED vehicles
• UNLIMITED maintenance
• UNLIMITED expenses
• UNLIMITED reminders
• Export to PDF
• Complete unlimited history
• UNLIMITED photos per record
• Priority support

Only $8.33/month billed annually. Perfect for professional use. Cancel anytime.
```

### 6.7 Guardar Producto #4

1. Revisa todo meticulosamente
2. Verifica la prueba gratuita de 7 días
3. Haz clic en **"Guardar"**
4. ✅ **Producto #4 creado** - Premium Anual con Trial

---

## 📋 PASO 7: Configurar Información del Grupo de Suscripciones

Ahora que tienes los 4 productos creados, necesitas configurar la información general del grupo.

### 7.1 Acceder a Información del Grupo
1. Regresa a la vista del grupo de suscripciones
2. Busca la sección **"Información de App Store"** o **"Subscription Group Information"**
3. Haz clic en **"Editar"** o en el icono de lápiz

### 7.2 URLs Obligatorias

#### **URL de Política de Privacidad:**
```
https://henrycobos.github.io/documentos-legales-autocare-pro/privacy.html
```

#### **URL de Términos de Uso (Opcional pero recomendado):**
```
https://henrycobos.github.io/documentos-legales-autocare-pro/terms.html
```

> ⚠️ **Importante:** Copia y pega las URLs exactamente. Apple las verificará.

### 7.3 Mensaje de Renovación Automática

Apple requiere que informes claramente sobre la renovación automática. Usa este texto:

**Español:**
```
Tu suscripción se renovará automáticamente a menos que la canceles al menos 24 horas antes del final del período actual.

Se te cobrará el precio de renovación dentro de las 24 horas previas al final del período actual.

Puedes administrar o cancelar tu suscripción en cualquier momento desde los Ajustes de tu iPhone:
1. Abre Ajustes
2. Toca tu nombre en la parte superior
3. Selecciona "Suscripciones"
4. Busca AutoCare Pro
5. Toca "Cancelar Suscripción"

No hay reembolsos por períodos parciales no utilizados. Al cancelar, seguirás teniendo acceso hasta el final del período pagado.
```

**Inglés:**
```
Your subscription will automatically renew unless you cancel at least 24 hours before the end of the current period.

You will be charged the renewal price within 24 hours prior to the end of the current period.

You can manage or cancel your subscription at any time from your iPhone Settings:
1. Open Settings
2. Tap your name at the top
3. Select "Subscriptions"
4. Find AutoCare Pro
5. Tap "Cancel Subscription"

No refunds for partial unused periods. After canceling, you'll retain access until the end of the paid period.
```

### 7.4 Guardar Información del Grupo

1. Revisa que todas las URLs funcionen
2. Haz clic en **"Guardar"**

---

## 🔍 PASO 8: Verificación Final

### 8.1 Checklist de Productos Creados

Verifica que tengas los 4 productos con estos detalles:

| # | Nombre | ID del Producto | Precio | Trial |
|---|--------|-----------------|--------|-------|
| 1 | Pro Mensual | `com.autocarepro.monthly.pro` | $4.99/mes | ❌ No |
| 2 | Pro Anual | `com.autocarepro.yearly.pro` | $49.99/año | ✅ 7 días |
| 3 | Premium Mensual | `com.autocarepro.monthly.premium` | $9.99/mes | ❌ No |
| 4 | Premium Anual | `com.autocarepro.yearly.premium` | $99.99/año | ✅ 7 días |

### 8.2 Verificar Estado de Productos

Todos los productos deben estar en estado:
- **"Listo para enviar"** o **"Ready to Submit"**
- Si están en **"Falta información"**, revisa qué falta

### 8.3 Verificar URLs

1. Abre una pestaña del navegador
2. Copia y pega cada URL para verificar que funcionan:
   - URL de privacidad
   - URL de términos
   - URL de soporte

---

## ⚠️ PASO 9: Consideraciones Importantes

### 9.1 NO Enviar a Revisión Todavía

- **NO** marques los productos como **"Enviar para revisión"** aún
- Primero necesitas:
  1. Configurar RevenueCat
  2. Conectar App Store Connect con RevenueCat
  3. Probar las compras en Sandbox
  4. Enviar la app completa para revisión

### 9.2 Tiempo de Propagación

- Los productos pueden tardar **2-4 horas** en aparecer en Sandbox
- No te preocupes si no aparecen inmediatamente en tu código
- Espera este tiempo antes de probar

### 9.3 Restricciones de Productos

**No puedes cambiar después:**
- ❌ ID del producto
- ❌ Duración de la suscripción
- ❌ Tipo de suscripción

**Sí puedes cambiar:**
- ✅ Precios
- ✅ Descripciones
- ✅ Duración del trial
- ✅ Disponibilidad por país

---

## 📸 PASO 10: Capturas de Pantalla (Para Referencia)

Si estás haciendo esto y necesitas volver después, toma capturas de:

1. **Lista de los 4 productos** en el grupo
2. **ID de cada producto** (para verificar)
3. **Configuración del trial** (7 días en anuales)

---

## ✅ PASO 11: Confirmación Final

### Has completado exitosamente:

- ✅ Grupo de suscripciones creado
- ✅ 4 productos de suscripción configurados
- ✅ Pruebas gratuitas de 7 días en planes anuales
- ✅ Metadatos en español (e inglés opcional)
- ✅ URLs de documentos legales configuradas
- ✅ Información de renovación automática agregada

### Próximo paso:

**Configurar RevenueCat** para conectar estos productos con tu app.

Consulta la guía: `docs/APP_STORE_REVENUECAT_SETUP.md` - Sección 3 en adelante.

---

## 🆘 Solución de Problemas

### "No puedo agregar prueba gratuita"
- Asegúrate de estar en un plan **anual** (no mensual)
- Verifica que tu cuenta tenga permisos completos
- Intenta desde otro navegador (Safari o Chrome)

### "El ID del producto ya existe"
- No puedes usar IDs duplicados
- Verifica que no hayas creado este producto antes
- Si necesitas cambiarlo, elimina el producto anterior primero

### "Las URLs no se guardan"
- Asegúrate de usar `https://` (no `http://`)
- Verifica que las URLs estén accesibles públicamente
- Espera a que GitHub Pages termine de publicar (5 minutos)

### "Los precios no aparecen"
- Apple maneja niveles de precio predefinidos
- Si no encuentras exactamente $4.99, usa el nivel más cercano
- Los precios se ajustan automáticamente por país

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:
1. Revisa el estado en App Store Connect (esquina superior)
2. Verifica que tu cuenta de desarrollador esté activa
3. Consulta la documentación oficial: https://developer.apple.com/help/app-store-connect/
4. Contacta a Apple Developer Support si es crítico

---

## 🎉 ¡Felicidades!

Has creado exitosamente los 4 productos de suscripción de AutoCare Pro. Ahora puedes proceder a configurar RevenueCat y conectarlo con estos productos.

**Tiempo total estimado:** 30-45 minutos  
**Siguiente paso:** Configurar RevenueCat

---

**Última actualización:** 13 de octubre 2025  
**Versión:** 1.0 - Guía detallada para App Store Connect


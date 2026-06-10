# 🚀 Release v1.1.1 - Guía de Lanzamiento

## 📋 Resumen de Cambios

### Versión
- **Versión:** 1.1.1
- **Tipo:** Patch Release (Mejoras y Fixes)
- **Fecha:** Enero 2025

### Principales Mejoras
1. ✅ **Visualización y gestión de fotos mejorada** (Gastos y Mantenimientos)
2. ✅ **Sistema de moneda global** (31 monedas disponibles)
3. ✅ **Logs optimizados** (Menos ruido, mejor clasificación)
4. ✅ **Correcciones de consistencia** (Moneda aplicada en toda la app)

---

## 📝 Checklist Pre-Build

### ✅ Completado
- [x] Versión actualizada en `package.json` → 1.1.1
- [x] Versión actualizada en `app.json` → 1.1.1
- [x] Changelog creado: `docs/VERSION_1.1.1_CHANGELOG.md`
- [x] Código probado localmente
- [x] Sin errores de lint

### 📦 Archivos Actualizados
- ✅ `package.json` - Versión 1.1.1
- ✅ `app.json` - Versión 1.1.1
- ✅ Nuevos archivos de monedas y hooks
- ✅ Mejoras en visualización de fotos
- ✅ Optimización de logs

---

## 🔨 Comandos para Build

### 1. Verificar Instalación de EAS CLI
```bash
npm install -g eas-cli
eas --version
```

### 2. Iniciar Sesión en EAS
```bash
eas login
```

### 3. Verificar Configuración del Proyecto
```bash
eas whoami
eas project:info
```

### 4. Build de Producción para iOS
```bash
eas build --platform ios --profile production
```

Este comando:
- ✅ Creará un build de producción
- ✅ Usará `autoIncrement: true` para el build number
- ✅ Subirá el build automáticamente a App Store Connect
- ✅ Tomará aproximadamente 15-25 minutos

### 5. Opción: Build Local (más rápido pero requiere Mac con Xcode)
```bash
eas build --platform ios --profile production --local
```

---

## 📤 Subir a App Store Connect

### Opción 1: Automático (recomendado)
Si configuraste `eas submit` en el build anterior, se subirá automáticamente.

### Opción 2: Manual con EAS Submit
```bash
eas submit --platform ios --latest
```

### Opción 3: Manual con Transporter
1. Descarga el `.ipa` del build completado
2. Abre Transporter (App Store)
3. Arrastra el `.ipa` a Transporter
4. Click en "Deliver"

---

## 📱 Configuración en App Store Connect

### 1. Verificar Build Nuevo
- Ve a [App Store Connect](https://appstoreconnect.apple.com)
- Selecciona tu app: **AutoCare Pro**
- Ve a **TestFlight** o **App Store** → **Versión 1.1.1**

### 2. Agregar Release Notes
```
NUEVO en v1.1.1:

📸 Visualización de Fotos Mejorada
• Previsualiza fotos antes de guardar
• Visualiza fotos a pantalla completa
• Comparte o descarga fotos fácilmente
• Opción para tomar foto con cámara o seleccionar de galería

💱 Sistema de Moneda Global
• Selecciona entre 31 monedas (Latinoamérica, Europa, América del Norte)
• Cambia la moneda desde Configuración
• Todos los montos se actualizan automáticamente
• Soporte para USD, EUR, MXN, ARS, CLP, COP, PEN, BRL y más

🐛 Correcciones y Mejoras
• Logs más limpios y profesionales
• Mejor rendimiento general
• Correcciones menores de estabilidad
```

### 3. Seleccionar Build
- Selecciona el nuevo build (número incrementado automáticamente)
- Verifica que la versión es **1.1.1**

### 4. Enviar a Revisión
- Click en **"Submit for Review"**
- Completa cualquier pregunta adicional si aparece
- Apple revisará en 24-48 horas típicamente

---

## ✅ Checklist Post-Build

### Testing en TestFlight
- [ ] Descargar build desde TestFlight
- [ ] Verificar visualización de fotos en gastos
- [ ] Verificar visualización de fotos en mantenimientos
- [ ] Probar cambio de moneda en Settings
- [ ] Verificar que todos los montos muestran la moneda correcta
- [ ] Probar exportación PDF con diferentes monedas
- [ ] Verificar que logs son informativos (no confusos)

### Verificaciones Técnicas
- [ ] Build se creó correctamente
- [ ] Versión en App Store Connect es 1.1.1
- [ ] Build number incrementó correctamente
- [ ] Sin errores críticos en logs
- [ ] Fotos se pueden ver, compartir y descargar
- [ ] Cambio de moneda funciona en toda la app

---

## 📊 Notas Importantes

### Versión en App Store Connect
- **Si ya tienes 1.1.0 publicada:**
  - Esta será una **actualización** a la versión existente
  - Los usuarios verán la actualización automáticamente
  
- **Si es la primera vez publicando 1.1.x:**
  - Esta será una **nueva versión**
  - Los usuarios necesitarán actualizar manualmente (o esperar roll-out automático)

### Build Number
- El build number se incrementa automáticamente gracias a `"autoIncrement": true` en `eas.json`
- No necesitas cambiar nada manualmente

### Monedas Disponibles
La app ahora soporta **31 monedas**:
- **Latinoamérica:** MXN, ARS, CLP, COP, PEN, BRL, VES, UYU, PYG, BOB, GTQ, HNL, NIO, CRC, PAB, DOP, HTG, JMD
- **América del Norte/Centro:** USD, CAD
- **Europa:** EUR, GBP, CHF, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN

---

## 🆘 Troubleshooting

### Build Falla
```bash
# Ver logs detallados
eas build:list --platform ios --limit 5

# Ver detalles de un build específico
eas build:view <BUILD_ID>
```

### Errores Comunes
1. **"Missing credentials"**: 
   - Ejecuta `eas credentials` y configura las credenciales

2. **"Project not found"**:
   - Verifica que estás en el directorio correcto
   - Ejecuta `eas project:info` para verificar

3. **"Build failed"**:
   - Revisa los logs en `eas build:view <BUILD_ID>`
   - Verifica que no hay errores de TypeScript o lint

### Necesitas Ayuda?
- **EAS Docs:** https://docs.expo.dev/build/introduction/
- **Expo Forums:** https://forums.expo.dev/
- **Status:** https://status.expo.dev/

---

## 🎉 ¡Listo para Lanzar!

Una vez que completes estos pasos:
1. ✅ Build creado
2. ✅ Build subido a App Store Connect
3. ✅ Release notes agregados
4. ✅ Testing completado en TestFlight
5. ✅ Enviado a revisión

¡La versión 1.1.1 estará lista para los usuarios! 🚀

---

**Fecha:** Enero 2025  
**Versión:** 1.1.1  
**Estado:** ✅ Listo para Build


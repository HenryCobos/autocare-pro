# Rebuild 1.1.3 (ATT fix) — App Store Connect

La ficha **1.1.3 Rejected** solo acepta builds con marketing version **1.1.3**. El código ATT (`AttTrackingGate`, commit `e84cebe`) ya está en `main`; solo hay que alinear la versión del proyecto y generar un build nuevo.

## 1. Cambiar versión en el repo (si aún dice 1.1.4)

En `app.json` y `package.json`, línea `"version"`:

```json
"version": "1.1.3"
```

Commit y push:

```bash
git add app.json package.json
git commit -m "chore(ios): marketing version 1.1.3 for ATT resubmit to ASC"
git push origin main
```

## 2. Build producción

```bash
npx eas-cli build --platform ios --profile production
```

Resultado esperado: **1.1.3** + build number nuevo (p. ej. **1.0.14**). No uses el build **1.1.4 (1.0.13)**.

## 3. Subir a Apple

Transporter (recomendado) o:

```bash
npx eas-cli submit --platform ios --profile production --id <BUILD_ID>
```

## 4. App Store Connect — versión 1.1.3 Rejected

1. Build → seleccionar **1.1.3 (1.0.14)** (número real del build).
2. Quitar **1.0.12** si sigue asociado.
3. App Review → responder al rechazo (texto abajo).
4. **Update Review**.

## Respuesta en inglés (Resolution Center)

```
Hello,

We fixed the App Tracking Transparency timing in a new build for version 1.1.3
(build 1.0.14 — replace with your actual build number). The ATT system dialog now
appears on launch after a minimal blue splash screen labeled "AutoCare Pro", before
any main UI and before our analytics SDK (TikTok) initializes.

To see the ATT prompt: delete the app and reinstall, or go to Settings → Privacy &
Security → Tracking, disable tracking for this app, then launch again.

The app is iPhone-only; on iPad it runs in iPhone compatibility mode.

Thank you.
```

## Novedades (opcional, español)

```
Mejoras en v1.1.3:
• Corrección en la solicitud del permiso de rastreo (App Tracking Transparency)
• Mejoras de rendimiento y estabilidad
• Optimizaciones internas para campañas publicitarias
```

Submission ID rechazo: `59e27df1-27da-47be-ae0d-b000b8dbe71a`

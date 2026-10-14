# Release Notes - Versión 1.1.3

## Para App Store Connect

---

## Versión Corta (Recomendada para App Store)

```
Mejoras en v1.1.3:

• Mejoras de rendimiento y estabilidad
• Optimizaciones internas para campañas publicitarias
• Correcciones menores
```

---

## Versión Media (Alternativa)

```
Mejoras en v1.1.3:

⚡ Rendimiento y Estabilidad
Optimizaciones internas para una experiencia más fluida y confiable.

🔧 Correcciones Menores
Ajustes de estabilidad y mejoras generales en la app.
```

---

## Pasos en App Store Connect

1. Ve a **App Store Connect** → **AutoCare Pro** → **Distribución**
2. Crea la versión **1.1.3**
3. Selecciona el build generado por EAS (auto-incrementado, ej. 1.0.11)
4. Pega las release notes de arriba en **Novedades de esta versión**
5. Envía a revisión

---

## Comandos de build

```bash
# Build de producción
npx eas-cli build --platform ios --profile production

# Submit a App Store Connect
npx eas-cli submit --platform ios --profile production
```

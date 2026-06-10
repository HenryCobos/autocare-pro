# 🧭 Guía de Navegación: App Store Connect

Esta guía te ayuda a encontrar cada sección en App Store Connect durante la creación de productos.

---

## 🏠 Dashboard Principal

### Cómo llegar:
1. URL: **https://appstoreconnect.apple.com**
2. Inicia sesión con tu Apple ID de desarrollador
3. Verás el dashboard principal

### Elementos importantes en el dashboard:
```
┌─────────────────────────────────────────┐
│  App Store Connect        [Tu Nombre] ▼│
├─────────────────────────────────────────┤
│                                         │
│  [Mis Apps]  [App Analytics]  [...]    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  🚗 AutoCare Pro                  │ │
│  │  Desarrollo                       │ │
│  │  [Ver detalles]                   │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

**Acción:** Haz clic en **"Mis Apps"** en la barra superior

---

## 📱 Lista de Apps

### Qué verás:
- Lista de todas tus aplicaciones
- Estado de cada app (Desarrollo, En revisión, En venta, etc.)
- Buscar por nombre

### Navegación:
```
Mis Apps
  ├─ 🚗 AutoCare Pro  ← CLIC AQUÍ
  │   └─ Estado: Desarrollo
  │
  └─ [+ Crear nueva app]
```

**Acción:** Haz clic en **"AutoCare Pro"** para abrir tu app

---

## 🎛️ Panel de la App

### Menú Lateral (Izquierda):

```
AutoCare Pro
├─ 📊 Distribución
│   ├─ Información de la app
│   ├─ Precios y disponibilidad
│   ├─ Información de App Store
│   └─ Preparar para enviar
│
├─ 💰 Monetización  ← AQUÍ VAMOS
│   ├─ Suscripciones  ← CLIC AQUÍ
│   ├─ Compras dentro de la app
│   └─ Anuncios
│
├─ 📈 Analytics
├─ ⚙️ General
└─ TestFlight
```

**Acción:** 
1. Busca **"Monetización"** en el menú lateral
2. Haz clic en **"Suscripciones"**

---

## 📦 Pantalla de Suscripciones (Primera Vez)

### Si NO tienes suscripciones aún:

```
┌─────────────────────────────────────────┐
│  Suscripciones                          │
├─────────────────────────────────────────┤
│                                         │
│  Las suscripciones permiten que los    │
│  usuarios paguen por contenido o       │
│  servicios en tu app.                  │
│                                         │
│        [📦 Crear Grupo]  ← CLIC AQUÍ   │
│                                         │
└─────────────────────────────────────────┘
```

**Acción:** Haz clic en **"Crear"** o **"Crear Grupo"**

### Si YA tienes grupos de suscripciones:

```
┌─────────────────────────────────────────┐
│  Suscripciones            [+ Agregar] ▼│
├─────────────────────────────────────────┤
│                                         │
│  📦 AutoCare Pro Subscriptions          │
│     └─ 0 suscripciones                  │
│                                         │
│  [+ Crear nuevo grupo]                  │
│                                         │
└─────────────────────────────────────────┘
```

**Acción:** Haz clic en el **nombre del grupo** para editarlo

---

## 🔧 Creación de Grupo de Suscripciones

### Formulario:

```
Crear Grupo de Suscripciones
┌─────────────────────────────────────────┐
│                                         │
│  Nombre de referencia *                 │
│  ┌───────────────────────────────────┐ │
│  │ AutoCare Pro Subscriptions        │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Nombre para App Store                  │
│  Idioma: [Español (México) ▼]          │
│  ┌───────────────────────────────────┐ │
│  │ Suscripciones AutoCare Pro        │ │
│  └───────────────────────────────────┘ │
│                                         │
│           [Cancelar]  [Crear]          │
│                                         │
└─────────────────────────────────────────┘
```

**Campos requeridos:**
- ✅ Nombre de referencia (solo para ti)
- ✅ Nombre para App Store (usuarios lo ven)

---

## ➕ Vista del Grupo (Después de Crear)

```
AutoCare Pro Subscriptions
┌─────────────────────────────────────────┐
│  [+ Crear suscripción]  ← CLIC AQUÍ    │
├─────────────────────────────────────────┤
│                                         │
│  Suscripciones (0)                      │
│  └─ No hay suscripciones todavía       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Información de App Store               │
│  └─ [Agregar información] ← Después    │
│                                         │
└─────────────────────────────────────────┘
```

**Acción:** Haz clic en **"+ Crear suscripción"**

---

## 📝 Formulario de Nueva Suscripción

### Página 1 - Información Básica:

```
Nueva Suscripción
┌─────────────────────────────────────────┐
│                                         │
│  Nombre de referencia *                 │
│  ┌───────────────────────────────────┐ │
│  │ AutoCare Pro - Monthly            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ID del producto *                      │
│  ┌───────────────────────────────────┐ │
│  │ com.autocarepro.monthly.pro       │ │
│  └───────────────────────────────────┘ │
│  ⚠️ No se puede cambiar después         │
│                                         │
│  Duración de la suscripción *           │
│  ┌───────────────┐                     │
│  │ 1 mes       ▼│                      │
│  └───────────────┘                     │
│                                         │
│  [Continuar] ────────────────────────▶ │
│                                         │
└─────────────────────────────────────────┘
```

### Página 2 - Precios:

```
Precio de la Suscripción
┌─────────────────────────────────────────┐
│                                         │
│  [+ Agregar precio]  ← CLIC AQUÍ       │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ País/Región: [Todos ▼]             ││
│  │                                     ││
│  │ Precio base:                        ││
│  │ [$4.99 USD ▼]  o  [4.99]          ││
│  │                                     ││
│  │ Fecha de inicio: [Inmediatamente]   ││
│  │                                     ││
│  │        [Cancelar]  [Agregar]       ││
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

### Página 3 - Oferta Introductoria (Trial):

```
Oferta Introductoria
┌─────────────────────────────────────────┐
│                                         │
│  [+ Agregar oferta]  ← SOLO ANUALES    │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Tipo de oferta:                     ││
│  │ ● Prueba gratuita  ← Seleccionar   ││
│  │ ○ Precio reducido                   ││
│  │                                     ││
│  │ Duración:                           ││
│  │ ┌─────────┐                         ││
│  │ │ 7 días▼│                          ││
│  │ └─────────┘                         ││
│  │                                     ││
│  │ Disponibilidad: [Todos los países]  ││
│  │                                     ││
│  │        [Cancelar]  [Guardar]       ││
│  └─────────────────────────────────────┘│
│                                         │
└─────────────────────────────────────────┘
```

### Página 4 - Localización:

```
Información de Localización
┌─────────────────────────────────────────┐
│  [+ Agregar localización]  ← CLIC AQUÍ │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Seleccionar idioma:                 ││
│  │ ☑️ Español (México)                  ││
│  │ ☐ Español (España)                  ││
│  │ ☐ Inglés (EE.UU.)                   ││
│  │                                     ││
│  │        [Agregar]                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  Español (México)  [Editar]             │
│  ├─ Nombre: Plan Pro                    │
│  └─ Descripción: [Ver completa]         │
│                                         │
└─────────────────────────────────────────┘
```

---

## 💾 Guardar y Continuar

### Botones en la esquina superior derecha:

```
┌─────────────────────────────────────────┐
│  AutoCare Pro - Monthly                 │
│                    [Cancelar] [Guardar] │
└─────────────────────────────────────────┘
```

**IMPORTANTE:** Siempre haz clic en **"Guardar"** antes de salir

---

## 📊 Vista del Grupo con Productos Creados

Después de crear los 4 productos:

```
AutoCare Pro Subscriptions
┌─────────────────────────────────────────┐
│  [+ Crear suscripción]                  │
├─────────────────────────────────────────┤
│                                         │
│  Suscripciones (4)                      │
│  ├─ ⭐ Pro Mensual         $4.99/mes    │
│  ├─ ⭐ Pro Anual          $49.99/año    │
│  │   └─ 🎁 7 días gratis                │
│  ├─ 👑 Premium Mensual     $9.99/mes    │
│  └─ 👑 Premium Anual      $99.99/año    │
│      └─ 🎁 7 días gratis                │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Información de App Store  [Editar]     │
│  ├─ Privacy Policy: ✅ Configurada      │
│  ├─ Terms of Use: ✅ Configurada        │
│  └─ Auto-renewal: ✅ Configurada        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔍 Cómo Encontrar Información Después

### Para editar un producto existente:
1. **Mis Apps** → **AutoCare Pro**
2. **Monetización** → **Suscripciones**
3. Clic en el **nombre del grupo**
4. Clic en el **nombre del producto**
5. Editar campos
6. **Guardar**

### Para ver todos los productos:
```
Ruta: Mis Apps > AutoCare Pro > Monetización > Suscripciones
```

### Para copiar un ID de producto:
1. Abre el producto
2. Busca "ID del producto"
3. Haz clic en el icono 📋 o selecciona y copia

---

## ⚙️ Configuración de Información del Grupo

### Ubicación:
```
AutoCare Pro Subscriptions
  └─ Información de App Store  ← CLIC AQUÍ
      ├─ [Editar]
      └─ Campos requeridos:
          ├─ Privacy Policy URL *
          ├─ Terms of Use URL
          └─ Auto-Renewal Information *
```

### Formulario de Información del Grupo:

```
Información de App Store
┌─────────────────────────────────────────┐
│                                         │
│  Privacy Policy URL *                   │
│  ┌───────────────────────────────────┐ │
│  │ https://henrycobos.github.io/...  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Terms of Use URL                       │
│  ┌───────────────────────────────────┐ │
│  │ https://henrycobos.github.io/...  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Auto-Renewal Information *             │
│  Idioma: [Español (México) ▼]          │
│  ┌───────────────────────────────────┐ │
│  │ Tu suscripción se renovará...     │ │
│  │ (Texto completo)                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│           [Cancelar]  [Guardar]        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🧩 Atajos de Navegación

### URLs Directas (una vez logueado):
```
Dashboard:
https://appstoreconnect.apple.com

Mis Apps:
https://appstoreconnect.apple.com/apps

Tu App:
https://appstoreconnect.apple.com/apps/{APP_ID}

Suscripciones:
https://appstoreconnect.apple.com/apps/{APP_ID}/subscriptions
```

---

## 🎯 Consejos de Navegación

### ✅ Haz frecuentemente:
- Guarda cambios antes de navegar a otra página
- Verifica que el estado sea "Listo para enviar"
- Copia los IDs de producto a un documento

### ❌ Evita:
- Cerrar sin guardar
- Cambiar IDs de producto una vez creados
- Borrar productos que ya están en producción

---

## 📱 Navegación Móvil

App Store Connect también funciona en:
- Safari (iOS/iPadOS)
- Chrome (Android/iOS)

**Recomendación:** Usa escritorio para crear productos (más fácil).

---

## 🆘 Si Te Pierdes

### Siempre puedes volver al inicio:
1. Haz clic en el logo de **Apple** (esquina superior izquierda)
2. O haz clic en **"App Store Connect"** en la barra superior
3. Luego navega: **Mis Apps** → **AutoCare Pro** → **Monetización** → **Suscripciones**

---

**Última actualización:** 13 de octubre 2025


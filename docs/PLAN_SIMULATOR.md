# 🧪 Simulador de Planes - Guía de Uso

## 🎯 ¿Qué es el Simulador de Planes?

El simulador de planes es una herramienta de desarrollo que te permite **probar todos los planes de suscripción sin necesidad de compras reales**. Funciona exclusivamente en **Expo Go** y se desactiva automáticamente en builds de producción.

### 🔧 Cómo funciona internamente

El simulador actualiza **dos lugares** cuando cambias de plan:

1. **SubscriptionContext**: Actualiza el estado React para que la UI se actualice
2. **SubscriptionService**: Actualiza el estado interno del servicio para que `canAdd()` y `getPlanLimits()` usen los límites correctos

Esto asegura que todas las verificaciones de límites funcionen correctamente después de simular un plan.

---

## ✨ Características

- ✅ Cambiar entre planes instantáneamente
- ✅ Probar todas las funcionalidades premium
- ✅ Verificar límites de cada plan
- ✅ Testear flujos de upgrade/downgrade
- ✅ Sin necesidad de RevenueCat configurado
- ✅ Persiste entre reinicios de la app
- ✅ Sincronización completa entre contexto y servicio

---

## 🚀 Cómo Usar

### **1. Abrir el Simulador**

Hay dos formas de acceder al simulador:

#### **Opción A: Desde Configuración (Recomendado)**

1. Abre la app en Expo Go
2. Ve a la pestaña **"Configuración"** (⚙️)
3. En la tarjeta de "Suscripción" verás el badge **"🧪 Modo Simulación"**
4. Presiona el botón **"🧪 Simular Plan"**

#### **Opción B: Desde Cualquier Pantalla**

El simulador se activa automáticamente cuando:
- Estás en Expo Go
- No hay API keys de RevenueCat configuradas

---

### **2. Seleccionar un Plan**

Una vez abierto el simulador, verás 3 opciones:

```
🚗 Gratis
   - 1 vehículo
   - 5 mantenimientos/mes
   - 10 gastos/mes
   [Simular Gratis]

⭐ Pro
   - Hasta 5 vehículos
   - Mantenimientos ilimitados
   - Gastos ilimitados
   [Simular Pro]

👑 Premium
   - Todo de Pro, más:
   - Vehículos ilimitados
   - Fotos ilimitadas
   [Simular Premium]
```

**Simplemente toca el botón del plan que quieres probar.**

---

### **3. Probar Funcionalidades**

Una vez seleccionado un plan, la app se comportará exactamente como si tuvieras ese plan activo:

#### **Plan Gratuito:**
- ❌ Intenta agregar 2do vehículo → Modal de upgrade
- ❌ Intenta exportar PDF → Modal de upgrade
- ❌ Alcanza 5 mantenimientos → Modal de upgrade

#### **Plan Pro:**
- ✅ Puede agregar hasta 5 vehículos
- ✅ Mantenimientos y gastos ilimitados
- ✅ Puede exportar a PDF
- ❌ No puede compartir vehículos (Premium)

#### **Plan Premium:**
- ✅ Todo ilimitado
- ✅ Todas las funcionalidades desbloqueadas
- ✅ Sin restricciones

---

## 📱 Flujo de Testing Recomendado

### **Test 1: Límite de Vehículos**

```
1. Simular Plan Gratuito
2. Ir a "Vehículos"
3. Agregar 1 vehículo → ✅ Funciona
4. Intentar agregar 2do vehículo → ❌ Modal de upgrade
5. Simular Plan Pro
6. Intentar agregar 2do vehículo → ✅ Funciona
7. Agregar hasta 5 vehículos → ✅ Funciona
8. Intentar agregar 6to vehículo → ❌ Modal de upgrade
9. Simular Plan Premium
10. Agregar más vehículos → ✅ Ilimitado
```

---

### **Test 2: Límite de Mantenimientos**

```
1. Simular Plan Gratuito
2. Ir a "Mantenimiento"
3. Agregar 5 mantenimientos en el mes actual → ✅ Funciona
4. Intentar agregar 6to mantenimiento → ❌ Modal de upgrade
5. Simular Plan Pro
6. Agregar más mantenimientos → ✅ Ilimitado
```

---

### **Test 3: Exportación PDF**

```
1. Simular Plan Gratuito
2. Ir a un vehículo → "Historial"
3. Presionar "Exportar a PDF" → ❌ Modal de upgrade
4. Simular Plan Pro
5. Presionar "Exportar a PDF" → ✅ Genera PDF
```

---

### **Test 4: Flujo Completo de Upgrade**

```
1. Simular Plan Gratuito
2. Intentar agregar 2do vehículo
3. Aparece modal: "¡Necesitas Más Vehículos!"
4. Ver progreso: "1/1 vehículos"
5. Presionar "Ver Planes Completos"
6. Navega a PaywallScreen
7. Ver comparación de planes
8. Seleccionar Pro
9. En producción → Compra real
10. En simulación → Simular compra
```

---

## 🔧 Detalles Técnicos

### **Persistencia**

El plan simulado se guarda en AsyncStorage:
```typescript
await AsyncStorage.setItem('@simulated_plan', plan);
```

Esto significa que:
- ✅ Persiste entre reinicios de la app
- ✅ Persiste entre hot reloads
- ❌ Se borra si desinstala la app

---

### **Detección Automática**

El simulador se activa automáticamente cuando:

```typescript
const isExpoGo = Constants.appOwnership === 'expo';

if (isExpoGo) {
  // Modo simulación activado
  // Cargar plan desde AsyncStorage
}
```

---

### **Desactivación en Producción**

En builds de producción (EAS Build):
- ❌ El botón "Simular Plan" NO aparece
- ❌ No se puede cambiar de plan manualmente
- ✅ Solo funciona con RevenueCat real

---

## 🎨 Interfaz del Simulador

### **Modal del Simulador:**

```
┌─────────────────────────────────────┐
│  🧪 Simulador de Planes             │
│  Solo para desarrollo - Expo Go     │
│                                  [X] │
├─────────────────────────────────────┤
│                                     │
│  Selecciona un plan para simular    │
│  y probar todas las funcionalidades │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 🚗 Gratis                     │ │
│  │ Pruébalo                      │ │
│  │ • 1 vehículo                  │ │
│  │ • 5 mantenimientos/mes        │ │
│  │ • 10 gastos/mes               │ │
│  │ [Simular Gratis]              │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ⭐ Pro              ✓ ACTIVO  │ │
│  │ Para entusiastas              │ │
│  │ • Hasta 5 vehículos           │ │
│  │ • Mantenimientos ilimitados   │ │
│  │ • Gastos ilimitados           │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ 👑 Premium                    │ │
│  │ Para profesionales            │ │
│  │ • Todo de Pro, más:           │ │
│  │ • Vehículos ilimitados        │ │
│  │ • Fotos ilimitadas            │ │
│  │ [Simular Premium]             │ │
│  └───────────────────────────────┘ │
│                                     │
│  ⚠️ Este simulador solo funciona  │
│     en Expo Go. En producción,    │
│     las compras se procesarán     │
│     a través de RevenueCat.       │
└─────────────────────────────────────┘
```

---

## 📊 Estados del Plan

### **En Configuración:**

**Plan Gratuito:**
```
┌─────────────────────────────────┐
│ 🚗  Gratis                      │
│     Plan Gratuito               │
│     🧪 Modo Simulación          │
│                      [Mejorar >]│
├─────────────────────────────────┤
│     [🧪 Simular Plan]           │
└─────────────────────────────────┘
```

**Plan Pro:**
```
┌─────────────────────────────────┐
│ ⭐  Pro                         │
│     Activo                      │
│     🧪 Modo Simulación          │
│                   [Gestionar >] │
├─────────────────────────────────┤
│     [🧪 Simular Plan]           │
└─────────────────────────────────┘
```

---

## 🧪 Casos de Uso

### **1. Testing de UI/UX**
Probar cómo se ven los diferentes estados sin necesidad de compras.

### **2. Demo para Stakeholders**
Mostrar todas las funcionalidades premium sin configurar RevenueCat.

### **3. Desarrollo de Funciones Premium**
Desarrollar y probar funciones premium sin builds.

### **4. QA Manual**
Verificar que los límites funcionan correctamente.

### **5. Screenshots para App Store**
Capturar pantallas con funcionalidades premium activadas.

---

## ⚠️ Limitaciones

### **NO Simula:**
- ❌ Compras reales de App Store/Play Store
- ❌ Receipts de RevenueCat
- ❌ Webhooks de RevenueCat
- ❌ Renovaciones automáticas
- ❌ Cancelaciones
- ❌ Reembolsos

### **SÍ Simula:**
- ✅ Límites de cada plan
- ✅ Características habilitadas/deshabilitadas
- ✅ Modales de upgrade
- ✅ Pantallas de paywall
- ✅ Estado de suscripción
- ✅ Verificaciones de acceso

---

## 🔄 Cambiar de Plan

### **Método 1: Desde el Simulador**
1. Abrir simulador
2. Seleccionar nuevo plan
3. Automáticamente se aplica

### **Método 2: Programáticamente**
```typescript
const { simulatePlan } = useSubscription();

// Cambiar a Pro
await simulatePlan(SubscriptionPlan.PRO);

// Cambiar a Premium
await simulatePlan(SubscriptionPlan.PREMIUM);

// Volver a Free
await simulatePlan(SubscriptionPlan.FREE);
```

---

## 🐛 Troubleshooting

### **El simulador no aparece**
- ✅ Verifica que estés en Expo Go
- ✅ Reinicia la app
- ✅ Verifica que `Constants.appOwnership === 'expo'`

### **Los cambios no se aplican**
- ✅ Cierra y vuelve a abrir el simulador
- ✅ Navega a otra pantalla y regresa
- ✅ Reinicia la app

### **El plan no persiste**
- ✅ Verifica que AsyncStorage esté funcionando
- ✅ Revisa los logs de la consola

---

## 📝 Logs

El simulador genera logs útiles:

```
🧪 Plan simulado: pro
📊 Subscription status refreshed: { plan: 'pro', isActive: true }
⚠️ Expo Go detectado - RevenueCat no disponible
💡 Para probar suscripciones, usa un development build
```

---

## 🚀 Próximos Pasos

Una vez que hayas probado todo con el simulador:

1. **Configurar RevenueCat** con productos reales
2. **Crear development build** para testing real
3. **Probar compras en sandbox** de App Store
4. **Desplegar a producción**

---

## 💡 Tips

1. **Empieza con Free** para ver todos los límites
2. **Prueba cada límite** uno por uno
3. **Verifica los modales** de upgrade
4. **Navega al paywall** desde cada modal
5. **Cambia a Pro/Premium** para verificar que todo se desbloquea
6. **Toma screenshots** para documentación

---

**¡Disfruta probando tu app sin límites!** 🎉


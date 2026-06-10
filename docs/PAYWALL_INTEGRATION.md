# 🎨 Integración de Paywall - Guía Completa

Esta guía explica cómo integrar las pantallas de paywall y el modal de upgrade en toda la aplicación AutoCare Pro.

## 📋 Tabla de Contenidos

1. [Componentes Disponibles](#componentes-disponibles)
2. [Navegación a Paywall](#navegación-a-paywall)
3. [Modal de Upgrade](#modal-de-upgrade)
4. [Verificación de Límites](#verificación-de-límites)
5. [Ejemplos de Integración](#ejemplos-de-integración)

---

## 🧩 Componentes Disponibles

### 1. PaywallScreen
Pantalla completa que muestra los planes disponibles (Pro y Premium) con comparación de características, precios y opciones de compra.

**Ubicación:** `src/screens/PaywallScreen.tsx`

**Parámetros de navegación:**
```typescript
{
  source?: 'limit' | 'settings' | 'onboarding';
  limitType?: 'vehicles' | 'maintenance' | 'expenses' | 'reminders' | 'export' | 'reports';
}
```

### 2. UpgradeModal
Modal que se muestra cuando el usuario alcanza un límite del plan gratuito.

**Ubicación:** `src/components/subscription/UpgradeModal.tsx`

**Props:**
```typescript
{
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  limitType: 'vehicles' | 'maintenance' | 'expenses' | 'reminders' | 'export' | 'reports';
  currentCount?: number;
  maxCount?: number;
}
```

### 3. SubscriptionManagementScreen
Pantalla para gestionar la suscripción actual, ver límites y características.

**Ubicación:** `src/screens/SubscriptionManagementScreen.tsx`

---

## 🧭 Navegación a Paywall

### Desde cualquier pantalla:

```typescript
import { useNavigation } from '@react-navigation/native';

const MyScreen = () => {
  const navigation = useNavigation();

  const handleUpgrade = () => {
    navigation.navigate('Paywall', {
      source: 'limit',
      limitType: 'vehicles',
    });
  };

  // ...
};
```

### Tipos de source:
- **`limit`**: Cuando el usuario alcanza un límite
- **`settings`**: Desde la pantalla de configuración
- **`onboarding`**: Durante el onboarding inicial (futuro)

---

## 💬 Modal de Upgrade

### Uso básico:

```typescript
import React, { useState } from 'react';
import UpgradeModal from '../components/subscription/UpgradeModal';

const MyScreen = () => {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigation = useNavigation();

  const handleUpgrade = () => {
    setShowUpgrade(false);
    navigation.navigate('Paywall', {
      source: 'limit',
      limitType: 'vehicles',
    });
  };

  return (
    <>
      {/* Tu contenido */}
      
      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={handleUpgrade}
        limitType="vehicles"
        currentCount={3}
        maxCount={3}
      />
    </>
  );
};
```

---

## ✅ Verificación de Límites

### Usando el hook useSubscription:

```typescript
import { useSubscription } from '../contexts/SubscriptionContext';

const MyScreen = () => {
  const { canAdd, getLimit, currentPlan } = useSubscription();
  const [vehicles, setVehicles] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleAddVehicle = () => {
    // Verificar si puede agregar más vehículos
    if (!canAdd('vehicles', vehicles.length)) {
      setShowUpgrade(true);
      return;
    }

    // Continuar con la lógica de agregar vehículo
    // ...
  };

  return (
    <>
      <Button title="Agregar Vehículo" onPress={handleAddVehicle} />
      
      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={() => {
          setShowUpgrade(false);
          navigation.navigate('Paywall', {
            source: 'limit',
            limitType: 'vehicles',
          });
        }}
        limitType="vehicles"
        currentCount={vehicles.length}
        maxCount={getLimit('vehicles')}
      />
    </>
  );
};
```

---

## 📚 Ejemplos de Integración

### Ejemplo 1: Límite de Vehículos en VehiclesScreen

```typescript
// src/screens/VehiclesScreen.tsx

import React, { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import UpgradeModal from '../components/subscription/UpgradeModal';

const VehiclesScreen = ({ navigation }) => {
  const { canAdd, getLimit } = useSubscription();
  const [vehicles, setVehicles] = useState([]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleAddVehicle = () => {
    if (!canAdd('vehicles', vehicles.length)) {
      setShowUpgrade(true);
      return;
    }

    navigation.navigate('AddEditVehicle');
  };

  return (
    <View>
      <Button title="Agregar Vehículo" onPress={handleAddVehicle} />
      
      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={() => {
          setShowUpgrade(false);
          navigation.navigate('Paywall', {
            source: 'limit',
            limitType: 'vehicles',
          });
        }}
        limitType="vehicles"
        currentCount={vehicles.length}
        maxCount={getLimit('vehicles')}
      />
    </View>
  );
};
```

### Ejemplo 2: Bloquear Exportación de Datos

```typescript
// src/screens/ExpensesScreen.tsx

import React, { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import UpgradeModal from '../components/subscription/UpgradeModal';

const ExpensesScreen = ({ navigation }) => {
  const { hasFeature } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleExport = () => {
    if (!hasFeature('exportData')) {
      setShowUpgrade(true);
      return;
    }

    // Lógica de exportación
    // ...
  };

  return (
    <View>
      <Button title="Exportar a PDF" onPress={handleExport} />
      
      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={() => {
          setShowUpgrade(false);
          navigation.navigate('Paywall', {
            source: 'limit',
            limitType: 'export',
          });
        }}
        limitType="export"
      />
    </View>
  );
};
```

### Ejemplo 3: Recordatorios Automáticos (Premium)

```typescript
// src/screens/MaintenanceScreen.tsx

import React, { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import UpgradeModal from '../components/subscription/UpgradeModal';

const MaintenanceScreen = ({ navigation }) => {
  const { hasFeature } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleEnableReminders = () => {
    if (!hasFeature('autoReminders')) {
      setShowUpgrade(true);
      return;
    }

    // Habilitar recordatorios
    // ...
  };

  return (
    <View>
      <Switch
        value={remindersEnabled}
        onValueChange={handleEnableReminders}
      />
      
      <UpgradeModal
        visible={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        onUpgrade={() => {
          setShowUpgrade(false);
          navigation.navigate('Paywall', {
            source: 'limit',
            limitType: 'reminders',
          });
        }}
        limitType="reminders"
      />
    </View>
  );
};
```

---

## 🎯 Mejores Prácticas

### 1. **Mostrar el modal en el momento adecuado**
- Cuando el usuario intenta realizar una acción bloqueada
- No mostrar el modal automáticamente al abrir la pantalla
- Dar contexto claro de por qué se muestra

### 2. **Usar parámetros de navegación correctos**
```typescript
// ✅ Correcto
navigation.navigate('Paywall', {
  source: 'limit',
  limitType: 'vehicles',
});

// ❌ Incorrecto
navigation.navigate('Paywall');
```

### 3. **Actualizar el estado después de la compra**
```typescript
const { refreshSubscription } = useSubscription();

// Después de completar una compra
await refreshSubscription();
```

### 4. **Verificar límites antes de mostrar opciones**
```typescript
const { hasFeature } = useSubscription();

// Ocultar botones de funciones premium si no tiene acceso
{hasFeature('exportData') && (
  <Button title="Exportar" onPress={handleExport} />
)}
```

---

## 🔄 Flujo Completo de Upgrade

```
Usuario intenta acción
    ↓
Verificar límite/característica
    ↓
¿Tiene acceso?
    ↓ No
Mostrar UpgradeModal
    ↓
Usuario presiona "Ver Planes"
    ↓
Navegar a PaywallScreen
    ↓
Usuario selecciona plan
    ↓
Completar compra
    ↓
Actualizar suscripción
    ↓
Cerrar paywall y volver
    ↓
Usuario puede realizar la acción
```

---

## 📱 Integración en Configuración

Ya está integrado en `SettingsScreen.tsx`:

```typescript
// La tarjeta de suscripción se muestra automáticamente
// El usuario puede:
// - Ver su plan actual
// - Gestionar su suscripción
// - Actualizar a un plan superior
```

---

## 🚀 Próximos Pasos

1. **Integrar verificaciones de límites** en todas las pantallas que lo requieran
2. **Agregar el UpgradeModal** donde corresponda
3. **Probar el flujo completo** de upgrade
4. **Configurar RevenueCat** con productos reales
5. **Actualizar URLs** de términos y privacidad

---

## 📞 Soporte

Si tienes dudas sobre la integración, revisa:
- `docs/SUBSCRIPTION_SETUP.md` - Configuración de RevenueCat
- `src/types/subscription.ts` - Tipos y constantes
- `src/contexts/SubscriptionContext.tsx` - Lógica del contexto


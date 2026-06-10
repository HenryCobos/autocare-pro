# 📝 Ejemplos de Uso - TikTok App Events SDK

## Ejemplos prácticos de cómo usar el TikTok App Events SDK en AutoCare Pro

---

## 🎯 Ejemplo 1: Trackear cuando un usuario agrega un vehículo

```typescript
// En AddEditVehicleScreen.tsx
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

const AddEditVehicleScreen = ({ navigation }) => {
  const { trackEvent } = useTikTok();
  
  const handleSaveVehicle = async (vehicleData) => {
    // Guardar el vehículo
    await saveVehicle(vehicleData);
    
    // Trackear en TikTok
    await trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'add_vehicle',
      vehicle_type: vehicleData.type,
      vehicle_brand: vehicleData.brand,
      is_first_vehicle: vehicles.length === 0,
    });
    
    navigation.goBack();
  };
  
  return (
    // Tu UI aquí
  );
};
```

---

## 🎯 Ejemplo 2: Trackear cuando un usuario programa un mantenimiento

```typescript
// En AddEditMaintenanceScreen.tsx
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

const AddEditMaintenanceScreen = ({ navigation }) => {
  const { trackEvent } = useTikTok();
  
  const handleScheduleMaintenance = async (maintenanceData) => {
    // Guardar el mantenimiento
    await saveMaintenance(maintenanceData);
    
    // Trackear en TikTok
    await trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'schedule_maintenance',
      maintenance_type: maintenanceData.type,
      estimated_cost: maintenanceData.estimatedCost,
      days_until_due: calculateDaysUntil(maintenanceData.dueDate),
    });
    
    navigation.goBack();
  };
  
  return (
    // Tu UI aquí
  );
};
```

---

## 🎯 Ejemplo 3: Trackear cuando un usuario ve sus estadísticas

```typescript
// En DashboardScreen.tsx
import { useTikTok } from '../hooks/useTracking';
import { useEffect } from 'react';

const DashboardScreen = () => {
  const { trackViewContent } = useTikTok();
  
  useEffect(() => {
    // Trackear cuando el usuario ve el dashboard
    trackViewContent('dashboard', 'main_statistics', {
      total_vehicles: vehicles.length,
      total_expenses: totalExpenses,
      period: selectedPeriod,
    });
  }, []);
  
  return (
    // Tu UI aquí
  );
};
```

---

## 🎯 Ejemplo 4: Trackear cuando un usuario exporta un PDF

```typescript
// En SettingsScreen.tsx
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

const SettingsScreen = () => {
  const { trackEvent } = useTikTok();
  
  const handleExportPDF = async () => {
    // Verificar si tiene acceso (Pro/Premium)
    if (!hasProAccess) {
      // Mostrar paywall
      navigation.navigate('Paywall', { 
        source: 'settings',
        limitType: 'export' 
      });
      return;
    }
    
    // Exportar PDF
    await exportToPDF();
    
    // Trackear en TikTok
    await trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'export_pdf',
      export_type: 'vehicle_report',
      number_of_vehicles: vehicles.length,
      date_range: selectedDateRange,
    });
  };
  
  return (
    // Tu UI aquí
  );
};
```

---

## 🎯 Ejemplo 5: Trackear cuando un usuario activa notificaciones

```typescript
// En SettingsScreen.tsx
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

const SettingsScreen = () => {
  const { trackEvent } = useTikTok();
  
  const handleToggleNotifications = async (enabled) => {
    // Guardar preferencia
    await saveNotificationPreference(enabled);
    
    // Trackear en TikTok
    await trackEvent(TikTokEvent.CUSTOM, {
      event_name: enabled ? 'enable_notifications' : 'disable_notifications',
      notification_types: selectedNotificationTypes,
    });
  };
  
  return (
    // Tu UI aquí
  );
};
```

---

## 🎯 Ejemplo 6: Trackear búsquedas

```typescript
// En VehiclesScreen.tsx (si tienes búsqueda)
import { useTikTok, TikTokEvent } from '../hooks/useTracking';
import { useState, useEffect } from 'react';

const VehiclesScreen = () => {
  const { trackEvent } = useTikTok();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Trackear búsquedas con debounce
  useEffect(() => {
    if (searchQuery.length < 3) return;
    
    const timeoutId = setTimeout(() => {
      trackEvent(TikTokEvent.SEARCH, {
        search_string: searchQuery,
        content_type: 'vehicle',
        results_count: filteredVehicles.length,
      });
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  
  return (
    // Tu UI con búsqueda
  );
};
```

---

## 🎯 Ejemplo 7: Trackear cuando un usuario alcanza un límite (Free plan)

```typescript
// En un componente que verifica límites
import { useTikTok, TikTokEvent } from '../hooks/useTracking';
import { useSubscription } from '../contexts/SubscriptionContext';

const VehiclesScreen = () => {
  const { trackEvent } = useTikTok();
  const { currentPlan, limits } = useSubscription();
  
  const handleAddVehicle = () => {
    // Verificar límite
    if (currentPlan === 'free' && limits.vehicles.current >= limits.vehicles.max) {
      // Trackear que alcanzó el límite
      trackEvent(TikTokEvent.CUSTOM, {
        event_name: 'hit_limit',
        limit_type: 'vehicles',
        current_count: limits.vehicles.current,
        max_allowed: limits.vehicles.max,
      });
      
      // Mostrar paywall
      navigation.navigate('Paywall', {
        source: 'limit',
        limitType: 'vehicles',
      });
      return;
    }
    
    // Continuar con agregar vehículo
    navigation.navigate('AddEditVehicle');
  };
  
  return (
    // Tu UI aquí
  );
};
```

---

## 🎯 Ejemplo 8: Trackear engagement con características específicas

```typescript
// En CalendarScreen.tsx
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

const CalendarScreen = () => {
  const { trackEvent, trackViewContent } = useTikTok();
  
  useEffect(() => {
    // Trackear vista del calendario
    trackViewContent('calendar', 'maintenance_schedule', {
      month: currentMonth,
      year: currentYear,
      scheduled_items: scheduledMaintenances.length,
    });
  }, [currentMonth, currentYear]);
  
  const handleAddReminder = async (reminderData) => {
    await saveReminder(reminderData);
    
    // Trackear creación de recordatorio
    await trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'create_reminder',
      reminder_type: reminderData.type,
      days_before: reminderData.daysBefore,
      has_custom_message: !!reminderData.customMessage,
    });
  };
  
  return (
    // Tu UI aquí
  );
};
```

---

## 🎯 Ejemplo 9: Trackear interacción con gráficas

```typescript
// En ExpensesScreen.tsx
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

const ExpensesScreen = () => {
  const { trackEvent } = useTikTok();
  const [chartType, setChartType] = useState('pie');
  const [period, setPeriod] = useState('month');
  
  const handleChangeChartType = (newType) => {
    setChartType(newType);
    
    // Trackear cambio de visualización
    trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'change_chart_view',
      chart_type: newType,
      period,
      total_expenses_shown: expenses.length,
    });
  };
  
  const handleChangePeriod = (newPeriod) => {
    setPeriod(newPeriod);
    
    // Trackear cambio de período
    trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'change_period',
      new_period: newPeriod,
      chart_type: chartType,
      expenses_in_period: filteredExpenses.length,
    });
  };
  
  return (
    // Tu UI aquí
  );
};
```

---

## 🎯 Ejemplo 10: Crear un hook personalizado para eventos comunes

```typescript
// En src/hooks/useTikTokEvents.ts
import { useTikTok, TikTokEvent } from './useTracking';
import { useSubscription } from '../contexts/SubscriptionContext';

export const useTikTokEvents = () => {
  const { trackEvent } = useTikTok();
  const { currentPlan, limits } = useSubscription();
  
  // Trackear cuando alcanza un límite
  const trackLimitReached = (limitType: 'vehicles' | 'maintenance' | 'expenses') => {
    trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'limit_reached',
      limit_type: limitType,
      current_plan: currentPlan,
      current_count: limits[limitType].current,
      max_allowed: limits[limitType].max,
    });
  };
  
  // Trackear interacción con feature premium
  const trackPremiumFeatureAttempt = (featureName: string) => {
    trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'premium_feature_attempt',
      feature_name: featureName,
      current_plan: currentPlan,
    });
  };
  
  // Trackear completación de acción importante
  const trackMilestone = (milestone: string, data?: any) => {
    trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'milestone_reached',
      milestone_name: milestone,
      ...data,
    });
  };
  
  return {
    trackLimitReached,
    trackPremiumFeatureAttempt,
    trackMilestone,
  };
};

// Uso:
// const { trackLimitReached } = useTikTokEvents();
// trackLimitReached('vehicles');
```

---

## 🎯 Ejemplo 11: Trackear tiempo de sesión

```typescript
// En App.tsx o en un hook personalizado
import { useTikTok, TikTokEvent } from './hooks/useTracking';
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export const useSessionTracking = () => {
  const { trackEvent } = useTikTok();
  const sessionStartTime = useRef(Date.now());
  
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        // App va al background - trackear duración de sesión
        const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
        
        trackEvent(TikTokEvent.CUSTOM, {
          event_name: 'session_end',
          session_duration_seconds: sessionDuration,
        });
      } else if (nextAppState === 'active') {
        // App vuelve a active - nueva sesión
        sessionStartTime.current = Date.now();
        
        trackEvent(TikTokEvent.LAUNCH_APP, {
          content_type: 'app_resume',
        });
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
};
```

---

## 🎯 Ejemplo 12: Trackear errores importantes

```typescript
// En un componente o servicio global
import { useTikTok, TikTokEvent } from '../hooks/useTracking';

export const useErrorTracking = () => {
  const { trackEvent } = useTikTok();
  
  const trackError = (error: Error, context: string) => {
    trackEvent(TikTokEvent.CUSTOM, {
      event_name: 'app_error',
      error_message: error.message,
      error_context: context,
      error_stack: error.stack?.substring(0, 200), // Solo los primeros 200 caracteres
    });
  };
  
  return { trackError };
};

// Uso:
// const { trackError } = useErrorTracking();
// try {
//   await someOperation();
// } catch (error) {
//   trackError(error, 'vehicle_save');
//   Alert.alert('Error', 'No se pudo guardar el vehículo');
// }
```

---

## 📊 Mejores Prácticas

### ✅ DO (Hacer)

1. **Trackear eventos significativos**: Acciones que indican engagement o intención de compra
2. **Incluir contexto útil**: Propiedades que ayuden a entender el comportamiento
3. **Usar valores monetarios**: Cuando sea relevante (suscripciones, compras)
4. **Trackear todo el funnel**: Desde instalación hasta conversión
5. **Usar eventos estándar**: Cuando estén disponibles (Subscribe, Purchase, etc.)

### ❌ DON'T (Evitar)

1. **No trackear eventos triviales**: Como cada tap o scroll
2. **No enviar PII**: Emails, teléfonos, nombres reales
3. **No enviar datos sensibles**: Información bancaria, passwords
4. **No trackear en exceso**: Puede afectar rendimiento y costos
5. **No duplicar eventos**: Un evento por acción

---

## 🔧 Debugging

Para ver los eventos en modo desarrollo, revisa la consola:

```
🧪 [TikTok Test Mode] Evento: CustomEvent {
  event_name: 'add_vehicle',
  vehicle_type: 'car',
  is_first_vehicle: true
}
✅ Evento de TikTok enviado: CustomEvent
```

---

## 📚 Recursos Adicionales

- [Guía Completa de Integración](./TIKTOK_INTEGRATION.md)
- [Guía Rápida](./TIKTOK_QUICKSTART.md)
- [README de TikTok](./README_TIKTOK.md)

---

¡Usa estos ejemplos como base para implementar tracking personalizado en tu app! 🚀


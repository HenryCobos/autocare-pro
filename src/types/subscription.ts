/**
 * Tipos y constantes para el sistema de suscripciones
 */

export enum SubscriptionPlan {
  FREE = 'free',
  PRO = 'pro',
  PREMIUM = 'premium',
}

export enum SubscriptionPeriod {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface PlanLimits {
  vehicles: number; // -1 = ilimitado
  maintenancePerMonth: number;
  expensesPerMonth: number;
  activeReminders: number;
  historyMonths: number; // -1 = ilimitado
  photosPerRecord: number;
  canExportPDF: boolean;
  canExportExcel: boolean;
  canSync: boolean;
  canShareVehicles: boolean;
  canUseAdvancedReports: boolean;
  canUseFleetMode: boolean;
  canUseAIAssistant: boolean;
  hasPrioritySupport: boolean;
}

export interface SubscriptionProduct {
  id: string;
  plan: SubscriptionPlan;
  period: SubscriptionPeriod;
  price: string;
  priceValue: number;
  currency: string;
  title: string;
  description: string;
  savings?: string; // Para mostrar descuento anual
}

export interface UserSubscription {
  plan: SubscriptionPlan;
  isActive: boolean;
  expirationDate?: string;
  willRenew: boolean;
  productId?: string;
  originalPurchaseDate?: string;
}

// Constantes de productos (IDs de RevenueCat/App Store)
// IMPORTANTE: Estos IDs deben coincidir EXACTAMENTE con App Store Connect
export const SUBSCRIPTION_PRODUCTS = {
  PRO_MONTHLY: 'com.autocarepro.monthly.pro',
  PRO_YEARLY: 'com.autocarepro.yearly.pro',
  PREMIUM_MONTHLY: 'com.autocarepro.monthly.premium',
  PREMIUM_YEARLY: 'com.autocarepro.yearly.premium',
};

// Límites por plan (Estrategia de conversión optimizada)
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    vehicles: 1,                    // Solo 1 vehículo - fricción para upgrade
    maintenancePerMonth: 5,         // 5 registros/mes - suficiente para probar
    expensesPerMonth: 10,           // 10 gastos/mes - limitado pero funcional
    activeReminders: 3,             // 3 recordatorios - básico
    historyMonths: 3,               // 3 meses de historial - ver valor sin perder todo
    photosPerRecord: 1,             // 1 foto por registro
    canExportPDF: false,            // ❌ No exportar - diferenciador clave
    canExportExcel: false,          // ❌ No exportar (no implementado)
    canSync: false,                 // ❌ No sincronización (no implementado)
    canShareVehicles: false,        // ❌ No compartir (no implementado)
    canUseAdvancedReports: false,   // ❌ No reportes avanzados (no implementado)
    canUseFleetMode: false,         // ❌ No modo flotilla (no implementado)
    canUseAIAssistant: false,       // ❌ No IA (no implementado)
    hasPrioritySupport: false,      // ❌ Soporte estándar
  },
  [SubscriptionPlan.PRO]: {
    vehicles: 5,                    // 5 vehículos - cubre 95% usuarios personales
    maintenancePerMonth: 25,        // 25 mantenimientos/mes - suficiente para uso intensivo
    expensesPerMonth: 75,           // 75 gastos/mes - amplio para uso personal
    activeReminders: -1,            // ✅ Ilimitado
    historyMonths: -1,              // ✅ Historial completo
    photosPerRecord: 10,            // 10 fotos - documentación completa
    canExportPDF: true,             // ✅ Exportar PDF (IMPLEMENTADO)
    canExportExcel: false,          // ❌ No Excel (no implementado - solo PDF)
    canSync: false,                 // ❌ No sincronización (no implementado)
    canShareVehicles: false,        // ❌ No compartir (no implementado)
    canUseAdvancedReports: false,   // ❌ No reportes avanzados (no implementado)
    canUseFleetMode: false,         // ❌ No modo flotilla (no implementado)
    canUseAIAssistant: false,       // ❌ No IA (no implementado)
    hasPrioritySupport: false,      // ❌ Soporte estándar
  },
  [SubscriptionPlan.PREMIUM]: {
    vehicles: -1,                   // ✅ Ilimitado - para negocios
    maintenancePerMonth: -1,        // ✅ Ilimitado
    expensesPerMonth: -1,           // ✅ Ilimitado
    activeReminders: -1,            // ✅ Ilimitado
    historyMonths: -1,              // ✅ Ilimitado
    photosPerRecord: -1,            // ✅ Ilimitadas
    canExportPDF: true,             // ✅ Exportar PDF (IMPLEMENTADO)
    canExportExcel: false,          // ❌ No Excel (no implementado - solo PDF)
    canSync: false,                 // ❌ No sincronización (no implementado)
    canShareVehicles: false,        // ❌ No compartir (no implementado)
    canUseAdvancedReports: false,   // ❌ No reportes avanzados (no implementado)
    canUseFleetMode: false,         // ❌ No modo flotilla (no implementado)
    canUseAIAssistant: false,       // ❌ No IA (no implementado)
    hasPrioritySupport: true,       // ✅ Soporte prioritario
  },
};

// Información de precios (para mostrar en UI)
export const PLAN_PRICING = {
  [SubscriptionPlan.PRO]: {
    monthly: {
      price: '$4.99',
      priceValue: 4.99,
      period: 'mes',
    },
    yearly: {
      price: '$49.99',
      priceValue: 49.99,
      period: 'año',
      savings: 'Ahorra 17%',
      monthlyEquivalent: '$4.17/mes',
    },
  },
  [SubscriptionPlan.PREMIUM]: {
    monthly: {
      price: '$9.99',
      priceValue: 9.99,
      period: 'mes',
    },
    yearly: {
      price: '$99.99',
      priceValue: 99.99,
      period: 'año',
      savings: 'Ahorra 17%',
      monthlyEquivalent: '$8.33/mes',
    },
  },
};

// Features por plan (para mostrar en UI)
export const PLAN_FEATURES = {
  [SubscriptionPlan.FREE]: {
    name: 'Gratis',
    tagline: 'Pruébalo',
    color: '#6B7280',
    icon: '🚗',
    features: [
      '1 vehículo',
      '5 mantenimientos/mes',
      '10 gastos/mes',
      '3 recordatorios activos',
      'Historial de 3 meses',
      '1 foto por registro',
    ],
  },
  [SubscriptionPlan.PRO]: {
    name: 'Pro',
    tagline: 'Para entusiastas',
    color: '#1E88E5',
    icon: '⭐',
    features: [
      'Hasta 5 vehículos',
      '25 mantenimientos/mes',
      '75 gastos/mes',
      'Recordatorios ilimitados',
      'Exportar a PDF',
      'Historial completo',
    ],
  },
  [SubscriptionPlan.PREMIUM]: {
    name: 'Premium',
    tagline: 'Uso intensivo',
    color: '#FFD700',
    icon: '👑',
    badge: 'Popular',
    features: [
      'Vehículos ilimitados',
      'Mantenimientos ilimitados',
      'Gastos ilimitados',
      'Recordatorios ilimitados',
      'Exportar a PDF',
      'Historial completo',
      'Fotos ilimitadas',
    ],
  },
};

// Entitlements de RevenueCat
export const ENTITLEMENTS = {
  PRO: 'pro',
  PREMIUM: 'premium',
};


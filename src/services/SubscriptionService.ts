/**
 * Servicio de suscripciones usando RevenueCat
 */

import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  SubscriptionPlan,
  UserSubscription,
  ENTITLEMENTS,
  PLAN_LIMITS,
  PlanLimits,
} from '../types/subscription';

// Configuración de API Keys
const REVENUECAT_API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || 'appl_MIyVquEayqtpDbkhbIsYlQDjAnT',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || 'goog_PLACEHOLDER',
};

class SubscriptionService {
  private initialized = false;
  private currentUserSubscription: UserSubscription = {
    plan: SubscriptionPlan.FREE,
    isActive: false,
    willRenew: false,
  };

  /**
   * Inicializar RevenueCat
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    try {
      // Detectar si estamos en Expo Go
      const isExpoGo = Constants.appOwnership === 'expo';
      
      if (isExpoGo) {
        console.log('⚠️ Expo Go detectado - RevenueCat no disponible');
        console.log('💡 Para probar suscripciones, usa un development build');
        this.initialized = true; // Marcar como inicializado para no bloquear la app
        return;
      }

      const apiKey = Platform.OS === 'ios' 
        ? REVENUECAT_API_KEYS.ios 
        : REVENUECAT_API_KEYS.android;

      // Verificar que no sea un placeholder
      if (apiKey.includes('PLACEHOLDER')) {
        console.warn('⚠️ RevenueCat API Key no configurada - usando modo demo');
        this.initialized = true;
        return;
      }

      // Configurar RevenueCat
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Purchases.setLogLevel(LOG_LEVEL.WARN);
        await Purchases.configure({ apiKey });

        // Identificar usuario si existe
        if (userId) {
          await Purchases.logIn(userId);
        }

        // Cargar estado inicial
        await this.refreshSubscriptionStatus();

        this.initialized = true;
        console.log('✅ SubscriptionService initialized');
      }
    } catch (error) {
      console.error('❌ Error initializing SubscriptionService:', error);
      // No bloquear la app si falla RevenueCat
      this.initialized = true; // Marcar como inicializado en modo demo
    }
  }

  /**
   * Obtener el plan actual del usuario
   */
  getCurrentPlan(): SubscriptionPlan {
    return this.currentUserSubscription.plan;
  }

  /**
   * Obtener información completa de la suscripción
   */
  getUserSubscription(): UserSubscription {
    return { ...this.currentUserSubscription };
  }

  /**
   * Obtener límites del plan actual
   */
  getPlanLimits(): PlanLimits {
    return PLAN_LIMITS[this.currentUserSubscription.plan];
  }

  /**
   * Verificar si tiene acceso a una característica
   */
  hasFeature(feature: keyof PlanLimits): boolean {
    const limits = this.getPlanLimits();
    return limits[feature] as boolean;
  }

  /**
   * Verificar si puede agregar más elementos
   */
  canAdd(type: 'vehicles' | 'maintenance' | 'expenses' | 'reminders', currentCount: number): boolean {
    const limits = this.getPlanLimits();
    
    switch (type) {
      case 'vehicles':
        return limits.vehicles === -1 || currentCount < limits.vehicles;
      case 'maintenance':
        return limits.maintenancePerMonth === -1 || currentCount < limits.maintenancePerMonth;
      case 'expenses':
        return limits.expensesPerMonth === -1 || currentCount < limits.expensesPerMonth;
      case 'reminders':
        return limits.activeReminders === -1 || currentCount < limits.activeReminders;
      default:
        return false;
    }
  }

  /**
   * Refrescar estado de suscripción desde RevenueCat
   */
  async refreshSubscriptionStatus(): Promise<UserSubscription> {
    try {
      // Si no está inicializado o estamos en Expo Go, retornar FREE
      const isExpoGo = Constants.appOwnership === 'expo';
      if (!this.initialized || isExpoGo || Platform.OS === 'web') {
        return this.currentUserSubscription;
      }

      // Verificar que la API key no sea placeholder
      const apiKey = Platform.OS === 'ios' 
        ? REVENUECAT_API_KEYS.ios 
        : REVENUECAT_API_KEYS.android;
      
      if (apiKey.includes('PLACEHOLDER')) {
        return this.currentUserSubscription;
      }

      const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
      
      // Verificar entitlements activos
      const hasPremium = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM] !== undefined;
      const hasPro = customerInfo.entitlements.active[ENTITLEMENTS.PRO] !== undefined;

      let plan = SubscriptionPlan.FREE;
      let isActive = false;
      let expirationDate: string | undefined;
      let willRenew = false;
      let productId: string | undefined;

      if (hasPremium) {
        plan = SubscriptionPlan.PREMIUM;
        isActive = true;
        const entitlement = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];
        expirationDate = entitlement.expirationDate || undefined;
        willRenew = entitlement.willRenew;
        productId = entitlement.productIdentifier;
      } else if (hasPro) {
        plan = SubscriptionPlan.PRO;
        isActive = true;
        const entitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];
        expirationDate = entitlement.expirationDate || undefined;
        willRenew = entitlement.willRenew;
        productId = entitlement.productIdentifier;
      }

      this.currentUserSubscription = {
        plan,
        isActive,
        expirationDate,
        willRenew,
        productId,
        originalPurchaseDate: customerInfo.originalPurchaseDate || undefined,
      };

      console.log('📊 Subscription status refreshed:', this.currentUserSubscription);
      return this.currentUserSubscription;

    } catch (error) {
      console.error('❌ Error refreshing subscription status:', error);
      return this.currentUserSubscription;
    }
  }

  /**
   * Obtener ofertas disponibles
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        console.warn('⚠️ Offerings no disponibles en Expo Go');
        return null;
      }

      const apiKey = Platform.OS === 'ios' 
        ? REVENUECAT_API_KEYS.ios 
        : REVENUECAT_API_KEYS.android;
      
      if (apiKey.includes('PLACEHOLDER')) {
        console.warn('⚠️ Offerings no disponibles - API key no configurada');
        return null;
      }

      if (__DEV__) {
        console.log('📦 Obteniendo offerings de RevenueCat...');
      }
      const offerings = await Purchases.getOfferings();
      
      if (!offerings.current) {
        console.warn('⚠️ No hay offering actual configurado en RevenueCat');
        return null;
      }

      if (offerings.current.availablePackages.length === 0) {
        console.warn('⚠️ No hay productos disponibles en el offering');
        return null;
      }

      if (__DEV__) {
        console.log('✅ Offerings cargados:', offerings.current.availablePackages.length, 'productos');
      }
      return offerings.current;
    } catch (error: any) {
      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        // En Expo Go, los errores de RevenueCat son esperados
        if (__DEV__) {
          console.warn('⚠️ Error getting offerings en Expo Go (esperado)');
        }
      } else {
        console.error('❌ Error getting offerings:', error);
        if (__DEV__) {
          console.error('Error details:', {
            code: error.code,
            message: error.message,
            underlyingErrorMessage: error.underlyingErrorMessage,
          });
        }
      }
      return null;
    }
  }

  /**
   * Comprar un paquete
   */
  async purchasePackage(packageToPurchase: PurchasesPackage): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      // Validar que el paquete existe
      if (!packageToPurchase) {
        console.error('❌ No package provided');
        return {
          success: false,
          error: 'Paquete de suscripción no válido',
        };
      }

      console.log('🛒 Iniciando compra:', packageToPurchase.identifier);
      
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      console.log('✅ Compra exitosa:', packageToPurchase.identifier);
      
      // Actualizar estado local
      await this.refreshSubscriptionStatus();

      return {
        success: true,
        customerInfo,
      };
    } catch (error: any) {
      console.error('❌ Error purchasing package:', error);
      
      // Manejar cancelación del usuario
      if (error.userCancelled) {
        console.log('ℹ️ Usuario canceló la compra');
        return {
          success: false,
          error: 'Compra cancelada',
        };
      }

      // Manejar errores de red
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
        return {
          success: false,
          error: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
        };
      }

      // Manejar errores de producto no disponible
      if (error.code === 'PRODUCT_NOT_AVAILABLE_FOR_PURCHASE' || error.code === 'PRODUCT_ALREADY_PURCHASED') {
        return {
          success: false,
          error: 'Este producto no está disponible. Intenta restaurar tus compras.',
        };
      }

      // Manejar errores de pago
      if (error.code === 'PAYMENT_PENDING' || error.code === 'PURCHASE_INVALID') {
        return {
          success: false,
          error: 'No se pudo procesar el pago. Verifica tu método de pago en Ajustes de iOS.',
        };
      }

      // Error genérico con más información
      const errorMessage = error.message || error.localizedDescription || 'Error al procesar la compra';
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        underlyingErrorMessage: error.underlyingErrorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Restaurar compras
   */
  async restorePurchases(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    try {
      console.log('🔄 Restaurando compras...');
      const customerInfo = await Purchases.restorePurchases();
      
      // Actualizar estado local
      await this.refreshSubscriptionStatus();

      // Verificar si tiene suscripciones activas
      const hasActiveSubscription = Object.keys(customerInfo.entitlements.active).length > 0;
      
      if (hasActiveSubscription) {
        console.log('✅ Compras restauradas exitosamente');
      } else {
        console.log('ℹ️ No se encontraron compras activas');
      }

      return {
        success: true,
        customerInfo,
      };
    } catch (error: any) {
      console.error('❌ Error restoring purchases:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        underlyingErrorMessage: error.underlyingErrorMessage,
      });
      
      return {
        success: false,
        error: error.message || 'Error al restaurar compras',
      };
    }
  }

  /**
   * Identificar usuario (para sincronizar entre dispositivos)
   */
  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      await this.refreshSubscriptionStatus();
    } catch (error) {
      console.error('Error identifying user:', error);
    }
  }

  /**
   * Cerrar sesión (logout)
   */
  async logout(): Promise<void> {
    try {
      await Purchases.logOut();
      this.currentUserSubscription = {
        plan: SubscriptionPlan.FREE,
        isActive: false,
        willRenew: false,
      };
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  /**
   * Verificar si es elegible para trial
   */
  async isEligibleForTrial(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // Si nunca ha tenido una suscripción activa, es elegible
      return Object.keys(customerInfo.entitlements.all).length === 0;
    } catch (error) {
      console.error('Error checking trial eligibility:', error);
      return false;
    }
  }

  /**
   * Indica si alguna suscripción activa está en periodo de prueba gratuita
   */
  isTrialPeriod(customerInfo?: CustomerInfo): boolean {
    if (!customerInfo) return false;
    return Object.values(customerInfo.entitlements.active).some(
      (entitlement) => entitlement.periodType === 'TRIAL'
    );
  }

  /**
   * Obtener URL de gestión de suscripción
   */
  async getManagementURL(): Promise<string | null> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.managementURL || null;
    } catch (error) {
      console.error('Error getting management URL:', error);
      return null;
    }
  }

}

export default new SubscriptionService();


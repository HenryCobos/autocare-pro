/**
 * Contexto de suscripción para acceso global en la app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import SubscriptionService from '../services/SubscriptionService';
import {
  SubscriptionPlan,
  UserSubscription,
  PlanLimits,
} from '../types/subscription';

interface SubscriptionContextType {
  // Estado
  subscription: UserSubscription;
  isLoading: boolean;
  
  // Plan info
  currentPlan: SubscriptionPlan;
  planLimits: PlanLimits;
  isPro: boolean;
  isPremium: boolean;
  isFree: boolean;
  isActive: boolean;
  expirationDate: string | null;
  limits: {
    vehicles: { current: number; max: number };
    maintenance: { current: number; max: number };
    expenses: { current: number; max: number };
  };
  
  // Funciones
  refreshSubscription: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ success: boolean; error?: string }>;
  restorePurchases: () => Promise<{ success: boolean; error?: string }>;
  
  // Verificaciones
  hasFeature: (feature: keyof PlanLimits) => boolean;
  canAdd: (type: 'vehicles' | 'maintenance' | 'expenses' | 'reminders', currentCount: number) => boolean;
  getLimit: (type: 'vehicles' | 'maintenance' | 'expenses' | 'reminders') => number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<UserSubscription>({
    plan: SubscriptionPlan.FREE,
    isActive: false,
    willRenew: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar servicio de suscripciones
  useEffect(() => {
    initializeSubscription();
  }, []);

  // Refrescar silenciosamente cuando la app vuelve al primer plano
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        SubscriptionService.refreshSubscriptionStatus().then((sub) => {
          setSubscription(sub);
        });
      }
    };

    const listener = AppState.addEventListener('change', handleAppStateChange);
    return () => listener.remove();
  }, []);

  const initializeSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Inicializar RevenueCat
      await SubscriptionService.initialize();
      
      // Cargar estado de suscripción
      const userSub = await SubscriptionService.refreshSubscriptionStatus();
      setSubscription(userSub);
      
    } catch (error) {
      console.error('Error initializing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async () => {
    try {
      setIsLoading(true);
      const userSub = await SubscriptionService.refreshSubscriptionStatus();
      setSubscription(userSub);
    } catch (error) {
      console.error('Error refreshing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePackage = async (pkg: PurchasesPackage) => {
    try {
      const result = await SubscriptionService.purchasePackage(pkg);
      
      if (result.success) {
        // Actualizar estado local
        await refreshSubscription();
      }
      
      return result;
    } catch (error: any) {
      console.error('Error in purchasePackage:', error);
      return {
        success: false,
        error: error.message || 'Error al procesar la compra',
      };
    }
  };

  const restorePurchases = async () => {
    try {
      const result = await SubscriptionService.restorePurchases();
      
      if (result.success) {
        await refreshSubscription();
      }
      
      return result;
    } catch (error: any) {
      console.error('Error in restorePurchases:', error);
      return {
        success: false,
        error: error.message || 'Error al restaurar compras',
      };
    }
  };

  const hasFeature = (feature: keyof PlanLimits): boolean => {
    return SubscriptionService.hasFeature(feature);
  };

  const canAdd = (
    type: 'vehicles' | 'maintenance' | 'expenses' | 'reminders',
    currentCount: number
  ): boolean => {
    return SubscriptionService.canAdd(type, currentCount);
  };

  const getLimit = (type: 'vehicles' | 'maintenance' | 'expenses' | 'reminders'): number => {
    const limits = SubscriptionService.getPlanLimits();
    
    switch (type) {
      case 'vehicles':
        return limits.vehicles;
      case 'maintenance':
        return limits.maintenancePerMonth;
      case 'expenses':
        return limits.expensesPerMonth;
      case 'reminders':
        return limits.activeReminders;
      default:
        return 0;
    }
  };

  const value: SubscriptionContextType = {
    // Estado
    subscription,
    isLoading,
    
    // Plan info
    currentPlan: subscription.plan,
    planLimits: SubscriptionService.getPlanLimits(),
    isPro: subscription.plan === SubscriptionPlan.PRO && subscription.isActive,
    isPremium: subscription.plan === SubscriptionPlan.PREMIUM && subscription.isActive,
    isFree: subscription.plan === SubscriptionPlan.FREE || !subscription.isActive,
    isActive: subscription.isActive,
    expirationDate: subscription.expirationDate || null,
    limits: {
      vehicles: { current: 0, max: getLimit('vehicles') },
      maintenance: { current: 0, max: getLimit('maintenance') },
      expenses: { current: 0, max: getLimit('expenses') },
    },
    
    // Funciones
    refreshSubscription,
    purchasePackage,
    restorePurchases,
    
    // Verificaciones
    hasFeature,
    canAdd,
    getLimit,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  
  return context;
};

export default SubscriptionContext;


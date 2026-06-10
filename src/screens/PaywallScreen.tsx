/**
 * Pantalla de Paywall - Comparación y compra de planes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { Colors, Theme } from '../constants/Colors';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTikTok, TikTokEvent } from '../hooks/useTracking';
import SubscriptionService from '../services/SubscriptionService';
import { PLAN_FEATURES, PLAN_PRICING, SubscriptionPlan, SUBSCRIPTION_PRODUCTS } from '../types/subscription';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PaywallScreenProps {
  navigation: any;
  route?: any;
}

type PaidPlan = SubscriptionPlan.PRO | SubscriptionPlan.PREMIUM;

const PaywallScreen: React.FC<PaywallScreenProps> = ({ navigation, route }) => {
  const { currentPlan, refreshSubscription } = useSubscription();
  const { trackSubscription, trackViewContent, trackEvent, trackStartTrial } = useTikTok();
  const insets = useSafeAreaInsets();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  
  // Parámetros opcionales para personalizar el paywall
  const { 
    source, // De dónde viene: 'limit', 'settings', 'onboarding'
    limitType, // Qué límite alcanzó: 'vehicles', 'maintenance', etc.
    recommendedPlan, // Plan recomendado desde onboarding
  } = route?.params || {};

  // Determinar el plan inicial considerando el recommendedPlan primero
  const getInitialPlan = (): SubscriptionPlan => {
    // Si viene de onboarding con recomendación, usar esa
    if (recommendedPlan === 'premium') {
      if (__DEV__) {
        console.log('→ Seleccionando PREMIUM desde onboarding');
      }
      return SubscriptionPlan.PREMIUM;
    } else if (recommendedPlan === 'pro') {
      if (__DEV__) {
        console.log('→ Seleccionando PRO desde onboarding');
      }
      return SubscriptionPlan.PRO;
    }
    // Si no, usar lógica por defecto: si ya tiene Pro, mostrar Premium
    const defaultPlan = currentPlan === SubscriptionPlan.PRO 
      ? SubscriptionPlan.PREMIUM 
      : SubscriptionPlan.PRO;
    if (__DEV__) {
      console.log('→ Seleccionando plan por defecto:', defaultPlan);
    }
    return defaultPlan;
  };
  
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(getInitialPlan());
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const getProductId = (plan: SubscriptionPlan, period: 'monthly' | 'yearly'): string | null => {
    const packageMap: Record<string, string> = {
      'pro_monthly': SUBSCRIPTION_PRODUCTS.PRO_MONTHLY,
      'pro_yearly': SUBSCRIPTION_PRODUCTS.PRO_YEARLY,
      'premium_monthly': SUBSCRIPTION_PRODUCTS.PREMIUM_MONTHLY,
      'premium_yearly': SUBSCRIPTION_PRODUCTS.PREMIUM_YEARLY,
    };

    if (plan === SubscriptionPlan.FREE) return null;
    return packageMap[`${plan}_${period}`] || null;
  };

  const isPaidPlan = (plan: SubscriptionPlan): plan is PaidPlan => {
    return plan !== SubscriptionPlan.FREE;
  };

  const getPackageForPlanPeriod = (
    plan: SubscriptionPlan,
    period: 'monthly' | 'yearly'
  ): PurchasesPackage | null => {
    if (!offerings) return null;
    const productId = getProductId(plan, period);
    if (!productId) return null;

    return offerings.availablePackages.find(
      pkg => pkg.product.identifier === productId
    ) || null;
  };

  const getLocalizedPrice = (
    plan: SubscriptionPlan,
    period: 'monthly' | 'yearly'
  ): string => {
    if (!isPaidPlan(plan)) return '';

    const pkg = getPackageForPlanPeriod(plan, period);
    if (pkg?.product?.priceString) {
      return pkg.product.priceString;
    }
    return PLAN_PRICING[plan][period].price;
  };

  const getLocalizedMonthlyEquivalent = (plan: PaidPlan): string | null => {
    const yearlyPackage = getPackageForPlanPeriod(plan, 'yearly');
    const yearlyPrice = yearlyPackage?.product?.price;
    const currencyCode = yearlyPackage?.product?.currencyCode;

    if (typeof yearlyPrice === 'number' && currencyCode) {
      try {
        const monthlyEquivalent = yearlyPrice / 12;
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: currencyCode,
          maximumFractionDigits: 2,
        }).format(monthlyEquivalent);
      } catch {
        // Fallback al valor estático si falla la localización
      }
    }

    return PLAN_PRICING[plan].yearly.monthlyEquivalent || null;
  };

  const getSavingsText = (plan: PaidPlan): string | null => {
    const monthlyPackage = getPackageForPlanPeriod(plan, 'monthly');
    const yearlyPackage = getPackageForPlanPeriod(plan, 'yearly');

    const monthlyPrice = monthlyPackage?.product?.price;
    const yearlyPrice = yearlyPackage?.product?.price;

    if (typeof monthlyPrice === 'number' && typeof yearlyPrice === 'number' && monthlyPrice > 0) {
      const yearlyAtMonthlyRate = monthlyPrice * 12;
      const savingsPercent = Math.max(
        0,
        Math.round(((yearlyAtMonthlyRate - yearlyPrice) / yearlyAtMonthlyRate) * 100)
      );

      if (savingsPercent > 0) {
        return `Ahorra ${savingsPercent}%`;
      }
    }

    return PLAN_PRICING[plan].yearly.savings || null;
  };

  useEffect(() => {
    loadOfferings();
    
    // Trackear visualización del paywall
    trackViewContent('paywall', 'subscription_plans', {
      source,
      limit_type: limitType,
      recommended_plan: recommendedPlan,
    });
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const isExpoGo = Constants.appOwnership === 'expo';
      const offer = await SubscriptionService.getOfferings();
      
      if (!offer) {
        // En Expo Go, esto es esperado, solo mostrar warning
        if (isExpoGo) {
          if (__DEV__) {
            console.warn('⚠️ Offerings no disponibles en Expo Go (esperado)');
          }
          // No mostrar alert en Expo Go, es normal
        } else {
          console.warn('⚠️ No offerings available');
          Alert.alert(
            'No disponible',
            'Los planes de suscripción no están disponibles en este momento. Por favor, intenta más tarde.',
            [
              {
                text: 'Volver',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
        return;
      }

      if (offer.availablePackages.length === 0) {
        console.warn('⚠️ No packages available');
        if (!isExpoGo) {
          Alert.alert(
            'No disponible',
            'No hay productos disponibles en este momento. Por favor, intenta más tarde.',
            [
              {
                text: 'Volver',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
        return;
      }

      setOfferings(offer);
      if (__DEV__) {
        console.log('✅ Offerings loaded successfully');
      }
    } catch (error) {
      const isExpoGo = Constants.appOwnership === 'expo';
      if (isExpoGo) {
        console.warn('⚠️ Error loading offerings en Expo Go (esperado):', error);
      } else {
        console.error('❌ Error loading offerings:', error);
        Alert.alert(
          'Error',
          'No se pudieron cargar los planes disponibles. Verifica tu conexión a internet e intenta de nuevo.',
          [
            {
              text: 'Reintentar',
              onPress: () => loadOfferings(),
            },
            {
              text: 'Volver',
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getPackageForSelection = (): PurchasesPackage | null => {
    if (!offerings) return null;

    const packageMap: Record<string, string> = {
      'pro_monthly': SUBSCRIPTION_PRODUCTS.PRO_MONTHLY,
      'pro_yearly': SUBSCRIPTION_PRODUCTS.PRO_YEARLY,
      'premium_monthly': SUBSCRIPTION_PRODUCTS.PREMIUM_MONTHLY,
      'premium_yearly': SUBSCRIPTION_PRODUCTS.PREMIUM_YEARLY,
    };

    const identifier = `${selectedPlan}_${selectedPeriod}`;
    const productId = packageMap[identifier];

    return offerings.availablePackages.find(
      pkg => pkg.product.identifier === productId
    ) || null;
  };

  const handlePurchase = async () => {
    // Validar que tenemos offerings
    if (!offerings) {
      Alert.alert(
        'Error',
        'Los planes no están disponibles. Por favor, recarga la pantalla.',
        [
          {
            text: 'Recargar',
            onPress: () => loadOfferings(),
          },
        ]
      );
      return;
    }

    const packageToPurchase = getPackageForSelection();
    
    if (!packageToPurchase) {
      Alert.alert(
        'Plan no disponible',
        'El plan seleccionado no está disponible en este momento. Por favor, intenta con otro plan o más tarde.',
        [
          {
            text: 'Recargar Planes',
            onPress: () => loadOfferings(),
          },
          {
            text: 'Cancelar',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    try {
      setPurchasing(true);
      console.log('🛒 Iniciando compra desde UI:', packageToPurchase.identifier);

      // Trackear checkout al iniciar el flujo (antes de comprar)
      await trackEvent(TikTokEvent.INITIATE_CHECKOUT, {
        content_type: 'subscription',
        content_name: `${selectedPlan}_${selectedPeriod}`,
        value: packageToPurchase.product.price,
        currency: packageToPurchase.product.currencyCode,
      });

      // Si es anual, registrar intento de trial
      if (selectedPeriod === 'yearly') {
        await trackStartTrial({
          content_type: 'subscription_trial',
          content_name: `${selectedPlan}_yearly`,
        });
      }
      
      const result = await SubscriptionService.purchasePackage(packageToPurchase);

      if (result.success) {
        console.log('✅ Compra completada exitosamente');
        await refreshSubscription();
        
        // Trackear la suscripción en TikTok
        const planType = selectedPlan === SubscriptionPlan.PRO ? 'pro' : 'premium';
        const price = packageToPurchase.product.price;
        const currency = packageToPurchase.product.currencyCode;
        
        await trackSubscription(
          selectedPeriod === 'monthly' ? 'monthly' : 'annual',
          price,
          currency
        );
        
        Alert.alert(
          '¡Bienvenido! 🎉',
          `Ahora tienes acceso a ${selectedPlan === SubscriptionPlan.PRO ? 'Pro' : 'Premium'}`,
          [
            {
              text: 'Comenzar',
              onPress: () => {
                // Si viene desde onboarding, navegar a MainTabs; si no, volver atrás
                if (source === 'onboarding') {
                  navigation.replace('MainTabs');
                } else {
                  navigation.goBack();
                }
              },
            },
          ]
        );
      } else if (result.error && !result.error.includes('cancelada')) {
        console.error('❌ Error en la compra:', result.error);
        Alert.alert('Error de Compra', result.error);
      }
    } catch (error: any) {
      console.error('❌ Error inesperado en handlePurchase:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo completar la compra. Por favor, intenta de nuevo.'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      console.log('🔄 Iniciando restauración de compras desde UI');
      
      const result = await SubscriptionService.restorePurchases();

      if (result.success) {
        await refreshSubscription();
        
        // Verificar si realmente tiene una suscripción activa después de restaurar
        const updatedSubscription = SubscriptionService.getUserSubscription();
        
        if (updatedSubscription.isActive) {
          console.log('✅ Compras restauradas con suscripción activa');
          Alert.alert(
            'Éxito',
            'Tus compras han sido restauradas correctamente',
            [
              {
                text: 'Continuar',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        } else {
          console.log('ℹ️ No se encontraron compras activas');
          Alert.alert(
            'Sin compras',
            'No se encontraron compras previas para restaurar. Si acabas de realizar una compra, espera unos minutos e intenta de nuevo.'
          );
        }
      } else {
        console.error('❌ Error restaurando compras:', result.error);
        Alert.alert('Error', result.error || 'No se pudieron restaurar las compras');
      }
    } catch (error: any) {
      console.error('❌ Error inesperado en handleRestore:', error);
      Alert.alert(
        'Error',
        'No se pudieron restaurar las compras. Por favor, intenta de nuevo.'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const renderHeader = () => {
    let title = '✨ Desbloquea Todo el Potencial';
    let subtitle = 'Elige el plan perfecto para ti';

    // Si viene desde onboarding, personalizar según el plan recomendado
    if (source === 'onboarding') {
      if (recommendedPlan === 'pro') {
        title = '🚗 Plan Pro - Perfecto para Ti';
        subtitle = 'Gestiona hasta 5 vehículos sin límites';
      } else if (recommendedPlan === 'premium') {
        title = '👑 Plan Premium - Lo Mejor';
        subtitle = 'Gestión ilimitada de flotilla completa';
      }
    } else if (currentPlan === SubscriptionPlan.PRO) {
      // Si ya tiene Pro, personalizar mensajes para Premium
      title = '👑 Actualiza a Premium';
      subtitle = 'Desbloquea uso ilimitado';
      
      if (source === 'limit') {
        if (limitType === 'vehicles') {
          title = '🚗 ¡Vehículos Ilimitados!';
          subtitle = 'Gestiona toda tu flotilla con Premium';
        } else if (limitType === 'maintenance') {
          title = '🔧 Sin Límites de Mantenimientos';
          subtitle = 'Registros ilimitados con Premium';
        } else if (limitType === 'expenses') {
          title = '💰 Sin Límites de Gastos';
          subtitle = 'Todo ilimitado con Premium';
        }
      }
    } else if (source === 'limit') {
      // Mensajes para usuarios Free
      if (limitType === 'vehicles') {
        title = '🚗 ¡Necesitas Más Vehículos!';
        subtitle = 'Gestiona hasta 5 con Pro o ilimitados con Premium';
      } else if (limitType === 'maintenance') {
        title = '🔧 Límite de Mantenimientos';
        subtitle = 'Registros ilimitados con Pro o Premium';
      } else if (limitType === 'expenses') {
        title = '💰 Límite de Gastos';
        subtitle = 'Gastos ilimitados con Pro o Premium';
      } else if (limitType === 'reminders') {
        title = '🔔 Más Recordatorios';
        subtitle = 'Recordatorios ilimitados con Pro o Premium';
      } else if (limitType === 'export') {
        title = '📊 Exporta tus Datos';
        subtitle = 'PDF profesional disponible en Pro y Premium';
      }
    }

    return (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
    );
  };

  const renderPlanCard = (plan: SubscriptionPlan) => {
    if (plan === SubscriptionPlan.FREE) return null;

    const features = PLAN_FEATURES[plan];
    const paidPlan = plan as PaidPlan;
    const isSelected = selectedPlan === plan;
    const isCurrent = currentPlan === plan;
    const isRecommendedFromOnboarding =
      source === 'onboarding' &&
      ((recommendedPlan === 'pro' && plan === SubscriptionPlan.PRO) ||
        (recommendedPlan === 'premium' && plan === SubscriptionPlan.PREMIUM));

    return (
      <TouchableOpacity
        key={plan}
        style={[
          styles.planCard,
          isSelected && styles.planCardSelected,
          isCurrent && styles.planCardCurrent,
        ]}
        onPress={() => setSelectedPlan(plan)}
        disabled={isCurrent}
      >
        {'badge' in features && features.badge && (
          <View style={[styles.badge, { backgroundColor: features.color }]}>
            <Text style={styles.badgeText}>{features.badge}</Text>
          </View>
        )}

        {isRecommendedFromOnboarding && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedBadgeText}>Recomendado para ti</Text>
          </View>
        )}

        {isCurrent && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>Plan Actual</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <Text style={styles.planIcon}>{features.icon}</Text>
          <Text style={styles.planName}>{features.name}</Text>
          <Text style={styles.planTagline}>{features.tagline}</Text>
        </View>

        <View style={styles.planPricing}>
          <Text style={styles.planPrice}>
            {getLocalizedPrice(plan, selectedPeriod)}
          </Text>
          <Text style={styles.planPeriod}>
            /{PLAN_PRICING[paidPlan][selectedPeriod].period}
          </Text>
        </View>

        {selectedPeriod === 'yearly' && getSavingsText(paidPlan) && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsText}>{getSavingsText(paidPlan)}</Text>
          </View>
        )}

        {selectedPeriod === 'yearly' && getLocalizedMonthlyEquivalent(paidPlan) && (
          <Text style={styles.monthlyEquivalentText}>
            Equivale a {getLocalizedMonthlyEquivalent(paidPlan)}/mes
          </Text>
        )}

        <View style={styles.features}>
          {features.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons 
                name="checkmark-circle" 
                size={16} 
                color={features.color} 
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <TouchableOpacity
        style={[
          styles.periodButton,
          selectedPeriod === 'monthly' && styles.periodButtonActive,
        ]}
        onPress={() => setSelectedPeriod('monthly')}
      >
        <Text
          style={[
            styles.periodButtonText,
            selectedPeriod === 'monthly' && styles.periodButtonTextActive,
          ]}
        >
          Mensual
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.periodButton,
          selectedPeriod === 'yearly' && styles.periodButtonActive,
        ]}
        onPress={() => setSelectedPeriod('yearly')}
      >
        <Text
          style={[
            styles.periodButtonText,
            selectedPeriod === 'yearly' && styles.periodButtonTextActive,
          ]}
        >
          Anual
        </Text>
        <View style={styles.savingsPill}>
          <Text style={styles.savingsPillText}>Ahorra 17%</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando planes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.floatingCloseButton, { top: insets.top + 8 }]}
        onPress={() => {
          // Si viene desde onboarding, navegar a MainTabs; si no, volver atrás
          if (source === 'onboarding') {
            navigation.replace('MainTabs');
          } else {
            navigation.goBack();
          }
        }}
      >
        <Ionicons name="close" size={28} color={Colors.text} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}

        {renderPeriodSelector()}

        <View style={styles.plansContainer}>
          {/* Si viene desde onboarding, mostrar ambos planes y mantener recomendación */}
          {source === 'onboarding' ? (
            recommendedPlan === 'premium' ? (
              <>
                {renderPlanCard(SubscriptionPlan.PREMIUM)}
                {renderPlanCard(SubscriptionPlan.PRO)}
              </>
            ) : (
              <>
                {renderPlanCard(SubscriptionPlan.PRO)}
                {renderPlanCard(SubscriptionPlan.PREMIUM)}
              </>
            )
          ) : (
            <>
              {/* De lo contrario, mostrar planes superiores al actual */}
              {currentPlan === SubscriptionPlan.FREE && renderPlanCard(SubscriptionPlan.PRO)}
              {currentPlan !== SubscriptionPlan.PREMIUM && renderPlanCard(SubscriptionPlan.PREMIUM)}
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Button
            title={
              currentPlan === selectedPlan
                ? 'Plan Actual'
                : selectedPeriod === 'yearly'
                ? '🎁 Comenzar Prueba Gratis 3 Días'
                : `Suscribirse a ${selectedPlan === SubscriptionPlan.PRO ? 'Pro' : 'Premium'}`
            }
            onPress={handlePurchase}
            loading={purchasing}
            disabled={currentPlan === selectedPlan}
            style={styles.purchaseButton}
          />

          <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
            <Text style={styles.restoreText}>Restaurar compras</Text>
          </TouchableOpacity>

          {source === 'onboarding' && (
            <TouchableOpacity 
              onPress={() => navigation.replace('MainTabs')}
              style={styles.skipButton}
            >
              <Text style={styles.skipButtonText}>
                O continuar con el plan gratuito
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.legal}>
            <Text style={styles.legalText}>
              {selectedPeriod === 'yearly' && '• 3 días de prueba gratis, luego '}
              {isPaidPlan(selectedPlan) && (
                <>
                  {getLocalizedPrice(selectedPlan, selectedPeriod)}/{PLAN_PRICING[selectedPlan][selectedPeriod].period}
                </>
              )}
              {selectedPeriod === 'yearly' && '.'}
              {'\n'}• La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del período actual.
              {'\n'}• Gestiona o cancela tu suscripción desde Ajustes de iOS → Apple ID → Suscripciones.
            </Text>
            
            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => Linking.openURL('https://henrycobos.github.io/documentos-legales-autocare-pro/privacy.html')}>
                <Text style={styles.legalLink}>Privacidad</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}> • </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://henrycobos.github.io/documentos-legales-autocare-pro/terms.html')}>
                <Text style={styles.legalLink}>Términos</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}> • </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://henrycobos.github.io/documentos-legales-autocare-pro/eula.html')}>
                <Text style={styles.legalLink}>EULA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Theme.spacing.md,
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: Theme.spacing.xxl,
  },
  header: {
    padding: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    alignItems: 'center',
  },
  floatingCloseButton: {
    position: 'absolute',
    right: Theme.spacing.md,
    zIndex: 50,
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.lg,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.md,
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodButtonTextActive: {
    color: Colors.primary,
  },
  savingsPill: {
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  savingsPillText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  plansContainer: {
    paddingHorizontal: Theme.spacing.md,
    gap: Theme.spacing.md,
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 3,
  },
  planCardCurrent: {
    opacity: 0.6,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.md,
  },
  badgeText: {
    color: Colors.white,
    fontSize: Theme.fontSize.sm,
    fontWeight: 'bold',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    left: Theme.spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.md,
  },
  recommendedBadgeText: {
    color: Colors.white,
    fontSize: Theme.fontSize.xs,
    fontWeight: 'bold',
  },
  currentBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    backgroundColor: Colors.success,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
  },
  currentBadgeText: {
    color: Colors.white,
    fontSize: Theme.fontSize.xs,
    fontWeight: 'bold',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  planIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  planName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  planTagline: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  savingsBadge: {
    alignSelf: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.sm,
  },
  savingsText: {
    color: Colors.success,
    fontSize: Theme.fontSize.xs,
    fontWeight: 'bold',
  },
  monthlyEquivalentText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.sm,
    marginBottom: Theme.spacing.sm,
    fontWeight: '500',
  },
  features: {
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
  },
  purchaseButton: {
    marginBottom: Theme.spacing.md,
  },
  restoreButton: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: Theme.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
  },
  skipButtonText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  legal: {
    marginTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.sm,
    alignItems: 'center',
    gap: Theme.spacing.md,
  },
  legalText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  legalLink: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  legalSeparator: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
});

export default PaywallScreen;


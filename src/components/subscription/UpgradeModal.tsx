/**
 * Modal de Upgrade - Se muestra cuando el usuario alcanza límites del plan gratuito
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../../constants/Colors';
import { SubscriptionPlan, PLAN_LIMITS, PLAN_PRICING, SUBSCRIPTION_PRODUCTS } from '../../types/subscription';
import { useSubscription } from '../../contexts/SubscriptionContext';
import SubscriptionService from '../../services/SubscriptionService';
import { TikTokAnalyticsService, TikTokCustomEvent } from '../../services/TikTokAnalyticsService';
import Button from '../common/Button';

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: (plan: SubscriptionPlan) => void; // Ahora recibe el plan seleccionado
  limitType: 'vehicles' | 'maintenance' | 'expenses' | 'reminders' | 'export' | 'reports';
  currentCount?: number;
  maxCount?: number;
}

type PaidPlan = SubscriptionPlan.PRO | SubscriptionPlan.PREMIUM;

const LIMIT_INFO = {
  vehicles: {
    icon: '🚗',
    title: '¡Necesitas Más Vehículos!',
    description: 'El plan gratuito incluye solo 1 vehículo. Actualiza para gestionar toda tu flotilla.',
    benefits: [
      'Hasta 5 vehículos con Pro',
      'Vehículos ilimitados con Premium',
      'Historial completo por vehículo',
    ],
  },
  maintenance: {
    icon: '🔧',
    title: '¡Límite de Mantenimientos!',
    description: 'Has alcanzado el límite de 5 mantenimientos este mes.',
    benefits: [
      'Pro: 25 mantenimientos/mes',
      'Premium: Mantenimientos ilimitados',
      'Historial completo',
    ],
  },
  expenses: {
    icon: '💰',
    title: '¡Límite de Gastos Alcanzado!',
    description: 'Has alcanzado el límite de 10 gastos este mes.',
    benefits: [
      'Pro: 75 gastos/mes',
      'Premium: Gastos ilimitados',
      'Exportar a PDF',
    ],
  },
  reminders: {
    icon: '🔔',
    title: '¡Más Recordatorios!',
    description: 'El plan gratuito incluye solo 3 recordatorios activos.',
    benefits: [
      'Recordatorios ilimitados',
      'Notificaciones personalizadas',
      'Alertas por kilometraje',
      'Alertas por fecha',
    ],
  },
  export: {
    icon: '📊',
    title: 'Exportación de Datos',
    description: 'Exporta tu información en PDF con planes Pro o Premium.',
    benefits: [
      'Exportar a PDF profesional',
      'Ideal para impuestos y reventa',
      'Historial completo',
    ],
  },
  reports: {
    icon: '📈',
    title: 'Reportes Avanzados',
    description: 'Accede a análisis detallados y reportes personalizados.',
    benefits: [
      'Reportes mensuales y anuales',
      'Análisis de costos',
      'Gráficos avanzados',
    ],
  },
};

// Beneficios específicos por plan
const getPlanBenefits = (plan: SubscriptionPlan) => {
  const limits = PLAN_LIMITS[plan];
  
  if (plan === SubscriptionPlan.PRO) {
    return [
      `Hasta ${limits.vehicles} vehículos`,
      `${limits.maintenancePerMonth} mantenimientos/mes`,
      `${limits.expensesPerMonth} gastos/mes`,
      'Exportar a PDF',
      'Historial completo',
    ];
  } else if (plan === SubscriptionPlan.PREMIUM) {
    return [
      'Vehículos ilimitados',
      'Mantenimientos ilimitados',
      'Gastos ilimitados',
      'Exportar a PDF',
      'Historial completo',
    ];
  }
  
  return [];
};

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  limitType,
  currentCount,
  maxCount,
}) => {
  const { currentPlan, refreshSubscription } = useSubscription();
  const info = LIMIT_INFO[limitType];
  const [purchasingPlan, setPurchasingPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [offerings, setOfferings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const limits = PLAN_LIMITS[currentPlan];

  const getProductId = (plan: SubscriptionPlan, period: 'monthly' | 'yearly'): string | null => {
    const packageMap: Record<string, string> = {
      'pro_monthly': SUBSCRIPTION_PRODUCTS.PRO_MONTHLY,
      'pro_yearly': SUBSCRIPTION_PRODUCTS.PRO_YEARLY,
      'premium_monthly': SUBSCRIPTION_PRODUCTS.PREMIUM_MONTHLY,
      'premium_yearly': SUBSCRIPTION_PRODUCTS.PREMIUM_YEARLY,
    };

    return packageMap[`${plan}_${period}`] || null;
  };

  const getLocalizedPrice = (plan: PaidPlan, period: 'monthly' | 'yearly'): string => {
    const productId = getProductId(plan, period);
    const pkg = offerings?.availablePackages?.find(
      (item: any) => item?.product?.identifier === productId
    );

    if (pkg?.product?.priceString) {
      return pkg.product.priceString;
    }

    return PLAN_PRICING[plan][period].price;
  };

  useEffect(() => {
    if (visible) {
      loadOfferings();
      TikTokAnalyticsService.trackCustomEvent(TikTokCustomEvent.PAYWALL_LIMIT_REACHED, {
        content_type: 'limit',
        content_id: limitType,
      });
    }
  }, [visible]);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const offer = await SubscriptionService.getOfferings();
      setOfferings(offer);
    } catch (error) {
      console.error('Error loading offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (plan: SubscriptionPlan) => {
    if (!offerings) {
      Alert.alert('Error', 'No se pudieron cargar los planes');
      return;
    }

    const packageMap: Record<string, string> = {
      'pro_monthly': SUBSCRIPTION_PRODUCTS.PRO_MONTHLY,
      'pro_yearly': SUBSCRIPTION_PRODUCTS.PRO_YEARLY,
      'premium_monthly': SUBSCRIPTION_PRODUCTS.PREMIUM_MONTHLY,
      'premium_yearly': SUBSCRIPTION_PRODUCTS.PREMIUM_YEARLY,
    };

    const identifier = `${plan}_${selectedPeriod}`;
    const productId = packageMap[identifier];
    const packageToPurchase = offerings.availablePackages.find(
      (pkg: any) => pkg.product.identifier === productId
    );

    if (!packageToPurchase) {
      Alert.alert('Error', 'Plan no disponible');
      return;
    }

    try {
      setPurchasingPlan(plan);
      const price = packageToPurchase.product.price;
      const currency = packageToPurchase.product.currencyCode;

      await TikTokAnalyticsService.trackCheckout(price, currency, productId);

      const result = await SubscriptionService.purchasePackage(packageToPurchase);

      if (result.success) {
        await refreshSubscription();
        await TikTokAnalyticsService.trackSubscriptionStarted({
          isTrial: SubscriptionService.isTrialPeriod(result.customerInfo),
          value: price,
          currency,
          contentId: productId,
        });
        onClose();
        Alert.alert(
          '¡Bienvenido! 🎉',
          `Ahora tienes acceso a ${plan === SubscriptionPlan.PRO ? 'Pro' : 'Premium'}`
        );
      } else if (result.error && !result.error.includes('cancelada')) {
        Alert.alert('Error', result.error);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo completar la compra');
    } finally {
      setPurchasingPlan(null);
    }
  };

  // Determinar título según el plan actual
  const getTitle = () => {
    if (currentPlan === SubscriptionPlan.PRO) {
      return '👑 Actualiza a Premium:';
    }
    return '✨ Desbloquea con Pro o Premium:';
  };

  // Obtener descripción dinámica según el plan actual
  const getDescription = () => {
    if (limitType === 'vehicles') {
      const limit = limits.vehicles;
      if (currentPlan === SubscriptionPlan.PRO) {
        return `El plan Pro incluye hasta ${limit} vehículos. Actualiza a Premium para vehículos ilimitados.`;
      }
      return `El plan gratuito incluye solo ${limit} vehículo. Actualiza para gestionar toda tu flotilla.`;
    } else if (limitType === 'maintenance') {
      const limit = limits.maintenancePerMonth;
      return `Has alcanzado el límite de ${limit} mantenimientos este mes.`;
    } else if (limitType === 'expenses') {
      const limit = limits.expensesPerMonth;
      return `Has alcanzado el límite de ${limit} gastos este mes.`;
    } else if (limitType === 'reminders') {
      const limit = limits.activeReminders;
      return `Has alcanzado el límite de ${limit} recordatorios activos.`;
    }
    return info.description;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Text style={styles.icon}>{info.icon}</Text>
            
            <Text style={styles.title}>{info.title}</Text>
            
            <Text style={styles.description}>{getDescription()}</Text>

            {currentCount !== undefined && maxCount !== undefined && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${(currentCount / maxCount) * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {currentCount} / {maxCount}
                </Text>
              </View>
            )}

            {/* Selector de Período */}
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'monthly' && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod('monthly')}
                disabled={loading || purchasingPlan !== null}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'monthly' && styles.periodButtonTextActive,
                ]}>
                  Mensual
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodButton,
                  selectedPeriod === 'yearly' && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod('yearly')}
                disabled={loading || purchasingPlan !== null}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === 'yearly' && styles.periodButtonTextActive,
                ]}>
                  Anual
                </Text>
                {selectedPeriod === 'yearly' && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Ahorra 17%</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.plansTitle}>{getTitle()}</Text>

            {/* Plan Pro - Solo mostrar si está en FREE */}
            {currentPlan === SubscriptionPlan.FREE && (
              <View style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Pro</Text>
                  <View style={styles.planPricing}>
                    <Text style={styles.planPrice}>
                      {getLocalizedPrice(SubscriptionPlan.PRO, selectedPeriod)}
                    </Text>
                    <Text style={styles.planPeriod}>
                      /{PLAN_PRICING[SubscriptionPlan.PRO][selectedPeriod].period}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.planBenefits}>
                  {getPlanBenefits(SubscriptionPlan.PRO).map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={Colors.success} 
                      />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                <Button
                  title={purchasingPlan === SubscriptionPlan.PRO ? "Procesando..." : selectedPeriod === 'yearly' ? "🎁 Prueba Gratis 3 Días" : "Suscribirse a Pro"}
                  onPress={() => handlePurchase(SubscriptionPlan.PRO)}
                  variant="outline"
                  loading={purchasingPlan === SubscriptionPlan.PRO}
                  disabled={purchasingPlan !== null || loading}
                  style={styles.planButton}
                />
              </View>
            )}

            {/* Plan Premium - Siempre mostrar (a menos que ya sea Premium) */}
            {currentPlan !== SubscriptionPlan.PREMIUM && (
              <View style={[styles.planCard, styles.premiumCard]}>
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>Popular</Text>
                </View>
                
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>Premium</Text>
                  <View style={styles.planPricing}>
                    <Text style={styles.planPrice}>
                      {getLocalizedPrice(SubscriptionPlan.PREMIUM, selectedPeriod)}
                    </Text>
                    <Text style={styles.planPeriod}>
                      /{PLAN_PRICING[SubscriptionPlan.PREMIUM][selectedPeriod].period}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.planBenefits}>
                  {getPlanBenefits(SubscriptionPlan.PREMIUM).map((benefit, index) => (
                    <View key={index} style={styles.benefitRow}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={Colors.warning} 
                      />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                <Button
                  title={purchasingPlan === SubscriptionPlan.PREMIUM ? "Procesando..." : selectedPeriod === 'yearly' ? "🎁 Prueba Gratis 3 Días" : "Suscribirse a Premium"}
                  onPress={() => handlePurchase(SubscriptionPlan.PREMIUM)}
                  loading={purchasingPlan === SubscriptionPlan.PREMIUM}
                  disabled={purchasingPlan !== null || loading}
                  style={styles.planButton}
                />
              </View>
            )}

            <TouchableOpacity onPress={onClose} style={styles.laterButton}>
              <Text style={styles.laterText}>Tal vez después</Text>
            </TouchableOpacity>

            {/* Información Legal Requerida por Apple */}
            <View style={styles.legalSection}>
              <Text style={styles.legalText}>
                • {selectedPeriod === 'yearly' ? '3 días de prueba gratis.' : 'Facturación mensual.'}
                {'\n'}• La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes del final del período.
                {'\n'}• Gestiona tu suscripción desde Ajustes de iOS → Apple ID → Suscripciones.
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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: Theme.spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.lg,
    right: Theme.spacing.lg,
    zIndex: 10,
  },
  content: {
    padding: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
  },
  icon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  description: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
  progressContainer: {
    marginBottom: Theme.spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.warning,
    borderRadius: Theme.borderRadius.md,
  },
  progressText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  plansTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.lg,
    marginTop: Theme.spacing.md,
  },
  planCard: {
    backgroundColor: Colors.background,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    position: 'relative',
  },
  premiumCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.md,
    zIndex: 10,
  },
  popularText: {
    color: Colors.white,
    fontSize: Theme.fontSize.xs,
    fontWeight: 'bold',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  planName: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  planBenefits: {
    marginBottom: Theme.spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  benefitText: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Colors.text,
  },
  planButton: {
    marginTop: Theme.spacing.sm,
  },
  laterButton: {
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
  },
  laterText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
  },
  legalSection: {
    marginTop: Theme.spacing.xl,
    paddingTop: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.lg,
    padding: 4,
    marginBottom: Theme.spacing.lg,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    position: 'relative',
  },
  periodButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodButtonText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: Colors.primary,
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  savingsText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: 'bold',
  },
});

export default UpgradeModal;


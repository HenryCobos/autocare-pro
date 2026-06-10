/**
 * Pantalla de Gestión de Suscripción
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PLAN_FEATURES, SubscriptionPlan } from '../types/subscription';
import SubscriptionService from '../services/SubscriptionService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface SubscriptionManagementScreenProps {
  navigation: any;
}

const SubscriptionManagementScreen: React.FC<SubscriptionManagementScreenProps> = ({ 
  navigation 
}) => {
  const { 
    currentPlan, 
    isActive, 
    expirationDate, 
    refreshSubscription,
    limits,
  } = useSubscription();
  
  const [restoring, setRestoring] = useState(false);

  const planFeatures = PLAN_FEATURES[currentPlan];

  const handleUpgrade = () => {
    navigation.navigate('Paywall', { source: 'settings' });
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      const result = await SubscriptionService.restorePurchases();

      if (result.success) {
        await refreshSubscription();
        Alert.alert('Éxito', 'Compras restauradas correctamente');
      } else {
        Alert.alert('Info', 'No se encontraron compras previas');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron restaurar las compras');
    } finally {
      setRestoring(false);
    }
  };

  const handleManageSubscription = () => {
    const url = Platform.select({
      ios: 'https://apps.apple.com/account/subscriptions',
      android: 'https://play.google.com/store/account/subscriptions',
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderPlanCard = () => (
    <Card style={styles.planCard}>
      <View style={styles.planHeader}>
        <View style={styles.planIconContainer}>
          <Text style={styles.planIcon}>{planFeatures.icon}</Text>
        </View>
        <View style={styles.planInfo}>
          <View style={styles.planNameRow}>
            <Text style={styles.planName}>{planFeatures.name}</Text>
            {isActive && (
              <View style={[styles.statusBadge, { backgroundColor: Colors.success }]}>
                <Text style={styles.statusText}>Activo</Text>
              </View>
            )}
          </View>
          <Text style={styles.planTagline}>{planFeatures.tagline}</Text>
          {isActive && expirationDate && (
            <View style={styles.expirationInfo}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.expirationText}>
                Renovación: {formatDate(expirationDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {currentPlan === SubscriptionPlan.FREE && (
        <View style={styles.upgradePrompt}>
          <Button
            title="Ver Planes"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          />
        </View>
      )}
    </Card>
  );

  const renderLimits = () => {
    if (currentPlan !== SubscriptionPlan.FREE) {
      return (
        <View style={styles.accessBanner}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.accessText}>
            Tienes acceso a todas las funciones sin límites
          </Text>
        </View>
      );
    }

    return (
      <Card style={styles.limitsCard}>
        <Text style={styles.sectionTitle}>📊 Límites del Plan Gratuito</Text>
        
        <View style={styles.limitsList}>
          <View style={styles.limitItem}>
            <View style={styles.limitHeader}>
              <Ionicons name="car-outline" size={20} color={Colors.primary} />
              <Text style={styles.limitLabel}>Vehículos</Text>
            </View>
            <Text style={styles.limitValue}>
              {limits.vehicles.current} / {limits.vehicles.max}
            </Text>
          </View>

          <View style={styles.limitItem}>
            <View style={styles.limitHeader}>
              <Ionicons name="build-outline" size={20} color={Colors.primary} />
              <Text style={styles.limitLabel}>Mantenimientos</Text>
            </View>
            <Text style={styles.limitValue}>
              {limits.maintenance.current} / {limits.maintenance.max}
            </Text>
          </View>

          <View style={styles.limitItem}>
            <View style={styles.limitHeader}>
              <Ionicons name="cash-outline" size={20} color={Colors.primary} />
              <Text style={styles.limitLabel}>Gastos</Text>
            </View>
            <Text style={styles.limitValue}>
              {limits.expenses.current} / {limits.expenses.max}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.upgradeLink}
          onPress={handleUpgrade}
        >
          <Text style={styles.upgradeLinkText}>
            Eliminar límites con Pro o Premium →
          </Text>
        </TouchableOpacity>
      </Card>
    );
  };

  const renderFeatures = () => (
    <Card style={styles.featuresCard}>
      <Text style={styles.sectionTitle}>🎯 Funciones Incluidas</Text>
      
      <View style={styles.featuresList}>
        {planFeatures.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons 
              name="checkmark-circle" 
              size={18} 
              color={planFeatures.color} 
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
    </Card>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      {currentPlan !== SubscriptionPlan.FREE && (
        <>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleManageSubscription}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Gestionar Suscripción</Text>
              <Text style={styles.actionSubtitle}>
                Cambiar plan o cancelar en {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          {currentPlan === SubscriptionPlan.PRO && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleUpgrade}
            >
              <Ionicons name="rocket-outline" size={24} color={Colors.warning} />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Actualizar a Premium</Text>
                <Text style={styles.actionSubtitle}>
                  Desbloquea aún más funciones
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </>
      )}

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleRestore}
        disabled={restoring}
      >
        <Ionicons name="refresh-outline" size={24} color={Colors.primary} />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Restaurar Compras</Text>
          <Text style={styles.actionSubtitle}>
            Si cambiaste de dispositivo
          </Text>
        </View>
        {restoring && <Text style={styles.restoringText}>...</Text>}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => Linking.openURL('https://autocarepro.com/support')}
      >
        <Ionicons name="help-circle-outline" size={24} color={Colors.primary} />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Ayuda y Soporte</Text>
          <Text style={styles.actionSubtitle}>
            ¿Tienes dudas? Contáctanos
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Suscripción</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderPlanCard()}
        {renderLimits()}
        {renderFeatures()}
        {renderActions()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            AutoCare Pro v1.0.0
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://autocarepro.com/terms')}>
            <Text style={styles.footerLink}>Términos y Condiciones</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://autocarepro.com/privacy')}>
            <Text style={styles.footerLink}>Política de Privacidad</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Theme.spacing.xs,
  },
  headerTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
  },
  planCard: {
    marginBottom: Theme.spacing.md,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  planIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.sm,
  },
  planIcon: {
    fontSize: 24,
  },
  planInfo: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: 2,
  },
  planName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  planTagline: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    color: Colors.white,
    fontSize: Theme.fontSize.xs,
    fontWeight: 'bold',
  },
  expirationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  expirationText: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textSecondary,
  },
  upgradePrompt: {
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  upgradeButton: {
    marginTop: 0,
  },
  accessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  accessText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
  },
  limitsCard: {
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.sm,
  },
  limitsList: {
    gap: Theme.spacing.md,
  },
  limitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  limitLabel: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
  },
  limitValue: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  upgradeLink: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  upgradeLinkText: {
    fontSize: Theme.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  featuresCard: {
    marginBottom: Theme.spacing.md,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
  },
  actionsContainer: {
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.sm,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  restoringText: {
    fontSize: Theme.fontSize.lg,
    color: Colors.primary,
  },
  footer: {
    alignItems: 'center',
    gap: Theme.spacing.sm,
    paddingTop: Theme.spacing.xl,
  },
  footerText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

export default SubscriptionManagementScreen;


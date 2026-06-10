/**
 * Simulador de Planes - Solo para desarrollo en Expo Go
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../../constants/Colors';
import { SubscriptionPlan, PLAN_FEATURES } from '../../types/subscription';
import Button from '../common/Button';

interface PlanSimulatorProps {
  visible: boolean;
  onClose: () => void;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  currentPlan: SubscriptionPlan;
}

const PlanSimulator: React.FC<PlanSimulatorProps> = ({
  visible,
  onClose,
  onSelectPlan,
  currentPlan,
}) => {
  const plans = [
    SubscriptionPlan.FREE,
    SubscriptionPlan.PRO,
    SubscriptionPlan.PREMIUM,
  ];

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    onSelectPlan(plan);
    onClose();
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
          <View style={styles.header}>
            <Text style={styles.title}>🧪 Simulador de Planes</Text>
            <Text style={styles.subtitle}>Solo para desarrollo - Expo Go</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              <Text style={styles.description}>
                Selecciona un plan para simular y probar todas las funcionalidades:
              </Text>

              {plans.map((plan) => {
                const features = PLAN_FEATURES[plan];
                const isCurrent = currentPlan === plan;

                return (
                  <TouchableOpacity
                    key={plan}
                    style={[
                      styles.planCard,
                      isCurrent && styles.planCardActive,
                    ]}
                    onPress={() => handleSelectPlan(plan)}
                  >
                    <View style={styles.planHeader}>
                      <Text style={styles.planIcon}>{features.icon}</Text>
                      <View style={styles.planInfo}>
                        <Text style={styles.planName}>{features.name}</Text>
                        <Text style={styles.planTagline}>{features.tagline}</Text>
                      </View>
                      {isCurrent && (
                        <View style={styles.currentBadge}>
                          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                        </View>
                      )}
                    </View>

                    <View style={styles.featuresList}>
                      {features.features.slice(0, 3).map((feature, index) => (
                        <View key={index} style={styles.featureRow}>
                          <Ionicons 
                            name="checkmark" 
                            size={16} 
                            color={features.color} 
                          />
                          <Text style={styles.featureText}>{feature}</Text>
                        </View>
                      ))}
                    </View>

                    {!isCurrent && (
                      <Button
                        title={`Simular ${features.name}`}
                        onPress={() => handleSelectPlan(plan)}
                        style={styles.selectButton}
                        size="small"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              <View style={styles.warning}>
                <Ionicons name="warning-outline" size={24} color={Colors.warning} />
                <Text style={styles.warningText}>
                  Este simulador solo funciona en Expo Go. En producción, 
                  las compras se procesarán a través de RevenueCat.
                </Text>
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
    maxHeight: '85%',
  },
  header: {
    padding: Theme.spacing.xl,
    paddingBottom: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Theme.spacing.lg,
    right: Theme.spacing.lg,
  },
  content: {
    padding: Theme.spacing.xl,
  },
  description: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 22,
  },
  planCard: {
    backgroundColor: Colors.background,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  planCardActive: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  planIcon: {
    fontSize: 40,
    marginRight: Theme.spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  planTagline: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  currentBadge: {
    marginLeft: Theme.spacing.sm,
  },
  featuresList: {
    marginBottom: Theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
    gap: Theme.spacing.xs,
  },
  featureText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
    flex: 1,
  },
  selectButton: {
    marginTop: Theme.spacing.sm,
  },
  warning: {
    flexDirection: 'row',
    backgroundColor: Colors.warning + '20',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginTop: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});

export default PlanSimulator;


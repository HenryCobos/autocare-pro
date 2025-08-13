/**
 * Pantalla Dashboard - Inicio Rediseñado de AutoCare Pro
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { Vehicle, Maintenance, Reminder, Expense } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import {
  formatDate,
  formatCurrency,
  formatKilometers,
  getReminderStatusColor,
  getReminderStatusText,
  getDaysUntil,
} from '../utils/helpers';

// Componentes
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import BannerAd from '../components/ads/BannerAd';

interface DashboardScreenProps {
  navigation: any;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [vehiclesData, remindersData, expensesData] = await Promise.all([
        AsyncStorageService.getVehicles(),
        AsyncStorageService.getReminders(),
        AsyncStorageService.getExpenses(),
      ]);

      setVehicles(vehiclesData);
      setExpenses(expensesData);

      // Cargar recordatorios próximos (solo los más urgentes)
      const upcoming = remindersData
        .filter(reminder => !reminder.isCompleted && getDaysUntil(reminder.dueDate) <= 7)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3);
      setUpcomingReminders(upcoming);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar datos
  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  // Calcular estadísticas generales
  const calculateStats = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    });

    const totalMonthlyAmount = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalVehicles: vehicles.length,
      urgentReminders: upcomingReminders.filter(r => getDaysUntil(r.dueDate) <= 3).length,
      monthlyExpenses: totalMonthlyAmount,
    };
  };

  const stats = calculateStats();

  // Renderizar vehículo destacado
  const renderFeaturedVehicle = (vehicle: Vehicle) => (
    <TouchableOpacity
      key={vehicle.id}
      style={styles.featuredVehicle}
      onPress={() => navigation.navigate('VehicleHistory', { vehicleId: vehicle.id })}
    >
      <View style={styles.vehicleImageContainer}>
        {vehicle.photo ? (
          <Image source={{ uri: vehicle.photo }} style={styles.vehicleImage} />
        ) : (
          <View style={styles.vehiclePlaceholder}>
            <Ionicons name="car" size={28} color={Colors.primary} />
          </View>
        )}
      </View>
      
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>{vehicle.brand} {vehicle.model}</Text>
        <Text style={styles.vehicleDetails}>{vehicle.year} • {vehicle.licensePlate}</Text>
        <Text style={styles.vehicleKm}>{formatKilometers(vehicle.currentKilometers)}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  // Renderizar recordatorio urgente
  const renderUrgentReminder = (reminder: Reminder) => {
    const vehicle = vehicles.find(v => v.id === reminder.vehicleId);
    const daysUntil = getDaysUntil(reminder.dueDate);
    const isOverdue = daysUntil < 0;
    const urgencyColor = isOverdue ? Colors.error : daysUntil <= 1 ? Colors.warning : Colors.primary;

    return (
      <TouchableOpacity
        key={reminder.id}
        style={[styles.urgentReminder, { borderLeftColor: urgencyColor }]}
        onPress={() => navigation.navigate('Calendar')}
      >
        <View style={styles.reminderContent}>
          <Text style={styles.reminderTitle} numberOfLines={1}>
            {reminder.title}
          </Text>
          <Text style={styles.reminderVehicle} numberOfLines={1}>
            {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo no encontrado'}
          </Text>
        </View>
        
        <View style={styles.reminderBadge}>
          <Text style={[styles.reminderDays, { color: urgencyColor }]}>
            {isOverdue ? `${Math.abs(daysUntil)}d vencido` : 
             daysUntil === 0 ? 'Hoy' : 
             daysUntil === 1 ? 'Mañana' : 
             `${daysUntil} días`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header con saludo y estadísticas */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>¡Hola!</Text>
          <Text style={styles.greetingSubtext}>Gestiona tus vehículos fácilmente</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalVehicles}</Text>
            <Text style={styles.statLabel}>Vehículos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: stats.urgentReminders > 0 ? Colors.error : Colors.success }]}>
              {stats.urgentReminders}
            </Text>
            <Text style={styles.statLabel}>Urgentes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>
              {stats.monthlyExpenses > 0 ? formatCurrency(stats.monthlyExpenses) : '$0'}
            </Text>
            <Text style={styles.statLabel}>Este mes</Text>
          </View>
        </View>
      </View>

      {/* Alerta de recordatorios urgentes */}
      {upcomingReminders.length > 0 && (
        <Card style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <View style={styles.alertIcon}>
              <Ionicons name="warning" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.alertTitle}>Recordatorios Próximos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.alertAction}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingReminders.slice(0, 2).map(renderUrgentReminder)}
        </Card>
      )}

      {/* Vehículos - Vista simplificada */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mis Vehículos</Text>
          {vehicles.length > 1 && (
            <TouchableOpacity onPress={() => navigation.navigate('Vehicles')}>
              <Text style={styles.seeAll}>Ver todos ({vehicles.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        {vehicles.length > 0 ? (
          <Card padding="none">
            {vehicles.slice(0, 2).map(renderFeaturedVehicle)}
            {vehicles.length > 2 && (
              <TouchableOpacity
                style={styles.moreVehicles}
                onPress={() => navigation.navigate('Vehicles')}
              >
                <Text style={styles.moreVehiclesText}>
                  Ver {vehicles.length - 2} vehículos más
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="car-outline" size={40} color={Colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>¡Agrega tu primer vehículo!</Text>
              <Text style={styles.emptyText}>
                Comienza a gestionar el mantenimiento de tus vehículos
              </Text>
              <Button
                title="Agregar Vehículo"
                icon="add"
                onPress={() => navigation.navigate('AddEditVehicle')}
                style={styles.emptyButton}
              />
            </View>
          </Card>
        )}
      </View>

      {/* Acciones rápidas principales */}
      {vehicles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('AddEditMaintenance')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.success + '20' }]}>
                <Ionicons name="build" size={24} color={Colors.success} />
              </View>
              <Text style={styles.quickActionTitle}>Mantenimiento</Text>
              <Text style={styles.quickActionSubtitle}>Registrar servicio</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('AddEditExpense')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.error + '20' }]}>
                <Ionicons name="receipt" size={24} color={Colors.error} />
              </View>
              <Text style={styles.quickActionTitle}>Gasto</Text>
              <Text style={styles.quickActionSubtitle}>Registrar costo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Calendar')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary + '20' }]}>
                <Ionicons name="calendar" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionTitle}>Calendario</Text>
              <Text style={styles.quickActionSubtitle}>Ver programados</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => navigation.navigate('Expenses')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.warning + '20' }]}>
                <Ionicons name="analytics" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.quickActionTitle}>Reportes</Text>
              <Text style={styles.quickActionSubtitle}>Ver gastos</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Banner (no-op en Expo Go) */}
      <BannerAd position="inline" />

      {/* Espacio adicional al final */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Theme.spacing.xl,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
  },
  greeting: {
    marginBottom: Theme.spacing.lg,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  greetingSubtext: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.sm,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 80,
    elevation: 2,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  statLabel: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  alertCard: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  alertIcon: {
    marginRight: Theme.spacing.sm,
  },
  alertTitle: {
    flex: 1,
    fontSize: Theme.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  alertAction: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  urgentReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderLeftWidth: 3,
    backgroundColor: Colors.lightGray,
    marginBottom: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  reminderVehicle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  reminderBadge: {
    alignItems: 'flex-end',
  },
  reminderDays: {
    fontSize: Theme.fontSize.sm,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  seeAll: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  featuredVehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  vehicleImageContainer: {
    marginRight: Theme.spacing.md,
  },
  vehicleImage: {
    width: 50,
    height: 50,
    borderRadius: Theme.borderRadius.md,
  },
  vehiclePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  vehicleDetails: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vehicleKm: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  moreVehicles: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  moreVehiclesText: {
    fontSize: Theme.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: Theme.spacing.xs,
  },
  emptyCard: {
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.sm,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    minWidth: 160,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Theme.spacing.sm,
  },
  quickAction: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
    minHeight: 120,
    elevation: 2,
    shadowColor: Colors.darkGray,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  quickActionTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomPadding: {
    height: Theme.spacing.xl,
  },
});

export default DashboardScreen;
/**
 * Pantalla de Historial del Vehículo - Vista completa por vehículo
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { Vehicle, Maintenance, Expense, Reminder } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import {
  formatDate,
  formatCurrency,
  formatKilometers,
  getMaintenanceTypeName,
  getMaintenanceTypeIcon,
  getExpenseTypeName,
  getExpenseTypeIcon,
  getReminderStatusColor,
  getReminderStatusText,
  getVehicleAge,
} from '../utils/helpers';

// Componentes
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface VehicleHistoryScreenProps {
  navigation: any;
  route: any;
}

interface HistoryItem {
  id: string;
  type: 'maintenance' | 'expense' | 'reminder';
  date: string;
  data: Maintenance | Expense | Reminder;
}

const VehicleHistoryScreen: React.FC<VehicleHistoryScreenProps> = ({
  navigation,
  route,
}) => {
  const { vehicleId } = route.params;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'maintenance' | 'expenses' | 'reminders'>('all');

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [vehicleData, vehiclesData, maintenancesData, expensesData, remindersData] = await Promise.all([
        AsyncStorageService.getVehicles().then(vehicles => vehicles.find(v => v.id === vehicleId)),
        AsyncStorageService.getVehicles(),
        AsyncStorageService.getMaintenancesByVehicle(vehicleId),
        AsyncStorageService.getExpensesByVehicle(vehicleId),
        AsyncStorageService.getRemindersByVehicle(vehicleId),
      ]);

      if (!vehicleData) {
        Alert.alert('Error', 'Vehículo no encontrado');
        navigation.goBack();
        return;
      }

      setVehicle(vehicleData);
      setMaintenances(maintenancesData);
      setExpenses(expensesData);
      setReminders(remindersData);

      // Crear timeline combinado
      const timeline: HistoryItem[] = [
        ...maintenancesData.map(item => ({
          id: item.id,
          type: 'maintenance' as const,
          date: item.date,
          data: item,
        })),
        ...expensesData.map(item => ({
          id: item.id,
          type: 'expense' as const,
          date: item.date,
          data: item,
        })),
        ...remindersData.map(item => ({
          id: item.id,
          type: 'reminder' as const,
          date: item.dueDate,
          data: item,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setHistoryItems(timeline);
    } catch (error) {
      console.error('Error loading vehicle history:', error);
      Alert.alert('Error', 'No se pudo cargar el historial del vehículo');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar datos
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [vehicleId])
  );

  // Filtrar items según tab activo
  const getFilteredItems = () => {
    switch (activeTab) {
      case 'maintenance':
        return historyItems.filter(item => item.type === 'maintenance');
      case 'expenses':
        return historyItems.filter(item => item.type === 'expense');
      case 'reminders':
        return historyItems.filter(item => item.type === 'reminder');
      default:
        return historyItems;
    }
  };

  // Calcular estadísticas
  const calculateStats = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const maintenanceExpenses = maintenances.reduce((sum, maintenance) => sum + maintenance.cost, 0);
    const totalCost = totalExpenses + maintenanceExpenses;
    
    return {
      totalMaintenances: maintenances.length,
      totalExpenses: expenses.length,
      totalCost,
      pendingReminders: reminders.filter(r => !r.isCompleted).length,
      avgMaintenanceCost: maintenances.length > 0 ? maintenanceExpenses / maintenances.length : 0,
    };
  };

  const stats = calculateStats();

  // Renderizar mantenimiento
  const renderMaintenance = (maintenance: Maintenance) => {
    const icon = getMaintenanceTypeIcon(maintenance.type);
    const typeName = getMaintenanceTypeName(maintenance.type);

    return (
      <TouchableOpacity
        key={maintenance.id}
        style={styles.historyItem}
        onPress={() => navigation.navigate('AddEditMaintenance', { 
          vehicleId: maintenance.vehicleId, 
          maintenanceId: maintenance.id 
        })}
      >
        <View style={[styles.itemIcon, { backgroundColor: Colors.success + '20' }]}>
          <Ionicons name={icon as any} size={20} color={Colors.success} />
        </View>
        
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{typeName}</Text>
          <Text style={styles.itemSubtitle}>
            {formatKilometers(maintenance.kilometers)} • {formatDate(maintenance.date)}
          </Text>
          {maintenance.notes && (
            <Text style={styles.itemNotes} numberOfLines={1}>
              {maintenance.notes}
            </Text>
          )}
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.itemCost}>{formatCurrency(maintenance.cost)}</Text>
          <Text style={styles.itemType}>Mantenimiento</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar gasto
  const renderExpense = (expense: Expense) => {
    const icon = getExpenseTypeIcon(expense.type);
    const typeName = getExpenseTypeName(expense.type);

    return (
      <TouchableOpacity
        key={expense.id}
        style={styles.historyItem}
        onPress={() => navigation.navigate('AddEditExpense', { 
          vehicleId: expense.vehicleId, 
          expenseId: expense.id 
        })}
      >
        <View style={[styles.itemIcon, { backgroundColor: Colors.error + '20' }]}>
          <Ionicons name={icon as any} size={20} color={Colors.error} />
        </View>
        
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{expense.description}</Text>
          <Text style={styles.itemSubtitle}>
            {typeName} • {formatDate(expense.date)}
          </Text>
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.itemCost}>{formatCurrency(expense.amount)}</Text>
          <Text style={styles.itemType}>Gasto</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar recordatorio
  const renderReminder = (reminder: Reminder) => {
    const statusColor = getReminderStatusColor(reminder.dueDate);
    const statusText = getReminderStatusText(reminder.dueDate);

    return (
      <TouchableOpacity
        key={reminder.id}
        style={styles.historyItem}
        onPress={() => navigation.navigate('Calendar')}
      >
        <View style={[styles.itemIcon, { backgroundColor: statusColor + '20' }]}>
          <Ionicons name="calendar-outline" size={20} color={statusColor} />
        </View>
        
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle}>{reminder.title}</Text>
          <Text style={styles.itemSubtitle}>
            {reminder.description}
          </Text>
          <Text style={[styles.itemStatus, { color: statusColor }]}>
            {reminder.isCompleted ? 'Completado' : statusText}
          </Text>
        </View>

        <View style={styles.itemRight}>
          <Text style={styles.itemDate}>{formatDate(reminder.dueDate)}</Text>
          <Text style={styles.itemType}>Recordatorio</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar item según tipo
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    switch (item.type) {
      case 'maintenance':
        return renderMaintenance(item.data as Maintenance);
      case 'expense':
        return renderExpense(item.data as Expense);
      case 'reminder':
        return renderReminder(item.data as Reminder);
      default:
        return null;
    }
  };

  // Renderizar tab
  const renderTab = (
    key: 'all' | 'maintenance' | 'expenses' | 'reminders',
    title: string,
    count: number
  ) => (
    <TouchableOpacity
      key={key}
      style={[styles.tab, activeTab === key && styles.activeTab]}
      onPress={() => setActiveTab(key)}
    >
      <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>
        {title} ({count})
      </Text>
    </TouchableOpacity>
  );

  if (!vehicle) {
    return <View style={styles.container} />;
  }

  const filteredItems = getFilteredItems();

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header del vehículo */}
        <Card style={styles.vehicleHeader}>
          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleImageContainer}>
              {vehicle.photo ? (
                <Image source={{ uri: vehicle.photo }} style={styles.vehicleImage} />
              ) : (
                <View style={styles.vehiclePlaceholder}>
                  <Ionicons name="car" size={32} color={Colors.primary} />
                </View>
              )}
            </View>
            
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleTitle}>
                {vehicle.brand} {vehicle.model}
              </Text>
              <Text style={styles.vehicleSubtitle}>
                {vehicle.year} • {vehicle.licensePlate}
              </Text>
              <Text style={styles.vehicleAge}>
                {getVehicleAge(vehicle.year)} años • {formatKilometers(vehicle.currentKilometers)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('AddEditVehicle', { vehicleId: vehicle.id })}
            >
              <Ionicons name="create-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Estadísticas */}
        <Card>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalMaintenances}</Text>
              <Text style={styles.statLabel}>Mantenimientos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalExpenses}</Text>
              <Text style={styles.statLabel}>Gastos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(stats.totalCost)}</Text>
              <Text style={styles.statLabel}>Costo Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.pendingReminders}</Text>
              <Text style={styles.statLabel}>Recordatorios</Text>
            </View>
          </View>
        </Card>

        {/* Acciones rápidas */}
        <Card>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.quickActions}>
            <Button
              title="Mantenimiento"
              icon="build-outline"
              variant="outline"
              onPress={() => navigation.navigate('AddEditMaintenance', { vehicleId })}
              style={styles.quickAction}
            />
            <Button
              title="Gasto"
              icon="receipt-outline"
              variant="outline"
              onPress={() => navigation.navigate('AddEditExpense', { vehicleId })}
              style={styles.quickAction}
            />
          </View>
        </Card>

        {/* Tabs de historial */}
        <Card style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Historial Completo</Text>
          
          <View style={styles.tabs}>
            {renderTab('all', 'Todo', historyItems.length)}
            {renderTab('maintenance', 'Mantenimientos', maintenances.length)}
            {renderTab('expenses', 'Gastos', expenses.length)}
            {renderTab('reminders', 'Recordatorios', reminders.length)}
          </View>

          {/* Lista del historial */}
          <View style={styles.historyList}>
            {filteredItems.length > 0 ? (
              filteredItems.map(item => renderHistoryItem({ item }))
            ) : (
              <View style={styles.emptyHistory}>
                <Ionicons name="document-outline" size={48} color={Colors.mediumGray} />
                <Text style={styles.emptyText}>
                  No hay {activeTab === 'all' ? 'registros' : 
                    activeTab === 'maintenance' ? 'mantenimientos' :
                    activeTab === 'expenses' ? 'gastos' : 'recordatorios'} 
                  para este vehículo
                </Text>
              </View>
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Theme.spacing.md,
  },
  vehicleHeader: {
    marginBottom: Theme.spacing.md,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleImageContainer: {
    marginRight: Theme.spacing.md,
  },
  vehicleImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  vehiclePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  vehicleSubtitle: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  vehicleAge: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Theme.spacing.xs,
  },
  editButton: {
    padding: Theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  statValue: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
  },
  historyCard: {
    marginBottom: Theme.spacing.xl,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.xs,
    marginBottom: Theme.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.white,
    elevation: 1,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.primary,
  },
  historyList: {
    minHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  itemSubtitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  itemNotes: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textLight,
    marginTop: Theme.spacing.xs,
    fontStyle: 'italic',
  },
  itemStatus: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    marginTop: Theme.spacing.xs,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemCost: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
  },
  itemDate: {
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
  },
  itemType: {
    fontSize: Theme.fontSize.xs,
    color: Colors.textLight,
    marginTop: Theme.spacing.xs,
  },
  emptyHistory: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
  },
});

export default VehicleHistoryScreen;

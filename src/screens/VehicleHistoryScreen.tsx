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
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { Vehicle, Maintenance, Expense, Reminder, WorkOrder, WorkOrderStatus, Customer } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import {
  formatDate,
  formatKilometers,
  getMaintenanceTypeName,
  getMaintenanceTypeIcon,
  getExpenseTypeName,
  getExpenseTypeIcon,
  getReminderStatusColor,
  getReminderStatusText,
  getVehicleAge,
} from '../utils/helpers';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useCurrency } from '../hooks/useCurrency';
import ExportService from '../services/ExportService';
import { TikTokAnalyticsService, TikTokCustomEvent } from '../services/TikTokAnalyticsService';

// Componentes
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import UpgradeModal from '../components/subscription/UpgradeModal';

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
  const { hasFeature } = useSubscription();
  const { formatCurrency, refreshCurrency } = useCurrency();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'maintenance' | 'expenses' | 'reminders'>('all');

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [vehicleData, maintenancesData, expensesData, remindersData, workOrdersData, customersData] = await Promise.all([
        AsyncStorageService.getVehicles().then(vehicles => vehicles.find(v => v.id === vehicleId)),
        AsyncStorageService.getMaintenancesByVehicle(vehicleId),
        AsyncStorageService.getExpensesByVehicle(vehicleId),
        AsyncStorageService.getRemindersByVehicle(vehicleId),
        AsyncStorageService.getWorkOrdersByVehicle(vehicleId),
        AsyncStorageService.getCustomers(),
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
      setWorkOrders(workOrdersData.sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime()));
      setCustomers(customersData);

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

  // Manejar exportación a PDF
  const handleExportPDF = async () => {
    // Verificar si tiene acceso a exportación
    if (!hasFeature('canExportPDF')) {
      setShowUpgradeModal(true);
      return;
    }

    if (!vehicle) return;

    try {
      setExporting(true);
      const result = await ExportService.exportVehicleHistory(
        vehicle,
        maintenances,
        expenses
      );

      if (result.success) {
        TikTokAnalyticsService.trackCustomEvent(TikTokCustomEvent.EXPORT_PDF, {
          content_type: 'vehicle_history',
        });
        Alert.alert('Éxito', 'PDF generado correctamente');
      } else {
        Alert.alert('Error', result.error || 'No se pudo generar el PDF');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar el historial');
    } finally {
      setExporting(false);
    }
  };

  // Manejar upgrade desde modal
  const handleUpgrade = (plan: any) => {
    setShowUpgradeModal(false);
    navigation.navigate('Paywall', {
      source: 'limit',
      limitType: 'export',
      preselectedPlan: plan,
    });
  };

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshCurrency(); // Recargar moneda cuando la pantalla recibe foco
    }, [vehicleId, refreshCurrency])
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
  const openWorkOrders = workOrders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length;

  const getWorkOrderStatusMeta = (status: WorkOrderStatus) => {
    const statusMap: Record<WorkOrderStatus, { label: string; color: string }> = {
      received: { label: 'Recibido', color: Colors.info },
      diagnosed: { label: 'Diagnosticado', color: Colors.warning },
      approved: { label: 'Aprobado', color: Colors.primary },
      in_progress: { label: 'En progreso', color: Colors.primary },
      completed: { label: 'Completado', color: Colors.success },
      delivered: { label: 'Entregado', color: Colors.success },
      cancelled: { label: 'Cancelado', color: Colors.error },
    };
    return statusMap[status];
  };

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

        {/* Exportar PDF - Posición destacada */}
        <Card>
          <View style={styles.exportHeader}>
            <Ionicons name="download-outline" size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Exportar Historial</Text>
          </View>
          <Button
            title={exporting ? "Generando PDF..." : "📄 Exportar a PDF"}
            icon="download-outline"
            onPress={handleExportPDF}
            loading={exporting}
            disabled={exporting}
            style={styles.exportButton}
          />
          {!hasFeature('canExportPDF') && (
            <Text style={styles.premiumNote}>
              ⭐ Función disponible en planes Pro y Premium
            </Text>
          )}
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
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{openWorkOrders}</Text>
              <Text style={styles.statLabel}>Órdenes Activas</Text>
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
            <Button
              title="Orden"
              icon="clipboard-outline"
              variant="outline"
              onPress={() => navigation.navigate('AddEditWorkOrder', { vehicleId })}
              style={styles.quickAction}
            />
          </View>
        </Card>

        <Card>
          <View style={styles.workOrderHeader}>
            <Text style={styles.sectionTitle}>Órdenes de Trabajo</Text>
            <Button
              title="Crear orden"
              size="small"
              onPress={() => navigation.navigate('AddEditWorkOrder', { vehicleId })}
            />
          </View>

          {workOrders.length === 0 ? (
            <View style={styles.emptyWorkOrders}>
              <Ionicons name="clipboard-outline" size={32} color={Colors.mediumGray} />
              <Text style={styles.emptyText}>Aún no hay órdenes para este vehículo.</Text>
            </View>
          ) : (
            workOrders.slice(0, 5).map(order => {
              const statusMeta = getWorkOrderStatusMeta(order.status);
              const customer = customers.find(item => item.id === order.customerId);
              return (
                <TouchableOpacity
                  key={order.id}
                  style={styles.workOrderItem}
                  onPress={() => navigation.navigate('AddEditWorkOrder', { vehicleId, workOrderId: order.id })}
                >
                  <View style={styles.workOrderMain}>
                    <Text style={styles.workOrderTitle} numberOfLines={1}>{order.complaint}</Text>
                    <Text style={styles.workOrderSubtext}>
                      {customer?.name || 'Sin cliente'} • {formatDate(order.openedAt)}
                    </Text>
                  </View>
                  <View style={styles.workOrderStatus}>
                    <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
                    <Text style={[styles.workOrderStatusText, { color: statusMeta.color }]}>
                      {statusMeta.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
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

      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        limitType="export"
      />
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
    flexWrap: 'wrap',
    marginHorizontal: -Theme.spacing.xs,
  },
  quickAction: {
    width: '31%',
    marginHorizontal: Theme.spacing.xs,
    marginBottom: Theme.spacing.sm,
  },
  workOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  emptyWorkOrders: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.lg,
  },
  workOrderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  workOrderMain: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  workOrderTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  workOrderSubtext: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  workOrderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Theme.spacing.xs,
  },
  workOrderStatusText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
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
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  exportButton: {
    marginTop: Theme.spacing.sm,
  },
  premiumNote: {
    fontSize: Theme.fontSize.sm,
    color: Colors.warning,
    textAlign: 'center',
    marginTop: Theme.spacing.sm,
    fontStyle: 'italic',
  },
});

export default VehicleHistoryScreen;

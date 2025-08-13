/**
 * Pantalla de Mantenimientos
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { Maintenance, Vehicle } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import {
  formatDate,
  formatCurrency,
  getMaintenanceTypeName,
  getMaintenanceTypeIcon,
  groupByMonth,
  getMonthName,
} from '../utils/helpers';

// Componentes
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import BannerAd from '../components/ads/BannerAd';

interface MaintenanceScreenProps {
  navigation: any;
}

const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ navigation }) => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      const [maintenancesData, vehiclesData] = await Promise.all([
        AsyncStorageService.getMaintenances(),
        AsyncStorageService.getVehicles(),
      ]);
      
      // Ordenar mantenimientos por fecha (más reciente primero)
      const sortedMaintenances = maintenancesData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setMaintenances(sortedMaintenances);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      Alert.alert('Error', 'No se pudieron cargar los mantenimientos');
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

  // Eliminar mantenimiento
  const deleteMaintenance = (maintenance: Maintenance) => {
    const vehicle = vehicles.find(v => v.id === maintenance.vehicleId);
    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo';
    const typeName = getMaintenanceTypeName(maintenance.type);

    Alert.alert(
      'Eliminar Mantenimiento',
      `¿Estás seguro de que deseas eliminar el mantenimiento de ${typeName} para ${vehicleName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorageService.deleteMaintenance(maintenance.id);
              
              // Eliminar recordatorio asociado si existe
              const reminderId = `${maintenance.id}_reminder`;
              try {
                await AsyncStorageService.deleteReminder(reminderId);
              } catch (error) {
                // Si no existe el recordatorio, no hay problema
              }
              
              await loadData();
              Alert.alert('Éxito', 'Mantenimiento eliminado correctamente');
            } catch (error) {
              console.error('Error deleting maintenance:', error);
              Alert.alert('Error', 'No se pudo eliminar el mantenimiento');
            }
          },
        },
      ]
    );
  };

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Renderizar mantenimiento
  const renderMaintenance = ({ item: maintenance }: { item: Maintenance }) => {
    const vehicle = vehicles.find(v => v.id === maintenance.vehicleId);
    const icon = getMaintenanceTypeIcon(maintenance.type);
    const typeName = getMaintenanceTypeName(maintenance.type);

    return (
      <Card
        style={styles.maintenanceCard}
        onPress={() => navigation.navigate('AddEditMaintenance', { 
          vehicleId: maintenance.vehicleId, 
          maintenanceId: maintenance.id 
        })}
      >
        <View style={styles.maintenanceHeader}>
          <View style={styles.maintenanceIcon}>
            <Ionicons name={icon as any} size={24} color={Colors.primary} />
          </View>
          
          <View style={styles.maintenanceInfo}>
            <Text style={styles.maintenanceType}>{typeName}</Text>
            <Text style={styles.maintenanceVehicle}>
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo no encontrado'}
            </Text>
            <Text style={styles.maintenanceDate}>
              {formatDate(maintenance.date)} • {maintenance.kilometers.toLocaleString()} km
            </Text>
          </View>

          <View style={styles.maintenanceActions}>
            <Text style={styles.maintenanceCost}>
              {formatCurrency(maintenance.cost)}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteMaintenance(maintenance)}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {maintenance.notes && (
          <View style={styles.maintenanceNotes}>
            <Text style={styles.notesLabel}>Notas:</Text>
            <Text style={styles.notesText}>{maintenance.notes}</Text>
          </View>
        )}

        {maintenance.nextDueDate && (
          <View style={styles.nextDue}>
            <Ionicons name="time-outline" size={16} color={Colors.warning} />
            <Text style={styles.nextDueText}>
              Próximo: {formatDate(maintenance.nextDueDate)}
              {maintenance.nextDueKilometers && ` • ${maintenance.nextDueKilometers.toLocaleString()} km`}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  // Renderizar separador de mes
  const renderMonthSeparator = (monthKey: string) => (
    <View key={`month-${monthKey}`} style={styles.monthSeparator}>
      <Text style={styles.monthText}>{getMonthName(monthKey)}</Text>
    </View>
  );

  // Preparar datos agrupados por mes
  const getGroupedData = () => {
    const grouped = groupByMonth(maintenances, 'date');
    const result: any[] = [];

    Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a)) // Orden descendente
      .forEach(monthKey => {
        result.push({ type: 'month', monthKey });
        grouped[monthKey].forEach(maintenance => {
          result.push({ type: 'maintenance', maintenance });
        });
      });

    return result;
  };

  // Renderizar item
  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'month') {
      return renderMonthSeparator(item.monthKey);
    }
    return renderMaintenance({ item: item.maintenance });
  };

  // Estado vacío
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="build-outline" size={80} color={Colors.mediumGray} />
      <Text style={styles.emptyTitle}>No hay mantenimientos registrados</Text>
      <Text style={styles.emptySubtitle}>
        Registra el primer mantenimiento de tus vehículos
      </Text>
      {vehicles.length > 0 ? (
        <Button
          title="Agregar Mantenimiento"
          icon="add-outline"
          onPress={() => navigation.navigate('AddEditMaintenance')}
          style={styles.emptyButton}
        />
      ) : (
        <Button
          title="Agregar Vehículo Primero"
          icon="car-outline"
          onPress={() => navigation.navigate('Vehicles')}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  const groupedData = getGroupedData();

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => 
          item.type === 'month' ? `month-${item.monthKey}` : `maintenance-${item.maintenance.id}`
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListFooterComponent={<BannerAd position="inline" />}
      />

      {vehicles.length > 0 && (
        <View style={styles.fab}>
          <Button
            title=""
            icon="add"
            onPress={() => navigation.navigate('AddEditMaintenance')}
            style={styles.fabButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    padding: Theme.spacing.md,
    paddingBottom: 100,
  },
  monthSeparator: {
    backgroundColor: Colors.lightGray,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  monthText: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  maintenanceCard: {
    marginBottom: Theme.spacing.sm,
  },
  maintenanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maintenanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  maintenanceInfo: {
    flex: 1,
  },
  maintenanceType: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
  },
  maintenanceVehicle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  maintenanceDate: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  maintenanceActions: {
    alignItems: 'flex-end',
  },
  maintenanceCost: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  deleteButton: {
    padding: Theme.spacing.xs,
  },
  maintenanceNotes: {
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  notesLabel: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  notesText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  nextDue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.sm,
  },
  nextDueText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.warning,
    fontWeight: '600',
    marginLeft: Theme.spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  emptyButton: {
    width: 200,
  },
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    right: Theme.spacing.lg,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});

export default MaintenanceScreen;

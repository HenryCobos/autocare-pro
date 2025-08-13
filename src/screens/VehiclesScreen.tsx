/**
 * Pantalla de Vehículos - Gestión de vehículos
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { Vehicle } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import { formatKilometers, getVehicleAge } from '../utils/helpers';

// Componentes
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import BannerAd from '../components/ads/BannerAd';

interface VehiclesScreenProps {
  navigation: any;
}

const VehiclesScreen: React.FC<VehiclesScreenProps> = ({ navigation }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar vehículos
  const loadVehicles = async () => {
    try {
      setLoading(true);
      const vehiclesData = await AsyncStorageService.getVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar datos
  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  };

  // Eliminar vehículo
  const deleteVehicle = (vehicle: Vehicle) => {
    Alert.alert(
      'Eliminar Vehículo',
      `¿Estás seguro de que deseas eliminar ${vehicle.brand} ${vehicle.model}? Se eliminarán todos los mantenimientos y gastos asociados.`,
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
              await AsyncStorageService.deleteVehicle(vehicle.id);
              await loadVehicles();
              Alert.alert('Éxito', 'Vehículo eliminado correctamente');
            } catch (error) {
              console.error('Error deleting vehicle:', error);
              Alert.alert('Error', 'No se pudo eliminar el vehículo');
            }
          },
        },
      ]
    );
  };

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [])
  );

  // Renderizar vehículo
  const renderVehicle = ({ item: vehicle }: { item: Vehicle }) => (
    <Card
      style={styles.vehicleCard}
      onPress={() => navigation.navigate('AddEditVehicle', { vehicleId: vehicle.id })}
    >
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleImageContainer}>
          {vehicle.photo ? (
            <Image source={{ uri: vehicle.photo }} style={styles.vehicleImage} />
          ) : (
            <View style={styles.vehiclePlaceholder}>
              <Ionicons name="car" size={32} color={Colors.primary} />
            </View>
          )}
        </View>
        
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleTitle}>
            {vehicle.brand} {vehicle.model}
          </Text>
          <Text style={styles.vehicleSubtitle}>
            {vehicle.year} • {vehicle.licensePlate}
          </Text>
          <Text style={styles.vehicleAge}>
            {getVehicleAge(vehicle.year)} años
          </Text>
        </View>

        <View style={styles.vehicleActions}>
          <Button
            title=""
            icon="create-outline"
            size="small"
            variant="outline"
            onPress={() => navigation.navigate('AddEditVehicle', { vehicleId: vehicle.id })}
            style={styles.actionButton}
          />
          <Button
            title=""
            icon="trash-outline"
            size="small"
            variant="danger"
            onPress={() => deleteVehicle(vehicle)}
            style={styles.actionButton}
          />
        </View>
      </View>

      <View style={styles.vehicleStats}>
        <View style={styles.stat}>
          <Ionicons name="speedometer-outline" size={20} color={Colors.primary} />
          <Text style={styles.statLabel}>Kilometraje</Text>
          <Text style={styles.statValue}>{formatKilometers(vehicle.currentKilometers)}</Text>
        </View>
      </View>

      <View style={styles.vehicleQuickActions}>
        <Button
          title="Historial"
          icon="document-text-outline"
          size="small"
          variant="primary"
          onPress={() => navigation.navigate('VehicleHistory', { vehicleId: vehicle.id })}
          style={styles.quickActionButton}
        />
        <Button
          title="Servicio"
          icon="build-outline"
          size="small"
          variant="outline"
          onPress={() => navigation.navigate('AddEditMaintenance', { vehicleId: vehicle.id })}
          style={styles.quickActionButton}
        />
        <Button
          title="Gasto"
          icon="receipt-outline"
          size="small"
          variant="outline"
          onPress={() => navigation.navigate('AddEditExpense', { vehicleId: vehicle.id })}
          style={styles.quickActionButton}
        />
      </View>
    </Card>
  );

  // Estado vacío
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="car-outline" size={80} color={Colors.mediumGray} />
      <Text style={styles.emptyTitle}>No hay vehículos registrados</Text>
      <Text style={styles.emptySubtitle}>
        Agrega tu primer vehículo para comenzar a gestionar su mantenimiento
      </Text>
      <Button
        title="Agregar Vehículo"
        icon="add-outline"
        onPress={() => navigation.navigate('AddEditVehicle')}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={vehicles}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id}
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
            onPress={() => navigation.navigate('AddEditVehicle')}
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
  vehicleCard: {
    marginBottom: Theme.spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
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
  vehicleInfo: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: Theme.fontSize.lg,
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
  vehicleActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    marginLeft: Theme.spacing.xs,
  },
  vehicleStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  statValue: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: Theme.spacing.xs,
  },
  vehicleQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.sm,
  },
  quickActionButton: {
    flex: 1,
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

export default VehiclesScreen;

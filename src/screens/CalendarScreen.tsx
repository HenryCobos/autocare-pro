/**
 * Pantalla de Calendario - Vista de mantenimientos programados
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { Reminder, Vehicle } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import {
  formatDate,
  getReminderStatusColor,
  getReminderStatusText,
  getDaysUntil,
} from '../utils/helpers';

// Componentes
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import BannerAd from '../components/ads/BannerAd';

interface CalendarScreenProps {
  navigation: any;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      const [remindersData, vehiclesData] = await Promise.all([
        AsyncStorageService.getReminders(),
        AsyncStorageService.getVehicles(),
      ]);
      
      // Ordenar recordatorios por fecha de vencimiento
      const sortedReminders = remindersData.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      
      setReminders(sortedReminders);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      Alert.alert('Error', 'No se pudieron cargar los recordatorios');
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

  // Marcar recordatorio como completado
  const completeReminder = async (reminder: Reminder) => {
    try {
      const updatedReminder: Reminder = {
        ...reminder,
        isCompleted: true,
        updatedAt: new Date().toISOString(),
      };
      
      await AsyncStorageService.saveReminder(updatedReminder);
      await loadData();
      Alert.alert('Éxito', 'Recordatorio marcado como completado');
    } catch (error) {
      console.error('Error completing reminder:', error);
      Alert.alert('Error', 'No se pudo completar el recordatorio');
    }
  };

  // Eliminar recordatorio
  const deleteReminder = (reminder: Reminder) => {
    Alert.alert(
      'Eliminar Recordatorio',
      `¿Estás seguro de que deseas eliminar el recordatorio "${reminder.title}"?`,
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
              await AsyncStorageService.deleteReminder(reminder.id);
              await loadData();
              Alert.alert('Éxito', 'Recordatorio eliminado correctamente');
            } catch (error) {
              console.error('Error deleting reminder:', error);
              Alert.alert('Error', 'No se pudo eliminar el recordatorio');
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

  // Renderizar recordatorio
  const renderReminder = ({ item: reminder }: { item: Reminder }) => {
    const vehicle = vehicles.find(v => v.id === reminder.vehicleId);
    const statusColor = getReminderStatusColor(reminder.dueDate);
    const statusText = getReminderStatusText(reminder.dueDate);
    const daysUntil = getDaysUntil(reminder.dueDate);

    return (
      <Card
        style={[
          styles.reminderCard,
          reminder.isCompleted && styles.completedCard,
        ] as any}
      >
        <View style={styles.reminderHeader}>
          <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
          
          <View style={styles.reminderContent}>
            <Text style={[
              styles.reminderTitle,
              reminder.isCompleted && styles.completedText,
            ]}>
              {reminder.title}
            </Text>
            
            <Text style={styles.reminderVehicle}>
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo no encontrado'}
            </Text>
            
            <Text style={styles.reminderDescription}>
              {reminder.description}
            </Text>
            
            <View style={styles.reminderMeta}>
              <Text style={[styles.reminderDate, { color: statusColor }]}>
                📅 {formatDate(reminder.dueDate)}
              </Text>
              
              {reminder.dueKilometers && (
                <Text style={styles.reminderKm}>
                  🛣️ {reminder.dueKilometers.toLocaleString()} km
                </Text>
              )}
            </View>
            
            <Text style={[styles.statusText, { color: statusColor }]}>
              {reminder.isCompleted ? '✅ Completado' : statusText}
            </Text>
          </View>
        </View>

        {!reminder.isCompleted && (
          <View style={styles.reminderActions}>
            <Button
              title="Completar"
              size="small"
              onPress={() => completeReminder(reminder)}
              style={styles.actionButton}
            />
            <Button
              title="Eliminar"
              size="small"
              variant="danger"
              onPress={() => deleteReminder(reminder)}
              style={styles.actionButton}
            />
          </View>
        )}

        {reminder.isCompleted && (
          <View style={styles.completedActions}>
            <Button
              title="Eliminar"
              size="small"
              variant="outline"
              onPress={() => deleteReminder(reminder)}
              style={styles.actionButton}
            />
          </View>
        )}
      </Card>
    );
  };

  // Filtrar recordatorios
  const activeReminders = reminders.filter(r => !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);

  // Estado vacío
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color={Colors.mediumGray} />
      <Text style={styles.emptyTitle}>No hay recordatorios programados</Text>
      <Text style={styles.emptySubtitle}>
        Los recordatorios se crean automáticamente cuando programas mantenimientos futuros
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

  // Renderizar sección
  const renderSection = (title: string, data: Reminder[], emptyMessage: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderReminder}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading && reminders.length === 0 ? renderEmptyState : null}
        data={[1]} // Dummy data to make FlatList work
        renderItem={() => (
          <View>
            {renderSection('Recordatorios Activos', activeReminders, 'No hay recordatorios activos')}
            {completedReminders.length > 0 && 
              renderSection('Completados', completedReminders, '')
            }
            <BannerAd position="inline" />
          </View>
        )}
        keyExtractor={() => 'calendar-content'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Theme.spacing.md,
  },
  section: {
    marginBottom: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.md,
  },
  reminderCard: {
    marginBottom: Theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  completedCard: {
    opacity: 0.7,
    borderLeftColor: Colors.success,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: Theme.spacing.md,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  reminderVehicle: {
    fontSize: Theme.fontSize.md,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  },
  reminderDescription: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.md,
    lineHeight: 20,
  },
  reminderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  },
  reminderDate: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
  },
  reminderKm: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  statusText: {
    fontSize: Theme.fontSize.sm,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.md,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  completedActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: Theme.spacing.sm,
    minWidth: 80,
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
  emptyMessage: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    padding: Theme.spacing.lg,
  },
});

export default CalendarScreen;

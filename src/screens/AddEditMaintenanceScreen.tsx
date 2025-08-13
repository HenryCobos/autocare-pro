/**
 * Pantalla Agregar/Editar Mantenimiento
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Theme } from '../constants/Colors';
import { Maintenance, Vehicle, MaintenanceType } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import NotificationService from '../services/NotificationService';
import { generateId, getMaintenanceTypeName, formatDate } from '../utils/helpers';
import { Reminder } from '../types';
import { useAds } from '../hooks/useAds';

// Componentes
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import DatePickerModal from '../components/common/DatePickerModal';

interface AddEditMaintenanceScreenProps {
  navigation: any;
  route: any;
}

const AddEditMaintenanceScreen: React.FC<AddEditMaintenanceScreenProps> = ({
  navigation,
  route,
}) => {
  const { bumpAction, showInterstitialSmart } = useAds();
  const { vehicleId, maintenanceId } = route.params || {};
  const isEditing = !!maintenanceId;

  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    type: MaintenanceType.OIL_CHANGE,
    date: new Date(),
    cost: 0,
    kilometers: 0,
    notes: '',
    photo: '',
    nextDueDate: '',
    nextDueKilometers: 0,
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextDatePicker, setShowNextDatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

  // Cargar datos
  useEffect(() => {
    loadData();
  }, [vehicleId, maintenanceId]);

  const loadData = async () => {
    try {
      // Cargar todos los vehículos
      const vehiclesData = await AsyncStorageService.getVehicles();
      setVehicles(vehiclesData);
      
      // Si hay un vehicleId específico, seleccionarlo
      if (vehicleId) {
        const vehicleData = vehiclesData.find(v => v.id === vehicleId);
        if (vehicleData) {
          setSelectedVehicle(vehicleData);
          setFormData(prev => ({ ...prev, kilometers: vehicleData.currentKilometers }));
        }
      } else if (vehiclesData.length > 0) {
        // Si no hay vehicleId específico, seleccionar el primero
        setSelectedVehicle(vehiclesData[0]);
        setFormData(prev => ({ 
          ...prev, 
          vehicleId: vehiclesData[0].id,
          kilometers: vehiclesData[0].currentKilometers
        }));
      }

      // Cargar mantenimiento si estamos editando
      if (isEditing) {
        const maintenances = await AsyncStorageService.getMaintenances();
        const maintenance = maintenances.find(m => m.id === maintenanceId);
        
        if (maintenance) {
          const maintenanceVehicle = vehiclesData.find(v => v.id === maintenance.vehicleId);
          setSelectedVehicle(maintenanceVehicle || null);
          
          setFormData({
            vehicleId: maintenance.vehicleId,
            type: maintenance.type,
            date: new Date(maintenance.date),
            cost: maintenance.cost,
            kilometers: maintenance.kilometers,
            notes: maintenance.notes || '',
            photo: maintenance.photo || '',
            nextDueDate: maintenance.nextDueDate || '',
            nextDueKilometers: maintenance.nextDueKilometers || 0,
          });
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Debes seleccionar un vehículo';
    }

    if (formData.cost < 0) {
      newErrors.cost = 'El costo no puede ser negativo';
    }

    if (formData.kilometers < 0) {
      newErrors.kilometers = 'El kilometraje no puede ser negativo';
    }

    if (formData.nextDueKilometers > 0 && formData.nextDueKilometers <= formData.kilometers) {
      newErrors.nextDueKilometers = 'El próximo kilometraje debe ser mayor al actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar mantenimiento
  const saveMaintenance = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const maintenanceData: Maintenance = {
        id: maintenanceId || generateId(),
        vehicleId: formData.vehicleId,
        type: formData.type,
        date: formData.date.toISOString(),
        cost: formData.cost,
        kilometers: formData.kilometers,
        notes: formData.notes.trim(),
        photo: formData.photo,
        nextDueDate: formData.nextDueDate,
        nextDueKilometers: formData.nextDueKilometers || undefined,
        createdAt: maintenanceId ? 
          (await AsyncStorageService.getMaintenances()).find(m => m.id === maintenanceId)?.createdAt || new Date().toISOString() : 
          new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorageService.saveMaintenance(maintenanceData);

      // Crear o actualizar recordatorio automático si hay próximo mantenimiento
      if (formData.nextDueDate && selectedVehicle) {
        const reminderId = `${maintenanceData.id}_reminder`;
        
        // Eliminar recordatorio anterior si existe (al editar)
        if (isEditing) {
          try {
            await AsyncStorageService.deleteReminder(reminderId);
          } catch (error) {
            // Si no existe, no hay problema
          }
        }

        const reminder: Reminder = {
          id: reminderId,
          vehicleId: formData.vehicleId,
          maintenanceType: formData.type,
          title: `${getMaintenanceTypeName(formData.type)} - ${selectedVehicle.brand} ${selectedVehicle.model}`,
          description: `Próximo mantenimiento programado para ${selectedVehicle.licensePlate}`,
          dueDate: formData.nextDueDate,
          dueKilometers: formData.nextDueKilometers || undefined,
          isCompleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await AsyncStorageService.saveReminder(reminder);

        // Programar notificación local
        const notificationId = await NotificationService.scheduleReminder(reminder);
        if (notificationId) {
          reminder.notificationId = notificationId;
          await AsyncStorageService.saveReminder(reminder);
        }
      }

      // Actualizar kilometraje del vehículo si es mayor
      if (selectedVehicle && formData.kilometers > selectedVehicle.currentKilometers) {
        const updatedVehicle: Vehicle = {
          ...selectedVehicle,
          currentKilometers: formData.kilometers,
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorageService.saveVehicle(updatedVehicle);
      }

      // Política de intersticial: incrementar contador y mostrar de forma inteligente
      try {
        await bumpAction();
        setTimeout(() => { showInterstitialSmart(); }, 500);
      } catch {}

      Alert.alert(
        'Éxito',
        `Mantenimiento ${isEditing ? 'actualizado' : 'agregado'} correctamente`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving maintenance:', error);
      Alert.alert('Error', 'No se pudo guardar el mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar imagen
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, photo: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Tipos de mantenimiento
  const maintenanceTypes = Object.values(MaintenanceType);

  // Renderizar tipo de mantenimiento
  const renderMaintenanceType = ({ item }: { item: MaintenanceType }) => (
    <TouchableOpacity
      style={[
        styles.typeItem,
        formData.type === item && styles.typeItemSelected,
      ]}
      onPress={() => {
        setFormData(prev => ({ ...prev, type: item }));
        setShowTypePicker(false);
      }}
    >
      <Text style={[
        styles.typeText,
        formData.type === item && styles.typeTextSelected,
      ]}>
        {getMaintenanceTypeName(item)}
      </Text>
    </TouchableOpacity>
  );

  // Renderizar vehículo
  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={[
        styles.typeItem,
        formData.vehicleId === item.id && styles.typeItemSelected,
      ]}
      onPress={() => {
        setSelectedVehicle(item);
        setFormData(prev => ({ 
          ...prev, 
          vehicleId: item.id,
          kilometers: item.currentKilometers // Actualizar kilometraje al cambiar vehículo
        }));
        setShowVehiclePicker(false);
      }}
    >
      <Text style={[
        styles.typeText,
        formData.vehicleId === item.id && styles.typeTextSelected,
      ]}>
        {item.brand} {item.model} ({item.year})
      </Text>
      <Text style={styles.vehicleSubtext}>
        {item.licensePlate} • {item.currentKilometers.toLocaleString()} km
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Información del mantenimiento */}
      <Card>
        <Text style={styles.sectionTitle}>Información del Mantenimiento</Text>
        
        {/* Selector de vehículo */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Vehículo *</Text>
          <TouchableOpacity
            style={[
              styles.picker,
              errors.vehicleId && styles.pickerError,
            ]}
            onPress={() => setShowVehiclePicker(true)}
          >
            <Text style={styles.pickerText}>
              {selectedVehicle 
                ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.year})`
                : 'Seleccionar vehículo'
              }
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
          {errors.vehicleId && <Text style={styles.errorText}>{errors.vehicleId}</Text>}
          {selectedVehicle && (
            <Text style={styles.vehicleInfoText}>
              {selectedVehicle.licensePlate} • Kilometraje actual: {selectedVehicle.currentKilometers.toLocaleString()} km
            </Text>
          )}
        </View>
        
        {/* Tipo de mantenimiento */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Mantenimiento *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowTypePicker(true)}
          >
            <Text style={styles.pickerText}>
              {getMaintenanceTypeName(formData.type)}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
        </View>

        {/* Fecha */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.pickerText}>{formatDate(formData.date)}</Text>
            <Ionicons name="calendar-outline" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
        </View>

        <Input
          label="Costo"
          value={formData.cost.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, cost: parseFloat(text) || 0 }))}
          placeholder="0.00"
          keyboardType="numeric"
          error={errors.cost}
          required
          icon="cash-outline"
        />

        <Input
          label="Kilometraje"
          value={formData.kilometers.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, kilometers: parseInt(text) || 0 }))}
          placeholder="Kilometraje actual"
          keyboardType="numeric"
          error={errors.kilometers}
          required
          icon="speedometer-outline"
        />

        <Input
          label="Notas"
          value={formData.notes}
          onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
          placeholder="Detalles adicionales del mantenimiento"
          multiline
          numberOfLines={3}
        />
      </Card>

      {/* Próximo mantenimiento */}
      <Card>
        <Text style={styles.sectionTitle}>Próximo Mantenimiento (Opcional)</Text>
        
        {/* Próxima fecha */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Próxima Fecha</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowNextDatePicker(true)}
          >
            <Text style={styles.pickerText}>
              {formData.nextDueDate ? formatDate(formData.nextDueDate) : 'Seleccionar fecha'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
        </View>

        <Input
          label="Próximo Kilometraje"
          value={formData.nextDueKilometers.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, nextDueKilometers: parseInt(text) || 0 }))}
          placeholder="Kilometraje para próximo mantenimiento"
          keyboardType="numeric"
          error={errors.nextDueKilometers}
        />
      </Card>

      {/* Foto */}
      <Card>
        <Text style={styles.sectionTitle}>Foto de la Factura (Opcional)</Text>
        <Button
          title={formData.photo ? 'Cambiar Foto' : 'Agregar Foto'}
          icon="camera-outline"
          variant="outline"
          onPress={pickImage}
        />
        {formData.photo && (
          <Button
            title="Eliminar Foto"
            icon="trash-outline"
            variant="danger"
            size="small"
            onPress={() => setFormData(prev => ({ ...prev, photo: '' }))}
            style={styles.removePhotoButton}
          />
        )}
      </Card>

      {/* Botones de acción */}
      <View style={styles.actions}>
        <Button
          title="Cancelar"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        />
        <Button
          title={isEditing ? 'Actualizar' : 'Guardar'}
          onPress={saveMaintenance}
          loading={loading}
          style={styles.actionButton}
        />
      </View>

      {/* Modal selector de vehículo */}
      <Modal
        visible={showVehiclePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVehiclePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Vehículo</Text>
              <TouchableOpacity onPress={() => setShowVehiclePicker(false)}>
                <Ionicons name="close" size={24} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={vehicles}
              renderItem={renderVehicle}
              keyExtractor={(item) => item.id}
              style={styles.typeList}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>
                    No hay vehículos registrados
                  </Text>
                  <TouchableOpacity
                    style={styles.addVehicleButton}
                    onPress={() => {
                      setShowVehiclePicker(false);
                      navigation.navigate('AddEditVehicle');
                    }}
                  >
                    <Text style={styles.addVehicleButtonText}>
                      Agregar Vehículo
                    </Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal selector de tipo */}
      <Modal
        visible={showTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tipo de Mantenimiento</Text>
              <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                <Ionicons name="close" size={24} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={maintenanceTypes}
              renderItem={renderMaintenanceType}
              keyExtractor={(item) => item}
              style={styles.typeList}
            />
          </View>
        </View>
      </Modal>

      {/* DatePicker para fecha */}
      <DatePickerModal
        visible={showDatePicker}
        value={formData.date}
        title="Seleccionar Fecha"
        onClose={() => setShowDatePicker(false)}
        onChange={(date) => setFormData(prev => ({ ...prev, date }))}
      />

      {/* DatePicker para próxima fecha */}
      <DatePickerModal
        visible={showNextDatePicker}
        value={formData.nextDueDate ? new Date(formData.nextDueDate) : new Date()}
        title="Próxima Fecha"
        onClose={() => setShowNextDatePicker(false)}
        onChange={(date) => setFormData(prev => ({ ...prev, nextDueDate: date.toISOString() }))}
      />
    </ScrollView>
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
  vehicleCard: {
    marginBottom: Theme.spacing.md,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  vehicleTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: Theme.spacing.sm,
  },
  vehicleKm: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.md,
  },
  inputContainer: {
    marginVertical: Theme.spacing.sm,
  },
  label: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Theme.spacing.xs,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    height: 44,
    backgroundColor: Colors.white,
  },
  pickerText: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
  },
  removePhotoButton: {
    marginTop: Theme.spacing.sm,
    width: 120,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: Theme.spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  typeList: {
    maxHeight: 400,
  },
  typeItem: {
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  typeItemSelected: {
    backgroundColor: Colors.lightGray,
  },
  typeText: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
  },
  typeTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  pickerError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  errorText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.error,
    marginTop: Theme.spacing.xs,
  },
  vehicleSubtext: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  vehicleInfoText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  emptyListContainer: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  addVehicleButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  addVehicleButtonText: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
  },
});

export default AddEditMaintenanceScreen;

/**
 * Pantalla Agregar/Editar Gasto
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
import { Expense, Vehicle, ExpenseType } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import { generateId, getExpenseTypeName, formatDate } from '../utils/helpers';
import { useAds } from '../hooks/useAds';

// Componentes
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import DatePickerModal from '../components/common/DatePickerModal';

interface AddEditExpenseScreenProps {
  navigation: any;
  route: any;
}

const AddEditExpenseScreen: React.FC<AddEditExpenseScreenProps> = ({
  navigation,
  route,
}) => {
  const { bumpAction, showInterstitialSmart } = useAds();
  const { vehicleId, expenseId } = route.params || {};
  const isEditing = !!expenseId;

  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    type: ExpenseType.FUEL,
    description: '',
    amount: 0,
    date: new Date(),
    category: '',
    photo: '',
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

  // Cargar datos
  useEffect(() => {
    loadData();
  }, [vehicleId, expenseId]);

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
        }
      } else if (vehiclesData.length > 0) {
        // Si no hay vehicleId específico, seleccionar el primero
        setSelectedVehicle(vehiclesData[0]);
        setFormData(prev => ({ ...prev, vehicleId: vehiclesData[0].id }));
      }

      // Cargar gasto si estamos editando
      if (isEditing) {
        const expenses = await AsyncStorageService.getExpenses();
        const expense = expenses.find(e => e.id === expenseId);
        
        if (expense) {
          const expenseVehicle = vehiclesData.find(v => v.id === expense.vehicleId);
          setSelectedVehicle(expenseVehicle || null);
          
          setFormData({
            vehicleId: expense.vehicleId,
            type: expense.type,
            description: expense.description,
            amount: expense.amount,
            date: new Date(expense.date),
            category: expense.category,
            photo: expense.photo || '',
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

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a cero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar gasto
  const saveExpense = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const expenseData: Expense = {
        id: expenseId || generateId(),
        vehicleId: formData.vehicleId,
        type: formData.type,
        description: formData.description.trim(),
        amount: formData.amount,
        date: formData.date.toISOString(),
        category: formData.category.trim() || getExpenseTypeName(formData.type),
        photo: formData.photo,
        createdAt: expenseId ? 
          (await AsyncStorageService.getExpenses()).find(e => e.id === expenseId)?.createdAt || new Date().toISOString() : 
          new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorageService.saveExpense(expenseData);

      try {
        await bumpAction();
        setTimeout(() => { showInterstitialSmart(); }, 500);
      } catch {}

      Alert.alert(
        'Éxito',
        `Gasto ${isEditing ? 'actualizado' : 'agregado'} correctamente`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving expense:', error);
      Alert.alert('Error', 'No se pudo guardar el gasto');
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

  // Tipos de gasto
  const expenseTypes = Object.values(ExpenseType);

  // Renderizar tipo de gasto
  const renderExpenseType = ({ item }: { item: ExpenseType }) => (
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
        {getExpenseTypeName(item)}
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
        setFormData(prev => ({ ...prev, vehicleId: item.id }));
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
      {/* Información del gasto */}
      <Card>
        <Text style={styles.sectionTitle}>Información del Gasto</Text>
        
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
        </View>
        
        {/* Tipo de gasto */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tipo de Gasto *</Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowTypePicker(true)}
          >
            <Text style={styles.pickerText}>
              {getExpenseTypeName(formData.type)}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.darkGray} />
          </TouchableOpacity>
        </View>

        <Input
          label="Descripción"
          value={formData.description}
          onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
          placeholder="Ej: Gasolina, Cambio de aceite, etc."
          error={errors.description}
          required
        />

        <Input
          label="Monto"
          value={formData.amount.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, amount: parseFloat(text) || 0 }))}
          placeholder="0.00"
          keyboardType="numeric"
          error={errors.amount}
          required
          icon="cash-outline"
        />

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
          label="Categoría"
          value={formData.category}
          onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
          placeholder="Categoría personalizada (opcional)"
        />
      </Card>

      {/* Foto */}
      <Card>
        <Text style={styles.sectionTitle}>Foto del Recibo (Opcional)</Text>
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
          onPress={saveExpense}
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
              <Text style={styles.modalTitle}>Tipo de Gasto</Text>
              <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                <Ionicons name="close" size={24} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={expenseTypes}
              renderItem={renderExpenseType}
              keyExtractor={(item) => item}
              style={styles.typeList}
            />
          </View>
        </View>
      </Modal>

      {/* DatePicker */}
      <DatePickerModal
        visible={showDatePicker}
        value={formData.date}
        title="Seleccionar Fecha"
        onClose={() => setShowDatePicker(false)}
        onChange={(date) => setFormData(prev => ({ ...prev, date }))}
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
  },
  vehicleTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: Theme.spacing.sm,
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

export default AddEditExpenseScreen;

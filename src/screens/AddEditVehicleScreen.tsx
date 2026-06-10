/**
 * Pantalla Agregar/Editar Vehículo
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Theme } from '../constants/Colors';
import { Vehicle, Customer } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import { generateId } from '../utils/helpers';
import { useTikTok } from '../hooks/useTracking';

// Componentes
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

interface AddEditVehicleScreenProps {
  navigation: any;
  route: any;
}

const AddEditVehicleScreen: React.FC<AddEditVehicleScreenProps> = ({
  navigation,
  route,
}) => {
  const { vehicleId } = route.params || {};
  const isEditing = !!vehicleId;
  const { trackCustomEvent } = useTikTok();

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    currentKilometers: 0,
    licensePlate: '',
    photo: '',
    customerId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  // Cargar datos del vehículo si estamos editando
  useEffect(() => {
    loadCustomers();
    if (isEditing) {
      loadVehicle();
    }
  }, [vehicleId]);

  const loadCustomers = async () => {
    try {
      const customersData = await AsyncStorageService.getCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadVehicle = async () => {
    try {
      const vehicles = await AsyncStorageService.getVehicles();
      const vehicle = vehicles.find(v => v.id === vehicleId);
      
      if (vehicle) {
        setFormData({
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          currentKilometers: vehicle.currentKilometers,
          licensePlate: vehicle.licensePlate,
          photo: vehicle.photo || '',
          customerId: vehicle.customerId || '',
        });
      }
    } catch (error) {
      console.error('Error loading vehicle:', error);
      Alert.alert('Error', 'No se pudo cargar la información del vehículo');
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brand.trim()) {
      newErrors.brand = 'La marca es requerida';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'El modelo es requerido';
    }

    if (formData.year < 1980 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'El año debe estar entre 1980 y ' + (new Date().getFullYear() + 1);
    }

    if (formData.currentKilometers < 0) {
      newErrors.currentKilometers = 'El kilometraje no puede ser negativo';
    }

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'La placa es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar vehículo
  const saveVehicle = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const vehicleData: Vehicle = {
        id: vehicleId || generateId(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        year: formData.year,
        currentKilometers: formData.currentKilometers,
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        customerId: formData.customerId || undefined,
        photo: formData.photo,
        createdAt: vehicleId ? (await AsyncStorageService.getVehicles()).find(v => v.id === vehicleId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorageService.saveVehicle(vehicleData);
      await trackCustomEvent(isEditing ? 'vehicle_updated' : 'vehicle_created', {
        vehicle_id: vehicleData.id,
        has_customer: Boolean(vehicleData.customerId),
      });

      Alert.alert(
        'Éxito',
        `Vehículo ${isEditing ? 'actualizado' : 'agregado'} correctamente`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving vehicle:', error);
      Alert.alert('Error', 'No se pudo guardar el vehículo');
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

      setImageLoading(true);

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
    } finally {
      setImageLoading(false);
    }
  };

  // Tomar foto
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos para acceder a la cámara');
        return;
      }

      setImageLoading(true);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({ ...prev, photo: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    } finally {
      setImageLoading(false);
    }
  };

  // Mostrar opciones de imagen
  const showImageOptions = () => {
    Alert.alert(
      'Seleccionar Imagen',
      'Elige una opción para la foto del vehículo',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galería', onPress: pickImage },
        { text: 'Cámara', onPress: takePhoto },
        ...(formData.photo ? [{ text: 'Eliminar', onPress: () => setFormData(prev => ({ ...prev, photo: '' })), style: 'destructive' as const }] : []),
      ]
    );
  };

  const selectedCustomer = customers.find(customer => customer.id === formData.customerId);

  const selectCustomer = (customerId: string) => {
    setFormData(prev => ({ ...prev, customerId }));
    setShowCustomerModal(false);
  };

  const createCustomer = async () => {
    if (!customerForm.name.trim()) {
      Alert.alert('Campo requerido', 'El nombre del cliente es obligatorio.');
      return;
    }

    try {
      setLoading(true);
      const customer: Customer = {
        id: generateId(),
        name: customerForm.name.trim(),
        phone: customerForm.phone.trim() || undefined,
        email: customerForm.email.trim() || undefined,
        notes: customerForm.notes.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorageService.saveCustomer(customer);
      await loadCustomers();
      await trackCustomEvent('customer_created', {
        customer_id: customer.id,
        has_phone: Boolean(customer.phone),
        has_email: Boolean(customer.email),
      });

      setCustomerForm({ name: '', phone: '', email: '', notes: '' });
      setShowCreateCustomerModal(false);
      setFormData(prev => ({ ...prev, customerId: customer.id }));
      Alert.alert('Éxito', 'Cliente creado y asignado al vehículo.');
    } catch (error) {
      console.error('Error creating customer:', error);
      Alert.alert('Error', 'No se pudo crear el cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
      {/* Imagen del vehículo */}
      <Card style={styles.imageCard}>
        <Text style={styles.sectionTitle}>Foto del Vehículo</Text>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={showImageOptions}
          disabled={imageLoading}
        >
          {formData.photo ? (
            <Image source={{ uri: formData.photo }} style={styles.vehicleImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color={Colors.mediumGray} />
              <Text style={styles.imagePlaceholderText}>Toca para agregar foto</Text>
            </View>
          )}
          
          {imageLoading && (
            <View style={styles.imageOverlay}>
              <Text style={styles.imageLoadingText}>Cargando...</Text>
            </View>
          )}
        </TouchableOpacity>
      </Card>

      {/* Información básica */}
      <Card>
        <Text style={styles.sectionTitle}>Información Básica</Text>
        
        <Input
          label="Marca"
          value={formData.brand}
          onChangeText={(text) => setFormData(prev => ({ ...prev, brand: text }))}
          placeholder="Ej: Toyota, Ford, Chevrolet"
          error={errors.brand}
          required
          icon="car-outline"
        />

        <Input
          label="Modelo"
          value={formData.model}
          onChangeText={(text) => setFormData(prev => ({ ...prev, model: text }))}
          placeholder="Ej: Corolla, F-150, Aveo"
          error={errors.model}
          required
        />

        <Input
          label="Año"
          value={formData.year.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, year: parseInt(text) || new Date().getFullYear() }))}
          placeholder="Ej: 2020"
          keyboardType="numeric"
          error={errors.year}
          required
          icon="calendar-outline"
        />

        <Input
          label="Placa"
          value={formData.licensePlate}
          onChangeText={(text) => setFormData(prev => ({ ...prev, licensePlate: text.toUpperCase() }))}
          placeholder="Ej: ABC-123"
          autoCapitalize="characters"
          error={errors.licensePlate}
          required
        />

        <Input
          label="Kilometraje Actual"
          value={formData.currentKilometers.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, currentKilometers: parseInt(text) || 0 }))}
          placeholder="Ej: 50000"
          keyboardType="numeric"
          error={errors.currentKilometers}
          required
          icon="speedometer-outline"
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Cliente (Opcional)</Text>
        <TouchableOpacity
          style={styles.customerSelector}
          onPress={() => setShowCustomerModal(true)}
        >
          <View style={styles.customerSelectorInfo}>
            <Text style={styles.customerSelectorLabel}>Asignado a</Text>
            <Text style={styles.customerSelectorValue}>
              {selectedCustomer ? selectedCustomer.name : 'Sin cliente'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.darkGray} />
        </TouchableOpacity>
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
          onPress={saveVehicle}
          loading={loading}
          style={styles.actionButton}
        />
      </View>

      <Modal
        visible={showCustomerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomerModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Cliente</Text>
              <TouchableOpacity onPress={() => setShowCustomerModal(false)}>
                <Ionicons name="close" size={24} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.customerItem}
              onPress={() => selectCustomer('')}
            >
              <View>
                <Text style={styles.customerName}>Sin cliente</Text>
                <Text style={styles.customerMeta}>Uso personal o sin asignación</Text>
              </View>
              {!formData.customerId && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <FlatList
              data={customers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => selectCustomer(item.id)}
                >
                  <View style={styles.customerItemInfo}>
                    <Text style={styles.customerName}>{item.name}</Text>
                    <Text style={styles.customerMeta}>{item.phone || item.email || 'Sin contacto'}</Text>
                  </View>
                  {formData.customerId === item.id && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyCustomerText}>Aún no tienes clientes registrados.</Text>
              }
              style={styles.customerList}
            />

            <View style={styles.modalActions}>
              <Button
                title="Nuevo Cliente"
                icon="person-add-outline"
                variant="outline"
                onPress={() => {
                  setShowCustomerModal(false);
                  setShowCreateCustomerModal(true);
                }}
                style={styles.modalActionButton}
              />
              <Button
                title="Cerrar"
                onPress={() => setShowCustomerModal(false)}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCreateCustomerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateCustomerModal(false)}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardAvoid}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Nuevo Cliente</Text>
                <TouchableOpacity onPress={() => setShowCreateCustomerModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.darkGray} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.createCustomerForm}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.createCustomerFormContent}
              >
                <Input
                  label="Nombre"
                  value={customerForm.name}
                  onChangeText={(text) => setCustomerForm(prev => ({ ...prev, name: text }))}
                  placeholder="Nombre del cliente"
                  required
                />
                <Input
                  label="Teléfono"
                  value={customerForm.phone}
                  onChangeText={(text) => setCustomerForm(prev => ({ ...prev, phone: text }))}
                  placeholder="Ej: +51999999999"
                  keyboardType="phone-pad"
                />
                <Input
                  label="Email"
                  value={customerForm.email}
                  onChangeText={(text) => setCustomerForm(prev => ({ ...prev, email: text }))}
                  placeholder="correo@dominio.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Input
                  label="Notas"
                  value={customerForm.notes}
                  onChangeText={(text) => setCustomerForm(prev => ({ ...prev, notes: text }))}
                  placeholder="Información adicional (opcional)"
                />
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  title="Cancelar"
                  variant="outline"
                  onPress={() => setShowCreateCustomerModal(false)}
                  style={styles.modalActionButton}
                />
                <Button
                  title="Guardar Cliente"
                  onPress={createCustomer}
                  loading={loading}
                  style={styles.modalActionButton}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScrollView>
    </KeyboardAvoidingView>
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
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.md,
  },
  imageCard: {
    marginBottom: Theme.spacing.md,
  },
  imageContainer: {
    alignItems: 'center',
  },
  vehicleImage: {
    width: 200,
    height: 150,
    borderRadius: Theme.borderRadius.lg,
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.sm,
    textAlign: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLoadingText: {
    color: Colors.white,
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  customerSelectorInfo: {
    flex: 1,
  },
  customerSelectorLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
  },
  customerSelectorValue: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Theme.spacing.xs,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalKeyboardAvoid: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
    maxHeight: '90%',
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
  customerList: {
    maxHeight: 300,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  customerItemInfo: {
    flex: 1,
    paddingRight: Theme.spacing.sm,
  },
  customerName: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  customerMeta: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  emptyCustomerText: {
    padding: Theme.spacing.md,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Theme.fontSize.md,
  },
  createCustomerForm: {
    paddingHorizontal: Theme.spacing.md,
    maxHeight: 350,
  },
  createCustomerFormContent: {
    paddingBottom: Theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalActionButton: {
    flex: 1,
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
});

export default AddEditVehicleScreen;

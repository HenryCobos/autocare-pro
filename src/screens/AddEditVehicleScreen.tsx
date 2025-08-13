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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Theme } from '../constants/Colors';
import { Vehicle } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import { generateId, getVehicleYearOptions } from '../utils/helpers';

// Componentes
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAds } from '../hooks/useAds';

interface AddEditVehicleScreenProps {
  navigation: any;
  route: any;
}

const AddEditVehicleScreen: React.FC<AddEditVehicleScreenProps> = ({
  navigation,
  route,
}) => {
  const { bumpAction, showInterstitialSmart } = useAds();
  const { vehicleId } = route.params || {};
  const isEditing = !!vehicleId;

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    currentKilometers: 0,
    licensePlate: '',
    photo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // Cargar datos del vehículo si estamos editando
  useEffect(() => {
    if (isEditing) {
      loadVehicle();
    }
  }, [vehicleId]);

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
        photo: formData.photo,
        createdAt: vehicleId ? (await AsyncStorageService.getVehicles()).find(v => v.id === vehicleId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorageService.saveVehicle(vehicleData);

      try {
        await bumpAction();
        setTimeout(() => { showInterstitialSmart(); }, 500);
      } catch {}

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

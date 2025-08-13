/**
 * Pantalla de Configuración
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { AppSettings } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import NotificationService from '../services/NotificationService';

// Componentes
import Card from '../components/common/Card';
import Button from '../components/common/Button';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [settings, setSettings] = useState<AppSettings>({
    language: 'es',
    notifications: true,
    reminderDays: 7,
    currency: 'MXN',
    distanceUnit: 'km',
  });
  const [loading, setLoading] = useState(false);

  // Cargar configuración
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorageService.getSettings();
      setSettings(savedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Guardar configuración
  const saveSettings = async (newSettings: AppSettings) => {
    try {
      setLoading(true);
      await AsyncStorageService.saveSettings(newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  // Alternar notificaciones
  const toggleNotifications = async (enabled: boolean) => {
    const newSettings = { ...settings, notifications: enabled };
    
    if (enabled) {
      const hasPermission = await NotificationService.requestPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permisos de Notificación',
          'Para recibir recordatorios, necesitas habilitar las notificaciones en la configuración del sistema.'
        );
        return;
      }
    }
    
    await saveSettings(newSettings);
  };

  // Cambiar días de recordatorio
  const changeReminderDays = () => {
    Alert.alert(
      'Días de Recordatorio',
      'Selecciona cuántos días antes quieres recibir recordatorios',
      [
        { text: '3 días', onPress: () => saveSettings({ ...settings, reminderDays: 3 }) },
        { text: '7 días', onPress: () => saveSettings({ ...settings, reminderDays: 7 }) },
        { text: '15 días', onPress: () => saveSettings({ ...settings, reminderDays: 15 }) },
        { text: '30 días', onPress: () => saveSettings({ ...settings, reminderDays: 30 }) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  // Cambiar moneda
  const changeCurrency = () => {
    Alert.alert(
      'Moneda',
      'Selecciona la moneda que prefieres usar',
      [
        { text: 'Peso Mexicano (MXN)', onPress: () => saveSettings({ ...settings, currency: 'MXN' }) },
        { text: 'Dólar Americano (USD)', onPress: () => saveSettings({ ...settings, currency: 'USD' }) },
        { text: 'Euro (EUR)', onPress: () => saveSettings({ ...settings, currency: 'EUR' }) },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  // Limpiar datos
  const clearAllData = () => {
    Alert.alert(
      'Limpiar Todos los Datos',
      '⚠️ Esta acción eliminará TODOS tus vehículos, mantenimientos, gastos y recordatorios. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorageService.clearAllData();
              await NotificationService.clearAllNotifications();
              Alert.alert('Éxito', 'Todos los datos han sido eliminados');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'No se pudieron eliminar todos los datos');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Cargar configuración al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  // Renderizar opción de configuración
  const renderSettingItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color={Colors.primary} />
      </View>
      
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      
      {rightComponent || (onPress && (
        <Ionicons name="chevron-forward" size={20} color={Colors.darkGray} />
      ))}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Notificaciones */}
      <Card>
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        
        {renderSettingItem(
          'notifications-outline',
          'Notificaciones',
          'Recibir recordatorios de mantenimiento',
          undefined,
          <Switch
            value={settings.notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: Colors.mediumGray, true: Colors.primary }}
            thumbColor={Colors.white}
          />
        )}
        
        {renderSettingItem(
          'time-outline',
          'Días de Recordatorio',
          `Recordar ${settings.reminderDays} días antes`,
          changeReminderDays
        )}
      </Card>

      {/* Preferencias */}
      <Card>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        
        {renderSettingItem(
          'cash-outline',
          'Moneda',
          `Moneda predeterminada: ${settings.currency}`,
          changeCurrency
        )}
        
        {renderSettingItem(
          'speedometer-outline',
          'Unidad de Distancia',
          `Usar ${settings.distanceUnit}`,
          () => {
            const newUnit = settings.distanceUnit === 'km' ? 'miles' : 'km';
            saveSettings({ ...settings, distanceUnit: newUnit });
          }
        )}
      </Card>

      {/* Datos */}
      <Card>
        <Text style={styles.sectionTitle}>Gestión de Datos</Text>
        
        {renderSettingItem(
          'trash-outline',
          'Limpiar Todos los Datos',
          'Eliminar todos los vehículos y registros',
          clearAllData
        )}
      </Card>

      {/* Información de la App */}
      <Card>
        <Text style={styles.sectionTitle}>Información</Text>
        
        {renderSettingItem(
          'information-circle-outline',
          'Versión de la App',
          '1.0.0'
        )}
        
        {renderSettingItem(
          'help-circle-outline',
          'Ayuda y Soporte',
          'Obtener ayuda con la aplicación',
          () => Alert.alert(
            'Ayuda y Soporte',
            'Para obtener ayuda con AutoCare Pro, visita nuestro sitio web o contáctanos por email.\n\nEsta es una aplicación demo creada para gestión de mantenimiento vehicular.'
          )
        )}
        
        {renderSettingItem(
          'star-outline',
          'Calificar App',
          'Califica AutoCare Pro en la App Store',
          () => Alert.alert(
            'Calificar App',
            '¡Gracias por usar AutoCare Pro! Tu calificación nos ayuda a mejorar.'
          )
        )}
      </Card>

      {/* Espaciado inferior */}
      <View style={styles.bottomSpacing} />
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  settingSubtitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  bottomSpacing: {
    height: Theme.spacing.xl,
  },
});

export default SettingsScreen;

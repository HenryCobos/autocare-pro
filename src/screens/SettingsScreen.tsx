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
  Modal,
  FlatList,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { AppSettings } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import NotificationService from '../services/NotificationService';
import BackupService from '../services/BackupService';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PLAN_FEATURES } from '../types/subscription';
import {
  ALL_CURRENCIES,
  LATIN_AMERICA_CURRENCIES,
  CENTRAL_NORTH_AMERICA_CURRENCIES,
  EUROPE_CURRENCIES,
  Currency,
  getCurrencyByCode,
} from '../constants/currencies';
import { useTikTok, TikTokCustomEvent } from '../hooks/useTracking';
import Constants from 'expo-constants';

// Componentes
import Card from '../components/common/Card';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { currentPlan, isActive, isPro, isPremium } = useSubscription();
  const { trackCustomEvent } = useTikTok();
  const [settings, setSettings] = useState<AppSettings>({
    language: 'es',
    notifications: true,
    reminderDays: 7,
    currency: 'MXN',
    distanceUnit: 'km',
  });
  const [loading, setLoading] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '—';
  const diagnosticsEnabled = Constants.expoConfig?.extra?.enableDiagnostics === true;
  const supportEmail = 'apper2025@icloud.com';
  const supportWhatsAppNumber = '51994277540';

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
  const changeCurrency = (currencyCode: string) => {
    setShowCurrencyPicker(false);
    saveSettings({ ...settings, currency: currencyCode });
  };

  // Obtener nombre de moneda
  const getCurrencyName = (code: string): string => {
    const currency = getCurrencyByCode(code);
    return currency ? `${currency.name} (${currency.code})` : code;
  };

  // Renderizar moneda
  const renderCurrency = ({ item }: { item: Currency }) => (
    <TouchableOpacity
      style={[
        styles.currencyItem,
        settings.currency === item.code && styles.currencyItemSelected,
      ]}
      onPress={() => changeCurrency(item.code)}
    >
      <View style={styles.currencyInfo}>
        <Text style={[
          styles.currencyCode,
          settings.currency === item.code && styles.currencyCodeSelected,
        ]}>
          {item.code}
        </Text>
        <Text style={[
          styles.currencyName,
          settings.currency === item.code && styles.currencyNameSelected,
        ]}>
          {item.name}
        </Text>
      </View>
      <Text style={[
        styles.currencySymbol,
        settings.currency === item.code && styles.currencySymbolSelected,
      ]}>
        {item.symbol}
      </Text>
    </TouchableOpacity>
  );

  // Agrupar monedas para FlatList
  const currencySections = [
    { title: 'Latinoamérica', data: LATIN_AMERICA_CURRENCIES },
    { title: 'América del Norte/Centro', data: CENTRAL_NORTH_AMERICA_CURRENCIES },
    { title: 'Europa', data: EUROPE_CURRENCIES },
  ];

  // Reiniciar onboarding
  const resetOnboarding = () => {
    Alert.alert(
      'Reiniciar Tutorial',
      '¿Deseas ver el tutorial de bienvenida nuevamente? La aplicación se reiniciará.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ver Tutorial',
          onPress: async () => {
            try {
              setLoading(true);
              await AsyncStorageService.resetOnboarding();
              // Reiniciar la app navegando al onboarding
              navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' as never }],
              });
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert('Error', 'No se pudo reiniciar el tutorial');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Descargar respaldo local en archivo JSON
  const downloadBackup = async () => {
    try {
      setLoading(true);
      const result = await BackupService.exportBackup();
      if (result.success) {
        await trackCustomEvent(TikTokCustomEvent.BACKUP_EXPORTED);
        Alert.alert(
          'Respaldo generado',
          'Se abrió el menú para guardar o compartir tu archivo de respaldo.'
        );
      } else {
        Alert.alert('No se pudo crear el respaldo', result.error || 'Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      Alert.alert('Error', 'No se pudo crear el respaldo');
    } finally {
      setLoading(false);
    }
  };

  // Restaurar respaldo desde archivo JSON
  const restoreBackup = () => {
    Alert.alert(
      'Restaurar respaldo',
      'Esta acción reemplazará los datos actuales (vehículos, mantenimientos, gastos, recordatorios y ajustes) por los del archivo seleccionado.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Seleccionar archivo',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await BackupService.restoreBackupFromFile();

              if (result.success) {
                await loadSettings();
                Alert.alert(
                  'Respaldo restaurado',
                  'Tus datos fueron restaurados correctamente.'
                );
              } else if (result.error !== 'Selección cancelada.') {
                Alert.alert('No se pudo restaurar', result.error || 'Intenta con otro archivo.');
              }
            } catch (error) {
              console.error('Error restoring backup:', error);
              Alert.alert('Error', 'No se pudo restaurar el respaldo');
            } finally {
              setLoading(false);
            }
          },
        },
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

  // Abrir enlaces externos de forma segura
  const openExternalLink = async (url: string, fallbackError: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('No disponible', fallbackError);
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening external link:', error);
      Alert.alert('Error', 'No se pudo abrir el enlace.');
    }
  };

  // Contacto por correo
  const contactByEmail = async () => {
    const subject = encodeURIComponent('Soporte AutoCare Pro');
    const body = encodeURIComponent(
      'Hola, necesito ayuda con AutoCare Pro.\n\nDetalle de mi consulta:\n'
    );
    const mailtoUrl = `mailto:${supportEmail}?subject=${subject}&body=${body}`;

    await trackCustomEvent(TikTokCustomEvent.CONTACT_SUPPORT, { content_id: 'email' });
    await openExternalLink(
      mailtoUrl,
      `No se pudo abrir la app de correo. Escríbenos a ${supportEmail}.`
    );
  };

  // Contacto por WhatsApp
  const contactByWhatsApp = async () => {
    const message = encodeURIComponent(
      'Hola, necesito ayuda con AutoCare Pro.'
    );
    const whatsappUrl = `https://wa.me/${supportWhatsAppNumber}?text=${message}`;

    await trackCustomEvent(TikTokCustomEvent.CONTACT_SUPPORT, { content_id: 'whatsapp' });
    await openExternalLink(
      whatsappUrl,
      `No se pudo abrir WhatsApp. Puedes escribir al +${supportWhatsAppNumber}.`
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
      {/* Suscripción */}
      <Card>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionIcon}>{PLAN_FEATURES[currentPlan].icon}</Text>
            <View style={styles.subscriptionText}>
              <Text style={styles.subscriptionPlan}>{PLAN_FEATURES[currentPlan].name}</Text>
              <Text style={styles.subscriptionStatus}>
                {isActive ? 'Activo' : 'Plan Gratuito'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.manageButton}
            onPress={() => navigation.navigate('SubscriptionManagement')}
          >
            <Text style={styles.manageButtonText}>
              {isPro || isPremium ? 'Gestionar' : 'Mejorar'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Preferencias */}
      <Card>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        
        {renderSettingItem(
          'cash-outline',
          'Moneda',
          getCurrencyName(settings.currency),
          () => setShowCurrencyPicker(true)
        )}
      </Card>

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

      {/* Gestión de Datos */}
      <Card>
        <Text style={styles.sectionTitle}>Datos</Text>
        
        {renderSettingItem(
          'download-outline',
          'Descargar Respaldo',
          'Guardar una copia de seguridad de tus datos',
          downloadBackup
        )}

        {renderSettingItem(
          'cloud-upload-outline',
          'Restaurar Respaldo',
          'Importar datos desde un archivo de respaldo',
          restoreBackup
        )}

        {renderSettingItem(
          'rocket-outline',
          'Ver Tutorial de Inicio',
          'Volver a ver la guía de bienvenida',
          resetOnboarding
        )}
        
        {renderSettingItem(
          'trash-outline',
          'Limpiar Todos los Datos',
          'Eliminar todos los vehículos y registros',
          clearAllData
        )}
      </Card>

      {/* Soporte y Ayuda */}
      <Card>
        <Text style={styles.sectionTitle}>Soporte y Ayuda</Text>

        {renderSettingItem(
          'mail-outline',
          'Contactar por Email',
          supportEmail,
          contactByEmail
        )}

        {renderSettingItem(
          'logo-whatsapp',
          'Contactar por WhatsApp',
          '+51994277540',
          contactByWhatsApp
        )}
      </Card>

      {diagnosticsEnabled && (
        <Card>
          <Text style={styles.sectionTitle}>Build interno</Text>
          {renderSettingItem(
            'pulse-outline',
            'Diagnóstico TikTok',
            'Verificar SDK y enviar evento de prueba',
            () => navigation.navigate('TikTokDiagnostics')
          )}
        </Card>
      )}

      {/* Versión de la app */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>AutoCare Pro v{appVersion}</Text>
      </View>

      {/* Espaciado inferior */}
      <View style={styles.bottomSpacing} />

      {/* Modal selector de moneda */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Moneda</Text>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                <Ionicons name="close" size={24} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={currencySections}
              keyExtractor={(item, index) => `section-${index}`}
              renderItem={({ item: section }) => (
                <View>
                  <Text style={styles.sectionHeader}>{section.title}</Text>
                  {section.data.map((currency) => (
                    <View key={currency.code}>
                      {renderCurrency({ item: currency })}
                    </View>
                  ))}
                </View>
              )}
              style={styles.currencyList}
            />
          </View>
        </View>
      </Modal>
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
  versionContainer: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  versionText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textLight,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subscriptionIcon: {
    fontSize: 40,
    marginRight: Theme.spacing.md,
  },
  subscriptionText: {
    flex: 1,
  },
  subscriptionPlan: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subscriptionStatus: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    gap: 4,
  },
  manageButtonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.primary,
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
    maxHeight: '80%',
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
  currencyList: {
    maxHeight: 500,
  },
  sectionHeader: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: Colors.lightGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  currencyItemSelected: {
    backgroundColor: Colors.lightGray,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  currencyCodeSelected: {
    color: Colors.primary,
  },
  currencyName: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  currencyNameSelected: {
    color: Colors.primary,
  },
  currencySymbol: {
    fontSize: Theme.fontSize.lg,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: Theme.spacing.md,
  },
  currencySymbolSelected: {
    color: Colors.primary,
  },
});

export default SettingsScreen;

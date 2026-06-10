import 'react-native-gesture-handler';
/**
 * AutoCare Pro - Aplicación de gestión de mantenimiento vehicular
 * Desarrollada con React Native y Expo
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Navegación
import AppNavigator from './src/navigation/AppNavigator';

// Hooks
import { useNotifications } from './src/hooks/useNotifications';
import { useTrackingTransparency } from './src/hooks/useTracking';
import { TikTokAnalyticsService } from './src/services/TikTokAnalyticsService';

// Contextos
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { TikTokProvider } from './src/contexts/TikTokContext';

// Colores
import { Colors } from './src/constants/Colors';

export default function App() {
  // Ignorar warnings no críticos que podrían cerrar en release si se tratan como errores
  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'expo-notifications',
  ]);

  // Inicializar notificaciones
  useNotifications();
  const { canTrack, advertisingId } = useTrackingTransparency();

  useEffect(() => {
    TikTokAnalyticsService.setTrackingAuthorization(canTrack, advertisingId);
  }, [canTrack, advertisingId]);

  return (
    <SafeAreaProvider>
      <TikTokProvider>
        <SubscriptionProvider>
          <View style={styles.container}>
            <StatusBar style="light" backgroundColor={Colors.primary} />
            <AppNavigator />
          </View>
        </SubscriptionProvider>
      </TikTokProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

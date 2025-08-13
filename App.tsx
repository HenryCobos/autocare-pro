import 'react-native-gesture-handler';
/**
 * AutoCare Pro - Aplicación de gestión de mantenimiento vehicular
 * Desarrollada con React Native y Expo
 */
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Navegación
import AppNavigator from './src/navigation/AppNavigator';

// Hooks
import { useNotifications } from './src/hooks/useNotifications';
import { useTrackingTransparency } from './src/hooks/useTracking';

// Colores
import { Colors } from './src/constants/Colors';

export default function App() {
  // Ignorar warnings no críticos que podrían cerrar en release si se tratan como errores
  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'expo-notifications',
    'RNGoogleMobileAds',
  ]);
  // Inicializar notificaciones
  useNotifications();
  // Solicitar ATT en iOS
  useTrackingTransparency();

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" backgroundColor={Colors.primary} />
        <AppNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

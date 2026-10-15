import 'react-native-gesture-handler';
/**
 * AutoCare Pro - Aplicación de gestión de mantenimiento vehicular
 * Desarrollada con React Native y Expo
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import AttTrackingGate from './src/components/AttTrackingGate';

import { useNotifications } from './src/hooks/useNotifications';
import { useTrackingTransparency } from './src/hooks/useTracking';
import { TikTokAnalyticsService } from './src/services/TikTokAnalyticsService';

import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { TikTokProvider } from './src/contexts/TikTokContext';

import { Colors } from './src/constants/Colors';

export default function App() {
  LogBox.ignoreLogs([
    'new NativeEventEmitter',
    'expo-notifications',
  ]);

  useNotifications();

  const tracking = useTrackingTransparency();
  const { canTrack, attFlowComplete, isLoading: attLoading } = tracking;

  const trackingResolved = !attLoading && attFlowComplete;

  useEffect(() => {
    TikTokAnalyticsService.setTrackingAuthorization(canTrack);
  }, [canTrack]);

  return (
    <SafeAreaProvider>
      <TikTokProvider trackingResolved={trackingResolved}>
        <SubscriptionProvider>
          <View style={styles.container}>
            <StatusBar style="light" backgroundColor={Colors.primary} />
            <AttTrackingGate
              status={tracking.status}
              isLoading={tracking.isLoading}
              hasRequested={tracking.hasRequested}
              attFlowComplete={tracking.attFlowComplete}
              requestPermission={tracking.requestPermission}
            >
              <AppNavigator />
            </AttTrackingGate>
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

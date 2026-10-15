/**
 * Muestra una pantalla mínima y solicita ATT cuando la app está activa y la UI lista.
 * Requisito Apple: el diálogo antes de recopilar datos de tracking (p. ej. TikTok SDK).
 */
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import type { TrackingPermissionStatus } from '../hooks/useTracking';

interface AttTrackingGateProps {
  children: React.ReactNode;
  status: TrackingPermissionStatus;
  isLoading: boolean;
  hasRequested: boolean;
  attFlowComplete: boolean;
  requestPermission: () => Promise<void>;
}

const AttTrackingGate: React.FC<AttTrackingGateProps> = ({
  children,
  status,
  isLoading,
  hasRequested,
  attFlowComplete,
  requestPermission,
}) => {
  const requestInFlight = useRef(false);
  const retriedOnActive = useRef(false);

  const tryRequestWhenReady = () => {
    if (Platform.OS !== 'ios') return;
    if (isLoading || requestInFlight.current) return;
    if (status !== 'undetermined') return;
    if (AppState.currentState !== 'active') return;

    requestInFlight.current = true;
    InteractionManager.runAfterInteractions(() => {
      requestPermission().finally(() => {
        requestInFlight.current = false;
      });
    });
  };

  useEffect(() => {
    if (isLoading) return;
    if (status !== 'undetermined') return;
    if (hasRequested) return;

    tryRequestWhenReady();
  }, [isLoading, status, hasRequested]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState !== 'active') return;
      if (status !== 'undetermined' || hasRequested) return;
      if (retriedOnActive.current) return;

      retriedOnActive.current = true;
      tryRequestWhenReady();
    };

    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, [status, hasRequested, isLoading]);

  if (Platform.OS !== 'ios' || attFlowComplete) {
    return <>{children}</>;
  }

  return (
    <View style={styles.gate}>
      <ActivityIndicator size="large" color={Colors.white} />
      <Text style={styles.gateText}>AutoCare Pro</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  gate: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  gateText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default AttTrackingGate;

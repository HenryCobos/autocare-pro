/**
 * Pantalla de Diagnóstico TikTok
 * Accesible desde Configuración tocando la versión 5 veces.
 * Valida el estado completo de la integración antes de un build de producción.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Colors, Theme } from '../constants/Colors';
import Card from '../components/common/Card';
import {
  TikTokAnalyticsService,
  TikTokDiagnosticsData,
  TikTokTestEventResult,
} from '../services/TikTokAnalyticsService';
import { useTrackingTransparency } from '../hooks/useTracking';

const EXPECTED_APP_ID = '7594619183767879698';
const EXPECTED_APP_STORE_ID = '6749963091';

interface CheckRowProps {
  label: string;
  value: string;
  pass: boolean | null;
  note?: string;
}

const CheckRow: React.FC<CheckRowProps> = ({ label, value, pass, note }) => {
  const iconName =
    pass === null ? 'remove-circle-outline' : pass ? 'checkmark-circle' : 'close-circle';
  const iconColor =
    pass === null ? Colors.textLight : pass ? Colors.success : Colors.error;

  return (
    <View style={styles.checkRow}>
      <Ionicons name={iconName as any} size={20} color={iconColor} style={styles.checkIcon} />
      <View style={styles.checkContent}>
        <Text style={styles.checkLabel}>{label}</Text>
        <Text style={[styles.checkValue, !pass && pass !== null && styles.checkValueFail]}>
          {value}
        </Text>
        {note ? <Text style={styles.checkNote}>{note}</Text> : null}
      </View>
    </View>
  );
};

interface SectionTitleProps {
  title: string;
  iconName: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, iconName }) => (
  <View style={styles.sectionHeader}>
    <Ionicons name={iconName as any} size={16} color={Colors.primary} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const TikTokDiagnosticsScreen: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<TikTokDiagnosticsData | null>(null);
  const [testResult, setTestResult] = useState<TikTokTestEventResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const { status: attStatus, advertisingId, isLoading: attLoading } = useTrackingTransparency();

  const refreshDiagnostics = useCallback(() => {
    setDiagnostics(TikTokAnalyticsService.getDiagnostics());
  }, []);

  useEffect(() => {
    refreshDiagnostics();
  }, [refreshDiagnostics]);

  const handleSendTestEvent = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await TikTokAnalyticsService.sendTestEventDirect();
    setTestResult(result);
    setIsTesting(false);
  };

  const appVersion = Constants.expoConfig?.version ?? '—';
  const buildNumber =
    Platform.OS === 'ios'
      ? (Constants.expoConfig?.ios?.buildNumber ?? '—')
      : (Constants.expoConfig?.android?.versionCode?.toString() ?? '—');

  const allChecksPass =
    diagnostics !== null &&
    diagnostics.isInitialized &&
    diagnostics.nativeModuleAvailable &&
    diagnostics.appId === EXPECTED_APP_ID &&
    diagnostics.appStoreId === EXPECTED_APP_STORE_ID &&
    diagnostics.hasAccessToken &&
    !diagnostics.testMode &&
    attStatus === 'granted';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Banner de estado general */}
      <View style={[styles.banner, allChecksPass ? styles.bannerPass : styles.bannerFail]}>
        <Ionicons
          name={allChecksPass ? 'shield-checkmark' : 'warning'}
          size={28}
          color={Colors.white}
        />
        <View style={styles.bannerText}>
          <Text style={styles.bannerTitle}>
            {allChecksPass ? 'Listo para producción' : 'Requiere atención'}
          </Text>
          <Text style={styles.bannerSubtitle}>
            {allChecksPass
              ? 'Todos los checks pasaron. Puedes hacer el build de producción.'
              : 'Revisa los items en rojo antes de hacer el build de producción.'}
          </Text>
        </View>
      </View>

      {/* SDK Status */}
      <Card style={styles.card}>
        <SectionTitle title="Estado del SDK" iconName="pulse" />
        <CheckRow
          label="Módulo nativo"
          value={diagnostics?.nativeModuleAvailable ? 'Disponible ✓' : 'No disponible (JS stub)'}
          pass={diagnostics?.nativeModuleAvailable ?? false}
          note={
            diagnostics && !diagnostics.nativeModuleAvailable
              ? 'El módulo nativo solo está disponible en builds de EAS (development/preview/production), no en Expo Go.'
              : undefined
          }
        />
        <CheckRow
          label="Servicio inicializado"
          value={diagnostics?.isInitialized ? 'Sí' : 'No'}
          pass={diagnostics?.isInitialized ?? false}
        />
        {diagnostics?.initError ? (
          <CheckRow
            label="Error de inicialización"
            value={diagnostics.initError}
            pass={false}
          />
        ) : null}
        <CheckRow
          label="Modo de operación"
          value={diagnostics?.testMode === false ? 'PRODUCCIÓN' : 'TEST (eventos no se envían)'}
          pass={diagnostics?.testMode === false}
          note={
            diagnostics?.testMode
              ? 'Modo desarrollo (__DEV__): los eventos no llegan a TikTok.'
              : undefined
          }
        />
        <CheckRow
          label="Versión de la app"
          value={`v${appVersion} (build ${buildNumber})`}
          pass={null}
        />
        <CheckRow
          label="Plataforma"
          value={`${Platform.OS === 'ios' ? 'iOS' : 'Android'} ${Platform.Version}`}
          pass={null}
        />
      </Card>

      {/* Credenciales */}
      <Card style={styles.card}>
        <SectionTitle title="Credenciales" iconName="key" />
        <CheckRow
          label="TikTok App ID"
          value={diagnostics?.appId ?? '—'}
          pass={diagnostics?.appId === EXPECTED_APP_ID}
          note={
            diagnostics?.appId && diagnostics.appId !== EXPECTED_APP_ID
              ? `Esperado: ${EXPECTED_APP_ID}`
              : undefined
          }
        />
        <CheckRow
          label="App Store ID enviado al SDK (appId)"
          value={diagnostics?.appStoreId ?? '—'}
          pass={diagnostics?.appStoreId === EXPECTED_APP_STORE_ID}
          note={
            diagnostics?.appStoreId !== EXPECTED_APP_STORE_ID
              ? `Esperado: ${EXPECTED_APP_STORE_ID}`
              : undefined
          }
        />
        <CheckRow
          label="Access Token"
          value={
            diagnostics?.hasAccessToken
              ? `Presente (${diagnostics.accessTokenLength} chars)`
              : 'FALTANTE'
          }
          pass={diagnostics?.hasAccessToken ?? false}
          note={
            !diagnostics?.hasAccessToken
              ? 'El secret TIKTOK_ACCESS_TOKEN no fue inyectado en este build.'
              : undefined
          }
        />
      </Card>

      {/* ATT / Dispositivo */}
      <Card style={styles.card}>
        <SectionTitle title="ATT / Dispositivo" iconName="phone-portrait" />
        {attLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
        ) : (
          <>
            <CheckRow
              label="Permiso ATT"
              value={attStatus}
              pass={attStatus === 'granted'}
              note={
                attStatus !== 'granted'
                  ? 'Sin permiso ATT el IDFA no se adjunta a los eventos.'
                  : undefined
              }
            />
            <CheckRow
              label="Advertising ID (IDFA)"
              value={
                advertisingId
                  ? `${advertisingId.substring(0, 8)}••••••••`
                  : 'No disponible'
              }
              pass={advertisingId !== null}
            />
          </>
        )}
        <CheckRow
          label="ATT tracking autorizado"
          value={diagnostics?.trackingAuthorized ? 'Sí' : 'No'}
          pass={diagnostics?.trackingAuthorized ?? false}
        />
      </Card>

      {/* Acción: enviar evento de prueba */}
      <Card style={styles.card}>
        <SectionTitle title="Prueba de conectividad SDK" iconName="send" />
        <Text style={styles.actionDescription}>
          Envía un evento{' '}
          <Text style={styles.mono}>LaunchAPP</Text> real a través del SDK nativo de TikTok.
          El evento se transmite directamente sin pasar por HTTP custom.
        </Text>

        <TouchableOpacity
          style={[styles.button, isTesting && styles.buttonDisabled]}
          onPress={handleSendTestEvent}
          disabled={isTesting}
          activeOpacity={0.8}
        >
          {isTesting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons name="paper-plane" size={18} color={Colors.white} />
          )}
          <Text style={styles.buttonText}>
            {isTesting ? 'Enviando…' : 'Enviar evento de prueba'}
          </Text>
        </TouchableOpacity>

        {testResult && (
          <View
            style={[
              styles.resultBox,
              testResult.success ? styles.resultBoxSuccess : styles.resultBoxError,
            ]}
          >
            <View style={styles.resultHeader}>
              <Ionicons
                name={testResult.success ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={testResult.success ? Colors.success : Colors.error}
              />
              <Text
                style={[
                  styles.resultTitle,
                  { color: testResult.success ? Colors.success : Colors.error },
                ]}
              >
                {testResult.success ? 'Éxito' : 'Error'}
                {testResult.statusCode !== null ? ` (HTTP ${testResult.statusCode})` : ''}
              </Text>
            </View>
            <Text style={styles.resultMessage}>{testResult.message}</Text>
            {testResult.responseBody && (
              <Text style={styles.resultBody} numberOfLines={6}>
                {testResult.responseBody}
              </Text>
            )}
          </View>
        )}
      </Card>

      {/* Resumen de checks para producción */}
      <Card style={styles.card}>
        <SectionTitle title="Checklist producción" iconName="list-circle" />
        <CheckRow
          label="Módulo nativo"
          value={diagnostics?.nativeModuleAvailable ? 'OK' : 'No disponible'}
          pass={diagnostics?.nativeModuleAvailable ?? false}
        />
        <CheckRow
          label="SDK inicializado"
          value={diagnostics?.isInitialized ? 'OK' : 'No inicializado'}
          pass={diagnostics?.isInitialized ?? false}
        />
        <CheckRow
          label="TikTok App ID correcto"
          value={diagnostics?.appId === EXPECTED_APP_ID ? 'OK' : 'Incorrecto'}
          pass={diagnostics?.appId === EXPECTED_APP_ID}
        />
        <CheckRow
          label="App Store ID correcto"
          value={diagnostics?.appStoreId === EXPECTED_APP_STORE_ID ? 'OK' : 'Incorrecto'}
          pass={diagnostics?.appStoreId === EXPECTED_APP_STORE_ID}
        />
        <CheckRow
          label="Access Token presente"
          value={diagnostics?.hasAccessToken ? 'OK' : 'FALTANTE'}
          pass={diagnostics?.hasAccessToken ?? false}
        />
        <CheckRow
          label="Modo producción activo"
          value={diagnostics?.testMode === false ? 'OK' : 'En modo test'}
          pass={diagnostics?.testMode === false}
        />
        <CheckRow
          label="ATT autorizado"
          value={attStatus === 'granted' ? 'OK' : attStatus}
          pass={attStatus === 'granted'}
        />
        <CheckRow
          label="Evento de prueba"
          value={
            testResult === null
              ? 'No probado aún'
              : testResult.success
              ? 'OK — Enviado via SDK nativo'
              : 'Falló'
          }
          pass={testResult === null ? null : testResult.success}
        />
      </Card>

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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.md,
  },
  bannerPass: {
    backgroundColor: Colors.success,
  },
  bannerFail: {
    backgroundColor: Colors.warning,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.white,
  },
  bannerSubtitle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.white,
    marginTop: 2,
    opacity: 0.9,
  },
  card: {
    marginBottom: Theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
    paddingBottom: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.sm,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkIcon: {
    marginTop: 1,
    marginRight: Theme.spacing.sm,
  },
  checkContent: {
    flex: 1,
  },
  checkLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  checkValue: {
    fontSize: Theme.fontSize.md,
    fontWeight: '500',
    color: Colors.text,
  },
  checkValueFail: {
    color: Colors.error,
    fontWeight: '700',
  },
  checkNote: {
    fontSize: Theme.fontSize.xs,
    color: Colors.warning,
    marginTop: 3,
    fontStyle: 'italic',
  },
  loader: {
    paddingVertical: Theme.spacing.md,
  },
  actionDescription: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Theme.spacing.md,
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    gap: Theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.white,
  },
  resultBox: {
    marginTop: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    borderWidth: 1,
  },
  resultBoxSuccess: {
    backgroundColor: '#F0FFF4',
    borderColor: Colors.success,
  },
  resultBoxError: {
    backgroundColor: '#FFF5F5',
    borderColor: Colors.error,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  resultTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '700',
  },
  resultMessage: {
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  resultBody: {
    marginTop: Theme.spacing.sm,
    fontSize: Theme.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.sm,
  },
  bottomSpacing: {
    height: Theme.spacing.xl,
  },
});

export default TikTokDiagnosticsScreen;

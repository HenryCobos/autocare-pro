/**
 * TikTok App Events Service
 *
 * Wraps @layers/expo-tiktok-business (native TikTok Business SDK).
 * Native TikTokConfig parameters on iOS:
 *   - appId        → Apple App Store numeric ID (6749963091)
 *   - tiktokAppId  → TikTok App ID from Events Manager
 *   - accessToken  → App Secret from Events Manager
 *
 * The native SDK auto-logs InstallApp, LaunchAPP, 2DRetention and Purchase (StoreKit),
 * so those are never sent manually.
 *
 * Docs: https://business-api.tiktok.com/portal/docs/ios-integration-steps/v1.3
 */

import TiktokSDK from '@layers/expo-tiktok-business';

/** Standard TikTok app event names (not web pixel names). */
export const TikTokEvent = {
  LAUNCH_APP: 'LaunchAPP',
  COMPLETE_TUTORIAL: 'CompleteTutorial',
  VIEW_CONTENT: 'ViewContent',
  CHECKOUT: 'Checkout',
  START_TRIAL: 'StartTrial',
  SUBSCRIBE: 'Subscribe',
  SEARCH: 'Search',
} as const;

export type TikTokEventName = (typeof TikTokEvent)[keyof typeof TikTokEvent];

/** Custom events used to build audiences in Ads Manager. */
export const TikTokCustomEvent = {
  ADD_VEHICLE: 'AddVehicle',
  ADD_MAINTENANCE: 'AddMaintenance',
  ADD_EXPENSE: 'AddExpense',
  ADD_WORK_ORDER: 'AddWorkOrder',
  EXPORT_PDF: 'ExportPDF',
  BACKUP_EXPORTED: 'BackupExported',
  CONTACT_SUPPORT: 'ContactSupport',
  PAYWALL_LIMIT_REACHED: 'PaywallLimitReached',
} as const;

export type TikTokCustomEventName = (typeof TikTokCustomEvent)[keyof typeof TikTokCustomEvent];

// The SDK discards any property key outside this list.
const STANDARD_PROPERTY_KEYS = [
  'value',
  'currency',
  'content_id',
  'content_type',
  'content_name',
  'content_category',
  'description',
  'quantity',
  'price',
  'contents',
  'search_string',
] as const;

export interface TikTokEventProperties {
  value?: number;
  currency?: string;
  content_id?: string;
  content_type?: string;
  content_name?: string;
  content_category?: string;
  description?: string;
  quantity?: number;
  price?: number;
  contents?: Array<{
    content_id: string;
    content_type?: string;
    content_name?: string;
    quantity?: number;
    price?: number;
  }>;
  search_string?: string;
}

interface TikTokConfig {
  tiktokAppId: string;
  appStoreId: string;
  accessToken?: string;
}

export interface TikTokDiagnosticsData {
  isInitialized: boolean;
  initError: string | null;
  appId: string | null;
  appStoreId: string | null;
  hasAccessToken: boolean;
  accessTokenLength: number;
  testMode: boolean;
  trackingAuthorized: boolean;
  nativeModuleAvailable: boolean;
}

export interface TikTokTestEventResult {
  success: boolean;
  statusCode: number | null;
  message: string;
  responseBody: string | null;
}

const sanitizeProperties = (properties: TikTokEventProperties = {}): TikTokEventProperties => {
  const clean: Record<string, unknown> = {};
  for (const key of STANDARD_PROPERTY_KEYS) {
    const value = properties[key];
    if (value !== undefined && value !== null && value !== '') {
      clean[key] = value;
    }
  }
  return clean as TikTokEventProperties;
};

class TikTokAnalyticsServiceClass {
  private config: TikTokConfig | null = null;
  private isInitialized = false;
  private initError: string | null = null;
  private trackingAuthorized = false;

  async initialize(config: TikTokConfig): Promise<void> {
    if (this.isInitialized) return;

    this.config = config;
    this.initError = null;

    if (__DEV__) {
      this.initError = 'Modo desarrollo (__DEV__): el SDK no se inicializa.';
      console.log('[TikTok] ' + this.initError);
      return;
    }
    if (!config.accessToken) {
      this.initError = 'App Secret ausente: el build no tiene TIKTOK_ACCESS_TOKEN.';
      console.warn('[TikTok] ' + this.initError);
      return;
    }
    if (!config.appStoreId) {
      this.initError = 'App Store ID ausente: es obligatorio como appId del SDK.';
      console.warn('[TikTok] ' + this.initError);
      return;
    }

    try {
      const result = await TiktokSDK.initialize(config.appStoreId, config.tiktokAppId, {
        accessToken: config.accessToken,
        debugMode: false,
        // The native SDK already logs InstallApp/LaunchAPP; this flag only controls
        // an extra non-standard "Launch" event fired by the Expo wrapper.
        autoTrackAppLifecycle: false,
        autoTrackRouteChanges: false,
      });

      if (result === false) {
        this.initError = 'TiktokSDK.initialize() retornó false.';
        console.error('[TikTok] ' + this.initError);
        return;
      }

      this.isInitialized = true;
      console.log('✅ TikTok SDK inicializado');
    } catch (error: any) {
      this.initError = error?.message ?? String(error);
      console.error('❌ Error al inicializar TikTok SDK:', this.initError);
    }
  }

  async trackEvent(
    eventName: TikTokEventName | TikTokCustomEventName,
    properties: TikTokEventProperties = {}
  ): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      const dispatched = await TiktokSDK.trackEvent(eventName, sanitizeProperties(properties));
      return dispatched;
    } catch (error) {
      console.error(`❌ Error al enviar evento TikTok ${eventName}:`, error);
      return false;
    }
  }

  async trackCompleteTutorial(properties: TikTokEventProperties = {}): Promise<void> {
    await this.trackEvent(TikTokEvent.COMPLETE_TUTORIAL, {
      content_type: 'onboarding',
      ...properties,
    });
  }

  async trackViewContent(
    contentType: string,
    contentId: string,
    properties: TikTokEventProperties = {}
  ): Promise<void> {
    await this.trackEvent(TikTokEvent.VIEW_CONTENT, {
      content_type: contentType,
      content_id: contentId,
      ...properties,
    });
  }

  async trackCheckout(value: number, currency: string, contentId: string): Promise<void> {
    await this.trackEvent(TikTokEvent.CHECKOUT, {
      content_type: 'subscription',
      content_id: contentId,
      value,
      currency,
    });
  }

  /**
   * Call only after a successful purchase. Purchase itself is auto-logged by the SDK.
   */
  async trackSubscriptionStarted(params: {
    isTrial: boolean;
    value: number;
    currency: string;
    contentId: string;
  }): Promise<void> {
    await this.trackEvent(params.isTrial ? TikTokEvent.START_TRIAL : TikTokEvent.SUBSCRIBE, {
      content_type: 'subscription',
      content_id: params.contentId,
      value: params.value,
      currency: params.currency,
    });
  }

  async trackCustomEvent(
    eventName: TikTokCustomEventName,
    properties: TikTokEventProperties = {}
  ): Promise<void> {
    await this.trackEvent(eventName, properties);
  }

  setTrackingAuthorization(canTrack: boolean): void {
    this.trackingAuthorized = canTrack;
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  /** Never exposes the App Secret value. */
  getDiagnostics(): TikTokDiagnosticsData {
    return {
      isInitialized: this.isInitialized,
      initError: this.initError,
      appId: this.config?.tiktokAppId ?? null,
      appStoreId: this.config?.appStoreId ?? null,
      hasAccessToken: !!this.config?.accessToken,
      accessTokenLength: this.config?.accessToken?.length ?? 0,
      testMode: __DEV__,
      trackingAuthorized: this.trackingAuthorized,
      nativeModuleAvailable: typeof TiktokSDK?.initialize === 'function',
    };
  }

  /** Sends a real LaunchAPP event. Used only from the internal diagnostics screen. */
  async sendTestEventDirect(): Promise<TikTokTestEventResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        statusCode: null,
        message: `SDK no inicializado. ${this.initError ?? 'Verifica App ID, App Store ID y App Secret.'}`,
        responseBody: this.initError,
      };
    }

    const dispatched = await this.trackEvent(TikTokEvent.LAUNCH_APP);
    return dispatched
      ? {
          success: true,
          statusCode: null,
          message: 'Evento LaunchAPP enviado via SDK nativo. TikTok lo procesa en segundo plano.',
          responseBody: 'dispatched: true',
        }
      : {
          success: false,
          statusCode: null,
          message: 'El SDK no despachó el evento. Revisa los logs nativos.',
          responseBody: 'dispatched: false',
        };
  }
}

export const TikTokAnalyticsService = new TikTokAnalyticsServiceClass();

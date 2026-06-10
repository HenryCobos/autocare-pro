/**
 * TikTok App Events SDK Service
 * 
 * Este servicio maneja el envío de eventos a TikTok para el seguimiento de campañas de App Promotion.
 * 
 * Documentación oficial: https://ads.tiktok.com/help/article/app-events-sdk
 * 
 * IMPORTANTE: Para usar este servicio necesitas:
 * 1. TikTok App ID (obtener desde TikTok For Business)
 * 2. Configurar el Pixel de TikTok en tu cuenta de TikTok Ads Manager
 * 3. Agregar tu app en TikTok Events Manager
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipos de eventos estándar de TikTok
export enum TikTokEvent {
  // Eventos del ciclo de vida de la app
  LAUNCH_APP = 'LaunchApp',
  INSTALL_APP = 'InstallApp',
  
  // Eventos de registro y onboarding
  COMPLETE_REGISTRATION = 'CompleteRegistration',
  COMPLETE_TUTORIAL = 'CompleteTutorial',
  
  // Eventos de contenido
  VIEW_CONTENT = 'ViewContent',
  SEARCH = 'Search',
  
  // Eventos de suscripción (críticos para tu app)
  START_TRIAL = 'StartTrial',
  SUBSCRIBE = 'Subscribe',
  
  // Eventos de compra
  ADD_TO_CART = 'AddToCart',
  INITIATE_CHECKOUT = 'InitiateCheckout',
  PURCHASE = 'Purchase',
  
  // Eventos personalizados
  CUSTOM = 'Custom',
}

interface TikTokEventProperties {
  content_type?: string;
  content_id?: string;
  content_name?: string;
  currency?: string;
  value?: number;
  description?: string;
  content_category?: string;
  [key: string]: any;
}

interface TikTokConfig {
  appId: string;
  appStoreId?: string;
  accessToken?: string;
  testMode?: boolean;
}

class TikTokAnalyticsServiceClass {
  private config: TikTokConfig | null = null;
  private isInitialized: boolean = false;
  private eventQueue: Array<{ event: string; properties: TikTokEventProperties; timestamp: number }> = [];
  private anonymousId: string = '';
  private trackingAuthorized: boolean = false;
  private advertisingId: string | null = null;
  
  // URL base de la API de TikTok App Events
  private readonly API_BASE_URL = 'https://business-api.tiktok.com/open_api/v1.3/app/batch/';
  
  // Clave para almacenar el ID anónimo
  private readonly ANONYMOUS_ID_KEY = '@TikTokAnalytics:anonymousId';
  private readonly FIRST_LAUNCH_KEY = '@TikTokAnalytics:firstLaunch';

  /**
   * Inicializa el servicio de TikTok Analytics
   * @param config Configuración con el App ID de TikTok
   */
  async initialize(config: TikTokConfig): Promise<void> {
    try {
      this.config = {
        ...config,
        // Si no hay access token disponible, forzamos modo test para evitar errores silenciosos en runtime.
        testMode: config.testMode || !config.accessToken,
      };
      // Validación en runtime: log seguro (nunca imprimir el token)
      const tokenStatus = this.config.accessToken
        ? `present (length ${this.config.accessToken.length})`
        : 'MISSING';
      console.log(`[TikTok] Access token at init: ${tokenStatus}; testMode: ${this.config.testMode}`);

      // Generar o recuperar ID anónimo
      await this.initializeAnonymousId();
      
      // Verificar si es el primer lanzamiento
      const isFirstLaunch = await this.checkFirstLaunch();
      
      this.isInitialized = true;
      
      console.log('✅ TikTok Analytics inicializado correctamente');
      
      // Enviar evento de instalación si es primer lanzamiento
      if (isFirstLaunch) {
        await this.trackEvent(TikTokEvent.INSTALL_APP, {
          content_type: 'app_install',
        });
      }
      
      // Enviar evento de lanzamiento
      await this.trackEvent(TikTokEvent.LAUNCH_APP, {
        content_type: 'app_launch',
      });
      
      // Procesar eventos en cola
      await this.flushEventQueue();
      
    } catch (error) {
      console.error('❌ Error al inicializar TikTok Analytics:', error);
    }
  }

  /**
   * Inicializa o recupera el ID anónimo del usuario
   */
  private async initializeAnonymousId(): Promise<void> {
    try {
      let storedId = await AsyncStorage.getItem(this.ANONYMOUS_ID_KEY);
      
      if (!storedId) {
        // Generar nuevo ID anónimo
        storedId = this.generateAnonymousId();
        await AsyncStorage.setItem(this.ANONYMOUS_ID_KEY, storedId);
      }
      
      this.anonymousId = storedId;
    } catch (error) {
      console.error('Error al inicializar ID anónimo:', error);
      this.anonymousId = this.generateAnonymousId();
    }
  }

  /**
   * Genera un ID anónimo único
   */
  private generateAnonymousId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica si es el primer lanzamiento de la app
   */
  private async checkFirstLaunch(): Promise<boolean> {
    try {
      const hasLaunched = await AsyncStorage.getItem(this.FIRST_LAUNCH_KEY);
      
      if (!hasLaunched) {
        await AsyncStorage.setItem(this.FIRST_LAUNCH_KEY, 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al verificar primer lanzamiento:', error);
      return false;
    }
  }

  /**
   * Rastrea un evento en TikTok
   * @param eventName Nombre del evento (usar TikTokEvent enum)
   * @param properties Propiedades adicionales del evento
   */
  async trackEvent(
    eventName: TikTokEvent | string,
    properties: TikTokEventProperties = {}
  ): Promise<void> {
    if (!this.isInitialized || !this.config) {
      // Agregar a la cola si no está inicializado
      this.eventQueue.push({
        event: eventName,
        properties,
        timestamp: Date.now(),
      });
      return;
    }

    try {
      const eventData = await this.buildEventData(eventName, properties);
      
      if (this.config.testMode) {
        console.log('🧪 [TikTok Test Mode] Evento:', eventName, eventData);
        return;
      }

      // Enviar evento a TikTok
      await this.sendEventToTikTok(eventData);
      
      console.log('✅ Evento de TikTok enviado:', eventName);
    } catch (error) {
      console.error('❌ Error al enviar evento a TikTok:', error);
    }
  }

  /**
   * Construye los datos del evento con información del dispositivo
   */
  private async buildEventData(
    eventName: string,
    properties: TikTokEventProperties
  ): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp en segundos
    
    return {
      event: eventName,
      timestamp,
      context: {
        ad: {
          callback: 'https://example.com', // Opcional: URL de callback
        },
        app: {
          name: Constants.expoConfig?.name || 'AutoCare Pro',
          namespace: Platform.select({
            ios: Constants.expoConfig?.ios?.bundleIdentifier,
            android: Constants.expoConfig?.android?.package,
          }),
          version: Constants.expoConfig?.version || '1.0.0',
          build: Constants.expoConfig?.version || '1.0.0',
        },
        device: {
          id: this.anonymousId,
          manufacturer: Device.manufacturer || 'Unknown',
          model: Device.modelName || 'Unknown',
          platform: Platform.OS,
          platform_version: Platform.Version.toString(),
          advertising_id: this.trackingAuthorized ? this.advertisingId || '' : '',
        },
        ip: '', // Se captura automáticamente por TikTok
        locale: 'es', // Puedes obtenerlo de Device
        network: {
          wifi: true, // Puedes obtenerlo de NetInfo si lo necesitas
        },
        os: {
          name: Platform.OS,
          version: Platform.Version.toString(),
        },
        screen: {
          density: 2, // Puedes obtenerlo de Dimensions
          width: 375, // Puedes obtenerlo de Dimensions
          height: 812, // Puedes obtenerlo de Dimensions
        },
      },
      properties: {
        ...properties,
        _app_id: this.config?.appId,
        _app_store_id: this.config?.appStoreId,
      },
    };
  }

  /**
   * Envía el evento a la API de TikTok
   */
  private async sendEventToTikTok(eventData: any): Promise<void> {
    if (!this.config || !this.config.appId) {
      throw new Error('TikTok no está configurado correctamente');
    }

    try {
      const response = await fetch(this.API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': this.config.accessToken || '',
        },
        body: JSON.stringify({
          app_id: this.config.appId,
          batch: [eventData],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TikTok API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.code !== 0) {
        throw new Error(`TikTok API returned error code: ${result.code} - ${result.message}`);
      }
    } catch (error) {
      console.error('Error al enviar evento a TikTok:', error);
      throw error;
    }
  }

  /**
   * Procesa eventos en cola que se enviaron antes de la inicialización
   */
  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    console.log(`📤 Procesando ${this.eventQueue.length} eventos en cola...`);

    const queueCopy = [...this.eventQueue];
    this.eventQueue = [];

    for (const item of queueCopy) {
      await this.trackEvent(item.event, item.properties);
    }
  }

  /**
   * Rastrea eventos de suscripción
   */
  async trackSubscription(planType: 'monthly' | 'annual', value: number, currency: string = 'USD'): Promise<void> {
    await this.trackEvent(TikTokEvent.SUBSCRIBE, {
      content_type: 'subscription',
      content_name: planType === 'monthly' ? 'Plan Mensual' : 'Plan Anual',
      content_id: planType,
      value,
      currency,
      description: `Suscripción ${planType === 'monthly' ? 'mensual' : 'anual'} a AutoCare Pro`,
    });

    // También enviar como evento de compra
    await this.trackPurchase(value, currency, {
      content_type: 'subscription',
      content_name: planType === 'monthly' ? 'Plan Mensual' : 'Plan Anual',
    });
  }

  /**
   * Rastrea eventos de compra
   */
  async trackPurchase(value: number, currency: string = 'USD', properties: TikTokEventProperties = {}): Promise<void> {
    await this.trackEvent(TikTokEvent.PURCHASE, {
      ...properties,
      value,
      currency,
    });
  }

  /**
   * Rastrea eventos de inicio de prueba
   */
  async trackStartTrial(properties: TikTokEventProperties = {}): Promise<void> {
    await this.trackEvent(TikTokEvent.START_TRIAL, {
      content_type: 'trial',
      ...properties,
    });
  }

  /**
   * Rastrea completación de registro
   */
  async trackCompleteRegistration(properties: TikTokEventProperties = {}): Promise<void> {
    await this.trackEvent(TikTokEvent.COMPLETE_REGISTRATION, {
      content_type: 'registration',
      ...properties,
    });
  }

  /**
   * Rastrea completación del tutorial/onboarding
   */
  async trackCompleteTutorial(properties: TikTokEventProperties = {}): Promise<void> {
    await this.trackEvent(TikTokEvent.COMPLETE_TUTORIAL, {
      content_type: 'tutorial',
      ...properties,
    });
  }

  /**
   * Rastrea visualización de contenido
   */
  async trackViewContent(contentType: string, contentId: string, properties: TikTokEventProperties = {}): Promise<void> {
    await this.trackEvent(TikTokEvent.VIEW_CONTENT, {
      content_type: contentType,
      content_id: contentId,
      ...properties,
    });
  }

  /**
   * Rastrea un evento custom con nombre de negocio.
   */
  async trackCustomEvent(eventName: string, properties: TikTokEventProperties = {}): Promise<void> {
    await this.trackEvent(TikTokEvent.CUSTOM, {
      event_name: eventName,
      ...properties,
    });
  }

  /**
   * Actualiza el estado de autorización ATT/IDFA para enriquecer eventos.
   */
  setTrackingAuthorization(canTrack: boolean, advertisingId?: string | null): void {
    this.trackingAuthorized = canTrack;
    this.advertisingId = canTrack ? advertisingId || null : null;
  }

  /**
   * Verifica si el servicio está inicializado
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtiene el ID anónimo actual
   */
  getAnonymousId(): string {
    return this.anonymousId;
  }
}

// Exportar instancia singleton
export const TikTokAnalyticsService = new TikTokAnalyticsServiceClass();


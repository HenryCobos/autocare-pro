/**
 * Servicio para gestión de notificaciones locales
 */
let Notifications: typeof import('expo-notifications') | null = null;
try {
  // Cargar de forma perezosa para evitar crash si el módulo nativo no está vinculado
  Notifications = require('expo-notifications');
} catch (e) {
  Notifications = null;
}
import { Platform } from 'react-native';
import { Reminder } from '../types';

// Configuración de notificaciones
if (Notifications) {
  Notifications.setNotificationHandler({
    // @ts-ignore - tipos varían según versión de expo-notifications
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      // @ts-ignore
      shouldShowBanner: true,
      // @ts-ignore
      shouldShowList: true,
    }),
  });
}

class NotificationService {
  // Solicitar permisos de notificación
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Notifications) return false;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

    
      if (finalStatus !== 'granted') {
        console.log('Permission to access notifications was denied');
        return false;
      }

      // Para iOS, configurar categorías de notificación
      if (Platform.OS === 'ios') {
        if (!Notifications) return true;
        await Notifications.setNotificationCategoryAsync('maintenance', [
          {
            identifier: 'MARK_DONE',
            buttonTitle: 'Marcar como hecho',
            options: {
              isDestructive: false,
              isAuthenticationRequired: false,
            },
          },
          {
            identifier: 'POSTPONE',
            buttonTitle: 'Posponer',
            options: {
              isDestructive: false,
              isAuthenticationRequired: false,
            },
          },
        ]);
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Programar notificación para recordatorio
  async scheduleReminder(reminder: Reminder): Promise<string | null> {
    try {
      if (!Notifications) return null;
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const trigger = new Date(reminder.dueDate);
      const now = new Date();

      // Solo programar si la fecha es futura
      if (trigger <= now) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚗 AutoCare Pro - Recordatorio',
          body: `${reminder.title}: ${reminder.description}`,
          sound: 'default',
          categoryIdentifier: 'maintenance',
          data: {
            reminderId: reminder.id,
            vehicleId: reminder.vehicleId,
            type: 'maintenance_reminder',
          },
        },
        trigger: { date: trigger } as any,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  // Programar notificación por kilometraje (aproximada)
  async scheduleKilometerReminder(
    reminder: Reminder,
    currentKm: number,
    dueKm: number
  ): Promise<string | null> {
    try {
      if (!Notifications) return null;
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Calcular aproximadamente cuándo se alcanzará el kilometraje
      // Asumiendo un promedio de 1000 km por mes
      const kmPerMonth = 1000;
      const remainingKm = dueKm - currentKm;
      
      if (remainingKm <= 0) {
        return null;
      }

      const monthsUntilDue = Math.max(1, Math.round(remainingKm / kmPerMonth));
      const triggerDate = new Date();
      triggerDate.setMonth(triggerDate.getMonth() + monthsUntilDue);

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚗 AutoCare Pro - Recordatorio por Kilometraje',
          body: `${reminder.title}: Revisa el kilometraje actual (${dueKm} km objetivo)`,
          sound: 'default',
          categoryIdentifier: 'maintenance',
          data: {
            reminderId: reminder.id,
            vehicleId: reminder.vehicleId,
            type: 'kilometer_reminder',
            targetKilometers: dueKm,
          },
        },
        trigger: { date: triggerDate } as any,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling kilometer notification:', error);
      return null;
    }
  }

  // Cancelar notificación
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      if (!Notifications) return;
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Cancelar todas las notificaciones de un recordatorio
  async cancelReminderNotifications(reminderId: string): Promise<void> {
    try {
      if (!Notifications) return;
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.reminderId === reminderId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling reminder notifications:', error);
    }
  }

  // Obtener todas las notificaciones programadas
  async getScheduledNotifications(): Promise<any[]> {
    try {
      if (!Notifications) return [] as any;
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Limpiar todas las notificaciones
  async clearAllNotifications(): Promise<void> {
    try {
      if (!Notifications) return;
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.dismissAllNotificationsAsync();
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }

  // Mostrar notificación inmediata
  async showImmediateNotification(title: string, body: string, data?: any): Promise<string> {
    try {
      if (!Notifications) throw new Error('Notifications module not available');
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('No notification permissions');
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data,
        },
        trigger: null, // Mostrar inmediatamente
      });

      return notificationId;
    } catch (error) {
      console.error('Error showing immediate notification:', error);
      throw error;
    }
  }

  // Configurar listener para respuestas de notificación
  addNotificationResponseListener(
    listener: (response: any) => void
  ): any {
    if (!Notifications) return { remove: () => {} } as any;
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  // Configurar listener para notificaciones recibidas
  addNotificationReceivedListener(
    listener: (notification: any) => void
  ): any {
    if (!Notifications) return { remove: () => {} } as any;
    return Notifications.addNotificationReceivedListener(listener);
  }
}

export default new NotificationService();

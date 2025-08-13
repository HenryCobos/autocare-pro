/**
 * Hook para gestión de notificaciones
 */
import { useEffect } from 'react';
import NotificationService from '../services/NotificationService';

export const useNotifications = () => {
  useEffect(() => {
    // Intentar solicitar permisos en segundo plano; proteger contra errores
    NotificationService.requestPermissions().catch(() => {});

    // Listener para notificaciones recibidas mientras la app está abierta
    const notificationListener = NotificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        // Aquí puedes manejar la notificación recibida
      }
    );

    // Listener para respuestas a notificaciones (cuando el usuario toca la notificación)
    const responseListener = NotificationService.addNotificationResponseListener(
      (response) => {
        console.log('Notification response:', response);
        
        const data = response.notification.request.content.data;
        
        // Manejar diferentes tipos de notificaciones
        if (data?.type === 'maintenance_reminder') {
          // Navegar a la pantalla de mantenimientos
          // navigation.navigate('Maintenance');
        } else if (data?.type === 'kilometer_reminder') {
          // Navegar a la pantalla del vehículo específico
          // navigation.navigate('Vehicles');
        }
      }
    );

    // Cleanup
    return () => {
      try { notificationListener.remove(); } catch {}
      try { responseListener.remove(); } catch {}
    };
  }, []);

  return {
    scheduleNotification: NotificationService.scheduleReminder,
    cancelNotification: NotificationService.cancelNotification,
    showImmediate: NotificationService.showImmediateNotification,
  };
};

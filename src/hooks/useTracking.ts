import { useEffect } from 'react';

export const useTrackingTransparency = () => {
  useEffect(() => {
    // Carga dinámica para evitar errores en entornos sin el módulo
    let isMounted = true;
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getTrackingPermissionsAsync, requestTrackingPermissionsAsync } = require('expo-tracking-transparency');
        const { status } = await getTrackingPermissionsAsync();
        if (status === 'not-determined') {
          await requestTrackingPermissionsAsync();
        }
      } catch {
        // Si el módulo no está disponible, continuar sin bloquear
      }
    })();
    return () => { isMounted = false; };
  }, []);
};



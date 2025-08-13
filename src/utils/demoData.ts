/**
 * Datos de demostración para probar recordatorios
 */
import { generateId } from './helpers';
import { Reminder, MaintenanceType } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';

// Crear recordatorios de demostración
export const createDemoReminders = async () => {
  try {
    // Obtener vehículos existentes
    const vehicles = await AsyncStorageService.getVehicles();
    
    if (vehicles.length === 0) {
      console.log('No hay vehículos para crear recordatorios de demo');
      return;
    }

    const demoReminders: Reminder[] = [
      {
        id: generateId(),
        vehicleId: vehicles[0].id,
        maintenanceType: MaintenanceType.OIL_CHANGE,
        title: `Cambio de aceite - ${vehicles[0].brand} ${vehicles[0].model}`,
        description: `Próximo cambio de aceite programado para ${vehicles[0].licensePlate}`,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // En 7 días
        dueKilometers: vehicles[0].currentKilometers + 5000,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        vehicleId: vehicles[0].id,
        maintenanceType: MaintenanceType.BRAKES,
        title: `Revisión de frenos - ${vehicles[0].brand} ${vehicles[0].model}`,
        description: `Revisar pastillas y discos de freno`,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // En 15 días
        dueKilometers: vehicles[0].currentKilometers + 10000,
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Si hay más vehículos, agregar recordatorios para el segundo
    if (vehicles.length > 1) {
      demoReminders.push({
        id: generateId(),
        vehicleId: vehicles[1].id,
        maintenanceType: MaintenanceType.TIRES,
        title: `Rotación de llantas - ${vehicles[1].brand} ${vehicles[1].model}`,
        description: `Rotar y balancear llantas`,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // En 3 días
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Guardar todos los recordatorios
    for (const reminder of demoReminders) {
      await AsyncStorageService.saveReminder(reminder);
    }

    console.log(`✅ Se crearon ${demoReminders.length} recordatorios de demostración`);
    return demoReminders;
  } catch (error) {
    console.error('Error creando recordatorios de demo:', error);
  }
};

// Limpiar recordatorios de demo
export const clearDemoReminders = async () => {
  try {
    const reminders = await AsyncStorageService.getReminders();
    
    for (const reminder of reminders) {
      await AsyncStorageService.deleteReminder(reminder.id);
    }
    
    console.log('🗑️ Recordatorios de demo eliminados');
  } catch (error) {
    console.error('Error eliminando recordatorios de demo:', error);
  }
};

/**
 * Servicio para gestión de datos con AsyncStorage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle, Maintenance, Expense, Reminder, AppSettings } from '../types';

// Claves para AsyncStorage
const STORAGE_KEYS = {
  VEHICLES: '@autocare_vehicles',
  MAINTENANCES: '@autocare_maintenances',
  EXPENSES: '@autocare_expenses',
  REMINDERS: '@autocare_reminders',
  SETTINGS: '@autocare_settings',
};

class AsyncStorageService {
  // Métodos genéricos
  private async getData<T>(key: string): Promise<T[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return [];
    }
  }

  private async setData<T>(key: string, data: T[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting data for key ${key}:`, error);
      throw error;
    }
  }

  // Vehículos
  async getVehicles(): Promise<Vehicle[]> {
    return this.getData<Vehicle>(STORAGE_KEYS.VEHICLES);
  }

  async saveVehicle(vehicle: Vehicle): Promise<void> {
    const vehicles = await this.getVehicles();
    const existingIndex = vehicles.findIndex(v => v.id === vehicle.id);
    
    if (existingIndex >= 0) {
      vehicles[existingIndex] = { ...vehicle, updatedAt: new Date().toISOString() };
    } else {
      vehicles.push(vehicle);
    }
    
    await this.setData(STORAGE_KEYS.VEHICLES, vehicles);
  }

  async deleteVehicle(vehicleId: string): Promise<void> {
    const vehicles = await this.getVehicles();
    const filteredVehicles = vehicles.filter(v => v.id !== vehicleId);
    await this.setData(STORAGE_KEYS.VEHICLES, filteredVehicles);

    // También eliminar mantenimientos, gastos y recordatorios relacionados
    await this.deleteMaintenancesByVehicle(vehicleId);
    await this.deleteExpensesByVehicle(vehicleId);
    await this.deleteRemindersByVehicle(vehicleId);
  }

  // Mantenimientos
  async getMaintenances(): Promise<Maintenance[]> {
    return this.getData<Maintenance>(STORAGE_KEYS.MAINTENANCES);
  }

  async getMaintenancesByVehicle(vehicleId: string): Promise<Maintenance[]> {
    const maintenances = await this.getMaintenances();
    return maintenances.filter(m => m.vehicleId === vehicleId);
  }

  async saveMaintenance(maintenance: Maintenance): Promise<void> {
    const maintenances = await this.getMaintenances();
    const existingIndex = maintenances.findIndex(m => m.id === maintenance.id);
    
    if (existingIndex >= 0) {
      maintenances[existingIndex] = { ...maintenance, updatedAt: new Date().toISOString() };
    } else {
      maintenances.push(maintenance);
    }
    
    await this.setData(STORAGE_KEYS.MAINTENANCES, maintenances);
  }

  async deleteMaintenance(maintenanceId: string): Promise<void> {
    const maintenances = await this.getMaintenances();
    const filteredMaintenances = maintenances.filter(m => m.id !== maintenanceId);
    await this.setData(STORAGE_KEYS.MAINTENANCES, filteredMaintenances);
  }

  async deleteMaintenancesByVehicle(vehicleId: string): Promise<void> {
    const maintenances = await this.getMaintenances();
    const filteredMaintenances = maintenances.filter(m => m.vehicleId !== vehicleId);
    await this.setData(STORAGE_KEYS.MAINTENANCES, filteredMaintenances);
  }

  // Gastos
  async getExpenses(): Promise<Expense[]> {
    return this.getData<Expense>(STORAGE_KEYS.EXPENSES);
  }

  async getExpensesByVehicle(vehicleId: string): Promise<Expense[]> {
    const expenses = await this.getExpenses();
    return expenses.filter(e => e.vehicleId === vehicleId);
  }

  async saveExpense(expense: Expense): Promise<void> {
    const expenses = await this.getExpenses();
    const existingIndex = expenses.findIndex(e => e.id === expense.id);
    
    if (existingIndex >= 0) {
      expenses[existingIndex] = { ...expense, updatedAt: new Date().toISOString() };
    } else {
      expenses.push(expense);
    }
    
    await this.setData(STORAGE_KEYS.EXPENSES, expenses);
  }

  async deleteExpense(expenseId: string): Promise<void> {
    const expenses = await this.getExpenses();
    const filteredExpenses = expenses.filter(e => e.id !== expenseId);
    await this.setData(STORAGE_KEYS.EXPENSES, filteredExpenses);
  }

  async deleteExpensesByVehicle(vehicleId: string): Promise<void> {
    const expenses = await this.getExpenses();
    const filteredExpenses = expenses.filter(e => e.vehicleId !== vehicleId);
    await this.setData(STORAGE_KEYS.EXPENSES, filteredExpenses);
  }

  // Recordatorios
  async getReminders(): Promise<Reminder[]> {
    return this.getData<Reminder>(STORAGE_KEYS.REMINDERS);
  }

  async getRemindersByVehicle(vehicleId: string): Promise<Reminder[]> {
    const reminders = await this.getReminders();
    return reminders.filter(r => r.vehicleId === vehicleId);
  }

  async saveReminder(reminder: Reminder): Promise<void> {
    const reminders = await this.getReminders();
    const existingIndex = reminders.findIndex(r => r.id === reminder.id);
    
    if (existingIndex >= 0) {
      reminders[existingIndex] = { ...reminder, updatedAt: new Date().toISOString() };
    } else {
      reminders.push(reminder);
    }
    
    await this.setData(STORAGE_KEYS.REMINDERS, reminders);
  }

  async deleteReminder(reminderId: string): Promise<void> {
    const reminders = await this.getReminders();
    const filteredReminders = reminders.filter(r => r.id !== reminderId);
    await this.setData(STORAGE_KEYS.REMINDERS, filteredReminders);
  }

  async deleteRemindersByVehicle(vehicleId: string): Promise<void> {
    const reminders = await this.getReminders();
    const filteredReminders = reminders.filter(r => r.vehicleId !== vehicleId);
    await this.setData(STORAGE_KEYS.REMINDERS, filteredReminders);
  }

  // Configuración
  async getSettings(): Promise<AppSettings> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (jsonValue) {
        return JSON.parse(jsonValue);
      }
      
      // Configuración por defecto
      const defaultSettings: AppSettings = {
        language: 'es',
        notifications: true,
        reminderDays: 7,
        currency: 'MXN',
        distanceUnit: 'km',
      };
      
      await this.saveSettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error getting settings:', error);
      return {
        language: 'es',
        notifications: true,
        reminderDays: 7,
        currency: 'MXN',
        distanceUnit: 'km',
      };
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const jsonValue = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Método para limpiar todos los datos (útil para resetear la app)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.VEHICLES,
        STORAGE_KEYS.MAINTENANCES,
        STORAGE_KEYS.EXPENSES,
        STORAGE_KEYS.REMINDERS,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export default new AsyncStorageService();

/**
 * Servicio para gestión de datos con AsyncStorage
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Vehicle, Maintenance, Expense, Reminder, AppSettings, Customer, WorkOrder } from '../types';

// Claves para AsyncStorage
const STORAGE_KEYS = {
  VEHICLES: '@autocare_vehicles',
  MAINTENANCES: '@autocare_maintenances',
  EXPENSES: '@autocare_expenses',
  REMINDERS: '@autocare_reminders',
  CUSTOMERS: '@autocare_customers',
  WORK_ORDERS: '@autocare_work_orders',
  SETTINGS: '@autocare_settings',
  ONBOARDING_COMPLETED: '@autocare_onboarding_completed',
};

export interface BackupPayload {
  vehicles: Vehicle[];
  maintenances: Maintenance[];
  expenses: Expense[];
  reminders: Reminder[];
  customers: Customer[];
  workOrders: WorkOrder[];
  settings: AppSettings;
  onboardingCompleted: boolean;
}

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
    await this.deleteWorkOrdersByVehicle(vehicleId);
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

  // Clientes
  async getCustomers(): Promise<Customer[]> {
    return this.getData<Customer>(STORAGE_KEYS.CUSTOMERS);
  }

  async saveCustomer(customer: Customer): Promise<void> {
    const customers = await this.getCustomers();
    const existingIndex = customers.findIndex(c => c.id === customer.id);

    if (existingIndex >= 0) {
      customers[existingIndex] = { ...customer, updatedAt: new Date().toISOString() };
    } else {
      customers.push(customer);
    }

    await this.setData(STORAGE_KEYS.CUSTOMERS, customers);
  }

  async deleteCustomer(customerId: string): Promise<void> {
    const customers = await this.getCustomers();
    const filteredCustomers = customers.filter(c => c.id !== customerId);
    await this.setData(STORAGE_KEYS.CUSTOMERS, filteredCustomers);

    // Al eliminar cliente, quitar la referencia en vehículos (no borrar vehículos)
    const vehicles = await this.getVehicles();
    const updatedVehicles = vehicles.map(vehicle =>
      vehicle.customerId === customerId
        ? { ...vehicle, customerId: undefined, updatedAt: new Date().toISOString() }
        : vehicle
    );
    await this.setData(STORAGE_KEYS.VEHICLES, updatedVehicles);
  }

  // Órdenes de trabajo
  async getWorkOrders(): Promise<WorkOrder[]> {
    return this.getData<WorkOrder>(STORAGE_KEYS.WORK_ORDERS);
  }

  async getWorkOrdersByVehicle(vehicleId: string): Promise<WorkOrder[]> {
    const workOrders = await this.getWorkOrders();
    return workOrders.filter(order => order.vehicleId === vehicleId);
  }

  async saveWorkOrder(workOrder: WorkOrder): Promise<void> {
    const workOrders = await this.getWorkOrders();
    const existingIndex = workOrders.findIndex(order => order.id === workOrder.id);

    if (existingIndex >= 0) {
      workOrders[existingIndex] = { ...workOrder, updatedAt: new Date().toISOString() };
    } else {
      workOrders.push(workOrder);
    }

    await this.setData(STORAGE_KEYS.WORK_ORDERS, workOrders);
  }

  async deleteWorkOrder(workOrderId: string): Promise<void> {
    const workOrders = await this.getWorkOrders();
    const filteredWorkOrders = workOrders.filter(order => order.id !== workOrderId);
    await this.setData(STORAGE_KEYS.WORK_ORDERS, filteredWorkOrders);
  }

  async deleteWorkOrdersByVehicle(vehicleId: string): Promise<void> {
    const workOrders = await this.getWorkOrders();
    const filteredWorkOrders = workOrders.filter(order => order.vehicleId !== vehicleId);
    await this.setData(STORAGE_KEYS.WORK_ORDERS, filteredWorkOrders);
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

  // Onboarding
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  async setOnboardingCompleted(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
    } catch (error) {
      console.error('Error setting onboarding status:', error);
      throw error;
    }
  }

  async resetOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  }

  // Backup: obtener todos los datos relevantes para exportación
  async getBackupData(): Promise<BackupPayload> {
    const [vehicles, maintenances, expenses, reminders, customers, workOrders, settings, onboardingCompleted] = await Promise.all([
      this.getVehicles(),
      this.getMaintenances(),
      this.getExpenses(),
      this.getReminders(),
      this.getCustomers(),
      this.getWorkOrders(),
      this.getSettings(),
      this.isOnboardingCompleted(),
    ]);

    return {
      vehicles,
      maintenances,
      expenses,
      reminders,
      customers,
      workOrders,
      settings,
      onboardingCompleted,
    };
  }

  // Backup: restaurar todos los datos desde un respaldo válido
  async restoreBackupData(payload: BackupPayload): Promise<void> {
    const vehicles = Array.isArray(payload.vehicles) ? payload.vehicles : [];
    const maintenances = Array.isArray(payload.maintenances) ? payload.maintenances : [];
    const expenses = Array.isArray(payload.expenses) ? payload.expenses : [];
    const reminders = Array.isArray(payload.reminders) ? payload.reminders : [];
    const customers = Array.isArray(payload.customers) ? payload.customers : [];
    const workOrders = Array.isArray(payload.workOrders) ? payload.workOrders : [];
    const onboardingCompleted = payload.onboardingCompleted === true;

    const settings: AppSettings = payload.settings || {
      language: 'es',
      notifications: true,
      reminderDays: 7,
      currency: 'MXN',
      distanceUnit: 'km',
    };

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles)],
      [STORAGE_KEYS.MAINTENANCES, JSON.stringify(maintenances)],
      [STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)],
      [STORAGE_KEYS.REMINDERS, JSON.stringify(reminders)],
      [STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)],
      [STORAGE_KEYS.WORK_ORDERS, JSON.stringify(workOrders)],
      [STORAGE_KEYS.SETTINGS, JSON.stringify(settings)],
      [STORAGE_KEYS.ONBOARDING_COMPLETED, onboardingCompleted ? 'true' : 'false'],
    ]);
  }

  // Método para limpiar todos los datos (útil para resetear la app)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.VEHICLES,
        STORAGE_KEYS.MAINTENANCES,
        STORAGE_KEYS.EXPENSES,
        STORAGE_KEYS.REMINDERS,
        STORAGE_KEYS.CUSTOMERS,
        STORAGE_KEYS.WORK_ORDERS,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}

export default new AsyncStorageService();

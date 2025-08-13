/**
 * Tipos TypeScript para AutoCare Pro
 */

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  currentKilometers: number;
  licensePlate: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  date: string;
  cost: number;
  kilometers: number;
  notes?: string;
  photo?: string;
  nextDueDate?: string;
  nextDueKilometers?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  type: ExpenseType;
  description: string;
  amount: number;
  date: string;
  category: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  vehicleId: string;
  maintenanceType: MaintenanceType;
  title: string;
  description: string;
  dueDate: string;
  dueKilometers?: number;
  isCompleted: boolean;
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}

export enum MaintenanceType {
  OIL_CHANGE = 'oil_change',
  BRAKES = 'brakes',
  TIRES = 'tires',
  BATTERY = 'battery',
  AIR_FILTER = 'air_filter',
  SPARK_PLUGS = 'spark_plugs',
  TRANSMISSION = 'transmission',
  COOLANT = 'coolant',
  BRAKE_FLUID = 'brake_fluid',
  POWER_STEERING = 'power_steering',
  TIMING_BELT = 'timing_belt',
  GENERAL_INSPECTION = 'general_inspection',
  OTHER = 'other',
}

export enum ExpenseType {
  FUEL = 'fuel',
  MAINTENANCE = 'maintenance',
  REPAIRS = 'repairs',
  INSURANCE = 'insurance',
  REGISTRATION = 'registration',
  PARKING = 'parking',
  TOLLS = 'tolls',
  CLEANING = 'cleaning',
  OTHER = 'other',
}

export interface AppSettings {
  language: 'es' | 'en';
  notifications: boolean;
  reminderDays: number;
  currency: string;
  distanceUnit: 'km' | 'miles';
}

export interface NavigationProps {
  navigation: any;
  route?: any;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity?: number) => string;
  }>;
}

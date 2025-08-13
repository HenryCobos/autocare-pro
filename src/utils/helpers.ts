/**
 * Funciones utilitarias para AutoCare Pro
 */
import { MaintenanceType, ExpenseType } from '../types';

// Generar ID único
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Formatear fecha
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  // Asegurar formato DD/MM/YYYY independientemente de la configuración del sistema
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Formatear fecha y hora
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  
  // Formato DD/MM/YYYY HH:MM
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Formatear moneda
export const formatCurrency = (amount: number, currency: string = 'MXN'): string => {
  if (amount === 0) return '$0';
  
  // Para cantidades grandes, usar formato compacto
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 10000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Formatear kilometraje
export const formatKilometers = (km: number): string => {
  return new Intl.NumberFormat('es-ES').format(km) + ' km';
};

// Calcular edad del vehículo
export const getVehicleAge = (year: number): number => {
  const currentYear = new Date().getFullYear();
  return Math.max(0, currentYear - year);
};

// Calcular días hasta una fecha
export const getDaysUntil = (date: string): number => {
  const targetDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Obtener color según urgencia del recordatorio
export const getReminderStatusColor = (dueDate: string): string => {
  const daysUntil = getDaysUntil(dueDate);
  
  if (daysUntil < 0) return '#E53E3E'; // Rojo - Vencido
  if (daysUntil <= 1) return '#F56500'; // Naranja - Muy urgente
  if (daysUntil <= 3) return '#F6E05E'; // Amarillo - Urgente
  if (daysUntil <= 7) return '#3182CE'; // Azul - Próximo
  return '#38A169'; // Verde - Normal
};

// Obtener texto de estado del recordatorio
export const getReminderStatusText = (dueDate: string): string => {
  const daysUntil = getDaysUntil(dueDate);
  
  if (daysUntil < 0) return `Vencido hace ${Math.abs(daysUntil)} días`;
  if (daysUntil === 0) return 'Vence hoy';
  if (daysUntil === 1) return 'Vence mañana';
  if (daysUntil <= 7) return `Vence en ${daysUntil} días`;
  return `Vence en ${daysUntil} días`;
};

// Obtener nombre del tipo de mantenimiento
export const getMaintenanceTypeName = (type: MaintenanceType): string => {
  const names: Record<MaintenanceType, string> = {
    [MaintenanceType.OIL_CHANGE]: 'Cambio de aceite',
    [MaintenanceType.BRAKES]: 'Frenos',
    [MaintenanceType.TIRES]: 'Llantas',
    [MaintenanceType.BATTERY]: 'Batería',
    [MaintenanceType.AIR_FILTER]: 'Filtro de aire',
    [MaintenanceType.SPARK_PLUGS]: 'Bujías',
    [MaintenanceType.TRANSMISSION]: 'Transmisión',
    [MaintenanceType.COOLANT]: 'Refrigerante',
    [MaintenanceType.BRAKE_FLUID]: 'Líquido de frenos',
    [MaintenanceType.POWER_STEERING]: 'Dirección hidráulica',
    [MaintenanceType.TIMING_BELT]: 'Banda de tiempo',
    [MaintenanceType.GENERAL_INSPECTION]: 'Inspección general',
    [MaintenanceType.OTHER]: 'Otro',
  };
  return names[type] || 'Otro';
};

// Obtener icono del tipo de mantenimiento
export const getMaintenanceTypeIcon = (type: MaintenanceType): string => {
  const icons: Record<MaintenanceType, string> = {
    [MaintenanceType.OIL_CHANGE]: 'water-outline',
    [MaintenanceType.BRAKES]: 'stop-circle-outline',
    [MaintenanceType.TIRES]: 'ellipse-outline',
    [MaintenanceType.BATTERY]: 'battery-half-outline',
    [MaintenanceType.AIR_FILTER]: 'filter-outline',
    [MaintenanceType.SPARK_PLUGS]: 'flash-outline',
    [MaintenanceType.TRANSMISSION]: 'settings-outline',
    [MaintenanceType.COOLANT]: 'thermometer-outline',
    [MaintenanceType.BRAKE_FLUID]: 'water-outline',
    [MaintenanceType.POWER_STEERING]: 'steering-wheel-outline',
    [MaintenanceType.TIMING_BELT]: 'infinite-outline',
    [MaintenanceType.GENERAL_INSPECTION]: 'checkmark-circle-outline',
    [MaintenanceType.OTHER]: 'build-outline',
  };
  return icons[type] || 'build-outline';
};

// Obtener nombre del tipo de gasto
export const getExpenseTypeName = (type: ExpenseType): string => {
  const names: Record<ExpenseType, string> = {
    [ExpenseType.FUEL]: 'Combustible',
    [ExpenseType.MAINTENANCE]: 'Mantenimiento',
    [ExpenseType.REPAIRS]: 'Reparaciones',
    [ExpenseType.INSURANCE]: 'Seguro',
    [ExpenseType.REGISTRATION]: 'Registro',
    [ExpenseType.PARKING]: 'Estacionamiento',
    [ExpenseType.TOLLS]: 'Casetas',
    [ExpenseType.CLEANING]: 'Limpieza',
    [ExpenseType.OTHER]: 'Otro',
  };
  return names[type] || 'Otro';
};

// Obtener icono del tipo de gasto
export const getExpenseTypeIcon = (type: ExpenseType): string => {
  const icons: Record<ExpenseType, string> = {
    [ExpenseType.FUEL]: 'car-outline',
    [ExpenseType.MAINTENANCE]: 'build-outline',
    [ExpenseType.REPAIRS]: 'construct-outline',
    [ExpenseType.INSURANCE]: 'shield-outline',
    [ExpenseType.REGISTRATION]: 'document-outline',
    [ExpenseType.PARKING]: 'location-outline',
    [ExpenseType.TOLLS]: 'cash-outline',
    [ExpenseType.CLEANING]: 'water-outline',
    [ExpenseType.OTHER]: 'ellipsis-horizontal-outline',
  };
  return icons[type] || 'ellipsis-horizontal-outline';
};

// Verificar si una fecha ya pasó
export const isOverdue = (targetDate: string): boolean => {
  return getDaysUntil(targetDate) < 0;
};

// Verificar si una fecha está próxima (dentro de los próximos 7 días)
export const isUpcoming = (targetDate: string, days: number = 7): boolean => {
  const daysUntil = getDaysUntil(targetDate);
  return daysUntil >= 0 && daysUntil <= days;
};

// Validar email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar número de teléfono
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Capitalizar primera letra
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncar texto
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};



// Generar opciones de años para vehículos
export const getVehicleYearOptions = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  
  for (let year = currentYear; year >= 1980; year--) {
    years.push(year);
  }
  
  return years;
};

// Agrupar elementos por mes
export const groupByMonth = <T>(items: T[], dateKey: keyof T): Record<string, T[]> => {
  return items.reduce((groups, item) => {
    const date = new Date(item[dateKey] as string);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    
    groups[monthKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Obtener nombre del mes
export const getMonthName = (monthKey: string): string => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  
  return date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
};

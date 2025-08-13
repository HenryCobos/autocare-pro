/**
 * Navegación principal de AutoCare Pro
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

// Pantallas
import DashboardScreen from '../screens/DashboardScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import AddEditVehicleScreen from '../screens/AddEditVehicleScreen';
import VehicleHistoryScreen from '../screens/VehicleHistoryScreen';
import MaintenanceScreen from '../screens/MaintenanceScreen';
import AddEditMaintenanceScreen from '../screens/AddEditMaintenanceScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddEditExpenseScreen from '../screens/AddEditExpenseScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Tipos de navegación
export type RootStackParamList = {
  MainTabs: undefined;
  AddEditVehicle: { vehicleId?: string };
  VehicleHistory: { vehicleId: string };
  AddEditMaintenance: { vehicleId?: string; maintenanceId?: string };
  AddEditExpense: { vehicleId?: string; expenseId?: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Vehicles: undefined;
  Maintenance: undefined;
  Calendar: undefined;
  Expenses: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Configuración de iconos para las pestañas
const getTabBarIcon = (routeName: keyof MainTabParamList, color: string, size: number) => {
  let iconName: keyof typeof Ionicons.glyphMap;

  switch (routeName) {
    case 'Dashboard':
      iconName = 'home-outline';
      break;
    case 'Vehicles':
      iconName = 'car-outline';
      break;
    case 'Maintenance':
      iconName = 'build-outline';
      break;
    case 'Calendar':
      iconName = 'calendar-outline';
      break;
    case 'Expenses':
      iconName = 'receipt-outline';
      break;
    case 'Settings':
      iconName = 'settings-outline';
      break;
    default:
      iconName = 'ellipse-outline';
      break;
  }

  return <Ionicons name={iconName} size={size} color={color} />;
};

// Navegador de pestañas principales
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => getTabBarIcon(route.name as keyof MainTabParamList, color, size),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.darkGray,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Inicio',
          headerTitle: 'AutoCare Pro',
        }}
      />
      <Tab.Screen
        name="Vehicles"
        component={VehiclesScreen}
        options={{
          title: 'Vehículos',
          headerTitle: 'Mis Vehículos',
        }}
      />
      <Tab.Screen
        name="Maintenance"
        component={MaintenanceScreen}
        options={{
          title: 'Mantenimiento',
          headerTitle: 'Mantenimientos',
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Calendario',
          headerTitle: 'Calendario',
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          title: 'Gastos',
          headerTitle: 'Historial de Gastos',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
          headerTitle: 'Configuración',
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal de la aplicación
const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddEditVehicle"
          component={AddEditVehicleScreen}
          options={({ route }) => ({
            title: route.params?.vehicleId ? 'Editar Vehículo' : 'Agregar Vehículo',
          })}
        />
        <Stack.Screen
          name="VehicleHistory"
          component={VehicleHistoryScreen}
          options={{
            title: 'Historial del Vehículo',
          }}
        />
        <Stack.Screen
          name="AddEditMaintenance"
          component={AddEditMaintenanceScreen}
          options={({ route }) => ({
            title: route.params?.maintenanceId ? 'Editar Mantenimiento' : 'Agregar Mantenimiento',
          })}
        />
        <Stack.Screen
          name="AddEditExpense"
          component={AddEditExpenseScreen}
          options={({ route }) => ({
            title: route.params?.expenseId ? 'Editar Gasto' : 'Agregar Gasto',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

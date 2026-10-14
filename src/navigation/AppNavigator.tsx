/**
 * Navegación principal de AutoCare Pro
 */
import React, { useState, useEffect } from 'react';
import { Platform, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorageService from '../services/AsyncStorageService';

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
import AddEditWorkOrderScreen from '../screens/AddEditWorkOrderScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SubscriptionManagementScreen from '../screens/SubscriptionManagementScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import TikTokDiagnosticsScreen from '../screens/TikTokDiagnosticsScreen';
import Constants from 'expo-constants';

export const DIAGNOSTICS_ENABLED = Constants.expoConfig?.extra?.enableDiagnostics === true;

// Tipos de navegación
export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  AddEditVehicle: { vehicleId?: string };
  VehicleHistory: { vehicleId: string };
  AddEditMaintenance: { vehicleId?: string; maintenanceId?: string };
  AddEditExpense: { vehicleId?: string; expenseId?: string };
  AddEditWorkOrder: { vehicleId?: string; workOrderId?: string };
  Paywall: { source?: 'limit' | 'settings' | 'onboarding'; limitType?: string; recommendedPlan?: string };
  SubscriptionManagement: undefined;
  TikTokDiagnostics: undefined;
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
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => getTabBarIcon(route.name as keyof MainTabParamList, color, 22),
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.darkGray,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 60 + insets.bottom : 60,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
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
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorageService.isOnboardingCompleted();
      setShowOnboarding(!completed);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={showOnboarding ? 'Onboarding' : 'MainTabs'}
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
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
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
        <Stack.Screen
          name="AddEditWorkOrder"
          component={AddEditWorkOrderScreen}
          options={({ route }) => ({
            title: route.params?.workOrderId ? 'Editar Orden' : 'Nueva Orden',
          })}
        />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="SubscriptionManagement"
          component={SubscriptionManagementScreen}
          options={{
            headerShown: false,
          }}
        />
        {DIAGNOSTICS_ENABLED && (
          <Stack.Screen
            name="TikTokDiagnostics"
            component={TikTokDiagnosticsScreen}
            options={{
              title: 'Diagnóstico TikTok',
              headerBackTitle: 'Atrás',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

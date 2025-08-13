/**
 * Pantalla de Gastos - Historial de gastos vehiculares
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { Expense, Vehicle } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import {
  formatDate,
  formatCurrency,
  getExpenseTypeName,
  getExpenseTypeIcon,
  groupByMonth,
  getMonthName,
} from '../utils/helpers';

// Componentes
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ExpenseChart from '../components/charts/ExpenseChart';
import BannerAd from '../components/ads/BannerAd';

interface ExpensesScreenProps {
  navigation: any;
}

const ExpensesScreen: React.FC<ExpensesScreenProps> = ({ navigation }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');

  // Cargar datos
  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, vehiclesData] = await Promise.all([
        AsyncStorageService.getExpenses(),
        AsyncStorageService.getVehicles(),
      ]);
      
      // Ordenar gastos por fecha (más reciente primero)
      const sortedExpenses = expensesData.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setExpenses(sortedExpenses);
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error loading expenses data:', error);
      Alert.alert('Error', 'No se pudieron cargar los gastos');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar datos
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Eliminar gasto
  const deleteExpense = (expense: Expense) => {
    const vehicle = vehicles.find(v => v.id === expense.vehicleId);
    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo';
    const typeName = getExpenseTypeName(expense.type);

    Alert.alert(
      'Eliminar Gasto',
      `¿Estás seguro de que deseas eliminar el gasto de ${typeName} para ${vehicleName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorageService.deleteExpense(expense.id);
              await loadData();
              Alert.alert('Éxito', 'Gasto eliminado correctamente');
            } catch (error) {
              console.error('Error deleting expense:', error);
              Alert.alert('Error', 'No se pudo eliminar el gasto');
            }
          },
        },
      ]
    );
  };

  // Cargar datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // Filtrar gastos por vehículo
  const filteredExpenses = selectedVehicle === 'all' 
    ? expenses 
    : expenses.filter(e => e.vehicleId === selectedVehicle);

  // Calcular totales
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyTotals = groupByMonth(filteredExpenses, 'date');

  // Renderizar gasto
  const renderExpense = ({ item: expense }: { item: Expense }) => {
    const vehicle = vehicles.find(v => v.id === expense.vehicleId);
    const icon = getExpenseTypeIcon(expense.type);
    const typeName = getExpenseTypeName(expense.type);

    return (
      <Card
        style={styles.expenseCard}
        onPress={() => navigation.navigate('AddEditExpense', { 
          vehicleId: expense.vehicleId, 
          expenseId: expense.id 
        })}
      >
        <View style={styles.expenseHeader}>
          <View style={styles.expenseIcon}>
            <Ionicons name={icon as any} size={24} color={Colors.primary} />
          </View>
          
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseType}>{typeName}</Text>
            <Text style={styles.expenseDescription}>{expense.description}</Text>
            <Text style={styles.expenseVehicle}>
              {vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo no encontrado'}
            </Text>
            <Text style={styles.expenseDate}>{formatDate(expense.date)}</Text>
          </View>

          <View style={styles.expenseActions}>
            <Text style={styles.expenseAmount}>
              {formatCurrency(expense.amount)}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteExpense(expense)}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );
  };

  // Renderizar separador de mes con total
  const renderMonthSeparator = (monthKey: string) => {
    const monthExpenses = monthlyTotals[monthKey];
    const monthTotal = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
      <View key={`month-${monthKey}`} style={styles.monthSeparator}>
        <Text style={styles.monthText}>{getMonthName(monthKey)}</Text>
        <Text style={styles.monthTotal}>{formatCurrency(monthTotal)}</Text>
      </View>
    );
  };

  // Preparar datos agrupados por mes
  const getGroupedData = () => {
    const grouped = groupByMonth(filteredExpenses, 'date');
    const result: any[] = [];

    Object.keys(grouped)
      .sort((a, b) => b.localeCompare(a)) // Orden descendente
      .forEach(monthKey => {
        result.push({ type: 'month', monthKey });
        grouped[monthKey].forEach(expense => {
          result.push({ type: 'expense', expense });
        });
      });

    return result;
  };

  // Renderizar item
  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'month') {
      return renderMonthSeparator(item.monthKey);
    }
    return renderExpense({ item: item.expense });
  };

  // Estado vacío
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color={Colors.mediumGray} />
      <Text style={styles.emptyTitle}>No hay gastos registrados</Text>
      <Text style={styles.emptySubtitle}>
        Registra los gastos de tus vehículos para llevar un control financiero
      </Text>
      {vehicles.length > 0 ? (
        <Button
          title="Agregar Gasto"
          icon="add-outline"
          onPress={() => navigation.navigate('AddEditExpense')}
          style={styles.emptyButton}
        />
      ) : (
        <Button
          title="Agregar Vehículo Primero"
          icon="car-outline"
          onPress={() => navigation.navigate('Vehicles')}
          style={styles.emptyButton}
        />
      )}
    </View>
  );

  // Renderizar header con filtros y totales
  const renderHeader = () => (
    <View>
      {/* Resumen de totales */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de Gastos</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
        <Text style={styles.totalLabel}>
          {selectedVehicle === 'all' ? 'Total general' : 'Total del vehículo'}
        </Text>
      </Card>

      {/* Gráficos de gastos */}
      {filteredExpenses.length > 0 && (
        <>
          <ExpenseChart
            expenses={filteredExpenses}
            type="line"
            title="Tendencia de Gastos Mensual"
          />
          <BannerAd position="inline" />
          <ExpenseChart
            expenses={filteredExpenses}
            type="pie"
            title="Gastos por Categoría"
          />
        </>
      )}

      {/* Filtro por vehículo */}
      {vehicles.length > 1 && (
        <Card style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filtrar por vehículo:</Text>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedVehicle === 'all' && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedVehicle('all')}
            >
              <Text style={[
                styles.filterButtonText,
                selectedVehicle === 'all' && styles.filterButtonTextActive,
              ]}>
                Todos
              </Text>
            </TouchableOpacity>
            
            {vehicles.map(vehicle => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.filterButton,
                  selectedVehicle === vehicle.id && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedVehicle(vehicle.id)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedVehicle === vehicle.id && styles.filterButtonTextActive,
                ]}>
                  {vehicle.brand} {vehicle.model}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}
    </View>
  );

  const groupedData = getGroupedData();

  return (
    <View style={styles.container}>
      <FlatList
        data={groupedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => 
          item.type === 'month' ? `month-${item.monthKey}` : `expense-${item.expense.id}`
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={expenses.length > 0 ? renderHeader : null}
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />

      {vehicles.length > 0 && (
        <View style={styles.fab}>
          <Button
            title=""
            icon="add"
            onPress={() => navigation.navigate('AddEditExpense')}
            style={styles.fabButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    padding: Theme.spacing.md,
    paddingBottom: 100,
  },
  summaryCard: {
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  summaryTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.sm,
  },
  totalAmount: {
    fontSize: Theme.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  totalLabel: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
  },
  filterCard: {
    marginBottom: Theme.spacing.md,
  },
  filterTitle: {
    fontSize: Theme.fontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Theme.spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  monthSeparator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  monthText: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  monthTotal: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  expenseCard: {
    marginBottom: Theme.spacing.sm,
  },
  expenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseType: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
  },
  expenseDescription: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  expenseVehicle: {
    fontSize: Theme.fontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Theme.spacing.xs,
  },
  expenseDate: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  expenseActions: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: Theme.spacing.sm,
  },
  deleteButton: {
    padding: Theme.spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: Theme.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginTop: Theme.spacing.lg,
  },
  emptySubtitle: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  emptyButton: {
    width: 200,
  },
  fab: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    right: Theme.spacing.lg,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
});

export default ExpensesScreen;

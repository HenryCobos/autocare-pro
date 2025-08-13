/**
 * Componente de gráfico de gastos
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Colors, Theme } from '../../constants/Colors';
import { Expense } from '../../types';
import { groupByMonth, getMonthName, formatCurrency } from '../../utils/helpers';

const screenWidth = Dimensions.get('window').width;

interface ExpenseChartProps {
  expenses: Expense[];
  type: 'line' | 'bar' | 'pie';
  title: string;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses, type, title }) => {
  // Configuración común de los gráficos
  const chartConfig = {
    backgroundColor: Colors.white,
    backgroundGradientFrom: Colors.white,
    backgroundGradientTo: Colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(30, 136, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: Theme.borderRadius.md,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: Colors.primary,
    },
    propsForLabels: {
      fontSize: 12,
    },
  };

  // Preparar datos por mes para gráficos de línea y barra
  const prepareMonthlyData = () => {
    const grouped = groupByMonth(expenses, 'date');
    const months = Object.keys(grouped).sort();
    
    // Tomar los últimos 6 meses
    const recentMonths = months.slice(-6);
    
    const labels = recentMonths.map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      return date.toLocaleDateString('es-ES', { month: 'short' });
    });
    
    const data = recentMonths.map(month => {
      const monthExpenses = grouped[month] || [];
      return monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    });

    return { labels, data };
  };

  // Preparar datos por tipo para gráfico de pastel
  const prepareTypeData = () => {
    const typeGroups: Record<string, number> = {};
    
    expenses.forEach(expense => {
      const typeName = expense.category || 'Otros';
      typeGroups[typeName] = (typeGroups[typeName] || 0) + expense.amount;
    });

    // Convertir a formato requerido por PieChart
    const pieData = Object.entries(typeGroups)
      .sort(([, a], [, b]) => b - a) // Ordenar por monto descendente
      .slice(0, 5) // Tomar top 5
      .map(([name, amount], index) => ({
        name,
        amount,
        color: getColorForIndex(index),
        legendFontColor: Colors.text,
        legendFontSize: 12,
      }));

    return pieData;
  };

  // Obtener color para cada índice del gráfico de pastel
  const getColorForIndex = (index: number): string => {
    const colors = [
      Colors.primary,
      Colors.warning,
      Colors.success,
      Colors.error,
      Colors.info,
    ];
    return colors[index % colors.length];
  };

  // Renderizar gráfico de línea
  const renderLineChart = () => {
    const { labels, data } = prepareMonthlyData();
    
    if (data.length === 0 || data.every(value => value === 0)) {
      return renderNoData();
    }

    return (
      <LineChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={screenWidth - Theme.spacing.md * 4}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero
      />
    );
  };

  // Renderizar gráfico de barras
  const renderBarChart = () => {
    const { labels, data } = prepareMonthlyData();
    
    if (data.length === 0 || data.every(value => value === 0)) {
      return renderNoData();
    }

    return (
      <BarChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={screenWidth - Theme.spacing.md * 4}
        height={220}
        chartConfig={chartConfig}
        style={styles.chart}
        verticalLabelRotation={0}
        withInnerLines={false}
        fromZero
        yAxisLabel="$"
        yAxisSuffix=""
        showBarTops={false}
      />
    );
  };

  // Renderizar gráfico de pastel
  const renderPieChart = () => {
    const pieData = prepareTypeData();
    
    if (pieData.length === 0) {
      return renderNoData();
    }

    return (
      <PieChart
        data={pieData}
        width={screenWidth - Theme.spacing.md * 4}
        height={220}
        chartConfig={chartConfig}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
        absolute
      />
    );
  };

  // Renderizar mensaje cuando no hay datos
  const renderNoData = () => (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>No hay datos suficientes para mostrar el gráfico</Text>
    </View>
  );

  // Renderizar gráfico según el tipo
  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      default:
        return renderLineChart();
    }
  };

  // Calcular estadísticas
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const average = expenses.length > 0 ? total / expenses.length : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Estadísticas rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{formatCurrency(total)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Promedio</Text>
          <Text style={styles.statValue}>{formatCurrency(average)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Registros</Text>
          <Text style={styles.statValue}>{expenses.length}</Text>
        </View>
      </View>

      {/* Gráfico */}
      <View style={styles.chartContainer}>
        {renderChart()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginVertical: Theme.spacing.sm,
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  statValue: {
    fontSize: Theme.fontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.md,
  },
  noDataText: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
});

export default ExpenseChart;

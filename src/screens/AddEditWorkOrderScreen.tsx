/**
 * Pantalla Agregar/Editar Orden de Trabajo
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Theme } from '../constants/Colors';
import { Customer, Vehicle, WorkOrder, WorkOrderStatus } from '../types';
import AsyncStorageService from '../services/AsyncStorageService';
import { formatDate, generateId } from '../utils/helpers';
import { useTikTok, TikTokCustomEvent } from '../hooks/useTracking';

import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import DatePickerModal from '../components/common/DatePickerModal';

interface AddEditWorkOrderScreenProps {
  navigation: any;
  route: any;
}

const WORK_ORDER_STATUS_OPTIONS: Array<{ value: WorkOrderStatus; label: string; color: string }> = [
  { value: 'received', label: 'Recibido', color: Colors.info },
  { value: 'diagnosed', label: 'Diagnosticado', color: Colors.warning },
  { value: 'approved', label: 'Aprobado', color: Colors.primary },
  { value: 'in_progress', label: 'En progreso', color: Colors.primary },
  { value: 'completed', label: 'Completado', color: Colors.success },
  { value: 'delivered', label: 'Entregado', color: Colors.success },
  { value: 'cancelled', label: 'Cancelado', color: Colors.error },
];

const AddEditWorkOrderScreen: React.FC<AddEditWorkOrderScreenProps> = ({ navigation, route }) => {
  const { vehicleId, workOrderId } = route.params || {};
  const isEditing = Boolean(workOrderId);
  const { trackCustomEvent } = useTikTok();

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    vehicleId: vehicleId || '',
    customerId: '',
    status: 'received' as WorkOrderStatus,
    complaint: '',
    diagnosis: '',
    laborCost: 0,
    partsCost: 0,
    notes: '',
    scheduledAt: '',
  });

  const selectedVehicle = vehicles.find(vehicle => vehicle.id === formData.vehicleId);
  const selectedCustomer = customers.find(customer => customer.id === formData.customerId);
  const selectedStatus = WORK_ORDER_STATUS_OPTIONS.find(status => status.value === formData.status);

  const totalCost = useMemo(
    () => (Number.isFinite(formData.laborCost) ? formData.laborCost : 0) + (Number.isFinite(formData.partsCost) ? formData.partsCost : 0),
    [formData.laborCost, formData.partsCost]
  );

  useEffect(() => {
    loadData();
  }, [vehicleId, workOrderId]);

  const loadData = async () => {
    try {
      const [vehiclesData, customersData, workOrdersData] = await Promise.all([
        AsyncStorageService.getVehicles(),
        AsyncStorageService.getCustomers(),
        AsyncStorageService.getWorkOrders(),
      ]);

      setVehicles(vehiclesData);
      setCustomers(customersData);

      if (!isEditing) {
        const defaultVehicleId = vehicleId || vehiclesData[0]?.id || '';
        const defaultVehicle = vehiclesData.find(vehicle => vehicle.id === defaultVehicleId);

        setFormData(prev => ({
          ...prev,
          vehicleId: defaultVehicleId,
          customerId: defaultVehicle?.customerId || '',
        }));
        return;
      }

      const existingOrder = workOrdersData.find(order => order.id === workOrderId);
      if (!existingOrder) {
        Alert.alert('Error', 'No se encontró la orden de trabajo.');
        navigation.goBack();
        return;
      }

      setFormData({
        vehicleId: existingOrder.vehicleId,
        customerId: existingOrder.customerId || '',
        status: existingOrder.status,
        complaint: existingOrder.complaint,
        diagnosis: existingOrder.diagnosis || '',
        laborCost: existingOrder.laborCost,
        partsCost: existingOrder.partsCost,
        notes: existingOrder.notes || '',
        scheduledAt: existingOrder.scheduledAt || '',
      });
    } catch (error) {
      console.error('Error loading work order data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos.');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Debes seleccionar un vehículo.';
    }
    if (!formData.complaint.trim()) {
      newErrors.complaint = 'La falla reportada es obligatoria.';
    }
    if (formData.laborCost < 0) {
      newErrors.laborCost = 'La mano de obra no puede ser negativa.';
    }
    if (formData.partsCost < 0) {
      newErrors.partsCost = 'Repuestos no puede ser negativo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveWorkOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const existingOrder = isEditing
        ? (await AsyncStorageService.getWorkOrders()).find(order => order.id === workOrderId)
        : undefined;

      const shouldClose =
        formData.status === 'completed' ||
        formData.status === 'delivered' ||
        formData.status === 'cancelled';

      const payload: WorkOrder = {
        id: workOrderId || generateId(),
        vehicleId: formData.vehicleId,
        customerId: formData.customerId || undefined,
        status: formData.status,
        openedAt: existingOrder?.openedAt || new Date().toISOString(),
        scheduledAt: formData.scheduledAt || undefined,
        closedAt: shouldClose ? existingOrder?.closedAt || new Date().toISOString() : undefined,
        complaint: formData.complaint.trim(),
        diagnosis: formData.diagnosis.trim() || undefined,
        laborCost: formData.laborCost,
        partsCost: formData.partsCost,
        totalCost,
        notes: formData.notes.trim() || undefined,
        items: existingOrder?.items || [],
        createdAt: existingOrder?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorageService.saveWorkOrder(payload);
      if (!isEditing) {
        await trackCustomEvent(TikTokCustomEvent.ADD_WORK_ORDER, {
          content_type: 'work_order',
          content_category: payload.status,
        });
      }
      Alert.alert('Éxito', `Orden ${isEditing ? 'actualizada' : 'creada'} correctamente.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error saving work order:', error);
      Alert.alert('Error', 'No se pudo guardar la orden de trabajo.');
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkOrder = () => {
    if (!workOrderId) return;

    Alert.alert('Eliminar orden', '¿Seguro que deseas eliminar esta orden de trabajo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await AsyncStorageService.deleteWorkOrder(workOrderId);
            Alert.alert('Éxito', 'Orden eliminada correctamente.', [
              { text: 'OK', onPress: () => navigation.goBack() },
            ]);
          } catch (error) {
            console.error('Error deleting work order:', error);
            Alert.alert('Error', 'No se pudo eliminar la orden.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={styles.sectionTitle}>Orden de Trabajo</Text>

          <View style={styles.inlineField}>
            <Text style={styles.fieldLabel}>Vehículo *</Text>
            <Text style={styles.fieldValue}>
              {selectedVehicle
                ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.licensePlate})`
                : 'Sin vehículo'}
            </Text>
            {errors.vehicleId && <Text style={styles.errorText}>{errors.vehicleId}</Text>}
          </View>

          <View style={styles.inlineField}>
            <Text style={styles.fieldLabel}>Cliente</Text>
            <Text style={styles.fieldValue}>{selectedCustomer?.name || 'Sin cliente'}</Text>
          </View>

          <View style={styles.inlineField}>
            <Text style={styles.fieldLabel}>Estado</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowStatusModal(true)}
            >
              <View style={[styles.statusDot, { backgroundColor: selectedStatus?.color || Colors.primary }]} />
              <Text style={styles.pickerButtonText}>{selectedStatus?.label || 'Seleccionar estado'}</Text>
              <Ionicons name="chevron-down" size={18} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>

          <Input
            label="Falla reportada"
            value={formData.complaint}
            onChangeText={(text) => setFormData(prev => ({ ...prev, complaint: text }))}
            placeholder="Describe el problema reportado por el cliente"
            error={errors.complaint}
            required
          />

          <Input
            label="Diagnóstico"
            value={formData.diagnosis}
            onChangeText={(text) => setFormData(prev => ({ ...prev, diagnosis: text }))}
            placeholder="Resultado del diagnóstico (opcional)"
          />

          <Input
            label="Mano de Obra"
            value={formData.laborCost.toString()}
            onChangeText={(text) => setFormData(prev => ({ ...prev, laborCost: parseFloat(text) || 0 }))}
            keyboardType="numeric"
            placeholder="0.00"
            error={errors.laborCost}
          />

          <Input
            label="Repuestos"
            value={formData.partsCost.toString()}
            onChangeText={(text) => setFormData(prev => ({ ...prev, partsCost: parseFloat(text) || 0 }))}
            keyboardType="numeric"
            placeholder="0.00"
            error={errors.partsCost}
          />

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total estimado</Text>
            <Text style={styles.totalValue}>${totalCost.toFixed(2)}</Text>
          </View>

          <View style={styles.inlineField}>
            <Text style={styles.fieldLabel}>Fecha programada</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.pickerButtonText}>
                {formData.scheduledAt ? formatDate(formData.scheduledAt) : 'Seleccionar fecha (opcional)'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={Colors.darkGray} />
            </TouchableOpacity>
          </View>

          <Input
            label="Notas"
            value={formData.notes}
            onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
            placeholder="Observaciones internas (opcional)"
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Acciones desde esta orden</Text>
          <View style={styles.quickActions}>
            <Button
              title="Agregar mantenimiento"
              icon="build-outline"
              variant="outline"
              onPress={() =>
                navigation.navigate('AddEditMaintenance', {
                  vehicleId: formData.vehicleId,
                  prefillNotes: formData.complaint,
                })
              }
              style={styles.quickActionButton}
            />
            <Button
              title="Agregar gasto"
              icon="receipt-outline"
              variant="outline"
              onPress={() =>
                navigation.navigate('AddEditExpense', {
                  vehicleId: formData.vehicleId,
                  prefillDescription: formData.complaint,
                })
              }
              style={styles.quickActionButton}
            />
          </View>
        </Card>

        <View style={styles.actions}>
          {isEditing ? (
            <Button
              title="Eliminar"
              variant="danger"
              onPress={deleteWorkOrder}
              style={styles.actionButton}
            />
          ) : (
            <Button
              title="Cancelar"
              variant="outline"
              onPress={() => navigation.goBack()}
              style={styles.actionButton}
            />
          )}
          <Button
            title={isEditing ? 'Actualizar' : 'Guardar'}
            onPress={saveWorkOrder}
            loading={loading}
            style={styles.actionButton}
          />
        </View>

        <Modal
          visible={showStatusModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStatusModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Estado de la orden</Text>
                <TouchableOpacity onPress={() => setShowStatusModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.darkGray} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={WORK_ORDER_STATUS_OPTIONS}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.statusItem}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, status: item.value }));
                      setShowStatusModal(false);
                    }}
                  >
                    <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                    <Text style={styles.statusLabel}>{item.label}</Text>
                    {formData.status === item.value && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        <DatePickerModal
          visible={showDatePicker}
          value={formData.scheduledAt ? new Date(formData.scheduledAt) : new Date()}
          title="Fecha Programada"
          onClose={() => setShowDatePicker(false)}
          onChange={(date) => setFormData(prev => ({ ...prev, scheduledAt: date.toISOString() }))}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Theme.spacing.md,
  },
  inlineField: {
    marginBottom: Theme.spacing.md,
  },
  fieldLabel: {
    fontSize: Theme.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  fieldValue: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
    fontWeight: '600',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
  },
  pickerButtonText: {
    fontSize: Theme.fontSize.md,
    color: Colors.text,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Theme.spacing.sm,
  },
  totalBox: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.md,
    backgroundColor: Colors.lightGray,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Theme.fontSize.md,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  quickActionButton: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  errorText: {
    fontSize: Theme.fontSize.sm,
    color: Colors.error,
    marginTop: Theme.spacing.xs,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Theme.borderRadius.lg,
    borderTopRightRadius: Theme.borderRadius.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    padding: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Theme.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusLabel: {
    flex: 1,
    fontSize: Theme.fontSize.md,
    color: Colors.text,
  },
});

export default AddEditWorkOrderScreen;

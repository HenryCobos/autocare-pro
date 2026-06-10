/**
 * Servicio de exportación de datos a PDF
 */

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Vehicle, Maintenance, Expense } from '../types';
import { formatDate, formatCurrency, formatKilometers } from '../utils/helpers';
import AsyncStorageService from './AsyncStorageService';

class ExportService {
  /**
   * Generar HTML para el PDF
   */
  private async generateHTML(data: {
    vehicle?: Vehicle;
    maintenances?: Maintenance[];
    expenses?: Expense[];
    title: string;
    dateRange?: string;
  }): Promise<string> {
    const { vehicle, maintenances, expenses, title, dateRange } = data;
    
    // Obtener moneda de settings
    const settings = await AsyncStorageService.getSettings();
    const currency = settings.currency || 'MXN';

    let content = '';

    // Información del vehículo
    if (vehicle) {
      content += `
        <div class="vehicle-info">
          <h2>Información del Vehículo</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Marca:</span>
              <span class="value">${vehicle.brand}</span>
            </div>
            <div class="info-item">
              <span class="label">Modelo:</span>
              <span class="value">${vehicle.model}</span>
            </div>
            <div class="info-item">
              <span class="label">Año:</span>
              <span class="value">${vehicle.year}</span>
            </div>
            <div class="info-item">
              <span class="label">Placa:</span>
              <span class="value">${vehicle.licensePlate}</span>
            </div>
            <div class="info-item">
              <span class="label">Kilometraje:</span>
              <span class="value">${formatKilometers(vehicle.currentKilometers)}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Tabla de mantenimientos
    if (maintenances && maintenances.length > 0) {
      const totalMaintenance = maintenances.reduce((sum, m) => sum + m.cost, 0);
      
      content += `
        <div class="section">
          <h2>Historial de Mantenimientos</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Kilometraje</th>
                <th>Costo</th>
              </tr>
            </thead>
            <tbody>
              ${maintenances.map(m => `
                <tr>
                  <td>${formatDate(m.date)}</td>
                  <td>${this.getMaintenanceTypeName(m.type)}</td>
                  <td>${m.notes || '-'}</td>
                  <td>${formatKilometers(m.kilometers)}</td>
                  <td>${formatCurrency(m.cost, currency)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="4" style="text-align: right;"><strong>Total:</strong></td>
                <td><strong>${formatCurrency(totalMaintenance, currency)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // Tabla de gastos
    if (expenses && expenses.length > 0) {
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      
      content += `
        <div class="section">
          <h2>Historial de Gastos</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${expenses.map(e => `
                <tr>
                  <td>${formatDate(e.date)}</td>
                  <td>${this.getExpenseTypeName(e.type)}</td>
                  <td>${e.description || '-'}</td>
                  <td>${formatCurrency(e.amount, currency)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                <td><strong>${formatCurrency(totalExpenses, currency)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // HTML completo
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Helvetica', 'Arial', sans-serif;
              padding: 40px;
              color: #333;
              line-height: 1.6;
            }
            
            .header {
              text-align: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 3px solid #1E88E5;
            }
            
            .header h1 {
              color: #1E88E5;
              font-size: 28px;
              margin-bottom: 10px;
            }
            
            .header .subtitle {
              color: #666;
              font-size: 16px;
            }
            
            .header .date {
              color: #999;
              font-size: 14px;
              margin-top: 10px;
            }
            
            .section {
              margin-bottom: 40px;
            }
            
            h2 {
              color: #1E88E5;
              font-size: 20px;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #E0E0E0;
            }
            
            .vehicle-info {
              margin-bottom: 40px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-top: 20px;
            }
            
            .info-item {
              padding: 15px;
              background: #F5F5F5;
              border-radius: 8px;
            }
            
            .info-item .label {
              display: block;
              color: #666;
              font-size: 12px;
              margin-bottom: 5px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .info-item .value {
              display: block;
              color: #333;
              font-size: 16px;
              font-weight: bold;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              background: white;
            }
            
            thead {
              background: #1E88E5;
              color: white;
            }
            
            th {
              padding: 12px;
              text-align: left;
              font-weight: bold;
              font-size: 14px;
            }
            
            td {
              padding: 12px;
              border-bottom: 1px solid #E0E0E0;
              font-size: 13px;
            }
            
            tbody tr:hover {
              background: #F5F5F5;
            }
            
            tfoot {
              background: #F5F5F5;
              font-weight: bold;
            }
            
            tfoot td {
              padding: 15px 12px;
              border-top: 2px solid #1E88E5;
              border-bottom: none;
            }
            
            .footer {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 2px solid #E0E0E0;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
            
            .footer .logo {
              color: #1E88E5;
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
            }
            
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚗 AutoCare Pro</h1>
            <div class="subtitle">${title}</div>
            ${dateRange ? `<div class="date">${dateRange}</div>` : ''}
            <div class="date">Generado el ${formatDate(new Date().toISOString())}</div>
          </div>
          
          ${content}
          
          <div class="footer">
            <div class="logo">AutoCare Pro</div>
            <div>Gestión Profesional de Mantenimiento Vehicular</div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Obtener nombre del tipo de mantenimiento
   */
  private getMaintenanceTypeName(type: string): string {
    const types: Record<string, string> = {
      oil_change: 'Cambio de Aceite',
      tire_rotation: 'Rotación de Neumáticos',
      brake_service: 'Servicio de Frenos',
      battery: 'Batería',
      filter: 'Filtros',
      alignment: 'Alineación',
      inspection: 'Inspección',
      other: 'Otro',
    };
    return types[type] || type;
  }

  /**
   * Obtener nombre del tipo de gasto
   */
  private getExpenseTypeName(type: string): string {
    const types: Record<string, string> = {
      fuel: 'Combustible',
      parking: 'Estacionamiento',
      toll: 'Peaje',
      wash: 'Lavado',
      insurance: 'Seguro',
      tax: 'Impuestos',
      other: 'Otro',
    };
    return types[type] || type;
  }

  /**
   * Exportar historial de vehículo a PDF
   */
  async exportVehicleHistory(
    vehicle: Vehicle,
    maintenances: Maintenance[],
    expenses: Expense[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const html = await this.generateHTML({
        vehicle,
        maintenances,
        expenses,
        title: `Historial Completo - ${vehicle.brand} ${vehicle.model}`,
        dateRange: `Placa: ${vehicle.licensePlate}`,
      });

      const { uri } = await Print.printToFileAsync({ html });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Historial_${vehicle.brand}_${vehicle.model}.pdf`,
          UTI: 'com.adobe.pdf',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error exporting vehicle history:', error);
      return { success: false, error: 'No se pudo generar el PDF' };
    }
  }

  /**
   * Exportar solo mantenimientos a PDF
   */
  async exportMaintenances(
    maintenances: Maintenance[],
    vehicle?: Vehicle
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const html = await this.generateHTML({
        vehicle,
        maintenances,
        title: vehicle 
          ? `Mantenimientos - ${vehicle.brand} ${vehicle.model}`
          : 'Historial de Mantenimientos',
      });

      const { uri } = await Print.printToFileAsync({ html });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Mantenimientos.pdf',
          UTI: 'com.adobe.pdf',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error exporting maintenances:', error);
      return { success: false, error: 'No se pudo generar el PDF' };
    }
  }

  /**
   * Exportar solo gastos a PDF
   */
  async exportExpenses(
    expenses: Expense[],
    vehicle?: Vehicle
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const html = await this.generateHTML({
        vehicle,
        expenses,
        title: vehicle 
          ? `Gastos - ${vehicle.brand} ${vehicle.model}`
          : 'Historial de Gastos',
      });

      const { uri } = await Print.printToFileAsync({ html });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Gastos.pdf',
          UTI: 'com.adobe.pdf',
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error exporting expenses:', error);
      return { success: false, error: 'No se pudo generar el PDF' };
    }
  }
}

export default new ExportService();


/**
 * Servicio de respaldo/restauración de datos locales (JSON)
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorageService, { BackupPayload } from './AsyncStorageService';

interface BackupFileSchema {
  app: 'AutoCare Pro';
  version: number;
  exportedAt: string;
  data: BackupPayload;
}

class BackupService {
  private readonly BACKUP_VERSION = 1;

  private getBackupFileName(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = `${now.getMonth() + 1}`.padStart(2, '0');
    const dd = `${now.getDate()}`.padStart(2, '0');
    return `autocare-backup-${yyyy}-${mm}-${dd}.json`;
  }

  private async buildBackupFileContent(): Promise<string> {
    const payload = await AsyncStorageService.getBackupData();
    const backup: BackupFileSchema = {
      app: 'AutoCare Pro',
      version: this.BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      data: payload,
    };
    return JSON.stringify(backup, null, 2);
  }

  async exportBackup(): Promise<{ success: boolean; error?: string }> {
    try {
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        return {
          success: false,
          error: 'No se puede compartir archivos en este dispositivo.',
        };
      }

      const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      if (!baseDir) {
        return {
          success: false,
          error: 'No se pudo acceder al sistema de archivos.',
        };
      }

      const fileName = this.getBackupFileName();
      const fileUri = `${baseDir}${fileName}`;
      const content = await this.buildBackupFileContent();

      await FileSystem.writeAsStringAsync(fileUri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Guardar respaldo de AutoCare Pro',
        UTI: 'public.json',
      });

      return { success: true };
    } catch (error) {
      console.error('Error exporting backup:', error);
      return {
        success: false,
        error: 'No se pudo crear el respaldo.',
      };
    }
  }

  private isBackupSchema(value: unknown): value is BackupFileSchema {
    if (!value || typeof value !== 'object') return false;
    const parsed = value as Partial<BackupFileSchema>;
    return (
      parsed.app === 'AutoCare Pro' &&
      typeof parsed.version === 'number' &&
      typeof parsed.exportedAt === 'string' &&
      parsed.data !== undefined &&
      typeof parsed.data === 'object'
    );
  }

  async restoreBackupFromFile(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return { success: false, error: 'Selección cancelada.' };
      }

      const selectedFile = result.assets[0];
      const fileContent = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsed = JSON.parse(fileContent);
      if (!this.isBackupSchema(parsed)) {
        return {
          success: false,
          error: 'El archivo no tiene un formato de respaldo válido.',
        };
      }

      await AsyncStorageService.restoreBackupData(parsed.data);
      return { success: true };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return {
        success: false,
        error: 'No se pudo restaurar el respaldo seleccionado.',
      };
    }
  }
}

export default new BackupService();

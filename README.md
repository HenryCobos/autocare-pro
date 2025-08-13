# AutoCare Pro 🚗

Una aplicación móvil completa para la gestión de mantenimiento vehicular, desarrollada con React Native y Expo. Diseñada específicamente para iOS y optimizada para iPhone y iPad.

## 📱 Características Principales

### ✨ Gestión de Vehículos
- Registro completo de vehículos (marca, modelo, año, placa, foto)
- Control de kilometraje actual
- Historial detallado por vehículo

### 🔧 Mantenimientos
- Registro de diferentes tipos de mantenimiento
- Programación de próximos mantenimientos
- Historial completo con fotos de facturas
- Recordatorios automáticos por fecha y kilometraje

### 💰 Control de Gastos
- Registro de gastos por categoría
- Gráficos interactivos de tendencias
- Análisis por vehículo y período
- Exportación de datos

### 📅 Calendario de Recordatorios
- Vista de mantenimientos programados
- Notificaciones locales personalizables
- Gestión de recordatorios vencidos y próximos

### ⚙️ Configuración Avanzada
- Personalización de notificaciones
- Configuración de moneda y unidades
- Exportación y respaldo de datos
- Múltiples opciones de personalización

## 🛠 Tecnologías Utilizadas

- **React Native** - Framework de desarrollo móvil
- **Expo** - Plataforma de desarrollo y distribución
- **TypeScript** - Tipado estático para JavaScript
- **AsyncStorage** - Almacenamiento local persistente
- **React Navigation** - Navegación entre pantallas
- **Expo Notifications** - Notificaciones locales
- **React Native Chart Kit** - Gráficos y visualizaciones
- **Expo Image Picker** - Captura y selección de imágenes

## 📋 Requisitos del Sistema

- **iOS 11.0+** (Optimizado para iOS)
- **Expo CLI** instalado globalmente
- **Node.js 16+**
- **Xcode** (para desarrollo en iOS)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd autocare-pro
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el proyecto
```bash
# Desarrollo general
npm start

# iOS específicamente
npm run ios
```

### 4. Configuración adicional para iOS

El proyecto está pre-configurado para iOS con:
- Bundle Identifier: `com.autocare.pro`
- Permisos de cámara y galería
- Configuración de notificaciones
- Soporte para iPad

## 📁 Estructura del Proyecto

```
autocare-pro/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── common/         # Botones, inputs, cards
│   │   └── charts/         # Gráficos de gastos
│   ├── constants/          # Colores y temas
│   ├── hooks/             # Hooks personalizados
│   ├── navigation/        # Configuración de navegación
│   ├── screens/           # Pantallas principales
│   ├── services/          # Servicios (Storage, Notificaciones)
│   ├── types/             # Definiciones TypeScript
│   └── utils/             # Funciones utilitarias
├── assets/                # Imágenes e iconos
├── app.json              # Configuración de Expo
├── package.json          # Dependencias
└── README.md
```

## 🎨 Diseño y UX

### Paleta de Colores
- **Azul Principal**: #1E88E5
- **Gris Oscuro**: #333333
- **Blanco**: #FFFFFF
- **Colores de estado**: Verde, Naranja, Rojo

### Características de Diseño
- Diseño responsivo para iPhone y iPad
- Interfaz intuitiva y moderna
- Iconografía consistente con Ionicons
- Transiciones suaves y feedback visual
- Tipografía limpia y legible

## 📱 Pantallas Principales

1. **Dashboard**: Resumen general y accesos rápidos
2. **Vehículos**: Gestión completa de vehículos
3. **Mantenimientos**: Registro y seguimiento
4. **Calendario**: Vista de recordatorios
5. **Gastos**: Control financiero con gráficos
6. **Configuración**: Personalización de la app

## 🔔 Sistema de Notificaciones

- Recordatorios por fecha programada
- Notificaciones por kilometraje
- Configuración personalizable
- Acciones directas desde notificaciones

## 💾 Almacenamiento de Datos

- **AsyncStorage** para persistencia local
- Estructura de datos optimizada
- Respaldo y exportación en JSON
- Gestión eficiente de imágenes

## 🚀 Compilación para App Store

### Preparación
```bash
# Generar build para iOS
expo build:ios

# O usando EAS Build (recomendado)
eas build --platform ios
```

### Configuración App Store
- Bundle ID: `com.autocare.pro`
- Versión: 1.0.0
- Categoría: Productividad
- Compatibilidad: iOS 11.0+

## 🔧 Personalización

### Cambiar Colores
Editar `src/constants/Colors.ts`:
```typescript
export const Colors = {
  primary: '#1E88E5',    // Tu color principal
  secondary: '#333333',   // Color secundario
  // ... más colores
};
```

### Agregar Nuevos Tipos de Mantenimiento
Modificar `src/types/index.ts`:
```typescript
export enum MaintenanceType {
  // Tipos existentes...
  NEW_TYPE = 'new_type',
}
```

## 🐛 Solución de Problemas

### Errores Comunes

1. **Error de permisos de cámara**
   - Verificar configuración en `app.json`
   - Reinstalar la app en el simulador

2. **Notificaciones no funcionan**
   - Verificar permisos en configuración del dispositivo
   - Comprobar que el servicio esté inicializado

3. **Problemas de AsyncStorage**
   - Limpiar caché: `expo r -c`
   - Verificar permisos de escritura

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un issue en el repositorio
- Documentación adicional en `/docs`

## 🔄 Actualizaciones Futuras

### Próximas Características
- [ ] Sincronización en la nube
- [ ] Compartir vehículos entre usuarios
- [ ] Integración con APIs de precios
- [ ] Modo oscuro
- [ ] Soporte multi-idioma completo
- [ ] Widgets para iOS

---

**AutoCare Pro** - Tu compañero inteligente para el cuidado vehicular 🚗✨

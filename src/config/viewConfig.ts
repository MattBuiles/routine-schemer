/**
 * ROUTINE SCHEMER - CONFIGURACIÓN DE VISTAS
 * 
 * Ajusta estas configuraciones para personalizar la experiencia
 */

export const viewConfig = {
  // Vista por defecto al iniciar la app
  // true = Nueva vista de planificación
  // false = Vista tradicional
  defaultToPlanningView: true,

  // Mostrar botón toggle para cambiar entre vistas
  showViewToggle: true,

  // Guardar preferencia de vista en localStorage
  rememberViewPreference: true,

  // Tema de colores
  theme: {
    primary: '#3b82f6', // blue-500
    secondary: '#8b5cf6', // violet-500
    success: '#10b981', // green-500
    warning: '#f59e0b', // amber-500
    danger: '#ef4444', // red-500
  },

  // Configuración de Analytics
  analytics: {
    showVolumeChart: true,
    showRepDistribution: true,
    showBalanceRatios: true,
    showRecoveryScore: true,
  },

  // Configuración de Timeline
  timeline: {
    showWeekNumbers: true,
    showMesocycleCards: true,
    enableHover: true,
    enableClick: true,
  },

  // Configuración de Weekly Split Designer
  weeklySplit: {
    enableDragDrop: true,
    showSessionLibrary: true,
    showRestDays: true,
    enableDayClick: true,
  },
};

export default viewConfig;

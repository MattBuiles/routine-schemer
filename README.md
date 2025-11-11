# 🏋️‍♂️ Routine Schemer

**Plataforma Profesional de Planificación Integral de Entrenamientos**

Una aplicación web completa para diseñar, estructurar, registrar y visualizar rutinas y planes de entrenamiento, enfocada en profesionales del fitness y atletas serios que buscan un enfoque holístico del entrenamiento y la salud.

> **✨ Ahora con Supabase:** Migrado de Firebase a Supabase para mejor rendimiento, menos costos y queries SQL más eficientes.

## 🎯 Características Principales

### 📋 **Dashboard Inteligente**
- Resumen completo de progreso y estadísticas
- Métricas de cumplimiento y rachas
- Agenda diaria y actividad reciente
- Acciones rápidas para funciones comunes

### 💪 **Gestión de Rutinas**
- **Mis Rutinas**: Biblioteca personal de programas de entrenamiento
- **Crear Rutina**: Diseñador avanzado con soporte para:
  - Hipertrofia (musculación)
  - Acondicionamiento (cardio y resistencia)
  - Movilidad y flexibilidad
  - Estiramientos
  - Fuerza y potencia

### 📅 **Calendario Interactivo**
- Visualización mensual/semanal de entrenamientos
- Planificación por ciclos y mesociclos
- Seguimiento de sesiones completadas
- Integración con hábitos saludables

### 📚 **Biblioteca de Ejercicios**
- Amplio catálogo de ejercicios
- Filtros por grupo muscular, equipo y tipo
- Instrucciones detalladas y demos
- Ejercicios personalizados

### ❤️ **Hábitos y Notas**
- Seguimiento de hábitos saludables:
  - Hidratación
  - Sueño
  - Suplementación
  - Meditación
  - Pasos diarios
- Sistema de notas organizadas:
  - Notas de entrenamiento
  - Observaciones nutricionales
  - Ideas y recordatorios
  - Seguimiento de progreso

### 📊 **Historial y Análisis**
- Estadísticas detalladas de progreso
- Gráficos de tendencias mensuales
- Distribución por tipos de entrenamiento
- Exportación de datos

### 👤 **Perfil Personalizado**
- Datos físicos y objetivos
- Nivel de experiencia y actividad
- Preferencias personalizadas
- Métricas corporales (BMI, etc.)

### ⚙️ **Configuración Avanzada**
- Personalización de tema y idioma
- Configuración de notificaciones
- Gestión de privacidad
- Importar/exportar datos

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, CSS Modules
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Legacy**: Firebase (en proceso de migración)
- **Forms**: React Hook Form + Zod
- **UI Components**: Lucide React, React Calendar
- **Notifications**: React Hot Toast

### � Ventajas de Supabase

- ✅ **500MB gratis** de base de datos PostgreSQL
- ✅ **Queries SQL** más eficientes para estadísticas complejas
- ✅ **Real-time subscriptions** incluidas
- ✅ **Row Level Security** para máxima seguridad
- ✅ **Menos costos** a escala vs Firebase
- ✅ **Open source** y self-hostable

## �🏗️ Arquitectura

```
src/
├── app/                 # App Router de Next.js
│   └── auth/callback/  # Callback de autenticación
├── components/          # Componentes React
│   ├── ui/             # Componentes base (Button, Card, etc.)
│   ├── auth/           # Autenticación
│   ├── routine/        # Módulos de rutinas
│   └── *.tsx           # Componentes principales
├── hooks/              # Custom React Hooks
├── lib/                # Utilidades y servicios
│   ├── supabase.ts    # Cliente de Supabase
│   ├── supabaseService.ts  # Servicio de datos
│   └── firebase.ts    # Firebase (legacy)
├── store/              # Estado global (Zustand)
│   ├── supabaseAuthStore.ts  # Auth de Supabase
│   └── authStore.ts   # Firebase auth (legacy)
├── styles/             # Estilos CSS
└── types/              # Tipos TypeScript
    └── supabase.ts    # Tipos generados de Supabase

supabase/
└── schema.sql         # Schema de base de datos
```

## 🔧 Instalación y Desarrollo

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase (gratis en https://supabase.com)

### Configuración

1. **Clonar el repositorio**
```bash
git clone https://github.com/MattBuiles/routine-schemer.git
cd routine-schemer
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar Supabase**

a) Crea un proyecto en https://supabase.com

b) Ejecuta el schema SQL:
   - Ve a SQL Editor en tu proyecto Supabase
   - Copia el contenido de `supabase/schema.sql`
   - Ejecuta el script

c) Configura variables de entorno:
```bash
# Copiar archivo de configuración
cp .env.local.example .env.local

c) Configura variables de entorno:
```bash
# Editar .env.local con tus credenciales de Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo (con Turbopack)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linting
```

## 📚 Guías de Migración

### 🔄 Migrar de Firebase a Supabase

Si estás migrando desde Firebase, consulta la guía completa:

📖 **[SUPABASE_MIGRATION_GUIDE.md](./SUPABASE_MIGRATION_GUIDE.md)**

Incluye:
- Setup completo paso a paso
- Scripts de migración de datos
- Ejemplos de código
- Troubleshooting
- Comparación de costos

## 📱 Funcionalidades por Módulo

### 🏠 Dashboard
- Vista general con estadísticas clave
- Progreso semanal visual
- Agenda del día actual
- Acceso rápido a funciones principales

### 📋 Mis Rutinas
- Lista de programas creados
- Filtros y búsqueda
- Estadísticas por rutina
- Gestión completa (editar, duplicar, eliminar)

### ➕ Crear Rutina
- Wizard paso a paso
- Soporte para múltiples tipos de entrenamiento
- Configuración de series, repeticiones y pesos
- Planificación de mesociclos

### 📅 Calendario
- Vista mensual interactiva
- Programación de sesiones
- Estados de completado
- Integración con rutinas existentes

### 📖 Ejercicios
- Biblioteca extensa y categorizada
- Filtros avanzados
- Información detallada
- Favoritos personales

### ❤️ Hábitos y Notas
- Seguimiento diario de hábitos
- Sistema de notas con etiquetas
- Recordatorios y objetivos
- Progreso visual

### 📊 Historial
- Análisis temporal del progreso
- Gráficos y métricas
- Exportación de datos
- Filtros por período

### 👤 Perfil
- Información personal y física
- Objetivos y preferencias
- Configuración de metas
- Métricas de progreso

### ⚙️ Configuración
- Personalización completa
- Gestión de notificaciones
- Privacidad y seguridad
- Respaldo de datos

## 🎨 Diseño y UX

La aplicación utiliza un diseño **glass morphism** con:
- **Tema oscuro** como predeterminado
- **Efectos de desenfoque** y transparencia
- **Gradientes vibrantes** para acciones importantes
- **Iconografía consistente** con Lucide React
- **Responsive design** para todos los dispositivos
- **Micro-animaciones** para mejor UX

## 🔐 Seguridad y Privacidad

- Autenticación segura con Google
- Datos encriptados en Firebase
- Configuración granular de privacidad
- Cumplimiento con estándares de protección de datos

## 🚀 Roadmap

### Próximas Características
- [ ] Integración con wearables
- [ ] Comunidad y sharing
- [ ] IA para recomendaciones
- [ ] App móvil nativa
- [ ] Integración nutricional avanzada
- [ ] Marketplace de rutinas

### Mejoras Técnicas
- [ ] Optimización de performance
- [ ] Testing automatizado
- [ ] CI/CD pipeline
- [ ] PWA capabilities
- [ ] Offline support

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

Desarrollado con ❤️ para profesionales del fitness que buscan excelencia en la planificación de entrenamientos.

---

**Routine Schemer** - *Donde la planificación profesional se encuentra con la pasión por el fitness* 🏋️‍♂️✨

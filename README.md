# 🏋️‍♂️ Routine Schemer

**Plataforma Profesional de Planificación Integral de Entrenamientos**

Una aplicación web completa para diseñar, estructurar y gestionar programas de entrenamiento, enfocada en profesionales del fitness y atletas serios que buscan un enfoque estructurado y científico del entrenamiento.

> **Estado:** identidad con Neon Auth y persistencia en Neon + Drizzle. Pendiente: biblioteca de ejercicios.

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
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Backend objetivo**: Neon (PostgreSQL) + Drizzle
- **Identidad**: Neon Auth
- **UI Components**: Lucide React, React Calendar
- **Notifications**: React Hot Toast

### Estado técnico

- ✅ Neon Auth está integrado en el layout, middleware y flujo de acceso.
- ✅ Perfil, programas, hábitos, notas y calendario persisten en Neon mediante server actions.
- ⏳ Falta la biblioteca de ejercicios (tabla y UI).
- ⏳ No hay evidencia pública de un despliegue activo ni dominio configurado en Vercel.

## 🏗️ Arquitectura

```
src/
├── app/                      # App Router de Next.js
│   ├── page.tsx             # Dashboard principal
│   ├── layout.tsx           # Layout raíz
│   ├── actions/             # Server actions (acceso a Neon con el usuario de la sesión)
│   └── auth/[path]/         # Vistas de Neon Auth (registro, recuperación, etc.)
├── components/              
│   ├── ui/                  # Componentes base (Button, Card, Input)
│   ├── auth/                # Formulario de autenticación
│   ├── routine/             # Módulos principales (Settings, Profile, MyRoutines)
│   ├── planner/             # Planificador semanal y sesiones
│   └── Dashboard*.tsx       # Componentes del dashboard
├── hooks/                   # Custom React Hooks
│   ├── useAuth.ts           # Sesión y cierre de sesión (Neon Auth)
│   ├── useDashboardData.ts  # Perfil y programas del usuario
│   └── useCreateProgram.ts  # Creación de programas
├── lib/                        # Utilidades y servicios
│   ├── exerciseService.ts     # Gestión de ejercicios
│   └── utils.ts               # Utilidades generales
├── store/                      # Estado global (Zustand)
│   └── (sin store de autenticación; Neon Auth gestiona la sesión)
├── styles/                     # Estilos CSS por módulo
└── types/                      # Tipos TypeScript
    ├── index.ts               # Tipos de la aplicación
    └── weekly-planner.ts      # Tipos del planificador

drizzle/                        # Migraciones SQL (se aplican con pnpm db:migrate)
supabase/                       # Esquema histórico, solo referencia
```

## 🔧 Instalación y Desarrollo

### Prerrequisitos
- Node.js 22+
- pnpm 10+
- Proyecto de Neon con Neon Auth activado

### Configuración

1. **Clonar el repositorio**
```bash
git clone https://github.com/MattBuiles/routine-schemer.git
cd routine-schemer
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar Neon y Neon Auth**

a) Crea un proyecto en https://neon.tech y activa Neon Auth en él.

b) Configura variables de entorno:
```bash
# Copiar archivo de configuración
cp .env.example .env.local
```bash
# Editar .env.local con tus credenciales
DATABASE_URL=postgresql://...
NEON_AUTH_BASE_URL=https://...neonauth.../auth
NEON_AUTH_COOKIE_SECRET=...   # mínimo 32 caracteres: openssl rand -base64 32
```

c) Aplica las migraciones (`db:migrate` lee `DATABASE_URL` del entorno):
```bash
pnpm exec tsx --env-file=.env.local scripts/migrate.ts
```

4. **Ejecutar en desarrollo**
```bash
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

### Scripts Disponibles

```bash
pnpm dev             # Servidor de desarrollo
pnpm build           # Build de producción
pnpm start           # Servidor de producción
pnpm lint            # Linting
pnpm typecheck       # TypeScript
pnpm db:migrate      # Aplicar migraciones de drizzle/ (requiere DATABASE_URL en el entorno)
```

## 📚 Documentación Adicional

### Documentación técnica

Consulta la decisión y el estado de la migración en
[`docs/adr/0001-neon-migration.md`](./docs/adr/0001-neon-migration.md).

Incluye el contexto, la decisión, el estado actual y la situación del despliegue.

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
- Datos protegidos por PostgreSQL y las políticas de acceso de la aplicación
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

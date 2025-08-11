# 📋 CONFIGURACIÓN DE GOOGLE AUTHENTICATION

## 🔥 PASOS EN FIREBASE CONSOLE

### 1. Ve a Firebase Console
```
https://console.firebase.google.com/project/routine-schemer
```

### 2. Habilita Google Authentication
1. Ve a **Authentication** en el menú lateral
2. Haz clic en **Sign-in method**
3. Busca **Google** en la lista de proveedores
4. Haz clic en **Google** para habilitarlo
5. Activa el toggle **Enable**
6. Configura el **Project support email** (tu email)
7. Haz clic en **Save**

### 3. Configurar dominios autorizados
En la misma sección de **Sign-in method**:
1. Ve a **Authorized domains**
2. Asegúrate de que estén añadidos:
   - `localhost` (para desarrollo)
   - `routine-schemer.firebaseapp.com` (tu dominio de Firebase)
   - Cualquier dominio personalizado que vayas a usar

## 🌐 CONFIGURACIÓN OPCIONAL PARA PRODUCCIÓN

### Google Cloud Console (para configuración avanzada)
Si quieres personalizar más el comportamiento:

1. Ve a **Google Cloud Console**:
   ```
   https://console.cloud.google.com/
   ```

2. Selecciona tu proyecto **routine-schemer**

3. Ve a **APIs & Services** > **Credentials**

4. Busca tu **OAuth 2.0 Client ID** (creado automáticamente por Firebase)

5. Puedes personalizar:
   - **Application name** (lo que ven los usuarios)
   - **Application logo**
   - **Support email**
   - **Developer contact information**

## ✅ VERIFICACIÓN

Una vez configurado, tu aplicación debería:
1. Mostrar la pantalla de login con Google
2. Al hacer clic en "Continue with Google":
   - Abrir popup de Google OAuth
   - Solicitar permisos de email y perfil
   - Redirigir al Dashboard tras autenticación exitosa
3. Guardar el usuario en Firestore automáticamente

## 🎯 CARACTERÍSTICAS IMPLEMENTADAS

✅ **Solo Google Sign-In** - Método único de autenticación
✅ **Popup OAuth** - Experiencia fluida sin redirección
✅ **Auto-registro** - Crea usuarios automáticamente en Firestore
✅ **Información de perfil** - Obtiene nombre y email de Google
✅ **Sesión persistente** - Mantiene la sesión entre recargas
✅ **UI profesional** - Interfaz moderna y atractiva

## 🚀 BENEFICIOS

- **Seguridad máxima** - Autenticación de Google
- **Experiencia simple** - Un solo clic para acceder
- **Datos confiables** - Email y nombre verificados por Google
- **Sin contraseñas** - Los usuarios no necesitan crear/recordar contraseñas
- **Rápido setup** - Usuarios nuevos acceden inmediatamente

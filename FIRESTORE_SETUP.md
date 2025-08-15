# 🔥 HABILITAR FIRESTORE EN FIREBASE

## ⚠️ PROBLEMA ACTUAL
La aplicación se queda cargando después del login porque **Firestore no está habilitado** en Firebase Console.

## 🚀 SOLUCIÓN - HABILITAR FIRESTORE

### **Paso 1: Ve a Firebase Console**
```
https://console.firebase.google.com/project/routine-schemer
```

### **Paso 2: Habilitar Firestore Database**
1. En el menú lateral, busca **"Firestore Database"**
2. Haz clic en **"Create database"**
3. Selecciona **"Start in test mode"** (para desarrollo)
4. Elige la **ubicación más cercana** (ej: us-central1)
5. Haz clic en **"Done"**

### **Paso 3: Configurar Reglas de Seguridad (Temporal)**
Una vez creada la base de datos:
1. Ve a **"Rules"** en Firestore
2. Reemplaza las reglas por:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura autenticada temporalmente
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Haz clic en **"Publish"**

## ✅ VERIFICACIÓN

Una vez habilitado Firestore:
1. **Recarga la aplicación** (F5 o Ctrl+R)
2. **Inicia sesión con Google** nuevamente
3. Deberías ver el **Dashboard** inmediatamente
4. Los datos se guardarán en Firestore

## 🔧 QUE CAMBIÉ EN EL CÓDIGO

Modifiqué `useAuth.ts` para que:
- ✅ **No se bloquee** si Firestore no está disponible
- ✅ **Use datos de Google** como respaldo
- ✅ **Continúe funcionando** sin base de datos
- ✅ **Se sincronice automáticamente** cuando Firestore esté listo

## 🎯 ESTADO ACTUAL

**ANTES** (Error):
- Login ✅ → Firestore ❌ → Se queda cargando 🔄

**AHORA** (Funcional):
- Login ✅ → App funciona ✅ → Firestore opcional 🔄

**DESPUÉS DE HABILITAR FIRESTORE** (Ideal):
- Login ✅ → App funciona ✅ → Datos guardados ✅

## 🚨 IMPORTANTE

La aplicación **YA FUNCIONA** sin Firestore habilitado, pero para tener:
- ✅ **Persistencia de datos**
- ✅ **Programas guardados**
- ✅ **Calendarios sincronizados**

**DEBES habilitar Firestore** siguiendo los pasos de arriba.

## 📞 SI TIENES PROBLEMAS

1. **Asegúrate** de estar logueado en la cuenta correcta de Google
2. **Verifica** que el proyecto se llame "routine-schemer"
3. **Espera** 1-2 minutos después de habilitar Firestore
4. **Recarga** la aplicación completamente

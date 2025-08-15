# 🔥 HABILITAR FIRESTORE - GUÍA PASO A PASO

## 📍 PASO 1: VE A FIREBASE CONSOLE

Abre este link en tu navegador:
```
https://console.firebase.google.com/project/routine-schemer
```

## 📍 PASO 2: CREAR FIRESTORE DATABASE

1. En el menú lateral izquierdo, busca **"Firestore Database"**
2. Haz clic en **"Create database"** (botón azul grande)

## 📍 PASO 3: CONFIGURAR MODO DE SEGURIDAD

Se abrirá un modal con opciones:

### Selecciona: **"Start in test mode"**
- ✅ Esto permite desarrollo fácil
- ✅ Cambiaremos las reglas después
- ❌ NO selecciones "Start in production mode"

Haz clic en **"Next"**

## 📍 PASO 4: SELECCIONAR UBICACIÓN

### Elige la ubicación más cercana:
- **Para México/USA**: `nam5 (us-central)`
- **Para Europa**: `eur3 (europe-west)`
- **Para Asia**: `asia-northeast1`

⚠️ **IMPORTANTE**: No podrás cambiar esto después

Haz clic en **"Done"**

## 📍 PASO 5: CONFIGURAR REGLAS DE SEGURIDAD

Una vez creada la base de datos:

1. Ve a la pestaña **"Rules"** (en la parte superior)
2. Verás código como este:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. **REEMPLAZA** todo el código con:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Haz clic en **"Publish"**

## 📍 PASO 6: VERIFICAR CONFIGURACIÓN

En la pestaña **"Data"**:
- Deberías ver un mensaje "No documents to display"
- Esto es normal para una base de datos nueva

## 🎉 PASO 7: PROBAR LA APLICACIÓN

1. **Vuelve a tu aplicación** (http://localhost:3000)
2. **Recarga la página** (F5 o Ctrl+R)
3. **Haz login con Google** nuevamente
4. **¡Ahora debería funcionar con persistencia!**

## ✅ SEÑALES DE QUE FUNCIONA

- ✅ Login rápido sin errores en consola
- ✅ Dashboard se carga inmediatamente
- ✅ No hay warnings de Firestore en consola
- ✅ Los datos se guardan entre sesiones

## 🚨 SI TIENES PROBLEMAS

### Error de permisos:
```
Missing or insufficient permissions
```
**Solución**: Revisa que las reglas estén configuradas correctamente

### Error de ubicación:
```
Resource location must be specified
```
**Solución**: Asegúrate de haber seleccionado una ubicación en el Paso 4

### La app sigue sin conectar:
1. Espera 1-2 minutos (propagación)
2. Recarga la aplicación completamente
3. Revisa la consola del navegador

## 📞 NECESITAS AYUDA?

Si tienes algún problema en cualquier paso, dime exactamente:
- ¿En qué paso estás?
- ¿Qué mensaje de error ves?
- ¿Qué pantalla aparece en Firebase Console?

¡Te ayudo a resolverlo! 🚀

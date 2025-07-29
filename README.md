# Mi Despensa - FODEM PROJECT

Aplicación híbrida para gestión de inventario que funciona en **móvil (iOS/Android)** y **web**, con sincronización en tiempo real y gestión de hogares colaborativos.

## 🎨 Branding FODEM PROJECT

Esta aplicación utiliza el branding de **FODEM PROJECT** con una paleta de colores inspirada en el logo:
- **Azul grisáceo claro** (#B8C5D1) - Color principal
- **Beige claro** (#E8D5C4) - Color secundario
- **Diseño moderno y orgánico** - Reflejando la identidad visual de FODEM

## 🚀 Tecnologías

### Frontend Híbrido
- **React Native + Expo**: Base para móvil
- **React Native Web**: Compatibilidad web
- **Expo Router**: Navegación universal
- **Tamagui**: UI library híbrida
- **TypeScript**: Tipado estático

### Backend
- **Supabase**: Base de datos PostgreSQL, autenticación, storage, real-time

### Estilos
- **Tailwind CSS**: Para web con colores FODEM
- **React Native Styles**: Para móvil con colores FODEM
- **Tamagui**: Componentes híbridos

## 📱 Funcionalidades

- ✅ **Inventario de productos** con control de stock
- ✅ **Gestión de hogares colaborativos** con roles y permisos
- ✅ **Sistema de invitaciones** por códigos
- ✅ **Lista de compras inteligente** con priorización
- ✅ **Historial de movimientos** automático
- ✅ **Escaneo de códigos de barras**
- ✅ **Notificaciones de stock bajo**
- ✅ **Sincronización en tiempo real**
- ✅ **Funciona en móvil y web**

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en móvil
npm run android
npm run ios

# Ejecutar en web
npm run web
```

## 🏗️ Arquitectura

```
src/
├── app/                    # Expo Router (navegación)
├── core/                   # Reglas de negocio
├── data/                   # Capa de datos
├── presentation/           # UI y componentes
└── shared/                 # Utilidades
    ├── constants/
    │   └── colors.ts       # Colores FODEM
    ├── utils/
    └── types/
```

## 🔧 Configuración

### Supabase
1. Crear proyecto en Supabase
2. Configurar variables de entorno
3. Ejecutar migraciones

### Variables de Entorno
```env
EXPO_PUBLIC_SUPABASE_URL=tu_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_key
```

## 📦 Scripts Disponibles

- `npm start`: Iniciar servidor de desarrollo
- `npm run android`: Ejecutar en Android
- `npm run ios`: Ejecutar en iOS
- `npm run web`: Ejecutar en web
- `npm run build`: Construir para producción

## 🎯 Características Híbridas

- **Un solo código**: Funciona en móvil y web
- **Navegación universal**: Expo Router
- **UI adaptativa**: Se adapta a cada plataforma
- **Estilos híbridos**: Tailwind + React Native con colores FODEM
- **Base de datos única**: Supabase

## 🚨 Solución al Problema de Navegación

La aplicación usa **Expo Router** con configuración de modales que evita el problema de cerrar la app en lugar del modal:

```typescript
// Configuración correcta de modales
<Stack.Screen name="modal" options={{ presentation: 'modal' }} />
```

## 🎨 Paleta de Colores FODEM

```typescript
// Colores principales del logo
primary: '#B8C5D1'    // Azul grisáceo claro
secondary: '#E8D5C4'  // Beige claro

// Colores de texto
textPrimary: '#2C3E50'   // Negro suave
textSecondary: '#7F8C8D' // Gris

// Colores de fondo
background: '#F8F9FA' // Fondo principal
surface: '#FFFFFF'    // Superficies
```

## 📄 Licencia

MIT - FODEM PROJECT 
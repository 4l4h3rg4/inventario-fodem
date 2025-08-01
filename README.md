# Inventario FODEM 🏠

Una aplicación de gestión de inventario para hogares, desarrollada con React Native, Expo y Supabase.

## 🚀 Características

- **Autenticación de usuarios** con Supabase Auth
- **Gestión de hogares** - Crear, unirse y administrar hogares
- **Inventario de productos** - Agregar, editar y eliminar productos
- **Control de stock** - Seguimiento de cantidades mínimas e ideales
- **Lista de compras** - Generación automática basada en stock bajo
- **Sistema de invitaciones** - Códigos de invitación para unirse a hogares
- **Roles de usuario** - Propietario, administrador y miembro
- **Interfaz responsive** - Funciona en móvil y web

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn
- Expo CLI (`npm install -g @expo/cli`)
- Cuenta de Supabase (gratuita)

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <tu-repositorio>
   cd inventario-fodem
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Copiar el archivo de ejemplo
   cp env.example .env
   
   # Editar .env con tus credenciales de Supabase
   EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
   ```

4. **Configurar Supabase**
   - Ve a tu proyecto de Supabase
   - En Settings > API, copia la URL y la anon key
   - Pégala en tu archivo `.env`

## 🗄️ Configuración de la Base de Datos

### Tablas Requeridas

El proyecto requiere las siguientes tablas en Supabase:

- `households` - Información de hogares
- `household_members` - Miembros de cada hogar
- `household_invitations` - Invitaciones para unirse a hogares
- `products` - Productos del inventario
- `stock_history` - Historial de cambios de stock
- `user_profiles` - Perfiles de usuario

### Políticas RLS (Row Level Security)

Todas las tablas deben tener RLS habilitado con políticas apropiadas para seguridad.

### Funciones de Base de Datos

El proyecto utiliza varias funciones SQL para:
- Creación automática de perfiles de usuario
- Actualización de timestamps
- Gestión de invitaciones
- Cálculo de productos con stock bajo

## 🚀 Ejecutar el Proyecto

### Desarrollo Local

```bash
# Iniciar el servidor de desarrollo
npm start

# Para web
npm run web

# Para Android
npm run android

# Para iOS
npm run ios
```

### Despliegue

#### 1. Despliegue Web (Vercel/Netlify)

```bash
# Construir para web
npm run web

# El directorio web-build/ estará listo para desplegar
```

#### 2. Despliegue Móvil (EAS Build)

```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Configurar EAS
eas build:configure

# Construir para Android
eas build --platform android

# Construir para iOS
eas build --platform ios
```

#### 3. Despliegue en Expo Go

```bash
# Publicar en Expo
expo publish
```

## 🔧 Configuración de Producción

### Variables de Entorno de Producción

Asegúrate de configurar las variables de entorno en tu plataforma de despliegue:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Configuración de Supabase para Producción

1. **Habilitar autenticación por email**
2. **Configurar dominios autorizados** en Authentication > Settings
3. **Revisar políticas RLS** para seguridad
4. **Configurar backups** automáticos

## 🐛 Solución de Problemas

### Error: Variables de entorno no configuradas
- Verifica que el archivo `.env` existe y tiene las variables correctas
- Reinicia el servidor de desarrollo después de cambiar `.env`

### Error: No se puede conectar a Supabase
- Verifica que la URL y clave anónima sean correctas
- Asegúrate de que el proyecto de Supabase esté activo

### Error: Tablas no encontradas
- Ejecuta las migraciones de base de datos en Supabase
- Verifica que las políticas RLS estén configuradas

## 📱 Estructura del Proyecto

```
inventario-fodem/
├── app/                    # Páginas de Expo Router
│   ├── (tabs)/            # Navegación por tabs
│   ├── auth.tsx           # Página de autenticación
│   └── welcome.tsx        # Página de bienvenida
├── src/
│   ├── shared/            # Código compartido
│   │   ├── config/        # Configuración (Supabase)
│   │   ├── contexts/      # Contextos de React
│   │   ├── services/      # Servicios de API
│   │   └── utils/         # Utilidades
│   └── presentation/      # Componentes de UI
├── assets/                # Imágenes y recursos
└── docs/                  # Documentación
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de [Expo](https://docs.expo.dev/)
2. Consulta la documentación de [Supabase](https://supabase.com/docs)
3. Abre un issue en este repositorio

## 🎯 Roadmap

- [ ] Notificaciones push para stock bajo
- [ ] Escaneo de códigos de barras
- [ ] Exportación de inventario
- [ ] Estadísticas de consumo
- [ ] Integración con servicios de delivery 
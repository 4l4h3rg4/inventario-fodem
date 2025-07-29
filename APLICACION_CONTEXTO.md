# Mi Despensa - Documentación de Contexto

## Descripción General

**Mi Despensa** es una aplicación web diseñada para gestionar el inventario de alimentos en hogares compartidos. Permite a múltiples usuarios colaborar en el control del stock de productos alimenticios, facilitando la organización doméstica y evitando desperdicios.

## Propósito Principal

La aplicación resuelve el problema común de la gestión descoordinada de alimentos en hogares compartidos, donde múltiples personas compran productos sin saber qué ya existe en la despensa. Esto resulta en:
- Productos duplicados
- Alimentos que se echan a perder
- Gastos innecesarios
- Falta de organización

## Funcionalidades Principales

### 1. Gestión de Productos
- **Registro de productos**: Agregar nuevos productos con nombre, stock actual, cantidad mínima recomendada y cantidad ideal
- **Control de stock**: Actualizar cantidades de productos existentes (agregar/quitar)
- **Historial de cambios**: Registro automático de todas las modificaciones al stock
- **Estados de stock**: Clasificación automática en urgente, recomendado u óptimo según las cantidades

### 2. Lista de Compras Inteligente
- **Generación automática**: Crea listas de compras basadas en el stock actual vs. cantidades recomendadas
- **Priorización**: Clasifica productos por urgencia (urgente, recomendado, óptimo)
- **Marcado de comprados**: Permite marcar productos como comprados y actualizar automáticamente el stock

### 3. Sistema de Hogares Colaborativos
- **Creación de hogares**: Los usuarios pueden crear hogares compartidos
- **Invitaciones**: Sistema de códigos de invitación para unir nuevos miembros
- **Roles y permisos**: Diferentes niveles de acceso (propietario, administrador, miembro)
- **Cambio de hogar**: Los usuarios pueden pertenecer a múltiples hogares y cambiar entre ellos

### 4. Gestión de Miembros
- **Administración de miembros**: Ver, agregar y remover miembros del hogar
- **Gestión de roles**: Asignar y cambiar roles de los miembros
- **Salir del hogar**: Los miembros pueden abandonar un hogar voluntariamente

### 5. Autenticación y Seguridad
- **Registro y login**: Sistema de autenticación por email y contraseña
- **Perfiles de usuario**: Información personal y configuración
- **Protección de datos**: Cada hogar solo puede ser accedido por sus miembros autorizados

## Estructura de Datos

### Tablas Principales

#### 1. **products** - Productos del inventario
- `id`: Identificador único del producto
- `name`: Nombre del producto
- `photo`: URL de la imagen del producto (opcional)
- `current_stock`: Cantidad actual en stock
- `min_recommended`: Cantidad mínima recomendada
- `ideal_amount`: Cantidad ideal deseada
- `user_id`: Usuario que creó el producto
- `household_id`: Hogar al que pertenece el producto
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

#### 2. **stock_history** - Historial de cambios de stock
- `id`: Identificador único del registro
- `product_id`: Producto modificado
- `change_amount`: Cantidad cambiada (positiva o negativa)
- `change_type`: Tipo de cambio ('add', 'remove', 'adjust')
- `previous_stock`: Stock anterior al cambio
- `new_stock`: Stock después del cambio
- `user_id`: Usuario que realizó el cambio
- `household_id`: Hogar del producto
- `created_at`: Fecha del cambio

#### 3. **households** - Hogares compartidos
- `id`: Identificador único del hogar
- `name`: Nombre del hogar
- `description`: Descripción opcional
- `created_by`: Usuario que creó el hogar
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

#### 4. **household_members** - Miembros de los hogares
- `id`: Identificador único del registro
- `household_id`: Hogar al que pertenece
- `user_id`: Usuario miembro
- `role`: Rol del usuario ('owner', 'admin', 'member')
- `joined_at`: Fecha de unión al hogar

#### 5. **household_invitations** - Invitaciones a hogares
- `id`: Identificador único de la invitación
- `household_id`: Hogar al que se invita
- `invited_by`: Usuario que envía la invitación
- `role`: Rol que se asignará al nuevo miembro
- `token`: Token único de la invitación
- `invitation_code`: Código de invitación para compartir
- `expires_at`: Fecha de expiración
- `accepted_at`: Fecha de aceptación (null si no aceptada)
- `created_at`: Fecha de creación

#### 6. **user_profiles** - Perfiles de usuario
- `id`: Identificador único del perfil
- `user_id`: Usuario asociado
- `username`: Nombre de usuario único
- `full_name`: Nombre completo
- `avatar_url`: URL del avatar (opcional)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

## Flujos de Usuario Principales

### 1. Primer Acceso
1. Usuario se registra con email y contraseña
2. Crea su primer hogar o se une a uno existente mediante código de invitación
3. Comienza a agregar productos al inventario

### 2. Gestión Diaria del Inventario
1. Usuario accede al dashboard principal
2. Ve el estado actual de todos los productos (urgente, recomendado, óptimo)
3. Actualiza cantidades según consume productos
4. Revisa la lista de compras generada automáticamente

### 3. Proceso de Compra
1. Usuario revisa la lista de compras en la pestaña correspondiente
2. Marca productos como comprados
3. El sistema actualiza automáticamente el stock
4. Se registra el cambio en el historial

### 4. Administración del Hogar
1. Usuario accede a la página de administración del hogar
2. Puede invitar nuevos miembros mediante códigos de invitación
3. Gestiona roles y permisos de los miembros
4. Modifica información del hogar

## Características Técnicas

### Seguridad
- Autenticación requerida para todas las operaciones
- Control de acceso basado en roles
- Protección de datos por hogar
- Validación de permisos en todas las operaciones

### Escalabilidad
- Soporte para múltiples hogares por usuario
- Sistema de caché para optimizar rendimiento
- Historial completo de cambios para auditoría

### Usabilidad
- Interfaz intuitiva y responsive
- Notificaciones en tiempo real
- Navegación clara entre diferentes secciones
- Feedback visual del estado de los productos

## Beneficios para el Usuario

### Para Hogares Individuales
- Control total del inventario de alimentos
- Evita compras duplicadas
- Optimiza el presupuesto de alimentación
- Reduce el desperdicio de alimentos

### Para Hogares Compartidos
- Coordinación entre todos los miembros
- Transparencia en el consumo de productos
- Distribución equitativa de responsabilidades
- Comunicación mejorada sobre necesidades del hogar

### Para la Organización
- Historial completo de consumo
- Análisis de patrones de compra
- Optimización del presupuesto familiar
- Reducción del impacto ambiental por desperdicios 
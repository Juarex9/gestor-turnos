# Sistema de Gestión de Turnos - Peluquería

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Realtime)
- **WhatsApp**: Twilio WhatsApp API (webhook para recibir mensajes)

## Funcionalidades

### 1. Recepción de Turnos por WhatsApp
- Webhook recibe mensajes de WhatsApp
- Parser detecta: nombre del cliente, fecha/hora, nombre del barbero
- Valida disponibilidad antes de confirmar
- Envía confirmación al cliente

### 2. Panel Gestor de Turnos
- Vista diaria/semanal de turnos
- Filtro por barbero
- Cambiar estado: pendiente, confirmado, completado, cancelado
- Editar/eliminar turnos

### 3. Panel Administrador
- CRUD de barberos (nombre, foto, especialidades, horarios)
- CRUD de servicios (corte, barba, etc.) con duración
- Configuración del negocio (horarios, días laborales)
- Ver estadísticas básicas

### 4. Autenticación
- Email/password para admins
- Rol: admin vs gestor

## Base de Datos (Supabase)

### Tablas
- `profiles` - usuarios del sistema (admins/gestores)
- `barbers` - barberos del negocio
- `services` - servicios ofrecidos
- `appointments` - turnos registrados
- `business_settings` - configuración del negocio

## Flujo WhatsApp
1. Cliente envía mensaje: "Juan Perez, 15/03/2026 14:00, Marcos"
2. Sistema busca barbero "Marcos"
3. Verifica disponibilidad en ese horario
4. Si está libre: crea turno + confirma por WhatsApp
5. Si no: sugiere horarios disponibles

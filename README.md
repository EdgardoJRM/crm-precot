# PrecoTracks CRM

Sistema CRM interno para gestión de participantes y campañas de email.

## Características

- 🔐 Autenticación por magic link (solo emails whitelist)
- 📊 Importación de participantes desde CSV
- 🔍 Búsqueda y filtrado de participantes
- 📧 Creación y envío de campañas de email vía AWS SES
- 📱 Diseño responsive y mobile-friendly

## Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (preparado para Lambda)
- **Base de Datos**: DynamoDB
- **Email**: AWS SES
- **Autenticación**: Magic Link + JWT en cookies httpOnly

## Configuración

### 1. Variables de Entorno

Copia `.env.local.example` a `.env.local` y configura:

```bash
AWS_REGION=us-east-1
CRM_USERS_TABLE=CRM-Users
CRM_PARTICIPANTS_TABLE=CRM-Participants
CRM_CAMPAIGNS_TABLE=CRM-Campaigns
SES_FROM_EMAIL=noreply@precotracks.org
SES_REPLY_TO=noreply@precotracks.org
NEXT_PUBLIC_APP_URL=https://crm.precotracks.org
SESSION_SECRET=tu-secret-key-aqui
```

### 2. Crear Tablas DynamoDB

Crea las siguientes tablas en DynamoDB:

#### CRM-Users
- Partition Key: `pk` (String)
- Sort Key: `sk` (String)

#### CRM-Participants
- Partition Key: `pk` (String)
- Sort Key: `sk` (String)

#### CRM-Campaigns
- Partition Key: `pk` (String)
- Sort Key: `sk` (String)

### 3. Configurar Usuarios Whitelist

Agrega usuarios autorizados a la tabla `CRM-Users`:

```json
{
  "pk": "USER#admin@precotracks.org",
  "sk": "META",
  "email": "admin@precotracks.org",
  "name": "Admin User",
  "role": "admin",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### 4. Configurar AWS SES

- Verifica el dominio `precotracks.org` en SES
- Verifica el email `noreply@precotracks.org` o solicita salida de sandbox
- Configura las credenciales de AWS en tu entorno

## Instalación

```bash
npm install
npm run dev
```

## Estructura del Proyecto

```
precot-crm/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Autenticación
│   │   ├── participants/ # Participantes
│   │   └── campaigns/    # Campañas
│   ├── login/            # Página de login
│   ├── dashboard/        # Dashboard principal
│   ├── participants/     # Listado de participantes
│   └── campaigns/        # Gestión de campañas
├── lib/
│   ├── aws/              # Clientes AWS (DynamoDB, SES)
│   ├── auth/             # Lógica de autenticación
│   ├── services/         # Servicios de negocio
│   ├── models/           # Types TypeScript
│   └── config.ts         # Configuración
└── middleware.ts         # Middleware de protección de rutas
```

## Uso

### 1. Login

1. Ve a `/login`
2. Ingresa tu email (debe estar en whitelist)
3. Recibirás un magic link por email
4. Haz clic en el enlace para acceder

### 2. Importar Participantes

1. Ve a `/participants/import`
2. Sube un archivo CSV
3. Mapea las columnas a los campos del sistema
4. Haz clic en "Importar Ahora"

### 3. Crear Campaña

1. Ve a `/campaigns/new`
2. Completa nombre, subject y cuerpo del email
3. Selecciona destinatarios (todos, por tags, o IDs específicos)
4. Haz clic en "Enviar Ahora"

## Despliegue

El proyecto está preparado para desplegarse en AWS Amplify:

1. Conecta el repositorio a Amplify
2. Configura las variables de entorno
3. Amplify detectará Next.js automáticamente
4. El build y deploy se harán automáticamente

## Notas de Desarrollo

- Todas las rutas excepto `/login` y `/auth/verify` están protegidas por middleware
- Las sesiones duran 7 días
- Los magic links expiran en 30 minutos
- El envío de emails tiene throttling de 100ms entre envíos

## Licencia

Propietario - PrecoTracks

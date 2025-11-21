# 🚀 Guía de Setup - PrecoTracks CRM

Esta guía te ayudará a configurar el proyecto desde cero para que esté completamente funcional.

## 📋 Prerrequisitos

- Node.js >= 20.9.0
- npm o yarn
- Cuenta de AWS con acceso a:
  - DynamoDB
  - SES (Simple Email Service)
- AWS CLI configurado (opcional pero recomendado)

## 🔧 Paso 1: Instalar Dependencias

```bash
npm install
```

## 🔧 Paso 2: Configurar Variables de Entorno

1. Copia el archivo de ejemplo:
```bash
cp .env.local.example .env.local
```

2. Edita `.env.local` y configura las siguientes variables:

```bash
# AWS Configuration
# REGION es opcional - por defecto usa us-east-1
# Solo configúrala si tus recursos están en otra región
# REGION=us-east-1

# DynamoDB Tables (puedes usar los nombres por defecto)
CRM_USERS_TABLE=CRM-Users
CRM_PARTICIPANTS_TABLE=CRM-Participants
CRM_CAMPAIGNS_TABLE=CRM-Campaigns

# AWS SES Configuration
SES_FROM_EMAIL=noreply@precotracks.org
SES_REPLY_TO=noreply@precotracks.org

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Para desarrollo local
# NEXT_PUBLIC_APP_URL=https://crm.precotracks.org  # Para producción

# Session Secret (IMPORTANTE: genera uno aleatorio para producción)
# Genera uno con: openssl rand -base64 32
SESSION_SECRET=tu-secret-key-super-segura-aqui
```

### 🔐 Generar SESSION_SECRET

Para generar un SESSION_SECRET seguro:

```bash
openssl rand -base64 32
```

Copia el resultado y úsalo como valor de `SESSION_SECRET`.

## 🔧 Paso 3: Configurar Credenciales AWS

Tienes varias opciones:

### Opción A: AWS CLI (Recomendado)

```bash
aws configure
```

Ingresa:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### Opción B: Variables de Entorno

Agrega a tu `.env.local` (solo para desarrollo local):

```bash
# Nota: En producción (Amplify) usa IAM Roles, no credenciales en variables
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
```

### Opción C: IAM Role (Para producción en AWS)

Si despliegas en AWS Amplify o EC2, puedes usar IAM Roles en lugar de credenciales.

## 🔧 Paso 4: Crear Tablas DynamoDB

Ejecuta el script de creación de tablas:

```bash
node scripts/create-tables.mjs
```

Este script creará las siguientes tablas:
- **CRM-Users**: Almacena usuarios autorizados y magic links
- **CRM-Participants**: Almacena participantes del CRM
- **CRM-Campaigns**: Almacena campañas de email

**Nota:** Si prefieres crear las tablas manualmente desde la consola de AWS:

1. Ve a DynamoDB en la consola de AWS
2. Crea cada tabla con:
   - **Partition Key**: `pk` (String)
   - **Sort Key**: `sk` (String)
   - **Billing Mode**: On-demand (PAY_PER_REQUEST)

## 🔧 Paso 5: Crear Usuario Inicial

Crea al menos un usuario en la whitelist:

```bash
node scripts/init-user.mjs admin@precotracks.org "Admin User" admin
```

Puedes crear más usuarios cambiando el email y nombre:

```bash
node scripts/init-user.mjs staff@precotracks.org "Staff User" staff
```

**Roles disponibles:**
- `admin`: Acceso completo
- `staff`: Acceso limitado (si implementas permisos diferenciados)

## 🔧 Paso 6: Configurar AWS SES

### 6.1 Verificar Email o Dominio

Para enviar emails, necesitas verificar tu dominio o email en SES:

1. Ve a AWS SES en la consola
2. Ve a "Verified identities"
3. Haz clic en "Create identity"
4. Elige "Domain" o "Email address"
5. Sigue las instrucciones para verificar

### 6.2 Salir del Sandbox (Opcional)

Por defecto, SES está en "sandbox mode" y solo puedes enviar a emails verificados.

Para enviar a cualquier email:
1. Ve a "Account dashboard" en SES
2. Haz clic en "Request production access"
3. Completa el formulario y espera aprobación

**Nota:** Para desarrollo local, puedes usar emails verificados sin salir del sandbox.

## 🔧 Paso 7: Probar Localmente

1. Inicia el servidor de desarrollo:

```bash
npm run dev
```

2. Abre tu navegador en: `http://localhost:3000`

3. Ve a `/login` e ingresa el email del usuario que creaste

4. Revisa tu email (o la consola si usas SES en modo desarrollo) para el magic link

5. Haz clic en el magic link para iniciar sesión

## ✅ Verificación

Para verificar que todo funciona:

- [ ] El servidor inicia sin errores
- [ ] Puedes acceder a `/login`
- [ ] Puedes solicitar un magic link
- [ ] Recibes el email con el magic link
- [ ] Puedes hacer login con el magic link
- [ ] Puedes acceder al dashboard
- [ ] Puedes ver la lista de participantes (vacía inicialmente)
- [ ] Puedes ver la lista de campañas (vacía inicialmente)

## 🚀 Despliegue a Producción

### AWS Amplify (Recomendado)

1. Conecta tu repositorio GitHub a AWS Amplify
2. Amplify detectará Next.js automáticamente
3. Configura las variables de entorno en la consola de Amplify:
   - Todas las variables de `.env.local` excepto `NEXT_PUBLIC_APP_URL` (se configura automáticamente)
4. El build y deploy se harán automáticamente

### Variables de Entorno en Amplify

En la consola de Amplify, ve a:
**App settings > Environment variables**

Agrega todas las variables de `.env.local`:
- `REGION` (no uses `AWS_REGION`, Amplify no lo permite)
- `CRM_USERS_TABLE`
- `CRM_PARTICIPANTS_TABLE`
- `CRM_CAMPAIGNS_TABLE`
- `SES_FROM_EMAIL`
- `SES_REPLY_TO`
- `SESSION_SECRET`
- `NEXT_PUBLIC_APP_URL` (la URL de tu app en Amplify)

### IAM Permissions

Asegúrate de que el rol de Amplify tenga permisos para:
- DynamoDB: `dynamodb:PutItem`, `dynamodb:GetItem`, `dynamodb:Query`, `dynamodb:UpdateItem`
- SES: `ses:SendEmail`, `ses:SendRawEmail`

## 🐛 Troubleshooting

### Error: "Table not found"
- Verifica que las tablas existan en DynamoDB
- Verifica que el nombre de las tablas en `.env.local` coincida

### Error: "Access Denied" en AWS
- Verifica tus credenciales AWS
- Verifica los permisos IAM

### No recibo emails
- Verifica que el email/dominio esté verificado en SES
- Si estás en sandbox, solo puedes enviar a emails verificados
- Revisa los logs de CloudWatch para errores de SES

### Error: "Invalid session"
- Verifica que `SESSION_SECRET` esté configurado
- Asegúrate de usar el mismo `SESSION_SECRET` en todos los ambientes

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de DynamoDB](https://docs.aws.amazon.com/dynamodb/)
- [Documentación de AWS SES](https://docs.aws.amazon.com/ses/)
- [Documentación de AWS Amplify](https://docs.amplify.aws/)

## 🆘 Soporte

Si encuentras problemas, revisa:
1. Los logs del servidor (`npm run dev`)
2. Los logs de CloudWatch (en producción)
3. La consola del navegador para errores de frontend


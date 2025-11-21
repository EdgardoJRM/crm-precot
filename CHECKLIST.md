# ✅ Checklist de Setup - PrecoTracks CRM

Usa esta checklist para asegurarte de que todo esté configurado correctamente.

## 🔧 Configuración Inicial

- [ ] Node.js >= 20.9.0 instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env.local` creado desde `env.example`
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] `SESSION_SECRET` generado y configurado (usa `openssl rand -base64 32`)

## ☁️ AWS Configuration

- [ ] AWS CLI configurado (`aws configure`) o credenciales en variables de entorno
- [ ] Permisos IAM configurados para:
  - [ ] DynamoDB (PutItem, GetItem, Query, UpdateItem, Scan)
  - [ ] SES (SendEmail, SendRawEmail)
- [ ] Región AWS configurada (us-east-1 por defecto)

## 🗄️ DynamoDB

- [ ] Tabla `CRM-Users` creada
  - Partition Key: `pk` (String)
  - Sort Key: `sk` (String)
  - Billing Mode: On-demand
- [ ] Tabla `CRM-Participants` creada
  - Partition Key: `pk` (String)
  - Sort Key: `sk` (String)
  - Billing Mode: On-demand
- [ ] Tabla `CRM-Campaigns` creada
  - Partition Key: `pk` (String)
  - Sort Key: `sk` (String)
  - Billing Mode: On-demand

**Comando rápido:**
```bash
node scripts/create-tables.mjs
```

## 👤 Usuarios

- [ ] Al menos un usuario creado en la whitelist
  ```bash
  node scripts/init-user.mjs admin@precotracks.org "Admin User" admin
  ```
- [ ] Email del usuario verificado en AWS SES (si estás en sandbox)

## 📧 AWS SES

- [ ] Dominio o email verificado en AWS SES
- [ ] Si estás en sandbox: emails de destino verificados
- [ ] Si necesitas producción: solicitud de salida de sandbox enviada

## 🧪 Testing Local

- [ ] Servidor inicia sin errores (`npm run dev`)
- [ ] Puedes acceder a `http://localhost:3000/login`
- [ ] Puedes solicitar un magic link
- [ ] Recibes el email con el magic link
- [ ] Puedes hacer login con el magic link
- [ ] Puedes acceder al dashboard
- [ ] Puedes ver la lista de participantes
- [ ] Puedes ver la lista de campañas

## 🚀 Producción (Opcional)

- [ ] Repositorio conectado a AWS Amplify (o plataforma de despliegue)
- [ ] Variables de entorno configuradas en la plataforma
- [ ] `NEXT_PUBLIC_APP_URL` configurado con la URL de producción
- [ ] IAM Role configurado con permisos necesarios
- [ ] Build exitoso en producción
- [ ] Dominio configurado (si aplica)

## 🔍 Verificación Final

- [ ] Login funciona correctamente
- [ ] Importación de participantes funciona
- [ ] Creación de campañas funciona
- [ ] Envío de emails funciona
- [ ] No hay errores en la consola del navegador
- [ ] No hay errores en los logs del servidor

## 📝 Notas

- Si algo no funciona, revisa los logs:
  - Servidor: `npm run dev` (consola)
  - Producción: CloudWatch Logs
  - Navegador: DevTools Console

- Para más detalles, consulta [SETUP.md](./SETUP.md)


# Prueba de Magic Link - Estado Actual

## ✅ Usuario Creado
- Email: `enrique@edgardohernandez.com`
- Nombre: Enrique
- Rol: admin
- Estado: Activo

## ❌ Error en Producción

El endpoint está devolviendo error 500. Posibles causas:

### 1. Variables de Entorno en Amplify
Verifica que estas variables estén configuradas en **AWS Amplify Console > App settings > Environment variables**:

```
CRM_USERS_TABLE=CRM-Users
CRM_PARTICIPANTS_TABLE=CRM-Participants
CRM_CAMPAIGNS_TABLE=CRM-Campaigns
SES_FROM_EMAIL=doce25@precotracks.org
SES_REPLY_TO=doce25@precotracks.org
SESSION_SECRET=<tu-secret-generado>
NEXT_PUBLIC_APP_URL=https://main.d2iig4dsutc1x0.amplifyapp.com
```

### 2. Permisos IAM
El rol de Amplify necesita permisos para:
- DynamoDB: `PutItem`, `GetItem`, `Query`, `UpdateItem`, `Scan`
- SES: `SendEmail`, `SendRawEmail`

Ver `IAM_POLICY.md` para la política completa.

### 3. Email Verificado en SES
Si SES está en **sandbox mode**, el email de destino (`enrique@edgardohernandez.com`) debe estar verificado.

Para verificar el email:
```bash
aws ses verify-email-identity --email-address enrique@edgardohernandez.com --region us-east-1
```

Luego revisa el email y haz clic en el enlace de verificación.

## 🔍 Verificar Logs

Para ver el error específico:
1. Ve a **CloudWatch Logs** en AWS Console
2. Busca el log group de tu app Amplify
3. Revisa los logs más recientes del endpoint `/api/auth/request-magic-link`

## ✅ Prueba Local (si quieres probar antes)

1. Configura `.env.local` con las variables necesarias
2. Inicia el servidor: `npm run dev`
3. Prueba el endpoint localmente:
```bash
curl -X POST http://localhost:3000/api/auth/request-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"enrique@edgardohernandez.com"}'
```

## 📧 Verificar Email en SES Sandbox

Si estás en sandbox, verifica el email de destino:

```bash
aws ses verify-email-identity \
  --email-address enrique@edgardohernandez.com \
  --region us-east-1
```

Luego revisa el email y confirma la verificación.


# 🔍 Diagnóstico del Error 500 en Amplify

## Problema
El endpoint `/api/auth/request-magic-link` devuelve error 500 en producción (Amplify) pero funciona correctamente localmente.

## ✅ Lo que funciona
- ✅ Backend funciona perfectamente localmente
- ✅ DynamoDB accesible
- ✅ SES funcionando
- ✅ Usuario creado correctamente

## ❌ Posibles causas del error 500

### 1. Variables de Entorno NO Configuradas en Amplify

**Verifica en AWS Amplify Console:**
1. Ve a tu app en Amplify
2. **App settings** > **Environment variables**
3. Debe tener estas variables:

```
CRM_USERS_TABLE=CRM-Users
CRM_PARTICIPANTS_TABLE=CRM-Participants
CRM_CAMPAIGNS_TABLE=CRM-Campaigns
SES_FROM_EMAIL=doce25@precotracks.org
SES_REPLY_TO=doce25@precotracks.org
SESSION_SECRET=<tu-secret-generado>
NEXT_PUBLIC_APP_URL=https://main.d2iig4dsutc1x0.amplifyapp.com
```

**⚠️ IMPORTANTE:** Si alguna de estas variables falta, el código fallará.

### 2. Permisos IAM NO Configurados

El rol de ejecución de Amplify necesita permisos para:
- **DynamoDB**: `PutItem`, `GetItem`, `Query`, `UpdateItem`, `Scan`
- **SES**: `SendEmail`, `SendRawEmail`

**Cómo verificar:**
1. Ve a **IAM Console** > **Roles**
2. Busca el rol que usa Amplify (generalmente algo como `amplify-*-us-east-1-*`)
3. Verifica que tenga las políticas de DynamoDB y SES

**Cómo configurar:**
Ver `IAM_POLICY.md` para la política completa.

### 3. Verificar Logs de CloudWatch

Los logs ahora incluyen información detallada:

1. Ve a **CloudWatch Logs** en AWS Console
2. Busca el log group de tu app Amplify
3. Busca logs recientes del endpoint `/api/auth/request-magic-link`
4. Verás mensajes como:
   - `Configuration check:` - Muestra qué variables están configuradas
   - `=== ERROR DETAILS ===` - Muestra el error específico

## 🔧 Pasos para Resolver

### Paso 1: Verificar Variables de Entorno
```bash
# En Amplify Console, verifica que todas las variables estén configuradas
```

### Paso 2: Verificar Permisos IAM
```bash
# Ver el rol de Amplify
aws iam get-role --role-name <nombre-del-rol-amplify>

# Ver políticas adjuntas
aws iam list-attached-role-policies --role-name <nombre-del-rol-amplify>
```

### Paso 3: Revisar CloudWatch Logs
```bash
# Ver logs recientes
aws logs tail /aws/amplify/<app-name> --follow
```

### Paso 4: Hacer Redeploy
Después de configurar variables y permisos:
1. Ve a Amplify Console
2. Haz clic en **Redeploy this version** o espera el próximo commit

## 🧪 Prueba Rápida

Para probar si el problema es de configuración, puedes hacer una prueba directa:

```bash
# Esto debería funcionar si las variables están bien
curl -X POST https://main.d2iig4dsutc1x0.amplifyapp.com/api/auth/request-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"enrique@edgardohernandez.com"}'
```

Si sigue dando 500, revisa CloudWatch Logs para ver el error específico.

## 📝 Checklist de Verificación

- [ ] Variables de entorno configuradas en Amplify
- [ ] Permisos IAM configurados en el rol de Amplify
- [ ] CloudWatch Logs revisados para ver error específico
- [ ] Redeploy hecho después de cambios
- [ ] Tablas DynamoDB existen en us-east-1
- [ ] SES habilitado y funcionando


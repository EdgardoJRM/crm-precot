# 🔧 Configuración del Rol de Cómputo SSR para Amplify

## Problema Identificado

El error `CredentialsProviderError: Could not load credentials from any providers` ocurre porque Amplify SSR requiere un **rol de cómputo SSR** específico que debe asignarse en la configuración de Amplify.

## ✅ Rol Creado

**Rol ARN:** `arn:aws:iam::104768552978:role/AmplifySSR-ComputeRole-precot-crm`

Este rol ya tiene los permisos necesarios para:
- DynamoDB: `PutItem`, `GetItem`, `Query`, `UpdateItem`, `Scan`, `DeleteItem`, `BatchGetItem`, `BatchWriteItem`
- SES: `SendEmail`, `SendRawEmail`

## 📋 Pasos para Asignar el Rol en Amplify Console

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Selecciona tu aplicación: **crm-precot** (App ID: `d2iig4dsutc1x0`)
3. Ve a **App settings** > **General**
4. Busca la sección **"SSR compute role"** o **"Compute role"**
5. Selecciona el rol: `AmplifySSR-ComputeRole-precot-crm`
6. Guarda los cambios
7. Amplify iniciará automáticamente un nuevo deploy

## 🔍 Verificación

Después de asignar el rol y completar el deploy:

```bash
# Probar el endpoint
curl -X POST https://main.d2iig4dsutc1x0.amplifyapp.com/api/auth/request-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"enrique@edgardohernandez.com"}'

# Ver logs
aws logs tail /aws/amplify/d2iig4dsutc1x0 --since 2m --format short
```

## 📚 Referencias

- [AWS Amplify SSR Compute Role Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/amplify-SSR-compute-role.html)
- [What's New: Amplify Hosting IAM Roles for SSR Applications](https://aws.amazon.com/about-aws/whats-new/2025/02/amplify-hosting-iam-roles-ssr-applications/)


# Política IAM Requerida para AWS Amplify

El rol de ejecución de AWS Amplify necesita los siguientes permisos para que el CRM funcione correctamente.

## Política IAM Completa

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamoDBFullAccess",
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:Scan",
        "dynamodb:DeleteItem",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/CRM-Users",
        "arn:aws:dynamodb:us-east-1:*:table/CRM-Users/*",
        "arn:aws:dynamodb:us-east-1:*:table/CRM-Participants",
        "arn:aws:dynamodb:us-east-1:*:table/CRM-Participants/*",
        "arn:aws:dynamodb:us-east-1:*:table/CRM-Campaigns",
        "arn:aws:dynamodb:us-east-1:*:table/CRM-Campaigns/*"
      ]
    },
    {
      "Sid": "SESEmailSending",
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

## Cómo Configurar en AWS Amplify

### Opción 1: Usar el Rol de Servicio de Amplify (Recomendado)

1. Ve a **AWS Amplify Console** > Tu App
2. Ve a **App settings** > **General**
3. En la sección **Service role**, selecciona o crea un rol IAM
4. Asigna la política de arriba a ese rol

### Opción 2: Crear Rol Manualmente

1. Ve a **IAM Console** > **Roles**
2. Crea un nuevo rol o edita el rol existente de Amplify
3. Agrega una política inline con el JSON de arriba
4. Asegúrate de que Amplify use este rol

### Opción 3: Usar Variables de Entorno con Credenciales (No Recomendado y No Funciona en Amplify)

**⚠️ IMPORTANTE:** AWS Amplify NO permite variables de entorno que empiecen con `AWS_`. Esta opción NO funcionará en Amplify.

Si estás en desarrollo local, puedes usar:
```
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
```

**⚠️ Advertencia:** 
- Esta opción es menos segura
- NO funciona en AWS Amplify (usa IAM Roles)
- Solo para desarrollo local

## Verificar Permisos

Para verificar que los permisos están correctos:

1. Ve a CloudWatch Logs de tu app Amplify
2. Busca errores relacionados con:
   - `AccessDeniedException` - Permisos insuficientes
   - `ResourceNotFoundException` - Tablas no encontradas
   - `InvalidParameterValueException` - Configuración incorrecta

## Troubleshooting

### Error: "Access Denied" o "UnauthorizedOperation"

- Verifica que el rol de Amplify tenga los permisos de arriba
- Asegúrate de que las tablas existan en la región correcta (us-east-1)
- Verifica que los nombres de las tablas coincidan con las variables de entorno

### Error: "Table not found"

- Verifica que las tablas existan en DynamoDB
- Verifica que `CRM_USERS_TABLE`, `CRM_PARTICIPANTS_TABLE`, `CRM_CAMPAIGNS_TABLE` estén configuradas correctamente

### Error: "Email sending failed"

- Verifica que SES esté habilitado en tu cuenta
- Verifica que el email `doce25@precotracks.org` esté verificado
- Si estás en sandbox, verifica que el email de destino también esté verificado


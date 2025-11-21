# Variables de Entorno para AWS Amplify

Copia estas variables en **AWS Amplify Console > App settings > Environment variables**

## Variables Requeridas

**⚠️ IMPORTANTE:** AWS Amplify no permite variables que empiecen con `AWS_`. Usa `REGION` en lugar de `AWS_REGION`.

```
REGION=us-east-1
CRM_USERS_TABLE=CRM-Users
CRM_PARTICIPANTS_TABLE=CRM-Participants
CRM_CAMPAIGNS_TABLE=CRM-Campaigns
SES_FROM_EMAIL=doce25@precotracks.org
SES_REPLY_TO=doce25@precotracks.org
SESSION_SECRET=nFs0Fw5FOpoN3nHkvJNhtsV4KFUEcc8F9aCu7OW7VJY=
NEXT_PUBLIC_APP_URL=https://main.xxxxxxxxx.amplifyapp.com
```

## Instrucciones

1. Ve a [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Selecciona tu app (o créala si no existe)
3. Ve a **App settings > Environment variables**
4. Agrega cada variable una por una, o usa "Import variables" si está disponible
5. Para `NEXT_PUBLIC_APP_URL`, reemplaza con la URL real de tu app Amplify (se genera después del primer deploy)

## Notas Importantes

- **SESSION_SECRET**: Este es el secreto generado. Guárdalo de forma segura.
- **SES_FROM_EMAIL**: Usando `doce25@precotracks.org` que está verificado. Si prefieres usar `noreply@precotracks.org`, verifícalo primero en SES.
- **NEXT_PUBLIC_APP_URL**: Se actualiza automáticamente después del primer deploy, pero puedes configurarlo manualmente.

## Permisos IAM Requeridos

Asegúrate de que el rol de Amplify tenga estos permisos:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/CRM-Users",
        "arn:aws:dynamodb:us-east-1:*:table/CRM-Participants",
        "arn:aws:dynamodb:us-east-1:*:table/CRM-Campaigns"
      ]
    },
    {
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


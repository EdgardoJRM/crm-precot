#!/bin/bash
# Script de configuración para producción

set -e

echo "🚀 Configurando PrecoTracks CRM para producción..."
echo ""

# Verificar AWS CLI
if ! aws sts get-caller-identity &>/dev/null; then
    echo "❌ Error: AWS CLI no está configurado"
    exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo "📋 Información AWS:"
echo "   Account: $AWS_ACCOUNT"
echo "   Region: $AWS_REGION"
echo ""

# Generar SESSION_SECRET
SESSION_SECRET=$(openssl rand -base64 32)
echo "🔐 SESSION_SECRET generado"
echo ""

# Verificar tablas
echo "🗄️  Verificando tablas DynamoDB..."
TABLES=("CRM-Users" "CRM-Participants" "CRM-Campaigns")
for table in "${TABLES[@]}"; do
    if aws dynamodb describe-table --table-name "$table" --region "$AWS_REGION" &>/dev/null; then
        echo "   ✅ $table existe"
    else
        echo "   ⚠️  $table no existe"
    fi
done

echo ""
echo "📧 Verificando AWS SES..."
if aws ses get-account-sending-enabled --region "$AWS_REGION" &>/dev/null; then
    echo "   ✅ SES habilitado"
else
    echo "   ⚠️  SES no habilitado"
fi

echo ""
echo "📝 Variables para AWS Amplify:"
echo ""
echo "AWS_REGION=$AWS_REGION"
echo "CRM_USERS_TABLE=CRM-Users"
echo "CRM_PARTICIPANTS_TABLE=CRM-Participants"
echo "CRM_CAMPAIGNS_TABLE=CRM-Campaigns"
echo "SES_FROM_EMAIL=doce25@precotracks.org"
echo "SES_REPLY_TO=doce25@precotracks.org"
echo "SESSION_SECRET=$SESSION_SECRET"
echo "NEXT_PUBLIC_APP_URL=<TU_URL_DE_AMPLIFY>"
echo ""
echo "Instrucciones:"
echo "1. Ve a AWS Amplify Console"
echo "2. Conecta: https://github.com/EdgardoJRM/crm-precot"
echo "3. App settings > Environment variables"
echo "4. Agrega las variables de arriba"
echo "5. Reemplaza <TU_URL_DE_AMPLIFY> con tu URL"
echo ""
echo "✅ Listo!"


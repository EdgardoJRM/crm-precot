#!/bin/bash
# Script para actualizar variables de entorno en AWS Amplify

set -e

APP_ID="d2iig4dsutc1x0"
BRANCH="main"
NEW_APP_URL="https://crm.precotracks.org"

echo "🔄 Actualizando variables de entorno en Amplify..."
echo "App ID: ${APP_ID}"
echo "Branch: ${BRANCH}"
echo "Nueva URL: ${NEW_APP_URL}"

# Obtener variables de entorno actuales
echo "📋 Obteniendo variables de entorno actuales..."
CURRENT_ENV=$(aws amplify get-branch --app-id ${APP_ID} --branch-name ${BRANCH} --query 'branch.environmentVariables' --output json 2>/dev/null || echo "{}")

if [ "$CURRENT_ENV" == "{}" ] || [ -z "$CURRENT_ENV" ]; then
    echo "⚠️  No se pudieron obtener las variables actuales. Creando nuevas..."
    ENV_VARS='{"NEXT_PUBLIC_APP_URL":"'${NEW_APP_URL}'"}'
else
    echo "✅ Variables actuales obtenidas"
    # Actualizar NEXT_PUBLIC_APP_URL usando jq
    ENV_VARS=$(echo "$CURRENT_ENV" | jq --arg url "$NEW_APP_URL" '. + {"NEXT_PUBLIC_APP_URL": $url}' 2>/dev/null || echo "{\"NEXT_PUBLIC_APP_URL\":\"${NEW_APP_URL}\"}")
fi

echo ""
echo "📝 Variables de entorno a actualizar:"
echo "$ENV_VARS" | jq '.' 2>/dev/null || echo "$ENV_VARS"

echo ""
echo "🚀 Actualizando branch..."
aws amplify update-branch \
    --app-id ${APP_ID} \
    --branch-name ${BRANCH} \
    --environment-variables "$ENV_VARS" \
    --output json

echo ""
echo "✅ Variables de entorno actualizadas!"
echo ""
echo "📋 Verificando actualización..."
aws amplify get-branch --app-id ${APP_ID} --branch-name ${BRANCH} --query 'branch.environmentVariables.NEXT_PUBLIC_APP_URL' --output text

echo ""
echo "✅ Configuración completada!"
echo "🌐 La aplicación ahora usará: ${NEW_APP_URL}"
echo ""
echo "⚠️  Nota: Amplify iniciará un nuevo deploy automáticamente con las nuevas variables."


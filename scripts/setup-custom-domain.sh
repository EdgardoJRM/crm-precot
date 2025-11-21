#!/bin/bash
# Script para configurar dominio personalizado crm.precotracks.org en AWS Amplify

set -e

APP_ID="d2iig4dsutc1x0"
DOMAIN="precotracks.org"
SUBDOMAIN="crm"
FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"
HOSTED_ZONE_ID="Z01002192X3RWH8N6KQ97"

echo "🚀 Configurando dominio personalizado ${FULL_DOMAIN} para Amplify App ${APP_ID}"

# Paso 1: Verificar si ya existe una asociación de dominio
echo "📋 Verificando asociaciones de dominio existentes..."
EXISTING_DOMAINS=$(aws amplify list-domain-associations --app-id ${APP_ID} --query 'domainAssociations[*].domainName' --output text 2>/dev/null || echo "")

if echo "$EXISTING_DOMAINS" | grep -q "${DOMAIN}"; then
    echo "✅ Ya existe una asociación de dominio para ${DOMAIN}"
    echo "📝 Actualizando configuración..."
    
    # Obtener información del dominio asociado
    DOMAIN_ASSOC=$(aws amplify get-domain-association --app-id ${APP_ID} --domain-name ${DOMAIN} 2>/dev/null || echo "")
    
    if [ -z "$DOMAIN_ASSOC" ]; then
        echo "⚠️  No se pudo obtener la asociación existente. Creando nueva..."
        aws amplify create-domain-association \
            --app-id ${APP_ID} \
            --domain-name ${DOMAIN} \
            --sub-domain-settings prefix=${SUBDOMAIN},branchName=main \
            --output json
    else
        echo "✅ Asociación de dominio encontrada. Verificando subdominio..."
        # Verificar si el subdominio ya existe
        SUBDOMAIN_EXISTS=$(aws amplify get-domain-association --app-id ${APP_ID} --domain-name ${DOMAIN} --query "domainAssociation.subDomains[?prefix=='${SUBDOMAIN}']" --output text 2>/dev/null || echo "")
        
        if [ -z "$SUBDOMAIN_EXISTS" ]; then
            echo "➕ Agregando subdominio ${SUBDOMAIN}..."
            # Actualizar la asociación para agregar el subdominio
            aws amplify update-domain-association \
                --app-id ${APP_ID} \
                --domain-name ${DOMAIN} \
                --sub-domain-settings prefix=${SUBDOMAIN},branchName=main \
                --output json
        else
            echo "✅ El subdominio ${SUBDOMAIN} ya está configurado"
        fi
    fi
else
    echo "➕ Creando nueva asociación de dominio..."
    aws amplify create-domain-association \
        --app-id ${APP_ID} \
        --domain-name ${DOMAIN} \
        --sub-domain-settings prefix=${SUBDOMAIN},branchName=main \
        --output json
fi

echo ""
echo "⏳ Esperando a que Amplify genere los valores de verificación..."
sleep 5

# Paso 2: Obtener los valores CNAME que Amplify necesita
echo "📋 Obteniendo valores CNAME de Amplify..."
DOMAIN_INFO=$(aws amplify get-domain-association --app-id ${APP_ID} --domain-name ${DOMAIN} --output json 2>/dev/null)

if [ -z "$DOMAIN_INFO" ]; then
    echo "❌ Error: No se pudo obtener información del dominio"
    exit 1
fi

# Extraer el valor CNAME del subdominio
CNAME_VALUE=$(echo "$DOMAIN_INFO" | jq -r ".domainAssociation.subDomains[] | select(.prefix==\"${SUBDOMAIN}\") | .dnsRecord" 2>/dev/null || echo "")

if [ -z "$CNAME_VALUE" ] || [ "$CNAME_VALUE" == "null" ]; then
    echo "⚠️  No se encontró el valor CNAME. Puede que necesite esperar unos minutos."
    echo "📝 Por favor, ejecuta manualmente:"
    echo "   aws amplify get-domain-association --app-id ${APP_ID} --domain-name ${DOMAIN}"
    exit 1
fi

echo "✅ Valor CNAME obtenido: ${CNAME_VALUE}"

# Paso 3: Verificar/crear registro CNAME en Route 53
echo ""
echo "📋 Verificando registro CNAME en Route 53..."
EXISTING_RECORD=$(aws route53 list-resource-record-sets \
    --hosted-zone-id ${HOSTED_ZONE_ID} \
    --query "ResourceRecordSets[?Name=='${FULL_DOMAIN}.']" \
    --output json 2>/dev/null || echo "[]")

if echo "$EXISTING_RECORD" | jq -e '.[] | select(.Type=="CNAME")' > /dev/null 2>&1; then
    echo "✅ Ya existe un registro CNAME para ${FULL_DOMAIN}"
    CURRENT_VALUE=$(echo "$EXISTING_RECORD" | jq -r '.[] | select(.Type=="CNAME") | .ResourceRecords[0].Value' 2>/dev/null || echo "")
    
    if [ "$CURRENT_VALUE" == "$CNAME_VALUE" ]; then
        echo "✅ El valor CNAME es correcto: ${CURRENT_VALUE}"
    else
        echo "⚠️  El valor CNAME actual es diferente: ${CURRENT_VALUE}"
        echo "🔄 Actualizando a: ${CNAME_VALUE}"
        
        CHANGE_BATCH=$(cat <<EOF
{
  "Changes": [{
    "Action": "UPSERT",
    "ResourceRecordSet": {
      "Name": "${FULL_DOMAIN}.",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "${CNAME_VALUE}"}]
    }
  }]
}
EOF
)
        
        aws route53 change-resource-record-sets \
            --hosted-zone-id ${HOSTED_ZONE_ID} \
            --change-batch "$CHANGE_BATCH" \
            --output json
        
        echo "✅ Registro CNAME actualizado"
    fi
else
    echo "➕ Creando registro CNAME en Route 53..."
    
    CHANGE_BATCH=$(cat <<EOF
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "${FULL_DOMAIN}.",
      "Type": "CNAME",
      "TTL": 300,
      "ResourceRecords": [{"Value": "${CNAME_VALUE}"}]
    }
  }]
}
EOF
)
    
    CHANGE_ID=$(aws route53 change-resource-record-sets \
        --hosted-zone-id ${HOSTED_ZONE_ID} \
        --change-batch "$CHANGE_BATCH" \
        --query 'ChangeInfo.Id' \
        --output text)
    
    echo "✅ Registro CNAME creado. Change ID: ${CHANGE_ID}"
fi

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Amplify verificará automáticamente el dominio (puede tardar hasta 1 hora)"
echo "   2. Una vez verificado, SSL/TLS se configurará automáticamente"
echo "   3. Puedes verificar el estado con:"
echo "      aws amplify get-domain-association --app-id ${APP_ID} --domain-name ${DOMAIN}"
echo ""
echo "🌐 Tu aplicación estará disponible en: https://${FULL_DOMAIN}"


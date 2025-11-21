# Configuración de Dominio Personalizado

## Dominio: crm.precotracks.org

### Estado Actual

✅ **Dominio configurado en AWS Amplify**
- App ID: `d2iig4dsutc1x0`
- Dominio principal: `precotracks.org`
- Subdominio: `crm`
- URL completa: `https://crm.precotracks.org`

### Configuración en Route 53

El registro CNAME ya está configurado correctamente:

```
Nombre: crm.precotracks.org
Tipo: CNAME
Valor: dln1tgs03f14c.cloudfront.net
TTL: 300 segundos
```

### Verificación del Estado

Para verificar el estado actual del dominio:

```bash
aws amplify get-domain-association \
  --app-id d2iig4dsutc1x0 \
  --domain-name precotracks.org
```

### Estados Posibles

- **AVAILABLE**: Dominio completamente configurado y disponible
- **UPDATING**: Actualizando configuración
- **PENDING_DEPLOYMENT**: Esperando despliegue
- **PENDING_VERIFICATION**: Esperando verificación DNS

### Verificación DNS

Amplify necesita verificar el dominio. El proceso puede tardar hasta 1 hora. Una vez verificado:

1. ✅ SSL/TLS se configurará automáticamente
2. ✅ El dominio estará disponible en `https://crm.precotracks.org`
3. ✅ El certificado SSL será gestionado automáticamente por AWS

### Actualizar Variables de Entorno

Una vez que el dominio esté activo, actualiza la variable de entorno en Amplify Console:

```
NEXT_PUBLIC_APP_URL=https://crm.precotracks.org
```

### Verificar Configuración

1. **Ver estado del dominio:**
   ```bash
   aws amplify get-domain-association --app-id d2iig4dsutc1x0 --domain-name precotracks.org
   ```

2. **Verificar registro DNS:**
   ```bash
   dig crm.precotracks.org CNAME
   # Debe mostrar: dln1tgs03f14c.cloudfront.net
   ```

3. **Probar acceso:**
   ```bash
   curl -I https://crm.precotracks.org
   ```

### Troubleshooting

Si el dominio no está funcionando después de 1 hora:

1. Verifica que el registro CNAME en Route 53 sea correcto
2. Verifica que el estado en Amplify sea "AVAILABLE"
3. Espera la propagación DNS (puede tardar hasta 48 horas)
4. Verifica que no haya conflictos con otros servicios

### Notas

- El certificado SSL se gestiona automáticamente por AWS Amplify
- No es necesario configurar nada en Route 53 manualmente (ya está hecho)
- El dominio estará disponible automáticamente una vez completada la verificación


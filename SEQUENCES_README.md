# 📧 Sistema de Secuencias de Emails (Drip Campaigns)

## ¿Qué es?

Un sistema de secuencias automatizadas de emails que permite enviar múltiples emails a los participantes con delays configurables entre cada paso.

## Características

- ✅ Múltiples pasos configurables (hasta 5 o más)
- ✅ Delays personalizables en días y horas entre cada paso
- ✅ Tags dinámicos en cada email ({{nombre}}, {{email}}, etc.)
- ✅ Selección de destinatarios por tags, IDs específicos o todos
- ✅ Sistema de procesamiento automático
- ✅ Tracking del progreso de cada participante

## Cómo Crear una Secuencia

1. Ve a **Secuencias** en el menú
2. Haz clic en **Nueva Secuencia**
3. Completa:
   - Nombre de la secuencia
   - Descripción (opcional)
   - Agrega pasos con el botón "Agregar Paso"
   - Para cada paso:
     - Asunto del email
     - Contenido HTML (con tags dinámicos)
     - Delay después del paso anterior (días y horas)
4. Selecciona los destinatarios
5. Guarda la secuencia

## Ejemplo de Secuencia

**Secuencia de Bienvenida (3 pasos):**

- **Paso 1:** Email inmediato de bienvenida (delay: 0 días)
- **Paso 2:** Email después de 3 días con más información
- **Paso 3:** Email después de 7 días con oferta especial

## Procesamiento Automático

El sistema necesita ejecutarse periódicamente para enviar los emails programados. Hay dos opciones:

### Opción 1: Endpoint Manual (para pruebas)

```bash
curl -X POST https://tu-app.amplifyapp.com/api/sequences/process \
  -H "Authorization: Bearer TU_SECRET"
```

### Opción 2: AWS EventBridge (Recomendado para producción)

Configura un EventBridge Rule que ejecute el endpoint cada hora:

1. Ve a AWS EventBridge Console
2. Crea una nueva regla
3. Tipo: Schedule (expresión cron: `0 * * * ? *` para cada hora)
4. Target: HTTP endpoint
5. URL: `https://tu-app.amplifyapp.com/api/sequences/process`
6. Headers: `Authorization: Bearer TU_SECRET`

### Configurar SECRET

Agrega en Amplify Console > Environment Variables:
```
SEQUENCE_PROCESS_SECRET=tu-secret-super-seguro-aqui
```

## Estructura de Datos

### EmailSequence
```typescript
{
  id: string;
  name: string;
  description?: string;
  steps: EmailSequenceStep[];
  filters?: CampaignFilters;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### EmailSequenceStep
```typescript
{
  stepNumber: number;
  subject: string;
  bodyHtml: string;
  delayDays: number;
  delayHours?: number;
}
```

## Flujo de Trabajo

1. **Crear secuencia** → Estado: `draft`
2. **Iniciar secuencia** → Estado: `active`, participantes agregados
3. **Procesamiento automático** → Envía emails según delays
4. **Completar** → Estado: `completed` cuando todos los pasos se enviaron

## API Endpoints

- `GET /api/sequences` - Listar todas las secuencias
- `POST /api/sequences` - Crear nueva secuencia
- `GET /api/sequences/[id]` - Obtener secuencia por ID
- `PUT /api/sequences/[id]` - Actualizar secuencia
- `POST /api/sequences/[id]/start` - Iniciar secuencia para participantes
- `POST /api/sequences/process` - Procesar secuencias activas (envía emails pendientes)

## Notas Importantes

- El primer paso siempre se envía inmediatamente cuando se inicia la secuencia
- Los delays se calculan desde el momento en que se envía el paso anterior
- Si un participante completa todos los pasos, se marca como `completed`
- Puedes pausar una secuencia cambiando su estado a `paused`


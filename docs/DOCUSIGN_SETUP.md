# Configuración de DocuSign

Este documento describe cómo configurar DocuSign para el envío real de contratos.

---

## Estado Actual

El sistema tiene una integración completa con DocuSign pero actualmente está en **modo demo/mock** porque faltan las variables de entorno.

### Verificación del Estado
```typescript
// src/lib/docusign/client.ts
export function isDocuSignConfigured(): boolean {
  return Boolean(
    config.integrationKey &&
    config.accountId &&
    config.baseUrl &&
    config.userId &&
    config.privateKey  // ← Este es el que falta
  );
}
```

---

## Variables de Entorno Requeridas

Añadir al archivo `.env.local`:

```env
# DocuSign Integration
DOCUSIGN_INTEGRATION_KEY=tu-integration-key
DOCUSIGN_SECRET_KEY=tu-secret-key
DOCUSIGN_ACCOUNT_ID=tu-account-id
DOCUSIGN_USER_ID=tu-user-id
DOCUSIGN_PRIVATE_KEY=tu-private-key-base64

# URLs (usar demo para desarrollo, producción para prod)
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_OAUTH_BASE_URL=https://account-d.docusign.com

# Webhook (opcional, para recibir actualizaciones de estado)
DOCUSIGN_WEBHOOK_SECRET=tu-webhook-secret
```

---

## Pasos para Obtener Credenciales

### 1. Crear Cuenta de Desarrollador
1. Ir a [DocuSign Developer Center](https://developers.docusign.com/)
2. Crear una cuenta gratuita de desarrollador
3. Acceder al dashboard de integración

### 2. Crear una Aplicación
1. En el dashboard, ir a "Apps and Keys"
2. Click en "Add App and Integration Key"
3. Nombre: "Sovra Partner Portal"
4. Copiar el **Integration Key** (este es `DOCUSIGN_INTEGRATION_KEY`)

### 3. Configurar JWT Grant
1. En la configuración de la app, ir a "Service Integration"
2. Generar un nuevo RSA Key Pair
3. Descargar la **Private Key**
4. Convertir a Base64: `base64 -i private.key | tr -d '\n'`
5. Usar el resultado como `DOCUSIGN_PRIVATE_KEY`

### 4. Obtener Account ID y User ID
1. En DocuSign, ir a Settings → Apps and Keys
2. Copiar el **API Account ID** (este es `DOCUSIGN_ACCOUNT_ID`)
3. El **User ID** está en la misma página

### 5. Consent Grant (Importante)
Antes de usar JWT, necesitas otorgar consentimiento:

1. Construir la URL de consentimiento:
```
https://account-d.docusign.com/oauth/auth?
  response_type=code&
  scope=signature%20impersonation&
  client_id=TU_INTEGRATION_KEY&
  redirect_uri=http://localhost:3000
```

2. Abrir en navegador y aceptar los permisos
3. Solo necesitas hacer esto una vez por cuenta

---

## Modo Demo vs Producción

### Demo (Desarrollo)
```env
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_OAUTH_BASE_URL=https://account-d.docusign.com
```

### Producción
```env
DOCUSIGN_BASE_URL=https://na4.docusign.net/restapi
DOCUSIGN_OAUTH_BASE_URL=https://account.docusign.com
```

**Nota**: La URL base de producción puede variar según la región. Verificar en la configuración de tu cuenta.

---

## Webhooks (Connect)

Para recibir actualizaciones en tiempo real cuando se firman documentos:

### 1. Configurar en DocuSign
1. Ir a Settings → Connect
2. Crear nueva configuración
3. URL: `https://tu-dominio.com/api/webhooks/docusign`
4. Eventos a escuchar:
   - Envelope Sent
   - Envelope Delivered
   - Envelope Completed
   - Envelope Declined
   - Recipient Signed

### 2. Configurar Secreto
Generar un secreto y añadir a `.env.local`:
```env
DOCUSIGN_WEBHOOK_SECRET=tu-secreto-seguro
```

### 3. Endpoint en la App
El endpoint ya existe en:
```
src/app/api/webhooks/docusign/route.ts
```

Verifica las firmas HMAC para seguridad.

---

## Testing

### Verificar Configuración
```typescript
import { isDocuSignConfigured } from '@/lib/docusign';

if (isDocuSignConfigured()) {
  console.log('DocuSign está configurado correctamente');
} else {
  console.log('DocuSign NO está configurado - modo mock activo');
}
```

### Crear Envelope de Prueba
1. Ir a Sovra Admin → Documentos Legales
2. Seleccionar un partner
3. Click "Enviar Contrato DocuSign"
4. Subir un PDF de prueba
5. Llenar los datos de firmantes
6. Enviar

Si DocuSign está configurado:
- Ambos firmantes recibirán email
- El estado se actualizará vía webhook

Si DocuSign NO está configurado:
- Se creará un "mock envelope"
- No se enviarán emails
- El documento quedará en "pending_signature" permanentemente

---

## Troubleshooting

### Error: "DocuSign OAuth error"
- Verificar que el Integration Key sea correcto
- Verificar que el consentimiento haya sido otorgado
- Verificar que la Private Key esté en formato Base64 correcto

### Error: "consent_required"
- Necesitas completar el paso de Consent Grant
- Abrir la URL de consentimiento en el navegador

### Error: "invalid_grant"
- La Private Key puede estar incorrecta
- El User ID puede no coincidir con el dueño de la Private Key

### Documentos no aparecen en partner
- Verificar que el partnerId sea el mismo en ambas vistas
- Ver logs del servidor para debugging
- Revisar la sección de "Sistema de Demo" en LEARNINGS.md

---

## Recursos

- [DocuSign Developer Center](https://developers.docusign.com/)
- [eSignature REST API Guide](https://developers.docusign.com/docs/esign-rest-api/)
- [JWT Grant Authentication](https://developers.docusign.com/platform/auth/jwt/)
- [Connect Webhooks](https://developers.docusign.com/platform/webhooks/connect/)

---

*Última actualización: Febrero 2026*

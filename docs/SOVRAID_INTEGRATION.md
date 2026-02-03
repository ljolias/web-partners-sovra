# Integracion con SovraID - Credenciales Verificables

Este documento detalla todo lo aprendido durante la integracion con SovraID para la emision y gestion de credenciales verificables en el Portal de Partners.

## Tabla de Contenidos

1. [Resumen](#resumen)
2. [Configuracion](#configuracion)
3. [Emision de Credenciales](#emision-de-credenciales)
4. [Webhooks](#webhooks)
5. [Flujo Completo](#flujo-completo)
6. [Troubleshooting](#troubleshooting)
7. [Referencias de Codigo](#referencias-de-codigo)

---

## Resumen

SovraID es una plataforma de credenciales verificables que permite:
- Emitir credenciales digitales a usuarios
- Los usuarios las reciben en su wallet (Sovra Wallet)
- Verificar credenciales mediante presentaciones verificables

### Conceptos Clave

| Termino | Descripcion |
|---------|-------------|
| **Verifiable Credential (VC)** | Credencial digital firmada criptograficamente |
| **DID** | Decentralized Identifier - identificador unico del holder |
| **DIDComm** | Protocolo de comunicacion para intercambio de credenciales |
| **Invitation** | Invitacion para que el usuario reclame su credencial |
| **invitationId** | ID unico de la invitacion (CRITICO para webhooks) |
| **Workspace** | Espacio de trabajo en SovraID que agrupa credenciales |

---

## Configuracion

### Variables de Entorno

```env
# URL de la API (sandbox o produccion)
SOVRAID_API_URL=https://id.api.sandbox.sovra.io/api

# API Key del workspace
SOVRAID_API_KEY=your-api-key

# ID del workspace
SOVRAID_WORKSPACE_ID=your-workspace-id

# Secret para validar webhooks (opcional pero recomendado)
SOVRAID_WEBHOOK_SECRET=your-webhook-secret
```

### Ambientes

| Ambiente | URL |
|----------|-----|
| Sandbox | `https://id.api.sandbox.sovra.io/api` |
| Produccion | `https://id.api.sovra.io/api` |

### Cliente

El cliente se inicializa automaticamente usando las variables de entorno:

```typescript
import { getSovraIdClient, isSovraIdConfigured } from '@/lib/sovraid';

// Verificar si esta configurado
if (isSovraIdConfigured()) {
  const client = getSovraIdClient();
  // usar client...
}
```

---

## Emision de Credenciales

### Endpoint de la API

```
POST /credentials/workspace/{workspaceId}
```

### Headers Requeridos

```
Content-Type: application/json
x-api-key: {SOVRAID_API_KEY}
```

### Request Body

La credencial debe seguir el formato W3C Verifiable Credentials:

```typescript
{
  credential: {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      'https://www.w3.org/2018/credentials/examples/v1',
      {
        // Definir propiedades custom con @id y @type
        holderName: {
          '@id': 'https://sovra.io/vocab#holderName',
          '@type': 'xsd:string',
        },
        // ... mas propiedades
      },
    ],
    type: ['VerifiableCredential'],
    expirationDate: '2027-02-03', // formato YYYY-MM-DD
    credentialSubject: {
      holderName: 'Juan Perez',
      partnerName: 'Acme Corp',
      role: 'sales',
      email: 'juan@acme.com',
    },
  },
  outputDescriptor: {
    // Configuracion visual de la credencial en el wallet
    id: 'sovra-partner-portal-access',
    schema: 'https://sovra.io/schemas/partner-access',
    styles: {
      thumbnail: { uri: 'https://...', alt: 'Logo' },
      hero: { uri: 'https://...', alt: 'Hero' },
      background: { color: '#0066FF' },
      text: { color: '#FFFFFF' },
    },
    display: {
      title: { text: 'Sovra Partner Portal' },
      subtitle: { text: 'Acme Corp' },
      description: { text: 'Credencial de acceso para Juan Perez' },
      properties: [
        {
          path: ['$.credentialSubject.holderName'],
          fallback: 'N/A',
          label: 'Nombre',
          schema: { type: 'string' },
        },
        // ... mas propiedades
      ],
    },
  },
}
```

### Response

```typescript
{
  id: 'credential-uuid',
  credential: { /* VC completa */ },
  invitation_wallet: {
    invitationId: 'invitation-uuid',        // IMPORTANTE: guardar para webhook
    invitationContent: 'didcomm://?_oob=...' // URL para el QR
  }
}
```

### Datos Criticos a Guardar

Al emitir una credencial, es **CRITICO** guardar:

1. `id` - ID de la credencial en SovraID
2. `invitation_wallet.invitationId` - ID de la invitacion (para match en webhook)
3. `invitation_wallet.invitationContent` - URL DIDComm para el QR

```typescript
// Ejemplo de como guardar
const credential: PartnerCredential = {
  id: localCredentialId,
  partnerId,
  holderName,
  holderEmail,
  role,
  status: 'issued',
  sovraIdCredentialId: response.id,
  sovraIdInvitationId: response.invitation_wallet.invitationId, // CRITICO!
  qrCode: response.invitation_wallet.invitationContent,
};
```

---

## Webhooks

### Configuracion

Los webhooks se configuran en el dashboard de SovraID:
- URL: `https://tu-dominio.com/api/sovra/webhooks/sovraid`
- Eventos: `credential-issued`, `verifiable-presentation-finished`

### Documentacion Oficial

https://github.com/sovrahq/id-docs/blob/main/docs/guides/webhooks.md

### Estructura del Payload

```typescript
interface SovraIdWebhookPayload {
  eventType: string;      // Tipo de evento
  eventData: {            // Datos del evento
    // ... varia segun el evento
  };
  eventWebhookResponse?: unknown;
}
```

**IMPORTANTE:** Los campos son `eventType` y `eventData`, NO `event` y `data`.

### Evento: credential-issued

Se dispara cuando el usuario **acepta la credencial en su wallet** (no cuando se emite).

```typescript
interface CredentialIssuedData {
  vc: {
    id?: string;
    credentialSubject?: {
      email?: string;
      holderName?: string;
      [key: string]: unknown;
    };
  };
  holderDID: string;      // DID del holder
  invitationId: string;   // ID de la invitacion (para match)
}
```

### Evento: verifiable-presentation-finished

Se dispara cuando se completa una verificacion de credencial.

```typescript
interface VerificationFinishedData {
  verified: boolean;
  holderDID: string;
  verifierDID: string;
  invitationId: string;
  verifiableCredentials: Array<Record<string, unknown>>;
}
```

### Matching de Credenciales

Para encontrar la credencial local cuando llega el webhook:

```typescript
// 1. Buscar por invitationId (metodo principal)
if (credential.sovraIdInvitationId === invitationId) {
  return credential;
}

// 2. Buscar por credentialId (fallback)
if (credential.sovraIdCredentialId === invitationId) {
  return credential;
}

// 3. Buscar por email del VC (ultimo recurso)
const vcEmail = eventData?.vc?.credentialSubject?.email;
if (vcEmail && credential.holderEmail === vcEmail) {
  return credential;
}
```

### Respuesta del Webhook

Responder dentro de 5 segundos con:

```json
{ "received": true }
```

---

## Flujo Completo

```
1. EMISION
   Admin emite credencial → API SovraID → Retorna invitationId + QR

2. ALMACENAMIENTO
   Guardar en DB: sovraIdCredentialId, sovraIdInvitationId, qrCode

3. DISTRIBUCION
   Mostrar QR al usuario o enviar por email

4. RECEPCION
   Usuario escanea QR con Sovra Wallet → Acepta credencial

5. WEBHOOK
   SovraID envia evento 'credential-issued' con invitationId

6. ACTIVACION
   Sistema busca credencial por invitationId → Actualiza status a 'active'
   Sistema crea cuenta de usuario automaticamente
```

### Diagrama de Secuencia

```
Partner Admin          Sistema           SovraID            Usuario Wallet
     |                    |                 |                     |
     |-- Emitir cred ---->|                 |                     |
     |                    |-- POST /cred -->|                     |
     |                    |<-- invitation --|                     |
     |<-- QR code --------|                 |                     |
     |                    |                 |                     |
     |                    |                 |<-- Scan QR ---------|
     |                    |                 |-- Accept cred ----->|
     |                    |<-- webhook -----|                     |
     |                    |-- Update DB --->|                     |
     |                    |-- Create user ->|                     |
```

---

## Troubleshooting

### Error: Credencial no encontrada en webhook

**Causa:** No se guardo el `sovraIdInvitationId` al emitir.

**Solucion:** Asegurarse de guardar:
```typescript
sovraIdInvitationId = response.invitation_wallet.invitationId;
```

### Error: Variables de entorno no configuradas

**Causa:** Falta configurar en Vercel/produccion.

**Verificar:**
```bash
# En Vercel Dashboard > Settings > Environment Variables
SOVRAID_API_URL
SOVRAID_API_KEY
SOVRAID_WORKSPACE_ID
```

### Error: WRONGTYPE en Redis

**Causa:** Usar `smembers` en un Sorted Set.

**Solucion:** Usar `zrange` para Sorted Sets:
```typescript
// Incorrecto
const ids = await redis.smembers('credentials:all');

// Correcto
const ids = await redis.zrange('credentials:all', 0, -1);
```

### QR no funciona en wallet

**Causa:** El formato del invitationContent no es correcto.

**Verificar formato:**
```typescript
// Debe comenzar con didcomm://
if (url.startsWith('didcomm://')) {
  // OK
} else if (url.match(/^[A-Za-z0-9+/=_-]+$/)) {
  // Es base64, construir URL
  url = `didcomm://?_oob=${url}`;
}
```

### Webhook no llega

**Verificar:**
1. URL configurada correctamente en dashboard SovraID
2. Eventos seleccionados: `credential-issued`
3. Endpoint accesible publicamente (no localhost)
4. Logs en Vercel Functions

---

## Referencias de Codigo

### Archivos Principales

| Archivo | Descripcion |
|---------|-------------|
| `src/lib/sovraid/client.ts` | Cliente API de SovraID |
| `src/lib/sovraid/types.ts` | Tipos TypeScript |
| `src/lib/sovraid/index.ts` | Exports del modulo |
| `src/app/api/sovra/webhooks/sovraid/route.ts` | Handler de webhooks |
| `src/app/api/sovra/partners/[partnerId]/credentials/route.ts` | Emision desde Sovra Admin |
| `src/app/api/partners/team/credentials/route.ts` | Emision desde Partner Admin |

### Tipos Importantes

```typescript
// src/types/index.ts
interface PartnerCredential {
  id: string;
  partnerId: string;
  userId?: string;
  holderName: string;
  holderEmail: string;
  role: CredentialRole;
  status: CredentialStatus;

  // SovraID
  sovraIdCredentialId?: string;    // ID de la credencial
  sovraIdInvitationId?: string;    // ID de la invitacion (para webhook)
  qrCode?: string;                  // URL DIDComm
  holderDid?: string;               // DID del holder (despues de claim)

  // Fechas
  issuedAt?: string;
  claimedAt?: string;
  revokedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Funciones de Redis

```typescript
// Crear credencial
await createPartnerCredential(credential);

// Actualizar credencial
await updatePartnerCredential(credentialId, {
  status: 'active',
  claimedAt: new Date().toISOString(),
  holderDid: holderDID,
  userId: newUserId,
});

// Obtener credenciales de un partner
const credentials = await getPartnerCredentials(partnerId);

// Buscar por email
const credential = await getCredentialByEmail(email);
```

---

## Lecciones Aprendidas

1. **Siempre guardar `invitationId`** - Es la unica forma confiable de hacer match en el webhook.

2. **El evento `credential-issued` se dispara al ACEPTAR**, no al emitir. El nombre es confuso.

3. **Los campos del payload son `eventType` y `eventData`**, no `event` y `data`.

4. **Tener fallbacks de matching** - Por email como ultimo recurso.

5. **Crear usuario automaticamente** - Mejor UX si el usuario aparece en el equipo inmediatamente.

6. **Logs detallados en webhook** - Facilitan mucho el debugging.

7. **Verificar variables en cada ambiente** - Desarrollo, staging y produccion pueden tener configs diferentes.

---

*Documento creado: Febrero 2026*
*Ultima actualizacion: Febrero 2026*

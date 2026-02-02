# Aprendizajes del Proyecto - Partner Portal Sovra

Este documento registra los aprendizajes, mejoras, correcciones de errores y decisiones de diseño tomadas durante el desarrollo del portal.

---

## Tabla de Contenidos

1. [Sistema de Temas (Dark/Light Mode)](#1-sistema-de-temas-darklight-mode)
2. [Diseño Consistente entre Vistas](#2-diseño-consistente-entre-vistas)
3. [Sistema de Documentos Legales](#3-sistema-de-documentos-legales)
4. [Integración DocuSign](#4-integración-docusign)
5. [Sistema de Demo y Roles](#5-sistema-de-demo-y-roles)
6. [Redis y Almacenamiento](#6-redis-y-almacenamiento)
7. [Buenas Prácticas de CSS](#7-buenas-prácticas-de-css)

---

## 1. Sistema de Temas (Dark/Light Mode)

### Problema Original
- Texto blanco sobre fondo blanco en modo light
- Componentes con colores hardcodeados que no respetaban el tema

### Solución Implementada
Uso de CSS Variables en lugar de colores hardcodeados:

```css
/* Variables definidas en globals.css */
:root {
  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-hover: #f1f5f9;
  --color-border: #e2e8f0;
  --color-text-primary: #0f172a;
  --color-text-secondary: #64748b;
  --color-text-muted: #94a3b8;
  --color-primary: #6366f1;
}

.dark {
  --color-bg: #0a0a0f;
  --color-surface: #12121a;
  /* ... */
}
```

### Uso en Componentes
```tsx
// ❌ Incorrecto - No respeta el tema
className="bg-white text-gray-900"

// ✅ Correcto - Usa CSS variables
className="bg-[var(--color-surface)] text-[var(--color-text-primary)]"
```

### Componente ThemeToggle
```tsx
function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('sovra-partners-theme', newTheme);
  };

  // ...
}
```

### Archivos Modificados
- `src/components/ui/button.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/card.tsx`
- `src/components/portal/Sidebar.tsx`
- `src/components/sovra/SovraShell.tsx`
- Todas las páginas de dashboard

---

## 2. Diseño Consistente entre Vistas

### Problema Original
- El menú de Sovra Admin era diferente al de Partners
- Faltaba logo, selector de idioma, y toggle de tema en Sovra Admin

### Solución Implementada
Unificar el diseño del sidebar en ambas vistas:

1. **Logo consistente**: `<SovraLogo size="md" />`
2. **Selector de idiomas**: Dropdown con banderas
3. **Toggle de tema**: Botón sol/luna
4. **Información del usuario**: Avatar + nombre + email

### Componente LanguageDropdown (Reutilizable)
```tsx
function LanguageDropdown({ locale, pathWithoutLocale, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Render dropdown...
}
```

### Idiomas Soportados
```tsx
const languages = [
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'en', flag: '🇺🇸', name: 'English' },
  { code: 'pt', flag: '🇧🇷', name: 'Português' },
];
```

---

## 3. Sistema de Documentos Legales

### Arquitectura V2
El sistema soporta dos tipos de documentos:

1. **DocuSign**: Contratos que requieren firma bilateral
2. **Upload**: Documentos compartidos sin firma

### Modelo de Datos
```typescript
interface LegalDocument {
  id: string;
  partnerId: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  type: 'docusign' | 'upload';
  docusignMetadata?: DocuSignMetadata;
  uploadMetadata?: UploadMetadata;
  status: DocumentStatus;
  version: number;
  effectiveDate?: string;
  expirationDate?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}
```

### Categorías de Documentos
```typescript
type DocumentCategory =
  | 'contract'      // Contratos legales
  | 'amendment'     // Modificaciones
  | 'compliance'    // Cumplimiento normativo
  | 'financial'     // Financieros
  | 'certification' // Certificaciones
  | 'policy'        // Políticas
  | 'correspondence'; // Comunicaciones
```

### Estados de Documentos
```typescript
type DocumentStatus =
  | 'draft'
  | 'pending_signature'
  | 'partially_signed'
  | 'active'
  | 'expired'
  | 'superseded'
  | 'archived';
```

---

## 4. Integración DocuSign

### Variables de Entorno Requeridas
```env
DOCUSIGN_INTEGRATION_KEY=xxx
DOCUSIGN_SECRET_KEY=xxx
DOCUSIGN_ACCOUNT_ID=xxx
DOCUSIGN_BASE_URL=https://demo.docusign.net/restapi
DOCUSIGN_OAUTH_BASE_URL=https://account-d.docusign.com
DOCUSIGN_USER_ID=xxx
DOCUSIGN_PRIVATE_KEY=xxx  # Base64 encoded RSA private key
```

### Verificación de Configuración
```typescript
export function isDocuSignConfigured(): boolean {
  return Boolean(
    config.integrationKey &&
    config.accountId &&
    config.baseUrl &&
    config.userId &&
    config.privateKey  // Este es el más importante
  );
}
```

### Modo Demo (Mock)
Cuando DocuSign no está configurado, el sistema crea "mock envelopes":

```typescript
if (!isDocuSignConfigured()) {
  envelopeId = `mock-envelope-${generateId()}`;
  console.log('DocuSign not configured, using mock envelope:', envelopeId);
}
```

**Importante**: En modo demo, los emails de firma NO se envían.

### Flujo de Firma
```
1. Sovra Admin crea documento → POST /api/sovra/documents/send-contract
2. Sistema crea envelope en DocuSign (o mock)
3. Documento se guarda en Redis con status: 'pending_signature'
4. Partner recibe email de DocuSign (solo si configurado)
5. Partner firma → Webhook actualiza estado
6. Sovra firma → Documento pasa a 'active'
```

---

## 5. Sistema de Demo y Roles

### Problema Identificado
Al usar el Role Switcher para cambiar entre `admin` y `sovra_admin`:
- El `partnerId` de la sesión NO cambia
- Solo cambia el `role` del usuario

### Implicación
```
1. Usuario demo@sovra.io inicia sesión → session.partnerId = "ABC"
2. Cambia a sovra_admin → role = "sovra_admin", partnerId sigue siendo "ABC"
3. En Sovra Admin, selecciona partner "XYZ" del dropdown
4. Crea documento para partner "XYZ"
5. Cambia de vuelta a admin → role = "admin", partnerId sigue siendo "ABC"
6. Va a documentos legales → Busca documentos de "ABC", NO de "XYZ"
7. No ve el documento porque está guardado para "XYZ"
```

### Solución
Asegurarse de seleccionar el MISMO partner en Sovra Admin que corresponde al usuario demo:
- El seed crea UN solo partner
- El usuario demo pertenece a ese partner
- Al crear documentos, seleccionar ese mismo partner

### Debugging Añadido
```typescript
// En /api/partners/legal
console.log('[Legal API] Fetching documents for partner:', partner.id, partner.companyName);

// En /api/sovra/documents/send-contract
console.log('[SendContract] Creating document for partner:', partnerId, partner.companyName);

// En createLegalDocumentV2
console.log('[Redis] Creating legal document:', doc.id, 'for partner:', doc.partnerId);
```

---

## 6. Redis y Almacenamiento

### Estructura de Keys
```typescript
const keys = {
  // Partners
  partner: (id) => `partner:${id}`,
  allPartners: () => `partners:all`,

  // Documentos Legales V2
  legalDocumentV2: (id) => `legal:v2:document:${id}`,
  partnerLegalDocuments: (partnerId) => `partner:${partnerId}:legal:documents`,
  allLegalDocumentsV2: () => `legal:v2:all`,
  legalDocumentsByCategory: (category) => `legal:v2:by-category:${category}`,
  legalDocumentsByStatus: (status) => `legal:v2:by-status:${status}`,
  docusignEnvelope: (envelopeId) => `legal:docusign:envelope:${envelopeId}`,
};
```

### Error en Seed Original
El seed no añadía el partner al índice `partners:all`:

```typescript
// ❌ Faltaba esto
await redis.zadd('partners:all', {
  score: new Date(partner.createdAt).getTime(),
  member: partnerId
});
```

Esto causaba que `getAllPartners()` tuviera que hacer fallback a escanear keys.

### Operación createLegalDocumentV2
```typescript
export async function createLegalDocumentV2(doc: LegalDocument): Promise<void> {
  const pipeline = redis.pipeline();

  // Guardar documento
  pipeline.hset(keys.legalDocumentV2(doc.id), toRedisHash(docData));

  // Indexar por partner (IMPORTANTE para que aparezca en vista del partner)
  pipeline.zadd(keys.partnerLegalDocuments(doc.partnerId), {
    score: new Date(doc.createdAt).getTime(),
    member: doc.id,
  });

  // Indexar globalmente
  pipeline.zadd(keys.allLegalDocumentsV2(), { ... });

  // Indexar por categoría y estado
  pipeline.sadd(keys.legalDocumentsByCategory(doc.category), doc.id);
  pipeline.sadd(keys.legalDocumentsByStatus(doc.status), doc.id);

  await pipeline.exec();
}
```

---

## 7. Buenas Prácticas de CSS

### Variables CSS para Theming
Siempre usar variables en lugar de colores directos:

```tsx
// Para textos
text-[var(--color-text-primary)]
text-[var(--color-text-secondary)]
text-[var(--color-text-muted)]

// Para fondos
bg-[var(--color-bg)]
bg-[var(--color-surface)]
bg-[var(--color-surface-hover)]

// Para bordes
border-[var(--color-border)]

// Para el color primario
text-[var(--color-primary)]
bg-[var(--color-primary)]
```

### Estados de Hover
```tsx
hover:bg-[var(--color-surface-hover)]
hover:text-[var(--color-text-primary)]
```

### Badges y Estados con Color
Para estados que necesitan colores específicos (éxito, advertencia, error), usar opacidad:

```tsx
// Éxito
'bg-green-500/10 text-green-500'

// Advertencia
'bg-amber-500/10 text-amber-500'

// Error
'bg-red-500/10 text-red-500'

// Primario
'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
```

---

## Comandos Útiles

```bash
# Ejecutar seed para reiniciar datos
npx tsx scripts/seed.ts

# Iniciar servidor de desarrollo
npm run dev

# Ver logs en tiempo real
# Los logs aparecen en la terminal donde corre `npm run dev`
```

---

## Credenciales de Demo

```
Email: demo@sovra.io
Password: demo123
```

Usar el botón "Role Switcher" (esquina inferior derecha) para cambiar entre:
- `admin` - Vista de partner
- `sales` - Vista de vendedor
- `sovra_admin` - Vista de administrador Sovra

---

*Última actualización: Febrero 2026*

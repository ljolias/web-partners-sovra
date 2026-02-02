# Documentación del Proyecto

Esta carpeta contiene la documentación técnica y aprendizajes del Partner Portal de Sovra.

## Contenido

| Archivo | Descripción |
|---------|-------------|
| [LEARNINGS.md](./LEARNINGS.md) | Aprendizajes, mejoras y correcciones de errores |
| [DOCUSIGN_SETUP.md](./DOCUSIGN_SETUP.md) | Guía de configuración de DocuSign |

## Resumen Rápido

### Credenciales de Demo
```
Email: demo@sovra.io
Password: demo123
```

### Comandos Principales
```bash
# Desarrollo
npm run dev

# Reiniciar datos de prueba
npx tsx scripts/seed.ts

# Build
npm run build
```

### Variables de Entorno Críticas
```env
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx

# DocuSign (opcional para demo)
DOCUSIGN_INTEGRATION_KEY=xxx
DOCUSIGN_PRIVATE_KEY=xxx
# ... ver DOCUSIGN_SETUP.md para lista completa
```

### Estructura del Proyecto
```
src/
├── app/
│   ├── [locale]/
│   │   ├── partners/portal/    # Vista de Partners
│   │   └── sovra/dashboard/    # Vista de Sovra Admin
│   └── api/
│       ├── partners/           # APIs de Partners
│       └── sovra/              # APIs de Sovra Admin
├── components/
│   ├── portal/                 # Componentes del portal
│   ├── sovra/                  # Componentes de admin
│   ├── legal/                  # Componentes de documentos
│   └── ui/                     # Componentes base (Button, Card, etc.)
└── lib/
    ├── redis/                  # Operaciones de Redis
    ├── docusign/               # Cliente de DocuSign
    └── permissions/            # Sistema de permisos RBAC
```

---

*Para más detalles, revisar los archivos de documentación individuales.*

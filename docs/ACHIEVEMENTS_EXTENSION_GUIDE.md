# 🎯 Guía de Extensión del Sistema de Rewards y Achievements

Este documento explica cómo agregar nuevos cursos de entrenamiento, oportunidades de ganar puntos y achievements al sistema de rewards de forma que se conecten automáticamente sin tener que modificar múltiples archivos manualmente.

---

## 📋 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Agregar Nuevos Achievements](#agregar-nuevos-achievements)
3. [Agregar Nuevos Cursos Que Sumen Puntos](#agregar-nuevos-cursos-que-sumen-puntos)
4. [Agregar Nuevas Formas de Ganar Puntos](#agregar-nuevas-formas-de-ganar-puntos)
5. [Testing de Nuevos Achievements](#testing-de-nuevos-achievements)

---

## 🏗️ Arquitectura General

El sistema de rewards funciona en **3 capas desacopladas**:

```
┌─────────────────────────────────────────────────────┐
│ 1. USER ACTION (Training, Deal, Event)              │
│    - Partner completa módulo                        │
│    - Partner cierra deal                            │
│    - Partner registra oportunidad                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 2. EVENT LOGGING (lib/rating/events.ts)             │
│    - logRatingEvent(partnerId, eventType, data)     │
│    - Registra evento en Redis                       │
│    - Procesa achievements automáticamente (async)   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ 3. ACHIEVEMENT AWARDING (processAchievementsForEvent)
│    - Lee event type                                 │
│    - Checkea condiciones                            │
│    - Otorga achievements automáticamente            │
│    - Actualiza puntos totales                       │
└─────────────────────────────────────────────────────┘
```

**Beneficio:** Cuando agregas un **nuevo event type**, los achievements se **otorgan automáticamente** sin cambios en la UI.

---

## 🏆 Agregar Nuevos Achievements

### Paso 1: Definir el Achievement

**Archivo:** `src/lib/achievements/definitions.ts`

```typescript
export const ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  // ... existing achievements ...

  advanced_training_complete: {
    id: 'advanced_training_complete',
    category: 'training',
    name: 'achievements.advanced_training_complete.name',
    description: 'achievements.advanced_training_complete.description',
    icon: 'BookMarked', // lucide-react icon name
    points: 35,         // Puntos otorgados al ganar este achievement
    tier: 'gold',       // Tier que este achievement ayuda a desbloquear
    repeatable: true,   // true = puede ganarse múltiples veces
  },
};
```

### Paso 2: Agregar Traducciones

Edita estos 3 archivos:

**Archivo:** `src/messages/en.json`
```json
{
  "achievements": {
    // ... existing ...
    "advanced_training_complete": {
      "name": "Advanced Training Complete",
      "description": "Complete an advanced training course"
    }
  }
}
```

**Archivo:** `src/messages/es.json`
```json
{
  "achievements": {
    "advanced_training_complete": {
      "name": "Capacitación Avanzada Completada",
      "description": "Completa un curso de capacitación avanzada"
    }
  }
}
```

**Archivo:** `src/messages/pt.json`
```json
{
  "achievements": {
    "advanced_training_complete": {
      "name": "Treinamento Avançado Concluído",
      "description": "Conclua um curso de treinamento avançado"
    }
  }
}
```

### Paso 3: Triggerear el Achievement (Evento Existente)

Si el achievement se gana con un **evento existente**, edita `src/lib/rating/events.ts`:

**Ejemplo:** Award "advanced_training_complete" cuando se complete un módulo de nivel "advanced"

```typescript
// En processAchievementsForEvent()
case 'TRAINING_MODULE_COMPLETED': {
  const { moduleId } = data;
  const module = await getTrainingModule(moduleId);

  // Award existing achievement
  await checkAndAwardAchievement(partnerId, 'training_module_complete');

  // Award new achievement if advanced level
  if (module.level === 'advanced') {
    await checkAndAwardAchievement(partnerId, 'advanced_training_complete');
  }
  break;
}
```

### Paso 4: Si Se Requiere Nuevo Event Type (Caso Avanzado)

Si necesitas un **nuevo tipo de evento** (ej: "MILESTONE_REACHED"), sigue estos pasos adicionales:

**1. Agregar event type a enum** (`src/lib/rating/events.ts`):
```typescript
export type RatingEventType =
  | 'TRAINING_MODULE_COMPLETED'
  | 'MILESTONE_REACHED'  // ← Nueva
  | // ... rest ...
```

**2. Agregar puntos para evento** (`src/lib/rating/events.ts`):
```typescript
export const EVENT_POINTS: Record<RatingEventType, number> = {
  TRAINING_MODULE_COMPLETED: 3,
  MILESTONE_REACHED: 5,  // ← Nueva
  // ... rest ...
};
```

**3. Agregar lógica de achievement** (`src/lib/rating/events.ts`):
```typescript
case 'MILESTONE_REACHED': {
  const { milestoneType } = data;

  if (milestoneType === 'training_advanced') {
    await checkAndAwardAchievement(partnerId, 'advanced_training_complete');
  } else if (milestoneType === 'engagement_high') {
    await checkAndAwardAchievement(partnerId, 'engagement_champion');
  }
  break;
}
```

### Paso 5: Actualizar Tier Requirements (Si Es Necesario)

Si el achievement debe ser **requerido** para alcanzar cierto tier, edita `src/lib/achievements/tiers.ts`:

```typescript
export const TIER_REQUIREMENTS: Record<PartnerTier, TierRequirement> = {
  gold: {
    minRating: 70,
    achievements: {
      required: [
        'first_certification',
        'second_certification',
        'first_opportunity',
        'first_deal_won',
        'advanced_training_complete'  // ← Nuevo requerido para Gold
      ],
      optional: [...]
    },
    // ...
  }
}
```

---

## 📚 Agregar Nuevos Cursos Que Sumen Puntos

### Flujo Automático

Cuando un partner **completa un nuevo curso**, el sistema automáticamente:

1. Detecta que se completó un módulo de entrenamiento
2. Lanza evento `TRAINING_MODULE_COMPLETED`
3. Awards `training_module_complete` achievement (repeatable, +20 pts)
4. Trackea en progreso de entrenamiento
5. Checkea si se completó TODA la certificación
6. Si se completó la cert, lanza `CERTIFICATION_EARNED`
7. Awards cert achievements basado en número de certificaciones

**No necesitas hacer nada especial para que un nuevo curso conecte al sistema de rewards.**

### Pero Si Quieres Achievement Especial por Curso

Si quieres que completar un **curso específico** otorgue un achievement especial:

**Paso 1:** Define el achievement (ver sección anterior)

```typescript
// En definitions.ts
advanced_gov_specialist: {
  id: 'advanced_gov_specialist',
  category: 'certification',
  name: 'achievements.advanced_gov_specialist.name',
  description: 'achievements.advanced_gov_specialist.description',
  icon: 'Award',
  points: 50,
  tier: 'platinum',
  repeatable: false,
}
```

**Paso 2:** Triggerear en quiz submit (`src/app/api/partners/training/quiz/submit/route.ts`):

```typescript
// Después de crear la certificación
if (courseId === 'advanced_gov_specialist_course') {
  await checkAndAwardAchievement(user.id, 'advanced_gov_specialist');
}
```

---

## ⚡ Agregar Nuevas Formas de Ganar Puntos

El sistema soporta **N formas de ganar puntos** a través de events. Aquí hay ejemplos:

### Forma 1: Evento Existente + Nuevo Achievement

**Ejemplo:** Reward "webinar_attendee" cuando se complete un webinar

```typescript
// En logRatingEvent() en donde se registra asistencia a webinar
await logRatingEvent(partnerId, 'ATTEND_WEBINAR', { webinarId });

// En processAchievementsForEvent() [events.ts]
case 'ATTEND_WEBINAR': {
  await checkAndAwardAchievement(partnerId, 'attend_webinar');
  break;
}
```

### Forma 2: Nuevo Event Type + Logica Compleja

**Ejemplo:** "ENGAGEMENT_MILESTONE" cuando alcanza cierta cantidad de copilot sessions

```typescript
// En donde registras copilot session
const sessionCount = await getCopilotSessionCount(partnerId, 'this_month');
if (sessionCount === 10) {
  await logRatingEvent(partnerId, 'ENGAGEMENT_MILESTONE', {
    milestoneType: 'copilot_sessions_10',
    sessionCount
  });
}

// En events.ts - processAchievementsForEvent()
case 'ENGAGEMENT_MILESTONE': {
  const { milestoneType } = data;

  const milestoneAchievements: Record<string, string> = {
    'copilot_sessions_10': 'engagement_copilot_expert',
    'copilot_sessions_20': 'engagement_copilot_master',
    'training_modules_10': 'training_guru',
  };

  const achievementId = milestoneAchievements[milestoneType];
  if (achievementId) {
    await checkAndAwardAchievement(partnerId, achievementId);
  }
  break;
}
```

### Forma 3: Sistema de Bonus (Repeatable Achievements)

Para achievements que pueden ganarse **múltiples veces**:

```typescript
// En definitions.ts
monthly_deal_quota: {
  id: 'monthly_deal_quota',
  category: 'deals',
  name: 'achievements.monthly_deal_quota.name',
  description: 'achievements.monthly_deal_quota.description',
  icon: 'TrendingUp',
  points: 25,
  tier: 'bronze',
  repeatable: true,  // ← Clave: permite múltiples premios
}

// En procesamiento de cierre de deals (deals API)
const dealsThisMonth = await getClosedDealsThisMonth(partnerId);
if (dealsThisMonth >= 3) {
  await checkAndAwardAchievement(partnerId, 'monthly_deal_quota');
  // El sistema automáticamente trackea cuántas veces se ganó
}
```

---

## 🧪 Testing de Nuevos Achievements

### 1. Testing Manual

**Paso 1:** Agrega el nuevo achievement a `definitions.ts`

**Paso 2:** Completa la acción que gatilla el achievement

**Paso 3:** Verifica en `/en/partners/portal/rewards`

Expected:
- ✅ El achievement aparece en la lista
- ✅ El card muestra "Earned" con check
- ✅ Los puntos totales incrementan
- ✅ El tier progress actualiza

### 2. Testing via API

```bash
# 1. Trigger the event directly
curl -X POST http://localhost:3000/api/partners/rating/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "eventType": "TRAINING_MODULE_COMPLETED",
    "data": { "moduleId": "intro_sovragov" }
  }'

# 2. Fetch achievements to verify
curl http://localhost:3000/api/partners/achievements \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Verify points increased in progress endpoint
curl http://localhost:3000/api/partners/achievements/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Testing Steps para Nuevo Achievement

Cuando agregas un **nuevo achievement**, verificá:

1. ✅ **Aparece en definiciones** - Visible en `getAllAchievements()`
2. ✅ **Triggereable** - Lógica de evento correcta
3. ✅ **Puntos asignados** - Se incrementan en total
4. ✅ **UI refleja cambios** - Visible en rewards page
5. ✅ **Translations funcionan** - Nombres en múltiples idiomas
6. ✅ **Tier requirements** - Si es requerido, afecta tier eligibility
7. ✅ **Repeatable logic** - Si es repeatable, puede ganarse múltiples veces

---

## 📝 Checklist para Agregar Nuevo Achievement

- [ ] Achievement definido en `lib/achievements/definitions.ts`
- [ ] Traducciones añadidas a `messages/en.json`, `es.json`, `pt.json`
- [ ] Logica de trigger en `lib/rating/events.ts` (o nuevo event type creado)
- [ ] Tier requirements actualizados si es necesario (`lib/achievements/tiers.ts`)
- [ ] Testing manual completado
- [ ] Documentación actualizada (este archivo si es necesario)

---

## 📝 Checklist para Agregar Nuevo Curso

- [ ] Curso creado en Training Center
- [ ] Módulos y quizzes configurados
- [ ] Course publicado
- [ ] **Sin cambios necesarios** - achievements se otorgan automáticamente
- [ ] Si quieres achievement especial, sigue pasos en "Agregar Nuevos Achievements"
- [ ] Testing: completar curso y verificar achievements en rewards page

---

## 🔄 Flujo Completo: Ejemplo Práctico

### Escenario: Agregar "Advanced Gov Specialist" Achievement

**Paso 1:** Crear achievement en `definitions.ts`
```typescript
advanced_gov_specialist: {
  id: 'advanced_gov_specialist',
  category: 'certification',
  name: 'achievements.advanced_gov_specialist.name',
  description: 'achievements.advanced_gov_specialist.description',
  icon: 'Target',
  points: 50,
  tier: 'platinum',
  repeatable: false,
}
```

**Paso 2:** Agregar traducciones
```json
// en.json
"advanced_gov_specialist": {
  "name": "Advanced Gov Specialist",
  "description": "Complete advanced government solutions training"
}

// es.json
"advanced_gov_specialist": {
  "name": "Especialista Avanzado en Gobierno",
  "description": "Completa capacitación avanzada en soluciones de gobierno"
}
```

**Paso 3:** Agregar trigger en `quiz/submit/route.ts`
```typescript
// Después de pasar el quiz del curso
if (courseId === 'advanced_gov_solutions') {
  await checkAndAwardAchievement(user.id, 'advanced_gov_specialist');
}
```

**Paso 4:** Update tier requirements si es necesario
```typescript
// En tiers.ts
platinum: {
  achievements: {
    required: [
      // ... existing ...
      'advanced_gov_specialist'  // ← Nuevo
    ]
  }
}
```

**Paso 5:** Test
- Crear nuevo curso "Advanced Gov Solutions" en Training Center
- Publicar curso
- Completar como partner
- Verificar achievement en rewards page ✅

---

## 🎓 Resumen

| Acción | Archivos a Modificar | Complejidad |
|--------|----------------------|-------------|
| Nuevo Achievement (existente event) | `definitions.ts`, `messages/*.json`, `events.ts` | 🟢 Fácil |
| Nuevo Curso | Training Center UI (sin cambios en rewards) | 🟢 Fácil |
| Nuevo Achievement (nuevo event) | + `definitions.ts`, `events.ts` | 🟡 Medio |
| Milestone/Bonus Complex | + tier requirements, advanced logic | 🔴 Complejo |

**La mayoría de casos son 🟢 FÁCILES porque el sistema es extensible por design.**

---

## 📞 Questions?

Si algo no está claro o necesitas agregar un caso de uso no cubierto, revisa:
- `src/lib/achievements/` - Core achievement system
- `src/lib/rating/events.ts` - Event system
- `src/app/api/partners/training/quiz/submit/route.ts` - Training integration example
- `src/app/api/partners/deals/route.ts` - Deal integration example


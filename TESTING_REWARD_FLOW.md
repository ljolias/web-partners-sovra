# 🧪 Guía de Prueba del Sistema de Rewards - Acme Corp

## Objetivo
Probar el flujo completo de ganar puntos en el sistema de rewards registrando oportunidades comerciales y completando capacitaciones.

---

## 📋 Requisitos Previos

- ✅ Partner: **Acme Corp** (asegúrate de tener una sesión activa)
- ✅ El servidor está ejecutándose en `http://localhost:3000`
- ✅ Acceso al Dashboard de Partners

---

## 🚀 Flujo de Prueba Completo

### **PASO 1: Ver Estado Inicial del Dashboard**

1. **Inicia sesión** como Acme Corp
2. **Ve al Dashboard**: `/en/partners/portal`
3. **Observa el widget "Achievements"**:
   - Cuenta inicial de logros
   - Tier actual (probablemente Bronze)
   - Puntos totales (probablemente 0)

📸 **Captura este estado para comparar luego**

---

### **PASO 2: Registrar Primera Oportunidad Comercial**

**Ubicación**: `/en/partners/portal/deals`

1. **Click en "Register New Deal"**
2. **Completa el formulario**:
   - **Company Name**: `Tech Innovators Inc.`
   - **Company Domain**: `techinnovators.io`
   - **Contact Name**: `John Smith`
   - **Contact Email**: `john@techinnovators.io`
   - **Contact Phone**: `+1-555-123-4567`
   - **Deal Value**: `$50,000`
   - **Currency**: `USD`
   - **Notes**: `Prueba de oportunidad comercial para ganar puntos`

3. **Click en "Register Deal"**

**Espera confirmación** de que la oportunidad fue registrada

⏱️ **Espera ~5 segundos** para que los puntos se procesen en background

**Puntos esperados**:
- ✅ +30 puntos por "First Opportunity" (1ª oportunidad)

---

### **PASO 3: Verificar Puntos en Dashboard**

1. **Ve al Dashboard**: `/en/partners/portal`
2. **Abre el widget "Achievements"**
3. **Verifica**:
   - ✅ Puntos aumentaron (+30)
   - ✅ Aparece el logro "First Opportunity"

📸 **Captura este cambio**

---

### **PASO 4: Registrar 4 Oportunidades Adicionales**

Para desbloquear el logro de "5 Opportunities", necesitas 5 oportunidades totales. Ya registraste 1, así que registra 4 más:

**Repite el PASO 2 cuatro veces** con estos datos:

**Oportunidad 2**:
- Company: `Digital Solutions Ltd.`
- Domain: `digitalsolutions.uk`
- Value: `$75,000`

**Oportunidad 3**:
- Company: `Cloud Ventures Co.`
- Domain: `cloudventures.com`
- Value: `$120,000`

**Oportunidad 4**:
- Company: `Data Analytics Pro`
- Domain: `dataanalytics.pro`
- Value: `$45,000`

**Oportunidad 5**:
- Company: `Enterprise Systems`
- Domain: `enterprisesys.io`
- Value: `$200,000`

⏱️ **Después de la 5ª oportunidad, espera ~5 segundos**

**Puntos esperados después del paso 4**:
- ✅ +30 × 5 = 150 puntos por las 5 oportunidades
- ✅ +50 puntos adicionales por el logro "5 Opportunities"
- **Total**: 200 puntos

---

### **PASO 5: Ir al Centro de Entrenamiento**

**Ubicación**: `/en/partners/portal/training-center`

1. **Explora los cursos disponibles**
2. **Selecciona un curso** (ej. "Introduction to SovraGov")
3. **Click en "Start Course"**

---

### **PASO 6: Completar un Módulo de Entrenamiento**

1. **Lee el contenido** del módulo
2. **Click en "Take Quiz"**
3. **Contesta las preguntas**:
   - Intenta **responder correctamente** para pasar el quiz (mínimo 70% típicamente)
   - Las respuestas correctas están generalmente en el contenido del módulo

4. **Submit Quiz**

⏱️ **Espera ~3-5 segundos** para que se procese

**Puntos esperados**:
- ✅ +20 puntos por "Training Module Complete"
- ✅ Mejora en rating (engagement)

---

### **PASO 7: Verificar Progreso Actualizado**

1. **Ve a Rewards**: `/en/partners/portal/rewards`
2. **Observa la sección "Cómo Ganar Puntos"** (nueva sección explicativa)
3. **Verifica en Tier Roadmap**:
   - ✅ Tus logros están listados
   - ✅ Puntos totales actualizados
   - ✅ Progreso hacia el siguiente tier visible

---

### **PASO 8: Monitorear Rating y Tier**

**En el Sidebar**:
- Observa que el badge de tier puede cambiar si el rating mejora

**En el Dashboard** (`/en/partners/portal`):
- Verifica el "Partner Rating" aumentó
- Verifica los "Pending Commissions" si hay deals ganados

---

## 📊 Puntos y Logros Esperados

### **Después de Completar Todos los Pasos**:

| Acción | Puntos | Logro |
|--------|--------|-------|
| 1ª Oportunidad | +30 | First Opportunity ✅ |
| 4 Oportunidades Más | +120 | (acumulativo) |
| 5ª Oportunidad Bonus | +50 | Five Opportunities ✅ |
| 1 Módulo de Entrenamiento | +20 | Training Module Complete ✅ |
| **TOTAL** | **220** | **3 logros desbloqueados** |

### **Rating Impacto**:
- Engagement factor: +10 (training module)
- Opportunity registrations pueden afectar deal quality factor
- **Tier Goal**: Si el rating llega a 50+, podrías calificar para Silver si tienes 1ª certificación

---

## 🎯 Puntos de Verificación Clave

**En cada paso, verifica**:

1. ✅ **Los puntos se actualizan** en el widget del Dashboard
2. ✅ **Los logros aparecen** en la página de Rewards
3. ✅ **Las cards de logros** muestran el estado "Earned" (azul) vs "Unearned" (gris)
4. ✅ **La barra de progreso** hacia el siguiente tier avanza
5. ✅ **El TierRoadmap** muestra los requisitos claros

---

## 🔍 Testing Adicional (Opcional)

### **Test: Cerrar un Deal como Ganado**

1. **Ve a Deals**: `/en/partners/portal/deals`
2. **Selecciona una de las oportunidades registradas**
3. **Cambiar status a "Closed Won"**

**Puntos esperados**:
- ✅ +100 puntos por "First Deal Won"
- ✅ +10 puntos al rating (deal quality factor)

### **Test: Revisar Historial de Cambios de Tier**

1. **Ve a Rewards**: `/en/partners/portal/rewards`
2. **Busca "Tier History"** (si está disponible)
3. Verifica que se registran los cambios de tier

---

## 🐛 Troubleshooting

### **Los puntos no se actualizan**
- **Causa**: El evento puede tardar 3-5 segundos en procesarse en background
- **Solución**: Espera 5 segundos, luego **recarga la página** (F5)

### **El logro no aparece después de registrar oportunidad**
- **Causa**: Podría ser una oportunidad en estado "draft"
- **Solución**: Asegúrate de hacer click en "Submit" o "Save"

### **El rating no sube después de completar training**
- **Causa**: El rating se recalcula en background cada 24 horas o tras múltiples eventos
- **Solución**: Completa más módulos o realiza más actividades

### **No puedo pasar el quiz de entrenamiento**
- **Causa**: Las respuestas pueden requerir lectura cuidadosa del contenido
- **Solución**: Lee el módulo completamente antes de intentar el quiz
- **Alternativa**: Si es muy difícil, crea datos de prueba directamente con API calls

---

## 📈 Datos Esperados Post-Prueba

**Acme Corp después de completar todo**:
- ✅ 5 oportunidades comerciales registradas
- ✅ 1-2 módulos de entrenamiento completados
- ✅ ~220 puntos ganados
- ✅ 3-4 logros desbloqueados
- ✅ Rating mejorado (visible en dashboard)
- ✅ Progreso visible hacia Silver tier

---

## 💡 Notas Importantes

1. **Los datos persisten**: Todo lo que registres se guarda en Redis
2. **Actualizaciones en tiempo real**: Los puntos se reflejan en el dashboard en 5 segundos aproximadamente
3. **El TierRoadmap es visual**: Muestra claramente dónde estás y qué necesitas para subir
4. **La sección "Cómo Ganar Puntos"** es nueva y explica gráficamente todas las formas de ganar puntos

---

## 🎬 Flujo Visual Resumido

```
Dashboard (ver puntos iniciales)
    ↓
Registrar Oportunidad 1 (+30 pts, logro desbloqueado)
    ↓
Dashboard (verifica puntos +30)
    ↓
Registrar Oportunidades 2-5 (+20 × 4 = +80 pts)
    ↓
Oportunidad 5 completa (+50 pts bonus)
    ↓
Dashboard (verifica total 160 pts, 2 logros)
    ↓
Ir a Training Center
    ↓
Completar Módulo (+20 pts, 1 logro)
    ↓
Dashboard (verifica total 180 pts, 3 logros)
    ↓
Ir a Rewards Page
    ↓
Ver "Cómo Ganar Puntos" (explicación visual)
    ↓
Ver TierRoadmap actualizado
    ↓
Ver todas las cards de logros con estados
```

---

**¡Listo! Sigue estos pasos y verás en tiempo real cómo Acme Corp gana puntos y desbloquea logros.** 🎉


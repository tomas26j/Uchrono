# Uchrono — Design System

## Identidad

Calculadora de inversiones contrafáctica. Herramienta educativa con datos mock.
Estética: editorial cálida, papel crema en light / pizarrón oscuro en dark.
Personalidad: analítica pero accesible. Sin gamificación.

---

## Tokens de color (globals.css → tailwind.config.js)

### Superficies

| Token Tailwind | Variable CSS        | Light hex | Dark hex  | Uso                        |
|----------------|---------------------|-----------|-----------|----------------------------|
| `background`   | `--surface-base`    | `#FDFCFA` | `#12110F` | Fondo de página            |
| `card`         | `--surface-raised`  | `#FFFFFF` | `#1A1916` | Tarjetas, paneles          |
| `popover`      | `--surface-raised`  | `#FFFFFF` | `#1A1916` | Popovers (igual que card)  |
| `secondary`    | `--surface-sunken`  | `#F4F2ED` | `#0C0B0A` | Fondos hundidos, separadores |
| `muted`        | `--surface-sunken`  | `#F4F2ED` | `#0C0B0A` | Chips, badges muted        |

### Texto

| Token Tailwind     | Variable CSS         | Uso                          |
|--------------------|----------------------|------------------------------|
| `foreground`       | `--ink-primary`      | Texto principal              |
| `muted-foreground` | `--ink-secondary`    | Labels, texto secundario     |
| (sin token)        | `--ink-muted`        | Placeholders (`var` directo) |

### Acento y semánticos

| Token Tailwind       | Variable CSS    | Light   | Dark    | Uso                               |
|----------------------|-----------------|---------|---------|-----------------------------------|
| `primary`            | `--accent`      | Teal oscuro `#14615A` | Teal claro `#5BB3A6` | CTAs, links |
| `primary-foreground` | `--accent-ink`  | Blanco  | Dark teal | Texto sobre primary           |
| `ring`               | `--accent`      | Teal    | Teal    | Focus rings                       |
| `gain`               | `--gain`        | Verde   | Verde   | Retornos positivos, ganancias     |
| `loss`               | `--loss`        | Rojo    | Rojo    | Retornos negativos, pérdidas      |
| `destructive`        | `--loss`        | Rojo    | Rojo    | Acciones destructivas (shadcn)    |
| `border`             | `--border-subtle` | Cálido | Oscuro | Bordes de tarjetas               |
| `input`              | `--border-interactive` | Medio | Medio | Bordes de inputs              |

---

## Tipografía

- **Sans display**: DM Sans (`var(--font-dm-sans)`) — texto UI y body
- **Serif**: Fraunces (`var(--font-fraunces)`) — headings editoriales, números grandes
- **Mono**: IBM Plex Mono (`var(--font-ibm-plex-mono)`) — valores numéricos, percentajes

Cargadas con `next/font/google` (self-hosted, sin FOUT).

---

## Modo oscuro

Implementado con `next-themes`. La clase `.dark` en `<html>` activa los valores dark de las variables CSS.

- `storageKey="uchrono-theme"` — persiste en localStorage
- `defaultTheme="light"` — light por defecto
- `enableSystem` — respeta `prefers-color-scheme` en primera visita
- Toggle en Header: `Sun` ↔ `Moon` de lucide-react, con placeholder de tamaño fijo para evitar layout shift en SSR

---

## Bordes y radios

| Token        | Valor  | Dónde         |
|--------------|--------|---------------|
| `rounded-sm` | 6px    | Chips, badges |
| `rounded-md` | 10px   | Inputs        |
| `rounded-lg` | 14px   | Cards base    |
| `rounded-xl` | ~16px  | Paneles       |
| `rounded-2xl`| ~20px  | Cards grandes |

---

## Animaciones

- `animate-in fade-in slide-in-from-bottom-4 duration-300` — entrada del results card (via `tailwindcss-animate`)
- `animate-spin` — spinner `Loader2` durante loading
- `active:scale-[0.98]` — press feedback en todos los botones

Todas respetan `@media (prefers-reduced-motion: reduce)`.

---

## Patrones de componente

### Focus
```
focus:outline-none focus:ring-2 focus:ring-ring
```
El global `:focus-visible` usa `outline: 2px solid hsl(var(--accent))` como fallback.

### Placeholder
```
placeholder:text-muted-foreground
```

### Botón deshabilitado
```
disabled:opacity-50 disabled:cursor-not-allowed
```

### Loading / vacío / datos (patrón ternario)
```jsx
{loading ? <Loader2 .../> : data.length === 0 ? <EmptyState /> : data.map(...)}
```

### Valores positivos / negativos
- `text-gain` para retornos positivos y porcentajes +
- `text-loss` para retornos negativos y porcentajes -
- `text-muted-foreground` para neutro / sin cambio

---

## Convenciones

- Nunca usar colores Tailwind hardcodeados — siempre tokens semánticos.
- `cn()` de `@/lib/utils` para merges condicionales.
- Iconos: exclusivamente `lucide-react`.
- `AdvancedCalculator` requiere `dynamic(() => import(...), { ssr: false })` — usa `html2canvas`, `jsPDF` y `Chart.js` que no soportan SSR.
- PostHog analytics: pendiente de migrar a `next/script` con `strategy="afterInteractive"`.

---

## Deployment

Netlify static export. `next.config.js`:
```js
output: 'export', trailingSlash: true, images: { unoptimized: true }
```
Build command: `yarn build` → genera `/out`.

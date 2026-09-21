# Uchrono

Calculadora de inversiones contrafáctica: ¿qué hubiera pasado si hubieras comprado Bitcoin en 2020? ¿Y si hubieras elegido oro en vez de acciones tecnológicas?

Herramienta educativa con datos mock. No usa datos reales de mercado ni requiere cuenta de usuario.

**Deploy:** [Netlify — static export](https://uchrono.netlify.app)

---

## Características

### Calculadora principal
Seleccioná un activo, una fecha de compra y una de venta. La app calcula el retorno total, el retorno anualizado y los compara con benchmarks alternativos.

### Leaderboard
Ranking de activos por rendimiento en un período dado, con métricas comparativas.

### Calculadora avanzada
Escenarios más complejos: DCA (Dollar-Cost Averaging), comparativa multi-activo, proyecciones. Incluye exportación del análisis a PDF.

### Dark / Light mode
Toggle persistente en el header (via `next-themes`).

---

## Stack

| Capa            | Tecnologías                                               |
|-----------------|-----------------------------------------------------------|
| Framework       | Next.js 15 (App Router, static export)                    |
| Runtime         | React 19                                                  |
| UI / estilos    | Tailwind CSS, shadcn/ui (Radix UI), Lucide React          |
| Gráficos        | Chart.js + react-chartjs-2                                |
| PDF export      | html2canvas + jsPDF                                       |
| Tema            | next-themes                                               |
| Fuentes         | DM Sans, Fraunces, IBM Plex Mono (next/font/google)       |
| Hosting         | Netlify (output: 'export')                                |

> Los datos son completamente ficticios y tienen propósito exclusivamente educativo.

---

## Arrancar localmente

```bash
cd frontend
yarn install
yarn dev   # http://localhost:3000
```

---

## Deploy

Netlify detecta el `netlify.toml` en la raíz. Build: `yarn build` desde `frontend/`. Output: `out/`.

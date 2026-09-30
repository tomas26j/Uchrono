# Uchrono

Calculadora de inversiones contrafáctica: ¿qué hubiera pasado si hubieras comprado Bitcoin en 2020? ¿Y si hubieras elegido oro en vez de acciones tecnológicas?

Herramienta educativa con precios históricos reales. No requiere cuenta de usuario ni backend.

**Deploy:** [uchronia.netlify.app](https://uchronia.netlify.app)

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
| Datos           | JSON estáticos versionados, generados en CI               |
| Hosting         | Netlify (output: 'export')                                |

> Los precios son históricos y reales. La herramienta es educativa: **no es asesoramiento
> financiero**, y el rendimiento pasado no predice el futuro.

---

## Datos de mercado

Los precios salen de JSON estáticos en `frontend/public/data/`, uno por activo,
generados por `scripts/fetch-market-data.mjs` y **versionados en el repo**.

**El navegador no llama a ninguna API externa.** No hay claves que exponer, no
hay límites de uso que agotar, y la carga es un solo fetch a un archivo que
Netlify sirve comprimido desde su CDN.

### Cómo se actualizan

Un workflow de GitHub Actions corre todos los días a las 06:30 UTC, baja las
series, las valida y commitea solo si cambiaron. El push dispara el deploy de
Netlify. Para una calculadora contrafáctica el cierre del día alcanza de sobra.

```bash
cd frontend
npm run data:update          # descargar + verificar
npm run data:fetch -- --only bitcoin,tesla
npm run data:verify          # solo control de calidad
```

### Fuentes

Cada activo declara una cadena de fuentes; se usa la primera que responda.

| Fuente | Clave | Rol |
|---|---|---|
| Yahoo Finance (`chart`) | No | Principal. Acciones, cripto, oro e índices. `adjclose` para acciones, que corrige splits y dividendos |
| Binance (`klines`) | No | Respaldo de cripto. Su historia arranca en 2017 |
| FRED (CSV) | No | Respaldo del S&P 500 |
| Blockchain.com | No | Extiende Bitcoin hasta 2010, que es donde Yahoo no llega |

Yahoo no es una API oficial y puede cambiar sin aviso; por eso hay respaldos y
por eso los JSON se versionan.

### Qué pasa si una fuente falla

Nada visible. Si ninguna fuente responde para un activo, el JSON que ya estaba
en el repo queda intacto y la app sigue sirviendo los últimos datos buenos. Los
datos nuevos se **mergean** sobre los viejos por fecha, así que un punto que una
fuente dejó de dar nunca se pierde.

`scripts/verify-market-data.mjs` corre antes del commit y frena series vacías,
precios no positivos, fechas duplicadas o desordenadas y datos con más de 7 días
de atraso. Avisa —sin frenar— ante saltos diarios grandes, que suelen delatar un
split mal ajustado.

Para probar la cadena de respaldo sin esperar a que algo se caiga de verdad:

```bash
UCHRONO_SKIP_SOURCES=yahoo npm run data:fetch
```

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

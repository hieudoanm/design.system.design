import type { Topic } from './index';

/*
 * Scientific chart drawings: each chart is generated from a single data array
 * so the SVG and its data table can never drift apart. Colors use the
 * categorical chart tokens in fixed order.
 */

const CAT = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

const svg = (title: string, id: string, body: string, viewBox = '0 0 520 280') =>
  [
    `<svg viewBox='${viewBox}' width='100%' role='img' aria-labelledby='${id}' xmlns='http://www.w3.org/2000/svg'>`,
    `<title id='${id}'>${title}</title>`,
    body,
    `</svg>`,
  ].join('\n');

/* --- shared helpers ------------------------------------------------------ */

const grid = (ticks: number[], toY: (v: number) => number, unit = '') =>
  [
    `<g stroke='var(--color-rule)' stroke-width='1' fill='none'>`,
    ticks.map((t) => `<line x1='60' y1='${toY(t)}' x2='460' y2='${toY(t)}' />`).join(''),
    `</g>`,
    `<g font-size='11' fill='var(--color-mute)' text-anchor='end'>`,
    ticks.map((t) => `<text x='52' y='${toY(t) + 4}'>${t}${unit}</text>`).join(''),
    `</g>`,
  ].join('');

const axes = [
  `<line x1='60' y1='20' x2='60' y2='240' stroke='var(--color-rule)' stroke-width='1' />`,
  `<line x1='60' y1='240' x2='460' y2='240' stroke='var(--color-ink)' stroke-opacity='0.45' stroke-width='1' />`,
].join('');

const xLabels = (labels: string[], xs: number[]) =>
  [
    `<g font-size='11' fill='var(--color-mute)' text-anchor='middle'>`,
    labels.map((l, i) => `<text x='${xs[i]}' y='258'>${l}</text>`).join(''),
    `</g>`,
  ].join('');

/* ============================================================
 * 1. BOX PLOT
 * ============================================================ */

const boxData = [
  { label: 'Control', q1: 12, median: 18, q3: 24, min: 6, max: 30, outliers: [3, 34] },
  { label: 'Treatment A', q1: 16, median: 22, q3: 28, min: 10, max: 32, outliers: [] },
  { label: 'Treatment B', q1: 10, median: 15, q3: 22, min: 4, max: 28, outliers: [2, 35] },
  { label: 'Treatment C', q1: 14, median: 20, q3: 26, min: 8, max: 30, outliers: [] },
];

const boxX = (i: number) => 90 + i * 95;
const boxY = (v: number) => 240 - v * 5;

const boxPlot = svg(
  'Box plots comparing four groups: quartiles, median, whiskers, and outliers',
  'box-plot',
  [
    grid([0, 10, 20, 30, 40], boxY),
    axes,
    xLabels(
      boxData.map((d) => d.label),
      boxData.map((_, i) => boxX(i)),
    ),
    boxData
      .map((d, i) => {
        const x = boxX(i);
        const w = 30;
        const whiskerTop = boxY(d.max);
        const whiskerBottom = boxY(d.min);
        const q1y = boxY(d.q1);
        const q3y = boxY(d.q3);
        const medianY = boxY(d.median);
        const color = CAT[i];
        const outliers = d.outliers
          .map((o) => `<circle cx='${x + w / 2}' cy='${boxY(o)}' r='3' fill='${color}' />`)
          .join('');
        return [
          `<g stroke='${color}' stroke-width='1.5'>`,
          `<line x1='${x + w / 2}' y1='${whiskerTop}' x2='${x + w / 2}' y2='${q3y}' />`,
          `<line x1='${x + w / 2}' y1='${whiskerBottom}' x2='${x + w / 2}' y2='${q1y}' />`,
          `<line x1='${x}' y1='${whiskerTop}' x2='${x + w}' y2='${whiskerTop}' />`,
          `<line x1='${x}' y1='${whiskerBottom}' x2='${x + w}' y2='${whiskerBottom}' />`,
          `<rect x='${x}' y='${q1y}' width='${w}' height='${q3y - q1y}' fill='${color}' fill-opacity='0.3' />`,
          `<line x1='${x}' y1='${medianY}' x2='${x + w}' y2='${medianY}' stroke-width='2' />`,
          `</g>`,
          outliers,
        ].join('\n');
      })
      .join('\n'),
  ].join('\n'),
);

const boxTable = {
  columns: ['Group', 'Min', 'Q1', 'Median', 'Q3', 'Max', 'Outliers'],
  rows: boxData.map((d) => [
    d.label,
    String(d.min),
    String(d.q1),
    String(d.median),
    String(d.q3),
    String(d.max),
    d.outliers.length ? d.outliers.join(', ') : '—',
  ]),
};

/* ============================================================
 * 2. VIOLIN PLOT
 * ============================================================ */

const violinData = [
  { label: 'Control', density: [2, 4, 8, 14, 20, 24, 26, 24, 20, 14, 8, 4, 2] },
  { label: 'Treatment A', density: [1, 3, 7, 12, 18, 24, 28, 24, 18, 12, 7, 3, 1] },
  { label: 'Treatment B', density: [3, 6, 10, 15, 18, 20, 20, 20, 18, 15, 10, 6, 3] },
  { label: 'Treatment C', density: [2, 5, 9, 14, 19, 23, 25, 23, 19, 14, 9, 5, 2] },
];

const violinX = (i: number) => 90 + i * 95;

const violinPlot = svg(
  'Violin plots: kernel density estimation mirrored for each group',
  'violin-plot',
  [
    grid([0, 10, 20, 30, 40], (v) => 240 - v * 5),
    axes,
    xLabels(
      violinData.map((d) => d.label),
      violinData.map((_, i) => violinX(i)),
    ),
    violinData
      .map((d, i) => {
        const x = violinX(i);
        const maxDensity = Math.max(...d.density);
        const scale = 25 / maxDensity;
        const left = d.density.map((v, j) => `${x + 15 - v * scale},${240 - j * 17}`).join(' L');
        const right = d.density
          .map((v, j) => `${x + 15 + v * scale},${240 - j * 17}`)
          .reverse()
          .join(' L');
        const color = CAT[i];
        return [
          `<path d='M${x + 15},240 L${left} L${right} Z' fill='${color}' fill-opacity='0.35' stroke='${color}' stroke-width='1.5' />`,
          `<line x1='${x}' y1='${240 - 10 * 17}' x2='${x + 30}' y2='${240 - 10 * 17}' stroke='${color}' stroke-width='2' />`,
          `<circle cx='${x + 15}' cy='${240 - 10 * 17}' r='3' fill='${color}' />`,
        ].join('\n');
      })
      .join('\n'),
  ].join('\n'),
);

const violinTable = {
  columns: ['Group', 'N', 'Mean', 'SD', 'Skewness'],
  rows: [
    ['Control', '100', '18.2', '5.1', '0.12'],
    ['Treatment A', '100', '21.8', '4.8', '-0.05'],
    ['Treatment B', '100', '15.4', '6.2', '0.34'],
    ['Treatment C', '100', '19.6', '4.9', '-0.08'],
  ],
};

/* ============================================================
 * 3. HISTOGRAM
 * ============================================================ */

const histValues = [
  12, 14, 15, 15, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20,
  20, 20, 21, 21, 21, 21, 22, 22, 22, 23, 23, 24,
];

const binWidth = 1;
const bins = new Map<number, number>();
for (const v of histValues) {
  const bin = Math.floor(v / binWidth) * binWidth;
  bins.set(bin, (bins.get(bin) || 0) + 1);
}
const binArray = Array.from(bins.entries()).sort((a, b) => a[0] - b[0]);
const maxCount = Math.max(...binArray.map(([, c]) => c));

const histX = (i: number) => 80 + i * 35;
const histY = (count: number) => 240 - (count / maxCount) * 180;

const histogram = svg(
  'Histogram of 38 observations with 1-unit bins, showing approximate normal distribution',
  'histogram',
  [
    grid([0, 5, 10, 15, 20], (v) => 240 - (v / maxCount) * 180),
    axes,
    xLabels(
      binArray.map(([b]) => String(b)),
      binArray.map((_, i) => histX(i)),
    ),
    binArray
      .map(([, count], i) => {
        const x = histX(i);
        const y = histY(count);
        const h = 240 - y;
        return `<rect x='${x}' y='${y}' width='30' height='${h}' rx='1' fill='${CAT[0]}' fill-opacity='0.85' stroke='${CAT[0]}' stroke-width='1' />`;
      })
      .join('\n'),
    `<g font-size='10' fill='var(--color-ink)' text-anchor='middle'>`,
    binArray
      .map(([, count], i) => {
        if (count === 0) return '';
        const x = histX(i) + 15;
        const y = histY(count) - 4;
        return `<text x='${x}' y='${y}'>${count}</text>`;
      })
      .join(''),
    `</g>`,
  ].join('\n'),
);

const histTable = {
  columns: ['Bin', 'Count', 'Density', 'Cumulative %'],
  rows: (() => {
    let cum = 0;
    return binArray.map(([bin, count]) => {
      cum += count;
      return [
        String(bin),
        String(count),
        (count / histValues.length).toFixed(3),
        `${((cum / histValues.length) * 100).toFixed(1)}%`,
      ];
    });
  })(),
};

/* ============================================================
 * 4. DENSITY (KDE) PLOT
 * ============================================================ */

const kdeData = [
  { x: 10, y: 0.02 },
  { x: 12, y: 0.05 },
  { x: 14, y: 0.11 },
  { x: 16, y: 0.22 },
  { x: 18, y: 0.35 },
  { x: 20, y: 0.48 },
  { x: 22, y: 0.52 },
  { x: 24, y: 0.45 },
  { x: 26, y: 0.32 },
  { x: 28, y: 0.18 },
  { x: 30, y: 0.08 },
  { x: 32, y: 0.03 },
];

const kdeX = (v: number) => 60 + ((v - 10) / 22) * 400;
const kdeY = (v: number) => 240 - v * 400;

const densityPlot = svg(
  'Kernel density estimate (Gaussian kernel, bandwidth=1.5) with rug plot',
  'kde-plot',
  [
    grid([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6], kdeY, ''),
    axes,
    xLabels(['10', '14', '18', '22', '26', '30', '34'], [10, 14, 18, 22, 26, 30, 34].map(kdeX)),
    `<path d='M${kdeData
      .map((p) => `${kdeX(p.x)},${kdeY(p.y)}`)
      .join(' L')}' fill='none' stroke='${CAT[0]}' stroke-width='2.5' />`,
    `<path d='M${kdeX(10)},240 L${kdeData
      .map((p) => `${kdeX(p.x)},${kdeY(p.y)}`)
      .join(' L')} L${kdeX(32)},240 Z' fill='${CAT[0]}' fill-opacity='0.15' />`,
    kdeData
      .filter((_, i) => i % 2 === 0)
      .map(
        (p) =>
          `<line x1='${kdeX(p.x)}' y1='240' x2='${kdeX(p.x)}' y2='246' stroke='var(--color-mute)' stroke-width='1' />`,
      )
      .join(''),
    `<text x='460' y='${kdeY(0.52) + 4}' font-size='12' font-weight='600' fill='${CAT[0]}'>Density</text>`,
    `<text x='260' y='272' font-size='11' fill='var(--color-mute)'>Value</text>`,
  ].join('\n'),
);

const kdeTable = {
  columns: ['Statistic', 'Value'],
  rows: [
    ['N', '38'],
    ['Bandwidth (Silverman)', '1.5'],
    ['Kernel', 'Gaussian'],
    ['Mean', '19.4'],
    ['Std Dev', '3.2'],
    ['Skewness', '0.15'],
    ['Kurtosis', '-0.22'],
  ],
};

/* ============================================================
 * 5. Q-Q PLOT
 * ============================================================ */

const qqData = [
  { theoretical: -2.0, sample: -2.1 },
  { theoretical: -1.5, sample: -1.6 },
  { theoretical: -1.0, sample: -1.1 },
  { theoretical: -0.5, sample: -0.4 },
  { theoretical: 0.0, sample: 0.1 },
  { theoretical: 0.5, sample: 0.6 },
  { theoretical: 1.0, sample: 1.2 },
  { theoretical: 1.5, sample: 1.4 },
  { theoretical: 2.0, sample: 2.1 },
];

const qqMin = -2.5;
const qqMax = 2.5;
const qqX = (v: number) => 60 + ((v - qqMin) / (qqMax - qqMin)) * 360;
const qqY = (v: number) => 240 - ((v - qqMin) / (qqMax - qqMin)) * 220;

const qqPlot = svg(
  'Q-Q plot: sample quantiles vs. theoretical normal quantiles. Points on the diagonal indicate normality.',
  'qq-plot',
  [
    `<g stroke='var(--color-rule)' stroke-width='1' fill='none'>`,
    `<line x1='60' y1='20' x2='420' y2='240' />`,
    `</g>`,
    axes,
    xLabels(
      ['-2.5', '-1.5', '-0.5', '0.5', '1.5', '2.5'],
      [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map(qqX),
    ),
    qqData
      .map(
        (p) => `<circle cx='${qqX(p.theoretical)}' cy='${qqY(p.sample)}' r='4' fill='${CAT[0]}' />`,
      )
      .join(''),
    `<text x='60' y='20' font-size='11' fill='var(--color-mute)'>Sample quantiles</text>`,
    `<text x='420' y='260' font-size='11' fill='var(--color-mute)'>Theoretical quantiles</text>`,
    `<text x='430' y='${qqY(2) + 4}' font-size='12' font-weight='600' fill='${CAT[0]}'>y = x</text>`,
  ].join('\n'),
);

const qqTable = {
  columns: ['Theoretical', 'Sample', 'Deviation'],
  rows: qqData.map((p) => [
    p.theoretical.toFixed(1),
    p.sample.toFixed(1),
    (p.sample - p.theoretical).toFixed(2),
  ]),
};

/* ============================================================
 * 6. CORRELATION MATRIX HEATMAP
 * ============================================================ */

const corrLabels = ['Revenue', 'Users', 'Sessions', 'Bounce', 'Conv. Rate', 'Avg. Order'];
const corrMatrix = [
  [1.0, 0.87, 0.91, -0.62, 0.73, 0.45],
  [0.87, 1.0, 0.95, -0.58, 0.69, 0.38],
  [0.91, 0.95, 1.0, -0.65, 0.71, 0.42],
  [-0.62, -0.58, -0.65, 1.0, -0.54, -0.31],
  [0.73, 0.69, 0.71, -0.54, 1.0, 0.56],
  [0.45, 0.38, 0.42, -0.31, 0.56, 1.0],
];

const cellSize = 60;
const heatX = (j: number) => 60 + j * cellSize + cellSize / 2;
const heatY = (i: number) => 40 + i * cellSize + cellSize / 2;

const heatmap = svg(
  'Correlation matrix heatmap: six business metrics. Blue = positive, red = negative, intensity = strength.',
  'heatmap',
  [
    `<defs>`,
    `<linearGradient id='corrGrad' x1='0%' y1='0%' x2='100%' y2='0%'>`,
    `<stop offset='0%' stop-color='var(--color-chart-2)' />`,
    `<stop offset='50%' stop-color='var(--color-paper)' />`,
    `<stop offset='100%' stop-color='var(--color-chart-1)' />`,
    `</linearGradient>`,
    `</defs>`,
    corrMatrix
      .map((row, i) =>
        row.map((v, j) => {
          const intensity = Math.abs(v);
          const color = v >= 0 ? CAT[0] : CAT[1];
          return `<rect x='${60 + j * cellSize}' y='${40 + i * cellSize}' width='${cellSize}' height='${cellSize}' fill='${color}' fill-opacity='${0.15 + intensity * 0.7}' stroke='var(--color-rule)' stroke-width='0.5' />`;
        }),
      )
      .join(''),
    corrMatrix
      .map((row, i) =>
        row
          .map(
            (v, j) =>
              `<text x='${heatX(j)}' y='${heatY(i)}' font-size='12' font-weight='600' fill='var(--color-ink)' text-anchor='middle' dominant-baseline='middle'>${v.toFixed(2)}</text>`,
          )
          .join(''),
      )
      .join(''),
    `<g font-size='11' fill='var(--color-ink)' text-anchor='end'>`,
    corrLabels.map((l, i) => `<text x='52' y='${heatY(i)}'>${l}</text>`).join(''),
    `</g>`,
    `<g font-size='11' fill='var(--color-ink)' text-anchor='middle'>`,
    corrLabels.map((l, j) => `<text x='${heatX(j)}' y='30'>${l}</text>`).join(''),
    `</g>`,
    `<g font-size='10' fill='var(--color-mute)'>`,
    `<text x='300' y='420'>Blue = positive correlation | Red = negative correlation | Intensity = strength</text>`,
    `</g>`,
  ].join('\n'),
  '0 0 520 440',
);

const corrTable = {
  columns: ['', ...corrLabels],
  rows: corrMatrix.map((row, i) => [corrLabels[i], ...row.map((v) => v.toFixed(2))]),
};

/* ============================================================
 * EXPORT
 * ============================================================ */

export const scientificCharts: Topic = {
  slug: 'scientific-charts',
  title: 'Scientific charts',
  tagline:
    'Statistical graphics for exploration and communication: box, violin, histogram, density, Q-Q, and correlation heatmap.',
  summary:
    'Scientific charts answer different questions than business charts: they show distributions, compare groups, check assumptions, and reveal structure in data. Each chart type here is a component built from the same chart primitives (frame, axes, marks, tooltip, data table) with statistical semantics baked in.',
  sections: [
    {
      id: 'choosing',
      title: 'Choosing the right scientific chart',
      intro: 'Match the chart to the statistical question.',
      items: [
        {
          title: 'Compare distributions across groups',
          body: 'Box plot for summary (median, quartiles, outliers). Violin plot for full density shape. Use both together when sample sizes differ.',
        },
        {
          title: "Show one distribution's shape",
          body: 'Histogram for binned counts (good for sample size context). Density/KDE for smooth shape (good for comparing to theoretical distributions).',
        },
        {
          title: 'Check normality assumption',
          body: 'Q-Q plot is the gold standard. Histogram/KDE with overlaid normal curve is a supplement. Shapiro-Wilk test is the numeric companion.',
        },
        {
          title: 'Explore multivariate relationships',
          body: 'Correlation heatmap for pairwise linear relationships. Pair plots (scatter matrix) for non-linear patterns. PCA biplot for dimensionality.',
        },
      ],
      rules: [
        'Box plot: n < 20 per group → show raw points instead.',
        'Violin plot: always show median and quartile lines inside.',
        'Histogram: bin width via Freedman-Diaconis or Sturges, not arbitrary.',
        'Density plot: always state kernel and bandwidth.',
        'Q-Q plot: label axes "Theoretical quantiles" vs "Sample quantiles".',
        'Heatmap: diverging palette centered at zero, annotate every cell.',
      ],
    },
    {
      id: 'box-plot',
      title: 'Box plot (Box-and-whisker)',
      intro: 'Five-number summary per group: min, Q1, median, Q3, max. Outliers beyond 1.5×IQR.',
      visuals: [
        {
          title: 'Box plot — four treatment groups',
          caption:
            'Each box spans Q1 to Q3 with median line. Whiskers extend to 1.5×IQR. Dots beyond are outliers. Treatment B shows the widest spread and two low outliers.',
          svg: boxPlot,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: boxTable,
        },
      ],
      code: {
        label: 'components/charts/BoxPlot.tsx',
        source: `interface BoxPlotData {
  label: string;
  min: number; q1: number; median: number; q3: number; max: number;
  outliers: number[];
}

export function BoxPlot({ data, yDomain }: { data: BoxPlotData[]; yDomain: [number, number] }) {
  const [yMin, yMax] = yDomain;
  const y = d3.scaleLinear().domain([yMin, yMax]).range([height, 0]);

  return (
    <ChartFrame title="Group comparison" summary={...}>
      <svg viewBox={...}>
        {data.map((d, i) => {
          const x = xScale(i);
          return (
            <g key={d.label}>
              <line x1={x} y1={y(d.max)} x2={x} y2={y(d.q3)} />
              <line x1={x} y1={y(d.min)} x2={x} y2={y(d.q1)} />
              <rect x={x - w/2} y={y(d.q1)} width={w} height={y(d.q1) - y(d.q3)} fill={color(i)} fillOpacity={0.3} />
              <line x1={x - w/2} y1={y(d.median)} x2={x + w/2} y2={y(d.median)} strokeWidth={2} />
              {d.outliers.map(o => <circle key={o} cx={x} cy={y(o)} r={3} fill={color(i)} />)}
            </g>
          );
        })}
      </svg>
      <DataTable data={data} />
    </ChartFrame>
  );
}`,
      },
      rules: [
        'Whiskers = 1.5×IQR (Tukey). Not min/max.',
        'Show outliers as individual points.',
        'Notch = 1.58×IQR/√n for median confidence interval.',
        'Width ∝ √n to show sample size.',
      ],
    },
    {
      id: 'violin-plot',
      title: 'Violin plot',
      intro: 'Mirrored kernel density estimate showing full distribution shape per group.',
      visuals: [
        {
          title: 'Violin plot — four treatment groups',
          caption:
            'Width = kernel density. White dot = median. Horizontal bar = IQR. Treatment B is bimodal (two peaks) — invisible in a box plot.',
          svg: violinPlot,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: violinTable,
        },
      ],
      rules: [
        'Always overlay box plot summary (median, IQR) inside the violin.',
        'Scale violins by area (equal area = equal n) or by width (equal max width). Document which.',
        "Bandwidth: Silverman's rule or cross-validation. State it.",
        'Better than box plot for bimodal/multimodal distributions.',
      ],
    },
    {
      id: 'histogram',
      title: 'Histogram',
      intro: 'Binned frequency counts for a single continuous variable.',
      visuals: [
        {
          title: 'Histogram — 38 observations',
          caption:
            '1-unit bins. Approximately normal shape centered at 19. Bin heights sum to N=38. Always show count labels on bars.',
          svg: histogram,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: histTable,
        },
      ],
      rules: [
        'Bin width via Freedman-Diaconis: 2×IQR×n^(-1/3). Not "10 bins".',
        'Label every bar with count. Density axis optional (for PDF overlay).',
        'Zero baseline mandatory. No truncated Y.',
        'For small n (<30), consider dot plot or strip plot instead.',
      ],
    },
    {
      id: 'density',
      title: 'Density (KDE) plot',
      intro: 'Smoothed probability density function. Kernel choice and bandwidth matter.',
      visuals: [
        {
          title: 'Kernel density estimate with rug plot',
          caption:
            'Gaussian kernel, bandwidth 1.5 (Silverman). Rug ticks at bottom show raw observations. Area under curve = 1. Overlaid normal curve (dashed) for reference.',
          svg: densityPlot,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: kdeTable,
        },
      ],
      rules: [
        'State kernel (Gaussian, Epanechnikov) and bandwidth selection method.',
        'Bandwidth: Silverman, Scott, or cross-validation. Small n → oversmooth.',
        'Rug plot or strip plot underneath shows raw data density.',
        'Overlay theoretical distribution (normal, log-normal) for assumption checking.',
      ],
    },
    {
      id: 'qq-plot',
      title: 'Q-Q plot (Quantile-Quantile)',
      intro: 'Sample quantiles vs. theoretical distribution quantiles. Linearity = good fit.',
      visuals: [
        {
          title: 'Q-Q plot vs. Normal distribution',
          caption:
            'Points close to the diagonal y=x line indicate the sample follows a normal distribution. Systematic S-curve = skewness. Curved ends = heavy/light tails.',
          svg: qqPlot,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: qqTable,
        },
      ],
      rules: [
        'Axes: Theoretical quantiles (x) vs Sample quantiles (y).',
        'Reference line: y=x (not regression line).',
        'Deviations: S-shape = skew. U-shape = heavy tails. Inverted U = light tails.',
        'Supplement with Shapiro-Wilk p-value in caption.',
        'For non-normal theory (exponential, log-normal), change theoretical quantiles.',
      ],
    },
    {
      id: 'correlation-heatmap',
      title: 'Correlation matrix heatmap',
      intro: 'Pairwise Pearson correlations in a diverging color matrix.',
      visuals: [
        {
          title: 'Correlation heatmap — six business metrics',
          caption:
            'Diverging palette: blue (positive) → white (zero) → red (negative). Intensity = |r|. Every cell annotated with r to two decimals. Revenue correlates strongly with Users (0.87) and Sessions (0.91). Bounce rate is negatively correlated with everything.',
          svg: heatmap,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: corrTable,
        },
      ],
      rules: [
        'Diverging palette centered at 0 (white). Blue positive, red negative.',
        'Annotate every cell with correlation coefficient (two decimals).',
        'Cluster variables (hierarchical) to reveal blocks.',
        'Diagonal = 1.00. Mask or gray out.',
        'State correlation type: Pearson (linear), Spearman (rank), Kendall.',
        'Sample size (n) in caption. Small n → spurious correlations.',
      ],
    },
    {
      id: 'accessibility',
      title: 'Accessible scientific charts',
      intro: 'Statistical charts must survive the loss of color and sight.',
      rules: [
        'Box/Violin: distinct pattern fills (stripes, dots) per group, not just hue.',
        'Histogram: bar borders + value labels on every bar.',
        'Density: line style (solid/dashed/dotted) + direct labels on curves.',
        'Q-Q: diagonal reference line always visible, points have shape + color.',
        'Heatmap: annotate every cell. Provide sortable data table.',
        'All charts: data table is the accessible equivalent. Never optional.',
      ],
      code: {
        label: 'components/charts/ScientificChartFrame.tsx',
        source: `export function ScientificChartFrame({
  title,
  summary,
  children,
  table,
  stats,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
  table: React.ReactNode;
  stats?: { label: string; value: string }[];
}) {
  return (
    <figure aria-labelledby={\`\${title}-title\`}>
      <figcaption id={\`\${title}-title\`} className="font-semibold">{title}</figcaption>
      <p className="text-mute text-sm">{summary}</p>
      {stats && (
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm my-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-mute">{s.label}</dt>
              <dd className="font-mono">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div aria-hidden="true">{children}</div>
      <details className="mt-3">
        <summary>View data table</summary>
        {table}
      </details>
    </figure>
  );
}`,
      },
    },
    {
      id: 'implementation',
      title: 'Implementation notes',
      intro: 'Building scientific charts as components.',
      code: {
        label: 'lib/stats.ts',
        source: `// Pure statistical helpers — no rendering, testable in isolation

export function boxPlotStats(values: number[]): BoxStats {
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  return {
    min: sorted[0],
    q1,
    median,
    q3,
    max: sorted[sorted.length - 1],
    iqr,
    lowerFence: q1 - 1.5 * iqr,
    upperFence: q3 + 1.5 * iqr,
    outliers: sorted.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr),
  };
}

export function kde(values: number[], bandwidth: number, grid: number[]): number[] {
  return grid.map(x =>
    values.reduce((sum, v) => sum + gaussianKernel((x - v) / bandwidth), 0) /
    (values.length * bandwidth)
  );
}

function gaussianKernel(u: number): number {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
}

export function qqPlotData(values: number[], theoretical = 'normal'): QQPoint[] {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.map((v, i) => ({
    theoretical: inverseNormalCDF((i + 0.5) / values.length),
    sample: v,
  }));
}`,
      },
      rules: [
        'Statistics first, rendering second. Pure functions in lib/stats.ts.',
        'Components compose ChartFrame + marks + DataTable. No stats logic in components.',
        "Test stats helpers with known datasets (e.g., R's mtcars, iris).",
        'Generate SVG from data arrays — drawing and table share one source.',
      ],
    },
    {
      id: 'checklist',
      title: 'Checklist',
      intro: 'Before shipping a scientific chart component.',
      items: [
        {
          title: 'Statistical correctness',
          body: 'Box whiskers = 1.5×IQR. KDE bandwidth stated. Q-Q theoretical distribution labeled.',
        },
        {
          title: 'Sample size awareness',
          body: 'n < 20: show raw points, not box/violin. n < 30: prefer dot/strip plots.',
        },
        {
          title: 'Accessibility',
          body: 'Patterns + labels, not just color. Data table always present. Summary statistics in caption.',
        },
        {
          title: 'Reproducibility',
          body: 'Random seed fixed for jitter/bootstrap. Bandwidth method cited.',
        },
        {
          title: 'Interactivity',
          body: 'Hover → show exact values. Click → filter linked views. Brush → select subset.',
        },
      ],
    },
  ],
};

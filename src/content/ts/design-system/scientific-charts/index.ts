import type { Topic } from '../index';

/*
 * Scientific chart drawings. They live in ./svg as files and are exposed by
 * the generated module ./svg-generated — run
 * `node scripts/ts/generate-svg.mts scientific-charts` to regenerate it after
 * editing one.
 *
 * The arrays below hold the numbers the drawings show. Each one also builds
 * the table of its chart, so the table and the drawing stay in step. Colours
 * come from the categorical chart tokens, in fixed order.
 */

import { box_plot, density_plot, heatmap, histogram, qq_plot, violin_plot } from './svg-generated';

const componentsChartsBoxPlotTsx = `interface BoxPlotData {
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
}`;

const componentsChartsScientificChartFrameTsx = `export function ScientificChartFrame({
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
}`;

const libStatsTs = `// Pure statistical helpers — no rendering, testable in isolation

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
}`;

/* --- box plot ----------------------------------------------------------- */

const boxData = [
  { label: 'Control', q1: 12, median: 18, q3: 24, min: 6, max: 30, outliers: [3, 34] },
  { label: 'Treatment A', q1: 16, median: 22, q3: 28, min: 10, max: 32, outliers: [] },
  { label: 'Treatment B', q1: 10, median: 15, q3: 22, min: 4, max: 28, outliers: [2, 35] },
  { label: 'Treatment C', q1: 14, median: 20, q3: 26, min: 8, max: 30, outliers: [] },
];

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

/* --- violin plot -------------------------------------------------------- */

const violinTable = {
  columns: ['Group', 'N', 'Mean', 'SD', 'Skewness'],
  rows: [
    ['Control', '100', '18.2', '5.1', '0.12'],
    ['Treatment A', '100', '21.8', '4.8', '-0.05'],
    ['Treatment B', '100', '15.4', '6.2', '0.34'],
    ['Treatment C', '100', '19.6', '4.9', '-0.08'],
  ],
};

/* --- histogram ---------------------------------------------------------- */

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

/* --- density (KDE) plot ------------------------------------------------- */

const kdeTable = {
  columns: ['Statistic', 'Value'],
  rows: [
    ['N', '36'],
    ['Bandwidth (Silverman)', '1.5'],
    ['Kernel', 'Gaussian'],
    ['Mean', '19.4'],
    ['Std Dev', '3.2'],
    ['Skewness', '0.15'],
    ['Kurtosis', '-0.22'],
  ],
};

/* --- Q-Q plot ----------------------------------------------------------- */

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

const qqTable = {
  columns: ['Theoretical', 'Sample', 'Deviation'],
  rows: qqData.map((p) => [
    p.theoretical.toFixed(1),
    p.sample.toFixed(1),
    (p.sample - p.theoretical).toFixed(2),
  ]),
};

/* --- correlation matrix heatmap ----------------------------------------- */

const corrLabels = ['Revenue', 'Users', 'Sessions', 'Bounce', 'Conv. Rate', 'Avg. Order'];
const corrMatrix = [
  [1.0, 0.87, 0.91, -0.62, 0.73, 0.45],
  [0.87, 1.0, 0.95, -0.58, 0.69, 0.38],
  [0.91, 0.95, 1.0, -0.65, 0.71, 0.42],
  [-0.62, -0.58, -0.65, 1.0, -0.54, -0.31],
  [0.73, 0.69, 0.71, -0.54, 1.0, 0.56],
  [0.45, 0.38, 0.42, -0.31, 0.56, 1.0],
];

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
  group: 'data-charts',
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
          svg: box_plot,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: boxTable,
        },
      ],
      code: {
        label: 'components/charts/BoxPlot.tsx',
        source: componentsChartsBoxPlotTsx,
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
          svg: violin_plot,
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
          svg: density_plot,
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
          svg: qq_plot,
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
        source: componentsChartsScientificChartFrameTsx,
      },
    },
    {
      id: 'implementation',
      title: 'Implementation notes',
      intro: 'Building scientific charts as components.',
      code: {
        label: 'lib/stats.ts',
        source: libStatsTs,
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

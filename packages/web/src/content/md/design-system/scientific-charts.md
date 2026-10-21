---
title: Scientific charts
description: Statistical graphics for exploration — box plot, violin plot, histogram, density/KDE, Q-Q plot, correlation heatmap — with statistical correctness, accessibility, and implementation.
tags:
  [
    scientific-charts,
    statistics,
    box-plot,
    violin-plot,
    histogram,
    kde,
    qq-plot,
    heatmap,
    accessibility,
  ]
---

# Scientific charts

Statistical graphics for exploration and communication: box, violin, histogram, density, Q-Q, and correlation heatmap.

Scientific charts answer different questions than business charts: they show distributions, compare groups, check assumptions, and reveal structure in data. Each chart type here is a component built from the same chart primitives (frame, axes, marks, tooltip, data table) with statistical semantics baked in.

## Choosing the right scientific chart

Match the chart to the statistical question.

### Compare distributions across groups

Box plot for summary (median, quartiles, outliers). Violin plot for full density shape. Use both together when sample sizes differ.

### Show one distribution's shape

Histogram for binned counts (good for sample size context). Density/KDE for smooth shape (good for comparing to theoretical distributions).

### Check normality assumption

Q-Q plot is the gold standard. Histogram/KDE with overlaid normal curve is a supplement. Shapiro-Wilk test is the numeric companion.

### Explore multivariate relationships

Correlation heatmap for pairwise linear relationships. Pair plots (scatter matrix) for non-linear patterns. PCA biplot for dimensionality.

**Rules**

- Box plot: n < 20 per group → show raw points instead.
- Violin plot: always show median and quartile lines inside.
- Histogram: bin width via Freedman-Diaconis or Sturges, not arbitrary.
- Density plot: always state kernel and bandwidth.
- Q-Q plot: label axes "Theoretical quantiles" vs "Sample quantiles".
- Heatmap: diverging palette centered at zero, annotate every cell.

## Box plot (Box-and-whisker)

Five-number summary per group: min, Q1, median, Q3, max. Outliers beyond 1.5×IQR.

> [Inline SVG drawing — Box plot — four treatment groups]

| Group       | Min | Q1  | Median | Q3  | Max | Outliers |
| ----------- | --- | --- | ------ | --- | --- | -------- |
| Control     | 6   | 12  | 18     | 24  | 30  | 3, 34    |
| Treatment A | 10  | 16  | 22     | 28  | 32  | —        |
| Treatment B | 4   | 10  | 15     | 22  | 28  | 2, 35    |
| Treatment C | 8   | 14  | 20     | 26  | 30  | —        |

**Code:** components/charts/BoxPlot.tsx

```tsx
interface BoxPlotData {
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
}
```

**Rules**

- Whiskers = 1.5×IQR (Tukey). Not min/max.
- Show outliers as individual points.
- Notch = 1.58×IQR/√n for median confidence interval.
- Width ∝ √n to show sample size.

## Violin plot

Mirrored kernel density estimate showing full distribution shape per group.

> [Inline SVG drawing — Violin plot — four treatment groups]

| Group       | N   | Mean | SD  | Skewness |
| ----------- | --- | ---- | --- | -------- |
| Control     | 100 | 18.2 | 5.1 | 0.12     |
| Treatment A | 100 | 21.8 | 4.8 | -0.05    |
| Treatment B | 100 | 15.4 | 6.2 | 0.34     |
| Treatment C | 100 | 19.6 | 4.9 | -0.08    |

**Rules**

- Always overlay box plot summary (median, IQR) inside the violin.
- Scale violins by area (equal area = equal n) or by width (equal max width). Document which.
- Bandwidth: Silverman's rule or cross-validation. State it.
- Better than box plot for bimodal/multimodal distributions.

## Histogram

Binned frequency counts for a single continuous variable.

> [Inline SVG drawing — Histogram — 38 observations]

| Bin | Count | Density | Cumulative % |
| --- | ----- | ------- | ------------ |
| 12  | 1     | 0.026   | 2.6%         |
| 13  | 0     | 0.000   | 2.6%         |
| 14  | 1     | 0.026   | 5.3%         |
| 15  | 2     | 0.053   | 10.5%        |
| 16  | 3     | 0.079   | 18.4%        |
| 17  | 4     | 0.105   | 28.9%        |
| 18  | 5     | 0.132   | 42.1%        |
| 19  | 4     | 0.105   | 52.6%        |
| 20  | 6     | 0.158   | 68.4%        |
| 21  | 4     | 0.105   | 78.9%        |
| 22  | 3     | 0.079   | 86.8%        |
| 23  | 2     | 0.053   | 92.1%        |
| 24  | 1     | 0.026   | 94.7%        |

**Rules**

- Bin width via Freedman-Diaconis: 2×IQR×n^(-1/3). Not "10 bins".
- Label every bar with count. Density axis optional (for PDF overlay).
- Zero baseline mandatory. No truncated Y.
- For small n (<30), consider dot plot or strip plot instead.

## Density (KDE) plot

Smoothed probability density function. Kernel choice and bandwidth matter.

> [Inline SVG drawing — Kernel density estimate with rug plot]

| Statistic             | Value    |
| --------------------- | -------- |
| N                     | 38       |
| Bandwidth (Silverman) | 1.5      |
| Kernel                | Gaussian |
| Mean                  | 19.4     |
| Std Dev               | 3.2      |
| Skewness              | 0.15     |
| Kurtosis              | -0.22    |

**Rules**

- State kernel (Gaussian, Epanechnikov) and bandwidth selection method.
- Bandwidth: Silverman, Scott, or cross-validation. Small n → oversmooth.
- Rug plot or strip plot underneath shows raw data density.
- Overlay theoretical distribution (normal, log-normal) for assumption checking.

## Q-Q plot (Quantile-Quantile)

Sample quantiles vs. theoretical distribution quantiles. Linearity = good fit.

> [Inline SVG drawing — Q-Q plot vs. Normal distribution]

| Theoretical | Sample | Deviation |
| ----------- | ------ | --------- |
| -2.0        | -2.1   | -0.10     |
| -1.5        | -1.6   | -0.10     |
| -1.0        | -1.1   | -0.10     |
| -0.5        | -0.4   | 0.10      |
| 0.0         | 0.1    | 0.10      |
| 0.5         | 0.6    | 0.10      |
| 1.0         | 1.2    | 0.20      |
| 1.5         | 1.4    | -0.10     |
| 2.0         | 2.1    | 0.10      |

**Rules**

- Axes: Theoretical quantiles (x) vs Sample quantiles (y).
- Reference line: y=x (not regression line).
- Deviations: S-shape = skew. U-shape = heavy tails. Inverted U = light tails.
- Supplement with Shapiro-Wilk p-value in caption.
- For non-normal theory (exponential, log-normal), change theoretical quantiles.

## Correlation matrix heatmap

Pairwise Pearson correlations in a diverging color matrix.

> [Inline SVG drawing — Correlation heatmap — six business metrics]

|            | Revenue | Users | Sessions | Bounce | Conv. Rate | Avg. Order |
| ---------- | ------- | ----- | -------- | ------ | ---------- | ---------- |
| Revenue    | 1.00    | 0.87  | 0.91     | -0.62  | 0.73       | 0.45       |
| Users      | 0.87    | 1.00  | 0.95     | -0.58  | 0.69       | 0.38       |
| Sessions   | 0.91    | 0.95  | 1.00     | -0.65  | 0.71       | 0.42       |
| Bounce     | -0.62   | -0.58 | -0.65    | 1.00   | -0.54      | -0.31      |
| Conv. Rate | 0.73    | 0.69  | 0.71     | -0.54  | 1.00       | 0.56       |
| Avg. Order | 0.45    | 0.38  | 0.42     | -0.31  | 0.56       | 1.00       |

**Rules**

- Diverging palette centered at 0 (white). Blue positive, red negative.
- Annotate every cell with correlation coefficient (two decimals).
- Cluster variables (hierarchical) to reveal blocks.
- Diagonal = 1.00. Mask or gray out.
- State correlation type: Pearson (linear), Spearman (rank), Kendall.
- Sample size (n) in caption. Small n → spurious correlations.

## Accessible scientific charts

Statistical charts must survive the loss of color and sight.

**Rules**

- Box/Violin: distinct pattern fills (stripes, dots) per group, not just hue.
- Histogram: bar borders + value labels on every bar.
- Density: line style (solid/dashed/dotted) + direct labels on curves.
- Q-Q: diagonal reference line always visible, points have shape + color.
- Heatmap: annotate every cell. Provide sortable data table.
- All charts: data table is the accessible equivalent. Never optional.

**Code:** components/charts/ScientificChartFrame.tsx

```tsx
export function ScientificChartFrame({
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
    <figure aria-labelledby={`${title}-title`}>
      <figcaption id={`${title}-title`} className='font-semibold'>
        {title}
      </figcaption>
      <p className='text-mute text-sm'>{summary}</p>
      {stats && (
        <dl className='my-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4'>
          {stats.map((s) => (
            <div key={s.label}>
              <dt className='text-mute'>{s.label}</dt>
              <dd className='font-mono'>{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div aria-hidden='true'>{children}</div>
      <details className='mt-3'>
        <summary>View data table</summary>
        {table}
      </details>
    </figure>
  );
}
```

## Implementation notes

Building scientific charts as components.

**Code:** lib/stats.ts

```ts
// Pure statistical helpers — no rendering, testable in isolation

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
    outliers: sorted.filter((v) => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr),
  };
}

export function kde(values: number[], bandwidth: number, grid: number[]): number[] {
  return grid.map(
    (x) =>
      values.reduce((sum, v) => sum + gaussianKernel((x - v) / bandwidth), 0) /
      (values.length * bandwidth),
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
}
```

**Rules**

- Statistics first, rendering second. Pure functions in lib/stats.ts.
- Components compose ChartFrame + marks + DataTable. No stats logic in components.
- Test stats helpers with known datasets (e.g., R's mtcars, iris).
- Generate SVG from data arrays — drawing and table share one source.

## Checklist

Before shipping a scientific chart component.

### Statistical correctness

Box whiskers = 1.5×IQR. KDE bandwidth stated. Q-Q theoretical distribution labeled.

### Sample size awareness

n < 20: show raw points, not box/violin. n < 30: prefer dot/strip plots.

### Accessibility

Patterns + labels, not just color. Data table always present. Summary statistics in caption.

### Reproducibility

Random seed fixed for jitter/bootstrap. Bandwidth method cited.

### Interactivity

Hover → show exact values. Click → filter linked views. Brush → select subset.

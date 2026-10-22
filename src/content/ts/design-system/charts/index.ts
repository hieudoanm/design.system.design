import type { Topic } from '../index';

/*
 * The five drawings below are plain SVG. They live in ./svg as files and are
 * exposed by the generated module ./svg-generated — run
 * `node scripts/ts/generate-svg.mts charts` to regenerate it after editing one.
 *
 * The arrays below hold the numbers the drawings show. Each one also builds
 * the table of its chart, so the table and the drawing stay in step.
 */

import { area, bar, line, pie, scatter } from './svg-generated';

const appGlobalsCss = `@theme {
  /* categorical — fixed order, distinct hues */
  --color-chart-1: #1f4fd8;
  --color-chart-2: #c2255c;
  --color-chart-3: #0f766e;
  --color-chart-4: #b45309;
  --color-chart-5: #6d28d9;
  --color-chart-6: #475569;

  /* sequential — one hue, monotonic lightness */
  --color-seq-100: #e0e7ff;
  --color-seq-500: #6366f1;
  --color-seq-900: #312e81;

  /* diverging — two hues meeting at the midpoint */
  --color-div-neg: #1f4fd8;
  --color-div-pos: #c2255c;
}`;

const componentsChartsChartFrameTsx = `export function ChartFrame({
  title,
  summary,
  children,
  table,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
  table: React.ReactNode;
}) {
  return (
    <figure aria-labelledby={\`\${title}-title\`}>
      <figcaption id={\`\${title}-title\`} className="font-semibold">
        {title}
      </figcaption>
      <p className="text-mute text-sm">{summary}</p>
      <div aria-hidden="true">{children}</div>
      <details className="mt-3">
        <summary>View data table</summary>
        {table}
      </details>
    </figure>
  );
}`;

const traffic = [
  { month: 'Jan', web: 20, ios: 12, android: 30 },
  { month: 'Feb', web: 28, ios: 15, android: 33 },
  { month: 'Mar', web: 26, ios: 18, android: 31 },
  { month: 'Apr', web: 38, ios: 22, android: 36 },
  { month: 'May', web: 45, ios: 26, android: 38 },
  { month: 'Jun', web: 52, ios: 30, android: 40 },
];

const sessions = [
  { day: 'Mon', direct: 42, search: 28 },
  { day: 'Tue', direct: 55, search: 33 },
  { day: 'Wed', direct: 38, search: 45 },
  { day: 'Thu', direct: 60, search: 31 },
  { day: 'Fri', direct: 47, search: 52 },
];

const monthly = [
  { month: 'Jan', desktop: 22, mobile: 12 },
  { month: 'Feb', desktop: 26, mobile: 14 },
  { month: 'Mar', desktop: 25, mobile: 16 },
  { month: 'Apr', desktop: 31, mobile: 15 },
  { month: 'May', desktop: 34, mobile: 18 },
  { month: 'Jun', desktop: 30, mobile: 20 },
  { month: 'Jul', desktop: 38, mobile: 17 },
  { month: 'Aug', desktop: 42, mobile: 18 },
];

const share = [
  { device: 'Desktop', sessions: 4600 },
  { device: 'Mobile', sessions: 3200 },
  { device: 'Tablet', sessions: 2200 },
];

/** [minutes on site, conversion rate in per cent] */
const points: [number, number][] = [
  [4, 1.1],
  [8, 1.7],
  [11, 1.3],
  [12, 0.8],
  [14, 2.5],
  [17, 2.0],
  [20, 2.9],
  [23, 2.6],
  [26, 3.5],
  [29, 3.1],
  [33, 4.0],
  [36, 4.3],
  [39, 4.0],
  [42, 5.2],
  [44, 7.4],
  [46, 4.8],
  [50, 5.9],
  [54, 7.0],
];

export const charts: Topic = {
  slug: 'charts',
  title: 'Charts',
  tagline: 'Data visualisation as a set of components, not a pile of one-off drawings.',
  summary:
    'Charts are components. They have the same obligations as any other part of the system: they use tokens, they ship in every state, they are accessible without colour, and they behave the same in every product.',
  group: 'data-charts',
  sections: [
    {
      id: 'anatomy',
      title: 'The parts of a chart',
      intro: 'Name the parts, then build one component per part.',
      body: 'A chart is assembled from a small number of repeating elements, and each one should be a component with its own token set: the **plot area** (the grid and axes), the **mark** (the bar, the point, the line), the **legend**, the **tooltip**, the **axis label** and the **empty state**.\n\nIf you build those six, every chart in the product inherits the same spacing, the same gridlines and the same legend behaviour, and adding the seventh chart type takes an afternoon instead of a sprint.',
      examples: [
        'ChartFrame — title, subtitle, legend slot, action slot, empty and loading states',
        'Axis — horizontal or vertical, optional gridlines, formatted ticks',
        'Mark — bar, line, point, area, with the shared hover and focus treatment',
        'Legend — swatch plus label, keyboard reachable, sortable',
        'Tooltip — shared positioning, dismissal and focus behaviour',
      ],
      rules: [
        'Every chart type is composed from the same chart primitives.',
        'The frame owns the title, the legend and the states; the chart owns the data.',
        'Loading, empty, error and single-point states are part of the component, not extras.',
      ],
    },
    {
      id: 'choosing',
      title: 'Choosing the right form',
      intro: 'Pick the chart that answers the question, not the one that looks impressive.',
      body: 'The question behind a chart is usually one of four: comparison, trend, distribution or relationship. Match the form to the question and the chart becomes obvious.\n\nThe most common mistake is not choosing badly — it is choosing *bar* for a trend, or *line* for a comparison. A line implies continuity between points that may not exist, and a bar implies a baseline comparison that a line chart cannot make.',
      items: [
        {
          title: 'Comparison',
          body: 'Bar charts. Horizontal bars when the labels are long. Order by value unless the order carries meaning.',
        },
        {
          title: 'Trend over time',
          body: 'Line charts for continuous series, area charts for one series against a total. Bars work too, but they imply discrete periods.',
        },
        {
          title: 'Distribution',
          body: 'Histograms and box plots. Do not use a line chart to show a distribution — it invents continuity.',
        },
        {
          title: 'Relationship',
          body: 'Scatter plots. Add a trend line only when you also state the correlation and the sample size.',
        },
      ],
      rules: [
        'Start from the question, then pick the form.',
        'Zero-baseline every bar chart. Truncating the axis exaggerates differences.',
        'Do not use a pie chart for more than three or four slices.',
        'Show the data table alongside the chart, always.',
      ],
    },
    {
      id: 'examples',
      title: 'Five charts, five questions',
      intro: 'One frame, one scale, five marks — and the numbers behind every one of them.',
      body: 'The five drawings below are the same component wearing a different mark. The line asks *how did it change over time?*, the bar asks *which of these is bigger?*, the area asks *how do the parts make the whole?*, the pie asks *how is one whole divided?*, and the scatter asks *do these two things move together?*\n\nEvery one of them follows the same rules: the categorical palette in a fixed order, a zero baseline where a baseline exists, direct labels instead of a legend, a second channel besides hue, and the table of numbers underneath — which is the only version of the chart that a screen reader can use.',
      visuals: [
        {
          title: 'Line — trend over time',
          caption:
            'Three series over six months, each with its own marker shape so the lines survive the loss of colour. The series are labelled where they end, not in a legend.',
          svg: line,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: {
            columns: ['Month', 'Web', 'iOS', 'Android'],
            rows: traffic.map((m) => [m.month, String(m.web), String(m.ios), String(m.android)]),
            summary: 'View data table',
          },
        },
        {
          title: 'Bar — comparison between two series',
          caption:
            'Direct and search sessions per weekday. The value axis starts at zero, every bar is labelled, and the two series are named on the plot.',
          svg: bar,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: {
            columns: ['Day', 'Direct', 'Search'],
            rows: sessions.map((s) => [s.day, String(s.direct), String(s.search)]),
            summary: 'View data table',
          },
        },
        {
          title: 'Area — parts making a total',
          caption:
            'Desktop and mobile stacked to a monthly total. The upper edge is the total, which is the number people actually read.',
          svg: area,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: {
            columns: ['Month', 'Desktop', 'Mobile', 'Total'],
            rows: monthly.map((m) => [
              m.month,
              String(m.desktop),
              String(m.mobile),
              String(m.desktop + m.mobile),
            ]),
            summary: 'View data table',
          },
        },
        {
          title: 'Pie — one whole, divided',
          caption:
            'Three slices, and never more than four. If the parts do not add to the whole, or the reader must compare two slices closely, this is the wrong chart.',
          svg: pie,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: {
            columns: ['Device', 'Sessions', 'Share'],
            rows: share.map((s) => [s.device, String(s.sessions), `${s.sessions / 100}%`]),
            summary: 'View data table',
          },
        },
        {
          title: 'Scatter — two things moving together',
          caption:
            'Time on site against conversion. The trend line comes with the correlation and the sample size, and the two outliers are marked instead of hidden.',
          svg: scatter,
          full: true,
          minWidth: 420,
          maxWidth: 620,
          table: {
            columns: ['Minutes on site', 'Conversion rate', 'Note'],
            rows: points.map(([m, v]) => [
              String(m),
              `${v}%`,
              m === 12 || m === 44 ? 'outlier' : '—',
            ]),
            summary: 'View data table',
          },
        },
      ],
      rules: [
        'One chart per question. If you need two answers, draw two charts.',
        'Label the series on the plot. A legend is a fallback, not the primary label.',
        'Give every chart the table of numbers behind it.',
        'Give every chart a name and a one-sentence summary of what it shows.',
      ],
    },
    {
      id: 'colour',
      title: 'Colour for data',
      intro: 'Categorical, sequential and diverging are three different jobs.',
      body: 'A single palette cannot do all three. **Categorical** colours separate unrelated series and must be distinguishable from each other — that is a qualitative palette. **Sequential** colours show magnitude along one dimension, from light to dark of a single hue, and must be monotonic in lightness. **Diverging** colours show a value around a meaningful midpoint, usually zero.\n\nBuild each as its own token group. Trying to use one ramp for all three is the root cause of most unreadable dashboards, because a categorical pair needs maximum hue separation while a sequential ramp needs none.',
      examples: [
        'Categorical: `--color-chart-1 … --color-chart-6` — fixed hues, fixed order',
        'Sequential: `--color-seq-100 … --color-seq-900` — one hue, monotonic lightness',
        'Diverging: `--color-div-neg … --color-div-pos` — two hues meeting at the midpoint',
        'Status: `--color-status-good`, `--color-status-warn`, `--color-status-bad`',
      ],
      rules: [
        'Assign categorical colours in a fixed order so a colour always means the same series.',
        'Never use a sequential ramp for categories, or a categorical set for magnitude.',
        'Check the palette with a colour-vision-deficiency simulator before shipping.',
        'Status colours are semantic tokens, not chart colours.',
      ],
      code: {
        label: 'app/globals.css',
        source: appGlobalsCss,
      },
    },
    {
      id: 'accessibility',
      title: 'Accessible charts',
      intro: 'A chart that needs colour to be understood is broken for some of your users.',
      body: 'Roughly one in twelve men has some form of colour vision deficiency, and low vision, glare and bad projectors affect far more people than that. Every chart must survive the loss of colour.\n\nThe reliable fixes are unglamorous: direct-label the series instead of relying on a legend, add a pattern or a marker shape to distinguish fills, keep gridlines subtle but present, and — the one that solves most of it — provide the underlying data as a table. A screen reader user gets a real answer from the table; a sighted user gets the shape from the chart.',
      rules: [
        'Never encode a distinction in hue alone. Add a second channel: a label, a dash pattern, a marker shape.',
        'Ship the data as an accessible table next to every chart.',
        'Give the chart an accessible name and a short text summary of the trend.',
        'Keep text inside charts at the same contrast ratio as the rest of the page.',
        'Do not rely on tooltips for information that is not also visible elsewhere.',
      ],
      code: {
        label: 'components/charts/ChartFrame.tsx',
        source: componentsChartsChartFrameTsx,
      },
    },
    {
      id: 'responsiveness',
      title: 'Responsive charts',
      intro: 'Charts break differently from layouts.',
      body: 'A layout that reflows is usually fine. A chart that reflows can become unreadable: a bar chart squeezed to 320px has unreadable axis labels, a legend of eight entries wraps into a wall, and a tooltip ends up off-screen.\n\nDecide at which width the chart changes *kind* rather than just changing size. Below the breakpoint, a grouped bar chart becomes a horizontal bar chart, and a dense time series becomes a summary sparkline with the detail in the table.',
      rules: [
        'Set a minimum chart width; below it, switch chart kind rather than shrinking.',
        'Move legends below the plot on narrow screens, or label the series directly.',
        'Anchor tooltips to the plot area so they never leave the viewport.',
        'Test the chart at 320px, 768px and a wide desktop.',
      ],
    },
    {
      id: 'empty',
      title: 'The states nobody designs',
      intro: 'Empty, loading, one point and error.',
      body: 'A chart component is not done until it handles the boring states. **Empty** means there is no data — say why and say what to do next, never render an empty axis. **Loading** means show the frame and a skeleton so the layout does not jump. **One point** means do not draw a line between two coordinates you do not have. **Error** means keep the frame and explain the failure.\n\nEvery one of these is a design decision, and every one of them is a moment where a chart library will happily render something meaningless unless you handle it.',
      items: [
        {
          title: 'Empty',
          body: 'State the reason ("No events in this range") and the next action ("Widen the range").',
        },
        {
          title: 'Loading',
          body: 'Render the frame with the axes and a skeleton, so the page does not reflow when data lands.',
        },
        {
          title: 'Single point',
          body: 'Draw a dot, not a line. A line between two points invents a trend that does not exist.',
        },
        {
          title: 'Error',
          body: 'Keep the frame, replace the plot with the error, keep the data table reachable if it exists.',
        },
      ],
    },
  ],
};

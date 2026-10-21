import type { Topic } from './index';

export const charts: Topic = {
  slug: 'charts',
  title: 'Charts',
  tagline: 'Data visualisation as a set of components, not a pile of one-off drawings.',
  summary:
    'Charts are components. They have the same obligations as any other part of the system: they use tokens, they ship in every state, they are accessible without colour, and they behave the same in every product.',
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
      id: 'colour',
      title: 'Colour for data',
      intro: 'Categorical, sequential and diverging are three different jobs.',
      body: 'A single palette cannot do all three. **Categorical** colours separate unrelated series and must be distinguishable from each other — that is a qualitative palette. **Sequential** colours show magnitude along one dimension, from light to dark of a single hue, and must be monotonic in lightness. **Diverging** colours show a value around a meaningful midpoint, usually zero.\n\nBuild each as its own token group. Trying to use one ramp for all three is the root cause of most unreadable dashboards, because a categorical pair needs maximum hue separation while a sequential ramp needs none.',
      examples: [
        'Categorical: `--chart-cat-1 … --chart-cat-6` — fixed hues, fixed order',
        'Sequential: `--chart-seq-100 … --chart-seq-900` — one hue, monotonic lightness',
        'Diverging: `--chart-div-neg-3 … --chart-div-pos-3` — two hues meeting at the midpoint',
        'Status: `--chart-status-good`, `--chart-status-warn`, `--chart-status-bad`',
      ],
      rules: [
        'Assign categorical colours in a fixed order so a colour always means the same series.',
        'Never use a sequential ramp for categories, or a categorical set for magnitude.',
        'Check the palette with a colour-vision-deficiency simulator before shipping.',
        'Status colours are semantic tokens, not chart colours.',
      ],
      code: {
        label: 'app/globals.css',
        source: `@theme {
  /* categorical — fixed order, distinct hues */
  --chart-cat-1: #1f4fd8;
  --chart-cat-2: #c2255c;
  --chart-cat-3: #0f766e;
  --chart-cat-4: #b45309;
  --chart-cat-5: #6d28d9;
  --chart-cat-6: #475569;

  /* sequential — one hue, monotonic lightness */
  --chart-seq-100: #e0e7ff;
  --chart-seq-500: #6366f1;
  --chart-seq-900: #312e81;

  /* diverging — two hues meeting at the midpoint */
  --chart-div-neg: #1f4fd8;
  --chart-div-pos: #c2255c;
}`,
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
        source: `export function ChartFrame({
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
}`,
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

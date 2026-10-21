---
title: Charts
description: Data visualization as components — chart anatomy, choosing the right form, five chart types with data tables, color for data, accessibility, responsiveness, and state handling.
tags: [charts, data-visualization, accessibility, color, responsive-design]
---

# Charts

Data visualisation as a set of components, not a pile of one-off drawings.

Charts are components. They have the same obligations as any other part of the system: they use tokens, they ship in every state, they are accessible without colour, and they behave the same in every product.

## The parts of a chart

Name the parts, then build one component per part.

A chart is assembled from a small number of repeating elements, and each one should be a component with its own token set: the **plot area** (the grid and axes), the **mark** (the bar, the point, the line), the **legend**, the **tooltip**, the **axis label** and the **empty state**.

If you build those six, every chart in the product inherits the same spacing, the same gridlines and the same legend behaviour, and adding the seventh chart type takes an afternoon instead of a sprint.

**Examples**

- ChartFrame — title, subtitle, legend slot, action slot, empty and loading states
- Axis — horizontal or vertical, optional gridlines, formatted ticks
- Mark — bar, line, point, area, with the shared hover and focus treatment
- Legend — swatch plus label, keyboard reachable, sortable
- Tooltip — shared positioning, dismissal and focus behaviour

**Rules**

- Every chart type is composed from the same chart primitives.
- The frame owns the title, the legend and the states; the chart owns the data.
- Loading, empty, error and single-point states are part of the component, not extras.

## Choosing the right form

Pick the chart that answers the question, not the one that looks impressive.

The question behind a chart is usually one of four: comparison, trend, distribution or relationship. Match the form to the question and the chart becomes obvious.

The most common mistake is not choosing badly — it is choosing _bar_ for a trend, or _line_ for a comparison. A line implies continuity between points that may not exist, and a bar implies a baseline comparison that a line chart cannot make.

### Comparison

Bar charts. Horizontal bars when the labels are long. Order by value unless the order carries meaning.

### Trend over time

Line charts for continuous series, area charts for one series against a total. Bars work too, but they imply discrete periods.

### Distribution

Histograms and box plots. Do not use a line chart to show a distribution — it invents continuity.

### Relationship

Scatter plots. Add a trend line only when you also state the correlation and the sample size.

**Rules**

- Start from the question, then pick the form.
- Zero-baseline every bar chart. Truncating the axis exaggerates differences.
- Do not use a pie chart for more than three or four slices.
- Show the data table alongside the chart, always.

## Five charts, five questions

One frame, one scale, five marks — and the numbers behind every one of them.

The five drawings below are the same component wearing a different mark. The line asks _how did it change over time?_, the bar asks _which of these is bigger?_, the area asks _how do the parts make the whole?_, the pie asks _how is one whole divided?_, and the scatter asks _do these two things move together?_

Every one of them follows the same rules: the categorical palette in a fixed order, a zero baseline where a baseline exists, direct labels instead of a legend, a second channel besides hue, and the table of numbers underneath — which is the only version of the chart that a screen reader can use.

### Line — trend over time

Three series over six months, each with its own marker shape so the lines survive the loss of colour. The series are labelled where they end, not in a legend.

> [Inline SVG drawing — Line — trend over time]

| Month | Web | iOS | Android |
| ----- | --- | --- | ------- |
| Jan   | 20  | 12  | 30      |
| Feb   | 28  | 15  | 33      |
| Mar   | 26  | 18  | 31      |
| Apr   | 38  | 22  | 36      |
| May   | 45  | 26  | 38      |
| Jun   | 52  | 30  | 40      |

### Bar — comparison between two series

Direct and search sessions per weekday. The value axis starts at zero, every bar is labelled, and the two series are named on the plot.

> [Inline SVG drawing — Bar — comparison between two series]

| Day | Direct | Search |
| --- | ------ | ------ |
| Mon | 42     | 28     |
| Tue | 55     | 33     |
| Wed | 38     | 45     |
| Thu | 60     | 31     |
| Fri | 47     | 52     |

### Area — parts making a total

Desktop and mobile stacked to a monthly total. The upper edge is the total, which is the number people actually read.

> [Inline SVG drawing — Area — parts making a total]

| Month | Desktop | Mobile | Total |
| ----- | ------- | ------ | ----- |
| Jan   | 22      | 12     | 34    |
| Feb   | 26      | 14     | 40    |
| Mar   | 25      | 16     | 41    |
| Apr   | 31      | 15     | 46    |
| May   | 34      | 18     | 52    |
| Jun   | 30      | 20     | 50    |
| Jul   | 38      | 17     | 55    |
| Aug   | 42      | 18     | 60    |

### Pie — one whole, divided

Three slices, and never more than four. If the parts do not add to the whole, or the reader must compare two slices closely, this is the wrong chart.

> [Inline SVG drawing — Pie — one whole, divided]

| Device  | Sessions | Share |
| ------- | -------- | ----- |
| Desktop | 4600     | 46%   |
| Mobile  | 3200     | 32%   |
| Tablet  | 2200     | 22%   |

### Scatter — two things moving together

Time on site against conversion. The trend line comes with the correlation and the sample size, and the two outliers are marked instead of hidden.

> [Inline SVG drawing — Scatter — two things moving together]

| Minutes on site | Conversion rate | Note    |
| --------------- | --------------- | ------- |
| 4               | 1.1%            | —       |
| 8               | 1.7%            | —       |
| 11              | 1.3%            | —       |
| 12              | 0.8%            | outlier |
| 14              | 2.5%            | —       |
| 17              | 2.0%            | —       |
| 20              | 2.9%            | —       |
| 23              | 2.6%            | —       |
| 26              | 3.5%            | —       |
| 29              | 3.1%            | —       |
| 33              | 4.0%            | —       |
| 36              | 4.3%            | —       |
| 39              | 4.0%            | —       |
| 42              | 5.2%            | —       |
| 44              | 7.4%            | outlier |
| 46              | 4.8%            | —       |
| 50              | 5.9%            | —       |
| 54              | 7.0%            | —       |

**Rules**

- One chart per question. If you need two answers, draw two charts.
- Label the series on the plot. A legend is a fallback, not the primary label.
- Give every chart the table of numbers behind it.
- Give every chart a name and a one-sentence summary of what it shows.

## Colour for data

Categorical, sequential and diverging are three different jobs.

A single palette cannot do all three. **Categorical** colours separate unrelated series and must be distinguishable from each other — that is a qualitative palette. **Sequential** colours show magnitude along one dimension, from light to dark of a single hue, and must be monotonic in lightness. **Diverging** colours show a value around a meaningful midpoint, usually zero.

Build each as its own token group. Trying to use one ramp for all three is the root cause of most unreadable dashboards, because a categorical pair needs maximum hue separation while a sequential ramp needs none.

**Examples**

- Categorical: `--color-chart-1 … --color-chart-6` — fixed hues, fixed order
- Sequential: `--color-seq-100 … --color-seq-900` — one hue, monotonic lightness
- Diverging: `--color-div-neg … --color-div-pos` — two hues meeting at the midpoint
- Status: `--color-status-good`, `--color-status-warn`, `--color-status-bad`

**Rules**

- Assign categorical colours in a fixed order so a colour always means the same series.
- Never use a sequential ramp for categories, or a categorical set for magnitude.
- Check the palette with a colour-vision-deficiency simulator before shipping.
- Status colours are semantic tokens, not chart colours.

**Code:** app/globals.css

```css
@theme {
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
}
```

## Accessible charts

A chart that needs colour to be understood is broken for some of your users.

Roughly one in twelve men has some form of colour vision deficiency, and low vision, glare and bad projectors affect far more people than that. Every chart must survive the loss of colour.

The reliable fixes are unglamorous: direct-label the series instead of relying on a legend, add a pattern or a marker shape to distinguish fills, keep gridlines subtle but present, and — the one that solves most of it — provide the underlying data as a table. A screen reader user gets a real answer from the table; a sighted user gets the shape from the chart.

**Rules**

- Never encode a distinction in hue alone. Add a second channel: a label, a dash pattern, a marker shape.
- Ship the data as an accessible table next to every chart.
- Give the chart an accessible name and a short text summary of the trend.
- Keep text inside charts at the same contrast ratio as the rest of the page.
- Do not rely on tooltips for information that is not also visible elsewhere.

**Code:** components/charts/ChartFrame.tsx

```tsx
export function ChartFrame({
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
    <figure aria-labelledby={`${title}-title`}>
      <figcaption id={`${title}-title`} className='font-semibold'>
        {title}
      </figcaption>
      <p className='text-mute text-sm'>{summary}</p>
      <div aria-hidden='true'>{children}</div>
      <details className='mt-3'>
        <summary>View data table</summary>
        {table}
      </details>
    </figure>
  );
}
```

## Responsive charts

Charts break differently from layouts.

A layout that reflows is usually fine. A chart that reflows can become unreadable: a bar chart squeezed to 320px has unreadable axis labels, a legend of eight entries wraps into a wall, and a tooltip ends up off-screen.

Decide at which width the chart changes _kind_ rather than just changing size. Below the breakpoint, a grouped bar chart becomes a horizontal bar chart, and a dense time series becomes a summary sparkline with the detail in the table.

**Rules**

- Set a minimum chart width; below it, switch chart kind rather than shrinking.
- Move legends below the plot on narrow screens, or label the series directly.
- Anchor tooltips to the plot area so they never leave the viewport.
- Test the chart at 320px, 768px and a wide desktop.

## The states nobody designs

Empty, loading, one point and error.

A chart component is not done until it handles the boring states. **Empty** means there is no data — say why and say what to do next, never render an empty axis. **Loading** means show the frame and a skeleton so the layout does not jump. **One point** means do not draw a line between two coordinates you do not have. **Error** means keep the frame and explain the failure.

Every one of these is a design decision, and every one of them is a moment where a chart library will happily render something meaningless unless you handle it.

### Empty

State the reason ("No events in this range") and the next action ("Widen the range").

### Loading

Render the frame with the axes and a skeleton, so the page does not reflow when data lands.

### Single point

Draw a dot, not a line. A line between two points invents a trend that does not exist.

### Error

Keep the frame, replace the plot with the error, keep the data table reachable if it exists.

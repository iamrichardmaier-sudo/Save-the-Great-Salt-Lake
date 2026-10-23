/**
 * Charts. All SVG, all sized from the container at draw time, all theme-aware through CSS
 * custom properties so they read in both light and dark.
 *
 * Every chart takes numbers the model produced. None of them invent a scale: axis labels name
 * values the data actually reaches.
 */

import { extent, max, min } from 'd3-array';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { format } from 'd3-format';
import { scaleBand, scaleLinear, scaleLog, type ScaleBand, type ScaleLinear } from 'd3-scale';
import { pointer, select, type Selection } from 'd3-selection';
import { area, curveMonotoneX, line, stack, symbol, symbolDiamond, type SeriesPoint } from 'd3-shape';
import { V } from '../data';
import { num } from './format';

const d3 = {
  area,
  axisBottom,
  axisLeft,
  axisRight,
  curveMonotoneX,
  extent,
  format,
  line,
  max,
  min,
  pointer,
  scaleBand,
  scaleLinear,
  scaleLog,
  select,
  stack,
  symbol,
  symbolDiamond,
};

export interface Size {
  width: number;
  height: number;
}

const M = { top: 18, right: 26, bottom: 30, left: 56 };

/**
 * Category labels are written by the data, not by the chart, so they can be longer than the
 * gutter. Clip them to what fits and keep the full text in a tooltip rather than letting them
 * run outside the drawing.
 */
const CHAR_PX = 6.3;
function fitLabel(text: string, widthPx: number): string {
  const max = Math.max(6, Math.floor(widthPx / CHAR_PX));
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}\u2026`;
}

/** Apply fitted labels to a category axis, keeping the full text available on hover. */
function fitCategoryAxis(
  g: Selection<SVGGElement, unknown, null, undefined>,
  widthPx: number,
): void {
  g.selectAll<SVGTextElement, unknown>('text').each(function () {
    const node = d3.select(this);
    const full = node.text();
    const short = fitLabel(full, widthPx);
    if (short !== full) {
      node.text(short);
      node.append('title').text(full);
    }
  });
}

function svgFor(el: HTMLElement, height: number): { svg: Selection<SVGSVGElement, unknown, null, undefined>; size: Size } {
  el.innerHTML = '';
  const width = Math.max(280, el.clientWidth || 640);
  const svg = d3
    .select(el)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('width', '100%')
    .attr('height', height)
    .attr('role', 'img');
  return { svg, size: { width, height } };
}

function axes(
  g: Selection<SVGGElement, unknown, null, undefined>,
  x: ScaleLinear<number, number> | ScaleBand<string>,
  y: ScaleLinear<number, number>,
  inner: Size,
  opts: { xTicks?: number; yTicks?: number; yFormat?: (v: number) => string; xFormat?: (v: number) => string } = {},
) {
  const yAxis = d3.axisLeft(y).ticks(opts.yTicks ?? 5);
  if (opts.yFormat) yAxis.tickFormat((d) => opts.yFormat!(d as number));
  g.append('g')
    .attr('class', 'axis axis-y')
    .call(yAxis)
    .call((s) => s.select('.domain').remove())
    .call((s) =>
      s
        .selectAll('.tick line')
        .attr('x2', inner.width)
        .attr('class', 'grid'),
    );

  if ('bandwidth' in x) {
    g.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0,${inner.height})`)
      .call(d3.axisBottom(x as ScaleBand<string>))
      .call((s) => s.select('.domain').remove());
  } else {
    const xAxis = d3.axisBottom(x as ScaleLinear<number, number>).ticks(opts.xTicks ?? 6);
    if (opts.xFormat) xAxis.tickFormat((d) => opts.xFormat!(d as number));
    else xAxis.tickFormat(d3.format('d'));
    g.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0,${inner.height})`)
      .call(xAxis)
      .call((s) => s.select('.domain').remove())
      .call((s) => keepTicksInside(s as never, inner.width));
  }
}

/** A tooltip that stays inside the page. */
function tooltip(container: HTMLElement) {
  let tip = container.querySelector<HTMLDivElement>('.chart-tip');
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'chart-tip';
    tip.hidden = true;
    container.appendChild(tip);
  }
  const el = tip;
  return {
    show(html: string, x: number, y: number) {
      el.innerHTML = html;
      el.hidden = false;
      const box = container.getBoundingClientRect();
      const w = el.offsetWidth;
      const left = Math.min(Math.max(8, x - w / 2), box.width - w - 8);
      el.style.left = `${left}px`;
      el.style.top = `${Math.max(4, y - el.offsetHeight - 12)}px`;
    },
    hide() {
      el.hidden = true;
    },
  };
}

// ───────────────────────── Lake level ─────────────────────────

export interface LakeSeries {
  years: number[];
  line: number[];
  p10?: number[];
  p90?: number[];
}

export function drawLake(el: HTMLElement, s: LakeSeries, height = 320): void {
  const { svg, size } = svgFor(el, height);
  const inner = { width: size.width - M.left - M.right, height: height - M.top - M.bottom };
  const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);
  const tip = tooltip(el);

  const all = [...s.line, ...(s.p10 ?? []), ...(s.p90 ?? []), V('healthy_min'), V('lake_now')];
  const x = d3.scaleLinear().domain(d3.extent(s.years) as [number, number]).range([0, inner.width]);
  const y = d3
    .scaleLinear()
    .domain([Math.min(...all) - 1, Math.max(...all, V('healthy_min') + 2) + 1])
    .nice()
    .range([inner.height, 0]);

  // The healthy range, shaded.
  const hiTop = Math.min(y.domain()[1], V('healthy_max'));
  if (V('healthy_min') < y.domain()[1]) {
    g.append('rect')
      .attr('class', 'band-healthy')
      .attr('x', 0)
      .attr('y', y(hiTop))
      .attr('width', inner.width)
      .attr('height', Math.max(0, y(V('healthy_min')) - y(hiTop)));
    g.append('text')
      .attr('class', 'band-label')
      .attr('x', 6)
      .attr('y', y(hiTop) + 14)
      .text('Healthy range');
  }

  axes(g, x, y, inner, { yFormat: (v) => num(v, 1) });

  if (s.p10 && s.p90) {
    const area = d3
      .area<number>()
      .x((_, i) => x(s.years[i]))
      .y0((_, i) => y(s.p10![i]))
      .y1((_, i) => y(s.p90![i]))
      .curve(d3.curveMonotoneX);
    g.append('path').datum(s.line).attr('class', 'band-sim').attr('d', area);
  }

  const line = d3
    .line<number>()
    .x((_, i) => x(s.years[i]))
    .y((d) => y(d))
    .curve(d3.curveMonotoneX);
  g.append('path').datum(s.line).attr('class', 'line-lake').attr('d', line);

  const lastIdx = s.line.length - 1;
  g.append('circle').attr('class', 'dot-end').attr('cx', x(s.years[lastIdx])).attr('cy', y(s.line[lastIdx])).attr('r', 4);
  g.append('text')
    .attr('class', 'end-label')
    .attr('x', x(s.years[lastIdx]) - 8)
    .attr('y', y(s.line[lastIdx]) - 12)
    .attr('text-anchor', 'end')
    .text(`${num(s.line[lastIdx], 1)} ft`);

  // Hover readout.
  g.append('rect')
    .attr('class', 'hit')
    .attr('width', inner.width)
    .attr('height', inner.height)
    .on('mousemove', (event: MouseEvent) => {
      const [mx] = d3.pointer(event, g.node());
      const year = Math.round(x.invert(mx));
      const i = s.years.indexOf(year);
      if (i < 0) return;
      const band = s.p10 && s.p90 ? `<br><span class="tip-dim">range ${num(s.p10[i], 1)} to ${num(s.p90[i], 1)} ft</span>` : '';
      tip.show(`<strong>${year}</strong><br>${num(s.line[i], 1)} ft${band}`, x(year) + M.left, y(s.line[i]) + M.top);
    })
    .on('mouseleave', () => tip.hide());
}

// ───────────────────────── Stacked area ─────────────────────────

export interface StackSeries {
  years: number[];
  keys: { id: string; label: string; color: string }[];
  values: Record<string, number[]>;
}

export function drawStack(el: HTMLElement, s: StackSeries, height = 300, unit = 'KAF/yr'): void {
  const { svg, size } = svgFor(el, height);
  const inner = { width: size.width - M.left - M.right, height: height - M.top - M.bottom };
  const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);
  const tip = tooltip(el);

  const rows = s.years.map((year, i) => {
    const row: Record<string, number> = { year };
    for (const k of s.keys) row[k.id] = s.values[k.id]?.[i] ?? 0;
    return row;
  });

  const stacked = d3.stack<Record<string, number>>().keys(s.keys.map((k) => k.id))(rows);
  const maxY = d3.max(stacked, (layer) => d3.max(layer, (d) => d[1])) ?? 1;

  const x = d3.scaleLinear().domain(d3.extent(s.years) as [number, number]).range([0, inner.width]);
  const y = d3.scaleLinear().domain([0, maxY]).nice().range([inner.height, 0]);
  axes(g, x, y, inner, { yFormat: (v) => num(v, 0) });

  const area = d3
    .area<SeriesPoint<Record<string, number>>>()
    .x((d) => x(d.data.year))
    .y0((d) => y(d[0]))
    .y1((d) => y(d[1]))
    .curve(d3.curveMonotoneX);

  g.selectAll('path.layer')
    .data(stacked)
    .join('path')
    .attr('class', 'layer')
    .attr('fill', (d) => s.keys.find((k) => k.id === d.key)!.color)
    .attr('d', area as never);

  g.append('rect')
    .attr('class', 'hit')
    .attr('width', inner.width)
    .attr('height', inner.height)
    .on('mousemove', (event: MouseEvent) => {
      const [mx, my] = d3.pointer(event, g.node());
      const year = Math.round(x.invert(mx));
      const i = s.years.indexOf(year);
      if (i < 0) return;
      const lines = s.keys
        .filter((k) => (s.values[k.id]?.[i] ?? 0) > 0.05)
        .map((k) => `<span class="swatch" style="background:${k.color}"></span>${k.label} ${num(s.values[k.id][i], 0)}`)
        .reverse()
        .join('<br>');
      const total = s.keys.reduce((t, k) => t + (s.values[k.id]?.[i] ?? 0), 0);
      tip.show(`<strong>${year} · ${num(total, 0)} ${unit}</strong><br>${lines}`, mx + M.left, my + M.top);
    })
    .on('mouseleave', () => tip.hide());
}

// ───────────────────────── Jobs: bars plus a net line ─────────────────────────

export interface JobsSeries {
  years: number[];
  gained: { id: string; label: string; color: string; values: number[] }[];
  lost: { id: string; label: string; color: string; values: number[] }[];
  net: number[];
}

export function drawJobs(el: HTMLElement, s: JobsSeries, height = 340): void {
  const { svg, size } = svgFor(el, height);
  const inner = { width: size.width - M.left - M.right, height: height - M.top - M.bottom };
  const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);
  const tip = tooltip(el);

  const totalGained = s.years.map((_, i) => s.gained.reduce((t, g2) => t + g2.values[i], 0));
  const totalLost = s.years.map((_, i) => s.lost.reduce((t, l) => t + l.values[i], 0));
  const top = Math.max(...totalGained, ...s.net, 1);
  const bottom = -Math.max(...totalLost, 1);

  const x = d3.scaleBand<string>().domain(s.years.map(String)).range([0, inner.width]).padding(0.18);
  const y = d3.scaleLinear().domain([bottom, top]).nice().range([inner.height, 0]);

  g.append('g')
    .attr('class', 'axis axis-y')
    .call(d3.axisLeft(y).ticks(6).tickFormat((d) => num(Math.abs(d as number), 0)))
    .call((sel) => sel.select('.domain').remove())
    .call((sel) => sel.selectAll('.tick line').attr('x2', inner.width).attr('class', 'grid'));

  // A zero line through the middle, but the year labels at the foot of the chart: on the zero
  // line they sit on top of the bars.
  g.append('line')
    .attr('class', 'grid')
    .attr('x1', 0)
    .attr('x2', inner.width)
    .attr('y1', y(0))
    .attr('y2', y(0))
    .attr('stroke', 'var(--line-strong)');

  const everyNth = Math.max(1, Math.round(s.years.length / 7));
  g.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${inner.height})`)
    .call(d3.axisBottom(x).tickValues(s.years.filter((_, i) => i % everyNth === 0).map(String)))
    .call((sel) => sel.select('.domain').remove())
    .call((sel) => {
      const ticks = sel.selectAll<SVGGElement, unknown>('.tick').nodes();
      if (ticks.length) {
        d3.select(ticks[ticks.length - 1]).select('text').attr('text-anchor', 'end');
        d3.select(ticks[0]).select('text').attr('text-anchor', 'start');
      }
    });

  const drawStackPart = (
    series: { id: string; label: string; color: string; values: number[] }[],
    sign: 1 | -1,
  ) => {
    const offsets = s.years.map(() => 0);
    for (const part of series) {
      g.selectAll(`rect.bar-${part.id}`)
        .data(s.years.map((year, i) => ({ year, i, v: part.values[i] })))
        .join('rect')
        .attr('class', `bar bar-${part.id}`)
        .attr('x', (d) => x(String(d.year))!)
        .attr('width', x.bandwidth())
        .attr('y', (d) => (sign > 0 ? y(offsets[d.i] + d.v) : y(-offsets[d.i])))
        .attr('height', (d) => Math.abs(y(d.v) - y(0)))
        .attr('fill', part.color);
      s.years.forEach((_, i) => (offsets[i] += part.values[i]));
    }
  };
  drawStackPart(s.gained, 1);
  drawStackPart(s.lost, -1);

  const line = d3
    .line<number>()
    .x((_, i) => x(String(s.years[i]))! + x.bandwidth() / 2)
    .y((d) => y(d))
    .curve(d3.curveMonotoneX);
  g.append('path').datum(s.net).attr('class', 'line-net').attr('d', line);

  g.append('rect')
    .attr('class', 'hit')
    .attr('width', inner.width)
    .attr('height', inner.height)
    .on('mousemove', (event: MouseEvent) => {
      const [mx, my] = d3.pointer(event, g.node());
      const i = Math.min(s.years.length - 1, Math.max(0, Math.floor(mx / (inner.width / s.years.length))));
      const rows = [...s.gained, ...s.lost]
        .filter((p) => Math.abs(p.values[i]) > 0.5)
        .map((p) => `<span class="swatch" style="background:${p.color}"></span>${p.label} ${num(p.values[i], 0)}`)
        .join('<br>');
      tip.show(`<strong>${s.years[i]} · net ${num(s.net[i], 0)}</strong><br>${rows}`, mx + M.left, my + M.top);
    })
    .on('mouseleave', () => tip.hide());
}

// ───────────────────────── Horizontal bars ─────────────────────────

export interface BarRow {
  label: string;
  value: number;
  color?: string;
  annotation?: string;
}

export function drawBars(
  el: HTMLElement,
  rows: BarRow[],
  opts: { log?: boolean; marker?: { value: number; label: string }; max?: number; format?: (v: number) => string; height?: number } = {},
): void {
  const rowH = 26;
  const height = opts.height ?? rows.length * rowH + M.top + M.bottom;
  const { svg, size } = svgFor(el, height);
  const left = Math.min(230, Math.max(120, size.width * 0.34));
  const inner = { width: size.width - left - M.right - 56, height: height - M.top - M.bottom };
  const g = svg.append('g').attr('transform', `translate(${left},${M.top})`);
  const fmt = opts.format ?? ((v: number) => num(v, 0));

  const values = rows.map((r) => r.value);
  const maxV = opts.max ?? Math.max(...values, opts.marker?.value ?? 0);
  const minV = opts.log ? Math.max(1, Math.min(...values.filter((v) => v > 0))) : 0;
  const x = opts.log
    ? d3.scaleLog().domain([minV, maxV]).range([0, inner.width]).clamp(true)
    : d3.scaleLinear().domain([0, maxV]).range([0, inner.width]);
  const y = d3.scaleBand<string>().domain(rows.map((r) => r.label)).range([0, inner.height]).padding(0.22);

  g.append('g')
    .attr('class', 'axis axis-y axis-cat')
    .call(d3.axisLeft(y).tickSize(0))
    .call((s) => s.select('.domain').remove())
    .call((s) => fitCategoryAxis(s as never, left - 14));

  g.selectAll('rect.hbar')
    .data(rows)
    .join('rect')
    .attr('class', 'hbar')
    .attr('x', opts.log ? 0 : 0)
    .attr('y', (d) => y(d.label)!)
    .attr('height', y.bandwidth())
    .attr('width', (d) => Math.max(1, x(Math.max(d.value, opts.log ? minV : 0))))
    .attr('fill', (d) => d.color ?? 'var(--accent)');

  g.selectAll('text.hval')
    .data(rows)
    .join('text')
    .attr('class', 'hval')
    .attr('x', (d) => Math.max(1, x(Math.max(d.value, opts.log ? minV : 0))) + 7)
    .attr('y', (d) => y(d.label)! + y.bandwidth() / 2 + 4)
    .text((d) => d.annotation ?? fmt(d.value));

  if (opts.marker) {
    const mx = x(opts.marker.value);
    g.append('line').attr('class', 'marker-line').attr('x1', mx).attr('x2', mx).attr('y1', -2).attr('y2', inner.height);
    const nearRight = mx > inner.width - 90;
    g.append('text')
      .attr('class', 'marker-label')
      .attr('x', nearRight ? mx - 4 : mx + 4)
      .attr('y', -5)
      .attr('text-anchor', nearRight ? 'end' : 'start')
      .text(opts.marker.label);
  }

  g.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${inner.height})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(opts.log ? 4 : 5, opts.log ? '~s' : undefined)
        .tickFormat((d) => fmt(d as number)),
    )
    .call((s) => s.select('.domain').remove())
    .call((s) => keepTicksInside(s as never, inner.width));
}

/** Nudge the first and last axis labels so they do not hang off either end of the drawing. */
function keepTicksInside(
  g: Selection<SVGGElement, unknown, null, undefined>,
  width: number,
): void {
  const ticks = g.selectAll<SVGGElement, unknown>('.tick').nodes();
  if (!ticks.length) return;
  d3.select(ticks[ticks.length - 1]).select('text').attr('text-anchor', 'end').attr('x', 2);
  d3.select(ticks[0]).select('text').attr('text-anchor', 'start').attr('x', -2);
  void width;
}

// ───────────────────────── Tornado ─────────────────────────

export interface TornadoItem {
  label: string;
  low: number;
  high: number;
  centre: number;
  status: string;
  lowLabel: string;
  highLabel: string;
}

export function drawTornado(el: HTMLElement, items: TornadoItem[], unit = 'ft'): void {
  const rowH = 30;
  const height = items.length * rowH + M.top + M.bottom + 10;
  const { svg, size } = svgFor(el, height);
  const left = Math.min(260, Math.max(130, size.width * 0.36));
  const inner = { width: size.width - left - M.right - 10, height: height - M.top - M.bottom - 10 };
  const g = svg.append('g').attr('transform', `translate(${left},${M.top})`);
  const tip = tooltip(el);

  const lo = Math.min(...items.map((i) => Math.min(i.low, i.high)), items[0]?.centre ?? 0);
  const hi = Math.max(...items.map((i) => Math.max(i.low, i.high)), items[0]?.centre ?? 1);
  const x = d3.scaleLinear().domain([lo, hi]).nice().range([0, inner.width]);
  const y = d3.scaleBand<string>().domain(items.map((i) => i.label)).range([0, inner.height]).padding(0.3);

  g.append('g')
    .attr('class', 'axis axis-y axis-cat')
    .call(d3.axisLeft(y).tickSize(0))
    .call((s) => s.select('.domain').remove())
    .call((s) => fitCategoryAxis(s as never, left - 14));
  g.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${inner.height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat((d) => num(d as number, 1)))
    .call((s) => s.select('.domain').remove())
    .call((s) => keepTicksInside(s as never, inner.width));

  const centre = items[0]?.centre ?? 0;
  g.append('line').attr('class', 'marker-line').attr('x1', x(centre)).attr('x2', x(centre)).attr('y1', 0).attr('y2', inner.height);

  g.selectAll('rect.tbar')
    .data(items)
    .join('rect')
    .attr('class', (d) => `tbar tbar-${d.status}`)
    .attr('x', (d) => x(Math.min(d.low, d.high)))
    .attr('y', (d) => y(d.label)!)
    .attr('height', y.bandwidth())
    .attr('width', (d) => Math.max(2, Math.abs(x(d.high) - x(d.low))))
    .on('mousemove', (event: MouseEvent, d) => {
      const [mx, my] = d3.pointer(event, g.node());
      tip.show(
        `<strong>${d.label}</strong><br>${d.lowLabel} → ${num(d.low, 2)} ${unit}<br>${d.highLabel} → ${num(d.high, 2)} ${unit}`,
        mx + left,
        my + M.top,
      );
    })
    .on('mouseleave', () => tip.hide());
}

// ───────────────────── Bars with a line on a second axis ─────────────────────

export function drawMonthly(
  el: HTMLElement,
  months: string[],
  bars: number[],
  line: number[],
  opts: { barLabel: string; lineLabel: string; height?: number } = { barLabel: '', lineLabel: '' },
): void {
  const height = opts.height ?? 260;
  const { svg, size } = svgFor(el, height);
  const right = 54;
  const inner = { width: size.width - M.left - right, height: height - M.top - M.bottom };
  const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);

  const x = d3.scaleBand<string>().domain(months).range([0, inner.width]).padding(0.25);
  const y1 = d3.scaleLinear().domain([0, Math.max(...bars, 0.01)]).nice().range([inner.height, 0]);
  const y2 = d3.scaleLinear().domain([0, Math.max(...line, 1)]).nice().range([inner.height, 0]);

  g.append('g')
    .attr('class', 'axis axis-y')
    .call(d3.axisLeft(y1).ticks(5).tickFormat((d) => `${num((d as number) * 100, 0)}%`))
    .call((s) => s.select('.domain').remove())
    .call((s) => s.selectAll('.tick line').attr('x2', inner.width).attr('class', 'grid'));
  g.append('g')
    .attr('class', 'axis axis-y2')
    .attr('transform', `translate(${inner.width},0)`)
    .call(d3.axisRight(y2).ticks(5).tickFormat((d) => num(d as number, 0)))
    .call((s) => s.select('.domain').remove());
  g.append('g')
    .attr('class', 'axis axis-x')
    .attr('transform', `translate(0,${inner.height})`)
    .call(d3.axisBottom(x))
    .call((s) => s.select('.domain').remove());

  g.selectAll('rect.mbar')
    .data(months.map((m, i) => ({ m, v: bars[i] })))
    .join('rect')
    .attr('class', 'mbar')
    .attr('x', (d) => x(d.m)!)
    .attr('width', x.bandwidth())
    .attr('y', (d) => y1(d.v))
    .attr('height', (d) => inner.height - y1(d.v));

  const path = d3
    .line<number>()
    .defined((d) => d > 0)
    .x((_, i) => x(months[i])! + x.bandwidth() / 2)
    .y((d) => y2(d))
    .curve(d3.curveMonotoneX);
  g.append('path').datum(line).attr('class', 'line-citations').attr('d', path);
}

/** A simple line, used for the budget sweep and the area curve. */
export function drawLine(
  el: HTMLElement,
  pts: { x: number; y: number; flag?: boolean }[],
  opts: { xLabel?: string; yLabel?: string; xFormat?: (v: number) => string; yFormat?: (v: number) => string; height?: number } = {},
): void {
  const height = opts.height ?? 260;
  const { svg, size } = svgFor(el, height);
  const inner = { width: size.width - M.left - M.right, height: height - M.top - M.bottom };
  const g = svg.append('g').attr('transform', `translate(${M.left},${M.top})`);
  const tip = tooltip(el);

  const x = d3.scaleLinear().domain(d3.extent(pts, (p) => p.x) as [number, number]).range([0, inner.width]);
  const y = d3.scaleLinear().domain([d3.min(pts, (p) => p.y)! * 0.98, d3.max(pts, (p) => p.y)! * 1.02]).nice().range([inner.height, 0]);
  axes(g, x, y, inner, { xFormat: opts.xFormat, yFormat: opts.yFormat });

  g.append('path')
    .datum(pts)
    .attr('class', 'line-lake')
    .attr(
      'd',
      d3
        .line<{ x: number; y: number }>()
        .x((p) => x(p.x))
        .y((p) => y(p.y))
        .curve(d3.curveMonotoneX),
    );

  g.selectAll('circle.pt')
    .data(pts)
    .join('circle')
    .attr('class', (d) => (d.flag ? 'pt pt-flag' : 'pt'))
    .attr('cx', (d) => x(d.x))
    .attr('cy', (d) => y(d.y))
    .attr('r', 4)
    .on('mousemove', (event: MouseEvent, d) => {
      const [mx, my] = d3.pointer(event, g.node());
      tip.show(
        `${opts.xFormat ? opts.xFormat(d.x) : num(d.x, 0)} → <strong>${opts.yFormat ? opts.yFormat(d.y) : num(d.y, 0)}</strong>`,
        mx + M.left,
        my + M.top,
      );
    })
    .on('mouseleave', () => tip.hide());
}

/** Evidence values against the model's default, for the calibration view. */
export function drawCalibration(
  el: HTMLElement,
  rows: { label: string; values: number[]; defaultValue: number; low?: number; high?: number; format: (v: number) => string }[],
): void {
  const rowH = 34;
  const height = rows.length * rowH + M.top + M.bottom;
  const { svg, size } = svgFor(el, height);
  const left = Math.min(250, Math.max(130, size.width * 0.35));
  const inner = { width: size.width - left - M.right - 60, height: height - M.top - M.bottom };
  const g = svg.append('g').attr('transform', `translate(${left},${M.top})`);
  const y = d3.scaleBand<string>().domain(rows.map((r) => r.label)).range([0, inner.height]).padding(0.4);
  g.append('g')
    .attr('class', 'axis axis-y axis-cat')
    .call(d3.axisLeft(y).tickSize(0))
    .call((s) => s.select('.domain').remove())
    .call((s) => fitCategoryAxis(s as never, left - 14));

  for (const row of rows) {
    const all = [...row.values, row.defaultValue, row.low ?? row.defaultValue, row.high ?? row.defaultValue].filter((v) => Number.isFinite(v));
    const x = d3.scaleLinear().domain([Math.min(...all), Math.max(...all)]).nice().range([0, inner.width]);
    const cy = y(row.label)! + y.bandwidth() / 2;
    g.append('line').attr('class', 'cal-axis').attr('x1', 0).attr('x2', inner.width).attr('y1', cy).attr('y2', cy);
    g.selectAll(null)
      .data(row.values)
      .join('circle')
      .attr('class', 'cal-evidence')
      .attr('cx', (d) => x(d))
      .attr('cy', cy)
      .attr('r', 5);
    const inRange = row.values.length > 0 && row.defaultValue >= Math.min(...row.values) && row.defaultValue <= Math.max(...row.values);
    g.append('path')
      .attr('class', inRange ? 'cal-default' : 'cal-default cal-default-out')
      .attr('d', d3.symbol(d3.symbolDiamond, 110)())
      .attr('transform', `translate(${x(row.defaultValue)},${cy})`);
    g.append('text')
      .attr('class', 'cal-value')
      .attr('x', inner.width + 8)
      .attr('y', cy + 4)
      .text(row.format(row.defaultValue));
  }
}

// ───────────────────────── Connections ─────────────────────────

export interface FlowNode {
  id: string;
  label: string;
  /** A short count or note drawn after the label. */
  tag?: string;
}

export interface FlowLink {
  from: string;
  to: string;
  /** How many coefficients ride this link; sets the stroke width. */
  weight: number;
}

/**
 * Three columns joined by curves: inputs on the left, the parts of the model in the middle, the
 * outputs on the right. A link's width is how many coefficients travel along it, so the heaviest
 * paths through the model stand out. Hovering a node lights up everything it touches.
 */
export function drawFlow(el: HTMLElement, columns: [FlowNode[], FlowNode[], FlowNode[]], links: FlowLink[]): void {
  const rowH = 24;
  const rows = Math.max(...columns.map((c) => c.length));
  const height = rows * rowH + 40;
  const { svg, size } = svgFor(el, height);
  const narrow = size.width < 560;
  const colW = (size.width - 16) / 3;
  const nodeW = colW - (narrow ? 14 : 34);
  const xs = [8, 8 + colW, 8 + 2 * colW];
  const pos = new Map<string, { x: number; y: number; col: number }>();
  columns.forEach((col, c) => {
    const offset = ((rows - col.length) * rowH) / 2;
    col.forEach((n, i) => pos.set(n.id, { x: xs[c], y: 24 + offset + i * rowH, col: c }));
  });

  const maxW = Math.max(1, ...links.map((l) => l.weight));
  const linkG = svg.append('g').attr('fill', 'none');
  const paths = linkG
    .selectAll('path')
    .data(links.filter((l) => pos.has(l.from) && pos.has(l.to)))
    .join('path')
    .attr('d', (l) => {
      const a = pos.get(l.from)!;
      const b = pos.get(l.to)!;
      const x1 = a.x + nodeW;
      const y1 = a.y + rowH / 2 - 3;
      const x2 = b.x;
      const y2 = b.y + rowH / 2 - 3;
      const mx = (x1 + x2) / 2;
      return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    })
    .attr('stroke', 'var(--c1)')
    .attr('stroke-opacity', 0.28)
    .attr('stroke-width', (l) => 1 + (l.weight / maxW) * 7);
  paths.append('title').text((l) => `${l.weight} coefficient${l.weight === 1 ? '' : 's'}`);

  const nodeG = svg.append('g');
  const all = columns.flat();
  const nodes = nodeG
    .selectAll('g')
    .data(all)
    .join('g')
    .attr('transform', (n) => `translate(${pos.get(n.id)!.x},${pos.get(n.id)!.y})`)
    .style('cursor', 'default');
  nodes
    .append('rect')
    .attr('width', nodeW)
    .attr('height', rowH - 6)
    .attr('rx', 4)
    .attr('fill', 'var(--panel)')
    .attr('stroke', 'var(--line)');
  nodes
    .append('text')
    .attr('x', 6)
    .attr('y', rowH / 2 + 1)
    .attr('font-size', narrow ? 10 : 11.5)
    .attr('fill', 'var(--ink)')
    .text((n) => fitLabel(n.tag ? `${n.label} · ${n.tag}` : n.label, nodeW - 10))
    .append('title')
    .text((n) => (n.tag ? `${n.label} · ${n.tag}` : n.label));

  // Hover a node: keep its links, fade the rest.
  nodes
    .on('mouseenter', (_e, n) => {
      paths.attr('stroke-opacity', (l) => (l.from === n.id || l.to === n.id ? 0.75 : 0.06));
    })
    .on('mouseleave', () => paths.attr('stroke-opacity', 0.28));

  const heads = ['Inputs, by group', 'Part of the model', 'What it decides'];
  heads.forEach((h, c) =>
    svg.append('text').attr('x', xs[c]).attr('y', 14).attr('font-size', 11).attr('fill', 'var(--ink-3)').text(fitLabel(h, nodeW)),
  );
}

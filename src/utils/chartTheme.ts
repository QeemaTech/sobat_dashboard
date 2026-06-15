import { useMemo } from 'react';
import { CHART_COLORS } from './constants';
import { useThemeMode } from '@/hooks/useThemeMode';

function readCssRgb(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  return `rgb(${raw.replace(/\s+/g, ', ')})`;
}

export function getChartStyles(mode: 'light' | 'dark') {
  const isLight = mode === 'light';
  const grid = isLight ? '#E2E8F0' : CHART_COLORS.grid;
  const tooltipBg = isLight ? '#FFFFFF' : CHART_COLORS.card;
  const tooltipText = isLight ? '#0F172A' : '#FFFFFF';
  const tickFill = isLight ? '#64748B' : '#8892B0';

  return {
    tooltip: {
      backgroundColor: tooltipBg,
      border: `1px solid ${grid}`,
      borderRadius: 8,
      color: tooltipText,
      fontSize: 12,
      boxShadow: isLight ? '0 4px 12px rgba(15, 23, 42, 0.08)' : 'none',
    },
    axis: {
      stroke: grid,
      tick: { fill: tickFill, fontSize: 11 },
    },
    grid: {
      stroke: grid,
      strokeDasharray: '3 3',
    },
  };
}

/** Reads live CSS variables (updates when html.light / html.dark toggles). */
export function useChartStyles() {
  const { mode } = useThemeMode();

  return useMemo(() => {
    const base = getChartStyles(mode);
    return {
      tooltipStyle: {
        ...base.tooltip,
        backgroundColor: readCssRgb('--sobat-chart-tooltip-bg', base.tooltip.backgroundColor as string),
        color: readCssRgb('--sobat-chart-tooltip-text', base.tooltip.color as string),
      },
      axisStyle: {
        ...base.axis,
        stroke: readCssRgb('--sobat-chart-grid', base.axis.stroke as string),
        tick: {
          ...base.axis.tick,
          fill: readCssRgb('--sobat-text-muted', base.axis.tick.fill as string),
        },
      },
      gridProps: {
        ...base.grid,
        stroke: readCssRgb('--sobat-chart-grid', base.grid.stroke as string),
      },
      legendStyle: {
        color: readCssRgb('--sobat-text-muted', base.axis.tick.fill as string),
        fontSize: 12,
      },
    };
  }, [mode]);
}

/** @deprecated Use useChartStyles() for theme-aware charts */
export const chartTooltipStyle = getChartStyles('dark').tooltip;
export const chartAxisStyle = getChartStyles('dark').axis;
export const chartGridProps = getChartStyles('dark').grid;

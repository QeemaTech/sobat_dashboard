import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard } from './ChartCard';
import { ChartContainer } from './ChartContainer';
import { useChartStyles } from '@/utils/chartTheme';
import { CHART_COLORS } from '@/utils/constants';
import { formatCurrency, formatMonthLabel } from '@/utils/formatters';

const CHART_HEIGHT = 320;

interface RevenueLineChartProps {
  title: string;
  data: { month: string; revenue: number }[];
}

export function RevenueLineChart({ title, data }: RevenueLineChartProps) {
  const { tooltipStyle, axisStyle, gridProps } = useChartStyles();
  const chartData = data.length ? data : [{ month: '—', revenue: 0 }];

  return (
    <ChartCard title={title}>
      <ChartContainer height={CHART_HEIGHT}>
        <LineChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="month" tickFormatter={formatMonthLabel} {...axisStyle} tickMargin={8} />
          <YAxis {...axisStyle} width={52} tickMargin={4} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(l) => formatMonthLabel(String(l))}
            formatter={(v) => [formatCurrency(Number(v ?? 0)), '']}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={CHART_COLORS.secondary}
            strokeWidth={2.5}
            dot={{ r: 4, fill: CHART_COLORS.secondary, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}

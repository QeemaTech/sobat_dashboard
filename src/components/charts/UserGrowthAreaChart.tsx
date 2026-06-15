import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartCard } from './ChartCard';
import { ChartContainer } from './ChartContainer';
import { useChartStyles } from '@/utils/chartTheme';
import { CHART_COLORS } from '@/utils/constants';
import { formatShortDate } from '@/utils/formatters';

const CHART_HEIGHT = 320;

interface UserGrowthAreaChartProps {
  title: string;
  data: { date: string; count: number }[];
}

export function UserGrowthAreaChart({ title, data }: UserGrowthAreaChartProps) {
  const { tooltipStyle, axisStyle, gridProps } = useChartStyles();
  const chartData = data.length ? data : [{ date: new Date().toISOString(), count: 0 }];

  return (
    <ChartCard title={title}>
      <ChartContainer height={CHART_HEIGHT}>
        <BarChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }} barCategoryGap="20%">
          <CartesianGrid {...gridProps} vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatShortDate} {...axisStyle} tickMargin={8} />
          <YAxis allowDecimals={false} {...axisStyle} width={44} tickMargin={4} />
          <Tooltip contentStyle={tooltipStyle} labelFormatter={(l) => formatShortDate(String(l))} />
          <Bar dataKey="count" fill={CHART_COLORS.secondary} radius={[6, 6, 0, 0]} maxBarSize={48} isAnimationActive={false} />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

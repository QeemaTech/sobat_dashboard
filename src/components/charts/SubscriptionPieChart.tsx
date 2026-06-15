import { Box, Typography } from '@mui/material';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';
import { ChartContainer } from './ChartContainer';
import { useChartStyles } from '@/utils/chartTheme';
import { CHART_COLORS } from '@/utils/constants';
import type { SubscriptionStatus } from '@/types';

interface SubscriptionPieChartProps {
  title: string;
  stats: Record<SubscriptionStatus, number>;
  labels: Record<SubscriptionStatus, string>;
}

const ORDER: SubscriptionStatus[] = ['ACTIVE', 'TRIAL', 'PENDING', 'EXPIRED', 'CANCELLED'];
const EMPTY_COLOR = '#E5E7EB';
const CHART_HEIGHT = 320;

export function SubscriptionPieChart({ title, stats, labels }: SubscriptionPieChartProps) {
  const { tooltipStyle } = useChartStyles();
  const data = ORDER.map((status) => ({
    status,
    name: labels[status],
    value: stats[status] ?? 0,
  })).filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);
  const hasData = total > 0;
  const pieData = hasData ? data : [{ status: 'ACTIVE' as SubscriptionStatus, name: '—', value: 1 }];

  return (
    <ChartCard title={title}>
      <ChartContainer height={CHART_HEIGHT}>
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={110}
            paddingAngle={hasData ? 2 : 0}
            stroke="none"
            isAnimationActive={false}
          >
            {pieData.map((entry) => (
              <Cell
                key={entry.status}
                fill={hasData ? CHART_COLORS.subscription[entry.status] : EMPTY_COLOR}
              />
            ))}
          </Pie>
          {hasData && <Tooltip contentStyle={tooltipStyle} />}
        </PieChart>
      </ChartContainer>
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
        {ORDER.map((status) => (
          <Typography key={status} sx={{ fontSize: 13, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: CHART_COLORS.subscription[status],
                flexShrink: 0,
              }}
            />
            {labels[status]} ({stats[status] ?? 0})
          </Typography>
        ))}
      </Box>
    </ChartCard>
  );
}

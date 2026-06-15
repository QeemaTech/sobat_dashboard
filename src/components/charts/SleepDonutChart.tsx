import { Box, Typography } from '@mui/material';
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { ChartCard } from './ChartCard';
import { ChartContainer } from './ChartContainer';
import { useChartStyles } from '@/utils/chartTheme';
import { CHART_COLORS } from '@/utils/constants';

const EMPTY_COLOR = '#E5E7EB';
const CHART_HEIGHT = 320;

interface SleepDonutChartProps {
  title: string;
  subtitle?: string;
  data: { name: string; zone: string; value: number }[];
}

export function SleepDonutChart({ title, subtitle, data }: SleepDonutChartProps) {
  const { tooltipStyle } = useChartStyles();
  const total = data.reduce((s, d) => s + d.value, 0);
  const hasData = total > 0;
  const pieData = hasData ? data : [{ name: '—', zone: 'EMPTY', value: 1 }];

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ChartContainer
        height={CHART_HEIGHT}
        overlay={
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: 'text.primary' }}>
              {total}
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              Total
            </Typography>
          </Box>
        }
      >
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={110}
            paddingAngle={hasData ? 3 : 0}
            stroke="none"
            isAnimationActive={false}
          >
            {pieData.map((entry) => (
              <Cell
                key={entry.zone}
                fill={
                  hasData
                    ? CHART_COLORS.zones[entry.zone as keyof typeof CHART_COLORS.zones] ?? CHART_COLORS.primary
                    : EMPTY_COLOR
                }
              />
            ))}
          </Pie>
          {hasData && <Tooltip contentStyle={tooltipStyle} />}
        </PieChart>
      </ChartContainer>
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
        {data.map((z) => (
          <Typography key={z.zone} sx={{ fontSize: 13, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: CHART_COLORS.zones[z.zone as keyof typeof CHART_COLORS.zones],
                flexShrink: 0,
              }}
            />
            {z.name} ({z.value})
          </Typography>
        ))}
      </Box>
    </ChartCard>
  );
}

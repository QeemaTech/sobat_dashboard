import { useId } from 'react';
import { Box } from '@mui/material';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import type { SleepDebtZoneLevel } from './SleepDebtCumulativeBadge';
import { ZONE_STYLES } from './SleepDebtCumulativeBadge';

interface DebtSparklineProps {
  data: number[];
  zone: SleepDebtZoneLevel;
  width?: number;
  height?: number;
}

export function DebtSparkline({ data, zone, width = 100, height = 36 }: DebtSparklineProps) {
  const gradientId = useId().replace(/:/g, '');
  const values = data.filter((v) => Number.isFinite(v));

  if (!values.length) {
    return (
      <Box sx={{ width, height, display: 'flex', alignItems: 'center', color: 'text.disabled', fontSize: 12 }}>—</Box>
    );
  }

  const { stroke } = ZONE_STYLES[zone];
  const chartData = values.map((value, i) => ({ i, value }));

  return (
    <Box sx={{ width, height, flexShrink: 0, minWidth: width }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.15} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

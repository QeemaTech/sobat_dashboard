import { Box } from '@mui/material';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { CHART_COLORS } from '@/utils/constants';

interface SparklineProps {
  data: { value: number }[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = CHART_COLORS.primary, height = 48 }: SparklineProps) {
  if (!data.length) return null;
  const id = `spark-${color.replace('#', '')}`;

  return (
    <Box sx={{ width: '100%', height, overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${id})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

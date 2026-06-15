import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { ResponsiveContainer } from 'recharts';

interface ChartContainerProps {
  height?: number;
  children: React.ReactElement;
  overlay?: React.ReactNode;
}

/**
 * Bounded chart wrapper — always passes explicit pixel height to Recharts
 * (height="100%" causes runaway SVG sizing in flex/grid layouts).
 */
export function ChartContainer({ height = 320, children, overlay }: ChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const next = Math.floor(el.getBoundingClientRect().width);
      if (next > 0) setWidth(next);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height,
        minWidth: 0,
        maxHeight: height,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        isolation: 'isolate',
      }}
    >
      {width > 0 && (
        <ResponsiveContainer width={width} height={height}>
          {children}
        </ResponsiveContainer>
      )}
      {overlay}
    </Box>
  );
}

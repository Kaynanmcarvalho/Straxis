import React from 'react';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  AreaChart as RechartsAreaChart,
  PieChart as RechartsPieChart,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';

// Theme colors
const CHART_COLORS = {
  primary: '#2196f3',
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#03a9f4',
  purple: '#9c27b0',
  teal: '#009688',
  indigo: '#3f51b5',
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.error,
  CHART_COLORS.purple,
  CHART_COLORS.teal,
  CHART_COLORS.indigo,
];

// Custom tooltip
interface CustomTooltipProps extends TooltipProps<any, any> {
  formatter?: (value: any) => string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  formatter,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-neutral-600 dark:text-neutral-400">
              {entry.name}:
            </span>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {formatter ? formatter(entry.value) : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Line Chart Component
interface LineChartProps {
  data: any[];
  lines: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  xAxisKey: string;
  height?: number;
  formatter?: (value: any) => string;
  showGrid?: boolean;
  showLegend?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  lines,
  xAxisKey,
  height = 300,
  formatter,
  showGrid = true,
  showLegend = true,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
        )}
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--color-text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--color-text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            name={line.name}
            stroke={line.color || Object.values(CHART_COLORS)[index]}
            strokeWidth={2}
            dot={{ fill: line.color || Object.values(CHART_COLORS)[index], r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: any[];
  bars: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  xAxisKey: string;
  height?: number;
  formatter?: (value: any) => string;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  bars,
  xAxisKey,
  height = 300,
  formatter,
  showGrid = true,
  showLegend = true,
  stacked = false,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
        )}
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--color-text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--color-text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name}
            fill={bar.color || Object.values(CHART_COLORS)[index]}
            radius={[8, 8, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// Area Chart Component
interface AreaChartProps {
  data: any[];
  areas: Array<{
    dataKey: string;
    name: string;
    color?: string;
  }>;
  xAxisKey: string;
  height?: number;
  formatter?: (value: any) => string;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  areas,
  xAxisKey,
  height = 300,
  formatter,
  showGrid = true,
  showLegend = true,
  stacked = false,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" />
        )}
        <XAxis
          dataKey={xAxisKey}
          stroke="var(--color-text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--color-text-secondary)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
        {areas.map((area, index) => (
          <Area
            key={area.dataKey}
            type="monotone"
            dataKey={area.dataKey}
            name={area.name}
            stroke={area.color || Object.values(CHART_COLORS)[index]}
            fill={area.color || Object.values(CHART_COLORS)[index]}
            fillOpacity={0.6}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

// Pie Chart Component
interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  height?: number;
  formatter?: (value: any) => string;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 300,
  formatter,
  showLegend = true,
  innerRadius = 0,
  outerRadius = 80,
}) => {
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: 'bold' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

// Donut Chart (Pie with inner radius)
export const DonutChart: React.FC<PieChartProps> = (props) => {
  return <PieChart {...props} innerRadius={60} outerRadius={80} />;
};

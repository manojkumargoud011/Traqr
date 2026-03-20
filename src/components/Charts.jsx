import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';

const STATUS_COLORS = {
  Applied: '#3b82f6',
  Shortlisted: '#f59e0b',
  Interview: '#a855f7',
  Offer: '#10b981',
  Rejected: '#f43f5e',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-xl px-4 py-2.5 shadow-xl text-sm">
        <p className="font-semibold text-ink-900 dark:text-white">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-ink-500 dark:text-ink-400">
            {p.name}: <span className="font-semibold text-ink-700 dark:text-ink-200">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 rounded-xl px-4 py-2.5 shadow-xl text-sm">
        <p className="font-semibold text-ink-900 dark:text-white">{payload[0].name}</p>
        <p className="text-ink-500 dark:text-ink-400">
          Count: <span className="font-semibold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function BarChartView({ data, title, dataKey = 'count', barColor = '#1c1914' }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-ink-900 dark:text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#8e8778' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#8e8778' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey={dataKey}
            fill={barColor}
            radius={[6, 6, 0, 0]}
            className="dark:fill-amber-400"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPieChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center h-64">
        <p className="text-ink-400 text-sm">No data yet</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold text-ink-900 dark:text-white mb-4">Status Distribution</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={STATUS_COLORS[entry.name] || '#8e8778'}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-ink-600 dark:text-ink-400">{value}</span>
            )}
            iconType="circle"
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
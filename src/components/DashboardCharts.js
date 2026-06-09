import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  formatCurrency,
  formatCompactAmount,
  formatKpiRevenue,
  formatMillionAxis,
  formatPercent,
  formatRatioPercent,
} from '../utils/formatters';
import {
  aggregateByField,
  aggregateProductWithOther,
  aggregateRevenueByMonthWithGrowth,
  aggregateStartsByMonth,
  aggregateCumulativeRevenue,
} from '../utils/stats';

const COLORS = [
  '#3b82f6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
];

function ChartHeader({ title, unit }) {
  return (
    <div className="chart-header">
      <h3>{title}</h3>
      {unit && <span className="chart-unit">{unit}</span>}
    </div>
  );
}

function RevenueCountTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label || item.name}</p>
      <p>{formatCurrency(item.revenue ?? item.value)}</p>
      <p>{(item.count ?? 0).toLocaleString('ko-KR')}건</p>
    </div>
  );
}

function CountBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label || payload[0].payload?.name}</p>
      <p>{payload[0].value.toLocaleString('ko-KR')}건</p>
    </div>
  );
}

function ProductDoughnutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{item.name}</p>
      <p>{formatCurrency(item.value)}</p>
      <p>{formatPercent(item.percent, 1)}</p>
    </div>
  );
}

function MonthlyRevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p>{formatCurrency(item.revenue)}</p>
      {item.growth != null && (
        <p>전월 대비 {formatRatioPercent(item.growth)}</p>
      )}
    </div>
  );
}

function CumulativeTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      <p>{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function renderPercentLabel({ percent, cx, cy, midAngle, innerRadius, outerRadius }) {
  if (percent < 0.04) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {(percent * 100).toFixed(1)}%
    </text>
  );
}

function RevenueBarChart({ title, data, color }) {
  return (
    <div className="chart-card">
      <ChartHeader title={title} unit="단위 : 백만원" />
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 24, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
          <YAxis
            tickFormatter={formatMillionAxis}
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            width={56}
          />
          <Tooltip content={<RevenueCountTooltip />} />
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="value"
              position="top"
              formatter={formatCompactAmount}
              style={{ fontSize: 11, fill: 'var(--text-secondary)' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ProductDoughnutChart({ rows }) {
  const { items, total } = aggregateProductWithOther(rows);

  if (items.length === 0) {
    return (
      <div className="chart-card">
        <ChartHeader title="상품별 매출" />
        <p className="chart-empty">표시할 데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="chart-card chart-card-doughnut">
      <ChartHeader title="상품별 매출" />
      <div className="doughnut-layout">
        <div className="doughnut-chart-wrap">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={items}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={110}
                paddingAngle={2}
                label={renderPercentLabel}
                labelLine={false}
              >
                {items.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<ProductDoughnutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="doughnut-center">
            <span>총 매출</span>
            <strong>{formatKpiRevenue(total)}</strong>
          </div>
        </div>
        <div className="doughnut-legend">
          <div className="doughnut-legend-header">
            <span>상품명</span>
            <span>매출액</span>
            <span>비중</span>
          </div>
          {items.map((item, index) => (
            <div key={item.name} className="doughnut-legend-row">
              <span className="legend-name">
                <i style={{ background: COLORS[index % COLORS.length] }} />
                {item.name}
              </span>
              <span>{formatCurrency(item.value)}</span>
              <span>{formatPercent(item.percent, 1)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardCharts({ rows }) {
  const regionData = aggregateByField(rows, 'Region');
  const contractData = aggregateByField(rows, 'Contract');
  const insuranceData = aggregateByField(rows, 'Insurance');
  const ageData = aggregateByField(rows, 'Age', 'count');
  const monthlyStarts = aggregateStartsByMonth(rows);
  const monthlyRevenue = aggregateRevenueByMonthWithGrowth(rows);
  const cumulativeRevenue = aggregateCumulativeRevenue(rows);

  return (
    <section className="charts-section">
      <RevenueBarChart title="지역별 매출" data={regionData} color="#3b82f6" />
      <RevenueBarChart title="계약형태별 매출" data={contractData} color="#06b6d4" />
      <ProductDoughnutChart rows={rows} />
      <RevenueBarChart title="보험종류별 매출" data={insuranceData} color="#10b981" />

      <div className="chart-card">
        <ChartHeader title="연령별 계약건수" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ageData} margin={{ top: 24, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              width={40}
            />
            <Tooltip content={<CountBarTooltip />} />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="value"
                position="top"
                formatter={(v) => `${v}건`}
                style={{ fontSize: 11, fill: 'var(--text-secondary)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card chart-card-wide">
        <ChartHeader title="월별 계약 시작 건수" />
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={monthlyStarts} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <Tooltip content={<CountBarTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              name="계약 시작 건수"
              stroke="#059669"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card chart-card-wide">
        <ChartHeader title="월별 매출 추이" unit="단위 : 백만원" />
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={monthlyRevenue} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis
              tickFormatter={formatMillionAxis}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              width={56}
            />
            <Tooltip content={<MonthlyRevenueTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              name="매출액"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card chart-card-wide">
        <ChartHeader title="누적 매출 추이" unit="단위 : 백만원" />
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={cumulativeRevenue} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis
              tickFormatter={formatMillionAxis}
              tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
              width={56}
            />
            <Tooltip content={<CumulativeTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="누적 매출"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default DashboardCharts;

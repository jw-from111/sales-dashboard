import {
  formatKpiRevenue,
  formatNumber,
  formatCurrency,
} from '../utils/formatters';

function KpiCards({ stats }) {
  const cards = [
    { label: '총 매출', value: formatKpiRevenue(stats.totalRevenue), highlight: true },
    { label: '계약 건수', value: `${formatNumber(stats.contractCount)}건` },
    { label: '활성 계약 수', value: `${formatNumber(stats.activeCount)}건` },
    { label: '평균 월금액', value: formatCurrency(stats.avgPaid) },
    { label: '평균 계약개월', value: `${formatNumber(stats.avgMonth, 1)}개월` },
    { label: '평균 계약금액', value: formatKpiRevenue(stats.avgContractAmount) },
    { label: '30일 이내 만기', value: `${formatNumber(stats.expiring30Count)}건`, warn: true },
  ];

  return (
    <section className="kpi-section">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`kpi-card ${card.highlight ? 'kpi-card-highlight' : ''} ${card.warn ? 'kpi-card-warn' : ''}`}
        >
          <span className="kpi-label">{card.label}</span>
          <span className="kpi-value">{card.value}</span>
        </div>
      ))}
    </section>
  );
}

export default KpiCards;

import {
  formatKpiRevenue,
  formatNumber,
  formatRatioPercent,
} from '../utils/formatters';

function InsightCards({ insights }) {
  const items = [
    {
      title: '매출 1위 지역',
      value: insights.topRegion,
      sub: formatKpiRevenue(insights.topRegionRevenue),
    },
    {
      title: '매출 1위 상품',
      value: insights.topProduct,
      sub: formatKpiRevenue(insights.topProductRevenue),
    },
    {
      title: '최고 평균 계약금액 상품',
      value: insights.highestAvgProduct,
      sub: formatKpiRevenue(insights.highestAvgAmount),
    },
    {
      title: '평균 계약기간',
      value: `${formatNumber(insights.avgDuration, 1)}개월`,
      sub: '전체 계약 기준',
    },
    {
      title: '30일 이내 만기',
      value: `${formatNumber(insights.expiring30)}건`,
      sub: '만기 임박 계약',
    },
    {
      title: '전월 대비 매출 성장률',
      value: formatRatioPercent(insights.revenueGrowth),
      sub: insights.revenueGrowth != null ? '최근 월 기준' : '비교 데이터 부족',
    },
    {
      title: '전월 대비 계약건수 성장률',
      value: formatRatioPercent(insights.countGrowth),
      sub: insights.countGrowth != null ? '최근 월 기준' : '비교 데이터 부족',
    },
  ];

  return (
    <section className="insight-section">
      <div className="section-header compact">
        <div>
          <h2>자동 인사이트</h2>
          <p className="section-desc">업로드 데이터 기반 핵심 요약</p>
        </div>
      </div>
      <div className="insight-grid">
        {items.map((item) => (
          <div key={item.title} className="insight-card">
            <span className="insight-title">{item.title}</span>
            <strong className="insight-value">{item.value}</strong>
            <span className="insight-sub">{item.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default InsightCards;

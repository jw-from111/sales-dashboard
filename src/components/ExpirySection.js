import { useMemo, useState } from 'react';

const TABS = [
  { key: 60, label: '60일 이내' },
  { key: 30, label: '30일 이내' },
  { key: 7, label: '7일 이내' },
];

function ExpirySection({ expiryStats, allExpiringRows }) {
  const [activeTab, setActiveTab] = useState(60);

  const filteredRows = useMemo(
    () => allExpiringRows.filter((row) => row._dDay <= activeTab),
    [allExpiringRows, activeTab]
  );

  const kpis = [
    { label: '7일 이내 만기', value: expiryStats.within7, urgent: true },
    { label: '30일 이내 만기', value: expiryStats.within30, urgent: false },
    { label: '60일 이내 만기', value: expiryStats.within60, urgent: false },
  ];

  return (
    <section className="section-card expiry-section">
      <div className="section-header">
        <div>
          <h2>만기 관리</h2>
          <p className="section-desc">종료일 기준 만기 예정 계약을 모니터링합니다.</p>
        </div>
      </div>

      <div className="expiry-kpi-row">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`expiry-kpi ${kpi.urgent ? 'expiry-kpi-urgent' : ''}`}
          >
            <span>{kpi.label}</span>
            <strong>{kpi.value.toLocaleString('ko-KR')}건</strong>
          </div>
        ))}
      </div>

      <div className="expiry-table-header">
        <h3 className="subsection-title">만기 예정 계약</h3>
        <div className="tab-group">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? 'active' : ''}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>지역</th>
              <th>상품</th>
              <th>계약 형태</th>
              <th>연령</th>
              <th>보험 종류</th>
              <th>종료일</th>
              <th>월 금액</th>
              <th>계약매출액</th>
              <th>D-Day</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-row">
                  {activeTab}일 이내 만기 예정 계약이 없습니다.
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className={row._dDay <= 7 ? 'row-urgent' : ''}
                >
                  <td>{row.Region || '-'}</td>
                  <td>{row.Product || '-'}</td>
                  <td>{row.Contract || '-'}</td>
                  <td>{row.Age ?? '-'}</td>
                  <td>{row.Insurance || '-'}</td>
                  <td>{row._endFormatted}</td>
                  <td>{row._paidFormatted}</td>
                  <td>{row._revenueFormatted}</td>
                  <td>
                    <span className={`dday-badge ${row._dDay <= 7 ? 'dday-urgent' : ''}`}>
                      {row._dDayLabel}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ExpirySection;

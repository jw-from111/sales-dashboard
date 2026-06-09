import { useMemo, useState } from 'react';
import {
  formatCurrency,
  formatCompactAmount,
  formatKpiRevenue,
  formatNumber,
} from '../utils/formatters';
import {
  buildRegionProductMatrix,
  computeTopProducts,
  computeRegionalPerformance,
  computeInsurancePerformance,
} from '../utils/stats';

function AnalysisTables({ rows }) {
  const [matrixMode, setMatrixMode] = useState('revenue');

  const matrix = useMemo(
    () => buildRegionProductMatrix(rows, matrixMode),
    [rows, matrixMode]
  );
  const topProducts = useMemo(() => computeTopProducts(rows, 10), [rows]);
  const regional = useMemo(() => computeRegionalPerformance(rows), [rows]);
  const insurance = useMemo(() => computeInsurancePerformance(rows), [rows]);

  const formatMatrixCell = (value) => {
    if (matrixMode === 'revenue') {
      return value > 0 ? formatCompactAmount(value) : '-';
    }
    return value > 0 ? `${value}건` : '-';
  };

  return (
    <section className="analysis-section">
      <div className="section-card">
        <div className="section-header">
          <div>
            <h2>지역 × 상품 매트릭스</h2>
            <p className="section-desc">지역과 상품 교차 분석</p>
          </div>
          <div className="toggle-group">
            <button
              type="button"
              className={matrixMode === 'revenue' ? 'active' : ''}
              onClick={() => setMatrixMode('revenue')}
            >
              매출액
            </button>
            <button
              type="button"
              className={matrixMode === 'count' ? 'active' : ''}
              onClick={() => setMatrixMode('count')}
            >
              계약건수
            </button>
          </div>
        </div>
        <div className="table-wrapper matrix-wrapper">
          <table className="data-table matrix-table">
            <thead>
              <tr>
                <th>지역</th>
                {matrix.products.map((product) => (
                  <th key={product}>{product}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.matrix.length === 0 ? (
                <tr>
                  <td colSpan={matrix.products.length + 1} className="empty-row">
                    표시할 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                matrix.matrix.map((row) => (
                  <tr key={row.region}>
                    <td className="matrix-row-label">{row.region}</td>
                    {matrix.products.map((product) => (
                      <td key={product}>{formatMatrixCell(row[product] ?? 0)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="analysis-grid">
        <div className="section-card">
          <div className="section-header compact">
            <h2>Top 10 상품</h2>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>상품</th>
                  <th>계약건수</th>
                  <th>총 매출</th>
                  <th>평균 계약금액</th>
                  <th>평균 계약개월</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      데이터 없음
                    </td>
                  </tr>
                ) : (
                  topProducts.map((row) => (
                    <tr key={row.product}>
                      <td>{row.product}</td>
                      <td>{row.count.toLocaleString('ko-KR')}건</td>
                      <td>{formatCurrency(row.revenue)}</td>
                      <td>{formatKpiRevenue(row.avgAmount)}</td>
                      <td>{formatNumber(row.avgMonth, 1)}개월</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header compact">
            <h2>지역별 성과</h2>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>지역</th>
                  <th>계약건수</th>
                  <th>총 매출</th>
                  <th>평균 계약금액</th>
                  <th>평균 월금액</th>
                  <th>평균 계약개월</th>
                </tr>
              </thead>
              <tbody>
                {regional.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      데이터 없음
                    </td>
                  </tr>
                ) : (
                  regional.map((row) => (
                    <tr key={row.region}>
                      <td>{row.region}</td>
                      <td>{row.count.toLocaleString('ko-KR')}건</td>
                      <td>{formatCurrency(row.revenue)}</td>
                      <td>{formatKpiRevenue(row.avgAmount)}</td>
                      <td>{formatCurrency(row.avgPaid)}</td>
                      <td>{formatNumber(row.avgMonth, 1)}개월</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section-card">
          <div className="section-header compact">
            <h2>보험별 평균 계약금액</h2>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>보험 종류</th>
                  <th>계약건수</th>
                  <th>총 매출</th>
                  <th>평균 계약금액</th>
                </tr>
              </thead>
              <tbody>
                {insurance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="empty-row">
                      데이터 없음
                    </td>
                  </tr>
                ) : (
                  insurance.map((row) => (
                    <tr key={row.insurance}>
                      <td>{row.insurance}</td>
                      <td>{row.count.toLocaleString('ko-KR')}건</td>
                      <td>{formatCurrency(row.revenue)}</td>
                      <td>{formatKpiRevenue(row.avgAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnalysisTables;

const FILTER_FIELDS = [
  { key: 'StartYear', label: '계약 시작 연도' },
  { key: 'Region', label: '지역' },
  { key: 'Contract', label: '계약 형태' },
  { key: 'Product', label: '상품' },
  { key: 'Age', label: '연령' },
  { key: 'Insurance', label: '보험 종류' },
];

function Filters({ filters, options, onChange, onReset }) {
  return (
    <section className="filters-section">
      <div className="filters-header">
        <h2>필터</h2>
        <button type="button" className="reset-button" onClick={onReset}>
          필터 초기화
        </button>
      </div>
      <div className="filters-grid">
        {FILTER_FIELDS.map(({ key, label }) => (
          <label key={key} className="filter-item">
            <span>{label}</span>
            <select
              value={filters[key]}
              onChange={(event) => onChange(key, event.target.value)}
            >
              <option value="">전체</option>
              {(options[key] || []).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}

export default Filters;

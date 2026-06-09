function DashboardHeader({
  fileName,
  darkMode,
  isDemoMode,
  loadingSample,
  sampleDataUrl,
  onToggleDarkMode,
  onFileSelect,
  onReloadSample,
  error,
  warning,
}) {
  const handleChange = (event) => {
    const file = event.target.files?.[0];
    if (file) onFileSelect(file);
    event.target.value = '';
  };

  return (
    <>
      {isDemoMode && (
        <div className="demo-banner" role="status">
          <div className="demo-banner-inner">
            <div className="demo-banner-text">
              <strong>데모 데이터 표시 중</strong>
              <span>
                현재 표시되는 데이터는 포트폴리오용 가상 데이터이며, 실제 영업 실적과
                무관합니다.
              </span>
            </div>
            <div className="demo-banner-actions">
              <button
                type="button"
                className="demo-btn"
                onClick={onReloadSample}
                disabled={loadingSample}
              >
                샘플 데이터 다시 보기
              </button>
              <a className="demo-btn demo-btn-download" href={sampleDataUrl} download="sample-data.xlsx">
                샘플 엑셀 다운로드
              </a>
            </div>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div className="header-main">
          <div>
            <p className="header-badge">경영 보고용</p>
            <h1 className="dashboard-title">영업 실적 관리 대시보드</h1>
            <p className="dashboard-subtitle">
              엑셀 파일(.xlsx, .xls)을 업로드하면 매출·상품·만기 현황을 한 화면에서
              확인합니다. 처음 접속 시 샘플 데이터가 자동으로 표시됩니다.
            </p>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={onToggleDarkMode}
              aria-label={darkMode ? '라이트 모드' : '다크 모드'}
            >
              {darkMode ? '☀️ 라이트' : '🌙 다크'}
            </button>
            {!isDemoMode && (
              <button
                type="button"
                className="secondary-button"
                onClick={onReloadSample}
                disabled={loadingSample}
              >
                샘플 데이터 다시 보기
              </button>
            )}
            <a className="secondary-button secondary-link" href={sampleDataUrl} download="sample-data.xlsx">
              샘플 엑셀 다운로드
            </a>
            <label className="upload-button">
              <input
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleChange}
                className="upload-input"
                disabled={loadingSample}
              />
              엑셀 업로드
            </label>
          </div>
        </div>

        {fileName && (
          <p className="file-name">
            현재 파일: <strong>{fileName}</strong>
            {isDemoMode && <span className="file-demo-tag"> · 데모</span>}
          </p>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        {warning && <div className="alert alert-warning">{warning}</div>}
      </header>
    </>
  );
}

export default DashboardHeader;

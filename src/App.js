import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import DashboardHeader from './components/DashboardHeader';
import KpiCards from './components/KpiCards';
import InsightCards from './components/InsightCards';
import Filters from './components/Filters';
import DashboardCharts from './components/DashboardCharts';
import AnalysisTables from './components/AnalysisTables';
import ExpirySection from './components/ExpirySection';
import {
  fetchAndParseSampleData,
  parseExcelFile,
  SAMPLE_DATA_FILENAME,
  SAMPLE_DATA_URL,
} from './utils/excelParser';
import {
  computeKpiStats,
  computeExpiryStats,
  computeInsights,
  getExpiringContracts,
  getStartYears,
} from './utils/stats';
import { formatCurrency, formatDate, formatDDay } from './utils/formatters';
import { daysUntil, getToday } from './utils/dateUtils';

const INITIAL_FILTERS = {
  StartYear: '',
  Region: '',
  Contract: '',
  Product: '',
  Age: '',
  Insurance: '',
};

const VALID_EXTENSIONS = ['.xlsx', '.xls'];

function isValidExcelFile(file) {
  const name = file.name.toLowerCase();
  return VALID_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function applyWarnings(warnings, setWarning) {
  if (warnings.length > 0) {
    setWarning(
      `데이터 변환 경고 (${warnings.length}건): ${warnings.slice(0, 3).join(' / ')}${warnings.length > 3 ? ' ...' : ''}`
    );
  } else {
    setWarning('');
  }
}

function App() {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [loadingSample, setLoadingSample] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('dashboard-dark-mode') === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('dashboard-dark-mode', String(darkMode));
  }, [darkMode]);

  const loadSampleData = useCallback(async () => {
    setLoadingSample(true);
    setError('');
    setWarning('');
    try {
      const { rows: parsedRows, warnings } = await fetchAndParseSampleData();
      setRows(parsedRows);
      setFileName(SAMPLE_DATA_FILENAME);
      setIsDemoMode(true);
      setFilters(INITIAL_FILTERS);
      applyWarnings(warnings, setWarning);
    } catch (err) {
      setRows([]);
      setFileName('');
      setIsDemoMode(false);
      setError(err.message || '샘플 데이터를 불러오지 못했습니다.');
    } finally {
      setLoadingSample(false);
    }
  }, []);

  useEffect(() => {
    loadSampleData();
  }, [loadSampleData]);

  const handleFileSelect = useCallback(async (file) => {
    if (!isValidExcelFile(file)) {
      setError('.xlsx 또는 .xls 파일만 업로드할 수 있습니다.');
      setWarning('');
      return;
    }

    setError('');
    setWarning('');
    setLoadingSample(true);
    try {
      const { rows: parsedRows, warnings } = await parseExcelFile(file);
      setRows(parsedRows);
      setFileName(file.name);
      setIsDemoMode(false);
      setFilters(INITIAL_FILTERS);
      applyWarnings(warnings, setWarning);
    } catch (err) {
      setRows([]);
      setFileName('');
      setError(err.message || '파일 처리 중 오류가 발생했습니다.');
    } finally {
      setLoadingSample(false);
    }
  }, []);

  const filterOptions = useMemo(() => {
    const getUnique = (key) =>
      [...new Set(rows.map((row) => String(row[key] ?? '')).filter(Boolean))].sort();

    return {
      StartYear: getStartYears(rows).map(String),
      Region: getUnique('Region'),
      Contract: getUnique('Contract'),
      Product: getUnique('Product'),
      Age: getUnique('Age'),
      Insurance: getUnique('Insurance'),
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (key === 'StartYear') {
          return row.Start && String(row.Start.getFullYear()) === value;
        }
        return String(row[key] ?? '') === value;
      })
    );
  }, [rows, filters]);

  const kpiStats = useMemo(() => computeKpiStats(filteredRows), [filteredRows]);
  const insights = useMemo(() => computeInsights(filteredRows), [filteredRows]);
  const expiryStats = useMemo(() => computeExpiryStats(filteredRows), [filteredRows]);

  const expiringRows = useMemo(() => {
    const today = getToday();
    return getExpiringContracts(filteredRows, 60, today).map((row) => {
      const dDay = daysUntil(row.End, today);
      return {
        ...row,
        _endFormatted: formatDate(row.End),
        _paidFormatted: formatCurrency(row.Paid),
        _revenueFormatted: formatCurrency(row.Revenue),
        _dDay: dDay ?? 999,
        _dDayLabel: formatDDay(row.End, dDay),
      };
    });
  }, [filteredRows]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilters(INITIAL_FILTERS);
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <DashboardHeader
        fileName={fileName}
        darkMode={darkMode}
        isDemoMode={isDemoMode}
        loadingSample={loadingSample}
        sampleDataUrl={SAMPLE_DATA_URL}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        onFileSelect={handleFileSelect}
        onReloadSample={loadSampleData}
        error={error}
        warning={warning}
      />

      {loadingSample && rows.length === 0 && (
        <div className="empty-dashboard">
          <div className="empty-card">
            <span className="empty-icon">⏳</span>
            <h2>샘플 데이터를 불러오는 중...</h2>
          </div>
        </div>
      )}

      {!loadingSample && rows.length === 0 && !error && (
        <div className="empty-dashboard">
          <div className="empty-card">
            <span className="empty-icon">📂</span>
            <h2>표시할 데이터가 없습니다</h2>
            <p>엑셀 파일을 업로드하거나 샘플 데이터를 다시 불러와 주세요.</p>
            <button type="button" className="sample-action-btn" onClick={loadSampleData}>
              샘플 데이터 다시 보기
            </button>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <main className="dashboard-content">
          <KpiCards stats={kpiStats} />
          <InsightCards insights={insights} />
          <Filters
            filters={filters}
            options={filterOptions}
            onChange={handleFilterChange}
            onReset={handleFilterReset}
          />
          <DashboardCharts rows={filteredRows} />
          <AnalysisTables rows={filteredRows} />
          <ExpirySection expiryStats={expiryStats} allExpiringRows={expiringRows} />
        </main>
      )}
    </div>
  );
}

export default App;

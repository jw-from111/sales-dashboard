import { render, screen, waitFor } from '@testing-library/react';

jest.mock('./utils/excelParser');

import App from './App';
import {
  fetchAndParseSampleData,
  SAMPLE_DATA_FILENAME,
  SAMPLE_DATA_URL,
} from './utils/excelParser';

const sampleRow = {
  id: 0,
  Region: '서울',
  Contract: '신규',
  Month: 12,
  Product: 'PCX125',
  Age: '30대',
  Insurance: '종합보험',
  Start: new Date('2024-01-15'),
  Paid: 55000,
  End: new Date('2025-01-15'),
  Revenue: 660000,
};

beforeEach(() => {
  fetchAndParseSampleData.mockResolvedValue({
    rows: [sampleRow],
    warnings: [],
  });
});

test('renders dashboard title', async () => {
  render(<App />);
  expect(screen.getByText('영업 실적 관리 대시보드')).toBeInTheDocument();
});

test('loads sample data and shows demo banner', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('데모 데이터 표시 중')).toBeInTheDocument();
  });
  expect(screen.getByText(/포트폴리오용 가상 데이터/)).toBeInTheDocument();
  expect(fetchAndParseSampleData).toHaveBeenCalled();
});

test('renders upload button', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText('엑셀 업로드')).toBeInTheDocument();
  });
});

test('renders sample download button', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getAllByText('샘플 엑셀 다운로드').length).toBeGreaterThan(0);
  });
});

test('exports sample constants', () => {
  expect(SAMPLE_DATA_FILENAME).toBe('sample-data.xlsx');
  expect(SAMPLE_DATA_URL).toContain('sample-data.xlsx');
});

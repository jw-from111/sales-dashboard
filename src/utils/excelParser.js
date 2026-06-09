import * as XLSX from 'xlsx';

const REQUIRED_COLUMNS = [
  'Region',
  'Contract',
  'Month',
  'Product',
  'Insurance',
  'Start',
  'Paid',
  'End',
];

export const SAMPLE_DATA_URL = `${process.env.PUBLIC_URL || ''}/sample-data.xlsx`;
export const SAMPLE_DATA_FILENAME = 'sample-data.xlsx';

export function parseNumber(value) {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;
  const cleaned = String(value).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return Number.isNaN(num) ? 0 : num;
}

function parseNumberStrict(value) {
  if (value == null || value === '') return { value: 0, failed: false };
  if (typeof value === 'number') {
    return { value: Number.isNaN(value) ? 0 : value, failed: Number.isNaN(value) };
  }
  const cleaned = String(value).replace(/,/g, '').trim();
  if (cleaned === '') return { value: 0, failed: false };
  const num = parseFloat(cleaned);
  return { value: Number.isNaN(num) ? 0 : num, failed: Number.isNaN(num) };
}

export function parseDate(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateColumns(firstRow) {
  if (!firstRow || typeof firstRow !== 'object') {
    return [...REQUIRED_COLUMNS, 'age/Age'];
  }

  const keys = Object.keys(firstRow);
  const missing = REQUIRED_COLUMNS.filter((col) => !keys.includes(col));
  if (!keys.includes('age') && !keys.includes('Age')) {
    missing.push('age/Age');
  }
  return missing;
}

export function parseExcelBuffer(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  if (rawRows.length === 0) {
    throw new Error('업로드된 파일에 데이터가 없습니다.');
  }

  const missingColumns = validateColumns(rawRows[0]);
  if (missingColumns.length > 0) {
    throw new Error(`필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`);
  }

  const warnings = [];
  const rows = rawRows.map((row, index) => {
    const rowNum = index + 2;
    const paidResult = parseNumberStrict(row.Paid);
    const monthResult = parseNumberStrict(row.Month);

    if (paidResult.failed) {
      warnings.push(`${rowNum}행: Paid(월 금액) 숫자 변환에 실패했습니다.`);
    }
    if (monthResult.failed) {
      warnings.push(`${rowNum}행: Month(계약 개월 수) 숫자 변환에 실패했습니다.`);
    }

    const start = parseDate(row.Start);
    const end = parseDate(row.End);
    if (row.Start != null && row.Start !== '' && !start) {
      warnings.push(`${rowNum}행: Start(계약 시작일) 날짜 변환에 실패했습니다.`);
    }
    if (row.End != null && row.End !== '' && !end) {
      warnings.push(`${rowNum}행: End(계약 종료일) 날짜 변환에 실패했습니다.`);
    }

    const age = row.age ?? row.Age ?? null;

    return {
      id: index,
      Region: row.Region ?? '',
      Contract: row.Contract ?? '',
      Month: monthResult.value,
      Product: row.Product ?? '',
      Age: age,
      Insurance: row.Insurance ?? '',
      Start: start,
      Paid: paidResult.value,
      End: end,
      Revenue: paidResult.value * monthResult.value,
    };
  });

  return { rows, warnings };
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        resolve(parseExcelBuffer(event.target.result));
      } catch (error) {
        reject(error instanceof Error ? error : new Error('엑셀 파일을 읽는 중 오류가 발생했습니다.'));
      }
    };

    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsArrayBuffer(file);
  });
}

export async function fetchAndParseSampleData(url = SAMPLE_DATA_URL) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('샘플 데이터를 불러올 수 없습니다.');
  }
  const buffer = await response.arrayBuffer();
  return parseExcelBuffer(buffer);
}

export function formatCurrency(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0원';
  return `${Math.round(num).toLocaleString('ko-KR')}원`;
}

export function formatKpiRevenue(value) {
  const num = Number(value);
  if (Number.isNaN(num) || num === 0) return '0원';
  const oku = num / 100000000;
  if (oku >= 0.1) {
    return `${oku.toFixed(1)}억`;
  }
  return formatCurrency(num);
}

export function formatCompactAmount(value) {
  const num = Number(value);
  if (Number.isNaN(num) || num === 0) return '0';
  if (num >= 100000000) {
    return `${(num / 100000000).toFixed(1)}억`;
  }
  if (num >= 10000) {
    return `${Math.round(num / 10000).toLocaleString('ko-KR')}만`;
  }
  return `${Math.round(num).toLocaleString('ko-KR')}`;
}

export function formatPercent(ratio, decimals = 1) {
  const num = Number(ratio);
  if (Number.isNaN(num)) return '0%';
  return `${(num * 100).toFixed(decimals)}%`;
}

export function formatRatioPercent(value, decimals = 1) {
  const num = Number(value);
  if (num == null || Number.isNaN(num)) return '-';
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}

export function formatNumber(value, decimals = 0) {
  const num = Number(value);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDate(value) {
  if (!value) return '-';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatYearMonth(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function toMillionWon(value) {
  return Math.round(Number(value) / 1000000);
}

export function formatMillionAxis(value) {
  return toMillionWon(value).toLocaleString('ko-KR');
}

export function formatDDay(endDate, daysUntil) {
  if (daysUntil === null || daysUntil === undefined) return '-';
  if (daysUntil === 0) return 'D-Day';
  if (daysUntil < 0) return `D+${Math.abs(daysUntil)}`;
  return `D-${daysUntil}`;
}

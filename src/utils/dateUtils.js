export function getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function stripTime(date) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntil(endDate, fromDate = getToday()) {
  const end = stripTime(endDate);
  const from = stripTime(fromDate);
  if (!end || !from) return null;
  return Math.round((end - from) / (1000 * 60 * 60 * 24));
}

export function isActiveContract(row, today = getToday()) {
  const start = stripTime(row.Start);
  const end = stripTime(row.End);
  if (!start || !end) return false;
  return start <= today && today <= end;
}

export function isExpiringWithin(row, days, today = getToday()) {
  const diff = daysUntil(row.End, today);
  if (diff === null) return false;
  return diff >= 0 && diff <= days;
}

export function isNotExpired(row, today = getToday()) {
  const diff = daysUntil(row.End, today);
  return diff !== null && diff >= 0;
}

import { formatYearMonth } from './formatters';
import {
  getToday,
  isActiveContract,
  isExpiringWithin,
  daysUntil,
} from './dateUtils';

export function computeKpiStats(rows, today = getToday()) {
  const count = rows.length;
  if (count === 0) {
    return {
      totalRevenue: 0,
      contractCount: 0,
      activeCount: 0,
      avgPaid: 0,
      avgMonth: 0,
      avgContractAmount: 0,
      expiring30Count: 0,
    };
  }

  const totalRevenue = rows.reduce((sum, row) => sum + row.Revenue, 0);
  const activeCount = rows.filter((row) => isActiveContract(row, today)).length;
  const avgPaid = rows.reduce((sum, row) => sum + row.Paid, 0) / count;
  const avgMonth = rows.reduce((sum, row) => sum + row.Month, 0) / count;
  const avgContractAmount = totalRevenue / count;
  const expiring30Count = rows.filter((row) => isExpiringWithin(row, 30, today)).length;

  return {
    totalRevenue,
    contractCount: count,
    activeCount,
    avgPaid,
    avgMonth,
    avgContractAmount,
    expiring30Count,
  };
}

export function computeExpiryStats(rows, today = getToday()) {
  return {
    within7: rows.filter((row) => isExpiringWithin(row, 7, today)).length,
    within30: rows.filter((row) => isExpiringWithin(row, 30, today)).length,
    within60: rows.filter((row) => isExpiringWithin(row, 60, today)).length,
  };
}

export function getExpiringContracts(rows, maxDays = 60, today = getToday()) {
  return rows
    .filter((row) => {
      const d = daysUntil(row.End, today);
      return d !== null && d >= 0 && d <= maxDays;
    })
    .sort((a, b) => {
      const dDayA = daysUntil(a.End, today) ?? Infinity;
      const dDayB = daysUntil(b.End, today) ?? Infinity;
      if (dDayA !== dDayB) return dDayA - dDayB;
      const aTime = a.End?.getTime() ?? Infinity;
      const bTime = b.End?.getTime() ?? Infinity;
      return aTime - bTime;
    });
}

export function aggregateByField(data, field, valueField = 'revenue') {
  const map = {};

  data.forEach((row) => {
    const name = String(row[field] ?? '') || '미지정';
    if (!map[name]) {
      map[name] = { revenue: 0, count: 0 };
    }
    map[name].revenue += Number(row.Revenue) || 0;
    map[name].count += 1;
  });

  return Object.entries(map)
    .map(([name, { revenue, count }]) => ({
      name,
      revenue,
      count,
      value: valueField === 'count' ? count : revenue,
    }))
    .sort((a, b) => b.value - a.value);
}

export function aggregateByFieldWithCount(rows, field, metric = 'revenue') {
  const valueField = metric === 'count' ? 'count' : 'revenue';
  return aggregateByField(rows, field, valueField);
}

export function aggregateProductWithOther(rows, threshold = 0.03) {
  const map = {};
  rows.forEach((row) => {
    const key = String(row.Product ?? '') || '미지정';
    map[key] = (map[key] || 0) + row.Revenue;
  });

  const total = Object.values(map).reduce((sum, value) => sum + value, 0);
  if (total === 0) return { items: [], total: 0 };

  const sorted = Object.entries(map)
    .map(([name, value]) => ({
      name,
      value,
      percent: value / total,
    }))
    .sort((a, b) => b.value - a.value);

  const main = [];
  let otherValue = 0;

  sorted.forEach((item) => {
    if (item.percent <= threshold) {
      otherValue += item.value;
    } else {
      main.push(item);
    }
  });

  if (otherValue > 0) {
    main.push({
      name: '기타',
      value: otherValue,
      percent: otherValue / total,
    });
  }

  return { items: main, total };
}

export function aggregateStartsByMonth(rows) {
  const map = {};
  rows.forEach((row) => {
    const monthKey = formatYearMonth(row.Start);
    if (!monthKey) return;
    map[monthKey] = (map[monthKey] || 0) + 1;
  });
  return Object.entries(map)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function aggregateRevenueByMonth(rows) {
  const map = {};
  rows.forEach((row) => {
    const monthKey = formatYearMonth(row.Start);
    if (!monthKey) return;
    map[monthKey] = (map[monthKey] || 0) + row.Revenue;
  });
  return Object.entries(map)
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function aggregateRevenueByMonthWithGrowth(rows) {
  const monthly = aggregateRevenueByMonth(rows);
  return monthly.map((item, index) => {
    const prev = index > 0 ? monthly[index - 1].revenue : null;
    const growth =
      prev != null && prev > 0 ? ((item.revenue - prev) / prev) * 100 : null;
    return { ...item, growth };
  });
}

export function aggregateCumulativeRevenue(rows) {
  const monthly = aggregateRevenueByMonth(rows);
  let cumulative = 0;
  return monthly.map((item) => {
    cumulative += item.revenue;
    return { month: item.month, cumulative };
  });
}

export function computeLatestMoMGrowth(rows) {
  const revMap = {};
  const countMap = {};
  rows.forEach((row) => {
    const month = formatYearMonth(row.Start);
    if (!month) return;
    revMap[month] = (revMap[month] || 0) + row.Revenue;
    countMap[month] = (countMap[month] || 0) + 1;
  });

  const months = Object.keys(revMap).sort();
  if (months.length < 2) {
    return { revenueGrowth: null, countGrowth: null };
  }

  const current = months[months.length - 1];
  const previous = months[months.length - 2];

  const revenueGrowth =
    revMap[previous] > 0
      ? ((revMap[current] - revMap[previous]) / revMap[previous]) * 100
      : null;
  const countGrowth =
    countMap[previous] > 0
      ? ((countMap[current] - countMap[previous]) / countMap[previous]) * 100
      : null;

  return { revenueGrowth, countGrowth, currentMonth: current, previousMonth: previous };
}

export function computeInsights(rows, today = getToday()) {
  const regionAgg = aggregateByFieldWithCount(rows, 'Region');
  const productAgg = aggregateByFieldWithCount(rows, 'Product');

  const productMap = {};
  rows.forEach((row) => {
    const key = String(row.Product ?? '') || '미지정';
    if (!productMap[key]) productMap[key] = { total: 0, count: 0 };
    productMap[key].total += row.Revenue;
    productMap[key].count += 1;
  });

  const productAvgs = Object.entries(productMap)
    .map(([name, { total, count }]) => ({
      name,
      avg: count > 0 ? total / count : 0,
    }))
    .sort((a, b) => b.avg - a.avg);

  const avgDuration =
    rows.length > 0
      ? rows.reduce((sum, row) => sum + row.Month, 0) / rows.length
      : 0;

  const { revenueGrowth, countGrowth } = computeLatestMoMGrowth(rows);

  return {
    topRegion: regionAgg[0]?.name ?? '-',
    topRegionRevenue: regionAgg[0]?.revenue ?? 0,
    topProduct: productAgg[0]?.name ?? '-',
    topProductRevenue: productAgg[0]?.revenue ?? 0,
    highestAvgProduct: productAvgs[0]?.name ?? '-',
    highestAvgAmount: productAvgs[0]?.avg ?? 0,
    avgDuration,
    expiring30: rows.filter((row) => isExpiringWithin(row, 30, today)).length,
    revenueGrowth,
    countGrowth,
  };
}

export function buildRegionProductMatrix(rows, mode = 'revenue') {
  const regions = [
    ...new Set(rows.map((row) => String(row.Region ?? '') || '미지정')),
  ].sort();
  const products = [
    ...new Set(rows.map((row) => String(row.Product ?? '') || '미지정')),
  ].sort();

  const matrix = regions.map((region) => {
    const cells = { region };
    products.forEach((product) => {
      const matched = rows.filter(
        (row) =>
          (String(row.Region ?? '') || '미지정') === region &&
          (String(row.Product ?? '') || '미지정') === product
      );
      cells[product] =
        mode === 'revenue'
          ? matched.reduce((sum, row) => sum + row.Revenue, 0)
          : matched.length;
    });
    return cells;
  });

  return { regions, products, matrix };
}

export function computeTopProducts(rows, limit = 10) {
  const map = {};
  rows.forEach((row) => {
    const key = String(row.Product ?? '') || '미지정';
    if (!map[key]) map[key] = { count: 0, revenue: 0, monthSum: 0 };
    map[key].count += 1;
    map[key].revenue += row.Revenue;
    map[key].monthSum += row.Month;
  });

  return Object.entries(map)
    .map(([product, data]) => ({
      product,
      count: data.count,
      revenue: data.revenue,
      avgAmount: data.count > 0 ? data.revenue / data.count : 0,
      avgMonth: data.count > 0 ? data.monthSum / data.count : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function computeRegionalPerformance(rows) {
  const map = {};
  rows.forEach((row) => {
    const key = String(row.Region ?? '') || '미지정';
    if (!map[key]) map[key] = { count: 0, revenue: 0, paidSum: 0, monthSum: 0 };
    map[key].count += 1;
    map[key].revenue += row.Revenue;
    map[key].paidSum += row.Paid;
    map[key].monthSum += row.Month;
  });

  return Object.entries(map)
    .map(([region, data]) => ({
      region,
      count: data.count,
      revenue: data.revenue,
      avgAmount: data.count > 0 ? data.revenue / data.count : 0,
      avgPaid: data.count > 0 ? data.paidSum / data.count : 0,
      avgMonth: data.count > 0 ? data.monthSum / data.count : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function computeInsurancePerformance(rows) {
  const map = {};
  rows.forEach((row) => {
    const key = String(row.Insurance ?? '') || '미지정';
    if (!map[key]) map[key] = { count: 0, revenue: 0 };
    map[key].count += 1;
    map[key].revenue += row.Revenue;
  });

  return Object.entries(map)
    .map(([insurance, data]) => ({
      insurance,
      count: data.count,
      revenue: data.revenue,
      avgAmount: data.count > 0 ? data.revenue / data.count : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function getStartYears(rows) {
  return [
    ...new Set(
      rows.map((row) => row.Start?.getFullYear()).filter((year) => year != null)
    ),
  ].sort((a, b) => b - a);
}

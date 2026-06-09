const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const REGIONS = ['Seoul', 'Daegu', 'Busan', 'Daejeon'];

function loadCategoriesFromSalesCsv() {
  const csvPath = path.join(__dirname, '..', 'sales.csv');
  const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
  const categories = {
    Contract: new Set(),
    Product: new Set(),
    age: new Set(),
    Insurance: new Set(),
    Month: new Set(),
  };

  for (let i = 1; i < lines.length; i += 1) {
    const parts = lines[i].split(',');
    if (parts.length < 9) continue;
    categories.Contract.add(parts[1].trim());
    categories.Month.add(Number(parts[2].trim()));
    categories.Product.add(parts[3].trim());
    categories.age.add(parts[4].trim());
    categories.Insurance.add(parts[5].trim());
  }

  return {
    regions: REGIONS,
    contracts: [...categories.Contract].sort(),
    products: [...categories.Product].sort(),
    ages: [...categories.age].sort(),
    insurances: [...categories.Insurance].sort(),
    months: [...categories.Month].sort((a, b) => a - b),
  };
}

const paidOptions = [350000, 450000, 579000, 600000, 717000, 777000, 849000, 925800, 1003800, 1092000, 1261800];
const { regions, contracts, products, ages, insurances, months } = loadCategoriesFromSalesCsv();

const today = new Date();
today.setHours(0, 0, 0, 0);

const rows = [];

for (let i = 0; i < 96; i += 1) {
  const startOffset = -540 + (i * 11) % 720;
  const start = new Date(today);
  start.setDate(start.getDate() + startOffset - 360);

  const month = months[i % months.length];
  const end = new Date(start);
  end.setMonth(end.getMonth() + month);

  if (i < 8) {
    end.setTime(today.getTime());
    end.setDate(today.getDate() + (i % 7) + 1);
  } else if (i < 16) {
    end.setTime(today.getTime());
    end.setDate(today.getDate() + 8 + (i % 22));
  } else if (i < 24) {
    end.setTime(today.getTime());
    end.setDate(today.getDate() + 31 + (i % 29));
  }

  rows.push({
    Region: regions[i % regions.length],
    Contract: contracts[i % contracts.length],
    Month: month,
    Product: products[i % products.length],
    age: ages[i % ages.length],
    Insurance: insurances[i % insurances.length],
    Start: start,
    Paid: paidOptions[i % paidOptions.length],
    End: end,
  });
}

const worksheet = XLSX.utils.json_to_sheet(rows);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'SalesData');

const outputPath = path.join(__dirname, '..', 'public', 'sample-data.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log(`Created ${outputPath} with ${rows.length} rows`);
console.log('Regions:', regions.join(', '));
console.log('Contracts:', contracts.join(', '));
console.log('Products:', products.join(', '));
console.log('Ages:', ages.join(', '));
console.log('Insurance:', insurances.join(', '));
console.log('Months:', months.join(', '));

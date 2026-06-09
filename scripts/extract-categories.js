const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'sales.csv');
const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
const sets = {
  Region: new Set(),
  Contract: new Set(),
  Product: new Set(),
  age: new Set(),
  Insurance: new Set(),
  Month: new Set(),
};

for (let i = 1; i < lines.length; i += 1) {
  const parts = lines[i].split(',');
  if (parts.length < 9) continue;
  sets.Region.add(parts[0].trim());
  sets.Contract.add(parts[1].trim());
  sets.Month.add(parts[2].trim());
  sets.Product.add(parts[3].trim());
  sets.age.add(parts[4].trim());
  sets.Insurance.add(parts[5].trim());
}

Object.entries(sets).forEach(([key, set]) => {
  console.log(`${key}:`, [...set].sort().join(', '));
});

const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('一带一路-各国宏观贸易统计.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet);

// Corridor countries
const corridorCountries = [
  '阿联酋', '阿曼', '巴林', '吉尔吉斯斯坦', '卡塔尔', '科威特',
  '黎巴嫩', '塞浦路斯', '沙特阿拉伯', '塔吉克斯坦', '土耳其', '土库曼斯坦',
  '乌兹别克斯坦', '叙利亚', '也门', '伊拉克', '伊朗', '以色列', '约旦', '埃及', '希腊', '哈萨克斯坦'
];

// Column mapping (Chinese to English keys for consistency)
const colMapping = {
  '年度': 'year',
  '国家': 'country',
  '农业原材料出口占货物出口比重（%）': 'agriExp',
  '食品出口占货物出口比重（%）': 'foodExp',
  '燃料出口占货物出口比重（%）': 'fuelExp',
  '制成品出口占货物出口比重（%）': 'manuExp',
  '矿物和金属出口占货物出口比重（%）': 'mineralExp',
  '农业原材料进口占货物进口比重（%）': 'agriImp',
  '食品进口占货物进口比重（%）': 'foodImp',
  '燃料进口占货物进口比重（%）': 'fuelImp',
  '制成品进口占货物进口比重（%）': 'manuImp',
  '矿物和金属进口占货物进口比重（%）': 'mineralImp',
  '货物和商品贸易出口量（百分比变化）(%)': 'exportGrowth',
  '货物和商品贸易进口量（百分比变化）(%)': 'importGrowth'
};

// Filter corridor countries and years 2000-2017
const filteredData = rawData.filter(row => {
  const year = parseInt(row['年度']);
  const country = row['国家'];
  return corridorCountries.includes(country) && year >= 2000 && year <= 2017;
});

// Convert to standardized format
const convertedData = filteredData.map(row => {
  const newRow = { year: parseInt(row['年度']), country: row['国家'] };
  for (const [cn, en] of Object.entries(colMapping)) {
    if (cn !== '年度' && cn !== '国家') {
      const val = row[cn];
      newRow[en] = (val === null || val === undefined || val === '') ? null : parseFloat(val);
    }
  }
  return newRow;
});

// Group by country
const countriesMap = {};
convertedData.forEach(row => {
  if (!countriesMap[row.country]) {
    countriesMap[row.country] = [];
  }
  countriesMap[row.country].push(row);
});

// Sort each country's data by year
Object.keys(countriesMap).forEach(country => {
  countriesMap[country].sort((a, b) => a.year - b.year);
});

// Calculate correlation matrix for the 12 variables
const variables = [
  'agriExp', 'foodExp', 'fuelExp', 'manuExp', 'mineralExp',  // export
  'agriImp', 'foodImp', 'fuelImp', 'manuImp', 'mineralImp',  // import
  'exportGrowth', 'importGrowth'  // growth
];

const variableLabels = {
  agriExp: '农业出口',
  foodExp: '食品出口',
  fuelExp: '燃料出口',
  manuExp: '制造品出口',
  mineralExp: '矿物金属出口',
  agriImp: '农业进口',
  foodImp: '食品进口',
  fuelImp: '燃料进口',
  manuImp: '制造品进口',
  mineralImp: '矿物金属进口',
  exportGrowth: '出口增长',
  importGrowth: '进口增长'
};

// Calculate corridor average (mean across all corridor countries for each year)
const yearRange = [];
for (let year = 2000; year <= 2017; year++) {
  const yearData = convertedData.filter(d => d.year === year);
  const avgRow = { year };
  variables.forEach(v => {
    const values = yearData.map(d => d[v]).filter(v => v !== null && !isNaN(v));
    avgRow[v] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
  });
  
  // Calculate gaps
  const fuelExp = avgRow.fuelExp;
  const manuExp = avgRow.manuExp;
  const fuelImp = avgRow.fuelImp;
  const manuImp = avgRow.manuImp;
  avgRow.gapExp = (fuelExp != null && manuExp != null) ? manuExp - fuelExp : null;
  avgRow.gapImp = (fuelImp != null && manuImp != null) ? manuImp - fuelImp : null;
  avgRow.validExp = yearData.filter(d => d.fuelExp != null && d.manuExp != null).length;
  avgRow.validImp = yearData.filter(d => d.fuelImp != null && d.manuImp != null).length;
  
  yearRange.push(avgRow);
}

// Output summary
console.log("Corridor countries found:", Object.keys(countriesMap).length);
console.log("\nVariables for heatmap:", variables);
console.log("\nSample corridor data (2000):", JSON.stringify(yearRange[0], null, 2));

// Create JS file for web
const jsContent = `// Extended trade data with 12 variables
window.EXTENDED_TRADE_DATA = {
  variables: ${JSON.stringify(variables)},
  variableLabels: ${JSON.stringify(variableLabels)},
  corridor: ${JSON.stringify(yearRange, null, 2)},
  countries: ${JSON.stringify(Object.keys(countriesMap))},
  rawData: ${JSON.stringify(convertedData, null, 2)}
};
`;

fs.writeFileSync('extended_trade_data.js', jsContent, 'utf8');
console.log("\nData file created: extended_trade_data.js");
console.log("Total years:", yearRange.length);
console.log("Total data points:", convertedData.length);

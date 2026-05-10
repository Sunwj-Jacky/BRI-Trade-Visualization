const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('一带一路-各国宏观贸易统计.xlsx');

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

console.log("Total rows:", data.length);
console.log("\nColumns:", Object.keys(data[0]));
console.log("\nFirst row sample:", JSON.stringify(data[0], null, 2));

// Get unique countries
const countries = [...new Set(data.map(row => row['国家'] || row['country'] || row['Country'] || Object.values(row)[0]))];
console.log("\nUnique countries count:", countries.length);
console.log("Countries:", countries.slice(0, 10), "...");

// Check for year column
const yearCol = data[0] ? Object.keys(data[0]).find(k => k.includes('年') || k.includes('Year') || k.includes('year')) : null;
console.log("\nYear column:", yearCol);

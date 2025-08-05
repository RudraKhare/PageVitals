const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function readExcel(filePath) {
  console.log(`📁 Reading Excel file: ${filePath}`);
  
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(worksheet);
  
  // Find URL column first
  const urlColumn = Object.keys(rawData[0] || {}).find(key => 
    key.toLowerCase().includes('url') || 
    key.toLowerCase().includes('link') || 
    key.toLowerCase().includes('website')
  );
  
  // Filter out rows without valid URLs and remove duplicates
  const validRows = rawData.filter(row => {
    const url = row[urlColumn];
    return url && /^https?:\/\//i.test(url);
  });
  
  // Remove duplicate URLs to get unique URLs only
  const uniqueUrls = new Set();
  const data = validRows.filter(row => {
    const url = row[urlColumn];
    if (uniqueUrls.has(url)) {
      return false; // Skip duplicate URL
    }
    uniqueUrls.add(url);
    return true;
  });
  
  console.log(`📊 Excel file loaded successfully:`);
  console.log(`   - Sheet name: ${workbook.SheetNames[0]}`);
  console.log(`   - Raw rows from Excel: ${rawData.length}`);
  console.log(`   - Rows with valid URLs: ${validRows.length}`);
  console.log(`   - Unique URLs after deduplication: ${data.length}`);
  console.log(`   - URL column: ${urlColumn || 'NOT FOUND'}`);
  console.log(`   - Columns found: ${Object.keys(rawData[0] || {}).join(', ')}`);
  
  // Show first few unique URLs for verification
  if (data.length > 0) {
    console.log(`🔍 First 5 unique URLs found:`);
    data.slice(0, 5).forEach((row, i) => {
      console.log(`   ${i + 1}. ${row[urlColumn]}`);
    });
    
    // Show duplicate count
    const duplicateCount = validRows.length - data.length;
    if (duplicateCount > 0) {
      console.log(`⚠️  Removed ${duplicateCount} duplicate URLs`);
    }
  }
  
  return data;
}

function writeExcel(results) {
  console.log(`💾 Creating output Excel file with ${results.length} results...`);
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(results);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PageSpeed Results');
  
  const outputFile = `pagespeed-results-${Date.now()}.xlsx`;
  const outputPath = path.join('uploads', outputFile);
  
  XLSX.writeFile(workbook, outputPath);
  
  console.log(`✅ Output file created: ${outputFile}`);
  console.log(`📁 File path: ${outputPath}`);
  
  // Log file size
  const stats = fs.statSync(outputPath);
  console.log(`📈 File size: ${(stats.size / 1024).toFixed(2)} KB`);
  
  return outputPath;
}

module.exports = { readExcel, writeExcel };

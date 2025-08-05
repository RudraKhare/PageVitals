const { getPageSpeedData } = require('../services/pageSpeedService');
const { readExcel, writeExcel } = require('../services/excelService');
const delay = require('../utils/delay');
const fs = require('fs');
const path = require('path');
const pLimit = require('p-limit').default;



// // const pLimit = require('p-limit');

// async function processInBatches(data, urlColumn, batchSize = 10) {
//   const results = [];
//   const limit = pLimit(10);

//   for (let i = 0; i < data.length; i += batchSize) {
//     const batch = data.slice(i, i + batchSize);

//     const batchPromises = batch.map(row =>
//       limit(async () => {
//         const url = row[urlColumn];
//         if (!url || !/^https?:\/\/.+/i.test(url)) {
//           return {
//             ...row,
//             'Mobile Performance': 0,
//             'Mobile Accessibility': 0,
//             'Mobile Best Practices': 0,
//             'Mobile SEO': 0,
//             'Desktop Performance': 0,
//             'Desktop Accessibility': 0,
//             'Desktop Best Practices': 0,
//             'Desktop SEO': 0,
//             'Error': 'Invalid URL'
//           };
//         }

//         try {
//           const [mobile, desktop] = await Promise.all([
//             getPageSpeedData(url, 'mobile'),
//             getPageSpeedData(url, 'desktop')
//           ]);

//           return {
//             ...row,
//             'Mobile Performance': mobile.performance,
//             'Mobile Accessibility': mobile.accessibility,
//             'Mobile Best Practices': mobile.bestPractices,
//             'Mobile SEO': mobile.seo,
//             'Desktop Performance': desktop.performance,
//             'Desktop Accessibility': desktop.accessibility,
//             'Desktop Best Practices': desktop.bestPractices,
//             'Desktop SEO': desktop.seo,
//             'Error': mobile.error || desktop.error || ''
//           };
//         } catch (err) {
//           return { ...row, Error: 'Request failed: ' + err.message };
//         }
//       })
//     );

//     const batchResults = await Promise.allSettled(batchPromises);
//     batchResults.forEach(res => {
//       results.push(res.status === 'fulfilled' ? res.value : { Error: res.reason });
//     });

//     console.log(`✅ Processed ${Math.min(i + batchSize, data.length)} / ${data.length}`);
//     await delay(1000);
//   }

//   return results;
// }




// Helper function to check if URL is likely to cause issues
function isProblematicUrl(url) {
  const problematicPatterns = [
    /localhost/i,
    /127\.0\.0\.1/i,
    /192\.168\./i,
    /10\./i,
    /\:8080/i,
    /\:3000/i,
    /\:5000/i,
    /file:\/\//i
  ];
  
  return problematicPatterns.some(pattern => pattern.test(url));
}

// Helper function for empty metrics
function emptyMetrics() {
  return {
    'Mobile Performance': 0,
    'Mobile Accessibility': 0,
    'Mobile Best Practices': 0,
    'Mobile SEO': 0,
    'Desktop Performance': 0,
    'Desktop Accessibility': 0,
    'Desktop Best Practices': 0,
    'Desktop SEO': 0
  };
}

const CONCURRENCY_LIMIT = 4; // Use all 4 API keys in parallel
const BATCH_SIZE = 8; // Process 8 URLs per batch (4 mobile + 4 desktop = 8 API calls)

async function processInBatches(data, urlColumn) {
  const limit = pLimit(CONCURRENCY_LIMIT);
  const results = [];
  const totalBatches = Math.ceil(data.length / BATCH_SIZE);
  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;

  console.log(`\n� STARTING BATCH PROCESSING:`);
  console.log(`   📊 Total URLs: ${data.length}`);
  console.log(`   📦 Total batches: ${totalBatches} (${BATCH_SIZE} URLs per batch)`);
  console.log(`   🔄 Concurrency: ${CONCURRENCY_LIMIT === 1 ? 'Sequential' : CONCURRENCY_LIMIT + ' parallel'}`);
  console.log(`   ⏱️ Estimated time: ${Math.ceil((data.length * 8) / 60)} minutes\n`);

  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
    
    console.log(`\n📦 =================================`);
    console.log(`📦 BATCH ${currentBatch}/${totalBatches}`);
    console.log(`📦 =================================`);
    console.log(`📊 Processing URLs ${i + 1} to ${Math.min(i + BATCH_SIZE, data.length)} of ${data.length}`);
    console.log(`📈 Overall Progress: ${processedCount}/${data.length} completed (${((processedCount/data.length)*100).toFixed(1)}%)`);

    const batchPromises = batch.map((row, index) =>
      limit(async () => {
        const url = row[urlColumn];
        const globalIndex = i + index + 1;

        if (!url || !/^https?:\/\//i.test(url)) {
          console.log(`⚠️  [${globalIndex}/${data.length}] Invalid URL: ${url || 'empty'}`);
          processedCount++;
          errorCount++;
          return { ...row, ...emptyMetrics(), Error: 'Invalid URL' };
        }

        if (isProblematicUrl(url)) {
          console.log(`⚠️  [${globalIndex}/${data.length}] Skipped local URL: ${url}`);
          processedCount++;
          errorCount++;
          return { ...row, ...emptyMetrics(), Error: 'Skipped - Local/Development URL' };
        }

        try {
          console.log(`🔍 [${globalIndex}/${data.length}] Starting analysis: ${url}`);
          
          // Assign dedicated API keys for this URL
          const apiKeyIndex = (globalIndex - 1) % 4; // Distribute across 4 API keys
          
          // Add minimal delay for parallel processing
          await delay(500);
          
          // Process mobile and desktop in parallel with dedicated API keys
          console.log(`� [${globalIndex}/${data.length}] Processing mobile & desktop in parallel (API keys #${apiKeyIndex + 1} & #${((apiKeyIndex + 2) % 4) + 1})...`);
          const [mobile, desktop] = await Promise.all([
            getPageSpeedData(url, 'mobile', 2, apiKeyIndex),
            getPageSpeedData(url, 'desktop', 2, (apiKeyIndex + 2) % 4) // Use different API key for desktop
          ]);
          
          processedCount++;
          const hasErrors = mobile.error || desktop.error;
          
          if (hasErrors) {
            errorCount++;
            console.log(`❌ [${globalIndex}/${data.length}] Completed with errors: ${url}`);
            console.log(`   📱 Mobile: ${mobile.performance || 0}% ${mobile.error ? '❌ ' + mobile.error : '✅'}`);
            console.log(`   🖥️  Desktop: ${desktop.performance || 0}% ${desktop.error ? '❌ ' + desktop.error : '✅'}`);
          } else {
            successCount++;
            console.log(`✅ [${globalIndex}/${data.length}] Successfully completed: ${url}`);
            console.log(`   📱 Mobile: ${mobile.performance}% ✅ | 🖥️  Desktop: ${desktop.performance}% ✅`);
          }

          return {
            ...row,
            'Mobile Performance': mobile.performance,
            'Mobile Accessibility': mobile.accessibility,
            'Mobile Best Practices': mobile.bestPractices,
            'Mobile SEO': mobile.seo,
            'Desktop Performance': desktop.performance,
            'Desktop Accessibility': desktop.accessibility,
            'Desktop Best Practices': desktop.bestPractices,
            'Desktop SEO': desktop.seo,
            'Error': mobile.error || desktop.error || ''
          };
        } catch (err) {
          processedCount++;
          errorCount++;
          console.log(`💥 [${globalIndex}/${data.length}] Failed: ${url} - ${err.message}`);
          return { ...row, ...emptyMetrics(), Error: 'Request failed: ' + err.message };
        }
      })
    );

    const batchResults = await Promise.allSettled(batchPromises);
    batchResults.forEach(res => {
      if (res.status === 'fulfilled') results.push(res.value);
      else results.push({ ...emptyMetrics(), Error: res.reason });
    });

    const completed = processedCount;
    const percentComplete = ((completed / data.length) * 100).toFixed(1);
    const successRate = completed > 0 ? ((successCount / completed) * 100).toFixed(1) : 0;
    const remaining = data.length - completed;
    const estimatedTimeRemaining = Math.ceil((remaining * 8) / 60);
    
    console.log(`\n📊 BATCH ${currentBatch} SUMMARY:`);
    console.log(`   ✅ Total Processed: ${completed}/${data.length} (${percentComplete}%)`);
    console.log(`   🎯 Successful: ${successCount} | ❌ Errors: ${errorCount}`);
    console.log(`   � Success Rate: ${successRate}%`);
    console.log(`   �🕒 Remaining: ${remaining} URLs`);
    console.log(`   ⏱️ Est. Time Left: ${estimatedTimeRemaining} minutes`);
    
    if (i + BATCH_SIZE < data.length) {
      console.log(`⏳ Waiting 2 seconds before next batch...`);
      await delay(2000); // Reduced delay for parallel processing (2 seconds)
    }
  }

  console.log(`\n🎉 =================================`);
  console.log(`🎉 ALL PROCESSING COMPLETED!`);
  console.log(`🎉 =================================`);
  console.log(`📊 Final Statistics:`);
  console.log(`   📈 Total Processed: ${processedCount}/${data.length}`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   🎯 Success Rate: ${((successCount / processedCount) * 100).toFixed(1)}%`);

  return results;
}


async function analyzeExcel(req, res) {
  const startTime = Date.now();
  console.log(`\n🚀 =================================`);
  console.log(`🚀 STARTING PAGESPEED ANALYSIS`);
  console.log(`🚀 =================================`);
  console.log(`⏰ Start time: ${new Date().toLocaleString()}`);
  
  try {
    if (!req.file) {
      console.log(`❌ Error: No file uploaded`);
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📁 File uploaded: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

    const data = readExcel(req.file.path);
    if (!data.length) {
      console.log(`❌ Error: Excel file is empty`);
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    const urlColumn = Object.keys(data[0]).find(k =>
      k.toLowerCase().includes('url') || k.toLowerCase().includes('link') || k.toLowerCase().includes('website')
    );
    
    if (!urlColumn) {
      console.log(`❌ Error: No URL column found in columns: ${Object.keys(data[0]).join(', ')}`);
      return res.status(400).json({ error: 'No URL column found. Use "URL", "Link", or "Website"' });
    }

    console.log(`🎯 URL column identified: "${urlColumn}"`);
    console.log(`📊 Processing ${data.length} URLs...`);
    console.log(`⚙️ Settings: ${CONCURRENCY_LIMIT} concurrent, ${BATCH_SIZE} per batch`);
    
    // Estimate processing time
    const estimatedMinutes = Math.ceil((data.length * 2 * 8) / 60); // 2 requests per URL, ~8 seconds each
    console.log(`⏱️ Estimated completion time: ~${estimatedMinutes} minutes`);
    console.log(`\n🔄 Starting URL processing...`);

    const results = await processInBatches(data, urlColumn);
    
    const endTime = Date.now();
    const processingTimeMinutes = ((endTime - startTime) / 1000 / 60).toFixed(2);
    
    console.log(`\n🎉 =================================`);
    console.log(`🎉 PROCESSING COMPLETED!`);
    console.log(`🎉 =================================`);
    console.log(`⏰ Total processing time: ${processingTimeMinutes} minutes`);
    console.log(`📊 Results summary:`);
    
    // Count successful vs failed URLs
    const successful = results.filter(r => !r.Error || r.Error === '').length;
    const failed = results.length - successful;
    console.log(`   ✅ Successful: ${successful}/${results.length}`);
    console.log(`   ❌ Failed: ${failed}/${results.length}`);
    
    if (failed > 0) {
      const errorTypes = {};
      results.filter(r => r.Error && r.Error !== '').forEach(r => {
        errorTypes[r.Error] = (errorTypes[r.Error] || 0) + 1;
      });
      console.log(`   📋 Error breakdown:`);
      Object.entries(errorTypes).forEach(([error, count]) => {
        console.log(`      - ${error}: ${count}`);
      });
    }
    
    const outputPath = writeExcel(results);

    console.log(`🗑️ Cleaning up uploaded file: ${req.file.originalname}`);
    fs.unlinkSync(req.file.path);
    
    console.log(`📤 Sending results file to user...`);
    res.download(outputPath, path.basename(outputPath), (err) => {
      if (err) {
        console.error('❌ Download error:', err);
      } else {
        console.log(`✅ File sent successfully to user`);
      }
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          console.log(`🗑️ Cleaning up result file: ${path.basename(outputPath)}`);
          fs.unlinkSync(outputPath);
        }
      }, 60000);
    });

  } catch (err) {
    console.error('❌ Analyze error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { analyzeExcel };

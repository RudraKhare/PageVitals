// const express = require('express');

// const multer = require('multer');
// const XLSX = require('xlsx');
// const axios = require('axios');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({ 
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['.xlsx', '.xls'];
//     const fileExt = path.extname(file.originalname).toLowerCase();
//     if (allowedTypes.includes(fileExt)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only Excel files are allowed!'), false);
//     }
//   }
// });

// // Your PageSpeed Insights API key (you'll provide this)
// const API_KEY = process.env.PAGESPEED_API_KEY || 'AIzaSyBJM7muixlGWBBrmtcXRSapRQ-J6i1zU8o';

// // Function to get PageSpeed Insights data
// async function getPageSpeedData(url, strategy = 'mobile') {
//   try {
//     const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;
    
//     const response = await axios.get(apiUrl, { timeout: 30000 });
//     const data = response.data;
    
//     if (data.lighthouseResult && data.lighthouseResult.categories) {
//       const categories = data.lighthouseResult.categories;
//       return {
//         performance: Math.round(categories.performance?.score * 100) || 0,
//         accessibility: Math.round(categories.accessibility?.score * 100) || 0,
//         bestPractices: Math.round(categories['best-practices']?.score * 100) || 0,
//         seo: Math.round(categories.seo?.score * 100) || 0,
//         error: null
//       };
//     } else {
//       return {
//         performance: 0,
//         accessibility: 0,
//         bestPractices: 0,
//         seo: 0,
//         error: 'No data available'
//       };
//     }
//   } catch (error) {
//     console.error(`Error analyzing ${url}:`, error.message);
//     return {
//       performance: 0,
//       accessibility: 0,
//       bestPractices: 0,
//       seo: 0,
//       error: error.message
//     };
//   }
// }

// // Function to add delay between API calls
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Route to handle file upload and processing
// app.post('/api/analyze', upload.single('excelFile'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     // Read the Excel file
//     const workbook = XLSX.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(worksheet);

//     if (data.length === 0) {
//       return res.status(400).json({ error: 'Excel file is empty' });
//     }

//     // Find URL column (look for common column names)
//     const urlColumn = Object.keys(data[0]).find(key => 
//       key.toLowerCase().includes('url') || 
//       key.toLowerCase().includes('link') || 
//       key.toLowerCase().includes('website')
//     );

//     if (!urlColumn) {
//       return res.status(400).json({ 
//         error: 'No URL column found. Please ensure your Excel file has a column with URLs named "URL", "Link", or "Website"' 
//       });
//     }

//     const results = [];
//     const totalUrls = data.length;
    
//     // Process URLs in batches to avoid rate limiting
//     for (let i = 0; i < data.length; i++) {
//       const row = data[i];
//       const url = row[urlColumn];
      
//       if (!url || !url.toString().trim()) {
//         results.push({
//           ...row,
//           'Mobile Performance': 0,
//           'Mobile Accessibility': 0,
//           'Mobile Best Practices': 0,
//           'Mobile SEO': 0,
//           'Desktop Performance': 0,
//           'Desktop Accessibility': 0,
//           'Desktop Best Practices': 0,
//           'Desktop SEO': 0,
//           'Error': 'No URL provided'
//         });
//         continue;
//       }

//       console.log(`Processing ${i + 1}/${totalUrls}: ${url}`);

//       // Get mobile results
//       const mobileResults = await getPageSpeedData(url, 'mobile');
//       await delay(1000); // 1 second delay between requests
      
//       // Get desktop results
//       const desktopResults = await getPageSpeedData(url, 'desktop');
//       await delay(1000); // 1 second delay between requests

//       results.push({
//         ...row,
//         'Mobile Performance': mobileResults.performance,
//         'Mobile Accessibility': mobileResults.accessibility,
//         'Mobile Best Practices': mobileResults.bestPractices,
//         'Mobile SEO': mobileResults.seo,
//         'Desktop Performance': desktopResults.performance,
//         'Desktop Accessibility': desktopResults.accessibility,
//         'Desktop Best Practices': desktopResults.bestPractices,
//         'Desktop SEO': desktopResults.seo,
//         'Error': mobileResults.error || desktopResults.error || ''
//       });

//       // Send progress update
//       if (i % 10 === 0 || i === data.length - 1) {
//         console.log(`Progress: ${i + 1}/${totalUrls} completed`);
//       }
//     }

//     // Create new workbook with results
//     const newWorkbook = XLSX.utils.book_new();
//     const newWorksheet = XLSX.utils.json_to_sheet(results);
//     XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'PageSpeed Results');

//     // Save the file
//     const outputFileName = `pagespeed-results-${Date.now()}.xlsx`;
//     const outputPath = path.join('uploads', outputFileName);
//     XLSX.writeFile(newWorkbook, outputPath);

//     // Clean up uploaded file
//     fs.unlinkSync(req.file.path);

//     // Send the result file
//     res.download(outputPath, outputFileName, (err) => {
//       if (err) {
//         console.error('Error sending file:', err);
//       }
//       // Clean up result file after download
//       setTimeout(() => {
//         if (fs.existsSync(outputPath)) {
//           fs.unlinkSync(outputPath);
//         }
//       }, 60000); // Delete after 1 minute
//     });

//   } catch (error) {
//     console.error('Error processing file:', error);
//     res.status(500).json({ error: 'Error processing file: ' + error.message });
//   }
// });

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'PageSpeed Analyzer API is running' });
// });

// // Error handling middleware
// app.use((error, req, res, next) => {
//   if (error instanceof multer.MulterError) {
//     if (error.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ error: 'File too large' });
//     }
//   }
//   res.status(500).json({ error: error.message });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;
// ----------------------------------------------------------------
// const express = require('express');
// const multer = require('multer');
// const XLSX = require('xlsx');
// const axios = require('axios');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// // Setup multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['.xlsx', '.xls'];
//     const fileExt = path.extname(file.originalname).toLowerCase();
//     if (allowedTypes.includes(fileExt)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only Excel files are allowed!'), false);
//     }
//   }
// });

// // PageSpeed Insights API key
// const API_KEY = process.env.PAGESPEED_API_KEY || 'AIzaSyCW2kTHW8-LhkWwzZUQBX_742RLyfJ1M5Q';
// // AIzaSyCW2kTHW8-LhkWwzZUQBX_742RLyfJ1M5Q

// // Delay helper
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Retry helper
// async function retry(fn, retries = 3, delayMs = 2000) {
//   let lastError;
//   for (let i = 0; i < retries; i++) {
//     try {
//       return await fn();
//     } catch (error) {
//       lastError = error;
//       console.warn(`Retry ${i + 1} failed: ${error.message}`);
//       await delay(delayMs);
//     }
//   }
//   throw lastError;
// }

// // PageSpeed API call
// async function getPageSpeedData(url, strategy = 'mobile') {
//   try {
//     const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${API_KEY}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;

//     const response = await axios.get(apiUrl, { timeout: 60000 }); // increased timeout

//     const data = response.data;
//     if (data.lighthouseResult && data.lighthouseResult.categories) {
//       const categories = data.lighthouseResult.categories;
//       return {
//         performance: Math.round(categories.performance?.score * 100) || 0,
//         accessibility: Math.round(categories.accessibility?.score * 100) || 0,
//         bestPractices: Math.round(categories['best-practices']?.score * 100) || 0,
//         seo: Math.round(categories.seo?.score * 100) || 0,
//         error: null
//       };
//     } else {
//       return {
//         performance: 0,
//         accessibility: 0,
//         bestPractices: 0,
//         seo: 0,
//         error: 'No data available'
//       };
//     }
//   } catch (error) {
//     console.error(`Error analyzing ${url}:`, {
//       message: error.message,
//       code: error.code,
//       status: error.response?.status,
//       data: error.response?.data
//     });
//     return {
//       performance: 0,
//       accessibility: 0,
//       bestPractices: 0,
//       seo: 0,
//       error: error.message
//     };
//   }
// }

// // Route to analyze uploaded Excel
// app.post('/api/analyze', upload.single('excelFile'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const workbook = XLSX.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(worksheet);

//     if (data.length === 0) {
//       return res.status(400).json({ error: 'Excel file is empty' });
//     }

//     const urlColumn = Object.keys(data[0]).find(key =>
//       key.toLowerCase().includes('url') ||
//       key.toLowerCase().includes('link') ||
//       key.toLowerCase().includes('website')
//     );

//     if (!urlColumn) {
//       return res.status(400).json({
//         error: 'No URL column found. Please ensure your Excel file has a column named "URL", "Link", or "Website"'
//       });
//     }

//     const results = [];
//     const totalUrls = data.length;

//     for (let i = 0; i < totalUrls; i++) {
//       const row = data[i];
//       const url = row[urlColumn];

//       // Validate URL
//       if (!/^https?:\/\/.+/i.test(url)) {
//         console.warn(`Skipping invalid URL: ${url}`);
//         results.push({
//           ...row,
//           'Mobile Performance': 0,
//           'Mobile Accessibility': 0,
//           'Mobile Best Practices': 0,
//           'Mobile SEO': 0,
//           'Desktop Performance': 0,
//           'Desktop Accessibility': 0,
//           'Desktop Best Practices': 0,
//           'Desktop SEO': 0,
//           'Error': 'Invalid URL format'
//         });
//         continue;
//       }

//       console.log(`Processing ${i + 1}/${totalUrls}: ${url}`);

//       // Get mobile and desktop results with retry
//       const mobileResults = await retry(() => getPageSpeedData(url, 'mobile'), 3, 2000);
//       await delay(2000);
//       const desktopResults = await retry(() => getPageSpeedData(url, 'desktop'), 3, 2000);
//       await delay(2000);

//       results.push({
//         ...row,
//         'Mobile Performance': mobileResults.performance,
//         'Mobile Accessibility': mobileResults.accessibility,
//         'Mobile Best Practices': mobileResults.bestPractices,
//         'Mobile SEO': mobileResults.seo,
//         'Desktop Performance': desktopResults.performance,
//         'Desktop Accessibility': desktopResults.accessibility,
//         'Desktop Best Practices': desktopResults.bestPractices,
//         'Desktop SEO': desktopResults.seo,
//         'Error': mobileResults.error || desktopResults.error || ''
//       });

//       if (i % 10 === 0 || i === totalUrls - 1) {
//         console.log(`Progress: ${i + 1}/${totalUrls} completed`);
//       }
//     }

//     // Write results to new Excel
//     const newWorkbook = XLSX.utils.book_new();
//     const newWorksheet = XLSX.utils.json_to_sheet(results);
//     XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'PageSpeed Results');

//     const outputFileName = `pagespeed-results-${Date.now()}.xlsx`;
//     const outputPath = path.join('uploads', outputFileName);
//     XLSX.writeFile(newWorkbook, outputPath);

//     // Delete uploaded file
//     fs.unlinkSync(req.file.path);

//     // Send result to user
//     res.download(outputPath, outputFileName, (err) => {
//       if (err) console.error('Error sending file:', err);
//       setTimeout(() => {
//         if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
//       }, 60000); // clean after 1 minute
//     });

//   } catch (error) {
//     console.error('Error processing file:', error);
//     res.status(500).json({ error: 'Error processing file: ' + error.message });
//   }
// });

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'PageSpeed Analyzer API is running' });
// });

// // Error middleware
// app.use((error, req, res, next) => {
//   if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
//     return res.status(400).json({ error: 'File too large' });
//   }
//   res.status(500).json({ error: error.message });
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// module.exports = app;



// ---------------PARALLEL PROCESSING and using 2 APIS-------------------
// const express = require('express');
// const multer = require('multer');
// const XLSX = require('xlsx');
// const axios = require('axios');
// const cors = require('cors');
// const path = require('path');
// const fs = require('fs');
// const pLimit = require('p-limit').default;
// // const pLimit = require('p-limit');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // 🔐 Two API keys
// const API_KEYS = [
//   'AIzaSyCW2kTHW8-LhkWwzZUQBX_742RLyfJ1M5Q',
//   'AIzaSyBJM7muixlGWBBrmtcXRSapRQ-J6i1zU8o'
// ];
// let apiKeyIndex = 0;
// function getNextApiKey() {
//   const key = API_KEYS[apiKeyIndex];
//   apiKeyIndex = (apiKeyIndex + 1) % API_KEYS.length;
//   return key;
// }

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });
// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['.xlsx', '.xls'];
//     const ext = path.extname(file.originalname).toLowerCase();
//     cb(allowedTypes.includes(ext) ? null : new Error('Only Excel files allowed!'), allowedTypes.includes(ext));
//   }
// });

// // 🔍 Fetch PageSpeed data
// async function getPageSpeedData(url, strategy = 'mobile', retries = 2) {
//   const apiKey = getNextApiKey();
//   const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;

//   for (let attempt = 1; attempt <= retries + 1; attempt++) {
//     try {
//       const response = await axios.get(apiUrl, { timeout: 60000 });
//       const cat = response.data.lighthouseResult?.categories;

//       return {
//         performance: Math.round(cat?.performance?.score * 100) || 0,
//         accessibility: Math.round(cat?.accessibility?.score * 100) || 0,
//         bestPractices: Math.round(cat?.['best-practices']?.score * 100) || 0,
//         seo: Math.round(cat?.seo?.score * 100) || 0,
//         error: null
//       };
//     } catch (error) {
//       const isRetryable = error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500);
//       console.error(`Error (${strategy}) for ${url}: ${error.message} (Attempt ${attempt})`);
//       if (attempt <= retries && isRetryable) await new Promise(r => setTimeout(r, 2000 * attempt));
//       else return { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, error: error.message };
//     }
//   }
// }

// // 🧠 Process URLs with concurrency

// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// async function processInBatches(data, urlColumn, batchSize = 20) {
//   const results = [];
//   const limit = pLimit(10); // 10 parallel requests max

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
//       if (res.status === 'fulfilled') results.push(res.value);
//       else results.push({ Error: res.reason });
//     });

//     console.log(`✅ Processed ${Math.min(i + batchSize, data.length)} / ${data.length}`);
//     await delay(1000);
//   }

//   return results;
// }


// // Helper for default 0 metrics
// function emptyMetrics() {
//   return {
//     'Mobile Performance': 0,
//     'Mobile Accessibility': 0,
//     'Mobile Best Practices': 0,
//     'Mobile SEO': 0,
//     'Desktop Performance': 0,
//     'Desktop Accessibility': 0,
//     'Desktop Best Practices': 0,
//     'Desktop SEO': 0
//   };
// }

// // 📥 Upload & analyze
// app.post('/api/analyze', upload.single('excelFile'), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

//     const workbook = XLSX.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[sheetName];
//     const data = XLSX.utils.sheet_to_json(worksheet);

//     if (data.length === 0) return res.status(400).json({ error: 'Excel file is empty' });

//     const urlColumn = Object.keys(data[0]).find(k =>
//       k.toLowerCase().includes('url') || k.toLowerCase().includes('link') || k.toLowerCase().includes('website'));
//     if (!urlColumn) {
//       return res.status(400).json({ error: 'No URL column found. Use "URL", "Link", or "Website"' });
//     }

//     const results = await processInBatches(data, urlColumn, 10);

//     const newWorkbook = XLSX.utils.book_new();
//     const newWorksheet = XLSX.utils.json_to_sheet(results);
//     XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'PageSpeed Results');
//     const outputFile = `pagespeed-results-${Date.now()}.xlsx`;
//     const outputPath = path.join('uploads', outputFile);
//     XLSX.writeFile(newWorkbook, outputPath);

//     fs.unlinkSync(req.file.path); // cleanup

//     res.download(outputPath, outputFile, (err) => {
//       if (err) console.error('Download error:', err);
//       setTimeout(() => {
//         if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
//       }, 60000);
//     });
//   } catch (error) {
//     console.error('❌ Analyze error:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // 🧪 Health check
// app.get('/api/health', (_, res) => {
//   res.json({ status: 'OK', message: 'Server running' });
// });

// // 🧱 Error handler
// app.use((error, req, res, next) => {
//   if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
//     return res.status(400).json({ error: 'File too large' });
//   }
//   res.status(500).json({ error: error.message });
// });

// // 🎯 Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// module.exports = app;


const express = require('express');
const cors = require('cors');
const path = require('path');

const analyzeRoutes = require('./routes/analyzeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/api', analyzeRoutes);

app.get('/api/health', (_, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 =============================================`);
  console.log(`🚀 PageVitals Backend Server Started`);
  console.log(`🚀 =============================================`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 API endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log(`🔑 API keys loaded: 4 keys in parallel`);
  console.log(`⚡ Processing mode: PARALLEL (4 concurrent requests)`);
  console.log(`📝 Verbose logging: ENABLED`);
  console.log(`🚀 =============================================\n`);
});

module.exports = app;

const axios = require('axios');
const { getNextApiKey, getApiKeyByIndex } = require('../utils/apiKeyManager');
const delay = require('../utils/delay');

async function getPageSpeedData(url, strategy = 'mobile', retries = 2, dedicatedApiKeyIndex = null) {
  // Use dedicated API key if provided, otherwise rotate through keys
  const apiKey = dedicatedApiKeyIndex !== null ? getApiKeyByIndex(dedicatedApiKeyIndex) : getNextApiKey();
  
  // Reduced delay since we're using parallel processing
  const randomDelay = Math.random() * 1000 + 500; // 0.5-1.5 second random delay
  await delay(randomDelay);
  
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo`;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      console.log(`      🌐 API Request (${strategy}, attempt ${attempt}): ${url.substring(0, 50)}...`);
      const requestStart = Date.now();
      
      const response = await axios.get(apiUrl, { 
        timeout: 120000, // Increased to 2 minutes
        headers: {
          'User-Agent': 'PageVitals-Analyzer/1.0'
        }
      });
      
      const requestTime = ((Date.now() - requestStart) / 1000).toFixed(1);
      console.log(`      ✅ API Response received in ${requestTime}s`);
      
      const cat = response.data.lighthouseResult?.categories;

      if (!cat) {
        console.log(`      ⚠️  No categories found in API response`);
        return { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, error: 'No categories found in response' };
      }

      const scores = {
        performance: Math.round(cat?.performance?.score * 100) || 0,
        accessibility: Math.round(cat?.accessibility?.score * 100) || 0,
        bestPractices: Math.round(cat?.['best-practices']?.score * 100) || 0,
        seo: Math.round(cat?.seo?.score * 100) || 0,
        error: null
      };
      
      console.log(`      📊 Scores: P:${scores.performance}% A:${scores.accessibility}% BP:${scores.bestPractices}% SEO:${scores.seo}%`);
      
      return scores;
    } catch (error) {
      const isRetryable = error.code === 'ECONNABORTED' || 
                          (error.response && error.response.status >= 500) ||
                          (error.response && error.response.status === 429) ||
                          error.code === 'ENOTFOUND' ||
                          error.code === 'ECONNRESET';
      
      console.error(`      ❌ Error (${strategy}): ${error.message} (Attempt ${attempt})`);
      
      if (attempt <= retries && isRetryable) {
        // Much longer progressive backoff for stability
        let delayTime;
        if (error.response?.status === 429) {
          delayTime = 15000 * attempt; // 15s, 30s for rate limits
          console.log(`      🚦 Rate limit detected, waiting ${delayTime}ms...`);
        } else if (error.code === 'ECONNABORTED') {
          delayTime = 10000 * attempt; // 10s, 20s for timeouts
          console.log(`      ⏱️  Timeout detected, waiting ${delayTime}ms...`);
        } else {
          delayTime = 8000 * attempt; // 8s, 16s for other errors
          console.log(`      🔄 Retrying in ${delayTime}ms...`);
        }
        
        await delay(delayTime);
      } else {
        const errorMsg = error.response?.status === 429 ? 'Rate limit exceeded' :
                        error.code === 'ECONNABORTED' ? 'Request timeout' :
                        error.response?.status >= 500 ? 'Server error' :
                        error.message;
        console.log(`      💀 Final error: ${errorMsg}`);
        return { performance: 0, accessibility: 0, bestPractices: 0, seo: 0, error: errorMsg };
      }
    }
  }
}

module.exports = { getPageSpeedData };

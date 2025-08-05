// Configuration settings for PageVitals API
module.exports = {
  // Processing settings
  CONCURRENCY_LIMIT: 1,        // Number of concurrent API requests (1 = sequential)
  BATCH_SIZE: 3,               // URLs processed per batch
  BATCH_DELAY: 10000,          // Delay between batches (ms)
  REQUEST_DELAY: 2000,         // Delay before each request (ms)
  MOBILE_DESKTOP_DELAY: 3000,  // Delay between mobile and desktop requests (ms)
  
  // API settings
  REQUEST_TIMEOUT: 120000,     // Request timeout (2 minutes)
  MAX_RETRIES: 2,              // Number of retry attempts
  
  // Retry delays (progressive backoff)
  RATE_LIMIT_DELAY: 15000,     // Base delay for 429 errors (ms)
  TIMEOUT_DELAY: 10000,        // Base delay for timeout errors (ms)
  SERVER_ERROR_DELAY: 8000,    // Base delay for 5xx errors (ms)
  
  // URL validation
  SKIP_LOCAL_URLS: true,       // Skip localhost/development URLs
  
  // Logging
  VERBOSE_LOGGING: true        // Enable detailed progress logging
};

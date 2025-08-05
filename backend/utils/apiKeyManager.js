const API_KEYS = [
    'AIzaSyCW2kTHW8-LhkWwzZUQBX_742RLyfJ1M5Q', 
    'AIzaSyBJM7muixlGWBBrmtcXRSapRQ-J6i1zU8o',
    'AIzaSyDa4C25FtEPEcTro2cb7sFemv-HBRZ_TsA',
    'AIzaSyBvch0Gs0aN82fFeIR1UXxmH0CAAaFcOpE'
  ];
  
  let apiKeyIndex = 0;
  
  function getNextApiKey() {
    const key = API_KEYS[apiKeyIndex];
    apiKeyIndex = (apiKeyIndex + 1) % API_KEYS.length;
    return key;
  }

  // New function to get a specific API key by index for parallel processing
  function getApiKeyByIndex(index) {
    return API_KEYS[index % API_KEYS.length];
  }

  // Get total number of API keys available
  function getApiKeyCount() {
    return API_KEYS.length;
  }
  
  module.exports = { 
    getNextApiKey: getNextApiKey,
    getApiKeyByIndex,
    getApiKeyCount,
    // Keep default export for backward compatibility
    default: getNextApiKey
  };
  
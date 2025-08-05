// src/utils/api.js
export async function analyzeFile(formData) {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Analysis failed');
    }
  
    return response.blob();
  }
  
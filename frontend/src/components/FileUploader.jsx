import React from 'react';
import {
  Upload, Download, Activity, Globe, Shield, Search, Smartphone, Monitor,
} from 'lucide-react';

const FileUploader = ({ file, setFile, progress, setProgress, error, setError, isProcessing, setIsProcessing }) => {
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid Excel file (.xlsx or .xls)');
        setFile(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select an Excel file');
      return;
    }

    setIsProcessing(true);
    setError('');
    setProgress('Uploading file and starting analysis...');

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      setProgress('Analysis complete! Downloading results...');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `pagespeed-results-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setProgress('Results downloaded successfully!');
      setTimeout(() => {
        setProgress('');
        setFile(null);
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
      }, 3000);
    } catch (err) {
      setError(err.message);
      setProgress('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Activity className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">PageSpeed Analyzer</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Analyze page speed performance for thousands of Bajaj Finserv URLs using Google's Lighthouse
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { Icon: Activity, title: 'Performance', desc: 'Load speed metrics', color: 'green' },
            { Icon: Globe, title: 'Accessibility', desc: 'User experience', color: 'blue' },
            { Icon: Shield, title: 'Best Practices', desc: 'Web standards', color: 'purple' },
            { Icon: Search, title: 'SEO', desc: 'Search optimization', color: 'orange' },
          ].map(({ Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-lg shadow-md p-6 text-center">
              <Icon className={`w-8 h-8 text-${color}-500 mx-auto mb-2`} />
              <h3 className="font-semibold text-gray-700">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        {/* Upload Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upload Excel File</h2>
                <p className="text-gray-600 mb-6">
                  Upload an Excel file containing URLs to analyze their page speed performance
                </p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <span className="text-blue-600 font-medium hover:text-blue-500">
                    Click to upload Excel file
                  </span>
                  <span className="text-gray-500"> or drag and drop</span>
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Supports .xlsx and .xls files (Max 60,000 URLs)
                </p>
              </div>

              {file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Upload className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">{file.name}</span>
                    <span className="text-blue-600 ml-2">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-2">File Requirements:</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Excel file should contain a column with URLs (named "URL", "Link", or "Website")</li>
                  <li>• Each URL should be complete (including http:// or https://)</li>
                  <li>• Processing time: ~2 seconds per URL (rate-limited for API stability)</li>
                  <li>• Large files may take significant time to process</li>
                </ul>
              </div>

              {/* Device Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                  <Smartphone className="w-6 h-6 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-800">Mobile Analysis</h4>
                    <p className="text-sm text-gray-600">Simulates 3G connection</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center">
                  <Monitor className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-800">Desktop Analysis</h4>
                    <p className="text-sm text-gray-600">Simulates desktop connection</p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file || isProcessing}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                  !file || isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Analyze Page Speed
                  </div>
                )}
              </button>
            </div>

            {/* Progress */}
            {progress && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  <span className="text-blue-800">{progress}</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-600 rounded-full mr-3"></div>
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}
          </div>

          {/* Output Info */}
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Output Format
            </h3>
            <p className="text-gray-600 mb-4">
              The output Excel file will contain all original columns plus the following new columns:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Mobile Metrics:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Mobile Performance (0-100)</li>
                  <li>• Mobile Accessibility (0-100)</li>
                  <li>• Mobile Best Practices (0-100)</li>
                  <li>• Mobile SEO (0-100)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Desktop Metrics:</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>• Desktop Performance (0-100)</li>
                  <li>• Desktop Accessibility (0-100)</li>
                  <li>• Desktop Best Practices (0-100)</li>
                  <li>• Desktop SEO (0-100)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;

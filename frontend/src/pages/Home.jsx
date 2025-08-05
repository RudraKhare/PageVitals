import React, { useState } from 'react';
import FileUploader from '../components/FileUploader';

function Home() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <FileUploader
          file={file}
          setFile={setFile}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          progress={progress}
          setProgress={setProgress}
          error={error}
          setError={setError}
        />
      </div>
    </div>
  );
}

export default Home;

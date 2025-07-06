import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '../utils/api';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a PDF or DOCX file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      await uploadFile(file, setProgress);
      navigate('/chat');
    } catch (err) {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="w-screen min-h-screen flex">
      {/* Left Panel - Upload Area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg p-12 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                Upload Document
              </h2>
              <p className="text-gray-600">
                Upload a PDF or DOCX file to process and analyze
              </p>
            </div>

            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors duration-200">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-4"
                >
                  <div className="rounded-full bg-indigo-100 p-4">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-indigo-600">
                      {file ? file.name : 'Choose a file'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      or drag and drop here
                    </p>
                  </div>
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-gray-900">
                    <span>Upload progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="overflow-hidden h-2 rounded-full bg-gray-200">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300 ease-in-out"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className={`w-full flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg text-white transition-all duration-200
                  ${!file || uploading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Upload Document'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 text-white p-12 flex-col justify-center items-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-6">Document Processing</h1>
          <p className="text-xl opacity-90 mb-8">
            Our AI-powered system will analyze your documents and make them instantly searchable.
          </p>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 bg-indigo-500 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Smart Document Analysis</h3>
                <p className="text-indigo-200">Automatically extracts and indexes document content</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 bg-indigo-500 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Instant Search</h3>
                <p className="text-indigo-200">Find any information in seconds</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 bg-indigo-500 rounded-lg p-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Natural Language Queries</h3>
                <p className="text-indigo-200">Ask questions in plain English</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
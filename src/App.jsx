import React, { useState } from 'react';
import mammoth from 'mammoth';
import { saveAs } from 'file-saver';

function App() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    handleFileUpload(uploadedFile);
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const uploadedFile = event.dataTransfer.files[0];
    handleFileUpload(uploadedFile);
  };

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setError(null);
    setSuccessMessage('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = await mammoth.extractRawText({ arrayBuffer: event.target.result });

        const contentArray = result.value.split(/\s+/);
        
        const csvContent = contentArray.map((item) => {
          return isNaN(item) ? `"${item}"` : item;
        });

        setSuccessMessage('File uploaded successfully!');
        setCsvPreview(csvContent);
      } catch (error) {
        setError('Error processing the file. Please try again.');
        console.error('Error processing the file:', error.message);
      }
    };

    reader.readAsArrayBuffer(uploadedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const downloadCSV = () => {
    const csvText = csvPreview.join('\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });

    // Ensure the file name is the same as the uploaded file
    const fileName = file ? file.name.replace(/\.[^/.]+$/, "") + '.csv' : 'output.csv';

    saveAs(blob, fileName);
  };

  document.title = 'WORD TO CSV ';

  return (
    <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white font-sans">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full border-4 border-blue-600 border-opacity-60 transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-3xl font-bold mb-6 text-blue-300">WORD TO CSV</h1>

        <div
          className="mb-4 p-6 border-dashed border-2 border-blue-500 rounded-md cursor-pointer hover:border-blue-400"
          onDrop={handleFileDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="text-lg text-blue-200">
            {file ? 'File Uploaded: ' + file.name : 'Drag and drop or click to upload a Word document'}
          </label>
        </div>

        <button
          onClick={downloadCSV}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none shadow-md border border-white"
          disabled={!csvPreview.length}
        >
          Download CSV
        </button>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}

        {csvPreview.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl mb-2 text-blue-300">CSV Preview</h2>
            <pre className="bg-gray-700 p-4 rounded-md overflow-x-auto">
              {csvPreview.join('\n')}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useCallback } from 'react';  
import { useDropzone } from 'react-dropzone';
import { uploadLeads } from '../../services/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  
import { FiUpload, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const UploadForm = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);  

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(extension)) {
      toast.error('Only CSV, XLSX, and XLS files are allowed');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Starting upload...', file.name);
      const response = await uploadLeads(file);
      
      console.log('Upload response:', response);
      
      // Check if response is successful
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Leads uploaded successfully!');
        onUploadSuccess();
      } else {
        // Handle unexpected response format
        toast.error('Upload completed but response format was unexpected');
        onUploadSuccess(); // Still refresh the data
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      
      // Check if it's actually a success but caught as error
      if (error.response?.data?.success) {
        toast.success(error.response.data.message || 'Leads uploaded successfully!');
        onUploadSuccess();
      } else {
        // Real error
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            'Upload failed. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'text/csv': ['.csv'], 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 
      'application/vnd.ms-excel': ['.xls'] 
    },
    maxFiles: 1,
    disabled: loading
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          loading 
            ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
            : isDragActive 
              ? 'bg-blue-50 border-primary cursor-pointer' 
              : 'border-borderLight cursor-pointer hover:border-primary hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} disabled={loading} />
        
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-secondary">Uploading and distributing leads...</p>
            <p className="text-sm text-secondary mt-2">Please wait, this may take a moment</p>
          </>
        ) : (
          <>
            <FiUpload className="mx-auto w-12 h-12 text-secondary mb-4" />
            <p className="text-secondary mb-2">
              {isDragActive ? 'Drop the file here...' : 'Drag & drop a CSV/XLSX file here, or click to select'}
            </p>
            <p className="text-sm text-secondary">
              Required columns: <span className="font-semibold">FirstName, Phone, Email</span>
            </p>
            <p className="text-sm text-secondary">Optional: Notes</p>
          </>
        )}
      </div>
      
      {loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <FiCheckCircle className="inline mr-2" />
          Processing your file... This includes parsing, validating, and distributing leads to agents.
        </div>
      )}
    </div>
  );
};

export default UploadForm;
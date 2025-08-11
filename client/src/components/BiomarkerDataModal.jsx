import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ApiService from '../services/api';

const BiomarkerDataModal = ({ biomarker, condition, isOpen, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && biomarker && condition) {
      fetchData(currentPage);
    }
  }, [isOpen, biomarker, condition, currentPage]);

  const fetchData = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getBiomarkerData(biomarker, condition, page, 20);
      if (response.success) {
        setData(response.data);
        setTotalPages(response.total_pages);
        setTotalCount(response.total_count);
      } else {
        setError(response.error || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching biomarker data:', error);
      setError('Failed to fetch biomarker data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {biomarker} - {condition} Data
            </h2>
            <p className="text-sm text-slate-600">
              {totalCount} total records found
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[70vh]">
          {loading ? (
            <LoadingSpinner center text="Loading biomarker data..." />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Data</h3>
              <p className="text-slate-600">{error}</p>
              <button
                onClick={() => fetchData(currentPage)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Data Found</h3>
              <p className="text-slate-600">No records found for {biomarker} in {condition} condition.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((item, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <DataField label="Subject ID" value={item['Subject ID']} />
                    <DataField label="PDF Name" value={item['PDF_name']} truncate />
                    <DataField label="Treatment" value={item['Treatment_Name']} />
                    <DataField 
                      label="Level Change" 
                      value={item['Biomarker_Level_Change']} 
                      className={
                        item['Biomarker_Level_Change'] === 'increase' ? 'text-green-600' :
                        item['Biomarker_Level_Change'] === 'decrease' ? 'text-red-600' :
                        'text-slate-800'
                      }
                    />
                    <DataField label="Skin Change Type" value={item['Skin_Change_Type']} />
                    <DataField label="Study Type" value={item['Type of Study']} truncate />
                    <DataField label="Age" value={item['Age']} />
                    <DataField label="Sex" value={item['Sex']} />
                    <DataField label="Treatment Status" value={item['Treatment_Status']} />
                  </div>
                  {item['Key Outcome'] && (
                    <div className="mt-4">
                      <label className="text-xs font-semibold text-slate-600 uppercase">Key Outcome</label>
                      <p className="text-sm text-slate-800 mt-1">{item['Key Outcome']}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages} ({totalCount} total records)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper component for displaying data fields
const DataField = ({ label, value, className = '', truncate = false }) => {
  if (!value || value === 'nan' || value === 'None') {
    return (
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase">{label}</label>
        <p className="text-sm text-slate-400">N/A</p>
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 uppercase">{label}</label>
      <p className={`text-sm ${className || 'text-slate-800'} ${truncate ? 'truncate' : ''}`}>
        {value}
      </p>
    </div>
  );
};

export default BiomarkerDataModal;
// BiomarkerItem.jsx
import React, { useState, useEffect } from 'react';
import { Search, X, Trash2, Eye, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import BiomarkerLevelChangeStats from './BiomarkerLevelChangeStats';

const BiomarkerItem = ({
  biomarker,
  index,
  onUpdate,
  onRemove,
  availableBiomarkers = [],
  condition,
  treatmentId,
  onViewData,
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [biomarkerData, setBiomarkerData] = useState(null);
  const [byCondition, setByCondition] = useState(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);

  // Load data when biomarker name OR condition changes
  useEffect(() => {
    if (biomarker.name.trim() && condition && condition.trim()) {
      loadBiomarkerData();
    } else {
      setBiomarkerData(null);
      setByCondition(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biomarker.name, condition]);

  const loadBiomarkerData = async () => {
    if (!biomarker.name.trim() || !condition || !condition.trim()) return;

    setIsLoadingData(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      console.log('Making request to:', `${API_URL}/api/biomarker/data`);
      
      const requestBody = { 
        biomarker_name: biomarker.name, 
        condition: condition,
        page: 1, 
        size: 100 
      };
      
      console.log('Request body:', requestBody);

      const response = await fetch(`${API_URL}/api/biomarker/data`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        throw new Error(`API request failed (${response.status}): ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API Result:', result);
      
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to load data');
      }

      // Handle the response data
      setBiomarkerData(result.data || []);
      setByCondition(result.by_condition || null);
      
      // Check if this is fallback/mock data
      if (result.fallback) {
        setError('Using mock data - Elasticsearch connection limited');
      } else {
        // Double-check by looking at the actual data
        const hasRealData = result.data && result.data.length > 0 && 
                           !result.data.some(item => item.Document_id?.toString().startsWith('mock'));
        if (!hasRealData && result.data && result.data.length > 0) {
          setError('Using mock data - No real Elasticsearch data found');
        }
      }
      
    } catch (err) {
      console.error('Error loading biomarker data:', err);
      setError(err?.message || 'Failed to load data');
      // Keep UI usable with empty array in error states
      setBiomarkerData([]);
      setByCondition(null);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (value) => {
    onUpdate(index, { ...biomarker, name: value });

    if (value.length > 0) {
      setIsSearching(true);
      const filtered = availableBiomarkers
        .filter((b) => b.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8);
      setSuggestions(filtered);
    } else {
      setIsSearching(false);
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    onUpdate(index, { ...biomarker, name: suggestion });
    setIsSearching(false);
    setSuggestions([]);
  };

  const clearInput = () => {
    onUpdate(index, { ...biomarker, name: '' });
    setIsSearching(false);
    setSuggestions([]);
    setBiomarkerData(null);
    setByCondition(null);
    setError(null);
  };

  const dataQuality = () => {
    if (isLoadingData) {
      return (
        <div className="flex items-center gap-1 text-blue-600">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span className="text-xs">Loading…</span>
        </div>
      );
    }
    if (error) {
      const isMockData = error.includes('mock data') || error.includes('fallback');
      return (
        <div className="flex items-center gap-1 text-amber-600" title={error}>
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">{isMockData ? 'Mock data' : 'Connection error'}</span>
        </div>
      );
    }
    if (biomarkerData && biomarkerData.length > 0) {
      // Check if data has Document_id starting with 'mock' (indicates mock data)
      const isMockData = biomarkerData.some(item => 
        item.Document_id && item.Document_id.toString().startsWith('mock')
      );
      
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span className="text-xs">
            {biomarkerData.length} studies
            {isMockData && <span className="text-amber-600"> (mock)</span>}
          </span>
          <span className="text-xs text-green-700/80">
            • {condition}
          </span>
        </div>
      );
    }
    return null;
  };

  const shouldShowStats = biomarker.name.trim() && condition && (biomarkerData || isLoadingData);

  return (
    <div className="space-y-3">
      {/* Biomarker Input */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={biomarker.name}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search biomarkers…"
                className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                disabled={!condition}
              />
              {biomarker.name && (
                <button
                  onClick={clearInput}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Suggestions */}
            {isSearching && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {dataQuality()}
            {onViewData && biomarkerData && condition && (
              <button
                onClick={() => onViewData(biomarker.name, condition)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="View detailed data"
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onRemove(index)}
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove biomarker"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Condition Requirement Notice */}
        {!condition && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-xs">Please select a condition in the treatment card to enable biomarker search</span>
            </div>
          </div>
        )}

        {/* Toggle Stats */}
        {shouldShowStats && (
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Activity className="h-4 w-4" />
              {showStats ? 'Hide' : 'Show'} Level Change Stats
            </button>

            {biomarkerData && (
              <span className="text-xs text-slate-500">
                {biomarkerData.filter(d => d.Biomarker_Level_Change && d.Biomarker_Level_Change !== 'unknown').length} valid changes
              </span>
            )}
          </div>
        )}
      </div>

      {/* Level Change Statistics */}
      {showStats && shouldShowStats && (
        <div className="transition-all duration-300 ease-in-out">
          <BiomarkerLevelChangeStats
            biomarker={biomarker.name}
            condition={condition}
            data={biomarkerData || []}
            onViewDetails={onViewData}
            byCondition={byCondition || undefined}
          />
        </div>
      )}
    </div>
  );
};

export default BiomarkerItem;
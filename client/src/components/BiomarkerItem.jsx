// import React, { useState, useEffect } from 'react';
// import { FlaskConical, X, ExternalLink } from 'lucide-react';
// import AutocompleteInput from './AutocompleteInput';
// import ScoreBadge from './ScoreBadge';
// import LoadingSpinner from './LoadingSpinner';
// import ApiService from '../services/api';

// const BiomarkerItem = ({ 
//   biomarker, 
//   index, 
//   onUpdate, 
//   onRemove, 
//   availableBiomarkers = [],
//   condition = 'Aging',
//   treatmentId,
//   onViewData
// }) => {
//   const [score, setScore] = useState(null);
//   const [scoreData, setScoreData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (biomarker.name && biomarker.name.trim() && condition) {
//       calculateScore();
//     } else {
//       setScore(null);
//       setScoreData(null);
//     }
//   }, [biomarker.name, condition]);

//   const calculateScore = async () => {
//     if (!biomarker.name.trim()) return;
    
//     setLoading(true);
//     try {
//       const response = await ApiService.calculateScore(biomarker.name, condition);
//       if (response.success) {
//         setScore(response.score);
//         setScoreData(response);
//         setError('');
//       } else {
//         setError('Failed to calculate score');
//         setScore(null);
//         setScoreData(null);
//       }
//     } catch (error) {
//       console.error('Error calculating score:', error);
//       setError('Error calculating score');
//       setScore(null);
//       setScoreData(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBiomarkerChange = (value) => {
//     onUpdate(index, { ...biomarker, name: value });
//   };

//   const validateBiomarker = (name) => {
//     if (!name.trim()) {
//       setError('Biomarker name is required');
//       return false;
//     }
//     if (!availableBiomarkers.includes(name.trim())) {
//       setError('Biomarker not found in database');
//       return false;
//     }
//     setError('');
//     return true;
//   };


import React, { useState, useEffect, useRef } from 'react';
import { FlaskConical, X, ExternalLink, ChevronDown, AlertCircle, Loader2, Info, Zap, Activity } from 'lucide-react';

// Real API service (replace mock with your actual API)
const apiService = {
  async calculateScore(biomarkerName, condition) {
    const response = await fetch('http://localhost:5000/api/biomarker/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        biomarker_name: biomarkerName,
        condition: condition
      })
    });
    return await response.json();
  },

  async getAllConditions() {
    const response = await fetch('http://localhost:5000/api/conditions');
    return await response.json();
  }
};

// Inline AutocompleteInput
const AutocompleteInput = ({ 
  id, placeholder, value, onChange, onSelect, suggestions = [], 
  icon: Icon, error, size = "small" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);
  const mouseDownRef = useRef(false);

  useEffect(() => {
    const safeValue = value || '';
    const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
    
    if (safeValue.length > 0) {
      const searchValue = searchTerm || safeValue;
      const filtered = safeSuggestions
        .filter((item) => {
          if (typeof item !== 'string') return false;
          const itemLower = item.toLowerCase();
          const searchLower = searchValue.toLowerCase();
          return itemLower.includes(searchLower) || itemLower.startsWith(searchLower);
        })
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 8);
      
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value, suggestions, searchTerm]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm("");
    onChange(suggestion);
    if (onSelect) onSelect(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
        handleSuggestionClick(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
            error ? 'text-red-400' : 'text-slate-400'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-2 text-sm border-2 rounded-xl transition-all duration-300 bg-white shadow-sm font-medium ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-400' 
              : 'border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-md text-slate-700 placeholder-slate-400'
          }`}
          value={searchTerm || value || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            const safeValue = value || '';
            if (safeValue.length > 0 && filteredSuggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            if (!mouseDownRef.current) {
              setTimeout(() => {
                setIsOpen(false);
                setHighlightedIndex(-1);
                setSearchTerm("");
              }, 200);
            }
          }}
          autoComplete="off"
          spellCheck="false"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} />
        </div>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden"
          onMouseDown={(e) => {
            e.preventDefault();
            mouseDownRef.current = true;
          }}
          onMouseUp={() => {
            mouseDownRef.current = false;
          }}
        >
          <div className="max-h-60 overflow-y-auto py-1">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={`${suggestion}-${index}`}
                className={`px-4 py-2 cursor-pointer transition-all duration-150 font-medium ${
                  index === highlightedIndex
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="text-sm truncate">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

// Inline ScoreBadge Component
const ScoreBadge = ({ score, condition, showPercentage = true }) => {
  if (score === null || score === undefined) {
    return (
      <div className="flex items-center gap-2 bg-slate-100 text-slate-600 rounded-lg px-2 py-1 text-xs">
        <Info className="h-3 w-3" />
        <span className="font-medium">No data</span>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 0.7) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreIcon = (score) => {
    if (score >= 0.7) return <Zap className="h-3 w-3" />;
    if (score >= 0.4) return <Activity className="h-3 w-3" />;
    return <AlertCircle className="h-3 w-3" />;
  };

  const getScoreLabel = (score) => {
    if (score >= 0.7) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`flex items-center justify-between rounded-lg border p-2 text-xs ${getScoreColor(score)}`}>
      <div className="flex items-center gap-2">
        {getScoreIcon(score)}
        <div>
          <div className="font-semibold">{condition}</div>
          <div className="text-xs opacity-75">
            {getScoreLabel(score)}
            {showPercentage && ` (${(score * 100).toFixed(1)}%)`}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main BiomarkerItem Component
const BiomarkerItem = ({ 
  biomarker, 
  index, 
  onUpdate, 
  onRemove, 
  availableBiomarkers = [],
  treatmentId,
  onViewData
}) => {
  const [allScores, setAllScores] = useState({});
  const [availableConditions, setAvailableConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConditions();
  }, []);

  useEffect(() => {
    if (biomarker.name && biomarker.name.trim() && availableConditions.length > 0) {
      calculateAllScores();
    } else {
      setAllScores({});
    }
  }, [biomarker.name, availableConditions]);

  const loadConditions = async () => {
    try {
      const response = await apiService.getAllConditions();
      if (response.success) {
        setAvailableConditions(response.conditions);
      }
    } catch (error) {
      console.error('Error loading conditions:', error);
      setAvailableConditions(['Aging', 'Pigmentation', 'Wrinkles', 'Acne', 'Dryness', 'Sensitivity']);
    }
  };

  const calculateAllScores = async () => {
    if (!biomarker.name.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const scores = {};
      
      // Calculate scores for all conditions in parallel
      const scorePromises = availableConditions.map(async (condition) => {
        const response = await apiService.calculateScore(biomarker.name, condition);
        return { condition, response };
      });
      
      const results = await Promise.all(scorePromises);
      
      results.forEach(({ condition, response }) => {
        if (response.success) {
          scores[condition] = response;
        }
      });
      
      setAllScores(scores);
    } catch (error) {
      console.error('Error calculating scores:', error);
      setError('Error calculating scores');
    } finally {
      setLoading(false);
    }
  };

  const handleBiomarkerChange = (value) => {
    onUpdate(index, { ...biomarker, name: value });
  };

  const validateBiomarker = (name) => {
    if (!name.trim()) {
      setError('Biomarker name is required');
      return false;
    }
    if (!availableBiomarkers.includes(name.trim())) {
      setError('Biomarker not found in database');
      return false;
    }
    setError('');
    return true;
  };

  const getHighestScoringCondition = () => {
    if (Object.keys(allScores).length === 0) return null;
    
    return Object.entries(allScores).reduce((highest, [condition, data]) => {
      if (!highest || data.score > highest.score) {
        return { condition, ...data };
      }
      return highest;
    }, null);
  };

  const getSortedScores = () => {
    return Object.entries(allScores)
      .sort(([, a], [, b]) => b.score - a.score)
      .slice(0, 6);
  };

  const totalConditions = Object.keys(allScores).length;
  const averageScore = totalConditions > 0 
    ? Object.values(allScores).reduce((sum, data) => sum + data.score, 0) / totalConditions 
    : 0;

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <AutocompleteInput
            id={`biomarker-${treatmentId}-${index}`}
            placeholder="Enter biomarker name"
            value={biomarker.name}
            onChange={handleBiomarkerChange}
            onSelect={(value) => {
              handleBiomarkerChange(value);
              validateBiomarker(value);
            }}
            suggestions={availableBiomarkers}
            icon={FlaskConical}
            error={error}
          />
          
          {/* Multi-Condition Score Display */}
          <div className="mt-3">
            {loading ? (
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-blue-200">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-blue-600">Analyzing {availableConditions.length} conditions...</span>
              </div>
            ) : biomarker.name && totalConditions > 0 ? (
              <div className="space-y-3">
                {/* Summary */}
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      Analysis: {totalConditions} conditions
                    </span>
                    <button
                      onClick={() => onViewData && onViewData(biomarker.name, getHighestScoringCondition()?.condition)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Data
                    </button>
                  </div>
                  <div className="text-xs text-slate-600">
                    Avg: {(averageScore * 100).toFixed(1)}% • 
                    Best: {getHighestScoringCondition()?.condition} ({(getHighestScoringCondition()?.score * 100).toFixed(1)}%) • 
                    Total PDFs: {getHighestScoringCondition()?.total_pdfs || 192}
                  </div>
                </div>

                {/* Individual Condition Scores */}
                <div className="grid grid-cols-1 gap-2">
                  {getSortedScores().map(([condition, data]) => (
                    <ScoreBadge
                      key={condition}
                      score={data.score}
                      condition={condition}
                      showPercentage={true}
                    />
                  ))}
                </div>

                {/* Detailed PDF Statistics */}
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="text-xs text-slate-600">
                    <div className="font-medium mb-1">PDF Coverage by Condition:</div>
                    <div className="grid grid-cols-2 gap-x-4">
                      {getSortedScores().slice(0, 4).map(([condition, data]) => (
                        <div key={condition} className="flex justify-between">
                          <span>{condition}:</span>
                          <span className="font-mono">{data.biomarker_pdfs}/{data.total_pdfs}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : biomarker.name && error && !loading ? (
              <div className="p-2 bg-red-50 rounded border border-red-200">
                <div className="text-xs text-red-600">{error}</div>
              </div>
            ) : biomarker.name && !availableBiomarkers.includes(biomarker.name) ? (
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <div className="text-xs text-amber-600">
                  Biomarker not found in database
                </div>
              </div>
            ) : null}
          </div>
        </div>
        
        <button
          onClick={() => onRemove(index)}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors mt-0.5 flex-shrink-0"
          title="Remove biomarker"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default BiomarkerItem;
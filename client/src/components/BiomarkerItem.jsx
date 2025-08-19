// // BiomarkerItem.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Search, X, Trash2, Eye, Activity, AlertCircle, CheckCircle,
//   ChevronRight, ChevronDown, TrendingUp, TrendingDown, Minus,
//   BarChart3, FileText, Beaker, Clock
// } from 'lucide-react';
// import BiomarkerLevelChangeStats from './BiomarkerLevelChangeStats';

// const BiomarkerItem = ({
//   biomarker,
//   index,
//   onUpdate,
//   onRemove,
//   availableBiomarkers = [],
//   condition,
//   treatmentId,
//   onViewData,
// }) => {
//   const [isSearching, setIsSearching] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [biomarkerData, setBiomarkerData] = useState(null);
//   const [byCondition, setByCondition] = useState(null);
//   const [isLoadingData, setIsLoadingData] = useState(false);
//   const [error, setError] = useState(null);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [activeAnalysisTab, setActiveAnalysisTab] = useState('levelChange');

//   // Load data when biomarker name OR condition changes
//   useEffect(() => {
//     if (biomarker.name.trim() && condition && condition.trim()) {
//       loadBiomarkerData();
//     } else {
//       setBiomarkerData(null);
//       setByCondition(null);
//     }
//   }, [biomarker.name, condition]);

//   const loadBiomarkerData = async () => {
//     if (!biomarker.name.trim() || !condition || !condition.trim()) return;

//     setIsLoadingData(true);
//     setError(null);

//     try {
//       const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      
//       const requestBody = { 
//         biomarker_name: biomarker.name, 
//         condition: condition,
//         page: 1, 
//         size: 100 
//       };

//       const response = await fetch(`${API_URL}/api/biomarker/data`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         mode: 'cors',
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         throw new Error(`API request failed (${response.status}): ${response.statusText}`);
//       }

//       const result = await response.json();
      
//       if (!result?.success) {
//         throw new Error(result?.error || 'Failed to load data');
//       }

//       setBiomarkerData(result.data || []);
//       setByCondition(result.by_condition || null);
      
//       if (result.fallback) {
//         setError('Using mock data - Elasticsearch connection limited');
//       }
      
//     } catch (err) {
//       console.error('Error loading biomarker data:', err);
//       setError(err?.message || 'Failed to load data');
//       setBiomarkerData([]);
//       setByCondition(null);
//     } finally {
//       setIsLoadingData(false);
//     }
//   };

//   const handleInputChange = (value) => {
//     onUpdate(index, { ...biomarker, name: value });

//     if (value.length > 0) {
//       setIsSearching(true);
//       const filtered = availableBiomarkers
//         .filter((b) => b.toLowerCase().includes(value.toLowerCase()))
//         .slice(0, 8);
//       setSuggestions(filtered);
//     } else {
//       setIsSearching(false);
//       setSuggestions([]);
//     }
//   };

//   const selectSuggestion = (suggestion) => {
//     onUpdate(index, { ...biomarker, name: suggestion });
//     setIsSearching(false);
//     setSuggestions([]);
//   };

//   const clearInput = () => {
//     onUpdate(index, { ...biomarker, name: '' });
//     setIsSearching(false);
//     setSuggestions([]);
//     setBiomarkerData(null);
//     setByCondition(null);
//     setError(null);
//     setIsExpanded(false);
//   };

//   const dataQuality = () => {
//     if (isLoadingData) {
//       return (
//         <div className="flex items-center gap-1 text-blue-600">
//           <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
//           <span className="text-xs">Loading…</span>
//         </div>
//       );
//     }
//     if (error) {
//       const isMockData = error.includes('mock data') || error.includes('fallback');
//       return (
//         <div className="flex items-center gap-1 text-amber-600" title={error}>
//           <AlertCircle className="h-3 w-3" />
//           <span className="text-xs">{isMockData ? 'Mock data' : 'Connection error'}</span>
//         </div>
//       );
//     }
//     if (biomarkerData && biomarkerData.length > 0) {
//       const isMockData = biomarkerData.some(item => 
//         item.Document_id && item.Document_id.toString().startsWith('mock')
//       );
      
//       return (
//         <div className="flex items-center gap-2 text-green-600">
//           <CheckCircle className="h-3 w-3" />
//           <span className="text-xs">
//             {biomarkerData.length} studies
//             {isMockData && <span className="text-amber-600"> (mock)</span>}
//           </span>
//           <span className="text-xs text-green-700/80">
//             • {condition}
//           </span>
//         </div>
//       );
//     }
//     return null;
//   };

//   const shouldShowExpandButton = biomarker.name.trim() && condition && biomarkerData && biomarkerData.length > 0;

//   // Analysis tabs configuration
//   const analysisTabs = [
//     { id: 'levelChange', label: 'Level Change Analysis', icon: Activity },
//     { id: 'timeline', label: 'Timeline Analysis', icon: Clock, comingSoon: true },
//     { id: 'studyType', label: 'Study Type Breakdown', icon: Beaker, comingSoon: true },
//     { id: 'documentation', label: 'Documentation', icon: FileText, comingSoon: true },
//   ];

//   return (
//     <div className="space-y-3">
//       {/* Main Biomarker Input Row */}
//       <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
//         <div className="flex items-center gap-3">
//           {/* Expand/Collapse Button */}
//           {shouldShowExpandButton && (
//             <button
//               onClick={() => setIsExpanded(!isExpanded)}
//               className="p-1.5 hover:bg-slate-200 rounded-lg transition-all transform hover:scale-110"
//               title={isExpanded ? "Collapse analysis" : "Expand analysis"}
//             >
//               {isExpanded ? (
//                 <ChevronDown className="h-5 w-5 text-slate-600" />
//               ) : (
//                 <ChevronRight className="h-5 w-5 text-slate-600" />
//               )}
//             </button>
//           )}

//           {/* Search Input */}
//           <div className="relative flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 value={biomarker.name}
//                 onChange={(e) => handleInputChange(e.target.value)}
//                 placeholder="Search biomarkers…"
//                 className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                 disabled={!condition}
//               />
//               {biomarker.name && (
//                 <button
//                   onClick={clearInput}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               )}
//             </div>

//             {/* Suggestions Dropdown */}
//             {isSearching && suggestions.length > 0 && (
//               <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                 {suggestions.map((s, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => selectSuggestion(s)}
//                     className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 text-sm"
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Action Buttons and Status */}
//           <div className="flex items-center gap-2">
//             {dataQuality()}
//             {onViewData && biomarkerData && condition && (
//               <button
//                 onClick={() => onViewData(biomarker.name, condition)}
//                 className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
//                 title="View detailed data"
//               >
//                 <Eye className="h-4 w-4" />
//               </button>
//             )}
//             <button
//               onClick={() => onRemove(index)}
//               className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
//               title="Remove biomarker"
//             >
//               <Trash2 className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         {/* Condition Requirement Notice */}
//         {!condition && (
//           <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
//             <div className="flex items-center gap-2 text-amber-800">
//               <AlertCircle className="h-4 w-4" />
//               <span className="text-xs">Please select a condition in the treatment card to enable biomarker search</span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Expanded Analysis Section */}
//       {isExpanded && shouldShowExpandButton && (
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
//           {/* Analysis Tabs */}
//           <div className="border-b border-slate-200 bg-slate-50">
//             <div className="flex items-center gap-1 p-1">
//               {analysisTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => !tab.comingSoon && setActiveAnalysisTab(tab.id)}
//                     disabled={tab.comingSoon}
//                     className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
//                       activeAnalysisTab === tab.id
//                         ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
//                         : tab.comingSoon
//                         ? 'text-slate-400 cursor-not-allowed'
//                         : 'text-slate-600 hover:bg-white hover:text-slate-900'
//                     }`}
//                   >
//                     <Icon className="h-4 w-4" />
//                     {tab.label}
//                     {tab.comingSoon && (
//                       <span className="text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
//                         Coming Soon
//                       </span>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="p-4">
//             {activeAnalysisTab === 'levelChange' && (
//               <BiomarkerLevelChangeStats
//                 biomarker={biomarker.name}
//                 condition={condition}
//                 data={biomarkerData || []}
//                 onViewDetails={onViewData}
//                 byCondition={byCondition || undefined}
//               />
//             )}

//             {activeAnalysisTab === 'timeline' && (
//               <div className="text-center py-12 text-slate-500">
//                 <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                 <p className="text-lg font-medium">Timeline Analysis Coming Soon</p>
//                 <p className="text-sm mt-2">Track biomarker changes over time periods</p>
//               </div>
//             )}

//             {activeAnalysisTab === 'studyType' && (
//               <div className="text-center py-12 text-slate-500">
//                 <Beaker className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                 <p className="text-lg font-medium">Study Type Breakdown Coming Soon</p>
//                 <p className="text-sm mt-2">Analyze results by clinical trials, in-vitro, and more</p>
//               </div>
//             )}

//             {activeAnalysisTab === 'documentation' && (
//               <div className="text-center py-12 text-slate-500">
//                 <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                 <p className="text-lg font-medium">Documentation Coming Soon</p>
//                 <p className="text-sm mt-2">Access detailed notes and references</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BiomarkerItem;



// // BiomarkerItem.jsx
// import React, { useState, useEffect } from 'react';
// import { 
//   Search, X, Trash2, Eye, Activity, AlertCircle, CheckCircle,
//   ChevronRight, ChevronDown, TrendingUp, TrendingDown, Minus,
//   BarChart3, FileText, Beaker, Clock, Brain
// } from 'lucide-react';
// import BiomarkerLevelChangeStats from './BiomarkerLevelChangeStats';
// import BiomarkerEvidenceAnalysis from './BiomarkerEvidenceAnalysis';

// const BiomarkerItem = ({
//   biomarker,
//   index,
//   onUpdate,
//   onRemove,
//   availableBiomarkers = [],
//   condition,
//   treatmentId,
//   onViewData,
// }) => {
//   const [isSearching, setIsSearching] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [biomarkerData, setBiomarkerData] = useState(null);
//   const [byCondition, setByCondition] = useState(null);
//   const [isLoadingData, setIsLoadingData] = useState(false);
//   const [error, setError] = useState(null);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [activeAnalysisTab, setActiveAnalysisTab] = useState('levelChange');

//   // Load data when biomarker name OR condition changes
//   useEffect(() => {
//     if (biomarker.name.trim() && condition && condition.trim()) {
//       loadBiomarkerData();
//     } else {
//       setBiomarkerData(null);
//       setByCondition(null);
//     }
//   }, [biomarker.name, condition]);

//   const loadBiomarkerData = async () => {
//     if (!biomarker.name.trim() || !condition || !condition.trim()) return;

//     setIsLoadingData(true);
//     setError(null);

//     try {
//       const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      
//       const requestBody = { 
//         biomarker_name: biomarker.name, 
//         condition: condition,
//         page: 1, 
//         size: 100 
//       };

//       const response = await fetch(`${API_URL}/api/biomarker/data`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         mode: 'cors',
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         throw new Error(`API request failed (${response.status}): ${response.statusText}`);
//       }

//       const result = await response.json();
      
//       if (!result?.success) {
//         throw new Error(result?.error || 'Failed to load data');
//       }

//       setBiomarkerData(result.data || []);
//       setByCondition(result.by_condition || null);
      
//       if (result.fallback) {
//         setError('Using mock data - Elasticsearch connection limited');
//       }
      
//     } catch (err) {
//       console.error('Error loading biomarker data:', err);
//       setError(err?.message || 'Failed to load data');
//       setBiomarkerData([]);
//       setByCondition(null);
//     } finally {
//       setIsLoadingData(false);
//     }
//   };

//   const handleInputChange = (value) => {
//     onUpdate(index, { ...biomarker, name: value });

//     if (value.length > 0) {
//       setIsSearching(true);
//       const filtered = availableBiomarkers
//         .filter((b) => b.toLowerCase().includes(value.toLowerCase()))
//         .slice(0, 8);
//       setSuggestions(filtered);
//     } else {
//       setIsSearching(false);
//       setSuggestions([]);
//     }
//   };

//   const selectSuggestion = (suggestion) => {
//     onUpdate(index, { ...biomarker, name: suggestion });
//     setIsSearching(false);
//     setSuggestions([]);
//   };

//   const clearInput = () => {
//     onUpdate(index, { ...biomarker, name: '' });
//     setIsSearching(false);
//     setSuggestions([]);
//     setBiomarkerData(null);
//     setByCondition(null);
//     setError(null);
//     setIsExpanded(false);
//   };

//   const dataQuality = () => {
//     if (isLoadingData) {
//       return (
//         <div className="flex items-center gap-1 text-blue-600">
//           <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
//           <span className="text-xs">Loading…</span>
//         </div>
//       );
//     }
//     if (error) {
//       const isMockData = error.includes('mock data') || error.includes('fallback');
//       return (
//         <div className="flex items-center gap-1 text-amber-600" title={error}>
//           <AlertCircle className="h-3 w-3" />
//           <span className="text-xs">{isMockData ? 'Mock data' : 'Connection error'}</span>
//         </div>
//       );
//     }
//     if (biomarkerData && biomarkerData.length > 0) {
//       const isMockData = biomarkerData.some(item => 
//         item.Document_id && item.Document_id.toString().startsWith('mock')
//       );
      
//       return (
//         <div className="flex items-center gap-2 text-green-600">
//           <CheckCircle className="h-3 w-3" />
//           <span className="text-xs">
//             {biomarkerData.length} studies
//             {isMockData && <span className="text-amber-600"> (mock)</span>}
//           </span>
//           <span className="text-xs text-green-700/80">
//             • {condition}
//           </span>
//         </div>
//       );
//     }
//     return null;
//   };

//   const shouldShowExpandButton = biomarker.name.trim() && condition && biomarkerData && biomarkerData.length > 0;

//   // Analysis tabs configuration - Evidence Analysis is now available
//   const analysisTabs = [
//     { id: 'levelChange', label: 'Level Change Analysis', icon: Activity },
//     { id: 'evidence', label: 'Evidence Analysis', icon: Brain },
//     // { id: 'timeline', label: 'Timeline Analysis', icon: Clock, comingSoon: true },
//     // { id: 'studyType', label: 'Study Type Breakdown', icon: Beaker, comingSoon: true },
//     // { id: 'documentation', label: 'Documentation', icon: FileText, comingSoon: true },
//   ];

//   return (
//     <div className="space-y-3">
//       {/* Main Biomarker Input Row */}
//       <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
//         <div className="flex items-center gap-3">
//           {/* Expand/Collapse Button */}
//           {shouldShowExpandButton && (
//             <button
//               onClick={() => setIsExpanded(!isExpanded)}
//               className="p-1.5 hover:bg-slate-200 rounded-lg transition-all transform hover:scale-110"
//               title={isExpanded ? "Collapse analysis" : "Expand analysis"}
//             >
//               {isExpanded ? (
//                 <ChevronDown className="h-5 w-5 text-slate-600" />
//               ) : (
//                 <ChevronRight className="h-5 w-5 text-slate-600" />
//               )}
//             </button>
//           )}

//           {/* Search Input */}
//           <div className="relative flex-1">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 value={biomarker.name}
//                 onChange={(e) => handleInputChange(e.target.value)}
//                 placeholder="Search biomarkers…"
//                 className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                 disabled={!condition}
//               />
//               {biomarker.name && (
//                 <button
//                   onClick={clearInput}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               )}
//             </div>

//             {/* Suggestions Dropdown */}
//             {isSearching && suggestions.length > 0 && (
//               <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
//                 {suggestions.map((s, idx) => (
//                   <button
//                     key={idx}
//                     onClick={() => selectSuggestion(s)}
//                     className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-b-0 text-sm"
//                   >
//                     {s}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Action Buttons and Status */}
//           <div className="flex items-center gap-2">
//             {dataQuality()}
//             {onViewData && biomarkerData && condition && (
//               <button
//                 onClick={() => onViewData(biomarker.name, condition)}
//                 className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
//                 title="View detailed data"
//               >
//                 <Eye className="h-4 w-4" />
//               </button>
//             )}
//             <button
//               onClick={() => onRemove(index)}
//               className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
//               title="Remove biomarker"
//             >
//               <Trash2 className="h-4 w-4" />
//             </button>
//           </div>
//         </div>

//         {/* Condition Requirement Notice */}
//         {!condition && (
//           <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
//             <div className="flex items-center gap-2 text-amber-800">
//               <AlertCircle className="h-4 w-4" />
//               <span className="text-xs">Please select a condition in the treatment card to enable biomarker search</span>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Expanded Analysis Section */}
//       {isExpanded && shouldShowExpandButton && (
//         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
//           {/* Analysis Tabs */}
//           <div className="border-b border-slate-200 bg-slate-50">
//             <div className="flex items-center gap-1 p-1">
//               {analysisTabs.map((tab) => {
//                 const Icon = tab.icon;
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => !tab.comingSoon && setActiveAnalysisTab(tab.id)}
//                     disabled={tab.comingSoon}
//                     className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
//                       activeAnalysisTab === tab.id
//                         ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
//                         : tab.comingSoon
//                         ? 'text-slate-400 cursor-not-allowed'
//                         : 'text-slate-600 hover:bg-white hover:text-slate-900'
//                     }`}
//                   >
//                     <Icon className="h-4 w-4" />
//                     {tab.label}
//                     {tab.comingSoon && (
//                       <span className="text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
//                         Coming Soon
//                       </span>
//                     )}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="p-4">
//             {activeAnalysisTab === 'levelChange' && (
//               <BiomarkerLevelChangeStats
//                 biomarker={biomarker.name}
//                 condition={condition}
//                 data={biomarkerData || []}
//                 onViewDetails={onViewData}
//                 byCondition={byCondition || undefined}
//               />
//             )}

//             {activeAnalysisTab === 'evidence' && (
//               <BiomarkerEvidenceAnalysis
//                 biomarker={biomarker.name}
//                 condition={condition}
//                 data={biomarkerData || []}
//                 onViewDetails={onViewData}
//               />
//             )}

//             {activeAnalysisTab === 'timeline' && (
//               <div className="text-center py-12 text-slate-500">
//                 <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                 <p className="text-lg font-medium">Timeline Analysis Coming Soon</p>
//                 <p className="text-sm mt-2">Track biomarker changes over time periods</p>
//               </div>
//             )}

//             {activeAnalysisTab === 'studyType' && (
//               <div className="text-center py-12 text-slate-500">
//                 <Beaker className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                 <p className="text-lg font-medium">Study Type Breakdown Coming Soon</p>
//                 <p className="text-sm mt-2">Analyze results by clinical trials, in-vitro, and more</p>
//               </div>
//             )}

//             {activeAnalysisTab === 'documentation' && (
//               <div className="text-center py-12 text-slate-500">
//                 <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
//                 <p className="text-lg font-medium">Documentation Coming Soon</p>
//                 <p className="text-sm mt-2">Access detailed notes and references</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BiomarkerItem;



// BiomarkerItem.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, X, Trash2, Eye, Activity, AlertCircle, CheckCircle,
  ChevronRight, ChevronDown, TrendingUp, TrendingDown, Minus,
  BarChart3, FileText, Beaker, Clock, Brain, Lightbulb
} from 'lucide-react';
import BiomarkerLevelChangeStats from './BiomarkerLevelChangeStats';
import BiomarkerEvidenceAnalysis from './BiomarkerEvidenceAnalysis';
import BiomarkerKeyInsights from './BiomarkerKeyInsights';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('levelChange');

  // Load data when biomarker name OR condition changes
  useEffect(() => {
    if (biomarker.name.trim() && condition && condition.trim()) {
      loadBiomarkerData();
    } else {
      setBiomarkerData(null);
      setByCondition(null);
    }
  }, [biomarker.name, condition]);

  const loadBiomarkerData = async () => {
    if (!biomarker.name.trim() || !condition || !condition.trim()) return;

    setIsLoadingData(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      
      const requestBody = { 
        biomarker_name: biomarker.name, 
        condition: condition,
        page: 1, 
        size: 100 
      };

      const response = await fetch(`${API_URL}/api/biomarker/data`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed (${response.status}): ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to load data');
      }

      setBiomarkerData(result.data || []);
      setByCondition(result.by_condition || null);
      
      if (result.fallback) {
        setError('Using mock data - Elasticsearch connection limited');
      }
      
    } catch (err) {
      console.error('Error loading biomarker data:', err);
      setError(err?.message || 'Failed to load data');
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
    setIsExpanded(false);
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

  const shouldShowExpandButton = biomarker.name.trim() && condition && biomarkerData && biomarkerData.length > 0;

  // Analysis tabs configuration - Evidence Analysis is now available
  const analysisTabs = [
    { id: 'levelChange', label: 'Level Change Analysis', icon: Activity },
    { id: 'evidence', label: 'Evidence Analysis', icon: Brain },
    { id: 'keyInsights', label: 'Key Insights', icon: Lightbulb },
    // { id: 'timeline', label: 'Timeline Analysis', icon: Clock, comingSoon: true },
    // { id: 'studyType', label: 'Study Type Breakdown', icon: Beaker, comingSoon: true },
    // { id: 'documentation', label: 'Documentation', icon: FileText, comingSoon: true },
  ];

  return (
    <div className="space-y-3">
      {/* Main Biomarker Input Row */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Button */}
          {shouldShowExpandButton && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-all transform hover:scale-110"
              title={isExpanded ? "Collapse analysis" : "Expand analysis"}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-slate-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-slate-600" />
              )}
            </button>
          )}

          {/* Search Input */}
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

            {/* Suggestions Dropdown */}
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

          {/* Action Buttons and Status */}
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
      </div>

      {/* Expanded Analysis Section */}
      {isExpanded && shouldShowExpandButton && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
          {/* Analysis Tabs */}
          <div className="border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-1 p-1">
              {analysisTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => !tab.comingSoon && setActiveAnalysisTab(tab.id)}
                    disabled={tab.comingSoon}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeAnalysisTab === tab.id
                        ? 'bg-white text-blue-600 shadow-sm border border-slate-200'
                        : tab.comingSoon
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-slate-600 hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    {tab.comingSoon && (
                      <span className="text-xs bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">
                        Coming Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeAnalysisTab === 'levelChange' && (
              <BiomarkerLevelChangeStats
                biomarker={biomarker.name}
                condition={condition}
                data={biomarkerData || []}
                onViewDetails={onViewData}
                byCondition={byCondition || undefined}
              />
            )}

            {activeAnalysisTab === 'evidence' && (
              <BiomarkerEvidenceAnalysis
                biomarker={biomarker.name}
                condition={condition}
                data={biomarkerData || []}
                onViewDetails={onViewData}
              />
            )}

            {activeAnalysisTab === 'keyInsights' && (
              <BiomarkerKeyInsights
                biomarker={biomarker.name}
                condition={condition}
              />
            )}

            {activeAnalysisTab === 'timeline' && (
              <div className="text-center py-12 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">Timeline Analysis Coming Soon</p>
                <p className="text-sm mt-2">Track biomarker changes over time periods</p>
              </div>
            )}

            {activeAnalysisTab === 'studyType' && (
              <div className="text-center py-12 text-slate-500">
                <Beaker className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">Study Type Breakdown Coming Soon</p>
                <p className="text-sm mt-2">Analyze results by clinical trials, in-vitro, and more</p>
              </div>
            )}

            {activeAnalysisTab === 'documentation' && (
              <div className="text-center py-12 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">Documentation Coming Soon</p>
                <p className="text-sm mt-2">Access detailed notes and references</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BiomarkerItem;
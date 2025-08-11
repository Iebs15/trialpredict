// import React, { useState } from 'react';
// import { Search, Filter } from 'lucide-react';
// import LoadingSpinner from './LoadingSpinner';
// import ScoreBadge from './ScoreBadge';
// import ApiService from '../services/api';

// const SearchInterface = ({ 
//   availableBiomarkers = [], 
//   availableConditions = [] 
// }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCondition, setSelectedCondition] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [hasSearched, setHasSearched] = useState(false);

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) {
//       setError('Please enter a search query');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setHasSearched(true);
    
//     try {
//       const response = await ApiService.searchBiomarkers(
//         searchQuery, 
//         selectedCondition || null, 
//         50
//       );
      
//       if (response.success) {
//         setSearchResults(response.results);
//         setError('');
//       } else {
//         setError(response.error || 'Search failed');
//         setSearchResults([]);
//       }
//     } catch (error) {
//       console.error('Error searching biomarkers:', error);
//       setError('Failed to search biomarkers');
//       setSearchResults([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSearch();
//     }
//   };

//   const clearSearch = () => {
//     setSearchQuery('');
//     setSelectedCondition('');
//     setSearchResults([]);
//     setError('');
//     setHasSearched(false);
//   };

//   const highlightText = (text, highlight) => {
//     if (!highlight || !text) return text;
    
//     const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
//     return parts.map((part, index) => 
//       part.toLowerCase() === highlight.toLowerCase() ? 
//         <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
//         part
//     );
//   };

//   return (
//     <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
//       <div className="mb-6">
//         <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
//           <Search className="h-5 w-5" />
//           Search Biomarkers Database
//         </h3>
//         <p className="text-sm text-slate-600">
//           Search across all biomarker studies and treatments in our database
//         </p>
//       </div>

//       {/* Search Controls */}
//       <div className="space-y-4 mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-slate-700 mb-2">
//               Search Query
//             </label>
//             <input
//               type="text"
//               placeholder="Search biomarkers, treatments, outcomes..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               onKeyPress={handleKeyPress}
//               className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 placeholder-slate-400"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-700 mb-2">
//               Condition Filter
//             </label>
//             <div className="relative">
//               <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <select
//                 value={selectedCondition}
//                 onChange={(e) => setSelectedCondition(e.target.value)}
//                 className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700"
//               >
//                 <option value="">All Conditions</option>
//                 {availableConditions.map(condition => (
//                   <option key={condition} value={condition}>{condition}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-3">
//           <button
//             onClick={handleSearch}
//             disabled={!searchQuery.trim() || loading}
//             className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <LoadingSpinner size="small" color="white" />
//                 Searching...
//               </>
//             ) : (
//               <>
//                 <Search className="h-4 w-4" />
//                 Search Database
//               </>
//             )}
//           </button>
          
//           {(hasSearched || searchResults.length > 0) && (
//             <button
//               onClick={clearSearch}
//               className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
//             >
//               Clear
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <div className="flex items-center gap-2 text-red-800">
//             <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <span className="font-medium">Search Error</span>
//           </div>
//           <p className="text-red-700 mt-1 text-sm">{error}</p>
//         </div>
//       )}

//       {/* Search Results */}
//       {hasSearched && !loading && (
//         <div>
//           {searchResults.length > 0 ? (
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <h4 className="font-semibold text-slate-800">
//                   Search Results ({searchResults.length})
//                 </h4>
//                 {selectedCondition && (
//                   <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                     Filtered by: {selectedCondition}
//                   </span>
//                 )}
//               </div>
              
//               <div className="space-y-4 max-h-96 overflow-y-auto">
//                 {searchResults.map((result, index) => (
//                   <SearchResultCard 
//                     key={index} 
//                     result={result} 
//                     searchQuery={searchQuery}
//                     highlightText={highlightText}
//                   />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="text-slate-400 mb-4">
//                 <Search className="h-12 w-12 mx-auto" />
//               </div>
//               <h3 className="text-lg font-medium text-slate-900 mb-2">No Results Found</h3>
//               <p className="text-slate-600">
//                 No biomarkers found matching "{searchQuery}"
//                 {selectedCondition && ` in ${selectedCondition} condition`}
//               </p>
//               <button
//                 onClick={clearSearch}
//                 className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Clear search and try again
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Search Result Card Component
// const SearchResultCard = ({ result, searchQuery, highlightText }) => {
//   const getBiomarkerChangeColor = (change) => {
//     if (change === 'increase') return 'text-green-600 bg-green-50';
//     if (change === 'decrease') return 'text-red-600 bg-red-50';
//     return 'text-slate-600 bg-slate-50';
//   };

//   return (
//     <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-slate-300 transition-colors">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex-1">
//           <h5 className="font-medium text-slate-800 text-lg">
//             {highlightText(result['Biomarker Name'], searchQuery)}
//           </h5>
//           <div className="flex items-center gap-4 mt-1">
//             <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//               {result['Condition']}
//             </span>
//             {result['Biomarker_Level_Change'] && (
//               <span className={`text-xs px-2 py-1 rounded-full ${getBiomarkerChangeColor(result['Biomarker_Level_Change'])}`}>
//                 {result['Biomarker_Level_Change']}
//               </span>
//             )}
//             {result._score && (
//               <span className="text-xs text-slate-500">
//                 Relevance: {result._score.toFixed(2)}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
//         <div>
//           <label className="text-xs font-semibold text-slate-600 uppercase">Treatment</label>
//           <p className="text-sm text-slate-800">
//             {highlightText(result['Treatment_Name'] || 'N/A', searchQuery)}
//           </p>
//         </div>
//         <div>
//           <label className="text-xs font-semibold text-slate-600 uppercase">Study Type</label>
//           <p className="text-sm text-slate-800">{result['Type of Study'] || 'N/A'}</p>
//         </div>
//         <div>
//           <label className="text-xs font-semibold text-slate-600 uppercase">Subject</label>
//           <p className="text-sm text-slate-800">{result['Subject ID'] || 'N/A'}</p>
//         </div>
//         <div>
//           <label className="text-xs font-semibold text-slate-600 uppercase">PDF Source</label>
//           <p className="text-sm text-slate-800 truncate" title={result['PDF_name']}>
//             {result['PDF_name'] || 'N/A'}
//           </p>
//         </div>
//       </div>
      
//       {result['Key Outcome'] && (
//         <div className="mt-3 pt-3 border-t border-slate-200">
//           <label className="text-xs font-semibold text-slate-600 uppercase">Key Outcome</label>
//           <p className="text-sm text-slate-700 mt-1 leading-relaxed">
//             {highlightText(result['Key Outcome'], searchQuery)}
//           </p>
//         </div>
//       )}
      
//       {result._highlight && (
//         <div className="mt-3 pt-3 border-t border-slate-200">
//           <label className="text-xs font-semibold text-slate-600 uppercase">Highlighted Matches</label>
//           <div className="text-sm text-slate-700 mt-1 space-y-1">
//             {Object.entries(result._highlight).map(([field, highlights]) => (
//               <div key={field}>
//                 <span className="font-medium">{field}:</span> 
//                 <span dangerouslySetInnerHTML={{ __html: highlights[0] }} />
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchInterface;



// import React, { useState } from 'react';
// import { Search, Filter, Sparkles, AlertCircle } from 'lucide-react';
// import AutocompleteInput from './AutocompleteInput';
// import LoadingSpinner from './LoadingSpinner';
// import ScoreBadge from './ScoreBadge';
// import ApiService from '../services/api';

// const SearchInterface = ({ 
//   availableBiomarkers = [], 
//   availableConditions = [] 
// }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedCondition, setSelectedCondition] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [hasSearched, setHasSearched] = useState(false);
//   const [searchType, setSearchType] = useState('general'); // 'general', 'biomarker', 'treatment'

//   // Create combined suggestions for autocomplete
//   const getAllSuggestions = () => {
//     const suggestions = [];
    
//     // Add biomarkers with prefix
//     availableBiomarkers.forEach(biomarker => {
//       suggestions.push(biomarker);
//     });
    
//     // Add common search terms
//     const commonTerms = [
//       'anti-aging', 'wrinkle reduction', 'skin hydration', 'collagen synthesis',
//       'inflammation markers', 'oxidative stress', 'pigmentation', 'elasticity',
//       'barrier function', 'UV protection', 'clinical trial', 'in vitro study'
//     ];
    
//     commonTerms.forEach(term => {
//       suggestions.push(term);
//     });
    
//     return [...new Set(suggestions)].sort();
//   };

//   const handleSearch = async () => {
//     if (!searchQuery.trim()) {
//       setError('Please enter a search query');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setHasSearched(true);
    
//     try {
//       const response = await ApiService.searchBiomarkers(
//         searchQuery, 
//         selectedCondition || null, 
//         50
//       );
      
//       if (response.success) {
//         setSearchResults(response.results);
//         setError('');
//       } else {
//         setError(response.error || 'Search failed');
//         setSearchResults([]);
//       }
//     } catch (error) {
//       console.error('Error searching biomarkers:', error);
//       setError('Failed to search biomarkers');
//       setSearchResults([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSearch();
//     }
//   };

//   const clearSearch = () => {
//     setSearchQuery('');
//     setSelectedCondition('');
//     setSearchResults([]);
//     setError('');
//     setHasSearched(false);
//   };

//   const handleSuggestionSelect = (suggestion) => {
//     setSearchQuery(suggestion);
//     // Auto-search when a biomarker is selected
//     if (availableBiomarkers.includes(suggestion)) {
//       setTimeout(() => handleSearch(), 100);
//     }
//   };

//   const highlightText = (text, highlight) => {
//     if (!highlight || !text) return text;
    
//     const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
//     return parts.map((part, index) => 
//       part.toLowerCase() === highlight.toLowerCase() ? 
//         <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
//         part
//     );
//   };

//   const getSearchTypeColor = (type) => {
//     switch(type) {
//       case 'biomarker': return 'from-green-500 to-green-600';
//       case 'treatment': return 'from-purple-500 to-purple-600';
//       default: return 'from-blue-500 to-blue-600';
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
//       <div className="mb-6">
//         <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
//           <Search className="h-5 w-5" />
//           Smart Biomarker Search
//         </h3>
//         <p className="text-sm text-slate-600">
//           Search across all biomarker studies with intelligent autocomplete suggestions
//         </p>
//       </div>

//       {/* Search Type Selector */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-slate-700 mb-2">
//           Search Mode
//         </label>
//         <div className="flex gap-2">
//           {[
//             { value: 'general', label: 'General Search', icon: Search },
//             { value: 'biomarker', label: 'Biomarker Focused', icon: Sparkles },
//             { value: 'treatment', label: 'Treatment Focused', icon: Filter }
//           ].map(({ value, label, icon: Icon }) => (
//             <button
//               key={value}
//               onClick={() => setSearchType(value)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
//                 searchType === value
//                   ? `bg-gradient-to-r ${getSearchTypeColor(value)} text-white shadow-md`
//                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//               }`}
//             >
//               <Icon className="h-4 w-4" />
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Search Controls */}
//       <div className="space-y-4 mb-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="md:col-span-2">
//             <AutocompleteInput
//               id="biomarker-search"
//               label="Search Query"
//               placeholder={
//                 searchType === 'biomarker' 
//                   ? "Start typing a biomarker name..."
//                   : searchType === 'treatment'
//                   ? "Search treatments, outcomes..."
//                   : "Search biomarkers, treatments, outcomes..."
//               }
//               value={searchQuery}
//               onChange={setSearchQuery}
//               suggestions={getAllSuggestions()}
//               onKeyDown={handleKeyPress}
//               icon={Search}
//               onSelect={handleSuggestionSelect}
//               size="default"
//             />
//             {searchType === 'biomarker' && (
//               <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
//                 💡 Tip: Type any biomarker name for instant suggestions
//               </div>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">
//               Condition Filter
//             </label>
//             <div className="relative">
//               <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
//               <select
//                 value={selectedCondition}
//                 onChange={(e) => setSelectedCondition(e.target.value)}
//                 className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700 font-medium shadow-sm hover:shadow-md transition-all"
//               >
//                 <option value="">All Conditions</option>
//                 {availableConditions.map(condition => (
//                   <option key={condition} value={condition}>{condition}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         <div className="flex gap-3">
//           <button
//             onClick={handleSearch}
//             disabled={!searchQuery.trim() || loading}
//             className={`px-6 py-3 bg-gradient-to-r ${getSearchTypeColor(searchType)} text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105`}
//           >
//             {loading ? (
//               <>
//                 <LoadingSpinner size="small" color="white" />
//                 Searching...
//               </>
//             ) : (
//               <>
//                 <Search className="h-4 w-4" />
//                 Search Database
//               </>
//             )}
//           </button>
          
//           {(hasSearched || searchResults.length > 0) && (
//             <button
//               onClick={clearSearch}
//               className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
//             >
//               Clear
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Quick Search Suggestions */}
//       {!hasSearched && searchQuery.length === 0 && (
//         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
//           <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
//             <Sparkles className="h-4 w-4 text-blue-600" />
//             Popular Searches
//           </h4>
//           <div className="flex flex-wrap gap-2">
//             {['IL-6', 'Collagen', 'Hyaluronic Acid', 'TNF-α', 'VEGF', 'anti-aging', 'wrinkle reduction'].map(term => (
//               <button
//                 key={term}
//                 onClick={() => {
//                   setSearchQuery(term);
//                   handleSuggestionSelect(term);
//                 }}
//                 className="px-3 py-1 text-xs bg-white text-slate-600 rounded-full border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
//               >
//                 {term}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Error Message */}
//       {error && (
//         <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//           <div className="flex items-center gap-2 text-red-800">
//             <AlertCircle className="h-5 w-5" />
//             <span className="font-medium">Search Error</span>
//           </div>
//           <p className="text-red-700 mt-1 text-sm">{error}</p>
//         </div>
//       )}

//       {/* Search Results */}
//       {hasSearched && !loading && (
//         <div>
//           {searchResults.length > 0 ? (
//             <div>
//               <div className="flex items-center justify-between mb-4">
//                 <h4 className="font-semibold text-slate-800">
//                   Search Results ({searchResults.length})
//                 </h4>
//                 <div className="flex items-center gap-3">
//                   {selectedCondition && (
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                       Filtered by: {selectedCondition}
//                     </span>
//                   )}
//                   <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
//                     Mode: {searchType}
//                   </span>
//                 </div>
//               </div>
              
//               <div className="space-y-4 max-h-96 overflow-y-auto">
//                 {searchResults.map((result, index) => (
//                   <SearchResultCard 
//                     key={index} 
//                     result={result} 
//                     searchQuery={searchQuery}
//                     highlightText={highlightText}
//                   />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="text-slate-400 mb-4">
//                 <Search className="h-12 w-12 mx-auto" />
//               </div>
//               <h3 className="text-lg font-medium text-slate-900 mb-2">No Results Found</h3>
//               <p className="text-slate-600">
//                 No biomarkers found matching "{searchQuery}"
//                 {selectedCondition && ` in ${selectedCondition} condition`}
//               </p>
//               <button
//                 onClick={clearSearch}
//                 className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Clear search and try again
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// // Enhanced Search Result Card Component
// const SearchResultCard = ({ result, searchQuery, highlightText }) => {
//   const getBiomarkerChangeColor = (change) => {
//     if (change === 'increase') return 'text-green-600 bg-green-50 border-green-200';
//     if (change === 'decrease') return 'text-red-600 bg-red-50 border-red-200';
//     return 'text-slate-600 bg-slate-50 border-slate-200';
//   };

//   const getScoreBadge = (score) => {
//     if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
//     if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//     return 'bg-red-100 text-red-800 border-red-200';
//   };

//   return (
//     <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md">
//       <div className="flex items-start justify-between mb-3">
//         <div className="flex-1">
//           <h5 className="font-semibold text-slate-800 text-lg mb-2">
//             {highlightText(result['Biomarker Name'], searchQuery)}
//           </h5>
//           <div className="flex items-center gap-3 flex-wrap">
//             <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200 font-medium">
//               {result['Condition']}
//             </span>
//             {result['Biomarker_Level_Change'] && (
//               <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getBiomarkerChangeColor(result['Biomarker_Level_Change'])}`}>
//                 {result['Biomarker_Level_Change']} ↗️
//               </span>
//             )}
//             {result._score && (
//               <span className={`text-xs px-2 py-1 rounded-full border ${getScoreBadge(result._score)}`}>
//                 Relevance: {result._score.toFixed(2)}
//               </span>
//             )}
//           </div>
//         </div>
//       </div>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
//         <div>
//           <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Treatment</label>
//           <p className="text-sm text-slate-800 font-medium">
//             {highlightText(result['Treatment_Name'] || 'N/A', searchQuery)}
//           </p>
//         </div>
//         <div>
//           <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Study Type</label>
//           <p className="text-sm text-slate-800">{result['Type of Study'] || 'N/A'}</p>
//         </div>
//         <div>
//           <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Subject</label>
//           <p className="text-sm text-slate-800">{result['Subject ID'] || 'N/A'}</p>
//         </div>
//         <div>
//           <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">PDF Source</label>
//           <p className="text-sm text-slate-800 truncate" title={result['PDF_name']}>
//             {result['PDF_name'] || 'N/A'}
//           </p>
//         </div>
//       </div>
      
//       {result['Key Outcome'] && (
//         <div className="mt-3 pt-3 border-t border-slate-200">
//           <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Key Outcome</label>
//           <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
//             {highlightText(result['Key Outcome'], searchQuery)}
//           </p>
//         </div>
//       )}
      
//       {result._highlight && (
//         <div className="mt-3 pt-3 border-t border-slate-200">
//           <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Highlighted Matches</label>
//           <div className="text-sm text-slate-700 mt-1 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
//             {Object.entries(result._highlight).map(([field, highlights]) => (
//               <div key={field}>
//                 <span className="font-medium text-blue-700">{field}:</span> 
//                 <span dangerouslySetInnerHTML={{ __html: highlights[0] }} className="ml-2" />
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchInterface;




import React, { useState } from 'react';
import { Search, Filter, Sparkles, AlertCircle } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import LoadingSpinner from './LoadingSpinner';
import ScoreBadge from './ScoreBadge';
import ApiService from '../services/api';

const SearchInterface = ({ 
  availableBiomarkers = [], 
  availableConditions = [] 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [searchType, setSearchType] = useState('general'); // 'general', 'biomarker', 'treatment'

  // Create combined suggestions for autocomplete with normalization
  const getAllSuggestions = () => {
    const suggestions = [];
    
    // Add biomarkers with normalization
    const normalizedBiomarkers = [...new Set(
      availableBiomarkers
        .filter(biomarker => biomarker && biomarker.trim())
        .map(biomarker => biomarker.trim())
    )];
    
    suggestions.push(...normalizedBiomarkers);
    
    // Add common search terms
    const commonTerms = [
      'anti-aging', 'wrinkle reduction', 'skin hydration', 'collagen synthesis',
      'inflammation markers', 'oxidative stress', 'pigmentation', 'elasticity',
      'barrier function', 'UV protection', 'clinical trial', 'in vitro study'
    ];
    
    commonTerms.forEach(term => {
      suggestions.push(term);
    });
    
    return [...new Set(suggestions)].sort();
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      const response = await ApiService.searchBiomarkers(
        searchQuery, 
        selectedCondition || null, 
        50
      );
      
      if (response.success) {
        setSearchResults(response.results);
        setError('');
      } else {
        setError(response.error || 'Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching biomarkers:', error);
      setError('Failed to search biomarkers');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedCondition('');
    setSearchResults([]);
    setError('');
    setHasSearched(false);
  };

  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    // Don't auto-search to avoid the loop issue
    // User can manually click search when ready
  };

  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? 
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : 
        part
    );
  };

  const getSearchTypeColor = (type) => {
    switch(type) {
      case 'biomarker': return 'from-green-500 to-green-600';
      case 'treatment': return 'from-purple-500 to-purple-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Search className="h-5 w-5" />
          Smart Biomarker Search
        </h3>
        <p className="text-sm text-slate-600">
          Search across all biomarker studies with intelligent autocomplete suggestions
        </p>
      </div>

      {/* Search Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Search Mode
        </label>
        <div className="flex gap-2">
          {[
            { value: 'general', label: 'General Search', icon: Search },
            { value: 'biomarker', label: 'Biomarker Focused', icon: Sparkles },
            { value: 'treatment', label: 'Treatment Focused', icon: Filter }
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSearchType(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === value
                  ? `bg-gradient-to-r ${getSearchTypeColor(value)} text-white shadow-md`
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Controls */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <AutocompleteInput
              id="biomarker-search"
              label="Search Query"
              placeholder={
                searchType === 'biomarker' 
                  ? "Start typing a biomarker name..."
                  : searchType === 'treatment'
                  ? "Search treatments, outcomes..."
                  : "Search biomarkers, treatments, outcomes..."
              }
              value={searchQuery}
              onChange={setSearchQuery}
              suggestions={getAllSuggestions()}
              onKeyDown={handleKeyPress}
              icon={Search}
              onSelect={handleSuggestionSelect}
              size="default"
            />
            {searchType === 'biomarker' && (
              <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                💡 Tip: Type any biomarker name for instant suggestions
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">
              Condition Filter
            </label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700 font-medium shadow-sm hover:shadow-md transition-all"
              >
                <option value="">All Conditions</option>
                {availableConditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || loading}
            className={`px-6 py-3 bg-gradient-to-r ${getSearchTypeColor(searchType)} text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105`}
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" color="white" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search Database
              </>
            )}
          </button>
          
          {(hasSearched || searchResults.length > 0) && (
            <button
              onClick={clearSearch}
              className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Quick Search Suggestions */}
      {!hasSearched && searchQuery.length === 0 && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            Popular Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {['IL-6', 'Collagen', 'Hyaluronic Acid', 'TNF-α', 'VEGF', 'anti-aging', 'wrinkle reduction'].map(term => (
              <button
                key={term}
                onClick={() => {
                  setSearchQuery(term);
                  // Don't auto-search, let user decide when to search
                }}
                className="px-3 py-1 text-xs bg-white text-slate-600 rounded-full border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            💡 Click on a suggestion to add it to your search, then press "Search Database"
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Search Error</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && !loading && (
        <div>
          {searchResults.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-800">
                  Search Results ({searchResults.length})
                </h4>
                <div className="flex items-center gap-3">
                  {selectedCondition && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Filtered by: {selectedCondition}
                    </span>
                  )}
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    Mode: {searchType}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <SearchResultCard 
                    key={index} 
                    result={result} 
                    searchQuery={searchQuery}
                    highlightText={highlightText}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Results Found</h3>
              <p className="text-slate-600">
                No biomarkers found matching "{searchQuery}"
                {selectedCondition && ` in ${selectedCondition} condition`}
              </p>
              <button
                onClick={clearSearch}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search and try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Search Result Card Component
const SearchResultCard = ({ result, searchQuery, highlightText }) => {
  const getBiomarkerChangeColor = (change) => {
    if (change === 'increase') return 'text-green-600 bg-green-50 border-green-200';
    if (change === 'decrease') return 'text-red-600 bg-red-50 border-red-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getScoreBadge = (score) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h5 className="font-semibold text-slate-800 text-lg mb-2">
            {highlightText(result['Biomarker Name'], searchQuery)}
          </h5>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200 font-medium">
              {result['Condition']}
            </span>
            {result['Biomarker_Level_Change'] && (
              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getBiomarkerChangeColor(result['Biomarker_Level_Change'])}`}>
                {result['Biomarker_Level_Change']} ↗️
              </span>
            )}
            {result._score && (
              <span className={`text-xs px-2 py-1 rounded-full border ${getScoreBadge(result._score)}`}>
                Relevance: {result._score.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Treatment</label>
          <p className="text-sm text-slate-800 font-medium">
            {highlightText(result['Treatment_Name'] || 'N/A', searchQuery)}
          </p>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Study Type</label>
          <p className="text-sm text-slate-800">{result['Type of Study'] || 'N/A'}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Subject</label>
          <p className="text-sm text-slate-800">{result['Subject ID'] || 'N/A'}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">PDF Source</label>
          <p className="text-sm text-slate-800 truncate" title={result['PDF_name']}>
            {result['PDF_name'] || 'N/A'}
          </p>
        </div>
      </div>
      
      {result['Key Outcome'] && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Key Outcome</label>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
            {highlightText(result['Key Outcome'], searchQuery)}
          </p>
        </div>
      )}
      
      {result._highlight && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Highlighted Matches</label>
          <div className="text-sm text-slate-700 mt-1 space-y-1 bg-white p-3 rounded-lg border border-slate-200">
            {Object.entries(result._highlight).map(([field, highlights]) => (
              <div key={field}>
                <span className="font-medium text-blue-700">{field}:</span> 
                <span dangerouslySetInnerHTML={{ __html: highlights[0] }} className="ml-2" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
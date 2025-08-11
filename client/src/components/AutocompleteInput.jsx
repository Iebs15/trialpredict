// import React, { useState, useRef, useEffect } from 'react';
// import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

// const AutocompleteInput = ({ 
//   id, 
//   label, 
//   placeholder, 
//   value, 
//   onChange, 
//   suggestions = [], 
//   onKeyDown, 
//   icon: Icon, 
//   error, 
//   disabled = false, 
//   size = "default",
//   onSelect
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [filteredSuggestions, setFilteredSuggestions] = useState([]);
//   const [highlightedIndex, setHighlightedIndex] = useState(-1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const inputRef = useRef(null);
//   const dropdownRef = useRef(null);
//   const mouseDownRef = useRef(false);

//   const sizeClasses = {
//     small: "pl-10 pr-10 py-2 text-sm",
//     default: "pl-12 pr-12 py-4",
//     large: "pl-14 pr-14 py-5 text-lg"
//   };

//   const iconSizes = {
//     small: "h-4 w-4",
//     default: "h-5 w-5",
//     large: "h-6 w-6"
//   };

//   useEffect(() => {
//     // Add safety checks for undefined/null values
//     const safeValue = value || '';
//     const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
    
//     if (safeValue.length > 0) {
//       const searchValue = searchTerm || safeValue;
//       const filtered = safeSuggestions
//         .filter((item) => {
//           // Ensure item is a string
//           if (typeof item !== 'string') return false;
          
//           const itemLower = item.toLowerCase();
//           const searchLower = searchValue.toLowerCase();
//           return itemLower.includes(searchLower) || 
//                  itemLower.startsWith(searchLower);
//         })
//         .sort((a, b) => {
//           const aLower = a.toLowerCase();
//           const bLower = b.toLowerCase();
//           const searchLower = searchValue.toLowerCase();
          
//           if (aLower === searchLower) return -1;
//           if (bLower === searchLower) return 1;
          
//           if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1;
//           if (bLower.startsWith(searchLower) && !aLower.startsWith(searchLower)) return 1;
          
//           return a.localeCompare(b);
//         })
//         .slice(0, 12);
      
//       setFilteredSuggestions(filtered);
//       setIsOpen(filtered.length > 0 && !disabled);
//     } else {
//       setFilteredSuggestions([]);
//       setIsOpen(false);
//     }
//     setHighlightedIndex(-1);
//   }, [value, suggestions, searchTerm, disabled]);

//   const handleInputChange = (e) => {
//     const newValue = e.target.value;
//     setSearchTerm(newValue);
//     onChange(newValue);
//   };

//   const handleSuggestionClick = (suggestion) => {
//     mouseDownRef.current = false;
//     setSearchTerm("");
//     onChange(suggestion);
//     if (onSelect) onSelect(suggestion);
//     setIsOpen(false);
//     setHighlightedIndex(-1);
    
//     setTimeout(() => {
//       if (inputRef.current) {
//         inputRef.current.blur();
//       }
//     }, 100);
//   };

//   const handleKeyDown = (e) => {
//     if (disabled) return;

//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlightedIndex((prev) => 
//         prev < filteredSuggestions.length - 1 ? prev + 1 : prev
//       );
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
//         handleSuggestionClick(filteredSuggestions[highlightedIndex]);
//       } else {
//         onKeyDown && onKeyDown(e);
//       }
//     } else if (e.key === "Escape") {
//       setIsOpen(false);
//       setHighlightedIndex(-1);
//       inputRef.current?.blur();
//     } else if (e.key === "Tab") {
//       setIsOpen(false);
//       setHighlightedIndex(-1);
//     }
//   };

//   const handleBlur = () => {
//     if (!mouseDownRef.current) {
//       setTimeout(() => {
//         setIsOpen(false);
//         setHighlightedIndex(-1);
//         setSearchTerm("");
//       }, 200);
//     }
//   };

//   const handleFocus = () => {
//     const safeValue = value || '';
//     if (safeValue.length > 0 && filteredSuggestions.length > 0 && !disabled) {
//       setIsOpen(true);
//     }
//   };

//   return (
//     <div className="relative">
//       {label && (
//         <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">
//           {label}
//           {error && <span className="text-red-500 ml-1">*</span>}
//         </label>
//       )}
//       <div className="relative">
//         {Icon && (
//           <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
//             error ? 'text-red-400' : 
//             disabled ? 'text-slate-300' : 
//             'text-slate-400'
//           }`}>
//             <Icon className={iconSizes[size]} />
//           </div>
//         )}
//         <input
//           ref={inputRef}
//           id={id}
//           type="text"
//           placeholder={placeholder}
//           className={`w-full ${sizeClasses[size]} border-2 rounded-xl transition-all duration-300 bg-white shadow-sm font-medium ${
//             error 
//               ? 'border-red-300 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-400' 
//               : disabled
//               ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
//               : 'border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-md text-slate-700 placeholder-slate-400'
//           }`}
//           value={searchTerm || value || ''}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           onFocus={handleFocus}
//           onBlur={handleBlur}
//           autoComplete="off"
//           disabled={disabled}
//           spellCheck="false"
//         />
//         <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
//           disabled ? 'text-slate-300' : 'text-slate-400'
//         }`}>
//           <ChevronDown className={`${iconSizes[size]} transition-transform duration-200 ${
//             isOpen ? "rotate-180" : ""
//           }`} />
//         </div>
//       </div>

//       {isOpen && filteredSuggestions.length > 0 && (
//         <div
//           className="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden"
//           onMouseDown={(e) => {
//             e.preventDefault();
//             mouseDownRef.current = true;
//           }}
//           onMouseUp={() => {
//             mouseDownRef.current = false;
//           }}
//         >
//           <div className="max-h-80 overflow-y-auto">
//             <div className="py-1" ref={dropdownRef}>
//               {filteredSuggestions.map((suggestion, index) => {
//                 const isHighlighted = index === highlightedIndex;
//                 const searchLower = (searchTerm || value).toLowerCase();
//                 const suggestionLower = suggestion.toLowerCase();
//                 const isExactMatch = suggestionLower === searchLower;
                
//                 return (
//                   <div
//                     key={`${suggestion}-${index}`}
//                     className={`px-4 py-3 cursor-pointer transition-all duration-150 font-medium relative group ${
//                       isHighlighted
//                         ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
//                         : "text-slate-700 hover:bg-slate-50"
//                     }`}
//                     onClick={() => handleSuggestionClick(suggestion)}
//                     onMouseEnter={() => setHighlightedIndex(index)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm truncate pr-2">
//                         {suggestion}
//                       </span>
//                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                         {isExactMatch && (
//                           <CheckCircle className="h-3 w-3 text-green-500" />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
            
//             <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
//               <div className="text-xs text-slate-500 flex items-center justify-between">
//                 <span>{filteredSuggestions.length} suggestions</span>
//                 <div className="flex items-center gap-2">
//                   <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-800 bg-slate-200 border border-slate-300 rounded">↑↓</kbd>
//                   <span>navigate</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="mt-2 flex items-center gap-2 text-red-600">
//           <AlertCircle className="h-4 w-4" />
//           <span className="text-sm font-medium">{error}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AutocompleteInput;




import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertCircle, CheckCircle } from 'lucide-react';

const AutocompleteInput = ({ 
  id, 
  label, 
  placeholder, 
  value, 
  onChange, 
  suggestions = [], 
  onKeyDown, 
  icon: Icon, 
  error, 
  disabled = false, 
  size = "default",
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const mouseDownRef = useRef(false);

  const sizeClasses = {
    small: "pl-10 pr-10 py-2 text-sm",
    default: "pl-12 pr-12 py-4",
    large: "pl-14 pr-14 py-5 text-lg"
  };

  const iconSizes = {
    small: "h-4 w-4",
    default: "h-5 w-5",
    large: "h-6 w-6"
  };

  // Normalize function to handle case and whitespace
  const normalizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().toLowerCase();
  };

  // Get unique normalized suggestions
  const getUniqueSuggestions = (suggestions) => {
    const seen = new Set();
    const unique = [];
    
    for (const suggestion of suggestions) {
      if (typeof suggestion === 'string') {
        const normalized = normalizeString(suggestion);
        if (normalized && !seen.has(normalized)) {
          seen.add(normalized);
          // Keep the original casing of the first occurrence
          unique.push(suggestion.trim());
        }
      }
    }
    
    return unique.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  };

  useEffect(() => {
    const safeValue = value || '';
    const uniqueSuggestions = getUniqueSuggestions(suggestions);
    
    if (safeValue.length > 0) {
      const searchValue = searchTerm || safeValue;
      const normalizedSearch = normalizeString(searchValue);
      
      const filtered = uniqueSuggestions
        .filter((item) => {
          const normalizedItem = normalizeString(item);
          return normalizedItem.includes(normalizedSearch) || 
                 normalizedItem.startsWith(normalizedSearch);
        })
        .sort((a, b) => {
          const aNormalized = normalizeString(a);
          const bNormalized = normalizeString(b);
          const searchNormalized = normalizedSearch;
          
          // Exact match first
          if (aNormalized === searchNormalized) return -1;
          if (bNormalized === searchNormalized) return 1;
          
          // Starts with search term
          if (aNormalized.startsWith(searchNormalized) && !bNormalized.startsWith(searchNormalized)) return -1;
          if (bNormalized.startsWith(searchNormalized) && !aNormalized.startsWith(searchNormalized)) return 1;
          
          // Alphabetical
          return a.localeCompare(b);
        })
        .slice(0, 8); // Limit to 8 suggestions
      
      setFilteredSuggestions(filtered);
      setIsOpen(filtered.length > 0 && !disabled && searchValue.trim().length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value, suggestions, searchTerm, disabled]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion) => {
    mouseDownRef.current = false;
    setSearchTerm("");
    onChange(suggestion.trim());
    if (onSelect) onSelect(suggestion.trim());
    setIsOpen(false);
    setHighlightedIndex(-1);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

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
      } else {
        onKeyDown && onKeyDown(e);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
      setSearchTerm("");
      inputRef.current?.blur();
    } else if (e.key === "Tab") {
      setIsOpen(false);
      setHighlightedIndex(-1);
      setSearchTerm("");
    }
  };

  const handleBlur = () => {
    if (!mouseDownRef.current) {
      setTimeout(() => {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm("");
      }, 200);
    }
  };

  const handleFocus = () => {
    const safeValue = value || '';
    if (safeValue.length > 0 && !disabled) {
      // Trigger filtering on focus
      const uniqueSuggestions = getUniqueSuggestions(suggestions);
      const normalizedSearch = normalizeString(safeValue);
      
      const filtered = uniqueSuggestions
        .filter(item => normalizeString(item).includes(normalizedSearch))
        .slice(0, 8);
      
      if (filtered.length > 0) {
        setFilteredSuggestions(filtered);
        setIsOpen(true);
      }
    }
  };

  // Check if current value is an exact match
  const isExactMatch = () => {
    const normalizedValue = normalizeString(value || '');
    return getUniqueSuggestions(suggestions).some(
      suggestion => normalizeString(suggestion) === normalizedValue
    );
  };

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">
          {label}
          {error && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
            error ? 'text-red-400' : 
            disabled ? 'text-slate-300' : 
            'text-slate-400'
          }`}>
            <Icon className={iconSizes[size]} />
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          className={`w-full ${sizeClasses[size]} border-2 rounded-xl transition-all duration-300 bg-white shadow-sm font-medium ${
            error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500 text-red-900 placeholder-red-400' 
              : disabled
              ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
              : isExactMatch()
              ? 'border-green-300 focus:ring-green-500 focus:border-green-500 text-slate-700 placeholder-slate-400'
              : 'border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:shadow-md text-slate-700 placeholder-slate-400'
          }`}
          value={searchTerm || value || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoComplete="off"
          disabled={disabled}
          spellCheck="false"
        />
        <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2 ${
          disabled ? 'text-slate-300' : 'text-slate-400'
        }`}>
          {isExactMatch() && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <ChevronDown className={`${iconSizes[size]} transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`} />
        </div>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden"
          onMouseDown={(e) => {
            e.preventDefault();
            mouseDownRef.current = true;
          }}
          onMouseUp={() => {
            mouseDownRef.current = false;
          }}
        >
          <div className="max-h-64 overflow-y-auto">
            <div className="py-1" ref={dropdownRef}>
              {filteredSuggestions.map((suggestion, index) => {
                const isHighlighted = index === highlightedIndex;
                const searchLower = normalizeString(searchTerm || value);
                const suggestionLower = normalizeString(suggestion);
                const isExactMatch = suggestionLower === searchLower;
                
                return (
                  <div
                    key={`${suggestion}-${index}`}
                    className={`px-4 py-3 cursor-pointer transition-all duration-150 font-medium relative group ${
                      isHighlighted
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate pr-2">
                        {suggestion}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isExactMatch && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>{filteredSuggestions.length} suggestions</span>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-800 bg-slate-200 border border-slate-300 rounded">↑↓</kbd>
                  <span>navigate</span>
                </div>
              </div>
            </div>
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

export default AutocompleteInput;
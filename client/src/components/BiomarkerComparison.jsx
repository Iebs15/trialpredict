// import { useState, useRef, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { 
//   Search, ChevronDown, FlaskConical, Loader2, Plus, X, BarChart3, 
//   TrendingUp, Download, Upload, Copy, Trash2, Edit3, Save, RefreshCw, 
//   AlertCircle, CheckCircle, Filter, SortAsc, Eye, EyeOff, ArrowLeft,
//   Activity, Target, Beaker, Database, FileText, Settings
// } from "lucide-react"

// // Import your biomarkers data
// import biomarkersData from "../assets/data/biomarkers.json"

// const AutocompleteInput = ({ 
//   id, 
//   label, 
//   placeholder, 
//   value, 
//   onChange, 
//   suggestions, 
//   onKeyDown, 
//   icon: Icon, 
//   error, 
//   disabled, 
//   size = "default" 
// }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [filteredSuggestions, setFilteredSuggestions] = useState([])
//   const [highlightedIndex, setHighlightedIndex] = useState(-1)
//   const [searchTerm, setSearchTerm] = useState("")
//   const inputRef = useRef(null)
//   const dropdownRef = useRef(null)
//   const mouseDownRef = useRef(false)
//   const timeoutRef = useRef(null)

//   const sizeClasses = {
//     small: "pl-10 pr-10 py-2 text-sm",
//     default: "pl-12 pr-12 py-4",
//     large: "pl-14 pr-14 py-5 text-lg"
//   }

//   const iconSizes = {
//     small: "h-4 w-4",
//     default: "h-5 w-5",
//     large: "h-6 w-6"
//   }

//   useEffect(() => {
//     if (value.length > 0) {
//       const searchValue = searchTerm || value
//       const filtered = suggestions
//         .filter((item) => {
//           const itemLower = item.toLowerCase()
//           const searchLower = searchValue.toLowerCase()
//           return itemLower.includes(searchLower) || 
//                  itemLower.startsWith(searchLower) ||
//                  searchLower.split(' ').every(term => itemLower.includes(term))
//         })
//         .sort((a, b) => {
//           const aLower = a.toLowerCase()
//           const bLower = b.toLowerCase()
//           const searchLower = searchValue.toLowerCase()
          
//           // Exact matches first
//           if (aLower === searchLower) return -1
//           if (bLower === searchLower) return 1
          
//           // Starts with matches next
//           if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1
//           if (bLower.startsWith(searchLower) && !aLower.startsWith(searchLower)) return 1
          
//           // Alphabetical order
//           return a.localeCompare(b)
//         })
//         .slice(0, 12)
      
//       setFilteredSuggestions(filtered)
//       setIsOpen(filtered.length > 0 && !disabled)
//     } else {
//       setFilteredSuggestions([])
//       setIsOpen(false)
//     }
//     setHighlightedIndex(-1)
//   }, [value, suggestions, searchTerm, disabled])

//   const handleInputChange = (e) => {
//     const newValue = e.target.value
//     setSearchTerm(newValue)
//     onChange(newValue)
//   }

//   const handleSuggestionClick = (suggestion) => {
//     mouseDownRef.current = false
//     setSearchTerm("")
//     onChange(suggestion)
//     setIsOpen(false)
//     setHighlightedIndex(-1)
    
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current)
//     }
    
//     timeoutRef.current = setTimeout(() => {
//       if (inputRef.current) {
//         inputRef.current.blur()
//       }
//     }, 100)
//   }

//   const handleKeyDown = (e) => {
//     if (disabled) return

//     if (e.key === "ArrowDown") {
//       e.preventDefault()
//       setHighlightedIndex((prev) => 
//         prev < filteredSuggestions.length - 1 ? prev + 1 : prev
//       )
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault()
//       setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
//     } else if (e.key === "Enter") {
//       e.preventDefault()
//       if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
//         handleSuggestionClick(filteredSuggestions[highlightedIndex])
//       } else {
//         onKeyDown && onKeyDown(e)
//       }
//     } else if (e.key === "Escape") {
//       setIsOpen(false)
//       setHighlightedIndex(-1)
//       inputRef.current?.blur()
//     } else if (e.key === "Tab") {
//       setIsOpen(false)
//       setHighlightedIndex(-1)
//     }
//   }

//   const handleMouseDown = (e) => {
//     e.preventDefault()
//     mouseDownRef.current = true
//   }

//   const handleMouseUp = () => {
//     mouseDownRef.current = false
//   }

//   useEffect(() => {
//     document.addEventListener("mouseup", handleMouseUp)
//     return () => {
//       document.removeEventListener("mouseup", handleMouseUp)
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current)
//       }
//     }
//   }, [])

//   const handleBlur = () => {
//     if (!mouseDownRef.current) {
//       setTimeout(() => {
//         setIsOpen(false)
//         setHighlightedIndex(-1)
//         setSearchTerm("")
//       }, 200)
//     }
//   }

//   const handleFocus = () => {
//     if (value.length > 0 && filteredSuggestions.length > 0 && !disabled) {
//       setIsOpen(true)
//     }
//   }

//   // Scroll highlighted item into view
//   useEffect(() => {
//     if (highlightedIndex >= 0 && dropdownRef.current) {
//       const highlightedElement = dropdownRef.current.children[highlightedIndex]
//       if (highlightedElement) {
//         highlightedElement.scrollIntoView({
//           block: 'nearest',
//           behavior: 'smooth'
//         })
//       }
//     }
//   }, [highlightedIndex])

//   return (
//     <div className="relative">
//       {label && (
//         <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">
//           {label}
//           {error && <span className="text-red-500 ml-1">*</span>}
//         </label>
//       )}
//       <div className="relative">
//         <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
//           error ? 'text-red-400' : 
//           disabled ? 'text-slate-300' : 
//           'text-slate-400'
//         }`}>
//           <Icon className={iconSizes[size]} />
//         </div>
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
//           value={searchTerm || value}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           onBlur={handleBlur}
//           onFocus={handleFocus}
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

//       {/* Enhanced Dropdown */}
//       {isOpen && filteredSuggestions.length > 0 && (
//         <div
//           className="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden"
//           style={{
//             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
//           }}
//           onMouseDown={handleMouseDown}
//         >
//           <div className="max-h-80 overflow-y-auto">
//             <div className="py-1" ref={dropdownRef}>
//               {filteredSuggestions.map((suggestion, index) => {
//                 const isHighlighted = index === highlightedIndex
//                 const searchLower = (searchTerm || value).toLowerCase()
//                 const suggestionLower = suggestion.toLowerCase()
//                 const isExactMatch = suggestionLower === searchLower
//                 const startsWithMatch = suggestionLower.startsWith(searchLower)
                
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
//                         {startsWithMatch && !isExactMatch && (
//                           <div className="h-2 w-2 bg-blue-400 rounded-full" />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
            
//             {/* Footer with count */}
//             <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
//               <div className="text-xs text-slate-500 flex items-center justify-between">
//                 <span>{filteredSuggestions.length} suggestions</span>
//                 <div className="flex items-center gap-2">
//                   <div className="flex items-center gap-1">
//                     <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-800 bg-slate-200 border border-slate-300 rounded">↑↓</kbd>
//                     <span>navigate</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-800 bg-slate-200 border border-slate-300 rounded">↵</kbd>
//                     <span>select</span>
//                   </div>
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
//   )
// }

// const TreatmentCard = ({ 
//   treatment, 
//   onUpdate, 
//   onRemove, 
//   onDuplicate, 
//   canRemove, 
//   isSelected, 
//   onToggleSelect 
// }) => {
//   const [isEditing, setIsEditing] = useState(false)
//   const [editedName, setEditedName] = useState(treatment.name)
//   const [errors, setErrors] = useState({})

//   const validateBiomarker = (biomarker, index) => {
//     const newErrors = { ...errors }
    
//     if (!biomarker.name.trim()) {
//       newErrors[`name-${index}`] = "Biomarker name is required"
//     } else {
//       delete newErrors[`name-${index}`]
//     }
    
//     if (!biomarker.value.toString().trim()) {
//       newErrors[`value-${index}`] = "Value is required"
//     } else if (isNaN(parseFloat(biomarker.value))) {
//       newErrors[`value-${index}`] = "Must be a valid number"
//     } else {
//       delete newErrors[`value-${index}`]
//     }
    
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSaveName = () => {
//     if (editedName.trim()) {
//       onUpdate(treatment.id, { ...treatment, name: editedName.trim() })
//       setIsEditing(false)
//     }
//   }

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSaveName()
//     } else if (e.key === 'Escape') {
//       setEditedName(treatment.name)
//       setIsEditing(false)
//     }
//   }

//   return (
//     <div className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 shadow-sm hover:shadow-md ${
//       isSelected 
//         ? 'border-blue-300 bg-blue-50/30 ring-2 ring-blue-100' 
//         : 'border-slate-200 hover:border-slate-300'
//     }`}>
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3 flex-1">
//           <input
//             type="checkbox"
//             checked={isSelected}
//             onChange={(e) => onToggleSelect(treatment.id, e.target.checked)}
//             className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
//           />
          
//           {isEditing ? (
//             <div className="flex items-center gap-2 flex-1">
//               <input
//                 type="text"
//                 value={editedName}
//                 onChange={(e) => setEditedName(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 className="text-lg font-bold bg-white border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 flex-1"
//                 autoFocus
//               />
//               <button
//                 onClick={handleSaveName}
//                 className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
//               >
//                 <Save className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={() => {
//                   setEditedName(treatment.name)
//                   setIsEditing(false)
//                 }}
//                 className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </div>
//           ) : (
//             <div className="flex items-center gap-2 flex-1 group">
//               <h3 className="text-lg font-bold text-slate-800 truncate">{treatment.name}</h3>
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="p-1 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100"
//                 title="Edit name"
//               >
//                 <Edit3 className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
//             {treatment.biomarkers.filter(b => b.name.trim() && b.value.toString().trim()).length} biomarkers
//           </span>
//           <button
//             onClick={() => onDuplicate(treatment.id)}
//             className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//             title="Duplicate treatment"
//           >
//             <Copy className="h-4 w-4" />
//           </button>
//           {canRemove && (
//             <button
//               onClick={() => onRemove(treatment.id)}
//               className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//               title="Remove treatment"
//             >
//               <Trash2 className="h-4 w-4" />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Biomarkers */}
//       <div className="space-y-4">
//         {treatment.biomarkers.map((biomarker, index) => (
//           <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
//               <div className="md:col-span-2">
//                 <AutocompleteInput
//                   id={`biomarker-${treatment.id}-${index}`}
//                   placeholder="Enter biomarker name"
//                   value={biomarker.name}
//                   onChange={(value) => {
//                     const updated = { ...treatment }
//                     updated.biomarkers[index].name = value
//                     onUpdate(treatment.id, updated)
//                     validateBiomarker({ ...biomarker, name: value }, index)
//                   }}
//                   suggestions={biomarkersData.biomarkers || []}
//                   icon={FlaskConical}
//                   size="small"
//                   error={errors[`name-${index}`]}
//                 />
//               </div>
//               <div className="flex items-start gap-2">
//                 <div className="flex-1">
//                   <input
//                     type="number"
//                     step="any"
//                     placeholder="Value"
//                     value={biomarker.value}
//                     onChange={(e) => {
//                       const updated = { ...treatment }
//                       updated.biomarkers[index].value = e.target.value
//                       onUpdate(treatment.id, updated)
//                       validateBiomarker({ ...biomarker, value: e.target.value }, index)
//                     }}
//                     className={`w-full px-3 py-2 border-2 rounded-lg transition-all text-sm font-mono ${
//                       errors[`value-${index}`]
//                         ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
//                         : 'border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
//                     }`}
//                   />
//                   {errors[`value-${index}`] && (
//                     <div className="mt-1 text-xs text-red-600">{errors[`value-${index}`]}</div>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => {
//                     const updated = { ...treatment }
//                     updated.biomarkers.splice(index, 1)
//                     onUpdate(treatment.id, updated)
//                   }}
//                   className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors mt-0.5"
//                   title="Remove biomarker"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
        
//         <button
//           onClick={() => {
//             const updated = { ...treatment }
//             updated.biomarkers.push({ name: "", value: "" })
//             onUpdate(treatment.id, updated)
//           }}
//           className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 group"
//         >
//           <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
//           <span className="font-medium">Add Biomarker</span>
//         </button>
//       </div>
//     </div>
//   )
// }

// const ComparisonChart = ({ 
//   treatments, 
//   selectedTreatments, 
//   sortBy, 
//   showValues, 
//   filterBiomarker 
// }) => {
//   const getAllBiomarkers = () => {
//     const allBiomarkers = new Set()
//     treatments
//       .filter(t => selectedTreatments.includes(t.id))
//       .forEach(treatment => {
//         treatment.biomarkers.forEach(biomarker => {
//           if (biomarker.name.trim() && biomarker.value.toString().trim()) {
//             allBiomarkers.add(biomarker.name.trim())
//           }
//         })
//       })
    
//     let biomarkers = Array.from(allBiomarkers)
    
//     if (filterBiomarker) {
//       biomarkers = biomarkers.filter(b => 
//         b.toLowerCase().includes(filterBiomarker.toLowerCase())
//       )
//     }
    
//     if (sortBy === 'alphabetical') {
//       biomarkers.sort()
//     } else if (sortBy === 'maxValue') {
//       biomarkers.sort((a, b) => getMaxValue(b) - getMaxValue(a))
//     } else if (sortBy === 'variance') {
//       biomarkers.sort((a, b) => getBiomarkerVariance(b) - getBiomarkerVariance(a))
//     }
    
//     return biomarkers
//   }

//   const getMaxValue = (biomarkerName) => {
//     let max = 0
//     treatments
//       .filter(t => selectedTreatments.includes(t.id))
//       .forEach(treatment => {
//         const biomarker = treatment.biomarkers.find(b => b.name === biomarkerName)
//         if (biomarker && biomarker.value) {
//           max = Math.max(max, parseFloat(biomarker.value) || 0)
//         }
//       })
//     return max
//   }

//   const getBiomarkerVariance = (biomarkerName) => {
//     const values = []
//     treatments
//       .filter(t => selectedTreatments.includes(t.id))
//       .forEach(treatment => {
//         const biomarker = treatment.biomarkers.find(b => b.name === biomarkerName)
//         if (biomarker && biomarker.value) {
//           values.push(parseFloat(biomarker.value) || 0)
//         }
//       })
    
//     if (values.length < 2) return 0
    
//     const mean = values.reduce((a, b) => a + b, 0) / values.length
//     const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
//     return variance
//   }

//   const getBiomarkerValue = (treatmentId, biomarkerName) => {
//     const treatment = treatments.find(t => t.id === treatmentId)
//     if (!treatment) return null
//     const biomarker = treatment.biomarkers.find(b => b.name === biomarkerName)
//     return biomarker ? parseFloat(biomarker.value) || 0 : 0
//   }

//   const getBiomarkerColor = (treatmentIndex) => {
//     const colors = [
//       'from-blue-500 to-blue-600',
//       'from-emerald-500 to-emerald-600',
//       'from-purple-500 to-purple-600',
//       'from-orange-500 to-orange-600',
//       'from-red-500 to-red-600',
//       'from-indigo-500 to-indigo-600',
//       'from-pink-500 to-pink-600',
//       'from-teal-500 to-teal-600'
//     ]
//     return colors[treatmentIndex % colors.length]
//   }

//   const biomarkers = getAllBiomarkers()

//   if (biomarkers.length === 0) {
//     return (
//       <div className="text-center py-16 text-slate-500">
//         <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
//         <p className="text-xl font-medium mb-2">No biomarkers to compare</p>
//         <p className="text-sm">Add biomarkers to your treatments to see the comparison</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {biomarkers.map((biomarkerName) => {
//         const maxValue = getMaxValue(biomarkerName)
//         const variance = getBiomarkerVariance(biomarkerName)
        
//         return (
//           <div key={biomarkerName} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h4 className="font-bold text-slate-800 text-xl">{biomarkerName}</h4>
//                 <div className="flex items-center gap-6 mt-2">
//                   <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
//                     Max: <span className="font-mono">{maxValue.toFixed(3)}</span>
//                   </span>
//                   <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
//                     Variance: <span className="font-mono">{variance.toFixed(3)}</span>
//                   </span>
//                 </div>
//               </div>
//               {variance > 1 && (
//                 <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-full border border-amber-200">
//                   <AlertCircle className="h-4 w-4" />
//                   <span className="text-sm font-medium">High variance</span>
//                 </div>
//               )}
//             </div>
            
//             <div className="space-y-4">
//               {selectedTreatments.map((treatmentId, index) => {
//                 const treatment = treatments.find(t => t.id === treatmentId)
//                 const value = getBiomarkerValue(treatmentId, biomarkerName)
//                 const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
//                 const colorClass = getBiomarkerColor(index)
                
//                 return (
//                   <div key={treatmentId} className="group">
//                     <div className="flex items-center gap-4 mb-2">
//                       <div className="w-36 text-sm font-semibold text-slate-700 truncate">
//                         {treatment?.name}
//                       </div>
//                       <div className="flex-1 bg-slate-200 rounded-full h-10 relative overflow-hidden">
//                         <div
//                           className={`bg-gradient-to-r ${colorClass} h-10 rounded-full transition-all duration-700 ease-out flex items-center justify-between px-4 shadow-sm`}
//                           style={{ width: `${Math.max(percentage, 10)}%` }}
//                         >
//                           {showValues && percentage >= 25 && (
//                             <span className="text-white text-sm font-bold">
//                               {value.toFixed(3)}
//                             </span>
//                           )}
//                         </div>
//                         {(percentage < 25 && showValues) && (
//                           <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 text-sm font-mono">
//                             {value.toFixed(3)}
//                           </div>
//                         )}
//                       </div>
//                       <div className="w-20 text-right">
//                         <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
//                           {percentage.toFixed(1)}%
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// export default function BiomarkerComparison() {
//   const navigate = useNavigate()
//   const [treatments, setTreatments] = useState([
//     {
//       id: 1,
//       name: "Treatment 1",
//       biomarkers: [
//         { name: "IL-6", value: "2.580539194" },
//         { name: "MCP-1", value: "2.042788531" },
//         { name: "Angiogenin", value: "1.785786364" },
//         { name: "IL-8", value: "1.739913144" },
//         { name: "Osteoprotegerin", value: "1.355522288" },
//         { name: "HGF", value: "1.340264028" },
//         { name: "TIMP-1", value: "1.296186579" },
//         { name: "IGFBP-2", value: "0.892642182" },
//         { name: "TIMP-2", value: "0.864660813" }
//       ]
//     }
//   ])
//   const [selectedTreatments, setSelectedTreatments] = useState([1])
//   const [showComparison, setShowComparison] = useState(false)
//   const [sortBy, setSortBy] = useState('maxValue')
//   const [showValues, setShowValues] = useState(true)
//   const [filterBiomarker, setFilterBiomarker] = useState('')

//   const addTreatment = () => {
//     const newId = Math.max(...treatments.map(t => t.id)) + 1
//     setTreatments([...treatments, {
//       id: newId,
//       name: `Treatment ${newId}`,
//       biomarkers: []
//     }])
//   }

//   const removeTreatment = (id) => {
//     if (treatments.length > 1) {
//       setTreatments(treatments.filter(t => t.id !== id))
//       setSelectedTreatments(selectedTreatments.filter(t => t !== id))
//     }
//   }

//   const updateTreatment = (id, updatedTreatment) => {
//     setTreatments(treatments.map(t => 
//       t.id === id ? updatedTreatment : t
//     ))
//   }

//   const duplicateTreatment = (id) => {
//     const originalTreatment = treatments.find(t => t.id === id)
//     if (originalTreatment) {
//       const newId = Math.max(...treatments.map(t => t.id)) + 1
//       const duplicatedTreatment = {
//         ...originalTreatment,
//         id: newId,
//         name: `${originalTreatment.name} (Copy)`,
//         biomarkers: [...originalTreatment.biomarkers]
//       }
//       setTreatments([...treatments, duplicatedTreatment])
//       setSelectedTreatments([...selectedTreatments, newId])
//     }
//   }

//   const toggleTreatmentSelection = (id, selected) => {
//     if (selected) {
//       setSelectedTreatments([...selectedTreatments, id])
//     } else {
//       setSelectedTreatments(selectedTreatments.filter(t => t !== id))
//     }
//   }

//   const exportData = () => {
//     const exportData = {
//       treatments,
//       metadata: {
//         exportDate: new Date().toISOString(),
//         version: "1.0",
//         totalTreatments: treatments.length,
//         totalBiomarkers: treatments.reduce((acc, t) => acc + t.biomarkers.length, 0)
//       }
//     }
//     const dataStr = JSON.stringify(exportData, null, 2)
//     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
//     const exportFileDefaultName = `treatment-comparison-${new Date().toISOString().split('T')[0]}.json`
//     const linkElement = document.createElement('a')
//     linkElement.setAttribute('href', dataUri)
//     linkElement.setAttribute('download', exportFileDefaultName)
//     linkElement.click()
//   }

//   const importData = (event) => {
//     const file = event.target.files[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         try {
//           const imported = JSON.parse(e.target.result)
//           const treatmentsData = imported.treatments || imported
          
//           // Validate data structure
//           if (Array.isArray(treatmentsData) && treatmentsData.length > 0) {
//             setTreatments(treatmentsData)
//             setSelectedTreatments(treatmentsData.map(t => t.id))
//           } else {
//             throw new Error("Invalid data format")
//           }
//         } catch (error) {
//           alert('Error importing file. Please check the format and try again.')
//         }
//       }
//       reader.readAsText(file)
//     }
//     // Reset the input
//     event.target.value = ''
//   }

//   const clearAllData = () => {
//     if (confirm('Are you sure you want to clear all treatment data? This action cannot be undone.')) {
//       setTreatments([{
//         id: 1,
//         name: "Treatment 1",
//         biomarkers: []
//       }])
//       setSelectedTreatments([1])
//     }
//   }

//   const selectAllTreatments = () => {
//     setSelectedTreatments(treatments.map(t => t.id))
//   }

//   const deselectAllTreatments = () => {
//     setSelectedTreatments([])
//   }

//   const getComparisonStats = () => {
//     const selectedCount = selectedTreatments.length
//     const totalBiomarkers = new Set()
    
//     treatments
//       .filter(t => selectedTreatments.includes(t.id))
//       .forEach(treatment => {
//         treatment.biomarkers.forEach(biomarker => {
//           if (biomarker.name.trim() && biomarker.value.toString().trim()) {
//             totalBiomarkers.add(biomarker.name.trim())
//           }
//         })
//       })

//     return {
//       selectedTreatments: selectedCount,
//       uniqueBiomarkers: totalBiomarkers.size,
//       totalDataPoints: treatments
//         .filter(t => selectedTreatments.includes(t.id))
//         .reduce((acc, t) => acc + t.biomarkers.filter(b => b.name.trim() && b.value.toString().trim()).length, 0)
//     }
//   }

//   const stats = getComparisonStats()

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       <div className="container mx-auto px-4 py-8">
//         {/* Page Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-4 mb-6">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Back
//             </button>
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
//                 <Beaker className="h-8 w-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold text-slate-800">Treatment Comparison</h1>
//                 <p className="text-slate-600">Compare biomarker profiles across different treatments</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Control Panel */}
//         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
//           <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
//             <div className="flex gap-3 flex-wrap">
//               <button
//                 onClick={addTreatment}
//                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Treatment
//               </button>
//               <button
//                 onClick={() => setShowComparison(!showComparison)}
//                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
//               >
//                 <BarChart3 className="h-4 w-4" />
//                 {showComparison ? 'Hide' : 'Show'} Comparison
//               </button>
//               {selectedTreatments.length > 0 && (
//                 <button
//                   onClick={deselectAllTreatments}
//                   className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
//                 >
//                   <EyeOff className="h-4 w-4" />
//                   Deselect All
//                 </button>
//               )}
//               {selectedTreatments.length < treatments.length && (
//                 <button
//                   onClick={selectAllTreatments}
//                   className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
//                 >
//                   <Eye className="h-4 w-4" />
//                   Select All
//                 </button>
//               )}
//             </div>
            
//             <div className="flex gap-3">
//               <button
//                 onClick={exportData}
//                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
//               >
//                 <Download className="h-4 w-4" />
//                 Export
//               </button>
//               <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-sm hover:shadow-md font-medium cursor-pointer transform hover:scale-105">
//                 <Upload className="h-4 w-4" />
//                 Import
//                 <input
//                   type="file"
//                   accept=".json"
//                   onChange={importData}
//                   className="hidden"
//                 />
//               </label>
//               <button
//                 onClick={clearAllData}
//                 className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
//               >
//                 <RefreshCw className="h-4 w-4" />
//                 Clear All
//               </button>
//             </div>
//           </div>

//           {/* Stats Dashboard */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
//               <div className="flex items-center gap-3">
//                 <Database className="h-8 w-8 text-slate-600" />
//                 <div>
//                   <div className="text-2xl font-bold text-slate-800">{treatments.length}</div>
//                   <div className="text-sm text-slate-600">Total Treatments</div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
//               <div className="flex items-center gap-3">
//                 <Target className="h-8 w-8 text-blue-600" />
//                 <div>
//                   <div className="text-2xl font-bold text-blue-600">{stats.selectedTreatments}</div>
//                   <div className="text-sm text-blue-600">Selected for Comparison</div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
//               <div className="flex items-center gap-3">
//                 <Activity className="h-8 w-8 text-green-600" />
//                 <div>
//                   <div className="text-2xl font-bold text-green-600">{stats.uniqueBiomarkers}</div>
//                   <div className="text-sm text-green-600">Unique Biomarkers</div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
//               <div className="flex items-center gap-3">
//                 <FileText className="h-8 w-8 text-purple-600" />
//                 <div>
//                   <div className="text-2xl font-bold text-purple-600">{stats.totalDataPoints}</div>
//                   <div className="text-sm text-purple-600">Data Points</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Treatment Cards */}
//         <div className="space-y-6 mb-8">
//           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
//             <Settings className="h-5 w-5" />
//             Treatment Configuration
//           </h2>
//           <div className="grid gap-6">
//             {treatments.map((treatment) => (
//               <TreatmentCard
//                 key={treatment.id}
//                 treatment={treatment}
//                 onUpdate={updateTreatment}
//                 onRemove={removeTreatment}
//                 onDuplicate={duplicateTreatment}
//                 canRemove={treatments.length > 1}
//                 isSelected={selectedTreatments.includes(treatment.id)}
//                 onToggleSelect={toggleTreatmentSelection}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Enhanced Comparison View */}
//         {showComparison && selectedTreatments.length > 0 && (
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//             {/* Comparison Header */}
//             <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-6 border-b border-slate-200">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <TrendingUp className="h-6 w-6 text-blue-600" />
//                   <div>
//                     <h3 className="text-2xl font-bold text-slate-800">Treatment Comparison</h3>
//                     <p className="text-sm text-slate-600">
//                       Comparing {stats.selectedTreatments} treatments across {stats.uniqueBiomarkers} biomarkers
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Comparison Controls */}
//               <div className="flex flex-wrap items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <Filter className="h-4 w-4 text-slate-500" />
//                   <input
//                     type="text"
//                     placeholder="Filter biomarkers..."
//                     value={filterBiomarker}
//                     onChange={(e) => setFilterBiomarker(e.target.value)}
//                     className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                   />
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <SortAsc className="h-4 w-4 text-slate-500" />
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                   >
//                     <option value="maxValue">Sort by Max Value</option>
//                     <option value="variance">Sort by Variance</option>
//                     <option value="alphabetical">Sort Alphabetically</option>
//                   </select>
//                 </div>
                
//                 <button
//                   onClick={() => setShowValues(!showValues)}
//                   className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     showValues 
//                       ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
//                       : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                   }`}
//                 >
//                   {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
//                   Show Values
//                 </button>
//               </div>
//             </div>
            
//             {/* Comparison Chart */}
//             <div className="p-6">
//               {selectedTreatments.length > 1 ? (
//                 <ComparisonChart 
//                   treatments={treatments}
//                   selectedTreatments={selectedTreatments}
//                   sortBy={sortBy}
//                   showValues={showValues}
//                   filterBiomarker={filterBiomarker}
//                 />
//               ) : (
//                 <div className="text-center py-16 text-slate-500">
//                   <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
//                   <p className="text-xl font-medium mb-2">Select at least 2 treatments to compare</p>
//                   <p className="text-sm">Use the checkboxes on treatment cards to select them for comparison</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


// import { useState, useRef, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { 
//   Search, ChevronDown, FlaskConical, Loader2, Plus, X, BarChart3, 
//   TrendingUp, Download, Upload, Copy, Trash2, Edit3, Save, RefreshCw, 
//   AlertCircle, CheckCircle, Filter, SortAsc, Eye, EyeOff, ArrowLeft,
//   Activity, Target, Beaker, Database, FileText, Settings, ChevronLeft, ChevronRight
// } from "lucide-react"

// // Mock data based on your Excel files
// const biomarkerDatabase = {
//   "IL-6": {
//     "Aging": 2.580539194,
//     "Pigmentation": 1.890432156,
//     "Wrinkles": 2.123456789
//   },
//   "MCP-1": {
//     "Aging": 2.042788531,
//     "Pigmentation": 1.567890123,
//     "Wrinkles": 1.889654321
//   },
//   "Angiogenin": {
//     "Aging": 1.785786364,
//     "Pigmentation": 1.345678901,
//     "Wrinkles": 1.654321098
//   },
//   "IL-8": {
//     "Aging": 1.739913144,
//     "Pigmentation": 1.234567890,
//     "Wrinkles": 1.876543210
//   },
//   "Osteoprotegerin": {
//     "Aging": 1.355522288,
//     "Pigmentation": 1.111111111,
//     "Wrinkles": 1.333333333
//   },
//   "HGF": {
//     "Aging": 1.340264028,
//     "Pigmentation": 1.098765432,
//     "Wrinkles": 1.234567891
//   },
//   "TIMP-1": {
//     "Aging": 1.296186579,
//     "Pigmentation": 1.012345678,
//     "Wrinkles": 1.456789012
//   },
//   "IGFBP-2": {
//     "Aging": 0.892642182,
//     "Pigmentation": 0.678901234,
//     "Wrinkles": 0.789012345
//   },
//   "TIMP-2": {
//     "Aging": 0.864660813,
//     "Pigmentation": 0.567890123,
//     "Wrinkles": 0.678901234
//   },
//   "TNF-α": {
//     "Aging": 1.987654321,
//     "Pigmentation": 1.456789012,
//     "Wrinkles": 1.789012345
//   },
//   "Collagen I": {
//     "Aging": 0.765432109,
//     "Pigmentation": 0.890123456,
//     "Wrinkles": 0.456789012
//   },
//   "Elastin": {
//     "Aging": 0.543210987,
//     "Pigmentation": 0.678901234,
//     "Wrinkles": 0.321098765
//   },
//   "Hyaluronic Acid": {
//     "Aging": 1.456789012,
//     "Pigmentation": 1.234567890,
//     "Wrinkles": 1.098765432
//   },
//   "Melanin": {
//     "Aging": 0.987654321,
//     "Pigmentation": 2.345678901,
//     "Wrinkles": 1.123456789
//   }
// }

// // Get all available biomarkers
// const availableBiomarkers = Object.keys(biomarkerDatabase)

// const AutocompleteInput = ({ 
//   id, 
//   label, 
//   placeholder, 
//   value, 
//   onChange, 
//   suggestions, 
//   onKeyDown, 
//   icon: Icon, 
//   error, 
//   disabled, 
//   size = "default" 
// }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [filteredSuggestions, setFilteredSuggestions] = useState([])
//   const [highlightedIndex, setHighlightedIndex] = useState(-1)
//   const [searchTerm, setSearchTerm] = useState("")
//   const inputRef = useRef(null)
//   const dropdownRef = useRef(null)
//   const mouseDownRef = useRef(false)
//   const timeoutRef = useRef(null)

//   const sizeClasses = {
//     small: "pl-10 pr-10 py-2 text-sm",
//     default: "pl-12 pr-12 py-4",
//     large: "pl-14 pr-14 py-5 text-lg"
//   }

//   const iconSizes = {
//     small: "h-4 w-4",
//     default: "h-5 w-5",
//     large: "h-6 w-6"
//   }

//   useEffect(() => {
//     if (value.length > 0) {
//       const searchValue = searchTerm || value
//       const filtered = suggestions
//         .filter((item) => {
//           const itemLower = item.toLowerCase()
//           const searchLower = searchValue.toLowerCase()
//           return itemLower.includes(searchLower) || 
//                  itemLower.startsWith(searchLower) ||
//                  searchLower.split(' ').every(term => itemLower.includes(term))
//         })
//         .sort((a, b) => {
//           const aLower = a.toLowerCase()
//           const bLower = b.toLowerCase()
//           const searchLower = searchValue.toLowerCase()
          
//           if (aLower === searchLower) return -1
//           if (bLower === searchLower) return 1
          
//           if (aLower.startsWith(searchLower) && !bLower.startsWith(searchLower)) return -1
//           if (bLower.startsWith(searchLower) && !aLower.startsWith(searchLower)) return 1
          
//           return a.localeCompare(b)
//         })
//         .slice(0, 12)
      
//       setFilteredSuggestions(filtered)
//       setIsOpen(filtered.length > 0 && !disabled)
//     } else {
//       setFilteredSuggestions([])
//       setIsOpen(false)
//     }
//     setHighlightedIndex(-1)
//   }, [value, suggestions, searchTerm, disabled])

//   const handleInputChange = (e) => {
//     const newValue = e.target.value
//     setSearchTerm(newValue)
//     onChange(newValue)
//   }

//   const handleSuggestionClick = (suggestion) => {
//     mouseDownRef.current = false
//     setSearchTerm("")
//     onChange(suggestion)
//     setIsOpen(false)
//     setHighlightedIndex(-1)
    
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current)
//     }
    
//     timeoutRef.current = setTimeout(() => {
//       if (inputRef.current) {
//         inputRef.current.blur()
//       }
//     }, 100)
//   }

//   const handleKeyDown = (e) => {
//     if (disabled) return

//     if (e.key === "ArrowDown") {
//       e.preventDefault()
//       setHighlightedIndex((prev) => 
//         prev < filteredSuggestions.length - 1 ? prev + 1 : prev
//       )
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault()
//       setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
//     } else if (e.key === "Enter") {
//       e.preventDefault()
//       if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
//         handleSuggestionClick(filteredSuggestions[highlightedIndex])
//       } else {
//         onKeyDown && onKeyDown(e)
//       }
//     } else if (e.key === "Escape") {
//       setIsOpen(false)
//       setHighlightedIndex(-1)
//       inputRef.current?.blur()
//     } else if (e.key === "Tab") {
//       setIsOpen(false)
//       setHighlightedIndex(-1)
//     }
//   }

//   const handleMouseDown = (e) => {
//     e.preventDefault()
//     mouseDownRef.current = true
//   }

//   const handleMouseUp = () => {
//     mouseDownRef.current = false
//   }

//   useEffect(() => {
//     document.addEventListener("mouseup", handleMouseUp)
//     return () => {
//       document.removeEventListener("mouseup", handleMouseUp)
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current)
//       }
//     }
//   }, [])

//   const handleBlur = () => {
//     if (!mouseDownRef.current) {
//       setTimeout(() => {
//         setIsOpen(false)
//         setHighlightedIndex(-1)
//         setSearchTerm("")
//       }, 200)
//     }
//   }

//   const handleFocus = () => {
//     if (value.length > 0 && filteredSuggestions.length > 0 && !disabled) {
//       setIsOpen(true)
//     }
//   }

//   useEffect(() => {
//     if (highlightedIndex >= 0 && dropdownRef.current) {
//       const highlightedElement = dropdownRef.current.children[highlightedIndex]
//       if (highlightedElement) {
//         highlightedElement.scrollIntoView({
//           block: 'nearest',
//           behavior: 'smooth'
//         })
//       }
//     }
//   }, [highlightedIndex])

//   return (
//     <div className="relative">
//       {label && (
//         <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">
//           {label}
//           {error && <span className="text-red-500 ml-1">*</span>}
//         </label>
//       )}
//       <div className="relative">
//         <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
//           error ? 'text-red-400' : 
//           disabled ? 'text-slate-300' : 
//           'text-slate-400'
//         }`}>
//           <Icon className={iconSizes[size]} />
//         </div>
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
//           value={searchTerm || value}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           onBlur={handleBlur}
//           onFocus={handleFocus}
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
//           style={{
//             boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
//           }}
//           onMouseDown={handleMouseDown}
//         >
//           <div className="max-h-80 overflow-y-auto">
//             <div className="py-1" ref={dropdownRef}>
//               {filteredSuggestions.map((suggestion, index) => {
//                 const isHighlighted = index === highlightedIndex
//                 const searchLower = (searchTerm || value).toLowerCase()
//                 const suggestionLower = suggestion.toLowerCase()
//                 const isExactMatch = suggestionLower === searchLower
//                 const startsWithMatch = suggestionLower.startsWith(searchLower)
                
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
//                         {startsWithMatch && !isExactMatch && (
//                           <div className="h-2 w-2 bg-blue-400 rounded-full" />
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
            
//             <div className="border-t border-slate-100 px-4 py-2 bg-slate-50">
//               <div className="text-xs text-slate-500 flex items-center justify-between">
//                 <span>{filteredSuggestions.length} suggestions</span>
//                 <div className="flex items-center gap-2">
//                   <div className="flex items-center gap-1">
//                     <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-800 bg-slate-200 border border-slate-300 rounded">↑↓</kbd>
//                     <span>navigate</span>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <kbd className="px-1.5 py-0.5 text-xs font-semibold text-slate-800 bg-slate-200 border border-slate-300 rounded">↵</kbd>
//                     <span>select</span>
//                   </div>
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
//   )
// }

// const TreatmentCard = ({ 
//   treatment, 
//   onUpdate, 
//   onRemove, 
//   onDuplicate, 
//   canRemove, 
//   isSelected, 
//   onToggleSelect 
// }) => {
//   const [isEditing, setIsEditing] = useState(false)
//   const [editedName, setEditedName] = useState(treatment.name)
//   const [errors, setErrors] = useState({})

//   const validateBiomarker = (biomarker, index) => {
//     const newErrors = { ...errors }
    
//     if (!biomarker.name.trim()) {
//       newErrors[`name-${index}`] = "Biomarker name is required"
//     } else if (!availableBiomarkers.includes(biomarker.name.trim())) {
//       newErrors[`name-${index}`] = "Biomarker not found in database"
//     } else {
//       delete newErrors[`name-${index}`]
//     }
    
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const getBiomarkerValue = (biomarkerName, condition) => {
//     const biomarker = biomarkerDatabase[biomarkerName]
//     if (!biomarker) return null
//     return biomarker[condition] || null
//   }

//   const handleSaveName = () => {
//     if (editedName.trim()) {
//       onUpdate(treatment.id, { ...treatment, name: editedName.trim() })
//       setIsEditing(false)
//     }
//   }

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSaveName()
//     } else if (e.key === 'Escape') {
//       setEditedName(treatment.name)
//       setIsEditing(false)
//     }
//   }

//   const handleConditionChange = (condition) => {
//     onUpdate(treatment.id, { ...treatment, condition })
//   }

//   return (
//     <div className={`bg-white rounded-xl p-6 border-2 transition-all duration-300 shadow-sm hover:shadow-md min-w-0 ${
//       isSelected 
//         ? 'border-blue-300 bg-blue-50/30 ring-2 ring-blue-100' 
//         : 'border-slate-200 hover:border-slate-300'
//     }`}>
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3 flex-1 min-w-0">
//           <input
//             type="checkbox"
//             checked={isSelected}
//             onChange={(e) => onToggleSelect(treatment.id, e.target.checked)}
//             className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 flex-shrink-0"
//           />
          
//           {isEditing ? (
//             <div className="flex items-center gap-2 flex-1 min-w-0">
//               <input
//                 type="text"
//                 value={editedName}
//                 onChange={(e) => setEditedName(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 className="text-lg font-bold bg-white border-2 border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 flex-1 min-w-0"
//                 autoFocus
//               />
//               <button
//                 onClick={handleSaveName}
//                 className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors flex-shrink-0"
//               >
//                 <Save className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={() => {
//                   setEditedName(treatment.name)
//                   setIsEditing(false)
//                 }}
//                 className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors flex-shrink-0"
//               >
//                 <X className="h-4 w-4" />
//               </button>
//             </div>
//           ) : (
//             <div className="flex items-center gap-2 flex-1 group min-w-0">
//               <h3 className="text-lg font-bold text-slate-800 truncate">{treatment.name}</h3>
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="p-1 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
//                 title="Edit name"
//               >
//                 <Edit3 className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>

//         <div className="flex items-center gap-2 flex-shrink-0">
//           <button
//             onClick={() => onDuplicate(treatment.id)}
//             className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//             title="Duplicate treatment"
//           >
//             <Copy className="h-4 w-4" />
//           </button>
//           {canRemove && (
//             <button
//               onClick={() => onRemove(treatment.id)}
//               className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//               title="Remove treatment"
//             >
//               <Trash2 className="h-4 w-4" />
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Condition Selector */}
//       <div className="mb-6">
//         <label className="block text-sm font-semibold text-slate-700 mb-2">Treatment Condition</label>
//         <select
//           value={treatment.condition || "Aging"}
//           onChange={(e) => handleConditionChange(e.target.value)}
//           className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//         >
//           <option value="Aging">Aging</option>
//           <option value="Pigmentation">Pigmentation</option>
//           <option value="Wrinkles">Wrinkles</option>
//         </select>
//       </div>

//       {/* Stats */}
//       <div className="mb-4">
//         <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
//           {treatment.biomarkers.filter(b => b.name.trim()).length} biomarkers
//         </span>
//       </div>

//       {/* Biomarkers */}
//       <div className="space-y-4">
//         {treatment.biomarkers.map((biomarker, index) => {
//           const value = getBiomarkerValue(biomarker.name, treatment.condition || "Aging")
          
//           return (
//             <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
//               <div className="flex items-start gap-3">
//                 <div className="flex-1">
//                   <AutocompleteInput
//                     id={`biomarker-${treatment.id}-${index}`}
//                     placeholder="Enter biomarker name"
//                     value={biomarker.name}
//                     onChange={(value) => {
//                       const updated = { ...treatment }
//                       updated.biomarkers[index].name = value
//                       onUpdate(treatment.id, updated)
//                       validateBiomarker({ ...biomarker, name: value }, index)
//                     }}
//                     suggestions={availableBiomarkers}
//                     icon={FlaskConical}
//                     size="small"
//                     error={errors[`name-${index}`]}
//                   />
//                   {biomarker.name && value !== null && (
//                     <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
//                       <div className="text-xs text-blue-600 font-medium">Database Value</div>
//                       <div className="text-sm font-mono text-blue-800">{value.toFixed(6)}</div>
//                     </div>
//                   )}
//                   {biomarker.name && value === null && (
//                     <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
//                       <div className="text-xs text-amber-600 font-medium">No data available for this condition</div>
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => {
//                     const updated = { ...treatment }
//                     updated.biomarkers.splice(index, 1)
//                     onUpdate(treatment.id, updated)
//                   }}
//                   className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors mt-0.5 flex-shrink-0"
//                   title="Remove biomarker"
//                 >
//                   <X className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           )
//         })}
        
//         <button
//           onClick={() => {
//             const updated = { ...treatment }
//             updated.biomarkers.push({ name: "" })
//             onUpdate(treatment.id, updated)
//           }}
//           className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 group"
//         >
//           <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
//           <span className="font-medium">Add Biomarker</span>
//         </button>
//       </div>
//     </div>
//   )
// }

// const ComparisonChart = ({ 
//   treatments, 
//   selectedTreatments, 
//   sortBy, 
//   showValues, 
//   filterBiomarker 
// }) => {
//   const getAllBiomarkers = () => {
//     const allBiomarkers = new Set()
//     treatments
//       .filter(t => selectedTreatments.includes(t.id))
//       .forEach(treatment => {
//         treatment.biomarkers.forEach(biomarker => {
//           if (biomarker.name.trim() && availableBiomarkers.includes(biomarker.name.trim())) {
//             allBiomarkers.add(biomarker.name.trim())
//           }
//         })
//       })
    
//     let biomarkers = Array.from(allBiomarkers)
    
//     if (filterBiomarker) {
//       biomarkers = biomarkers.filter(b => 
//         b.toLowerCase().includes(filterBiomarker.toLowerCase())
//       )
//     }
    
//     if (sortBy === 'alphabetical') {
//       biomarkers.sort()
//     } else if (sortBy === 'maxValue') {
//       biomarkers.sort((a, b) => getMaxValue(b) - getMaxValue(a))
//     } else if (sortBy === 'variance') {
//       biomarkers.sort((a, b) => getBiomarkerVariance(b) - getBiomarkerVariance(a))
//     }
    
//     return biomarkers
//   }

//   const getMaxValue = (biomarkerName) => {
//     let max = 0
//     treatments
//       .filter(t => selectedTreatments.includes(t.id))
//       .forEach(treatment => {
//         const value = biomarkerDatabase[biomarkerName]?.[treatment.condition || "Aging"]
//         if (value) {
//           max = Math.max(max, value)
//         }
//       })
//     return max
//   }

//   const getBiomarkerVariance = (biomarkerName) => {
//     const values = []
//     treatments
//       .filter(t => selectedTreatments.includes(t.id))
//       .forEach(treatment => {
//         const value = biomarkerDatabase[biomarkerName]?.[treatment.condition || "Aging"]
//         if (value) {
//           values.push(value)
//         }
//       })
    
//     if (values.length < 2) return 0
    
//     const mean = values.reduce((a, b) => a + b, 0) / values.length
//     const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
//     return variance
//   }

//   const getBiomarkerValue = (treatmentId, biomarkerName) => {
//     const treatment = treatments.find(t => t.id === treatmentId)
//     if (!treatment) return null
//     return biomarkerDatabase[biomarkerName]?.[treatment.condition || "Aging"] || 0
//   }

//   const getBiomarkerColor = (treatmentIndex) => {
//     const colors = [
//       'from-blue-500 to-blue-600',
//       'from-emerald-500 to-emerald-600',
//       'from-purple-500 to-purple-600',
//       'from-orange-500 to-orange-600',
//       'from-red-500 to-red-600',
//       'from-indigo-500 to-indigo-600',
//       'from-pink-500 to-pink-600',
//       'from-teal-500 to-teal-600'
//     ]
//     return colors[treatmentIndex % colors.length]
//   }

//   const biomarkers = getAllBiomarkers()

//   if (biomarkers.length === 0) {
//     return (
//       <div className="text-center py-16 text-slate-500">
//         <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
//         <p className="text-xl font-medium mb-2">No biomarkers to compare</p>
//         <p className="text-sm">Add biomarkers to your treatments to see the comparison</p>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {biomarkers.map((biomarkerName) => {
//         const maxValue = getMaxValue(biomarkerName)
//         const variance = getBiomarkerVariance(biomarkerName)
        
//         return (
//           <div key={biomarkerName} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h4 className="font-bold text-slate-800 text-xl">{biomarkerName}</h4>
//                 <div className="flex items-center gap-6 mt-2">
//                   <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
//                     Max: <span className="font-mono">{maxValue.toFixed(3)}</span>
//                   </span>
//                   <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
//                     Variance: <span className="font-mono">{variance.toFixed(3)}</span>
//                   </span>
//                 </div>
//               </div>
//               {variance > 1 && (
//                 <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-full border border-amber-200">
//                   <AlertCircle className="h-4 w-4" />
//                   <span className="text-sm font-medium">High variance</span>
//                 </div>
//               )}
//             </div>
            
//             <div className="space-y-4">
//               {selectedTreatments.map((treatmentId, index) => {
//                 const treatment = treatments.find(t => t.id === treatmentId)
//                 const value = getBiomarkerValue(treatmentId, biomarkerName)
//                 const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
//                 const colorClass = getBiomarkerColor(index)
                
//                 return (
//                   <div key={treatmentId} className="group">
//                     <div className="flex items-center gap-4 mb-2">
//                       <div className="w-36 text-sm font-semibold text-slate-700 truncate">
//                         {treatment?.name}
//                       </div>
//                       <div className="flex-1 bg-slate-200 rounded-full h-10 relative overflow-hidden">
//                         <div
//                           className={`bg-gradient-to-r ${colorClass} h-10 rounded-full transition-all duration-700 ease-out flex items-center justify-between px-4 shadow-sm`}
//                           style={{ width: `${Math.max(percentage, 10)}%` }}
//                         >
//                           {showValues && percentage >= 25 && (
//                             <span className="text-white text-sm font-bold">
//                               {value.toFixed(3)}
//                             </span>
//                           )}
//                         </div>
//                         {(percentage < 25 && showValues) && (
//                           <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 text-sm font-mono">
//                             {value.toFixed(3)}
//                           </div>
//                         )}
//                       </div>
//                       <div className="w-20 text-right">
//                         <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
//                           {percentage.toFixed(1)}%
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// export default function BiomarkerComparison() {
//   const [treatments, setTreatments] = useState([
//     {
//       id: 1,
//       name: "Treatment 1",
//       condition: "Aging",
//       biomarkers: [
//         { name: "IL-6" },
//         { name: "MCP-1" },
//         { name: "Angiogenin" }
//       ]
//     }
//   ])
//   const [selectedTreatments, setSelectedTreatments] = useState([1])
//   const [showComparison, setShowComparison] = useState(false)
//   const [sortBy, setSortBy] = useState('maxValue')
//   const [showValues, setShowValues] = useState(true)
//   const [filterBiomarker, setFilterBiomarker] = useState('')
//   const [currentPage, setCurrentPage] = useState(0)

//   const treatmentsPerPage = 3
//   const totalPages = Math.ceil(treatments.length / treatmentsPerPage)
//   const currentTreatments = treatments.slice(
//     currentPage * treatmentsPerPage,
//     (currentPage + 1) * treatmentsPerPage
//   )

//   const addTreatment = () => {
//     const newId = Math.max(...treatments.map(t => t.id)) + 1
//     setTreatments([...treatments, {
//       id: newId,
//       name: `Treatment ${newId}`,
//       condition: "Aging",
//       biomarkers: []
//     }])
    
//     // Navigate to the page containing the new treatment
//     const newTreatmentPage = Math.floor(treatments.length / treatmentsPerPage)
//     setCurrentPage(newTreatmentPage)
//   }

//   const removeTreatment = (id) => {
//     if (treatments.length > 1) {
//       setTreatments(treatments.filter(t => t.id !== id))
//       setSelectedTreatments(selectedTreatments.filter(t => t !== id))
      
//       // Adjust current page if necessary
//       const newTotalPages = Math.ceil((treatments.length - 1) / treatmentsPerPage)
//       if (currentPage >= newTotalPages && newTotalPages > 0) {
//         setCurrentPage(newTotalPages - 1)
//       }
//     }
//   }

//   const updateTreatment = (id, updatedTreatment) => {
//     setTreatments(treatments.map(t => 
//       t.id === id ? updatedTreatment : t
//     ))
//   }

//   const duplicateTreatment = (id) => {
//     const originalTreatment = treatments.find(t => t.id === id)
//     if (originalTreatment) {
//       const newId = Math.max(...treatments.map(t => t.id)) + 1
//       const duplicatedTreatment = {
//         ...originalTreatment,
//         id: newId,
//         name: `${originalTreatment.name} (Copy)`,
//         biomarkers: [...originalTreatment.biomarkers]
//       }
//       setTreatments([...treatments, duplicatedTreatment])
//       setSelectedTreatments([...selectedTreatments, newId])
      
//       // Navigate to the page containing the duplicated treatment
//       const newTreatmentPage = Math.floor(treatments.length / treatmentsPerPage)
//       setCurrentPage(newTreatmentPage)
//     }
//   }

//   const toggleTreatmentSelection = (id, selected) => {
//     if (selected) {
//       setSelectedTreatments([...selectedTreatments, id])
//     } else {
//       setSelectedTreatments(selectedTreatments.filter(t => t !== id))
//     }
//   }

//   const exportData = () => {
//     const exportData = {
//       treatments,
//       metadata: {
//         exportDate: new Date().toISOString(),
//         version: "1.0",
//         totalTreatments: treatments.length,
//         totalBiomarkers: treatments.reduce((acc, t) => acc + t.biomarkers.length, 0)
//       }
//     }
//     const dataStr = JSON.stringify(exportData, null, 2)
//     const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
//     const exportFileDefaultName = `treatment-comparison-${new Date().toISOString().split('T')[0]}.json`
//     const linkElement = document.createElement('a')
//     linkElement.setAttribute('href', dataUri)
//     linkElement.setAttribute('download', exportFileDefaultName)
//     linkElement.click()
//   }

//   const importData = (event) => {
//     const file = event.target.files[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         try {
//           const imported = JSON.parse(e.target.result)
//           const treatmentsData = imported.treatments || imported
          
//           if (Array.isArray(treatmentsData) && treatmentsData.length > 0) {
//             setTreatments(treatmentsData)
//             setSelectedTreatments(treatmentsData.map(t => t.id))
//             setCurrentPage(0)
//           } else {
//             throw new Error("Invalid data format")
//           }
//         } catch (error) {
//           alert('Error importing file. Please check the format and try again.')
//         }
//       }
//       reader.readAsText(file)
//     }
//     event.target.value = ''
//   }

//   const clearAllData = () => {
//     if (confirm('Are you sure you want to clear all treatment data? This action cannot be undone.')) {
//       setTreatments([{
//         id: 1,
//         name: "Treatment 1",
//         condition: "Aging",
//         biomarkers: []
//       }])
//       setSelectedTreatments([1])
//       setCurrentPage(0)
//     }
//   }

//   const selectAllTreatments = () => {
//     setSelectedTreatments(treatments.map(t => t.id))
//   }

//   const deselectAllTreatments = () => {
//     setSelectedTreatments([])
//   }

//   const getComparisonStats = () => {
//     const selectedCount = selectedTreatments.length
//     const totalBiomarkers = new Set()
    
//     treatments
//       .filter(t => selectedTreatments.includes(t.id))
//       .forEach(treatment => {
//         treatment.biomarkers.forEach(biomarker => {
//           if (biomarker.name.trim() && availableBiomarkers.includes(biomarker.name.trim())) {
//             totalBiomarkers.add(biomarker.name.trim())
//           }
//         })
//       })

//     return {
//       selectedTreatments: selectedCount,
//       uniqueBiomarkers: totalBiomarkers.size,
//       totalDataPoints: treatments
//         .filter(t => selectedTreatments.includes(t.id))
//         .reduce((acc, t) => acc + t.biomarkers.filter(b => b.name.trim() && availableBiomarkers.includes(b.name.trim())).length, 0)
//     }
//   }

//   const stats = getComparisonStats()

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
//       <div className="container mx-auto px-4 py-8">
//         {/* Page Header */}
//         <div className="mb-8">
//           <div className="flex items-center gap-4 mb-6">
//             <button
//               onClick={() => window.history.back()}
//               className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Back
//             </button>
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
//                 <Beaker className="h-8 w-8 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold text-slate-800">Treatment Comparison</h1>
//                 <p className="text-slate-600">Compare biomarker profiles across different treatments</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Control Panel */}
//         <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
//           <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
//             <div className="flex gap-3 flex-wrap">
//               <button
//                 onClick={addTreatment}
//                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
//               >
//                 <Plus className="h-4 w-4" />
//                 Add Treatment
//               </button>
//               <button
//                 onClick={() => setShowComparison(!showComparison)}
//                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
//               >
//                 <BarChart3 className="h-4 w-4" />
//                 {showComparison ? 'Hide' : 'Show'} Comparison
//               </button>
//               {selectedTreatments.length > 0 && (
//                 <button
//                   onClick={deselectAllTreatments}
//                   className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
//                 >
//                   <EyeOff className="h-4 w-4" />
//                   Deselect All
//                 </button>
//               )}
//               {selectedTreatments.length < treatments.length && (
//                 <button
//                   onClick={selectAllTreatments}
//                   className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
//                 >
//                   <Eye className="h-4 w-4" />
//                   Select All
//                 </button>
//               )}
//             </div>
            
//             <div className="flex gap-3">
//               <button
//                 onClick={exportData}
//                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
//               >
//                 <Download className="h-4 w-4" />
//                 Export
//               </button>
//               <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-sm hover:shadow-md font-medium cursor-pointer transform hover:scale-105">
//                 <Upload className="h-4 w-4" />
//                 Import
//                 <input
//                   type="file"
//                   accept=".json"
//                   onChange={importData}
//                   className="hidden"
//                 />
//               </label>
//               <button
//                 onClick={clearAllData}
//                 className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
//               >
//                 <RefreshCw className="h-4 w-4" />
//                 Clear All
//               </button>
//             </div>
//           </div>

//           {/* Stats Dashboard */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
//               <div className="flex items-center gap-3">
//                 <Database className="h-8 w-8 text-slate-600" />
//                 <div>
//                   <div className="text-2xl font-bold text-slate-800">{treatments.length}</div>
//                   <div className="text-sm text-slate-600">Total Treatments</div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
//               <div className="flex items-center gap-3">
//                 <Target className="h-8 w-8 text-blue-600" />
//                 <div>
//                   <div className="text-2xl font-bold text-blue-600">{stats.selectedTreatments}</div>
//                   <div className="text-sm text-blue-600">Selected for Comparison</div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
//               <div className="flex items-center gap-3">
//                 <Activity className="h-8 w-8 text-green-600" />
//                 <div>
//                   <div className="text-2xl font-bold text-green-600">{stats.uniqueBiomarkers}</div>
//                   <div className="text-sm text-green-600">Unique Biomarkers</div>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
//               <div className="flex items-center gap-3">
//                 <FileText className="h-8 w-8 text-purple-600" />
//                 <div>
//                   <div className="text-2xl font-bold text-purple-600">{stats.totalDataPoints}</div>
//                   <div className="text-sm text-purple-600">Data Points</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Treatment Cards with Horizontal Layout */}
//         <div className="space-y-6 mb-8">
//           <div className="flex items-center justify-between">
//             <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
//               <Settings className="h-5 w-5" />
//               Treatment Configuration
//             </h2>
            
//             {/* Pagination Controls */}
//             {totalPages > 1 && (
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
//                   disabled={currentPage === 0}
//                   className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </button>
//                 <span className="px-3 py-1 text-sm text-slate-600 bg-slate-100 rounded-lg">
//                   {currentPage + 1} of {totalPages}
//                 </span>
//                 <button
//                   onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
//                   disabled={currentPage === totalPages - 1}
//                   className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Horizontal Treatment Cards Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//             {currentTreatments.map((treatment) => (
//               <TreatmentCard
//                 key={treatment.id}
//                 treatment={treatment}
//                 onUpdate={updateTreatment}
//                 onRemove={removeTreatment}
//                 onDuplicate={duplicateTreatment}
//                 canRemove={treatments.length > 1}
//                 isSelected={selectedTreatments.includes(treatment.id)}
//                 onToggleSelect={toggleTreatmentSelection}
//               />
//             ))}
//           </div>

//           {/* Show total treatments info */}
//           <div className="text-center text-sm text-slate-500">
//             Showing {currentTreatments.length} of {treatments.length} treatments
//           </div>
//         </div>

//         {/* Enhanced Comparison View */}
//         {showComparison && selectedTreatments.length > 0 && (
//           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
//             {/* Comparison Header */}
//             <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-6 border-b border-slate-200">
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <TrendingUp className="h-6 w-6 text-blue-600" />
//                   <div>
//                     <h3 className="text-2xl font-bold text-slate-800">Treatment Comparison</h3>
//                     <p className="text-sm text-slate-600">
//                       Comparing {stats.selectedTreatments} treatments across {stats.uniqueBiomarkers} biomarkers
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Comparison Controls */}
//               <div className="flex flex-wrap items-center gap-4">
//                 <div className="flex items-center gap-2">
//                   <Filter className="h-4 w-4 text-slate-500" />
//                   <input
//                     type="text"
//                     placeholder="Filter biomarkers..."
//                     value={filterBiomarker}
//                     onChange={(e) => setFilterBiomarker(e.target.value)}
//                     className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                   />
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <SortAsc className="h-4 w-4 text-slate-500" />
//                   <select
//                     value={sortBy}
//                     onChange={(e) => setSortBy(e.target.value)}
//                     className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                   >
//                     <option value="maxValue">Sort by Max Value</option>
//                     <option value="variance">Sort by Variance</option>
//                     <option value="alphabetical">Sort Alphabetically</option>
//                   </select>
//                 </div>
                
//                 <button
//                   onClick={() => setShowValues(!showValues)}
//                   className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     showValues 
//                       ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
//                       : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                   }`}
//                 >
//                   {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
//                   Show Values
//                 </button>
//               </div>
//             </div>
            
//             {/* Comparison Chart */}
//             <div className="p-6">
//               {selectedTreatments.length > 1 ? (
//                 <ComparisonChart 
//                   treatments={treatments}
//                   selectedTreatments={selectedTreatments}
//                   sortBy={sortBy}
//                   showValues={showValues}
//                   filterBiomarker={filterBiomarker}
//                 />
//               ) : (
//                 <div className="text-center py-16 text-slate-500">
//                   <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
//                   <p className="text-xl font-medium mb-2">Select at least 2 treatments to compare</p>
//                   <p className="text-sm">Use the checkboxes on treatment cards to select them for comparison</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }




import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Beaker, Database, Target, Activity, Users, Plus, 
  BarChart3, Search, Eye, EyeOff, Download, Upload, RefreshCw,
  ChevronLeft, ChevronRight, Settings, TrendingUp, Filter, SortAsc
} from 'lucide-react';

// Import components
import TreatmentCard from './TreatmentCard.jsx';
import ComparisonChart from './ComparisonChart.jsx';
import SearchInterface from './SearchInterface.jsx';
import BiomarkerDataModal from './BiomarkerDataModal.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import ApiService from '../services/api.js';

const BiomarkerComparison = () => {
  // State management
  const [treatments, setTreatments] = useState([
    {
      id: 1,
      name: "Treatment 1",
      condition: "Aging",
      biomarkers: [
        { name: "IL-6" },
        { name: "MCP-1" },
        { name: "Angiogenin" }
      ]
    }
  ]);
  
  const [selectedTreatments, setSelectedTreatments] = useState([1]);
  const [showComparison, setShowComparison] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState('maxValue');
  const [showValues, setShowValues] = useState(true);
  const [filterBiomarker, setFilterBiomarker] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  
  // Data state
  const [availableBiomarkers, setAvailableBiomarkers] = useState([]);
  const [availableConditions, setAvailableConditions] = useState(['Aging', 'Pigmentation', 'Wrinkles']);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  
  // Modal state
  const [biomarkerDataModal, setBiomarkerDataModal] = useState({
    isOpen: false,
    biomarker: null,
    condition: null
  });

  const treatmentsPerPage = 3;
  const totalPages = Math.ceil(treatments.length / treatmentsPerPage);
  const currentTreatments = treatments.slice(
    currentPage * treatmentsPerPage,
    (currentPage + 1) * treatmentsPerPage
  );

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setApiError(null);
    
    try {
      // Check API health first
      await ApiService.healthCheck();
      
      const [biomarkersResponse, conditionsResponse] = await Promise.all([
        ApiService.getBiomarkers(),
        ApiService.getConditions()
      ]);

      if (biomarkersResponse.success) {
        setAvailableBiomarkers(biomarkersResponse.biomarkers);
      }

      if (conditionsResponse.success) {
        setAvailableConditions(conditionsResponse.conditions);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setApiError('Failed to connect to the biomarker database. Using fallback data.');
      
      // Fallback to default values if API fails
      setAvailableBiomarkers([
        'IL-6', 'MCP-1', 'Angiogenin', 'IL-8', 'Osteoprotegerin', 'HGF', 
        'TIMP-1', 'IGFBP-2', 'TIMP-2', 'TNF-α', 'Collagen I', 'Elastin', 
        'Hyaluronic Acid', 'Melanin', 'Tyrosinase'
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Treatment management functions
  const addTreatment = () => {
    const newId = Math.max(...treatments.map(t => t.id)) + 1;
    setTreatments([...treatments, {
      id: newId,
      name: `Treatment ${newId}`,
      condition: availableConditions[0] || "Aging",
      biomarkers: []
    }]);
    
    const newTreatmentPage = Math.floor(treatments.length / treatmentsPerPage);
    setCurrentPage(newTreatmentPage);
  };

  const removeTreatment = (id) => {
    if (treatments.length > 1) {
      setTreatments(treatments.filter(t => t.id !== id));
      setSelectedTreatments(selectedTreatments.filter(t => t !== id));
      
      const newTotalPages = Math.ceil((treatments.length - 1) / treatmentsPerPage);
      if (currentPage >= newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages - 1);
      }
    }
  };

  const updateTreatment = (id, updatedTreatment) => {
    setTreatments(treatments.map(t => 
      t.id === id ? updatedTreatment : t
    ));
  };

  const duplicateTreatment = (id) => {
    const originalTreatment = treatments.find(t => t.id === id);
    if (originalTreatment) {
      const newId = Math.max(...treatments.map(t => t.id)) + 1;
      const duplicatedTreatment = {
        ...originalTreatment,
        id: newId,
        name: `${originalTreatment.name} (Copy)`,
        biomarkers: [...originalTreatment.biomarkers]
      };
      setTreatments([...treatments, duplicatedTreatment]);
      setSelectedTreatments([...selectedTreatments, newId]);
      
      const newTreatmentPage = Math.floor(treatments.length / treatmentsPerPage);
      setCurrentPage(newTreatmentPage);
    }
  };

  const toggleTreatmentSelection = (id, selected) => {
    if (selected) {
      setSelectedTreatments([...selectedTreatments, id]);
    } else {
      setSelectedTreatments(selectedTreatments.filter(t => t !== id));
    }
  };

  const selectAllTreatments = () => {
    setSelectedTreatments(treatments.map(t => t.id));
  };

  const deselectAllTreatments = () => {
    setSelectedTreatments([]);
  };

  // Data management functions
  const exportData = () => {
    const exportData = {
      treatments,
      metadata: {
        exportDate: new Date().toISOString(),
        version: "2.0",
        totalTreatments: treatments.length,
        totalBiomarkers: treatments.reduce((acc, t) => acc + t.biomarkers.length, 0),
        selectedTreatments: selectedTreatments
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `biomarker-comparison-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          const treatmentsData = imported.treatments || imported;
          
          if (Array.isArray(treatmentsData) && treatmentsData.length > 0) {
            setTreatments(treatmentsData);
            setSelectedTreatments(imported.metadata?.selectedTreatments || treatmentsData.map(t => t.id));
            setCurrentPage(0);
          } else {
            throw new Error("Invalid data format");
          }
        } catch (error) {
          alert('Error importing file. Please check the format and try again.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all treatment data? This action cannot be undone.')) {
      setTreatments([{
        id: 1,
        name: "Treatment 1",
        condition: availableConditions[0] || "Aging",
        biomarkers: []
      }]);
      setSelectedTreatments([1]);
      setCurrentPage(0);
    }
  };

  // Biomarker data modal functions
  const handleViewBiomarkerData = (biomarker, condition) => {
    setBiomarkerDataModal({
      isOpen: true,
      biomarker,
      condition
    });
  };

  const closeBiomarkerDataModal = () => {
    setBiomarkerDataModal({
      isOpen: false,
      biomarker: null,
      condition: null
    });
  };

  // Statistics calculation
  const getComparisonStats = () => {
    const selectedCount = selectedTreatments.length;
    const totalBiomarkers = new Set();
    
    treatments
      .filter(t => selectedTreatments.includes(t.id))
      .forEach(treatment => {
        treatment.biomarkers.forEach(biomarker => {
          if (biomarker.name.trim()) {
            totalBiomarkers.add(biomarker.name.trim());
          }
        })
      });

    return {
      selectedTreatments: selectedCount,
      uniqueBiomarkers: totalBiomarkers.size,
      totalDataPoints: treatments
        .filter(t => selectedTreatments.includes(t.id))
        .reduce((acc, t) => acc + t.biomarkers.filter(b => b.name.trim()).length, 0)
    };
  };

  const stats = getComparisonStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-lg font-medium text-slate-700 mt-4">Loading biomarker database...</p>
          <p className="text-sm text-slate-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Beaker className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Biomarker Comparison Tool</h1>
                <p className="text-slate-600">Compare biomarker profiles with real-time database integration</p>
              </div>
            </div>
          </div>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <Database className="h-5 w-5" />
              <span className="font-medium">Database Connection Issue</span>
            </div>
            <p className="text-amber-700 mt-1 text-sm">{apiError}</p>
          </div>
        )}

        {/* Control Panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={addTreatment}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                Add Treatment
              </button>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <BarChart3 className="h-4 w-4" />
                {showComparison ? 'Hide' : 'Show'} Comparison
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <Search className="h-4 w-4" />
                {showSearch ? 'Hide' : 'Show'} Search
              </button>
              {selectedTreatments.length > 0 && (
                <button
                  onClick={deselectAllTreatments}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  <EyeOff className="h-4 w-4" />
                  Deselect All
                </button>
              )}
              {selectedTreatments.length < treatments.length && (
                <button
                  onClick={selectAllTreatments}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  <Eye className="h-4 w-4" />
                  Select All
                </button>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-sm hover:shadow-md font-medium cursor-pointer transform hover:scale-105">
                <Upload className="h-4 w-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-slate-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-800">{treatments.length}</div>
                  <div className="text-sm text-slate-600">Total Treatments</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.selectedTreatments}</div>
                  <div className="text-sm text-blue-600">Selected for Comparison</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.uniqueBiomarkers}</div>
                  <div className="text-sm text-green-600">Unique Biomarkers</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">{availableBiomarkers.length}</div>
                  <div className="text-sm text-purple-600">Database Biomarkers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        {showSearch && (
          <div className="mb-8">
            <SearchInterface 
              availableBiomarkers={availableBiomarkers}
              availableConditions={availableConditions}
            />
          </div>
        )}

        {/* Treatment Cards */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Treatment Configuration
            </h2>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 text-sm text-slate-600 bg-slate-100 rounded-lg">
                  {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Treatment Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentTreatments.map((treatment) => (
              <TreatmentCard
                key={treatment.id}
                treatment={treatment}
                onUpdate={updateTreatment}
                onRemove={removeTreatment}
                onDuplicate={duplicateTreatment}
                canRemove={treatments.length > 1}
                isSelected={selectedTreatments.includes(treatment.id)}
                onToggleSelect={toggleTreatmentSelection}
                availableBiomarkers={availableBiomarkers}
                availableConditions={availableConditions}
                onViewBiomarkerData={handleViewBiomarkerData}
              />
            ))}
          </div>

          {/* Show total treatments info */}
          <div className="text-center text-sm text-slate-500">
            Showing {currentTreatments.length} of {treatments.length} treatments
          </div>
        </div>

        {/* Enhanced Comparison View */}
        {showComparison && selectedTreatments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Comparison Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Treatment Comparison</h3>
                    <p className="text-sm text-slate-600">
                      Real-time analysis of {stats.selectedTreatments} treatments across {stats.uniqueBiomarkers} biomarkers
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Comparison Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter biomarkers..."
                    value={filterBiomarker}
                    onChange={(e) => setFilterBiomarker(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-slate-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="maxValue">Sort by Max Value</option>
                    <option value="variance">Sort by Variance</option>
                    <option value="alphabetical">Sort Alphabetically</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setShowValues(!showValues)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showValues 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {showValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Show Values
                </button>
              </div>
            </div>
            
            {/* Comparison Chart */}
            <div className="p-6">
              {selectedTreatments.length > 1 ? (
                <ComparisonChart 
                  treatments={treatments}
                  selectedTreatments={selectedTreatments}
                  sortBy={sortBy}
                  showValues={showValues}
                  filterBiomarker={filterBiomarker}
                />
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium mb-2">Select at least 2 treatments to compare</p>
                  <p className="text-sm">Use the checkboxes on treatment cards to select them for comparison</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Biomarker Data Modal */}
        <BiomarkerDataModal
          biomarker={biomarkerDataModal.biomarker}
          condition={biomarkerDataModal.condition}
          isOpen={biomarkerDataModal.isOpen}
          onClose={closeBiomarkerDataModal}
        />
      </div>
    </div>
  );
};

export default BiomarkerComparison;
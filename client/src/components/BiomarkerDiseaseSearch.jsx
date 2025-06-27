// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { Search, ChevronDown, Activity, Stethoscope, FlaskConical, Loader2, Microscope } from "lucide-react"

// // Import JSON data
// import biomarkersData from "../assets/data/biomarkers.json"
// import diseasesData from "../assets/data/unique_disease.json"
// import symptomsData from "../assets/data/unique_symptoms.json"

// const AutocompleteInput = ({ id, label, placeholder, value, onChange, suggestions, onKeyDown, icon: Icon }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [filteredSuggestions, setFilteredSuggestions] = useState([])
//   const [highlightedIndex, setHighlightedIndex] = useState(-1)
//   const inputRef = useRef(null)
//   const listRef = useRef(null)
//   const mouseDownRef = useRef(false)

//   useEffect(() => {
//     if (value.length > 0) {
//       const filtered = suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
//       setFilteredSuggestions(filtered)
//       setIsOpen(filtered.length > 0)
//     } else {
//       setFilteredSuggestions([])
//       setIsOpen(false)
//     }
//     setHighlightedIndex(-1)
//   }, [value, suggestions])

//   const handleInputChange = (e) => {
//     onChange(e.target.value)
//   }

//   const handleSuggestionClick = (suggestion) => {
//     mouseDownRef.current = false
//     onChange(suggestion)
//     setIsOpen(false)
//     setHighlightedIndex(-1)

//     setTimeout(() => {
//       if (inputRef.current) {
//         inputRef.current.blur()
//       }
//     }, 0)
//   }

//   const handleKeyDown = (e) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault()
//       setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault()
//       setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
//     } else if (e.key === "Enter") {
//       e.preventDefault()
//       if (highlightedIndex >= 0) {
//         onChange(filteredSuggestions[highlightedIndex])
//         setIsOpen(false)
//         setHighlightedIndex(-1)
//       } else {
//         onKeyDown(e)
//       }
//     } else if (e.key === "Escape") {
//       setIsOpen(false)
//       setHighlightedIndex(-1)
//     } else {
//       onKeyDown(e)
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
//     }
//   }, [])

//   const handleBlur = (e) => {
//     if (!mouseDownRef.current) {
//       setIsOpen(false)
//       setHighlightedIndex(-1)
//     }
//   }

//   const handleMouseLeave = () => {
//     mouseDownRef.current = false
//   }

//   useEffect(() => {
//     const handleResize = () => {
//       if (isOpen) {
//         setIsOpen(false)
//         setTimeout(() => setIsOpen(true), 0)
//       }
//     }

//     window.addEventListener("resize", handleResize)

//     return () => {
//       window.removeEventListener("resize", handleResize)
//     }
//   }, [isOpen])

//   return (
//     <div className="relative">
//       <label
//         htmlFor={id}
//         className="block text-sm font-bold text-gray-800 mb-4 tracking-wide uppercase letter-spacing-wide"
//       >
//         {label}
//       </label>
//       <div className="relative">
//         <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500">
//           <Icon className="h-5 w-5" />
//         </div>
//         <input
//           ref={inputRef}
//           id={id}
//           type="text"
//           placeholder={placeholder}
//           className="w-full pl-14 pr-14 py-5 border-2 border-gray-300 rounded-2xl focus:ring-3 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 bg-white shadow-lg hover:shadow-xl text-gray-800 placeholder-gray-500 font-medium text-base"
//           value={value}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           onBlur={handleBlur}
//           onFocus={() => value.length > 0 && setIsOpen(filteredSuggestions.length > 0)}
//           autoComplete="off"
//         />
//         <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-500">
//           <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
//         </div>
//       </div>

//       {isOpen && filteredSuggestions.length > 0 && (
//         <div
//           className="absolute z-[999999] w-full mt-3 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl overflow-visible"
//           style={{
//             maxHeight: "none",
//             position: "absolute",
//             top: "100%",
//             left: 0,
//             right: 0,
//           }}
//           onMouseDown={handleMouseDown}
//           onMouseLeave={handleMouseLeave}
//         >
//           <div className="max-h-96 overflow-y-auto">
//             <ul ref={listRef} className="py-3">
//               {filteredSuggestions.map((suggestion, index) => (
//                 <li
//                   key={index}
//                   className={`px-6 py-4 cursor-pointer transition-all duration-200 font-medium ${
//                     index === highlightedIndex
//                       ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500"
//                       : "text-gray-800 hover:bg-gray-50"
//                   }`}
//                   onClick={() => handleSuggestionClick(suggestion)}
//                   onMouseEnter={() => setHighlightedIndex(index)}
//                 >
//                   <span className="text-sm">{suggestion}</span>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default function BiomarkerDiseaseSearch() {
//   const [activeTab, setActiveTab] = useState("disease")
//   const [biomarkerInput, setBiomarkerInput] = useState("")
//   const [diseaseInput, setDiseaseInput] = useState("")
//   const [symptomInput, setSymptomInput] = useState("")

//   const [loading, setLoading] = useState(false)
//   const [predictions, setPredictions] = useState(null)
//   const [error, setError] = useState(null)

//   const navigate = useNavigate()

//   const tabs = [
//     {
//       id: "disease",
//       label: "Disease Landscape",
//       icon: Activity,
//       description: "Analyze disease-biomarker relationships",
//       color: "emerald",
//     },
//     {
//       id: "symptom",
//       label: "Symptoms Landscape",
//       icon: Stethoscope,
//       description: "Explore symptom-disease correlations",
//       color: "teal",
//     },
//   ]

//   const handleBiomarkerSearch = async () => {
//     if (!biomarkerInput.trim()) {
//       setError("Please enter a biomarker name.")
//       setPredictions(null)
//       return
//     }

//     setLoading(true)
//     setError(null)
//     setPredictions(null)

//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/biomarker_landscape?targetName=${encodeURIComponent(biomarkerInput.trim())}`,
//       )

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Failed to fetch predictions")
//       }

//       const data = await response.json()
//       setPredictions(data)
//       navigate("/network", {
//         state: {
//           biomarker: biomarkerInput,
//           predictions: data,
//         },
//       })
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleDiseaseSearch = async () => {
//     if (!diseaseInput.trim()) {
//       setError("Please enter a disease name.")
//       setPredictions(null)
//       return
//     }

//     setLoading(true)
//     setError(null)
//     setPredictions(null)

//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/disease_landscape?disease=${encodeURIComponent(diseaseInput.trim())}`,
//       )

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Failed to fetch disease data")
//       }

//       const data = await response.json()
//       console.log(data)
//       navigate("/disease-targets", {
//         state: {
//           diseaseName: diseaseInput,
//           data: data,
//         },
//       })
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSymptomSearch = async () => {
//     if (!symptomInput.trim()) {
//       setError("Please enter a disease name for Symptoms analysis.")
//       setPredictions(null)
//       return
//     }

//     setLoading(true)
//     setError(null)
//     setPredictions(null)

//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/symptom?name=${encodeURIComponent(symptomInput.trim())}`,
//       )

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || "Failed to fetch Symptom data")
//       }

//       const data = await response.json()
//       console.log(data)
//       navigate("/symptom-results", {
//         state: {
//           disease: symptomInput,
//           symptomData: data,
//         },
//       })
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getSearchHandler = () => {
//     switch (activeTab) {
//       case "disease":
//         return handleDiseaseSearch
//       case "symptom":
//         return handleSymptomSearch
//       case "biomarker":
//         return handleBiomarkerSearch
//       default:
//         return handleDiseaseSearch
//     }
//   }

//   const getButtonText = () => {
//     switch (activeTab) {
//       case "disease":
//         return "Analyze Disease Landscape"
//       case "symptom":
//         return "Analyze Symptom Patterns"
//       case "biomarker":
//         return "Explore Biomarker Network"
//       default:
//         return "Analyze"
//     }
//   }

//   const getLoadingText = () => {
//     switch (activeTab) {
//       case "disease":
//         return "Analyzing Disease Data..."
//       case "symptom":
//         return "Processing Symptoms..."
//       case "biomarker":
//         return "Mapping Biomarkers..."
//       default:
//         return "Processing..."
//     }
//   }

//   return (
//     <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-visible backdrop-blur-sm">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-gray-50 via-emerald-50 to-teal-50 px-10 py-8 border-b-2 border-gray-200">
//         <div className="flex items-center gap-4 mb-3">
//           <div className="p-3 bg-emerald-100 rounded-2xl">
//             <Microscope className="h-8 w-8 text-emerald-700" />
//           </div>
//           <div>
//             <h2 className="text-3xl font-bold text-gray-900 mb-1">Clinical Research Platform</h2>
//             <p className="text-gray-700 font-medium text-lg">Advanced biomarker-disease relationship analysis</p>
//           </div>
//         </div>
//       </div>

//       {/* Tab Navigation */}
//       <div className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
//         <nav className="flex">
//           {tabs.map((tab) => {
//             const Icon = tab.icon
//             const isActive = activeTab === tab.id
//             return (
//               <button
//                 key={tab.id}
//                 className={`flex-1 py-8 px-8 text-center transition-all duration-300 relative group ${
//                   isActive
//                     ? "bg-white text-emerald-800 shadow-lg border-b-4 border-emerald-500 transform -translate-y-1"
//                     : "text-gray-700 hover:text-gray-900 hover:bg-white/70"
//                 }`}
//                 onClick={() => setActiveTab(tab.id)}
//               >
//                 <div className="flex flex-col items-center space-y-3">
//                   <div
//                     className={`p-3 rounded-xl transition-colors ${
//                       isActive ? "bg-emerald-100" : "bg-gray-200 group-hover:bg-gray-300"
//                     }`}
//                   >
//                     <Icon className={`h-7 w-7 ${isActive ? "text-emerald-700" : "text-gray-600"}`} />
//                   </div>
//                   <span className="font-bold text-base">{tab.label}</span>
//                   <span className="text-sm text-gray-600 hidden sm:block font-medium">{tab.description}</span>
//                 </div>
//               </button>
//             )
//           })}
//         </nav>
//       </div>

//       {/* Tab Content */}
//       <div className="p-10 overflow-visible">
//         {activeTab === "disease" && (
//           <div className="space-y-10">
//             <AutocompleteInput
//               id="disease-search"
//               label="Disease Name"
//               placeholder="Enter disease name (e.g., Rheumatoid Arthritis, Cancer, Psoriasis)"
//               value={diseaseInput}
//               onChange={setDiseaseInput}
//               suggestions={diseasesData}
//               icon={Activity}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleDiseaseSearch()
//               }}
//             />
//           </div>
//         )}

//         {activeTab === "symptom" && (
//           <div className="space-y-10">
//             <AutocompleteInput
//               id="symptom-search"
//               label="Symptom Analysis"
//               placeholder="Enter symptom for analysis (e.g., bleeding, itching, pain, fever)"
//               value={symptomInput}
//               onChange={setSymptomInput}
//               suggestions={symptomsData}
//               icon={Stethoscope}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleSymptomSearch()
//               }}
//             />
//           </div>
//         )}

//         {activeTab === "biomarker" && (
//           <div className="space-y-10">
//             <AutocompleteInput
//               id="biomarker-search"
//               label="Biomarker Target"
//               placeholder="Enter biomarker name (e.g., IL-6, TNF-α, EGFR, VEGF)"
//               value={biomarkerInput}
//               onChange={setBiomarkerInput}
//               suggestions={biomarkersData.biomarkers}
//               icon={FlaskConical}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleBiomarkerSearch()
//               }}
//             />
//           </div>
//         )}

//         {/* Action Button */}
//         <div className="mt-10">
//           <button
//             onClick={getSearchHandler()}
//             disabled={loading}
//             className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:via-emerald-800 hover:to-teal-800 text-white font-bold py-6 px-8 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none text-lg"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center space-x-4">
//                 <Loader2 className="animate-spin h-6 w-6" />
//                 <span className="font-bold">{getLoadingText()}</span>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center space-x-4">
//                 <Search className="h-6 w-6" />
//                 <span className="font-bold">{getButtonText()}</span>
//               </div>
//             )}
//           </button>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mt-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-2xl shadow-lg">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-4">
//                 <p className="text-red-900 font-bold text-base">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }


// "use client"

// import { useState, useRef, useEffect } from "react"
// import {
//   Search,
//   ChevronDown,
//   Activity,
//   Stethoscope,
//   Loader2,
//   Microscope,
//   Sparkles,
//   TrendingUp,
//   Zap,
//   Filter,
//   BookOpen,
//   Database,
//   Shield,
// } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import biomarkersData from "../assets/data/biomarkers.json"
// import diseasesData from "../assets/data/unique_disease.json"
// import symptomsData from "../assets/data/unique_symptoms.json"

// const AutocompleteInput = ({ id, label, placeholder, value, onChange, suggestions, onKeyDown, icon: Icon }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [filteredSuggestions, setFilteredSuggestions] = useState([])
//   const [highlightedIndex, setHighlightedIndex] = useState(-1)
//   const [isFocused, setIsFocused] = useState(false)
//   const inputRef = useRef(null)
//   const listRef = useRef(null)
//   const mouseDownRef = useRef(false)

//   useEffect(() => {
//     if (value.length > 0) {
//       const filtered = suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 10)
//       setFilteredSuggestions(filtered)
//       setIsOpen(filtered.length > 0)
//     } else {
//       setFilteredSuggestions([])
//       setIsOpen(false)
//     }
//     setHighlightedIndex(-1)
//   }, [value, suggestions])

//   const handleInputChange = (e) => {
//     onChange(e.target.value)
//   }

//   const handleSuggestionClick = (suggestion) => {
//     mouseDownRef.current = false
//     onChange(suggestion)
//     setIsOpen(false)
//     setHighlightedIndex(-1)

//     setTimeout(() => {
//       if (inputRef.current) {
//         inputRef.current.blur()
//       }
//     }, 0)
//   }

//   const handleKeyDown = (e) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault()
//       setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault()
//       setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
//     } else if (e.key === "Enter") {
//       e.preventDefault()
//       if (highlightedIndex >= 0) {
//         onChange(filteredSuggestions[highlightedIndex])
//         setIsOpen(false)
//         setHighlightedIndex(-1)
//       } else {
//         onKeyDown(e)
//       }
//     } else if (e.key === "Escape") {
//       setIsOpen(false)
//       setHighlightedIndex(-1)
//     } else {
//       onKeyDown(e)
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
//     }
//   }, [])

//   const handleBlur = (e) => {
//     setIsFocused(false)
//     if (!mouseDownRef.current) {
//       setIsOpen(false)
//       setHighlightedIndex(-1)
//     }
//   }

//   const handleFocus = () => {
//     setIsFocused(true)
//     if (value.length > 0) {
//       setIsOpen(filteredSuggestions.length > 0)
//     }
//   }

//   const handleMouseLeave = () => {
//     mouseDownRef.current = false
//   }

//   return (
//     <div className="relative">
//       <label
//         htmlFor={id}
//         className="block text-base font-bold text-gray-800 mb-4 tracking-wide uppercase letter-spacing-wide"
//       >
//         {label}
//       </label>
//       <div className="relative group">
//         <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-emerald-600 transition-colors">
//           <Icon className="h-5 w-5" />
//         </div>
//         <input
//           ref={inputRef}
//           id={id}
//           type="text"
//           placeholder={placeholder}
//           className={`w-full pl-16 pr-16 py-4 border-3 rounded-3xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 bg-white shadow-xl hover:shadow-2xl text-gray-800 placeholder-gray-500 font-medium text-base ${
//             isFocused ? "border-emerald-500 shadow-2xl" : "border-gray-300"
//           }`}
//           value={value}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           onBlur={handleBlur}
//           onFocus={handleFocus}
//           autoComplete="off"
//         />
//         <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-emerald-600 transition-all duration-300">
//           <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
//         </div>
//         {isFocused && (
//           <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 -z-10 blur-xl transition-opacity duration-300" />
//         )}
//       </div>

//       {isOpen && filteredSuggestions.length > 0 && (
//         <div
//           className="absolute z-[999999] w-full mt-4 bg-white/95 backdrop-blur-lg border-2 border-gray-200 rounded-3xl shadow-2xl overflow-visible"
//           style={{
//             maxHeight: "none",
//             position: "absolute",
//             top: "100%",
//             left: 0,
//             right: 0,
//           }}
//           onMouseDown={handleMouseDown}
//           onMouseLeave={handleMouseLeave}
//         >
//           <div className="max-h-96 overflow-y-auto">
//             <ul ref={listRef} className="py-4">
//               {filteredSuggestions.map((suggestion, index) => (
//                 <li
//                   key={index}
//                   className={`px-6 py-4 cursor-pointer transition-all duration-200 font-medium text-lg ${
//                     index === highlightedIndex
//                       ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 shadow-lg"
//                       : "text-gray-800 hover:bg-gray-50"
//                   }`}
//                   onClick={() => handleSuggestionClick(suggestion)}
//                   onMouseEnter={() => setHighlightedIndex(index)}
//                 >
//                   <div className="flex items-center justify-between">
//                     <span>{suggestion}</span>
//                     {index === highlightedIndex && <TrendingUp className="h-4 w-4 text-emerald-600" />}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default function BiomarkerDiseaseSearch() {
//   const [activeTab, setActiveTab] = useState("disease")
//   const [diseaseInput, setDiseaseInput] = useState("")
//   const [symptomInput, setSymptomInput] = useState("")
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [searchHistory, setSearchHistory] = useState([])

//   const tabs = [
//     {
//       id: "disease",
//       label: "Disease Landscape",
//       icon: Activity,
//       description: "Analyze disease-biomarker relationships",
//       color: "emerald",
//       gradient: "from-emerald-500 to-teal-500",
//     },
//     {
//       id: "symptom",
//       label: "Symptoms Landscape",
//       icon: Stethoscope,
//       description: "Explore symptom-disease correlations",
//       color: "teal",
//       gradient: "from-teal-500 to-cyan-500",
//     },
//   ]

//   const handleDiseaseSearch = async () => {
//     if (!diseaseInput.trim()) {
//       setError("Please enter a disease name.")
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       // Add to search history
//       setSearchHistory((prev) => [{ type: "disease", query: diseaseInput, timestamp: new Date() }, ...prev.slice(0, 4)])

//       // Simulate API call with more realistic timing
//       await new Promise((resolve) => setTimeout(resolve, 2500))
//       console.log("Disease search:", diseaseInput)
//       // Navigate to results page would go here
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSymptomSearch = async () => {
//     if (!symptomInput.trim()) {
//       setError("Please enter a symptom for analysis.")
//       return
//     }

//     setLoading(true)
//     setError(null)

//     try {
//       // Add to search history
//       setSearchHistory((prev) => [{ type: "symptom", query: symptomInput, timestamp: new Date() }, ...prev.slice(0, 4)])

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 2500))
//       console.log("Symptom search:", symptomInput)
//       // Navigate to results page would go here
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const getSearchHandler = () => {
//     switch (activeTab) {
//       case "disease":
//         return handleDiseaseSearch
//       case "symptom":
//         return handleSymptomSearch
//       default:
//         return handleDiseaseSearch
//     }
//   }

//   const getButtonText = () => {
//     switch (activeTab) {
//       case "disease":
//         return "Analyze Disease Landscape"
//       case "symptom":
//         return "Analyze Symptom Patterns"
//       default:
//         return "Analyze"
//     }
//   }

//   const getLoadingText = () => {
//     switch (activeTab) {
//       case "disease":
//         return "Analyzing Disease Data..."
//       case "symptom":
//         return "Processing Symptoms..."
//       default:
//         return "Processing..."
//     }
//   }

//   return (
//     <div className="w-full max-w-4xl bg-white/95 backdrop-blur-lg rounded-4xl shadow-2xl border-2 border-gray-200/50 overflow-visible relative">
//       {/* Floating background elements */}
//       <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200/30 rounded-full blur-xl" />
//       <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-200/30 rounded-full blur-xl" />

//       {/* Header */}
//       <div className="bg-gradient-to-r from-gray-50 via-emerald-50 to-teal-50 px-8 py-6 border-b-2 border-gray-200/50 rounded-t-4xl relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
//         <div className="flex items-center gap-6 mb-4 relative z-10">
//           <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl shadow-lg">
//             <Microscope className="h-8 w-8 text-emerald-700" />
//           </div>
//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               <h2 className="text-xl font-bold text-gray-900">Clinical Research Platform</h2>
//               <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1">
//                 <Sparkles className="w-3 h-3 mr-1 text-md" />
//                 AI-Powered
//               </Badge>
//             </div>
//             <p className="text-gray-700 font-medium text-md">Advanced biomarker-disease relationship analysis</p>
//           </div>
//         </div>

//       </div>

//       {/* Enhanced Tab Navigation */}
//       <div className="border-b-2 border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 relative">
//         <nav className="flex relative">
//           {tabs.map((tab) => {
//             const Icon = tab.icon
//             const isActive = activeTab === tab.id
//             return (
//               <button
//                 key={tab.id}
//                 className={`flex-1 py-6 px-8 text-center transition-all duration-500 relative group ${
//                   isActive
//                     ? "bg-white text-emerald-800 shadow-xl border-b-4 border-emerald-500 transform -translate-y-2 z-10"
//                     : "text-gray-700 hover:text-gray-900 hover:bg-white/70"
//                 }`}
//                 onClick={() => setActiveTab(tab.id)}
//               >
//                 <div className="flex flex-col items-center space-y-4">
//                   <div
//                     className={`p-4 rounded-2xl transition-all duration-300 ${
//                       isActive
//                         ? "bg-gradient-to-br from-emerald-100 to-teal-100 shadow-lg scale-110"
//                         : "bg-gray-200 group-hover:bg-gray-300"
//                     }`}
//                   >
//                     <Icon className={`h-8 w-8 ${isActive ? "text-emerald-700" : "text-gray-600"}`} />
//                   </div>
//                   <div>
//                     <span className="font-bold text-md block">{tab.label}</span>
//                   </div>
//                 </div>
//                 {isActive && (
//                   <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-2xl" />
//                 )}
//               </button>
//             )
//           })}
//         </nav>
//       </div>

//       {/* Tab Content */}
//       <div className="p-8 overflow-visible relative">
//         {/* Search History */}
//         {searchHistory.length > 0 && (
//           <div className="mb-8">
//             <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
//               <Filter className="h-5 w-5" />
//               Recent Searches
//             </h3>
//             <div className="flex flex-wrap gap-3">
//               {searchHistory.map((item, index) => (
//                 <Badge
//                   key={index}
//                   variant="secondary"
//                   className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition-colors px-4 py-2"
//                   onClick={() => {
//                     if (item.type === "disease") {
//                       setDiseaseInput(item.query)
//                       setActiveTab("disease")
//                     } else {
//                       setSymptomInput(item.query)
//                       setActiveTab("symptom")
//                     }
//                   }}
//                 >
//                   {item.query}
//                 </Badge>
//               ))}
//             </div>
//           </div>
//         )}

//         {activeTab === "disease" && (
//           <div className="space-y-12">
//             <AutocompleteInput
//               id="disease-search"
//               label="Disease Name"
//               placeholder="Enter disease name (e.g., Rheumatoid Arthritis, Cancer, Psoriasis)"
//               value={diseaseInput}
//               onChange={setDiseaseInput}
//               suggestions={diseasesData}
//               icon={Activity}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleDiseaseSearch()
//               }}
//             />
//           </div>
//         )}

//         {activeTab === "symptom" && (
//           <div className="space-y-12">
//             <AutocompleteInput
//               id="symptom-search"
//               label="Symptom Analysis"
//               placeholder="Enter symptom for analysis (e.g., bleeding, itching, pain, fever)"
//               value={symptomInput}
//               onChange={setSymptomInput}
//               suggestions={symptomsData}
//               icon={Stethoscope}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleSymptomSearch()
//               }}
//             />
//           </div>
//         )}

//         {/* Enhanced Action Button */}
//         <div className="mt-12">
//           <button
//             onClick={getSearchHandler()}
//             disabled={loading}
//             className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:via-emerald-800 hover:to-teal-800 text-white font-bold py-6 px-8 rounded-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:transform-none text-lg relative overflow-hidden group"
//           >
//             <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//             {loading ? (
//               <div className="flex items-center justify-center space-x-4 relative z-10">
//                 <Loader2 className="animate-spin h-7 w-7" />
//                 <span className="font-bold">{getLoadingText()}</span>
//                 <div className="flex space-x-1">
//                   <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
//                   <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
//                   <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center space-x-4 relative z-10">
//                 <Search className="h-7 w-7 group-hover:scale-110 transition-transform" />
//                 <span className="font-bold">{getButtonText()}</span>
//                 <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
//               </div>
//             )}
//           </button>
//         </div>

//         {/* Enhanced Error Display */}
//         {error && (
//           <div className="mt-10 p-8 bg-red-50 border-l-4 border-red-500 rounded-3xl shadow-lg relative overflow-hidden">
//             <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
//             <div className="flex items-center relative z-10">
//               <div className="flex-shrink-0">
//                 <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-6">
//                 <p className="text-red-900 font-bold text-lg">{error}</p>
//                 <p className="text-red-700 text-sm mt-1">Please check your input and try again.</p>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  ChevronDown,
  Activity,
  Stethoscope,
  Loader2,
  Microscope,
  Sparkles,
  TrendingUp,
  Filter,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Import JSON data
import diseasesData from "../assets/data/unique_disease.json"
import symptomsData from "../assets/data/unique_symptoms.json"

const AutocompleteInput = ({ id, label, placeholder, value, onChange, suggestions, onKeyDown, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const mouseDownRef = useRef(false)

  useEffect(() => {
    if (value.length > 0) {
      const filtered = suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 10)
      setFilteredSuggestions(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setIsOpen(false)
    }
    setHighlightedIndex(-1)
  }, [value, suggestions])

  const handleInputChange = (e) => {
    onChange(e.target.value)
  }

  const handleSuggestionClick = (suggestion) => {
    mouseDownRef.current = false
    onChange(suggestion)
    setIsOpen(false)
    setHighlightedIndex(-1)

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.blur()
      }
    }, 0)
  }

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlightedIndex >= 0) {
        onChange(filteredSuggestions[highlightedIndex])
        setIsOpen(false)
        setHighlightedIndex(-1)
      } else {
        onKeyDown(e)
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setHighlightedIndex(-1)
    } else {
      onKeyDown(e)
    }
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    mouseDownRef.current = true
  }

  const handleMouseUp = () => {
    mouseDownRef.current = false
  }

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  const handleBlur = (e) => {
    setIsFocused(false)
    if (!mouseDownRef.current) {
      setIsOpen(false)
      setHighlightedIndex(-1)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (value.length > 0) {
      setIsOpen(filteredSuggestions.length > 0)
    }
  }

  const handleMouseLeave = () => {
    mouseDownRef.current = false
  }

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-base font-bold text-gray-800 mb-4 tracking-wide uppercase letter-spacing-wide"
      >
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-emerald-600 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          className={`w-full pl-16 pr-16 py-4 border-3 rounded-3xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-300 bg-white shadow-xl hover:shadow-2xl text-gray-800 placeholder-gray-500 font-medium text-base ${
            isFocused ? "border-emerald-500 shadow-2xl" : "border-gray-300"
          }`}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          autoComplete="off"
        />
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-emerald-600 transition-all duration-300">
          <ChevronDown className={`h-6 w-6 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </div>
        {isFocused && (
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 -z-10 blur-xl transition-opacity duration-300" />
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          className="absolute z-[999999] w-full mt-4 bg-white/95 backdrop-blur-lg border-2 border-gray-200 rounded-3xl shadow-2xl overflow-visible"
          style={{
            maxHeight: "none",
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-h-96 overflow-y-auto">
            <ul ref={listRef} className="py-4">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className={`px-6 py-4 cursor-pointer transition-all duration-200 font-medium text-lg ${
                    index === highlightedIndex
                      ? "bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 shadow-lg"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span>{suggestion}</span>
                    {index === highlightedIndex && <TrendingUp className="h-4 w-4 text-emerald-600" />}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BiomarkerDiseaseSearch() {
  const [activeTab, setActiveTab] = useState("disease")
  const [diseaseInput, setDiseaseInput] = useState("")
  const [symptomInput, setSymptomInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState(null)
  const [error, setError] = useState(null)
  const [searchHistory, setSearchHistory] = useState([])

  const navigate = useNavigate()

  const addToSearchHistory = (type, query) => {
    setSearchHistory((prev) => {
      // Check if similar search already exists
      const exists = prev.some((item) => item.type === type && item.query.toLowerCase() === query.toLowerCase())

      if (exists) {
        return prev // Don't add if similar search exists
      }

      return [{ type, query, timestamp: new Date(), id: Date.now() }, ...prev.slice(0, 4)]
    })
  }

  const deleteFromSearchHistory = (id) => {
    setSearchHistory((prev) => prev.filter((item) => item.id !== id))
  }

  const tabs = [
    {
      id: "disease",
      label: "Disease Landscape",
      icon: Activity,
      description: "Analyze disease-biomarker relationships",
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      id: "symptom",
      label: "Symptoms Landscape",
      icon: Stethoscope,
      description: "Explore symptom-disease correlations",
      color: "teal",
      gradient: "from-teal-500 to-cyan-500",
    },
  ]

  const handleDiseaseSearch = async () => {
    if (!diseaseInput.trim()) {
      setError("Please enter a disease name.")
      setPredictions(null)
      return
    }

    setLoading(true)
    setError(null)
    setPredictions(null)

    try {
      // Add to search history
      addToSearchHistory("disease", diseaseInput)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/disease_landscape?disease=${encodeURIComponent(diseaseInput.trim())}`,
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch disease data")
      }

      const data = await response.json()
      console.log(data)
      navigate("/disease-targets", {
        state: {
          diseaseName: diseaseInput,
          data: data,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSymptomSearch = async () => {
    if (!symptomInput.trim()) {
      setError("Please enter a symptom for analysis.")
      setPredictions(null)
      return
    }

    setLoading(true)
    setError(null)
    setPredictions(null)

    try {
      // Add to search history
      addToSearchHistory("symptom", symptomInput)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/symptom?name=${encodeURIComponent(symptomInput.trim())}`,
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch Symptom data")
      }

      const data = await response.json()
      console.log(data)
      navigate("/symptom-results", {
        state: {
          disease: symptomInput,
          symptomData: data,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getSearchHandler = () => {
    switch (activeTab) {
      case "disease":
        return handleDiseaseSearch
      case "symptom":
        return handleSymptomSearch
      default:
        return handleDiseaseSearch
    }
  }

  const getButtonText = () => {
    switch (activeTab) {
      case "disease":
        return "Analyze Disease Landscape"
      case "symptom":
        return "Analyze Symptom Patterns"
      default:
        return "Analyze"
    }
  }

  const getLoadingText = () => {
    switch (activeTab) {
      case "disease":
        return "Analyzing Disease Data..."
      case "symptom":
        return "Processing Symptoms..."
      default:
        return "Processing..."
    }
  }

  const handleHistoryClick = (item) => {
    if (item.type === "disease") {
      setDiseaseInput(item.query)
      setActiveTab("disease")
    } else if (item.type === "symptom") {
      setSymptomInput(item.query)
      setActiveTab("symptom")
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white/95 backdrop-blur-lg rounded-4xl shadow-2xl border-2 border-gray-200/50 overflow-visible relative">
      {/* Floating background elements */}
      <div className="absolute -top-4 -right-4 w-24 h-24 bg-emerald-200/30 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-200/30 rounded-full blur-xl" />

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 via-emerald-50 to-teal-50 px-8 py-6 border-b-2 border-gray-200/50 rounded-t-4xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
        <div className="flex items-center gap-6 mb-4 relative z-10">
          <div className="p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl shadow-lg">
            <Microscope className="h-8 w-8 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-gray-900">Clinical Research Platform</h2>
              <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1">
                <Sparkles className="w-3 h-3 mr-1 text-md" />
                AI-Powered
              </Badge>
            </div>
            <p className="text-gray-700 font-medium text-md">Advanced biomarker-disease relationship analysis</p>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="border-b-2 border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 relative">
        <nav className="flex relative">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                className={`flex-1 py-6 px-8 text-center transition-all duration-500 relative group ${
                  isActive
                    ? "bg-white text-emerald-800 shadow-xl border-b-4 border-emerald-500 transform -translate-y-2 z-10"
                    : "text-gray-700 hover:text-gray-900 hover:bg-white/70"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div
                    className={`p-4 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-emerald-100 to-teal-100 shadow-lg scale-110"
                        : "bg-gray-200 group-hover:bg-gray-300"
                    }`}
                  >
                    <Icon className={`h-8 w-8 ${isActive ? "text-emerald-700" : "text-gray-600"}`} />
                  </div>
                  <div>
                    <span className="font-bold text-md block">{tab.label}</span>
                  </div>
                </div>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-t-2xl" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8 overflow-visible relative">
        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-3">
              {searchHistory.map((item) => (
                <Badge
                  key={item.id}
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer transition-colors px-4 py-2 flex items-center gap-2 group"
                >
                  <span onClick={() => handleHistoryClick(item)}>{item.query}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteFromSearchHistory(item.id)
                    }}
                    className="text-emerald-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {activeTab === "disease" && (
          <div className="space-y-12">
            <AutocompleteInput
              id="disease-search"
              label="Disease Name"
              placeholder="Enter disease name (e.g., Rheumatoid Arthritis, Cancer, Psoriasis)"
              value={diseaseInput}
              onChange={setDiseaseInput}
              suggestions={diseasesData}
              icon={Activity}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDiseaseSearch()
              }}
            />
          </div>
        )}

        {activeTab === "symptom" && (
          <div className="space-y-12">
            <AutocompleteInput
              id="symptom-search"
              label="Symptom Analysis"
              placeholder="Enter symptom for analysis (e.g., bleeding, itching, pain, fever)"
              value={symptomInput}
              onChange={setSymptomInput}
              suggestions={symptomsData}
              icon={Stethoscope}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSymptomSearch()
              }}
            />
          </div>
        )}

        {/* Enhanced Action Button */}
        <div className="mt-12">
          <button
            onClick={getSearchHandler()}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:via-emerald-800 hover:to-teal-800 text-white font-bold py-6 px-8 rounded-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 disabled:transform-none text-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            {loading ? (
              <div className="flex items-center justify-center space-x-4 relative z-10">
                <Loader2 className="animate-spin h-7 w-7" />
                <span className="font-bold">{getLoadingText()}</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-4 relative z-10">
                <Search className="h-7 w-7 group-hover:scale-110 transition-transform" />
                <span className="font-bold">{getButtonText()}</span>
                <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              </div>
            )}
          </button>
        </div>

        {/* Enhanced Error Display */}
        {error && (
          <div className="mt-10 p-8 bg-red-50 border-l-4 border-red-500 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent" />
            <div className="flex items-center relative z-10">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-6">
                <p className="text-red-900 font-bold text-lg">{error}</p>
                <p className="text-red-700 text-sm mt-1">Please check your input and try again.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

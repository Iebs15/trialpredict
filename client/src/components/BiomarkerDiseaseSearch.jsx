// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useNavigate } from "react-router-dom"

// // Import JSON data
// import biomarkersData from "../assets/data/biomarkers.json"
// import diseasesData from "../assets/data/unique_disease.json"
// import symptomsData from "../assets/data/unique_symptoms.json"

// const AutocompleteInput = ({ id, label, placeholder, value, onChange, suggestions, onKeyDown }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [filteredSuggestions, setFilteredSuggestions] = useState([])
//   const [highlightedIndex, setHighlightedIndex] = useState(-1)
//   const inputRef = useRef(null)
//   const listRef = useRef(null)
//   const mouseDownRef = useRef(false)

//   useEffect(() => {
//     if (value.length > 0) {
//       const filtered = suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 8) // Limit to 8 suggestions for better UX
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
//     // Directly update the value
//     onChange(suggestion)
//     setIsOpen(false)
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

//   // Handle mouse events to prevent blur issues
//   const handleMouseDown = () => {
//     mouseDownRef.current = true
//   }

//   const handleMouseUp = () => {
//     mouseDownRef.current = false
//   }

//   useEffect(() => {
//     // Add global mouse up listener
//     document.addEventListener("mouseup", handleMouseUp)
//     return () => {
//       document.removeEventListener("mouseup", handleMouseUp)
//     }
//   }, [])

//   const handleBlur = () => {
//     // Only close if we're not in the middle of a mouse interaction
//     if (!mouseDownRef.current) {
//       setIsOpen(false)
//     }
//   }

//   return (
//     <div className="relative">
//       <label htmlFor={id} className="block font-semibold text-gray-700 mb-2">
//         {label}
//       </label>
//       <div className="relative">
//         <svg
//           className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={2}
//           viewBox="0 0 24 24"
//           xmlns="http://www.w3.org/2000/svg"
//           aria-hidden="true"
//         >
//           <circle cx="11" cy="11" r="7" />
//           <line x1="21" y1="21" x2="16.65" y2="16.65" />
//         </svg>
//         <input
//           ref={inputRef}
//           id={id}
//           type="text"
//           placeholder={placeholder}
//           className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 bg-white shadow-sm hover:shadow-md"
//           value={value}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           onBlur={handleBlur}
//           onFocus={() => value.length > 0 && setIsOpen(filteredSuggestions.length > 0)}
//           autoComplete="off"
//         />
//       </div>

//       {isOpen && filteredSuggestions.length > 0 && (
//         <div
//           className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
//           onMouseDown={handleMouseDown}
//         >
//           <ul ref={listRef} className="py-1">
//             {filteredSuggestions.map((suggestion, index) => (
//               <li
//                 key={index}
//                 className={`px-4 py-2 cursor-pointer transition-colors duration-150 ${
//                   index === highlightedIndex ? "bg-teal-50 text-teal-700" : "text-gray-700 hover:bg-gray-50"
//                 }`}
//                 onClick={() => handleSuggestionClick(suggestion)}
//                 onMouseEnter={() => setHighlightedIndex(index)}
//               >
//                 <span className="text-sm">{suggestion}</span>
//               </li>
//             ))}
//           </ul>
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
//         `${import.meta.env.VITE_API_URL}/symptom-data?disease=${encodeURIComponent(symptomInput.trim())}`,
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

//   return (
//     <div className="flex items-center justify-center min-h-screen p-4">
//       <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200">
//         {/* Tab Navigation */}
//         <div className="border-b border-gray-200">
//           <nav className="flex">
//             <button
//               className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
//                 activeTab === "disease"
//                   ? "border-b-2 border-teal-500 text-teal-600 bg-teal-50"
//                   : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
//               }`}
//               onClick={() => setActiveTab("disease")}
//             >
//               Disease Landscape
//             </button>
//             <button
//               className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
//                 activeTab === "symptom"
//                   ? "border-b-2 border-teal-500 text-teal-600 bg-teal-50"
//                   : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
//               }`}
//               onClick={() => setActiveTab("symptom")}
//             >
//               Symptoms Landscape
//             </button>
//             <button
//               className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
//                 activeTab === "biomarker"
//                   ? "border-b-2 border-teal-500 text-teal-600 bg-teal-50"
//                   : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
//               }`}
//               onClick={() => setActiveTab("biomarker")}
//             >
//               Biomarker Landscape
//             </button>
//           </nav>
//         </div>

//         {/* Tab Content */}
//         <div className="p-6">
//           {activeTab === "disease" && (
//             <div className="space-y-6">
//               <AutocompleteInput
//                 id="disease-search"
//                 label="Enter Disease"
//                 placeholder="e.g., Rheumatoid Arthritis, Cancer, Psoriasis..."
//                 value={diseaseInput}
//                 onChange={setDiseaseInput}
//                 suggestions={diseasesData}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") handleDiseaseSearch()
//                 }}
//               />

//               <button
//                 onClick={handleDiseaseSearch}
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center">
//                     <svg
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Searching...
//                   </div>
//                 ) : (
//                   "Search Disease"
//                 )}
//               </button>
//             </div>
//           )}

//           {activeTab === "symptom" && (
//             <div className="space-y-6">
//               <AutocompleteInput
//                 id="symptom-search"
//                 label="Enter Symptom for Analysis"
//                 placeholder="e.g., bleeding, itching, pain, fever..."
//                 value={symptomInput}
//                 onChange={setSymptomInput}
//                 suggestions={symptomsData}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") handleSymptomSearch()
//                 }}
//               />

//               <button
//                 onClick={handleSymptomSearch}
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center">
//                     <svg
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Analyzing...
//                   </div>
//                 ) : (
//                   "Analyze Symptoms"
//                 )}
//               </button>
//             </div>
//           )}

//           {activeTab === "biomarker" && (
//             <div className="space-y-6">
//               <AutocompleteInput
//                 id="biomarker-search"
//                 label="Enter Biomarker"
//                 placeholder="e.g., IL-6, TNF-α, EGFR, VEGF..."
//                 value={biomarkerInput}
//                 onChange={setBiomarkerInput}
//                 suggestions={biomarkersData.biomarkers}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter") handleBiomarkerSearch()
//                 }}
//               />

//               <button
//                 onClick={handleBiomarkerSearch}
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
//               >
//                 {loading ? (
//                   <div className="flex items-center justify-center">
//                     <svg
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Searching...
//                   </div>
//                 ) : (
//                   "Search Biomarker"
//                 )}
//               </button>
//             </div>
//           )}

//           {error && (
//             <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <div className="flex items-center">
//                 <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//                 <span className="text-red-700 font-medium text-sm">{error}</span>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }


// "use client"

// import { useState, useRef, useEffect } from "react"
// import { useNavigate } from "react-router-dom"
// import { Search, ChevronDown, Activity, Stethoscope, FlaskConical, Loader2 } from "lucide-react"

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
//     onChange(suggestion)
//     setIsOpen(false)
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

//   const handleMouseDown = () => {
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

//   const handleBlur = () => {
//     if (!mouseDownRef.current) {
//       setIsOpen(false)
//     }
//   }

//   return (
//     <div className="relative">
//       <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">
//         {label}
//       </label>
//       <div className="relative">
//         <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
//           <Icon className="h-5 w-5" />
//         </div>
//         <input
//           ref={inputRef}
//           id={id}
//           type="text"
//           placeholder={placeholder}
//           className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-slate-700 placeholder-slate-400 font-medium"
//           value={value}
//           onChange={handleInputChange}
//           onKeyDown={handleKeyDown}
//           onBlur={handleBlur}
//           onFocus={() => value.length > 0 && setIsOpen(filteredSuggestions.length > 0)}
//           autoComplete="off"
//         />
//         <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
//           <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
//         </div>
//       </div>

//       {isOpen && filteredSuggestions.length > 0 && (
//         <div
//           className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
//           onMouseDown={handleMouseDown}
//         >
//           <ul ref={listRef} className="py-2">
//             {filteredSuggestions.map((suggestion, index) => (
//               <li
//                 key={index}
//                 className={`px-4 py-3 cursor-pointer transition-all duration-150 font-medium ${
//                   index === highlightedIndex
//                     ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
//                     : "text-slate-700 hover:bg-slate-50"
//                 }`}
//                 onClick={() => handleSuggestionClick(suggestion)}
//                 onMouseEnter={() => setHighlightedIndex(index)}
//               >
//                 <span className="text-sm">{suggestion}</span>
//               </li>
//             ))}
//           </ul>
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
//     },
//     {
//       id: "symptom",
//       label: "Symptoms Landscape",
//       icon: Stethoscope,
//       description: "Explore symptom-disease correlations",
//     },
//     {
//       id: "biomarker",
//       label: "Biomarker Landscape",
//       icon: FlaskConical,
//       description: "Investigate biomarker associations",
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
//           symptom: symptomInput,
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
//     <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
//         <h2 className="text-2xl font-bold text-slate-800 mb-2">Clinical Research Platform</h2>
//         <p className="text-slate-600 font-medium">Advanced biomarker-disease relationship analysis</p>
//       </div>

//       {/* Tab Navigation */}
//       <div className="border-b border-slate-200 bg-slate-50">
//         <nav className="flex">
//           {tabs.map((tab) => {
//             const Icon = tab.icon
//             return (
//               <button
//                 key={tab.id}
//                 className={`flex-1 py-6 px-6 text-center transition-all duration-300 relative group ${
//                   activeTab === tab.id
//                     ? "bg-white text-blue-700 shadow-sm border-b-3 border-blue-500"
//                     : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
//                 }`}
//                 onClick={() => setActiveTab(tab.id)}
//               >
//                 <div className="flex flex-col items-center space-y-2">
//                   <Icon className={`h-6 w-6 ${activeTab === tab.id ? "text-blue-600" : "text-slate-500"}`} />
//                   <span className="font-semibold text-sm">{tab.label}</span>
//                   <span className="text-xs text-slate-500 hidden sm:block">{tab.description}</span>
//                 </div>
//               </button>
//             )
//           })}
//         </nav>
//       </div>

//       {/* Tab Content */}
//       <div className="p-8">
//         {activeTab === "disease" && (
//           <div className="space-y-8">
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
//           <div className="space-y-8">
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
//           <div className="space-y-8">
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
//         <div className="mt-8">
//           <button
//             onClick={getSearchHandler()}
//             disabled={loading}
//             className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
//           >
//             {loading ? (
//               <div className="flex items-center justify-center space-x-3">
//                 <Loader2 className="animate-spin h-5 w-5" />
//                 <span className="font-semibold">{getLoadingText()}</span>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center space-x-3">
//                 <Search className="h-5 w-5" />
//                 <span className="font-semibold">{getButtonText()}</span>
//               </div>
//             )}
//           </button>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-red-800 font-semibold text-sm">{error}</p>
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
import { Search, ChevronDown, Activity, Stethoscope, FlaskConical, Loader2 } from "lucide-react"

// Import JSON data
import biomarkersData from "../assets/data/biomarkers.json"
import diseasesData from "../assets/data/unique_disease.json"
import symptomsData from "../assets/data/unique_symptoms.json"

const AutocompleteInput = ({ id, label, placeholder, value, onChange, suggestions, onKeyDown, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const mouseDownRef = useRef(false)

  useEffect(() => {
    if (value.length > 0) {
      const filtered = suggestions.filter((item) => item.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
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
    onChange(suggestion)
    setIsOpen(false)
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

  const handleMouseDown = () => {
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

  const handleBlur = () => {
    if (!mouseDownRef.current) {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700 mb-3 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
          <Icon className="h-5 w-5" />
        </div>
        <input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white shadow-sm hover:shadow-md text-slate-700 placeholder-slate-400 font-medium"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => value.length > 0 && setIsOpen(filteredSuggestions.length > 0)}
          autoComplete="off"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400">
          <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl max-h-64 overflow-y-auto"
          onMouseDown={handleMouseDown}
        >
          <ul ref={listRef} className="py-2">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className={`px-4 py-3 cursor-pointer transition-all duration-150 font-medium ${
                  index === highlightedIndex
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function BiomarkerDiseaseSearch() {
  const [activeTab, setActiveTab] = useState("disease")
  const [biomarkerInput, setBiomarkerInput] = useState("")
  const [diseaseInput, setDiseaseInput] = useState("")
  const [symptomInput, setSymptomInput] = useState("")

  const [loading, setLoading] = useState(false)
  const [predictions, setPredictions] = useState(null)
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const tabs = [
    {
      id: "disease",
      label: "Disease Landscape",
      icon: Activity,
      description: "Analyze disease-biomarker relationships",
    },
    {
      id: "symptom",
      label: "Symptoms Landscape",
      icon: Stethoscope,
      description: "Explore symptom-disease correlations",
    },
    {
      id: "biomarker",
      label: "Biomarker Landscape",
      icon: FlaskConical,
      description: "Investigate biomarker associations",
    },
  ]

  const handleBiomarkerSearch = async () => {
    if (!biomarkerInput.trim()) {
      setError("Please enter a biomarker name.")
      setPredictions(null)
      return
    }

    setLoading(true)
    setError(null)
    setPredictions(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/biomarker_landscape?targetName=${encodeURIComponent(biomarkerInput.trim())}`,
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch predictions")
      }

      const data = await response.json()
      setPredictions(data)
      navigate("/network", {
        state: {
          biomarker: biomarkerInput,
          predictions: data,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
      setError("Please enter a disease name for Symptoms analysis.")
      setPredictions(null)
      return
    }

    setLoading(true)
    setError(null)
    setPredictions(null)

    try {
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
      case "biomarker":
        return handleBiomarkerSearch
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
      case "biomarker":
        return "Explore Biomarker Network"
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
      case "biomarker":
        return "Mapping Biomarkers..."
      default:
        return "Processing..."
    }
  }

  return (
    <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Clinical Research Platform</h2>
        <p className="text-slate-600 font-medium">Advanced biomarker-disease relationship analysis</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 bg-slate-50">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`flex-1 py-6 px-6 text-center transition-all duration-300 relative group ${
                  activeTab === tab.id
                    ? "bg-white text-blue-700 shadow-sm border-b-3 border-blue-500"
                    : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex flex-col items-center space-y-2">
                  <Icon className={`h-6 w-6 ${activeTab === tab.id ? "text-blue-600" : "text-slate-500"}`} />
                  <span className="font-semibold text-sm">{tab.label}</span>
                  <span className="text-xs text-slate-500 hidden sm:block">{tab.description}</span>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === "disease" && (
          <div className="space-y-8">
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
          <div className="space-y-8">
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

        {activeTab === "biomarker" && (
          <div className="space-y-8">
            <AutocompleteInput
              id="biomarker-search"
              label="Biomarker Target"
              placeholder="Enter biomarker name (e.g., IL-6, TNF-α, EGFR, VEGF)"
              value={biomarkerInput}
              onChange={setBiomarkerInput}
              suggestions={biomarkersData.biomarkers}
              icon={FlaskConical}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleBiomarkerSearch()
              }}
            />
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={getSearchHandler()}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="animate-spin h-5 w-5" />
                <span className="font-semibold">{getLoadingText()}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <Search className="h-5 w-5" />
                <span className="font-semibold">{getButtonText()}</span>
              </div>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-semibold text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

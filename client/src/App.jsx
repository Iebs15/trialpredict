// "use client"

// import { useEffect, useState } from "react"
// import { ArrowRight, BarChart2, AlertCircle, CheckCircle } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { DrugSearch } from "@/components/drug-search"
// import { DiseaseDropdown } from "@/components/disease-dropdown"

// function App() {
//   const [loading, setLoading] = useState(false)
//   const [results, setResults] = useState(null)
//   const [error, setError] = useState(null)
//   const [selectedInput, setSelectedInput] = useState("")
//   const [query, setQuery] = useState("")
//   const [options, setOptions] = useState([])
//   const [selected, setSelected] = useState("")
//   const [isLoadingOptions, setIsLoadingOptions] = useState(false)

//   // New states for disease dropdown
//   const [diseases, setDiseases] = useState([])
//   const [selectedDisease, setSelectedDisease] = useState("")
//   const [isLoadingDiseases, setIsLoadingDiseases] = useState(false)

//   // Cache for target options
//   const [optionsCache, setOptionsCache] = useState({})

//   // Optimized target search with caching
//   useEffect(() => {
//     const fetchOptions = async () => {
//       if (selectedInput.length >= 3) {
//         // Check cache first
//         if (optionsCache[selectedInput]) {
//           setOptions(optionsCache[selectedInput])
//           return
//         }

//         setIsLoadingOptions(true)
//         try {
//           const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search-drugs?query=${selectedInput}`)
//           const data = await res.json()
//           if (data?.options) {
//             setOptions(data.options)
//             // Update cache
//             setOptionsCache((prev) => ({
//               ...prev,
//               [selectedInput]: data.options,
//             }))
//           }
//         } catch (err) {
//           console.error("Error fetching options:", err)
//           setError("Failed to fetch target options")
//         } finally {
//           setIsLoadingOptions(false)
//         }
//       } else {
//         setOptions([])
//       }
//     }

//     const timeout = setTimeout(fetchOptions, 300) // debounce
//     return () => clearTimeout(timeout)
//   }, [selectedInput, optionsCache])

//   // Fetch diseases when a target is selected
//   useEffect(() => {
//     const fetchDiseases = async () => {
//       if (!selected) return

//       setIsLoadingDiseases(true)
//       setDiseases([])
//       setSelectedDisease("")

//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_API_URL}/api/search-disease?target=${encodeURIComponent(selected)}`,
//         )
//         const data = await res.json()
//         if (data?.diseases) {
//           setDiseases(data.diseases)
//           // Default to "all" if diseases are found
//           setSelectedDisease("all")
//         }
//       } catch (err) {
//         console.error("Error fetching diseases:", err)
//         setError("Failed to fetch related diseases")
//       } finally {
//         setIsLoadingDiseases(false)
//       }
//     }

//     fetchDiseases()
//   }, [selected])

//   const handleDropdownSubmit = (e) => {
//     e.preventDefault()
//     if (!selected) return

//     setLoading(true)
//     setError(null)
//     setResults({ type: "dropdown", data: [] })

//     // Include the selected disease in the request if one is chosen
//     const diseaseParam =
//       selectedDisease && selectedDisease !== "all" ? `&disease=${encodeURIComponent(selectedDisease)}` : ""

//     const source = new EventSource(
//       `${import.meta.env.VITE_API_URL}/preclinical-eval?input=${encodeURIComponent(selected)}${diseaseParam}`,
//     )

//     source.onmessage = (event) => {
//       const newData = JSON.parse(event.data)
//       setResults((prev) => ({
//         ...prev,
//         data: [...prev.data, newData],
//       }))
//     }

//     source.onerror = (err) => {
//       console.error("SSE connection error:", err)
//       // setError("Connection lost or failed.")
//       setLoading(false)
//       source.close()
//     }
//   }

//   // Helper functions
//   function getProbabilityColor(probability) {
//     if (probability >= 90) return "#10b981" // green-500
//     if (probability >= 80) return "#22c55e" // green-600
//     if (probability >= 70) return "#f59e0b" // amber-500
//     return "#ef4444" // red-500
//   }

//   function formatAuthors(authorsString) {
//     return authorsString.replace(/\|/g, ", ")
//   }

//   return (
//     <main className="flex min-h-screen flex-col">
//       <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-white">TrialPredict AI Suite</h1>
//               <p className="text-blue-100 mt-1">Empowering Smarter Decisions for Clinical Success</p>
//             </div>
//           </div>
//         </div>
//       </header>

//       <section className="bg-slate-50 py-12">
//         <div className="container mx-auto px-4">
//           <div className="max-w-3xl mx-auto">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
//               Predict Clinical Trial Success with AI-Powered Insights
//             </h2>
//             <p className="text-gray-600 mb-8 text-center">
//               Our advanced machine learning models analyze preclinical data to forecast trial outcomes with
//               unprecedented accuracy.
//             </p>

//             {error && (
//               <Alert variant="destructive" className="mb-6">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <Card className="shadow-lg">
//               <CardHeader>
//                 <CardTitle>Search for Drug or Target</CardTitle>
//                 <CardDescription>Choose your preferred input method to get prediction results</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleDropdownSubmit} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="drug-input">{"Target Name (BioMarker)"}</Label>
//                     <DrugSearch
//                       options={options}
//                       value={selected}
//                       onChange={setSelected}
//                       onInputChange={setSelectedInput}
//                       placeholder="e.g., INSULIN HUMAN or Insulin receptor"
//                       emptyMessage="No matches found. Type at least 3 characters to search."
//                       isLoading={isLoadingOptions}
//                     />

//                     {selected && (
//                       <p className="text-sm text-gray-600 mt-2">
//                         You selected: <strong>{selected}</strong>
//                       </p>
//                     )}
//                   </div>

//                   {/* Disease dropdown */}
//                   {selected && (
//                     <DiseaseDropdown
//                       diseases={diseases}
//                       selectedDisease={selectedDisease}
//                       onSelect={setSelectedDisease}
//                       isLoading={isLoadingDiseases}
//                     />
//                   )}

//                   <Button type="submit" className="w-full" disabled={loading || !selected}>
//                     {loading ? "Analyzing..." : "Search"}
//                     {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
//                   </Button>
//                 </form>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {loading && (
//         <div className="container mx-auto px-4 py-8">
//           <div className="max-w-4xl mx-auto">
//             <Card>
//               <CardContent className="py-8">
//                 <div className="flex flex-col items-center justify-center">
//                   <div className="animate-pulse flex space-x-4 mb-4">
//                     <BarChart2 className="h-12 w-12 text-blue-500" />
//                   </div>
//                   <h3 className="text-xl font-medium text-gray-700 mb-2">Analyzing Data</h3>
//                   <p className="text-gray-500 mb-4 text-center">
//                     Our AI is cross-referencing your query with our database of 50,000+ historical trials
//                   </p>
//                   <div className="w-full max-w-md">
//                     <Progress value={45} className="h-2" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       )}

//       {/* Results sections remain unchanged */}
//       {results && results.type === "form" && (
//         <section className="container mx-auto px-4 py-12">
//           <div className="max-w-4xl mx-auto">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//               <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
//               Results:
//             </h2>

//             <Card
//               className="mb-6 overflow-hidden border-l-4"
//               style={{
//                 borderLeftColor: getProbabilityColor(results.data.probability),
//               }}
//             >
//               <CardContent className="p-6">
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="text-lg font-bold">Prediction Results</h3>
//                     <div className="flex items-center">
//                       <span
//                         className="font-bold text-lg mr-2"
//                         style={{
//                           color: getProbabilityColor(results.data.probability),
//                         }}
//                       >
//                         {results.data.probability}%
//                       </span>
//                       <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
//                         <div
//                           className="h-full rounded-full"
//                           style={{
//                             width: `${results.data.probability}%`,
//                             backgroundColor: getProbabilityColor(results.data.probability),
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
//                     <p>
//                       <strong>
//                         Results for {results.data.drug_name} targeting {results.data.target_name}
//                       </strong>
//                     </p>
//                     <p>
//                       <strong>Probability</strong>: {results.data.probability}%
//                     </p>
//                     <p>
//                       <strong>Justification</strong>: {results.data.justification}
//                     </p>
//                     <p>
//                       <strong>Disease Name</strong>: {results.data.disease}
//                     </p>
//                     <p>
//                       <strong>Synonym</strong>: {results.data.synonym}
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </section>
//       )}

//       {results && results.type === "dropdown" && (
//         <section className="container mx-auto px-4 py-12">
//           <div className="max-w-4xl mx-auto">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//               <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
//               Search Results for "{selected}"
//               {selectedDisease && selectedDisease !== "all" && (
//                 <span className="ml-2 text-lg font-normal text-gray-600">(Disease: {selectedDisease})</span>
//               )}
//             </h2>

//             {results.data.length === 0 ? (
//               <Alert className="mb-6">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>No results found for your search query.</AlertDescription>
//               </Alert>
//             ) : (
//               <div className="space-y-6">
//                 {results.data.map((result, index) => (
//                   <Card
//                     key={index}
//                     className="overflow-hidden border-l-4"
//                     style={{
//                       borderLeftColor: getProbabilityColor(result.probability),
//                     }}
//                   >
//                     <CardHeader className="pb-2">
//                       <div className="flex justify-between items-center">
//                         <CardTitle className="text-lg flex items-center">
//                           Result {index + 1}
//                           {result.probability >= 85 ? (
//                             <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
//                           ) : result.probability < 75 ? (
//                             <AlertCircle className="ml-2 h-5 w-5 text-amber-500" />
//                           ) : null}
//                         </CardTitle>
//                         <div className="flex items-center">
//                           <span
//                             className="font-bold text-lg mr-2"
//                             style={{
//                               color: getProbabilityColor(result.probability),
//                             }}
//                           >
//                             {result.probability}%
//                           </span>
//                           <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
//                             <div
//                               className="h-full rounded-full"
//                               style={{
//                                 width: `${result.probability}%`,
//                                 backgroundColor: getProbabilityColor(result.probability),
//                               }}
//                             ></div>
//                           </div>
//                         </div>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                         <div>
//                           <p className="text-sm text-gray-500">Disease</p>
//                           <p className="font-medium">{result.disease || "Not specified"}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">Publication ID</p>
//                           <p className="font-medium">{result.pg_pubid || "Not available"}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">Assignee</p>
//                           <p className="font-medium">{result.assignee_name || "Not specified"}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">Publication Date</p>
//                           <p className="font-medium">{result.publication_date || "Not available"}</p>
//                         </div>
//                       </div>

//                       <div className="mt-4">
//                         <p className="text-sm text-gray-500 mb-1">Inventor</p>
//                         <p className="font-medium">{formatAuthors(result.inventor)}</p>
//                       </div>
//                       <div className="mt-4">
//                         <p className="text-sm text-gray-500 mb-1">Justification</p>
//                         <p className="text-sm text-gray-700">{result.justification}</p>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>
//       )}

//       <footer className="bg-gray-800 text-white py-8 mt-auto">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div>
//               <h3 className="text-lg font-semibold mb-4">TrialPredict AI Suite</h3>
//               <p className="text-gray-400 text-sm">
//                 Bridging the gap between preclinical promise and clinical reality with cutting-edge artificial
//                 intelligence.
//               </p>
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
//               <ul className="space-y-2 text-gray-400 text-sm">
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Dashboard
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Documentation
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     API Reference
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Support
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Contact</h3>
//               <p className="text-gray-400 text-sm">
//                 For inquiries, please contact our support team at support@trialpredict.ai
//               </p>
//             </div>
//           </div>
//           <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
//             &copy; {new Date().getFullYear()} TrialPredict AI Suite. All rights reserved.
//           </div>
//         </div>
//       </footer>
//     </main>
//   )
// }

// export default App




// "use client"

// import { useEffect, useState } from "react"
// import { ArrowRight, BarChart2, AlertCircle, CheckCircle } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { DrugSearch } from "@/components/drug-search"
// import { DiseaseDropdown } from "@/components/disease-dropdown"

// function App() {
//   const [loading, setLoading] = useState(false)
//   const [results, setResults] = useState(null)
//   const [error, setError] = useState(null)
//   const [selectedInput, setSelectedInput] = useState("")
//   const [query, setQuery] = useState("")
//   const [options, setOptions] = useState([])
//   const [selected, setSelected] = useState("")
//   const [isLoadingOptions, setIsLoadingOptions] = useState(false)

//   // New states for disease dropdown
//   const [diseases, setDiseases] = useState([])
//   const [selectedDisease, setSelectedDisease] = useState("")
//   const [isLoadingDiseases, setIsLoadingDiseases] = useState(false)

//   // Cache for target options
//   const [optionsCache, setOptionsCache] = useState({})

//   // Optimized target search with caching
//   useEffect(() => {
//     const fetchOptions = async () => {
//       if (selectedInput.length >= 3) {
//         // Check cache first
//         if (optionsCache[selectedInput]) {
//           setOptions(optionsCache[selectedInput])
//           return
//         }

//         setIsLoadingOptions(true)
//         try {
//           const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search-drugs?query=${selectedInput}`)
//           const data = await res.json()
//           if (data?.options) {
//             setOptions(data.options)
//             // Update cache
//             setOptionsCache((prev) => ({
//               ...prev,
//               [selectedInput]: data.options,
//             }))
//           }
//         } catch (err) {
//           console.error("Error fetching options:", err)
//           setError("Failed to fetch target options")
//         } finally {
//           setIsLoadingOptions(false)
//         }
//       } else {
//         setOptions([])
//       }
//     }

//     const timeout = setTimeout(fetchOptions, 300) // debounce
//     return () => clearTimeout(timeout)
//   }, [selectedInput, optionsCache])

//   // Fetch diseases when a target is selected
//   useEffect(() => {
//     const fetchDiseases = async () => {
//       if (!selected) return

//       setIsLoadingDiseases(true)
//       setDiseases([])
//       setSelectedDisease("")

//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_API_URL}/api/search-disease?target=${encodeURIComponent(selected)}`,
//         )

//         // Check if the response is ok
//         if (!res.ok) {
//           throw new Error(`API request failed with status ${res.status}: ${res.statusText}`)
//         }

//         const data = await res.json()
//         if (data?.diseases) {
//           setDiseases(data.diseases)
//           // Default to "all" if diseases are found
//           setSelectedDisease("all")
//         }
//       } catch (err) {
//         console.error("Error fetching diseases:", err)
//         setError(`Failed to fetch related diseases: ${err.message}`)
//       } finally {
//         setIsLoadingDiseases(false)
//       }
//     }

//     fetchDiseases()
//   }, [selected])

//   const handleDropdownSubmit = (e) => {
//     e.preventDefault()
//     if (!selected) return

//     setLoading(true)
//     setError(null)
//     setResults({ type: "dropdown", data: [] })

//     // Include the selected disease in the request if one is chosen
//     const diseaseParam =
//       selectedDisease && selectedDisease !== "all" ? `&disease=${encodeURIComponent(selectedDisease)}` : ""

//     const source = new EventSource(
//       `${import.meta.env.VITE_API_URL}/preclinical-eval?input=${encodeURIComponent(selected)}${diseaseParam}`,
//     )

//     source.onmessage = (event) => {
//       const newData = JSON.parse(event.data)
//       setResults((prev) => ({
//         ...prev,
//         data: [...prev.data, newData],
//       }))
//     }

//     source.onerror = (err) => {
//       console.error("SSE connection error:", err)
//       // setError("Connection lost or failed.")
//       setLoading(false)
//       source.close()
//     }
//   }

//   // Helper functions
//   function getProbabilityColor(probability) {
//     if (probability >= 90) return "#10b981" // green-500
//     if (probability >= 80) return "#22c55e" // green-600
//     if (probability >= 70) return "#f59e0b" // amber-500
//     return "#ef4444" // red-500
//   }

//   function formatAuthors(authorsString) {
//     return authorsString.replace(/\|/g, ", ")
//   }

//   return (
//     <main className="flex min-h-screen flex-col">
//       <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row justify-between items-center">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-white">TrialPredict AI Suite</h1>
//               <p className="text-blue-100 mt-1">Empowering Smarter Decisions for Clinical Success</p>
//             </div>
//           </div>
//         </div>
//       </header>

//       <section className="bg-slate-50 py-12">
//         <div className="container mx-auto px-4">
//           <div className="max-w-3xl mx-auto">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
//               Predict Clinical Trial Success with AI-Powered Insights
//             </h2>
//             <p className="text-gray-600 mb-8 text-center">
//               Our advanced machine learning models analyze preclinical data to forecast trial outcomes with
//               unprecedented accuracy.
//             </p>

//             {error && (
//               <Alert variant="destructive" className="mb-6">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <Card className="shadow-lg">
//               <CardHeader>
//                 <CardTitle>Search for Drug or Target</CardTitle>
//                 <CardDescription>Choose your preferred input method to get prediction results</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <form onSubmit={handleDropdownSubmit} className="space-y-4">
//                   <div className="space-y-2">
//                     <Label htmlFor="drug-input">{"Target Name (BioMarker)"}</Label>
//                     <DrugSearch
//                       options={options}
//                       value={selected}
//                       onChange={setSelected}
//                       onInputChange={setSelectedInput}
//                       placeholder="e.g., INSULIN HUMAN or Insulin receptor"
//                       emptyMessage="No matches found. Type at least 3 characters to search."
//                       isLoading={isLoadingOptions}
//                     />

//                     {selected && (
//                       <p className="text-sm text-gray-600 mt-2">
//                         You selected: <strong>{selected}</strong>
//                       </p>
//                     )}
//                   </div>

//                   {/* Disease dropdown */}
//                   {selected && (
//                     <DiseaseDropdown
//                       diseases={diseases}
//                       selectedDisease={selectedDisease}
//                       onSelect={setSelectedDisease}
//                       isLoading={isLoadingDiseases}
//                     />
//                   )}

//                   <Button type="submit" className="w-full" disabled={loading || !selected}>
//                     {loading ? "Analyzing..." : "Search"}
//                     {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
//                   </Button>
//                 </form>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {loading && (
//         <div className="container mx-auto px-4 py-8">
//           <div className="max-w-4xl mx-auto">
//             <Card>
//               <CardContent className="py-8">
//                 <div className="flex flex-col items-center justify-center">
//                   <div className="animate-pulse flex space-x-4 mb-4">
//                     <BarChart2 className="h-12 w-12 text-blue-500" />
//                   </div>
//                   <h3 className="text-xl font-medium text-gray-700 mb-2">Analyzing Data</h3>
//                   <p className="text-gray-500 mb-4 text-center">
//                     Our AI is cross-referencing your query with our database of 50,000+ historical trials
//                   </p>
//                   <div className="w-full max-w-md">
//                     <Progress value={45} className="h-2" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       )}

//       {/* Results sections remain unchanged */}
//       {results && results.type === "form" && (
//         <section className="container mx-auto px-4 py-12">
//           <div className="max-w-4xl mx-auto">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//               <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
//               Results:
//             </h2>

//             <Card
//               className="mb-6 overflow-hidden border-l-4"
//               style={{
//                 borderLeftColor: getProbabilityColor(results.data.probability),
//               }}
//             >
//               <CardContent className="p-6">
//                 <div className="space-y-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="text-lg font-bold">Prediction Results</h3>
//                     <div className="flex items-center">
//                       <span
//                         className="font-bold text-lg mr-2"
//                         style={{
//                           color: getProbabilityColor(results.data.probability),
//                         }}
//                       >
//                         {results.data.probability}%
//                       </span>
//                       <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
//                         <div
//                           className="h-full rounded-full"
//                           style={{
//                             width: `${results.data.probability}%`,
//                             backgroundColor: getProbabilityColor(results.data.probability),
//                           }}
//                         ></div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
//                     <p>
//                       <strong>
//                         Results for {results.data.drug_name} targeting {results.data.target_name}
//                       </strong>
//                     </p>
//                     <p>
//                       <strong>Probability</strong>: {results.data.probability}%
//                     </p>
//                     <p>
//                       <strong>Justification</strong>: {results.data.justification}
//                     </p>
//                     <p>
//                       <strong>Disease Name</strong>: {results.data.disease}
//                     </p>
//                     <p>
//                       <strong>Synonym</strong>: {results.data.synonym}
//                     </p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </section>
//       )}

//       {results && results.type === "dropdown" && (
//         <section className="container mx-auto px-4 py-12">
//           <div className="max-w-4xl mx-auto">
//             <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
//               <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
//               Search Results for "{selected}"
//               {selectedDisease && selectedDisease !== "all" && (
//                 <span className="ml-2 text-lg font-normal text-gray-600">(Disease: {selectedDisease})</span>
//               )}
//             </h2>

//             {results.data.length === 0 ? (
//               <Alert className="mb-6">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>No results found for your search query.</AlertDescription>
//               </Alert>
//             ) : (
//               <div className="space-y-6">
//                 {results.data.map((result, index) => (
//                   <Card
//                     key={index}
//                     className="overflow-hidden border-l-4"
//                     style={{
//                       borderLeftColor: getProbabilityColor(result.probability),
//                     }}
//                   >
//                     <CardHeader className="pb-2">
//                       <div className="flex justify-between items-center">
//                         <CardTitle className="text-lg flex items-center">
//                           Result {index + 1}
//                           {result.probability >= 85 ? (
//                             <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
//                           ) : result.probability < 75 ? (
//                             <AlertCircle className="ml-2 h-5 w-5 text-amber-500" />
//                           ) : null}
//                         </CardTitle>
//                         <div className="flex items-center">
//                           <span
//                             className="font-bold text-lg mr-2"
//                             style={{
//                               color: getProbabilityColor(result.probability),
//                             }}
//                           >
//                             {result.probability}%
//                           </span>
//                           <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
//                             <div
//                               className="h-full rounded-full"
//                               style={{
//                                 width: `${result.probability}%`,
//                                 backgroundColor: getProbabilityColor(result.probability),
//                               }}
//                             ></div>
//                           </div>
//                         </div>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                         <div>
//                           <p className="text-sm text-gray-500">Disease</p>
//                           <p className="font-medium">{result.disease || "Not specified"}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">Publication ID</p>
//                           <p className="font-medium">{result.pg_pubid || "Not available"}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">Assignee</p>
//                           <p className="font-medium">{result.assignee_name || "Not specified"}</p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-500">Publication Date</p>
//                           <p className="font-medium">{result.publication_date || "Not available"}</p>
//                         </div>
//                       </div>

//                       <div className="mt-4">
//                         <p className="text-sm text-gray-500 mb-1">Inventor</p>
//                         <p className="font-medium">{formatAuthors(result.inventor)}</p>
//                       </div>
//                       <div className="mt-4">
//                         <p className="text-sm text-gray-500 mb-1">Justification</p>
//                         <p className="text-sm text-gray-700">{result.justification}</p>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>
//       )}

//       <footer className="bg-gray-800 text-white py-8 mt-auto">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div>
//               <h3 className="text-lg font-semibold mb-4">TrialPredict AI Suite</h3>
//               <p className="text-gray-400 text-sm">
//                 Bridging the gap between preclinical promise and clinical reality with cutting-edge artificial
//                 intelligence.
//               </p>
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
//               <ul className="space-y-2 text-gray-400 text-sm">
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Dashboard
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Documentation
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     API Reference
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="hover:text-white">
//                     Support
//                   </a>
//                 </li>
//               </ul>
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold mb-4">Contact</h3>
//               <p className="text-gray-400 text-sm">
//                 For inquiries, please contact our support team at support@trialpredict.ai
//               </p>
//             </div>
//           </div>
//           <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
//             &copy; {new Date().getFullYear()} TrialPredict AI Suite. All rights reserved.
//           </div>
//         </div>
//       </footer>
//     </main>
//   )
// }

// export default App


"use client"

import { useEffect, useState } from "react"
import { ArrowRight, BarChart2, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DrugSearch } from "@/components/drug-search"
import { DiseaseDropdown } from "@/components/disease-dropdown"

function App() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [selectedInput, setSelectedInput] = useState("")
  const [query, setQuery] = useState("")
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState("")
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

  // New states for disease dropdown
  const [diseases, setDiseases] = useState([])
  const [selectedDisease, setSelectedDisease] = useState("")
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false)

  // Cache for target options
  const [optionsCache, setOptionsCache] = useState({})

  // Optimized target search with caching
  useEffect(() => {
    const fetchOptions = async () => {
      if (selectedInput.length >= 3) {
        // Check cache first
        if (optionsCache[selectedInput]) {
          setOptions(optionsCache[selectedInput])
          return
        }

        setIsLoadingOptions(true)
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search-drugs?query=${selectedInput}`)
          const data = await res.json()
          if (data?.options) {
            setOptions(data.options)
            // Update cache
            setOptionsCache((prev) => ({
              ...prev,
              [selectedInput]: data.options,
            }))
          }
        } catch (err) {
          console.error("Error fetching options:", err)
          setError("Failed to fetch target options")
        } finally {
          setIsLoadingOptions(false)
        }
      } else {
        setOptions([])
      }
    }

    const timeout = setTimeout(fetchOptions, 300) // debounce
    return () => clearTimeout(timeout)
  }, [selectedInput, optionsCache])

  // Fetch diseases when a target is selected
  useEffect(() => {
    const fetchDiseases = async () => {
      if (!selected) return

      setIsLoadingDiseases(true)
      setDiseases([])
      setSelectedDisease("")

      try {
        // Log the request URL for debugging
        const requestUrl = `${import.meta.env.VITE_API_URL}/api/search-disease?target=${encodeURIComponent(selected)}`
        console.log("Fetching diseases from:", requestUrl)

        // Use a more robust fetch with explicit headers and method
        const res = await fetch(requestUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          // Add credentials if your API requires authentication
          // credentials: 'include',
        })

        // Check if the response is ok
        if (!res.ok) {
          // Try to get more detailed error information
          let errorText = await res.text()
          try {
            // Try to parse as JSON if possible
            const errorJson = JSON.parse(errorText)
            errorText = errorJson.error || errorJson.message || errorText
          } catch (e) {
            // If not JSON, use the text as is
          }
          throw new Error(`API request failed with status ${res.status}: ${errorText}`)
        }

        const data = await res.json()
        console.log("Diseases data received:", data)

        if (data?.diseases) {
          setDiseases(data.diseases)
          // Default to "all" if diseases are found
          if (data.diseases.length > 0) {
            setSelectedDisease("all")
          }
        } else {
          console.warn("No diseases array in response:", data)
          setDiseases([])
        }
      } catch (err) {
        console.error("Error fetching diseases:", err)
        setError(`Failed to fetch related diseases: ${err.message}`)
      } finally {
        setIsLoadingDiseases(false)
      }
    }

    fetchDiseases()
  }, [selected])

  const handleDropdownSubmit = (e) => {
    e.preventDefault()
    if (!selected) return

    setLoading(true)
    setError(null)
    setResults({ type: "dropdown", data: [] })

    // Include the selected disease in the request if one is chosen
    const diseaseParam =
      selectedDisease && selectedDisease !== "all" ? `&disease=${encodeURIComponent(selectedDisease)}` : ""

    const source = new EventSource(
      `${import.meta.env.VITE_API_URL}/predict?input=${encodeURIComponent(selected)}${diseaseParam}`,
    )

    source.onmessage = (event) => {
      const newData = JSON.parse(event.data)
      setResults((prev) => ({
        ...prev,
        data: [...prev.data, newData],
      }))
    }

    source.onerror = (err) => {
      console.error("SSE connection error:", err)
      // setError("Connection lost or failed.")
      setLoading(false)
      source.close()
    }
  }

  // Helper functions
  function getProbabilityColor(probability) {
    if (probability >= 90) return "#10b981" // green-500
    if (probability >= 80) return "#22c55e" // green-600
    if (probability >= 70) return "#f59e0b" // amber-500
    return "#ef4444" // red-500
  }

  function formatAuthors(authorsString) {
    if (!authorsString || typeof authorsString !== "string") {
      return "Not available"
    }
    return authorsString.replace(/\|/g, ", ")
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">TrialPredict AI Suite</h1>
              <p className="text-blue-100 mt-1">Empowering Smarter Decisions for Clinical Success</p>
            </div>
          </div>
        </div>
      </header>

      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Predict Clinical Trial Success with AI-Powered Insights
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Our advanced machine learning models analyze preclinical data to forecast trial outcomes with
              unprecedented accuracy.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Search for Target</CardTitle>
                <CardDescription>Choose your preferred input method to get prediction results</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDropdownSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="drug-input">{"Target Name (BioMarker)"}</Label>
                    <DrugSearch
                      options={options}
                      value={selected}
                      onChange={setSelected}
                      onInputChange={setSelectedInput}
                      placeholder="e.g., INSULIN HUMAN or Insulin receptor"
                      emptyMessage="No matches found. Type at least 3 characters to search."
                      isLoading={isLoadingOptions}
                    />

                    {selected && (
                      <p className="text-sm text-gray-600 mt-2">
                        You selected: <strong>{selected}</strong>
                      </p>
                    )}
                  </div>

                  {/* Disease dropdown */}
                  {selected && (
                    <DiseaseDropdown
                      diseases={diseases}
                      selectedDisease={selectedDisease}
                      onSelect={setSelectedDisease}
                      isLoading={isLoadingDiseases}
                    />
                  )}

                  <Button type="submit" className="w-full" disabled={loading || !selected}>
                    {loading ? "Analyzing..." : "Search"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {loading && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-pulse flex space-x-4 mb-4">
                    <BarChart2 className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Analyzing Data</h3>
                  <p className="text-gray-500 mb-4 text-center">
                    Our AI is cross-referencing your query with our database of 50,000+ historical trials
                  </p>
                  <div className="w-full max-w-md">
                    <Progress value={45} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Results sections remain unchanged */}
      {results && results.type === "form" && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
              Results:
            </h2>

            <Card
              className="mb-6 overflow-hidden border-l-4"
              style={{
                borderLeftColor: getProbabilityColor(results.data.probability),
              }}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Prediction Results</h3>
                    {/* <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        
                      </div>
                    </div> */}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
                    <p>
                      <strong>
                        Results for {results.data.drug_name} targeting {results.data.target_name}
                      </strong>
                    </p>
                    {/* <p>
                      <strong>Probability</strong>: {results.data.probability}%
                    </p> */}
                    <p>
                      <strong>Justification</strong>: {results.data.justification}
                    </p>
                    <p>
                      <strong>Disease Name</strong>: {results.data.disease}
                    </p>
                    <p>
                      <strong>Synonym</strong>: {results.data.synonym}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {results && results.type === "dropdown" && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
              Search Results for "{selected}"
              {selectedDisease && selectedDisease !== "all" && (
                <span className="ml-2 text-lg font-normal text-gray-600">(Disease: {selectedDisease})</span>
              )}
            </h2>

            {results.data.length === 0 ? (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No results found for your search query.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {results.data.map((result, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border-l-4"
                    style={{
                      borderLeftColor: getProbabilityColor(result.probability),
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                          Result {index + 1}
                          {result.probability >= 85 ? (
                            <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                          ) : result.probability < 75 ? (
                            <AlertCircle className="ml-2 h-5 w-5 text-amber-500" />
                          ) : null}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Disease</p>
                          <p className="font-medium">{result.disease || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Publication ID</p>
                          <p className="font-medium">{result.pg_pubid || "Not available"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Assignee</p>
                          <p className="font-medium">{result.assignee_name || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Publication Date</p>
                          <p className="font-medium">{result.publication_date || "Not available"}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Inventor</p>
                        <p className="font-medium">{formatAuthors(result.inventor)}</p>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Justification</p>
                        <p className="text-sm text-gray-700">{result.justification}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TrialPredict AI Suite</h3>
              <p className="text-gray-400 text-sm">
                Bridging the gap between preclinical promise and clinical reality with cutting-edge artificial
                intelligence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">
                For inquiries, please contact our support team at support@trialpredict.ai
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} TrialPredict AI Suite. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App

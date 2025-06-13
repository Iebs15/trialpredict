// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useLocation } from "react-router-dom"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import {
//   X,
//   Info,
//   TrendingUp,
//   TrendingDown,
//   Activity,
//   HelpCircle,
//   BarChart3,
//   ZoomIn,
//   ZoomOut,
//   Loader2,
// } from "lucide-react"
// import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
// import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

// export default function SymptomInfographic() {
//   const location = useLocation()
//   const { symptomData, disease } = location.state || {}
//   const [tooltip, setTooltip] = useState(null)
//   const [selectedDisease, setSelectedDisease] = useState(null)
//   const [diseaseDetails, setDiseaseDetails] = useState(null)
//   const [selectedCircle, setSelectedCircle] = useState(null)
//   const [circleDetails, setCircleDetails] = useState(null)
//   const [activeTab, setActiveTab] = useState("matrix")
//   const [zoomLevel, setZoomLevel] = useState(1)
//   const [apiData, setApiData] = useState(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [apiError, setApiError] = useState(null)
//   const svgContainerRef = useRef(null)
//   const detailsSectionRef = useRef(null)

//   // Fixed circle size
//   const CIRCLE_RADIUS = 16
//   const cellSize = 60 // Increased cell size for better spacing
//   const margin = { top: 180, right: 60, bottom: 80, left: 320 } // Increased margins for labels

//   // Fixed height for scrollable visualization
//   const VISUALIZATION_HEIGHT = 600
//   const biomarkers = Object.keys(symptomData?.nested_assoc || {})
//   const diseases = Array.from(
//     new Set(biomarkers.flatMap((biomarker) => Object.keys(symptomData?.nested_assoc[biomarker] || {}))),
//   ).sort()

//   console.log("Total biomarkers:", biomarkers.length)
//   console.log("Total diseases:", diseases.length)
//   console.log("Diseases:", diseases)

//   const width = Math.max(diseases.length * cellSize + margin.left + margin.right, 1200)
//   const height = biomarkers.length * cellSize + margin.top + margin.bottom

//   // Scroll to center on initial load
//   useEffect(() => {
//     if (svgContainerRef.current) {
//       const container = svgContainerRef.current
//       container.scrollLeft = (width * zoomLevel - container.clientWidth) / 2
//     }
//   }, [width, zoomLevel])

//   // Auto-scroll to details section when details are shown
//   useEffect(() => {
//     if ((selectedDisease && diseaseDetails) || (selectedCircle && circleDetails)) {
//       setTimeout(() => {
//         detailsSectionRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         })
//       }, 100)
//     }
//   }, [selectedDisease, diseaseDetails, selectedCircle, circleDetails])

//   // Show error message if no data is available
//   if (!symptomData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <Card className="p-8 text-center">
//           <div className="text-red-600 mb-4">
//             <Activity className="h-12 w-12 mx-auto mb-4" />
//             <h2 className="text-xl font-semibold">No Data Available</h2>
//             <p className="text-slate-600 mt-2">Please navigate here with valid symptom data.</p>
//           </div>
//         </Card>
//       </div>
//     )
//   }

//   const { nested_assoc: data, plots, symptom } = symptomData

//   // Create gradient for colored circles (inhibitor, promoter, unknown)
//   const createGradient = (inhibitorPercent, promoterPercent, unknownPercent, id) => (
//     <defs key={id}>
//       <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
//         <stop offset="0%" stopColor="#10b981" stopOpacity={inhibitorPercent / 100} />
//         <stop offset={`${inhibitorPercent}%`} stopColor="#10b981" stopOpacity={inhibitorPercent / 100} />
//         <stop offset={`${inhibitorPercent}%`} stopColor="#f59e0b" stopOpacity={promoterPercent / 100} />
//         <stop
//           offset={`${inhibitorPercent + promoterPercent}%`}
//           stopColor="#f59e0b"
//           stopOpacity={promoterPercent / 100}
//         />
//         <stop
//           offset={`${inhibitorPercent + promoterPercent}%`}
//           stopColor="#6b7280"
//           stopOpacity={unknownPercent / 100}
//         />
//         <stop offset="100%" stopColor="#6b7280" stopOpacity={unknownPercent / 100} />
//       </linearGradient>
//     </defs>
//   )

//   // Handle mouse events for tooltip
//   const handleMouseEnter = (biomarker, disease, datum, event) => {
//     if (!datum) return
//     const rect = event.currentTarget.getBoundingClientRect()
//     setTooltip({
//       biomarker,
//       disease,
//       total_avg: datum.total_avg || 0,
//       avg_inhibitor: datum.avg_inhibitor || 0,
//       avg_promoter: datum.avg_promoter || 0,
//       avg_unknown: datum.avg_unknown || 0,
//       percent_inhibitor: datum.percent_inhibitor || 0,
//       percent_promoter: datum.percent_promoter || 0,
//       percent_unknown: datum.percent_unknown || 0,
//       x: rect.left + rect.width / 2,
//       y: rect.top - 10,
//     })
//   }

//   const handleMouseLeave = () => {
//     setTooltip(null)
//   }

//   // Handle disease click
//   const handleDiseaseClick = (disease) => {
//     // Clear circle selection when selecting a disease
//     setSelectedCircle(null)
//     setCircleDetails(null)
//     setApiData(null)
//     setApiError(null)

//     setSelectedDisease(disease)

//     // Calculate statistics for this disease across all biomarkers
//     const diseaseStats = {
//       disease,
//       totalBiomarkers: biomarkers.length,
//       biomarkersWithData: 0,
//       avgInhibitorScore: 0,
//       avgPromoterScore: 0,
//       avgUnknownScore: 0,
//       avgTotalScore: 0,
//       strongestInhibitor: null,
//       strongestPromoter: null,
//       strongestUnknown: null,
//       biomarkerData: [],
//     }

//     let totalInhibitor = 0
//     let totalPromoter = 0
//     let totalUnknown = 0
//     let totalScore = 0
//     let maxInhibitor = 0
//     let maxPromoter = 0
//     let maxUnknown = 0

//     biomarkers.forEach((biomarker) => {
//       const datum = data[biomarker]?.[disease]
//       if (datum) {
//         diseaseStats.biomarkersWithData++
//         totalInhibitor += datum.avg_inhibitor || 0
//         totalPromoter += datum.avg_promoter || 0
//         totalUnknown += datum.avg_unknown || 0
//         totalScore += datum.total_avg

//         if ((datum.avg_inhibitor || 0) > maxInhibitor) {
//           maxInhibitor = datum.avg_inhibitor || 0
//           diseaseStats.strongestInhibitor = { biomarker, score: datum.avg_inhibitor }
//         }

//         if ((datum.avg_promoter || 0) > maxPromoter) {
//           maxPromoter = datum.avg_promoter || 0
//           diseaseStats.strongestPromoter = { biomarker, score: datum.avg_promoter }
//         }

//         if ((datum.avg_unknown || 0) > maxUnknown) {
//           maxUnknown = datum.avg_unknown || 0
//           diseaseStats.strongestUnknown = { biomarker, score: datum.avg_unknown }
//         }

//         diseaseStats.biomarkerData.push({
//           biomarker,
//           ...datum,
//         })
//       }
//     })

//     if (diseaseStats.biomarkersWithData > 0) {
//       diseaseStats.avgInhibitorScore = totalInhibitor / diseaseStats.biomarkersWithData
//       diseaseStats.avgPromoterScore = totalPromoter / diseaseStats.biomarkersWithData
//       diseaseStats.avgUnknownScore = totalUnknown / diseaseStats.biomarkersWithData
//       diseaseStats.avgTotalScore = totalScore / diseaseStats.biomarkersWithData
//     }

//     // Sort biomarker data by total score
//     diseaseStats.biomarkerData.sort((a, b) => b.total_avg - a.total_avg)

//     setDiseaseDetails(diseaseStats)
//   }

//   // Handle circle click with API call
//   const handleCircleClick = async (biomarker, disease, datum) => {
//     if (!datum) return

//     // Clear disease selection when selecting a circle
//     setSelectedDisease(null)
//     setDiseaseDetails(null)

//     setSelectedCircle({ biomarker, disease })
//     setCircleDetails({
//       biomarker,
//       disease,
//       symptom,
//       total_avg: datum.total_avg || 0,
//       avg_inhibitor: datum.avg_inhibitor || 0,
//       avg_promoter: datum.avg_promoter || 0,
//       avg_unknown: datum.avg_unknown || 0,
//       percent_inhibitor: datum.percent_inhibitor || 0,
//       percent_promoter: datum.percent_promoter || 0,
//       percent_unknown: datum.percent_unknown || 0,
//       // Additional analysis
//       dominantType:
//         (datum.percent_inhibitor || 0) > (datum.percent_promoter || 0) &&
//         (datum.percent_inhibitor || 0) > (datum.percent_unknown || 0)
//           ? "Inhibitor"
//           : (datum.percent_promoter || 0) > (datum.percent_unknown || 0)
//             ? "Promoter"
//             : "Unknown",
//       confidence: Math.max(datum.percent_inhibitor || 0, datum.percent_promoter || 0, datum.percent_unknown || 0),
//     })

//     // Make API call to get additional data
//     setIsLoading(true)
//     setApiData(null)
//     setApiError(null)

//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/ligmaballs`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           disease: disease,
//           biomarker: biomarker,
//           symptom_data: symptomData,
//         }),
//       })

//       if (!response.ok) {
//         throw new Error(`API request failed with status ${response.status}`)
//       }

//       const data = await response.json()
//       setApiData(data)
//     } catch (error) {
//       console.error("Error fetching data from API:", error)
//       setApiError(error.message || "Failed to fetch data from API")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Handle zoom controls
//   const handleZoomIn = () => {
//     setZoomLevel((prev) => Math.min(prev + 0.2, 2))
//   }

//   const handleZoomOut = () => {
//     setZoomLevel((prev) => Math.max(prev - 0.2, 0.6))
//   }

//   // Download image
//   const downloadPlot = (plotType, base64Data) => {
//     const link = document.createElement("a")
//     link.href = `data:image/png;base64,${base64Data}`
//     link.download = `${symptom}_${plotType}_plot.png`
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Header */}
//       <div className="bg-white border-b border-slate-200 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-800">Biomarker-Disease Association Matrix</h1>
//             <p className="text-slate-600 mt-1">
//               Symptom analysis for:{" "}
//               <Badge variant="outline" className="ml-2 font-semibold capitalize">
//                 {symptom}
//               </Badge>
//             </p>
//           </div>
//           <div className="text-sm text-slate-500">
//             {biomarkers.length} biomarkers × {diseases.length} diseases
//           </div>
//         </div>
//       </div>

//       {/* Tabs for Matrix and Plots */}
//       <div className="p-4">
//         <Tabs defaultValue="matrix" className="w-full" value={activeTab} onValueChange={setActiveTab}>
//           <div className="flex justify-between items-center mb-4">
//             <TabsList>
//               <TabsTrigger value="matrix" className="px-6">
//                 <div className="flex items-center gap-2">
//                   <Activity className="h-4 w-4" />
//                   <span>Association Matrix</span>
//                 </div>
//               </TabsTrigger>
//               <TabsTrigger value="plots" className="px-6">
//                 <div className="flex items-center gap-2">
//                   <BarChart3 className="h-4 w-4" />
//                   <span>Analysis Plots</span>
//                 </div>
//               </TabsTrigger>
//             </TabsList>

//             {activeTab === "matrix" && (
//               <div className="flex items-center gap-2">
//                 <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.6}>
//                   <ZoomOut className="h-4 w-4" />
//                 </Button>
//                 <span className="text-sm font-medium text-slate-600">{Math.round(zoomLevel * 100)}%</span>
//                 <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
//                   <ZoomIn className="h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//           </div>

//           <TabsContent value="matrix" className="mt-0">
//             <div className="space-y-4">
//               {/* Main Visualization */}
//               <div className="overflow-hidden">
//                 <div
//                   className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-auto"
//                   style={{ height: `${VISUALIZATION_HEIGHT}px` }}
//                 >
//                   <div ref={svgContainerRef} className="overflow-auto" style={{ height: "100%", width: "100%" }}>
//                     <svg
//                       width={width * zoomLevel}
//                       height={height * zoomLevel}
//                       viewBox={`0 0 ${width} ${height}`}
//                       preserveAspectRatio="xMinYMin meet"
//                     >
//                       {/* Create gradients for all data points */}
//                       {biomarkers.map((biomarker, biomarkerIndex) =>
//                         diseases.map((disease, diseaseIndex) => {
//                           const datum = data[biomarker]?.[disease]
//                           if (!datum) return null
//                           const gradientId = `gradient-${biomarkerIndex}-${diseaseIndex}`
//                           return createGradient(
//                             datum.percent_inhibitor,
//                             datum.percent_promoter,
//                             datum.percent_unknown,
//                             gradientId,
//                           )
//                         }),
//                       )}

//                       {/* Y-axis labels (Biomarkers) */}
//                       {biomarkers.map((biomarker, index) => (
//                         <text
//                           key={biomarker}
//                           x={margin.left - 15}
//                           y={margin.top + index * cellSize + cellSize / 2}
//                           textAnchor="end"
//                           dominantBaseline="middle"
//                           className="text-sm font-medium fill-slate-700 hover:fill-blue-600 cursor-default"
//                         >
//                           {biomarker.replace(/_/g, " ")}
//                         </text>
//                       ))}

//                       {/* X-axis labels (Diseases) - positioned at top with better spacing */}
//                       {diseases.map((disease, index) => (
//                         <g key={disease}>
//                           <text
//                             x={margin.left + index * cellSize + cellSize / 2}
//                             y={margin.top - 40}
//                             textAnchor="start"
//                             dominantBaseline="middle"
//                             className="text-sm font-semibold fill-slate-700 hover:fill-blue-600 cursor-pointer transition-colors"
//                             transform={`rotate(-45, ${margin.left + index * cellSize + cellSize / 2}, ${
//                               margin.top - 40
//                             })`}
//                             onClick={() => handleDiseaseClick(disease)}
//                           >
//                             {disease}
//                           </text>
//                           {/* Vertical guide line */}
//                           <line
//                             x1={margin.left + index * cellSize + cellSize / 2}
//                             y1={margin.top - 10}
//                             x2={margin.left + index * cellSize + cellSize / 2}
//                             y2={margin.top}
//                             stroke="#e2e8f0"
//                             strokeDasharray="2,2"
//                           />
//                         </g>
//                       ))}

//                       {/* Complete matrix - show circle for EVERY biomarker-disease combination */}
//                       {biomarkers.map((biomarker, biomarkerIndex) =>
//                         diseases.map((disease, diseaseIndex) => {
//                           const datum = data[biomarker]?.[disease]
//                           const cx = margin.left + diseaseIndex * cellSize + cellSize / 2
//                           const cy = margin.top + biomarkerIndex * cellSize + cellSize / 2

//                           if (datum) {
//                             // Show colored circle with data - FIXED SIZE
//                             const gradientId = `gradient-${biomarkerIndex}-${diseaseIndex}`

//                             return (
//                               <circle
//                                 key={`${biomarker}-${disease}-data`}
//                                 cx={cx}
//                                 cy={cy}
//                                 r={CIRCLE_RADIUS}
//                                 fill={`url(#${gradientId})`}
//                                 stroke="#374151"
//                                 strokeWidth="1.5"
//                                 className="cursor-pointer hover:stroke-2 hover:stroke-blue-500 transition-all"
//                                 onMouseEnter={(e) => handleMouseEnter(biomarker, disease, datum, e)}
//                                 onMouseLeave={handleMouseLeave}
//                                 onClick={() => handleCircleClick(biomarker, disease, datum)}
//                               />
//                             )
//                           } else {
//                             // Show grey circle for missing data - FIXED SIZE
//                             return (
//                               <circle
//                                 key={`${biomarker}-${disease}-empty`}
//                                 cx={cx}
//                                 cy={cy}
//                                 r={CIRCLE_RADIUS * 0.6}
//                                 fill="#e2e8f0"
//                                 stroke="#cbd5e1"
//                                 strokeWidth="1"
//                                 className="opacity-60"
//                               />
//                             )
//                           }
//                         }),
//                       )}

//                       {/* Grid lines for better readability */}
//                       {biomarkers.map((_, index) => (
//                         <line
//                           key={`hgrid-${index}`}
//                           x1={margin.left - 5}
//                           y1={margin.top + index * cellSize}
//                           x2={margin.left + diseases.length * cellSize}
//                           y2={margin.top + index * cellSize}
//                           stroke="#f1f5f9"
//                           strokeWidth="1"
//                         />
//                       ))}
//                       {diseases.map((_, index) => (
//                         <line
//                           key={`vgrid-${index}`}
//                           x1={margin.left + index * cellSize}
//                           y1={margin.top - 5}
//                           x2={margin.left + index * cellSize}
//                           y2={margin.top + biomarkers.length * cellSize}
//                           stroke="#f1f5f9"
//                           strokeWidth="1"
//                         />
//                       ))}
//                     </svg>
//                   </div>
//                 </div>
//               </div>

//               {/* Details Panel Below Visualization */}
//               {(selectedDisease && diseaseDetails) || (selectedCircle && circleDetails) ? (
//                 <div ref={detailsSectionRef} className="bg-white border border-slate-200 rounded-lg shadow-sm">
//                   <div className="p-6">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-lg font-bold text-slate-800">
//                         {selectedDisease ? "Disease Analysis" : "Interaction Details"}
//                       </h3>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => {
//                           setSelectedDisease(null)
//                           setDiseaseDetails(null)
//                           setSelectedCircle(null)
//                           setCircleDetails(null)
//                           setApiData(null)
//                           setApiError(null)
//                         }}
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     </div>

//                     {/* Disease Details */}
//                     {selectedDisease && diseaseDetails && (
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         <div className="space-y-4">
//                           <div>
//                             <h4 className="font-semibold text-slate-700 mb-2">{selectedDisease}</h4>
//                             <div className="grid grid-cols-2 gap-3 text-sm">
//                               <div className="bg-slate-50 p-3 rounded-lg">
//                                 <div className="text-slate-500">Coverage</div>
//                                 <div className="font-semibold">
//                                   {diseaseDetails.biomarkersWithData}/{diseaseDetails.totalBiomarkers}
//                                 </div>
//                               </div>
//                               <div className="bg-slate-50 p-3 rounded-lg">
//                                 <div className="text-slate-500">Avg Score</div>
//                                 <div className="font-semibold">{diseaseDetails.avgTotalScore.toFixed(3)}</div>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="space-y-3">
//                             <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
//                               <TrendingDown className="h-4 w-4 text-green-600" />
//                               <div className="flex-1">
//                                 <div className="text-sm text-green-700 font-medium">Avg Inhibitor Score</div>
//                                 <div className="text-lg font-bold text-green-800">
//                                   {diseaseDetails.avgInhibitorScore.toFixed(3)}
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
//                               <TrendingUp className="h-4 w-4 text-yellow-600" />
//                               <div className="flex-1">
//                                 <div className="text-sm text-yellow-700 font-medium">Avg Promoter Score</div>
//                                 <div className="text-lg font-bold text-yellow-800">
//                                   {diseaseDetails.avgPromoterScore.toFixed(3)}
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
//                               <HelpCircle className="h-4 w-4 text-gray-600" />
//                               <div className="flex-1">
//                                 <div className="text-sm text-gray-700 font-medium">Avg Unknown Score</div>
//                                 <div className="text-lg font-bold text-gray-800">
//                                   {diseaseDetails.avgUnknownScore.toFixed(3)}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         <div>
//                           <h5 className="font-medium text-slate-700 mb-2">Top Biomarkers</h5>
//                           <div className="space-y-2 max-h-64 overflow-auto">
//                             {diseaseDetails.biomarkerData.slice(0, 10).map((item, index) => (
//                               <div
//                                 key={item.biomarker}
//                                 className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
//                               >
//                                 <div className="flex-1 truncate">
//                                   <span className="font-medium">{index + 1}. </span>
//                                   {item.biomarker.replace(/_/g, " ")}
//                                 </div>
//                                 <div className="font-semibold text-slate-700">{item.total_avg.toFixed(3)}</div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Circle Details */}
//                     {selectedCircle && circleDetails && (
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         <div className="space-y-4">
//                           <div>
//                             <h4 className="font-semibold text-slate-700 mb-1">
//                               {circleDetails.biomarker.replace(/_/g, " ")}
//                             </h4>
//                             <p className="text-sm text-slate-600 mb-3">{circleDetails.disease}</p>

//                             <div className="bg-blue-50 p-3 rounded-lg mb-4">
//                               <div className="text-sm text-blue-700 font-medium">Dominant Effect</div>
//                               <div className="text-lg font-bold text-blue-800">
//                                 {circleDetails.dominantType} ({(circleDetails.confidence || 0).toFixed(1)}%)
//                               </div>
//                             </div>
//                           </div>

//                           <div className="space-y-3">
//                             {circleDetails.avg_inhibitor !== null && circleDetails.avg_inhibitor !== undefined && (
//                               <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                                 <div className="text-sm font-medium text-green-700">Antagonist Effect</div>
//                                 <div className="text-lg font-bold text-green-800">
//                                   {(circleDetails.avg_inhibitor || 0).toFixed(4)} (
//                                   {(circleDetails.percent_inhibitor || 0).toFixed(1)}%)
//                                 </div>
//                               </div>
//                             )}

//                             {circleDetails.avg_promoter !== null && circleDetails.avg_promoter !== undefined && (
//                               <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                                 <div className="text-sm font-medium text-yellow-700">Agonist Effect</div>
//                                 <div className="text-lg font-bold text-yellow-800">
//                                   {(circleDetails.avg_promoter || 0).toFixed(4)} (
//                                   {(circleDetails.percent_promoter || 0).toFixed(1)}%)
//                                 </div>
//                               </div>
//                             )}

//                             {circleDetails.avg_unknown !== null && circleDetails.avg_unknown !== undefined && (
//                               <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
//                                 <div className="text-sm font-medium text-gray-700">Unknown Effect</div>
//                                 <div className="text-lg font-bold text-gray-800">
//                                   {(circleDetails.avg_unknown || 0).toFixed(4)} (
//                                   {(circleDetails.percent_unknown || 0).toFixed(1)}%)
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         <div className="space-y-4">
//                           <div className="p-3 bg-blue-50 rounded-lg">
//                             <h5 className="font-medium text-blue-800 mb-2">Clinical Significance</h5>
//                             <p className="text-sm text-blue-700">
//                               This {circleDetails.dominantType.toLowerCase()} relationship between{" "}
//                               <strong>{circleDetails.biomarker.replace(/_/g, " ")}</strong> and{" "}
//                               <strong>{circleDetails.disease}</strong> in the context of{" "}
//                               <strong>{circleDetails.symptom}</strong> suggests potential therapeutic targets.
//                             </p>
//                           </div>

//                           {/* API Data Section */}
//                           <div className="p-3 bg-slate-50 rounded-lg">
//                             <h5 className="font-medium text-slate-800 mb-2 flex items-center justify-between">
//                               <span>Additional Research Data</span>
//                               {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
//                             </h5>

//                             {isLoading && (
//                               <div className="text-center py-4">
//                                 <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
//                                 <p className="text-sm text-slate-600">Loading additional data...</p>
//                               </div>
//                             )}

//                             {apiError && (
//                               <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                                 <p className="text-sm text-red-700">
//                                   <span className="font-medium">Error:</span> {apiError}
//                                 </p>
//                               </div>
//                             )}

//                             {!isLoading && !apiError && apiData && (
//                               <div className="text-sm text-slate-700">
//                                 <p className="mb-2">
//                                   API data loaded successfully. This section will be updated to display the research
//                                   data.
//                                 </p>
//                                 <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
//                                   {JSON.stringify(apiData, null, 2)}
//                                 </pre>
//                               </div>
//                             )}

//                             {!isLoading && !apiError && !apiData && (
//                               <p className="text-sm text-slate-600">
//                                 Additional research data will appear here once loaded.
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : null}
//             </div>
//           </TabsContent>

//           <TabsContent value="plots" className="mt-0">
//             <div className="space-y-6">
//               <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
//                 <div className="flex items-center justify-between mb-6">
//                   <div>
//                     <h3 className="text-2xl font-bold text-slate-800">Statistical Analysis Plots</h3>
//                     <p className="text-slate-600 mt-1">Interactive biomarker analysis for "{symptom}"</p>
//                   </div>
//                   <Badge variant="secondary" className="text-sm">
//                     {(symptomData?.plot_data?.inhibitor?.length || 0) + (symptomData?.plot_data?.promoter?.length || 0)}{" "}
//                     Total Biomarkers
//                   </Badge>
//                 </div>

//                 {symptomData?.plot_data ? (
//                   <div className="space-y-8">
//                     {/* Inhibitor Chart */}
//                     {symptomData.plot_data.inhibitor && symptomData.plot_data.inhibitor.length > 0 && (
//                       <Card className="overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
//                         <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
//                           <CardTitle className="flex items-center gap-3 text-xl">
//                             <div className="p-2 bg-white/20 rounded-lg">
//                               <TrendingDown className="h-6 w-6" />
//                             </div>
//                             <div>
//                               <div>Inhibitor Biomarkers Analysis</div>
//                               <div className="text-green-100 text-sm font-normal mt-1">
//                                 {symptomData.plot_data.inhibitor.length} biomarkers showing inhibitory effects
//                               </div>
//                             </div>
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent className="p-6">
//                           <div className="w-full" style={{ height: "500px" }}>
//                             <BarChart
//                               width={1000}
//                               height={500}
//                               data={symptomData.plot_data.inhibitor.map((item) => {
//                                 const chartItem = {
//                                   biomarker:
//                                     item.biomarker.replace(/_/g, " ").length > 20
//                                       ? item.biomarker.replace(/_/g, " ").substring(0, 20) + "..."
//                                       : item.biomarker.replace(/_/g, " "),
//                                   fullName: item.biomarker.replace(/_/g, " "),
//                                 }
//                                 item.diseases.forEach((disease) => {
//                                   chartItem[disease.disease.replace(/\s+/g, "_")] = disease.score
//                                 })
//                                 return chartItem
//                               })}
//                               margin={{ top: 20, right: 40, left: 20, bottom: 80 }}
//                               className="w-full"
//                             >
//                               <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                               <XAxis
//                                 dataKey="biomarker"
//                                 angle={-45}
//                                 textAnchor="end"
//                                 height={100}
//                                 fontSize={11}
//                                 stroke="#475569"
//                                 tick={{ fill: "#475569" }}
//                               />
//                               <YAxis stroke="#475569" tick={{ fill: "#475569" }} fontSize={12} />
//                               <Tooltip
//                                 content={({ active, payload, label }) => {
//                                   if (active && payload && payload.length) {
//                                     const data = payload[0]?.payload
//                                     return (
//                                       <div className="bg-white p-4 border border-green-200 rounded-lg shadow-xl">
//                                         <p className="font-semibold text-green-800 mb-2">{data?.fullName || label}</p>
//                                         <div className="space-y-1">
//                                           {payload.map((entry, index) => (
//                                             <div key={index} className="flex items-center justify-between gap-4">
//                                               <div className="flex items-center gap-2">
//                                                 <div
//                                                   className="w-3 h-3 rounded"
//                                                   style={{ backgroundColor: entry.color }}
//                                                 />
//                                                 <span className="text-sm text-slate-700">
//                                                   {entry.dataKey.replace(/_/g, " ")}:
//                                                 </span>
//                                               </div>
//                                               <span className="font-semibold text-slate-900">
//                                                 {entry.value?.toFixed(4)}
//                                               </span>
//                                             </div>
//                                           ))}
//                                         </div>
//                                       </div>
//                                     )
//                                   }
//                                   return null
//                                 }}
//                               />
//                               <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
//                               {diseases.map((disease, index) => (
//                                 <Bar
//                                   key={disease}
//                                   dataKey={disease.replace(/\s+/g, "_")}
//                                   stackId="inhibitor"
//                                   fill={`hsl(${120 + index * 25}, 65%, ${45 + (index % 3) * 10}%)`}
//                                   radius={index === diseases.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
//                                 />
//                               ))}
//                             </BarChart>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     )}

//                     {/* Promoter Chart */}
//                     {symptomData.plot_data.promoter && symptomData.plot_data.promoter.length > 0 && (
//                       <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
//                         <CardHeader className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
//                           <CardTitle className="flex items-center gap-3 text-xl">
//                             <div className="p-2 bg-white/20 rounded-lg">
//                               <TrendingUp className="h-6 w-6" />
//                             </div>
//                             <div>
//                               <div>Promoter Biomarkers Analysis</div>
//                               <div className="text-amber-100 text-sm font-normal mt-1">
//                                 {symptomData.plot_data.promoter.length} biomarkers showing promotional effects
//                               </div>
//                             </div>
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent className="p-6">
//                           <div className="w-full" style={{ height: "500px" }}>
//                             <BarChart
//                               width={1000}
//                               height={500}
//                               data={symptomData.plot_data.promoter.map((item) => {
//                                 const chartItem = {
//                                   biomarker:
//                                     item.biomarker.replace(/_/g, " ").length > 20
//                                       ? item.biomarker.replace(/_/g, " ").substring(0, 20) + "..."
//                                       : item.biomarker.replace(/_/g, " "),
//                                   fullName: item.biomarker.replace(/_/g, " "),
//                                 }
//                                 item.diseases.forEach((disease) => {
//                                   chartItem[disease.disease.replace(/\s+/g, "_")] = disease.score
//                                 })
//                                 return chartItem
//                               })}
//                               margin={{ top: 20, right: 40, left: 20, bottom: 80 }}
//                               className="w-full"
//                             >
//                               <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
//                               <XAxis
//                                 dataKey="biomarker"
//                                 angle={-45}
//                                 textAnchor="end"
//                                 height={100}
//                                 fontSize={11}
//                                 stroke="#475569"
//                                 tick={{ fill: "#475569" }}
//                               />
//                               <YAxis stroke="#475569" tick={{ fill: "#475569" }} fontSize={12} />
//                               <Tooltip
//                                 content={({ active, payload, label }) => {
//                                   if (active && payload && payload.length) {
//                                     const data = payload[0]?.payload
//                                     return (
//                                       <div className="bg-white p-4 border border-amber-200 rounded-lg shadow-xl">
//                                         <p className="font-semibold text-amber-800 mb-2">{data?.fullName || label}</p>
//                                         <div className="space-y-1">
//                                           {payload.map((entry, index) => (
//                                             <div key={index} className="flex items-center justify-between gap-4">
//                                               <div className="flex items-center gap-2">
//                                                 <div
//                                                   className="w-3 h-3 rounded"
//                                                   style={{ backgroundColor: entry.color }}
//                                                 />
//                                                 <span className="text-sm text-slate-700">
//                                                   {entry.dataKey.replace(/_/g, " ")}:
//                                                 </span>
//                                               </div>
//                                               <span className="font-semibold text-slate-900">
//                                                 {entry.value?.toFixed(4)}
//                                               </span>
//                                             </div>
//                                           ))}
//                                         </div>
//                                       </div>
//                                     )
//                                   }
//                                   return null
//                                 }}
//                               />
//                               <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
//                               {diseases.map((disease, index) => (
//                                 <Bar
//                                   key={disease}
//                                   dataKey={disease.replace(/\s+/g, "_")}
//                                   stackId="promoter"
//                                   fill={`hsl(${45 + index * 25}, 70%, ${50 + (index % 3) * 8}%)`}
//                                   radius={index === diseases.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
//                                 />
//                               ))}
//                             </BarChart>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     )}

//                     {/* Enhanced Summary Statistics */}
//                     <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
//                       <CardHeader className="bg-gradient-to-r from-slate-700 to-blue-700 text-white">
//                         <CardTitle className="flex items-center gap-3">
//                           <BarChart3 className="h-6 w-6" />
//                           Summary Statistics
//                         </CardTitle>
//                         <CardDescription className="text-slate-200">
//                           Overview of biomarker associations for "{symptom}"
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent className="p-6">
//                         <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//                           <div className="text-center p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl border border-green-200 shadow-sm">
//                             <div className="text-3xl font-bold text-green-700 mb-2">
//                               {symptomData.plot_data.inhibitor?.length || 0}
//                             </div>
//                             <div className="text-sm font-medium text-green-600 mb-1">Inhibitor Biomarkers</div>
//                             <div className="text-xs text-green-500">Suppressive effects</div>
//                           </div>
//                           <div className="text-center p-6 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl border border-amber-200 shadow-sm">
//                             <div className="text-3xl font-bold text-amber-700 mb-2">
//                               {symptomData.plot_data.promoter?.length || 0}
//                             </div>
//                             <div className="text-sm font-medium text-amber-600 mb-1">Promoter Biomarkers</div>
//                             <div className="text-xs text-amber-500">Enhancing effects</div>
//                           </div>
//                         </div>

//                         {/* Additional insights */}
//                         <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
//                           <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
//                             <Info className="h-4 w-4" />
//                             Key Insights
//                           </h4>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                             <div className="flex items-start gap-2">
//                               <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
//                               <div>
//                                 <span className="font-medium text-slate-700">Inhibitor Dominance:</span>
//                                 <span className="text-slate-600 ml-1">
//                                   {(
//                                     ((symptomData.plot_data.inhibitor?.length || 0) /
//                                       ((symptomData.plot_data.inhibitor?.length || 0) +
//                                         (symptomData.plot_data.promoter?.length || 0))) *
//                                     100
//                                   ).toFixed(1)}
//                                   % of biomarkers show inhibitory effects
//                                 </span>
//                               </div>
//                             </div>
//                             <div className="flex items-start gap-2">
//                               <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
//                               <div>
//                                 <span className="font-medium text-slate-700">Promoter Activity:</span>
//                                 <span className="text-slate-600 ml-1">
//                                   {(
//                                     ((symptomData.plot_data.promoter?.length || 0) /
//                                       ((symptomData.plot_data.inhibitor?.length || 0) +
//                                         (symptomData.plot_data.promoter?.length || 0))) *
//                                     100
//                                   ).toFixed(1)}
//                                   % of biomarkers show promotional effects
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </div>
//                 ) : (
//                   <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg border-2 border-dashed border-slate-300">
//                     <div className="max-w-md mx-auto">
//                       <BarChart3 className="h-20 w-20 mx-auto mb-6 text-slate-400" />
//                       <h3 className="text-xl font-semibold text-slate-600 mb-3">No Plot Data Available</h3>
//                       <p className="text-slate-500 leading-relaxed">
//                         The analysis data does not contain plot information for this symptom. Please ensure the data
//                         includes biomarker associations.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Enhanced Tooltip */}
//       {tooltip && (
//         <div
//           className="fixed z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl text-sm pointer-events-none border border-slate-700"
//           style={{
//             left: tooltip.x,
//             top: tooltip.y,
//             transform: "translate(-50%, -100%)",
//             maxWidth: "320px",
//           }}
//         >
//           <div className="font-bold text-blue-300 mb-1">{tooltip.biomarker.replace(/_/g, " ")}</div>
//           <div className="text-slate-300 mb-2">{tooltip.disease}</div>
//           <div className="space-y-1">
//             <div className="flex justify-between">
//               <span>Total Score:</span>
//               <span className="font-semibold">{(tooltip.total_avg || 0).toFixed(4)}</span>
//             </div>
//             {tooltip.avg_inhibitor !== null && tooltip.avg_inhibitor !== undefined && (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 bg-green-500 rounded"></div>
//                   <span>Inhibitor:</span>
//                 </div>
//                 <span className="font-semibold">
//                   {(tooltip.avg_inhibitor || 0).toFixed(4)} ({(tooltip.percent_inhibitor || 0).toFixed(1)}%)
//                 </span>
//               </div>
//             )}
//             {tooltip.avg_promoter !== null && tooltip.avg_promoter !== undefined && (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 bg-yellow-500 rounded"></div>
//                   <span>Promoter:</span>
//                 </div>
//                 <span className="font-semibold">
//                   {(tooltip.avg_promoter || 0).toFixed(4)} ({(tooltip.percent_promoter || 0).toFixed(1)}%)
//                 </span>
//               </div>
//             )}
//             {tooltip.avg_unknown !== null && tooltip.avg_unknown !== undefined && (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 bg-gray-500 rounded"></div>
//                   <span>Unknown:</span>
//                 </div>
//                 <span className="font-semibold">
//                   {(tooltip.avg_unknown || 0).toFixed(4)} ({(tooltip.percent_unknown || 0).toFixed(1)}%)
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Legend */}
//       <div className="bg-white border-t border-slate-200 px-6 py-4">
//         <div className="flex items-center justify-center gap-8 text-sm">
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-green-500 rounded-full"></div>
//             <span className="font-medium">Inhibitor</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
//             <span className="font-medium">Promoter</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
//             <span className="font-medium">Unknown</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
//             <span className="font-medium">No Data</span>
//           </div>
//           <div className="text-slate-500">
//             <Info className="h-4 w-4 inline mr-1" />
//             Click diseases/circles to analyze • Hover for details
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  X,
  Info,
  TrendingUp,
  TrendingDown,
  Activity,
  HelpCircle,
  BarChart3,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function SymptomInfographic() {
  // Handle API response with NaN values
  const handleApiResponse = async (response) => {
    try {
      // Get the raw text from the response
      const text = await response.text()

      // Replace NaN with null in the text before parsing
      const cleanedText = text.replace(/:\s*NaN/g, ": null")

      // Parse the cleaned JSON
      const data = JSON.parse(cleanedText)

      // Extract the result array if it exists
      const resultArray = data.result || data

      // Filter out entries with mostly empty values
      return resultArray.filter((item) => {
        // Check if the item has meaningful data
        return (
          item.Insights ||
          (item.Direction && item.Direction !== "null") ||
          (item["Quantified Changes"] && item["Quantified Changes"] !== "null")
        )
      })
    } catch (error) {
      console.error("Error processing API response:", error)
      throw new Error(`Failed to process API response: ${error.message}`)
    }
  }

  // Process the API data to filter out N/A entries
  const processApiData = (data) => {
    if (!Array.isArray(data)) return []

    // Filter out entries where most fields are N/A or null
    return data.filter((item) => {
      // Check if the item has meaningful data
      const hasInsights = item.Insights && item.Insights !== "N/A" && item.Insights !== "NA"
      const hasDirection = item.Direction && item.Direction !== "N/A" && item.Direction !== "NA"
      const hasChanges =
        item.Quantified_Changes && item.Quantified_Changes !== "N/A" && item.Quantified_Changes !== "NA"

      return hasInsights || hasDirection || hasChanges
    })
  }

  const location = useLocation()
  const { symptomData, disease } = location.state || {}
  const [tooltip, setTooltip] = useState(null)
  const [selectedDisease, setSelectedDisease] = useState(null)
  const [diseaseDetails, setDiseaseDetails] = useState(null)
  const [selectedCircle, setSelectedCircle] = useState(null)
  const [circleDetails, setCircleDetails] = useState(null)
  const [activeTab, setActiveTab] = useState("matrix")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [apiData, setApiData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const svgContainerRef = useRef(null)
  const detailsSectionRef = useRef(null)

  // Fixed circle size
  const CIRCLE_RADIUS = 16
  const cellSize = 60 // Increased cell size for better spacing
  const margin = { top: 180, right: 60, bottom: 80, left: 320 } // Increased margins for labels

  // Fixed height for scrollable visualization
  const VISUALIZATION_HEIGHT = 600
  const biomarkers = Object.keys(symptomData?.nested_assoc || {})
  const diseases = Array.from(
    new Set(biomarkers.flatMap((biomarker) => Object.keys(symptomData?.nested_assoc[biomarker] || {}))),
  ).sort()

  console.log("Total biomarkers:", biomarkers.length)
  console.log("Total diseases:", diseases.length)
  console.log("Diseases:", diseases)

  const width = Math.max(diseases.length * cellSize + margin.left + margin.right, 1200)
  const height = biomarkers.length * cellSize + margin.top + margin.bottom

  // Scroll to center on initial load
  useEffect(() => {
    if (svgContainerRef.current) {
      const container = svgContainerRef.current
      container.scrollLeft = (width * zoomLevel - container.clientWidth) / 2
    }
  }, [width, zoomLevel])

  // Auto-scroll to details section when details are shown
  useEffect(() => {
    if ((selectedDisease && diseaseDetails) || (selectedCircle && circleDetails)) {
      setTimeout(() => {
        detailsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
  }, [selectedDisease, diseaseDetails, selectedCircle, circleDetails])

  // Show error message if no data is available
  if (!symptomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <Activity className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">No Data Available</h2>
            <p className="text-slate-600 mt-2">Please navigate here with valid symptom data.</p>
          </div>
        </Card>
      </div>
    )
  }

  const { nested_assoc: data, plots, symptom } = symptomData

  // Create gradient for colored circles (inhibitor, promoter, unknown)
  const createGradient = (inhibitorPercent, promoterPercent, unknownPercent, id) => (
    <defs key={id}>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" stopOpacity={inhibitorPercent / 100} />
        <stop offset={`${inhibitorPercent}%`} stopColor="#10b981" stopOpacity={inhibitorPercent / 100} />
        <stop offset={`${inhibitorPercent}%`} stopColor="#f59e0b" stopOpacity={promoterPercent / 100} />
        <stop
          offset={`${inhibitorPercent + promoterPercent}%`}
          stopColor="#f59e0b"
          stopOpacity={promoterPercent / 100}
        />
        <stop
          offset={`${inhibitorPercent + promoterPercent}%`}
          stopColor="#6b7280"
          stopOpacity={unknownPercent / 100}
        />
        <stop offset="100%" stopColor="#6b7280" stopOpacity={unknownPercent / 100} />
      </linearGradient>
    </defs>
  )

  // Handle mouse events for tooltip
  const handleMouseEnter = (biomarker, disease, datum, event) => {
    if (!datum) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      biomarker,
      disease,
      total_avg: datum.total_avg || 0,
      avg_inhibitor: datum.avg_inhibitor || 0,
      avg_promoter: datum.avg_promoter || 0,
      avg_unknown: datum.avg_unknown || 0,
      percent_inhibitor: datum.percent_inhibitor || 0,
      percent_promoter: datum.percent_promoter || 0,
      percent_unknown: datum.percent_unknown || 0,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  // Handle disease click
  const handleDiseaseClick = (disease) => {
    // Clear circle selection when selecting a disease
    setSelectedCircle(null)
    setCircleDetails(null)
    setApiData(null)
    setApiError(null)

    setSelectedDisease(disease)

    // Calculate statistics for this disease across all biomarkers
    const diseaseStats = {
      disease,
      totalBiomarkers: biomarkers.length,
      biomarkersWithData: 0,
      avgInhibitorScore: 0,
      avgPromoterScore: 0,
      avgUnknownScore: 0,
      avgTotalScore: 0,
      strongestInhibitor: null,
      strongestPromoter: null,
      strongestUnknown: null,
      biomarkerData: [],
    }

    let totalInhibitor = 0
    let totalPromoter = 0
    let totalUnknown = 0
    let totalScore = 0
    let maxInhibitor = 0
    let maxPromoter = 0
    let maxUnknown = 0

    biomarkers.forEach((biomarker) => {
      const datum = data[biomarker]?.[disease]
      if (datum) {
        diseaseStats.biomarkersWithData++
        totalInhibitor += datum.avg_inhibitor || 0
        totalPromoter += datum.avg_promoter || 0
        totalUnknown += datum.avg_unknown || 0
        totalScore += datum.total_avg

        if ((datum.avg_inhibitor || 0) > maxInhibitor) {
          maxInhibitor = datum.avg_inhibitor || 0
          diseaseStats.strongestInhibitor = { biomarker, score: datum.avg_inhibitor }
        }

        if ((datum.avg_promoter || 0) > maxPromoter) {
          maxPromoter = datum.avg_promoter || 0
          diseaseStats.strongestPromoter = { biomarker, score: datum.avg_promoter }
        }

        if ((datum.avg_unknown || 0) > maxUnknown) {
          maxUnknown = datum.avg_unknown || 0
          diseaseStats.strongestUnknown = { biomarker, score: datum.avg_unknown }
        }

        diseaseStats.biomarkerData.push({
          biomarker,
          ...datum,
        })
      }
    })

    if (diseaseStats.biomarkersWithData > 0) {
      diseaseStats.avgInhibitorScore = totalInhibitor / diseaseStats.biomarkersWithData
      diseaseStats.avgPromoterScore = totalPromoter / diseaseStats.biomarkersWithData
      diseaseStats.avgUnknownScore = totalUnknown / diseaseStats.biomarkersWithData
      diseaseStats.avgTotalScore = totalScore / diseaseStats.biomarkersWithData
    }

    // Sort biomarker data by total score
    diseaseStats.biomarkerData.sort((a, b) => b.total_avg - a.total_avg)

    setDiseaseDetails(diseaseStats)
  }

  // Handle circle click with API call
  const handleCircleClick = async (biomarker, disease, datum) => {
    if (!datum) return

    // Clear disease selection when selecting a circle
    setSelectedDisease(null)
    setDiseaseDetails(null)

    setSelectedCircle({ biomarker, disease })
    setCircleDetails({
      biomarker,
      disease,
      symptom,
      total_avg: datum.total_avg || 0,
      avg_inhibitor: datum.avg_inhibitor || 0,
      avg_promoter: datum.avg_promoter || 0,
      avg_unknown: datum.avg_unknown || 0,
      percent_inhibitor: datum.percent_inhibitor || 0,
      percent_promoter: datum.percent_promoter || 0,
      percent_unknown: datum.percent_unknown || 0,
      // Additional analysis
      dominantType:
        (datum.percent_inhibitor || 0) > (datum.percent_promoter || 0) &&
        (datum.percent_inhibitor || 0) > (datum.percent_unknown || 0)
          ? "Inhibitor"
          : (datum.percent_promoter || 0) > (datum.percent_unknown || 0)
            ? "Promoter"
            : "Unknown",
      confidence: Math.max(datum.percent_inhibitor || 0, datum.percent_promoter || 0, datum.percent_unknown || 0),
    })

    // Make API call to get additional data
    setIsLoading(true)
    setApiData(null)
    setApiError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ligmaballs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disease: disease,
          biomarker: biomarker,
          symptom_data: symptomData,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      // Use the new handler function
      const processedData = await handleApiResponse(response)
      console.log("Processed API data:", processedData)
      setApiData(processedData)
    } catch (error) {
      console.error("Error fetching data from API:", error)
      setApiError(error.message || "Failed to fetch data from API")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.6))
  }

  // Download image
  const downloadPlot = (plotType, base64Data) => {
    const link = document.createElement("a")
    link.href = `data:image/png;base64,${base64Data}`
    link.download = `${symptom}_${plotType}_plot.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Biomarker-Disease Association Matrix</h1>
            <p className="text-slate-600 mt-1">
              Symptom analysis for:{" "}
              <Badge variant="outline" className="ml-2 font-semibold capitalize">
                {symptom}
              </Badge>
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {biomarkers.length} biomarkers × {diseases.length} diseases
          </div>
        </div>
      </div>

      {/* Tabs for Matrix and Plots */}
      <div className="p-4">
        <Tabs defaultValue="matrix" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="matrix" className="px-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Association Matrix</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="plots" className="px-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analysis Plots</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {activeTab === "matrix" && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.6}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-slate-600">{Math.round(zoomLevel * 100)}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="matrix" className="mt-0">
            <div className="space-y-4">
              {/* Main Visualization */}
              <div className="overflow-hidden">
                <div
                  className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-auto"
                  style={{ height: `${VISUALIZATION_HEIGHT}px` }}
                >
                  <div ref={svgContainerRef} className="overflow-auto" style={{ height: "100%", width: "100%" }}>
                    <svg
                      width={width * zoomLevel}
                      height={height * zoomLevel}
                      viewBox={`0 0 ${width} ${height}`}
                      preserveAspectRatio="xMinYMin meet"
                    >
                      {/* Create gradients for all data points */}
                      {biomarkers.map((biomarker, biomarkerIndex) =>
                        diseases.map((disease, diseaseIndex) => {
                          const datum = data[biomarker]?.[disease]
                          if (!datum) return null
                          const gradientId = `gradient-${biomarkerIndex}-${diseaseIndex}`
                          return createGradient(
                            datum.percent_inhibitor,
                            datum.percent_promoter,
                            datum.percent_unknown,
                            gradientId,
                          )
                        }),
                      )}

                      {/* Y-axis labels (Biomarkers) */}
                      {biomarkers.map((biomarker, index) => (
                        <text
                          key={biomarker}
                          x={margin.left - 15}
                          y={margin.top + index * cellSize + cellSize / 2}
                          textAnchor="end"
                          dominantBaseline="middle"
                          className="text-sm font-medium fill-slate-700 hover:fill-blue-600 cursor-default"
                        >
                          {biomarker.replace(/_/g, " ")}
                        </text>
                      ))}

                      {/* X-axis labels (Diseases) - positioned at top with better spacing */}
                      {diseases.map((disease, index) => (
                        <g key={disease}>
                          <text
                            x={margin.left + index * cellSize + cellSize / 2}
                            y={margin.top - 40}
                            textAnchor="start"
                            dominantBaseline="middle"
                            className="text-sm font-semibold fill-slate-700 hover:fill-blue-600 cursor-pointer transition-colors"
                            transform={`rotate(-45, ${margin.left + index * cellSize + cellSize / 2}, ${
                              margin.top - 40
                            })`}
                            onClick={() => handleDiseaseClick(disease)}
                          >
                            {disease}
                          </text>
                          {/* Vertical guide line */}
                          <line
                            x1={margin.left + index * cellSize + cellSize / 2}
                            y1={margin.top - 10}
                            x2={margin.left + index * cellSize + cellSize / 2}
                            y2={margin.top}
                            stroke="#e2e8f0"
                            strokeDasharray="2,2"
                          />
                        </g>
                      ))}

                      {/* Complete matrix - show circle for EVERY biomarker-disease combination */}
                      {biomarkers.map((biomarker, biomarkerIndex) =>
                        diseases.map((disease, diseaseIndex) => {
                          const datum = data[biomarker]?.[disease]
                          const cx = margin.left + diseaseIndex * cellSize + cellSize / 2
                          const cy = margin.top + biomarkerIndex * cellSize + cellSize / 2

                          if (datum) {
                            // Show colored circle with data - FIXED SIZE
                            const gradientId = `gradient-${biomarkerIndex}-${diseaseIndex}`

                            return (
                              <circle
                                key={`${biomarker}-${disease}-data`}
                                cx={cx}
                                cy={cy}
                                r={CIRCLE_RADIUS}
                                fill={`url(#${gradientId})`}
                                stroke="#374151"
                                strokeWidth="1.5"
                                className="cursor-pointer hover:stroke-2 hover:stroke-blue-500 transition-all"
                                onMouseEnter={(e) => handleMouseEnter(biomarker, disease, datum, e)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handleCircleClick(biomarker, disease, datum)}
                              />
                            )
                          } else {
                            // Show grey circle for missing data - FIXED SIZE
                            return (
                              <circle
                                key={`${biomarker}-${disease}-empty`}
                                cx={cx}
                                cy={cy}
                                r={CIRCLE_RADIUS * 0.6}
                                fill="#e2e8f0"
                                stroke="#cbd5e1"
                                strokeWidth="1"
                                className="opacity-60"
                              />
                            )
                          }
                        }),
                      )}

                      {/* Grid lines for better readability */}
                      {biomarkers.map((_, index) => (
                        <line
                          key={`hgrid-${index}`}
                          x1={margin.left - 5}
                          y1={margin.top + index * cellSize}
                          x2={margin.left + diseases.length * cellSize}
                          y2={margin.top + index * cellSize}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                        />
                      ))}
                      {diseases.map((_, index) => (
                        <line
                          key={`vgrid-${index}`}
                          x1={margin.left + index * cellSize}
                          y1={margin.top - 5}
                          x2={margin.left + index * cellSize}
                          y2={margin.top + biomarkers.length * cellSize}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                        />
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Details Panel Below Visualization */}
              {(selectedDisease && diseaseDetails) || (selectedCircle && circleDetails) ? (
                <div ref={detailsSectionRef} className="bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-800">
                        {selectedDisease ? "Disease Analysis" : "Interaction Details"}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDisease(null)
                          setDiseaseDetails(null)
                          setSelectedCircle(null)
                          setCircleDetails(null)
                          setApiData(null)
                          setApiError(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Disease Details */}
                    {selectedDisease && diseaseDetails && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-slate-700 mb-2">{selectedDisease}</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <div className="text-slate-500">Coverage</div>
                                <div className="font-semibold">
                                  {diseaseDetails.biomarkersWithData}/{diseaseDetails.totalBiomarkers}
                                </div>
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <div className="text-slate-500">Avg Score</div>
                                <div className="font-semibold">{diseaseDetails.avgTotalScore.toFixed(3)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                              <TrendingDown className="h-4 w-4 text-green-600" />
                              <div className="flex-1">
                                <div className="text-sm text-green-700 font-medium">Avg Inhibitor Score</div>
                                <div className="text-lg font-bold text-green-800">
                                  {diseaseDetails.avgInhibitorScore.toFixed(3)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                              <TrendingUp className="h-4 w-4 text-yellow-600" />
                              <div className="flex-1">
                                <div className="text-sm text-yellow-700 font-medium">Avg Promoter Score</div>
                                <div className="text-lg font-bold text-yellow-800">
                                  {diseaseDetails.avgPromoterScore.toFixed(3)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <HelpCircle className="h-4 w-4 text-gray-600" />
                              <div className="flex-1">
                                <div className="text-sm text-gray-700 font-medium">Avg Unknown Score</div>
                                <div className="text-lg font-bold text-gray-800">
                                  {diseaseDetails.avgUnknownScore.toFixed(3)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-slate-700 mb-2">Top Biomarkers</h5>
                          <div className="space-y-2 max-h-64 overflow-auto">
                            {diseaseDetails.biomarkerData.slice(0, 10).map((item, index) => (
                              <div
                                key={item.biomarker}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                              >
                                <div className="flex-1 truncate">
                                  <span className="font-medium">{index + 1}. </span>
                                  {item.biomarker.replace(/_/g, " ")}
                                </div>
                                <div className="font-semibold text-slate-700">{item.total_avg.toFixed(3)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Circle Details */}
                    {selectedCircle && circleDetails && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-slate-700 mb-1">
                              {circleDetails.biomarker.replace(/_/g, " ")}
                            </h4>
                            <p className="text-sm text-slate-600 mb-3">{circleDetails.disease}</p>

                            <div className="bg-blue-50 p-3 rounded-lg mb-4">
                              <div className="text-sm text-blue-700 font-medium">Dominant Effect</div>
                              <div className="text-lg font-bold text-blue-800">
                                {circleDetails.dominantType} ({(circleDetails.confidence || 0).toFixed(1)}%)
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {circleDetails.avg_inhibitor !== null && circleDetails.avg_inhibitor !== undefined && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="text-sm font-medium text-green-700">Antagonist Effect</div>
                                <div className="text-lg font-bold text-green-800">
                                  {(circleDetails.avg_inhibitor || 0).toFixed(4)} (
                                  {(circleDetails.percent_inhibitor || 0).toFixed(1)}%)
                                </div>
                              </div>
                            )}

                            {circleDetails.avg_promoter !== null && circleDetails.avg_promoter !== undefined && (
                              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="text-sm font-medium text-yellow-700">Agonist Effect</div>
                                <div className="text-lg font-bold text-yellow-800">
                                  {(circleDetails.avg_promoter || 0).toFixed(4)} (
                                  {(circleDetails.percent_promoter || 0).toFixed(1)}%)
                                </div>
                              </div>
                            )}

                            {circleDetails.avg_unknown !== null && circleDetails.avg_unknown !== undefined && (
                              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="text-sm font-medium text-gray-700">Unknown Effect</div>
                                <div className="text-lg font-bold text-gray-800">
                                  {(circleDetails.avg_unknown || 0).toFixed(4)} (
                                  {(circleDetails.percent_unknown || 0).toFixed(1)}%)
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-800 mb-2">Clinical Significance</h5>
                            <p className="text-sm text-blue-700">
                              This {circleDetails.dominantType.toLowerCase()} relationship between{" "}
                              <strong>{circleDetails.biomarker.replace(/_/g, " ")}</strong> and{" "}
                              <strong>{circleDetails.disease}</strong> in the context of{" "}
                              <strong>{circleDetails.symptom}</strong> suggests potential therapeutic targets.
                            </p>
                          </div>

                          {/* API Data Section */}
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <h5 className="font-medium text-slate-800 mb-2 flex items-center justify-between">
                              <span>Additional Research Data</span>
                              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                            </h5>

                            {isLoading && (
                              <div className="text-center py-4">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                                <p className="text-sm text-slate-600">Loading additional data...</p>
                              </div>
                            )}

                            {apiError && (
                              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">
                                  <span className="font-medium">Error:</span> {apiError}
                                </p>
                              </div>
                            )}

                            {!isLoading && !apiError && (
                              <div className="space-y-4">
                                {apiData && apiData.length > 0 ? (
                                  apiData.map((item, index) => {
                                    // Skip items with no meaningful data
                                    if (!item.Insights && !item.Direction && !item["Quantified Changes"]) {
                                      return null
                                    }

                                    return (
                                      <Card key={index} className="overflow-hidden border-slate-200">
                                        <CardHeader className="bg-slate-50 p-4">
                                          <CardTitle className="text-base font-medium">
                                            {item.Matched_Biomarker || "Cyclooxygenase"} Analysis
                                          </CardTitle>
                                          {item.Direction && (
                                            <Badge
                                              variant={item.Direction?.includes("Increase") ? "warning" : "success"}
                                              className="mt-1"
                                            >
                                              {item.Direction}
                                            </Badge>
                                          )}
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-3">
                                          {/* Insights - Always show if available */}
                                          {item.Insights && (
                                            <div>
                                              <h6 className="text-sm font-semibold text-slate-700 mb-1">
                                                Key Insights
                                              </h6>
                                              <p className="text-sm text-slate-600">{item.Insights}</p>
                                            </div>
                                          )}

                                          {/* Quantified Changes */}
                                          {item["Quantified Changes"] && (
                                            <div>
                                              <h6 className="text-sm font-semibold text-slate-700 mb-1">
                                                Quantified Changes
                                              </h6>
                                              <p className="text-sm text-slate-600">{item["Quantified Changes"]}</p>
                                            </div>
                                          )}

                                          {/* Comparison to Reference */}
                                          {item["Comparison to Reference"] && (
                                            <div>
                                              <h6 className="text-sm font-semibold text-slate-700 mb-1">
                                                Comparison to Reference
                                              </h6>
                                              <p className="text-sm text-slate-600">
                                                {item["Comparison to Reference"]}
                                              </p>
                                            </div>
                                          )}

                                          {/* Reference Point */}
                                          {item["Reference Point"] && (
                                            <div>
                                              <h6 className="text-sm font-semibold text-slate-700 mb-1">
                                                Reference Point
                                              </h6>
                                              <p className="text-sm text-slate-600">{item["Reference Point"]}</p>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    )
                                  })
                                ) : (
                                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                                    <p className="text-slate-600">
                                      No relevant data available for this biomarker-disease combination.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {!isLoading && !apiError && !apiData && (
                              <p className="text-sm text-slate-600">
                                Additional research data will appear here once loaded.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="plots" className="mt-0">
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Statistical Analysis Plots</h3>
                    <p className="text-slate-600 mt-1">Interactive biomarker analysis for "{symptom}"</p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {(symptomData?.plot_data?.inhibitor?.length || 0) + (symptomData?.plot_data?.promoter?.length || 0)}{" "}
                    Total Biomarkers
                  </Badge>
                </div>

                {symptomData?.plot_data ? (
                  <div className="space-y-8">
                    {/* Inhibitor Chart */}
                    {symptomData.plot_data.inhibitor && symptomData.plot_data.inhibitor.length > 0 && (
                      <Card className="overflow-hidden border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <TrendingDown className="h-6 w-6" />
                            </div>
                            <div>
                              <div>Inhibitor Biomarkers Analysis</div>
                              <div className="text-green-100 text-sm font-normal mt-1">
                                {symptomData.plot_data.inhibitor.length} biomarkers showing inhibitory effects
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="text-sm text-slate-500 mb-4 flex items-center justify-center">
                            <Info className="h-4 w-4 mr-2" />
                            <span>Scroll horizontally to view all data points</span>
                          </div>
                          <div className="w-full overflow-x-auto" style={{ height: "600px" }}>
                            <div
                              style={{
                                minWidth: Math.max(1500, symptomData.plot_data.inhibitor.length * 80),
                                height: "100%",
                              }}
                            >
                              <BarChart
                                width={Math.max(1500, symptomData.plot_data.inhibitor.length * 80)}
                                height={550}
                                data={symptomData.plot_data.inhibitor.map((item) => {
                                  const chartItem = {
                                    biomarker:
                                      item.biomarker.replace(/_/g, " ").length > 20
                                        ? item.biomarker.replace(/_/g, " ").substring(0, 20) + "..."
                                        : item.biomarker.replace(/_/g, " "),
                                    fullName: item.biomarker.replace(/_/g, " "),
                                  }
                                  item.diseases.forEach((disease) => {
                                    chartItem[disease.disease.replace(/\s+/g, "_")] = disease.score
                                  })
                                  return chartItem
                                })}
                                margin={{ top: 30, right: 60, left: 40, bottom: 100 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="biomarker"
                                  angle={-45}
                                  textAnchor="end"
                                  height={120}
                                  fontSize={12}
                                  stroke="#475569"
                                  tick={{ fill: "#475569" }}
                                  interval={0}
                                  tickMargin={10}
                                />
                                <YAxis stroke="#475569" tick={{ fill: "#475569" }} fontSize={12} />
                                <Tooltip
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0]?.payload
                                      return (
                                        <div className="bg-white p-4 border border-green-200 rounded-lg shadow-xl">
                                          <p className="font-semibold text-green-800 mb-2">{data?.fullName || label}</p>
                                          <div className="space-y-1">
                                            {payload.map((entry, index) => (
                                              <div key={index} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-3 h-3 rounded"
                                                    style={{ backgroundColor: entry.color }}
                                                  />
                                                  <span className="text-sm text-slate-700">
                                                    {entry.dataKey.replace(/_/g, " ")}:
                                                  </span>
                                                </div>
                                                <span className="font-semibold text-slate-900">
                                                  {entry.value?.toFixed(4)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
                                {diseases.map((disease, index) => (
                                  <Bar
                                    key={disease}
                                    dataKey={disease.replace(/\s+/g, "_")}
                                    stackId="inhibitor"
                                    fill={`hsl(${120 + index * 25}, 65%, ${45 + (index % 3) * 10}%)`}
                                    radius={index === diseases.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                  />
                                ))}
                              </BarChart>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Promoter Chart */}
                    {symptomData.plot_data.promoter && symptomData.plot_data.promoter.length > 0 && (
                      <Card className="overflow-hidden border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
                        <CardHeader className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
                          <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                              <div>Promoter Biomarkers Analysis</div>
                              <div className="text-amber-100 text-sm font-normal mt-1">
                                {symptomData.plot_data.promoter.length} biomarkers showing promotional effects
                              </div>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="text-sm text-slate-500 mb-4 flex items-center justify-center">
                            <Info className="h-4 w-4 mr-2" />
                            <span>Scroll horizontally to view all data points</span>
                          </div>
                          <div className="w-full overflow-x-auto" style={{ height: "600px" }}>
                            <div
                              style={{
                                minWidth: Math.max(1500, symptomData.plot_data.promoter.length * 80),
                                height: "100%",
                              }}
                            >
                              <BarChart
                                width={Math.max(1500, symptomData.plot_data.promoter.length * 80)}
                                height={550}
                                data={symptomData.plot_data.promoter.map((item) => {
                                  const chartItem = {
                                    biomarker:
                                      item.biomarker.replace(/_/g, " ").length > 20
                                        ? item.biomarker.replace(/_/g, " ").substring(0, 20) + "..."
                                        : item.biomarker.replace(/_/g, " "),
                                    fullName: item.biomarker.replace(/_/g, " "),
                                  }
                                  item.diseases.forEach((disease) => {
                                    chartItem[disease.disease.replace(/\s+/g, "_")] = disease.score
                                  })
                                  return chartItem
                                })}
                                margin={{ top: 30, right: 60, left: 40, bottom: 100 }}
                                className="w-full"
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="biomarker"
                                  angle={-45}
                                  textAnchor="end"
                                  height={120}
                                  fontSize={12}
                                  stroke="#475569"
                                  tick={{ fill: "#475569" }}
                                  interval={0}
                                  tickMargin={10}
                                />
                                <YAxis stroke="#475569" tick={{ fill: "#475569" }} fontSize={12} />
                                <Tooltip
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      const data = payload[0]?.payload
                                      return (
                                        <div className="bg-white p-4 border border-amber-200 rounded-lg shadow-xl">
                                          <p className="font-semibold text-amber-800 mb-2">{data?.fullName || label}</p>
                                          <div className="space-y-1">
                                            {payload.map((entry, index) => (
                                              <div key={index} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                  <div
                                                    className="w-3 h-3 rounded"
                                                    style={{ backgroundColor: entry.color }}
                                                  />
                                                  <span className="text-sm text-slate-700">
                                                    {entry.dataKey.replace(/_/g, " ")}:
                                                  </span>
                                                </div>
                                                <span className="font-semibold text-slate-900">
                                                  {entry.value?.toFixed(4)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )
                                    }
                                    return null
                                  }}
                                />
                                <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="rect" />
                                {diseases.map((disease, index) => (
                                  <Bar
                                    key={disease}
                                    dataKey={disease.replace(/\s+/g, "_")}
                                    stackId="promoter"
                                    fill={`hsl(${45 + index * 25}, 70%, ${50 + (index % 3) * 8}%)`}
                                    radius={index === diseases.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                  />
                                ))}
                              </BarChart>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Enhanced Summary Statistics */}
                    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-blue-700 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <BarChart3 className="h-6 w-6" />
                          Summary Statistics
                        </CardTitle>
                        <CardDescription className="text-slate-200">
                          Overview of biomarker associations for "{symptom}"
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="text-center p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl border border-green-200 shadow-sm">
                            <div className="text-3xl font-bold text-green-700 mb-2">
                              {symptomData.plot_data.inhibitor?.length || 0}
                            </div>
                            <div className="text-sm font-medium text-green-600 mb-1">Inhibitor Biomarkers</div>
                            <div className="text-xs text-green-500">Suppressive effects</div>
                          </div>
                          <div className="text-center p-6 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl border border-amber-200 shadow-sm">
                            <div className="text-3xl font-bold text-amber-700 mb-2">
                              {symptomData.plot_data.promoter?.length || 0}
                            </div>
                            <div className="text-sm font-medium text-amber-600 mb-1">Promoter Biomarkers</div>
                            <div className="text-xs text-amber-500">Enhancing effects</div>
                          </div>
                        </div>

                        {/* Additional insights */}
                        <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
                          <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                            <Info className="h-4 w-4" />
                            Key Insights
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="font-medium text-slate-700">Inhibitor Dominance:</span>
                                <span className="text-slate-600 ml-1">
                                  {(
                                    ((symptomData.plot_data.inhibitor?.length || 0) /
                                      ((symptomData.plot_data.inhibitor?.length || 0) +
                                        (symptomData.plot_data.promoter?.length || 0))) *
                                    100
                                  ).toFixed(1)}
                                  % of biomarkers show inhibitory effects
                                </span>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <span className="font-medium text-slate-700">Promoter Activity:</span>
                                <span className="text-slate-600 ml-1">
                                  {(
                                    ((symptomData.plot_data.promoter?.length || 0) /
                                      ((symptomData.plot_data.inhibitor?.length || 0) +
                                        (symptomData.plot_data.promoter?.length || 0))) *
                                    100
                                  ).toFixed(1)}
                                  % of biomarkers show promotional effects
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg border-2 border-dashed border-slate-300">
                    <div className="max-w-md mx-auto">
                      <BarChart3 className="h-20 w-20 mx-auto mb-6 text-slate-400" />
                      <h3 className="text-xl font-semibold text-slate-600 mb-3">No Plot Data Available</h3>
                      <p className="text-slate-500 leading-relaxed">
                        The analysis data does not contain plot information for this symptom. Please ensure the data
                        includes biomarker associations.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enhanced Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl text-sm pointer-events-none border border-slate-700"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            maxWidth: "320px",
          }}
        >
          <div className="font-bold text-blue-300 mb-1">{tooltip.biomarker.replace(/_/g, " ")}</div>
          <div className="text-slate-300 mb-2">{tooltip.disease}</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total Score:</span>
              <span className="font-semibold">{(tooltip.total_avg || 0).toFixed(4)}</span>
            </div>
            {tooltip.avg_inhibitor !== null && tooltip.avg_inhibitor !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Inhibitor:</span>
                </div>
                <span className="font-semibold">
                  {(tooltip.avg_inhibitor || 0).toFixed(4)} ({(tooltip.percent_inhibitor || 0).toFixed(1)}%)
                </span>
              </div>
            )}
            {tooltip.avg_promoter !== null && tooltip.avg_promoter !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Promoter:</span>
                </div>
                <span className="font-semibold">
                  {(tooltip.avg_promoter || 0).toFixed(4)} ({(tooltip.percent_promoter || 0).toFixed(1)}%)
                </span>
              </div>
            )}
            {tooltip.avg_unknown !== null && tooltip.avg_unknown !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>Unknown:</span>
                </div>
                <span className="font-semibold">
                  {(tooltip.avg_unknown || 0).toFixed(4)} ({(tooltip.percent_unknown || 0).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="font-medium">Inhibitor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="font-medium">Promoter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
            <span className="font-medium">Unknown</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
            <span className="font-medium">No Data</span>
          </div>
          <div className="text-slate-500">
            <Info className="h-4 w-4 inline mr-1" />
            Click diseases/circles to analyze • Hover for details
          </div>
        </div>
      </div>
    </div>
  )
}

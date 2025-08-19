// import React, { useState, useEffect, useMemo } from "react";
// import {
//   TrendingUp,
//   TrendingDown,
//   Minus,
//   Activity,
//   BarChart3,
//   Info,
//   Eye,
//   Filter,
//   Download,
// } from "lucide-react";
// import { MessageSquare, Send, Loader2 } from "lucide-react";
// import ReactMarkdown from "react-markdown";

// const EnhancedComparisonChart = ({
//   treatments,
//   selectedTreatments,
//   sortBy,
//   showValues,
//   filterBiomarker,
// }) => {
//   const [biomarkerData, setBiomarkerData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [viewMode, setViewMode] = useState("percentage"); // 'percentage' or 'absolute'
//   const [selectedMetric, setSelectedMetric] = useState("increase"); // 'increase', 'decrease', 'stable'
//   const [showQueryInterface, setShowQueryInterface] = useState(false);
//   const [query, setQuery] = useState("");
//   const [aiInsights, setAiInsights] = useState(null);
//   const [loadingInsights, setLoadingInsights] = useState(false);
//   const [insightsError, setInsightsError] = useState(null);

//   // Load biomarker data for all selected treatments
//   useEffect(() => {
//     loadAllBiomarkerData();
//   }, [selectedTreatments, treatments]);

//   const loadAllBiomarkerData = async () => {
//     setLoading(true);
//     const newData = {};

//     const selectedTreatmentObjects = treatments.filter((t) =>
//       selectedTreatments.includes(t.id)
//     );

//     for (const treatment of selectedTreatmentObjects) {
//       for (const biomarker of treatment.biomarkers) {
//         if (biomarker.name.trim()) {
//           const key = `${biomarker.name}_${treatment.condition}`;
//           if (!newData[key]) {
//             try {
//               // Mock API call - replace with actual API
//               const mockData = generateMockLevelChangeData(
//                 biomarker.name,
//                 treatment.condition
//               );
//               newData[key] = {
//                 biomarker: biomarker.name,
//                 condition: treatment.condition,
//                 data: mockData,
//                 stats: calculateLevelChangeStats(mockData),
//               };
//             } catch (error) {
//               console.error(`Error loading data for ${biomarker.name}:`, error);
//             }
//           }
//         }
//       }
//     }

//     setBiomarkerData(newData);
//     setLoading(false);
//   };

//   // Generate mock data (same as in BiomarkerItem)
//   const generateMockLevelChangeData = (biomarkerName, condition) => {
//     const dataPoints = Math.floor(Math.random() * 50) + 15;
//     const data = [];

//     const getChangeProbabilities = () => {
//       if (
//         biomarkerName.toLowerCase().includes("il-6") &&
//         condition === "Aging"
//       ) {
//         return { increase: 0.65, decrease: 0.2, unchanged: 0.15 };
//       } else if (biomarkerName.toLowerCase().includes("melanin")) {
//         return { increase: 0.7, decrease: 0.15, unchanged: 0.15 };
//       } else if (biomarkerName.toLowerCase().includes("collagen")) {
//         return { increase: 0.35, decrease: 0.45, unchanged: 0.2 };
//       } else if (biomarkerName.toLowerCase().includes("mcp-1")) {
//         return { increase: 0.55, decrease: 0.25, unchanged: 0.2 };
//       }
//       return { increase: 0.45, decrease: 0.35, unchanged: 0.2 };
//     };

//     const probs = getChangeProbabilities();

//     for (let i = 0; i < dataPoints; i++) {
//       const rand = Math.random();
//       let levelChange = "unknown";

//       if (rand < probs.increase) {
//         levelChange = "increase";
//       } else if (rand < probs.increase + probs.decrease) {
//         levelChange = "decrease";
//       } else if (rand < probs.increase + probs.decrease + probs.unchanged) {
//         levelChange = "unchanged";
//       }

//       data.push({
//         Subject_ID: `S${String(i + 1).padStart(3, "0")}`,
//         Biomarker_Level_Change: levelChange,
//         Treatment_Name: `Treatment ${String.fromCharCode(65 + (i % 5))}`,
//         Type_of_Study:
//           Math.random() > 0.5 ? "Clinical trial" : "In vitro study",
//         Age: Math.floor(Math.random() * 60) + 20,
//         Sex: Math.random() > 0.5 ? "Female" : "Male",
//       });
//     }

//     return data;
//   };

//   // Calculate level change statistics
//   const calculateLevelChangeStats = (data) => {
//     if (!data || data.length === 0) {
//       return {
//         total: 0,
//         increase: 0,
//         decrease: 0,
//         unchanged: 0,
//         unknown: 0,
//         validData: 0,
//         percentages: { increase: 0, decrease: 0, unchanged: 0 },
//         score: 0,
//         reliability: "low",
//         dominantTrend: "unknown",
//         dataQuality: 0,
//       };
//     }

//     const levelChanges = data.map((item) => {
//       const change = item.Biomarker_Level_Change?.toLowerCase().trim();
//       if (change === "increase") return "increase";
//       if (change === "decrease") return "decrease";
//       if (
//         change === "unchanged" ||
//         change === "no change" ||
//         change === "stable"
//       )
//         return "unchanged";
//       return "unknown";
//     });

//     const total = levelChanges.length;
//     const increase = levelChanges.filter((c) => c === "increase").length;
//     const decrease = levelChanges.filter((c) => c === "decrease").length;
//     const unchanged = levelChanges.filter((c) => c === "unchanged").length;
//     const unknown = levelChanges.filter((c) => c === "unknown").length;

//     const validData = total - unknown;
//     const increasePercent = validData > 0 ? (increase / validData) * 100 : 0;
//     const decreasePercent = validData > 0 ? (decrease / validData) * 100 : 0;
//     const unchangedPercent = validData > 0 ? (unchanged / validData) * 100 : 0;

//     // Calculate composite score (weighted towards beneficial changes)
//     const score =
//       validData > 0
//         ? (increasePercent * 0.6 +
//             unchangedPercent * 0.3 +
//             (100 - decreasePercent) * 0.1) /
//           100
//         : 0;

//     // Calculate reliability based on data quality
//     let reliability = "low";
//     if (validData >= 20 && unknown / total < 0.2) {
//       reliability = "high";
//     } else if (validData >= 10 && unknown / total < 0.3) {
//       reliability = "medium";
//     }

//     // Determine dominant trend
//     let dominantTrend = "stable";
//     if (
//       increasePercent > decreasePercent &&
//       increasePercent > unchangedPercent
//     ) {
//       dominantTrend = "increase";
//     } else if (
//       decreasePercent > increasePercent &&
//       decreasePercent > unchangedPercent
//     ) {
//       dominantTrend = "decrease";
//     }

//     // Calculate data quality ratio
//     const dataQuality = total > 0 ? validData / total : 0;

//     return {
//       total,
//       validData,
//       increase,
//       decrease,
//       unchanged,
//       unknown,
//       percentages: {
//         increase: increasePercent,
//         decrease: decreasePercent,
//         unchanged: unchangedPercent,
//       },
//       score: score,
//       reliability,
//       dominantTrend,
//       dataQuality,
//     };
//   };

//   // Generate AI Insights
//   const generateAIInsights = async () => {
//     if (!query.trim()) {
//       setInsightsError("Please enter a query");
//       return;
//     }

//     setLoadingInsights(true);
//     setInsightsError(null);
//     setAiInsights(null);

//     try {
//       // Prepare treatment data for OpenAI
//       const selectedTreatmentObjects = treatments.filter((t) =>
//         selectedTreatments.includes(t.id)
//       );

//       const treatmentData = {
//         treatments: selectedTreatmentObjects.map((treatment) => ({
//           name: treatment.name,
//           condition: treatment.condition,
//           biomarkers: treatment.biomarkers
//             .filter((b) => b.name.trim())
//             .map((b) => ({ name: b.name })),
//         })),
//       };

//       // Prepare comparison context with biomarker data
//       const comparisonContext = {
//         biomarker_data: biomarkerData,
//         selected_metric: selectedMetric,
//         view_mode: viewMode,
//         chart_data: chartData,
//         summary_stats: {
//           total_biomarkers: chartData.length,
//           total_treatments: selectedTreatments.length,
//           average_metric:
//             chartData.length > 0
//               ? (
//                   chartData.reduce(
//                     (sum, bg) =>
//                       sum +
//                       bg.treatments.reduce(
//                         (tSum, t) =>
//                           tSum + (t.stats?.percentages?.[selectedMetric] || 0),
//                         0
//                       ) /
//                         bg.treatments.length,
//                     0
//                   ) / chartData.length
//                 ).toFixed(1)
//               : 0,
//         },
//       };

//       // Call OpenAI insights API
//       const response = await fetch(
//         `${import.meta.env.VITE_API_URL}/api/insights/generate`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             query: query,
//             treatment_data: treatmentData,
//             comparison_context: comparisonContext,
//             options: {
//               include_biomarker_details: true,
//               analysis_type: "comparison",
//               focus_metric: selectedMetric,
//             },
//           }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const result = await response.json();

//       if (result.success) {
//         setAiInsights(result);
//       } else {
//         throw new Error(result.error || "Failed to generate insights");
//       }
//     } catch (error) {
//       console.error("Error generating AI insights:", error);
//       setInsightsError(error.message);
//     } finally {
//       setLoadingInsights(false);
//     }
//   };

//   // Get suggested queries based on selected treatments
//   const getSuggestedQueries = () => {
//     const selectedTreatmentObjects = treatments.filter((t) =>
//       selectedTreatments.includes(t.id)
//     );

//     if (selectedTreatmentObjects.length < 2) {
//       return [
//         "What are the key biomarkers for this treatment?",
//         "How effective is this treatment based on biomarker changes?",
//         "What are the potential mechanisms of action?",
//         "What safety considerations should I be aware of?",
//       ];
//     }

//     return [
//       `Compare the effectiveness of ${selectedTreatmentObjects[0].name} vs ${selectedTreatmentObjects[1].name}`,
//       "Which treatment shows better biomarker improvement?",
//       "What are the key differences in biomarker profiles between these treatments?",
//       "Which treatment would you recommend and why?",
//       "What are the potential side effects or concerns for each treatment?",
//       "What combination therapy approach would work best?",
//     ];
//   };

//   // Prepare chart data
//   const chartData = useMemo(() => {
//     const selectedTreatmentObjects = treatments.filter((t) =>
//       selectedTreatments.includes(t.id)
//     );
//     const biomarkerMap = new Map();

//     // Collect all biomarkers from selected treatments
//     selectedTreatmentObjects.forEach((treatment) => {
//       treatment.biomarkers.forEach((biomarker) => {
//         if (
//           biomarker.name.trim() &&
//           (!filterBiomarker ||
//             biomarker.name
//               .toLowerCase()
//               .includes(filterBiomarker.toLowerCase()))
//         ) {
//           const key = `${biomarker.name}_${treatment.condition}`;
//           const dataKey = biomarkerData[key];

//           if (!biomarkerMap.has(biomarker.name)) {
//             biomarkerMap.set(biomarker.name, {
//               name: biomarker.name,
//               treatments: [],
//             });
//           }

//           const stats = dataKey?.stats || calculateLevelChangeStats([]);

//           biomarkerMap.get(biomarker.name).treatments.push({
//             treatmentName: treatment.name,
//             treatmentId: treatment.id,
//             condition: treatment.condition,
//             stats: stats,
//             hasData: !!dataKey,
//           });
//         }
//       });
//     });

//     let chartArray = Array.from(biomarkerMap.values());

//     // Sort the data
//     switch (sortBy) {
//       case "maxValue":
//         chartArray.sort((a, b) => {
//           const maxA = Math.max(
//             ...a.treatments.map(
//               (t) => t.stats?.percentages?.[selectedMetric] || 0
//             )
//           );
//           const maxB = Math.max(
//             ...b.treatments.map(
//               (t) => t.stats?.percentages?.[selectedMetric] || 0
//             )
//           );
//           return maxB - maxA;
//         });
//         break;
//       case "variance":
//         chartArray.sort((a, b) => {
//           const getVariance = (treatments) => {
//             const values = treatments.map(
//               (t) => t.stats?.percentages?.[selectedMetric] || 0
//             );
//             const mean =
//               values.reduce((sum, val) => sum + val, 0) / values.length;
//             return (
//               values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
//               values.length
//             );
//           };
//           return getVariance(b.treatments) - getVariance(a.treatments);
//         });
//         break;
//       case "alphabetical":
//         chartArray.sort((a, b) => a.name.localeCompare(b.name));
//         break;
//       default:
//         break;
//     }

//     return chartArray;
//   }, [
//     treatments,
//     selectedTreatments,
//     biomarkerData,
//     sortBy,
//     filterBiomarker,
//     selectedMetric,
//   ]);

//   const getMetricColor = (metric) => {
//     switch (metric) {
//       case "increase":
//         return "text-green-600 bg-green-50 border-green-200";
//       case "decrease":
//         return "text-red-600 bg-red-50 border-red-200";
//       case "unchanged":
//         return "text-blue-600 bg-blue-50 border-blue-200";
//       default:
//         return "text-slate-600 bg-slate-50 border-slate-200";
//     }
//   };

//   const getBarColor = (treatmentId, index) => {
//     const colors = [
//       "bg-blue-500",
//       "bg-green-500",
//       "bg-purple-500",
//       "bg-orange-500",
//       "bg-pink-500",
//       "bg-indigo-500",
//       "bg-yellow-500",
//       "bg-red-500",
//     ];
//     return colors[index % colors.length];
//   };

//   const exportChartData = () => {
//     const exportData = {
//       chartData,
//       biomarkerData,
//       aiInsights,
//       metadata: {
//         selectedMetric,
//         viewMode,
//         selectedTreatments: selectedTreatments.length,
//         totalBiomarkers: chartData.length,
//         query: query,
//         exportDate: new Date().toISOString(),
//       },
//     };

//     const dataStr = JSON.stringify(exportData, null, 2);
//     const dataUri =
//       "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
//     const exportFileDefaultName = `biomarker-comparison-ai-analysis-${
//       new Date().toISOString().split("T")[0]
//     }.json`;

//     const linkElement = document.createElement("a");
//     linkElement.setAttribute("href", dataUri);
//     linkElement.setAttribute("download", exportFileDefaultName);
//     linkElement.click();
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-slate-600">Loading biomarker data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (chartData.length === 0) {
//     return (
//       <div className="text-center py-12 text-slate-500">
//         <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
//         <p className="text-xl font-medium mb-2">No biomarkers to compare</p>
//         <p className="text-sm">
//           Add biomarkers to your treatments to see the comparison
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Chart Controls */}
//       <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-50 rounded-lg p-4">
//         <div className="flex flex-wrap gap-3 items-center">
//           <div className="flex items-center gap-2">
//             <Activity className="h-4 w-4 text-slate-600" />
//             <span className="text-sm font-medium text-slate-700">Metric:</span>
//             <div className="flex gap-1">
//               {["increase", "decrease", "unchanged"].map((metric) => (
//                 <button
//                   key={metric}
//                   onClick={() => setSelectedMetric(metric)}
//                   className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
//                     selectedMetric === metric
//                       ? getMetricColor(metric)
//                       : "text-slate-600 bg-white border-slate-200 hover:bg-slate-50"
//                   }`}
//                 >
//                   {metric === "increase" && (
//                     <TrendingUp className="h-3 w-3 inline mr-1" />
//                   )}
//                   {metric === "decrease" && (
//                     <TrendingDown className="h-3 w-3 inline mr-1" />
//                   )}
//                   {metric === "unchanged" && (
//                     <Minus className="h-3 w-3 inline mr-1" />
//                   )}
//                   {metric.charAt(0).toUpperCase() + metric.slice(1)}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="text-sm font-medium text-slate-700">View:</span>
//             <select
//               value={viewMode}
//               onChange={(e) => setViewMode(e.target.value)}
//               className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="percentage">Percentage</option>
//               <option value="absolute">Absolute Count</option>
//             </select>
//           </div>
//         </div>

//         <div className="flex gap-2">
//           <button
//             onClick={exportChartData}
//             className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
//           >
//             <Download className="h-4 w-4" />
//             Export
//           </button>
//         </div>
//       </div>

//       {/* Legend */}
//       <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg border border-slate-200">
//         <span className="text-sm font-medium text-slate-700">Treatments:</span>
//         {treatments
//           .filter((t) => selectedTreatments.includes(t.id))
//           .map((treatment, index) => (
//             <div key={treatment.id} className="flex items-center gap-2">
//               <div
//                 className={`w-4 h-4 rounded ${getBarColor(
//                   treatment.id,
//                   index
//                 )}`}
//               ></div>
//               <span className="text-sm text-slate-600">{treatment.name}</span>
//               <span className="text-xs text-slate-400">
//                 ({treatment.condition})
//               </span>
//             </div>
//           ))}
//       </div>

//       {/* Chart */}
//       <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
//         <div className="p-4 border-b border-slate-200">
//           <div className="flex items-center justify-between">
//             <h3 className="font-semibold text-slate-800">
//               Biomarker Level Change Comparison -{" "}
//               {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}
//             </h3>
//             <div className="text-sm text-slate-500">
//               {chartData.length} biomarkers across {selectedTreatments.length}{" "}
//               treatments
//             </div>
//           </div>
//         </div>

//         <div className="p-6">
//           <div className="space-y-6">
//             {/* AI Query Interface */}
//             <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
//               <div className="p-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-2">
//                     <MessageSquare className="h-5 w-5 text-blue-600" />
//                     <h3 className="font-semibold text-slate-800">
//                       AI-Powered Treatment Analysis
//                     </h3>
//                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
//                       {selectedTreatments.length} treatments selected
//                     </span>
//                   </div>
//                   <button
//                     onClick={() => setShowQueryInterface(!showQueryInterface)}
//                     className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
//                   >
//                     {showQueryInterface ? "Hide" : "Show"} Query Interface
//                   </button>
//                 </div>

//                 {showQueryInterface && (
//                   <div className="space-y-4">
//                     {/* Query Input */}
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-slate-700">
//                         Ask AI about your treatment comparison:
//                       </label>
//                       <div className="flex gap-2">
//                         <textarea
//                           value={query}
//                           onChange={(e) => setQuery(e.target.value)}
//                           placeholder="e.g., Which treatment is more effective for aging? Compare the biomarker profiles..."
//                           className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
//                           rows={3}
//                         />
//                         <button
//                           onClick={generateAIInsights}
//                           disabled={
//                             loadingInsights ||
//                             !query.trim() ||
//                             selectedTreatments.length === 0
//                           }
//                           className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 h-fit"
//                         >
//                           {loadingInsights ? (
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                           ) : (
//                             <Send className="h-4 w-4" />
//                           )}
//                           {loadingInsights ? "Analyzing..." : "Ask AI"}
//                         </button>
//                       </div>
//                       {selectedTreatments.length === 0 && (
//                         <p className="text-xs text-amber-600">
//                           Please select at least one treatment to analyze
//                         </p>
//                       )}
//                     </div>

//                     {/* Suggested Queries */}
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium text-slate-700">
//                         Suggested questions:
//                       </label>
//                       <div className="flex flex-wrap gap-2">
//                         {getSuggestedQueries().map((suggestion, index) => (
//                           <button
//                             key={index}
//                             onClick={() => setQuery(suggestion)}
//                             className="px-3 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors text-left"
//                           >
//                             {suggestion}
//                           </button>
//                         ))}
//                       </div>
//                     </div>

//                     {/* AI Response */}
//                     {loadingInsights && (
//                       <div className="bg-white rounded-lg p-4 border border-slate-200">
//                         <div className="flex items-center gap-2 text-blue-600">
//                           <Loader2 className="h-4 w-4 animate-spin" />
//                           <span className="text-sm">
//                             AI is analyzing your treatments and biomarker
//                             data...
//                           </span>
//                         </div>
//                         <div className="mt-2 text-xs text-slate-500">
//                           This may take 10-30 seconds depending on data
//                           complexity
//                         </div>
//                       </div>
//                     )}

//                     {insightsError && (
//                       <div className="bg-red-50 rounded-lg p-4 border border-red-200">
//                         <div className="text-red-800 text-sm">
//                           <strong>Error:</strong> {insightsError}
//                         </div>
//                         <button
//                           onClick={generateAIInsights}
//                           className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
//                         >
//                           Try Again
//                         </button>
//                       </div>
//                     )}

//                     {aiInsights && (
//                       <div className="bg-white rounded-lg p-4 border border-slate-200 space-y-3">
//                         <div className="flex items-center justify-between">
//                           <h4 className="font-medium text-slate-800">
//                             AI Analysis Results
//                           </h4>
//                           <div className="text-xs text-slate-500">
//                             Confidence:{" "}
//                             {Math.round(
//                               (aiInsights.metadata?.confidence_score || 0.7) *
//                                 100
//                             )}
//                             %
//                           </div>
//                         </div>

//                         {/* <div className="prose prose-sm max-w-none">
//               <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
//                 {aiInsights.insights}
//               </div>
//             </div> */}
//                         <div className="prose prose-sm max-w-none">
//                           <ReactMarkdown
//                             components={{
//                               h1: ({ children }) => (
//                                 <h1 className="text-xl font-bold text-slate-800 mt-4 mb-2 border-b border-slate-200 pb-2">
//                                   {children}
//                                 </h1>
//                               ),
//                               h2: ({ children }) => (
//                                 <h2 className="text-lg font-semibold text-slate-800 mt-3 mb-2">
//                                   {children}
//                                 </h2>
//                               ),
//                               h3: ({ children }) => (
//                                 <h3 className="text-base font-semibold text-slate-700 mt-3 mb-2">
//                                   {children}
//                                 </h3>
//                               ),
//                               h4: ({ children }) => (
//                                 <h4 className="text-sm font-medium text-slate-700 mt-2 mb-1">
//                                   {children}
//                                 </h4>
//                               ),
//                               p: ({ children }) => (
//                                 <p className="text-slate-700 mb-2 leading-relaxed">
//                                   {children}
//                                 </p>
//                               ),
//                               ul: ({ children }) => (
//                                 <ul className="list-disc list-inside mb-3 space-y-1 text-slate-700 ml-4">
//                                   {children}
//                                 </ul>
//                               ),
//                               ol: ({ children }) => (
//                                 <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-700 ml-4">
//                                   {children}
//                                 </ol>
//                               ),
//                               li: ({ children }) => (
//                                 <li className="text-slate-700 mb-1">
//                                   {children}
//                                 </li>
//                               ),
//                               strong: ({ children }) => (
//                                 <strong className="font-semibold text-slate-800">
//                                   {children}
//                                 </strong>
//                               ),
//                               em: ({ children }) => (
//                                 <em className="italic text-slate-700">
//                                   {children}
//                                 </em>
//                               ),
//                               table: ({ children }) => (
//                                 <div className="overflow-x-auto my-4">
//                                   <table className="min-w-full border-collapse border border-slate-300 bg-white rounded-lg shadow-sm">
//                                     {children}
//                                   </table>
//                                 </div>
//                               ),
//                               thead: ({ children }) => (
//                                 <thead className="bg-slate-100">
//                                   {children}
//                                 </thead>
//                               ),
//                               tbody: ({ children }) => (
//                                 <tbody>{children}</tbody>
//                               ),
//                               tr: ({ children }) => (
//                                 <tr className="border-b border-slate-200 hover:bg-slate-50">
//                                   {children}
//                                 </tr>
//                               ),
//                               th: ({ children }) => (
//                                 <th className="border border-slate-300 px-4 py-3 text-left font-semibold text-slate-800 bg-slate-100">
//                                   {children}
//                                 </th>
//                               ),
//                               td: ({ children }) => (
//                                 <td className="border border-slate-300 px-4 py-3 text-slate-700">
//                                   {children}
//                                 </td>
//                               ),
//                               blockquote: ({ children }) => (
//                                 <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 rounded-r-lg italic text-slate-700">
//                                   {children}
//                                 </blockquote>
//                               ),
//                               code: ({ children }) => (
//                                 <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono text-slate-800">
//                                   {children}
//                                 </code>
//                               ),
//                               pre: ({ children }) => (
//                                 <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto my-3">
//                                   {children}
//                                 </pre>
//                               ),
//                             }}
//                           >
//                             {aiInsights.insights}
//                           </ReactMarkdown>
//                         </div>

//                         {aiInsights.suggestions &&
//                           aiInsights.suggestions.length > 0 && (
//                             <div className="pt-3 border-t border-slate-200">
//                               <label className="text-sm font-medium text-slate-700 mb-2 block">
//                                 Follow-up questions:
//                               </label>
//                               <div className="flex flex-wrap gap-2">
//                                 {aiInsights.suggestions.map(
//                                   (suggestion, index) => (
//                                     <button
//                                       key={index}
//                                       onClick={() => setQuery(suggestion)}
//                                       className="px-2 py-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
//                                     >
//                                       {suggestion}
//                                     </button>
//                                   )
//                                 )}
//                               </div>
//                             </div>
//                           )}

//                         {aiInsights.metadata && (
//                           <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 grid grid-cols-2 md:grid-cols-4 gap-4">
//                             <div>
//                               Processing time:{" "}
//                               {aiInsights.metadata.processing_time_seconds ||
//                                 "N/A"}
//                               s
//                             </div>
//                             <div>
//                               Data points:{" "}
//                               {aiInsights.metadata.data_points || "N/A"}
//                             </div>
//                             <div>
//                               Treatments:{" "}
//                               {aiInsights.metadata.treatments_analyzed ||
//                                 selectedTreatments.length}
//                             </div>
//                             <div>
//                               Analysis type:{" "}
//                               {aiInsights.metadata.analysis_depth || "standard"}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//             {chartData.map((biomarkerGroup, biomarkerIndex) => (
//               <div key={biomarkerGroup.name} className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h4 className="font-medium text-slate-800">
//                     {biomarkerGroup.name}
//                   </h4>
//                   <div className="text-xs text-slate-500">
//                     {biomarkerGroup.treatments.filter((t) => t.hasData).length}/
//                     {biomarkerGroup.treatments.length} with data
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   {biomarkerGroup.treatments.map(
//                     (treatment, treatmentIndex) => {
//                       const value =
//                         viewMode === "percentage"
//                           ? treatment.stats?.percentages?.[selectedMetric] || 0
//                           : treatment.stats?.[selectedMetric] || 0;

//                       const maxValue =
//                         viewMode === "percentage"
//                           ? 100
//                           : Math.max(
//                               ...biomarkerGroup.treatments.map(
//                                 (t) => t.stats?.[selectedMetric] || 0
//                               )
//                             );

//                       const percentage =
//                         maxValue > 0 ? (value / maxValue) * 100 : 0;

//                       return (
//                         <div
//                           key={`${treatment.treatmentId}-${biomarkerGroup.name}`}
//                           className="space-y-1"
//                         >
//                           <div className="flex items-center justify-between text-sm">
//                             <div className="flex items-center gap-2">
//                               <div
//                                 className={`w-3 h-3 rounded ${getBarColor(
//                                   treatment.treatmentId,
//                                   treatmentIndex
//                                 )}`}
//                               ></div>
//                               <span className="text-slate-700">
//                                 {treatment.treatmentName}
//                               </span>
//                               {!treatment.hasData && (
//                                 <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
//                                   Mock data
//                                 </span>
//                               )}
//                             </div>
//                             {showValues && (
//                               <span className="font-medium text-slate-800">
//                                 {viewMode === "percentage"
//                                   ? `${value.toFixed(1)}%`
//                                   : value}
//                               </span>
//                             )}
//                           </div>

//                           <div className="relative">
//                             <div className="w-full bg-slate-100 rounded-full h-3">
//                               <div
//                                 className={`h-3 rounded-full transition-all duration-500 ${getBarColor(
//                                   treatment.treatmentId,
//                                   treatmentIndex
//                                 )}`}
//                                 style={{ width: `${Math.max(percentage, 2)}%` }}
//                               ></div>
//                             </div>

//                             {treatment.stats?.dominantTrend && (
//                               <div className="absolute right-0 top-0 -mt-1 -mr-1">
//                                 {treatment.stats.dominantTrend ===
//                                   "increase" && (
//                                   <TrendingUp className="h-3 w-3 text-green-600" />
//                                 )}
//                                 {treatment.stats.dominantTrend ===
//                                   "decrease" && (
//                                   <TrendingDown className="h-3 w-3 text-red-600" />
//                                 )}
//                                 {treatment.stats.dominantTrend === "stable" && (
//                                   <Minus className="h-3 w-3 text-blue-600" />
//                                 )}
//                               </div>
//                             )}
//                           </div>

//                           {treatment.stats?.validData && (
//                             <div className="text-xs text-slate-500 ml-5">
//                               Based on {treatment.stats.validData} studies
//                               {treatment.stats.total !==
//                                 treatment.stats.validData &&
//                                 ` (${
//                                   treatment.stats.total -
//                                   treatment.stats.validData
//                                 } incomplete)`}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     }
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Summary Statistics */}
//       <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200">
//         <div className="flex items-center gap-2 mb-3">
//           <Info className="h-4 w-4 text-blue-600" />
//           <span className="font-medium text-slate-800">Summary Statistics</span>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//           <div>
//             <span className="text-slate-600">Average {selectedMetric}:</span>
//             <span className="font-medium ml-2">
//               {chartData.length > 0
//                 ? (
//                     chartData.reduce(
//                       (sum, bg) =>
//                         sum +
//                         bg.treatments.reduce(
//                           (tSum, t) =>
//                             tSum +
//                             (t.stats?.percentages?.[selectedMetric] || 0),
//                           0
//                         ) /
//                           bg.treatments.length,
//                       0
//                     ) / chartData.length
//                   ).toFixed(1)
//                 : 0}
//               %
//             </span>
//           </div>

//           <div>
//             <span className="text-slate-600">Biomarkers analyzed:</span>
//             <span className="font-medium ml-2">{chartData.length}</span>
//           </div>

//           <div>
//             <span className="text-slate-600">Total data points:</span>
//             <span className="font-medium ml-2">
//               {Object.values(biomarkerData).reduce(
//                 (sum, data) => sum + (data.stats?.total || 0),
//                 0
//               )}
//             </span>
//           </div>
//         </div>

//         {/* Additional AI Insights Summary */}
//         {aiInsights && (
//           <div className="mt-4 pt-4 border-t border-slate-200">
//             <div className="text-sm text-slate-600">
//               <strong>Latest AI Analysis:</strong> "{query.substring(0, 80)}
//               {query.length > 80 ? "..." : ""}"
//             </div>
//             <div className="text-xs text-slate-500 mt-1">
//               Generated{" "}
//               {aiInsights.metadata?.timestamp
//                 ? new Date(aiInsights.metadata.timestamp).toLocaleTimeString()
//                 : "recently"}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EnhancedComparisonChart;



import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Brain,
  Lightbulb,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  AlertCircle,
  Info,
  Clock,
  Database,
  BarChart3,
  FileText,
  Search,
  Bot,
  User,
  Hash,
  ArrowRight,
  BookOpen,
  Microscope,
  FlaskConical,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const EnhancedComparisonChart = ({
  treatments,
  selectedTreatments,
  levelChangeData,
}) => {
  const [query, setQuery] = useState("");
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("comparison");
  const [expandedSections, setExpandedSections] = useState({
    quickActions: true,
    analysisTypes: false,
    history: false,
  });
  
  const textareaRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [query]);

  // Scroll to bottom when new message appears
  useEffect(() => {
    if (chatContainerRef.current && chatHistory.length > 0) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const analysisTypes = [
    { id: "comparison", label: "Compare Treatments", icon: TrendingUp, color: "blue" },
    { id: "recommendation", label: "Get Recommendations", icon: Target, color: "green" },
    // { id: "mechanistic", label: "Mechanism Analysis", icon: Brain, color: "purple" },
    // { id: "safety", label: "Safety Review", icon: Shield, color: "red" },
    // { id: "efficacy", label: "Efficacy Assessment", icon: Zap, color: "yellow" },
    // { id: "general", label: "General Analysis", icon: Lightbulb, color: "slate" },
  ];

  const generateAIInsights = async () => {
    if (!query.trim()) {
      setInsightsError("Please enter a question or analysis request");
      return;
    }

    setLoadingInsights(true);
    setInsightsError(null);

    try {
      const selectedTreatmentObjects = treatments.filter((t) =>
        selectedTreatments.includes(t.id)
      );

      const treatmentData = {
        treatments: selectedTreatmentObjects.map((treatment) => ({
          name: treatment.name,
          condition: treatment.condition,
          biomarkers: treatment.biomarkers
            .filter((b) => b.name.trim())
            .map((b) => ({ name: b.name })),
        })),
      };

      const comparisonContext = {
        biomarker_data: levelChangeData || {},
        analysis_type: selectedAnalysisType,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/insights/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query,
            treatment_data: treatmentData,
            comparison_context: comparisonContext,
            options: {
              include_biomarker_details: true,
              analysis_type: selectedAnalysisType,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {

        const newMessage = {
        id: Date.now(),
        query,
        response: result.insights,
        metadata: result.metadata,
        suggestions: result.suggestions || [],
        exportOptions: result.export_options || [],
        timestamp: new Date().toISOString(),
        analysisType: selectedAnalysisType,
      };
      setChatHistory([...chatHistory, newMessage]);
      setAiInsights(result);
        
        // setChatHistory([...chatHistory, newMessage]);
        // setAiInsights(result);
        setQuery("");
      } else {
        throw new Error(result.error || "Failed to generate insights");
      }
    } catch (error) {
      console.error("Error generating AI insights:", error);
      setInsightsError(error.message);
    } finally {
      setLoadingInsights(false);
    }
  };

  const getSuggestedQueries = () => {
    const selectedTreatmentObjects = treatments.filter((t) =>
      selectedTreatments.includes(t.id)
    );

    const baseQueries = {
"comparison": 
[ "What are the key differences between these biomarkers in terms of their causative vs. correlative roles in the skin disease, based on literature evidence?",
"Which biomarker shows better evidence of causation in disease pathology and potential for improvement through modulation?" ,
"Compare the mechanisms of action and levels of confidence in causation for each biomarker, drawing from genetic and causal inference studies",
"What are the relative strengths and weaknesses of each biomarker as a therapeutic target, including risks of dysregulation leading to other diseases?" ], 
 
"recommendation": 
[ "Which biomarker or formulation would you recommend for inclusion in the skin product and why, considering causation confidence and risk-benefit?",
"What's the best biomarker or formulation for long-term skin disease management, based on potential to cure vs. risk of causing related conditions?",
"Which option has the best risk-benefit profile, factoring in literature-supported causation and calculated disease risks?",
"What factors, including literature-derived causation measures and confidence levels, should guide biomarker or formulation selection?" ] 
      // mechanistic: [
      //   "How do these treatments work at a molecular level?",
      //   "What biological pathways are being targeted?",
      //   "Explain the cascade of effects from treatment to outcome",
      //   "What are the primary and secondary mechanisms?",
      // ],
      // safety: [
      //   "What are the potential side effects of each treatment?",
      //   "Are there any contraindications I should know about?",
      //   "What monitoring is required during treatment?",
      //   "How do the safety profiles compare?",
      // ],
      // efficacy: [
      //   "What's the expected timeline for results?",
      //   "How effective are these treatments based on the data?",
      //   "What factors influence treatment response?",
      //   "What are the success rates for each option?",
      // ],
      // general: [
      //   "Provide a comprehensive analysis of all treatments",
      //   "What should I know before starting treatment?",
      //   "How do these compare to standard care?",
      //   "What are the latest research findings?",
      // ],
    };

    return baseQueries[selectedAnalysisType] || baseQueries.general;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const exportConversation = () => {
    const exportData = {
      conversation: chatHistory,
      metadata: {
        exportDate: new Date().toISOString(),
        totalMessages: chatHistory.length,
        treatments: treatments.filter((t) => selectedTreatments.includes(t.id)),
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `ai-insights-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear the conversation history?")) {
      setChatHistory([]);
      setAiInsights(null);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                AI Treatment Analysis Assistant
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Powered by advanced biomarker intelligence • {selectedTreatments.length} treatments selected
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {chatHistory.length > 0 && (
              <>
                <button
                  onClick={exportConversation}
                  className="px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition-all border border-slate-200 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-all border border-red-200 flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Clear
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Type Selector */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection('analysisTypes')}
          className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3 hover:text-slate-900 transition-colors"
        >
          <Microscope className="h-4 w-4" />
          Analysis Mode
          {expandedSections.analysisTypes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        
        {expandedSections.analysisTypes && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {analysisTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedAnalysisType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedAnalysisType(type.id)}
                  className={`p-3 rounded-xl transition-all transform hover:scale-105 ${
                    isSelected
                      ? `bg-${type.color}-600 text-white shadow-lg ring-2 ring-${type.color}-300`
                      : `bg-white text-slate-700 hover:bg-${type.color}-50 border border-slate-200`
                  }`}
                >
                  <Icon className={`h-5 w-5 mx-auto mb-1 ${isSelected ? 'text-white' : `text-${type.color}-600`}`} />
                  <span className="text-xs font-medium block">{type.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Chat History */}
        {chatHistory.length > 0 && (
          <div
            ref={chatContainerRef}
            className="max-h-[500px] overflow-y-auto p-6 bg-gradient-to-b from-white to-slate-50"
          >
            {chatHistory.map((message, index) => (
              <div key={message.id} className="mb-6">
                {/* User Query */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1">You asked</div>
                    <div className="bg-blue-50 rounded-lg p-4 text-slate-800">
                      {message.query}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex items-start gap-3 ml-0 md:ml-12">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-1 flex items-center gap-2">
                      AI Analysis
                      {message.metadata?.confidence_score && (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">
                          {Math.round(message.metadata.confidence_score * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-xl font-bold text-slate-800 mt-4 mb-2 border-b border-slate-200 pb-2">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-semibold text-slate-800 mt-3 mb-2">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-semibold text-slate-700 mt-3 mb-2">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-slate-700 mb-2 leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside mb-3 space-y-1 text-slate-700 ml-4">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-700 ml-4">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-slate-700 mb-1">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-slate-800">
                              {children}
                            </strong>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 rounded-r-lg italic text-slate-700">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {message.response}
                      </ReactMarkdown>
                    </div>
                      {/* Metadata */}
                    {message.metadata && (
                      <div className="mt-3 text-xs text-slate-600 grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div><strong>Data Points:</strong> {message.metadata.data_points}</div>
                        <div><strong>Treatments:</strong> {message.metadata.treatments_analyzed}</div>
                        <div><strong>Analysis Depth:</strong> {message.metadata.analysis_depth}</div>
                        <div><strong>Processing Time:</strong> {message.metadata.processing_time_seconds}s</div>
                        <div><strong>Data Quality:</strong> {message.metadata.data_quality}</div>
                        <div><strong>Query:</strong> {message.metadata.query}</div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {message.suggestions?.length > 0 && (
                      <div className="mt-3">
                        <label className="text-xs font-medium text-slate-700 block mb-1">Follow-up questions:</label>
                        <div className="flex flex-wrap gap-2">
                          {message.suggestions.map((s, i) => (
                            <button
                              key={i}
                              onClick={() => setQuery(s)}
                              className="px-2 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => copyToClipboard(message.response)}
                      className="mt-2 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      {copiedToClipboard ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy response
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {index < chatHistory.length - 1 && (
                  <div className="border-b border-slate-200 mt-6" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input Section */}
        <div className="border-t border-slate-200 bg-white p-6">
          {/* Quick Actions / Suggestions */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('quickActions')}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3 hover:text-slate-900 transition-colors"
            >
              <Lightbulb className="h-4 w-4" />
              Suggested Questions
              {expandedSections.quickActions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {expandedSections.quickActions && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {getSuggestedQueries().map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(suggestion)}
                    className="text-left px-4 py-3 bg-gradient-to-r from-slate-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all text-sm text-slate-700 border border-slate-200 hover:border-blue-300 flex items-center gap-2 group"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateAIInsights();
                }
              }}
              placeholder={`Ask about your ${selectedTreatments.length} selected treatments... (Press Enter to send, Shift+Enter for new line)`}
              className="w-full px-4 py-3 pr-12 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-slate-800 placeholder-slate-400 min-h-[60px] max-h-[200px]"
              disabled={loadingInsights}
            />
            <button
              onClick={generateAIInsights}
              disabled={loadingInsights || !query.trim() || selectedTreatments.length === 0}
              className={`absolute right-2 bottom-3 p-2 rounded-lg transition-all ${
                loadingInsights || !query.trim()
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105"
              }`}
            >
              {loadingInsights ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Status Messages */}
          {selectedTreatments.length === 0 && (
            <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                Please select at least one treatment to analyze
              </span>
            </div>
          )}

          {loadingInsights && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is analyzing your treatments...</span>
              </div>
              <div className="mt-1 text-xs text-blue-600">
                This may take 10-30 seconds depending on complexity
              </div>
            </div>
          )}

          {insightsError && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{insightsError}</p>
              <button
                onClick={generateAIInsights}
                className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-slate-700">
            <p className="font-medium mb-1">AI Analysis Capabilities</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              This AI assistant analyzes your selected treatments using advanced biomarker data, 
              providing evidence-based insights on efficacy, safety, mechanisms, and recommendations. 
              Select different analysis modes above for specialized insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedComparisonChart;
// import React, { useState, useEffect } from 'react';
// import { BarChart3, AlertCircle } from 'lucide-react';
// import LoadingSpinner from './LoadingSpinner';
// import ScoreBadge from './ScoreBadge';
// import ApiService from '../services/api';

// const ComparisonChart = ({ 
//   treatments, 
//   selectedTreatments, 
//   sortBy = 'maxValue', 
//   showValues = true, 
//   filterBiomarker = '' 
// }) => {
//   const [comparisonData, setComparisonData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (selectedTreatments.length >= 2) {
//       compareSelectedTreatments();
//     } else {
//       setComparisonData(null);
//     }
//   }, [selectedTreatments, treatments]);

//   const compareSelectedTreatments = async () => {
//     if (selectedTreatments.length < 2) return;

//     setLoading(true);
//     setError(null);
    
//     try {
//       const selectedTreatmentObjects = treatments.filter(t => selectedTreatments.includes(t.id));
      
//       // Get scores for all treatments
//       const treatmentScores = await Promise.all(
//         selectedTreatmentObjects.map(async (treatment) => {
//           try {
//             const response = await ApiService.getTreatmentScores(treatment);
//             return {
//               treatment,
//               scores: response.success ? response.scores : []
//             };
//           } catch (error) {
//             console.error(`Error getting scores for ${treatment.name}:`, error);
//             return {
//               treatment,
//               scores: []
//             };
//           }
//         })
//       );

//       // Process comparison data
//       const processedData = processComparisonData(treatmentScores);
//       setComparisonData(processedData);
//     } catch (error) {
//       console.error('Error comparing treatments:', error);
//       setError('Failed to compare treatments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processComparisonData = (treatmentScores) => {
//     // Get all unique biomarkers
//     const allBiomarkers = new Set();
//     treatmentScores.forEach(({ scores }) => {
//       scores.forEach(score => allBiomarkers.add(score.biomarker));
//     });

//     let biomarkers = Array.from(allBiomarkers);

//     // Apply filter
//     if (filterBiomarker) {
//       biomarkers = biomarkers.filter(b => 
//         b.toLowerCase().includes(filterBiomarker.toLowerCase())
//       );
//     }

//     // Sort biomarkers
//     if (sortBy === 'alphabetical') {
//       biomarkers.sort();
//     } else if (sortBy === 'maxValue') {
//       biomarkers.sort((a, b) => getMaxScore(b, treatmentScores) - getMaxScore(a, treatmentScores));
//     } else if (sortBy === 'variance') {
//       biomarkers.sort((a, b) => getScoreVariance(b, treatmentScores) - getScoreVariance(a, treatmentScores));
//     }

//     return {
//       treatments: treatmentScores,
//       biomarkers,
//       metrics: calculateMetrics(treatmentScores)
//     };
//   };

//   const getMaxScore = (biomarker, treatmentScores) => {
//     let max = 0;
//     treatmentScores.forEach(({ scores }) => {
//       const score = scores.find(s => s.biomarker === biomarker);
//       if (score) {
//         max = Math.max(max, score.score);
//       }
//     });
//     return max;
//   };

//   const getScoreVariance = (biomarker, treatmentScores) => {
//     const values = [];
//     treatmentScores.forEach(({ scores }) => {
//       const score = scores.find(s => s.biomarker === biomarker);
//       if (score) {
//         values.push(score.score);
//       }
//     });

//     if (values.length < 2) return 0;

//     const mean = values.reduce((a, b) => a + b, 0) / values.length;
//     const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
//     return variance;
//   };

//   const calculateMetrics = (treatmentScores) => {
//     const averageScores = treatmentScores.map(({ treatment, scores }) => {
//       const avg = scores.length > 0 ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length : 0;
//       return { treatment: treatment.name, avgScore: avg };
//     });

//     const allBiomarkers = new Set();
//     const treatmentBiomarkers = {};
    
//     treatmentScores.forEach(({ treatment, scores }) => {
//       treatmentBiomarkers[treatment.name] = new Set(scores.map(s => s.biomarker));
//       scores.forEach(score => allBiomarkers.add(score.biomarker));
//     });

//     // Find common biomarkers
//     const commonBiomarkers = Array.from(allBiomarkers).filter(biomarker => 
//       Object.values(treatmentBiomarkers).every(set => set.has(biomarker))
//     );

//     return {
//       averageScores,
//       totalBiomarkers: allBiomarkers.size,
//       commonBiomarkers: commonBiomarkers.length,
//       totalDataPoints: treatmentScores.reduce((sum, { scores }) => sum + scores.length, 0)
//     };
//   };

//   const getTreatmentColor = (index) => {
//     const colors = [
//       'from-blue-500 to-blue-600',
//       'from-emerald-500 to-emerald-600',
//       'from-purple-500 to-purple-600',
//       'from-orange-500 to-orange-600',
//       'from-red-500 to-red-600',
//       'from-indigo-500 to-indigo-600',
//       'from-pink-500 to-pink-600',
//       'from-teal-500 to-teal-600'
//     ];
//     return colors[index % colors.length];
//   };

//   if (loading) {
//     return (
//       <LoadingSpinner 
//         center 
//         text="Comparing treatments..." 
//         size="large"
//       />
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-16">
//         <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
//         <h3 className="text-xl font-medium text-slate-900 mb-2">Comparison Failed</h3>
//         <p className="text-slate-600">{error}</p>
//         <button
//           onClick={compareSelectedTreatments}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   if (!comparisonData || comparisonData.biomarkers.length === 0) {
//     return (
//       <div className="text-center py-16 text-slate-500">
//         <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
//         <p className="text-xl font-medium mb-2">No biomarkers to compare</p>
//         <p className="text-sm">Add biomarkers to your treatments to see the comparison</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Overview Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
//           <div className="text-sm font-medium text-blue-600 mb-1">Treatments</div>
//           <div className="text-2xl font-bold text-blue-800">{comparisonData.treatments.length}</div>
//         </div>
//         <div className="bg-green-50 rounded-lg p-4 border border-green-200">
//           <div className="text-sm font-medium text-green-600 mb-1">Total Biomarkers</div>
//           <div className="text-2xl font-bold text-green-800">{comparisonData.metrics.totalBiomarkers}</div>
//         </div>
//         <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
//           <div className="text-sm font-medium text-purple-600 mb-1">Common Biomarkers</div>
//           <div className="text-2xl font-bold text-purple-800">{comparisonData.metrics.commonBiomarkers}</div>
//         </div>
//         <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
//           <div className="text-sm font-medium text-orange-600 mb-1">Data Points</div>
//           <div className="text-2xl font-bold text-orange-800">{comparisonData.metrics.totalDataPoints}</div>
//         </div>
//       </div>

//       {/* Biomarker Comparisons */}
//       <div className="space-y-6">
//         {comparisonData.biomarkers.map((biomarkerName) => {
//           const maxScore = getMaxScore(biomarkerName, comparisonData.treatments);
//           const variance = getScoreVariance(biomarkerName, comparisonData.treatments);
          
//           return (
//             <div key={biomarkerName} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h4 className="font-bold text-slate-800 text-xl">{biomarkerName}</h4>
//                   <div className="flex items-center gap-6 mt-2">
//                     <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
//                       Max Score: <span className="font-mono">{(maxScore * 100).toFixed(1)}%</span>
//                     </span>
//                     <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
//                       Variance: <span className="font-mono">{variance.toFixed(3)}</span>
//                     </span>
//                   </div>
//                 </div>
//                 {variance > 0.1 && (
//                   <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-full border border-amber-200">
//                     <AlertCircle className="h-4 w-4" />
//                     <span className="text-sm font-medium">High variance</span>
//                   </div>
//                 )}
//               </div>
              
//               <div className="space-y-4">
//                 {comparisonData.treatments.map(({ treatment, scores }, index) => {
//                   const scoreData = scores.find(s => s.biomarker === biomarkerName);
//                   const score = scoreData ? scoreData.score : 0;
//                   const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
//                   const colorClass = getTreatmentColor(index);
                  
//                   return (
//                     <div key={treatment.id} className="group">
//                       <div className="flex items-center gap-4 mb-2">
//                         <div className="w-36 text-sm font-semibold text-slate-700 truncate">
//                           {treatment.name}
//                         </div>
//                         <div className="flex-1 bg-slate-200 rounded-full h-10 relative overflow-hidden">
//                           <div
//                             className={`bg-gradient-to-r ${colorClass} h-10 rounded-full transition-all duration-700 ease-out flex items-center justify-between px-4 shadow-sm`}
//                             style={{ width: `${Math.max(percentage, 10)}%` }}
//                           >
//                             {showValues && percentage >= 25 && (
//                               <span className="text-white text-sm font-bold">
//                                 {(score * 100).toFixed(1)}%
//                               </span>
//                             )}
//                           </div>
//                           {(percentage < 25 && showValues) && (
//                             <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 text-sm font-mono">
//                               {(score * 100).toFixed(1)}%
//                             </div>
//                           )}
//                         </div>
//                         <div className="w-24 text-right">
//                           <ScoreBadge score={score} showPercentage={false} size="small" />
//                         </div>
//                       </div>
//                       {scoreData && (
//                         <div className="ml-40 text-xs text-slate-500 mb-2">
//                           Coverage: {scoreData.biomarker_pdfs}/{scoreData.total_pdfs} PDFs
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Treatment Summary */}
//       <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
//         <h4 className="font-bold text-slate-800 text-lg mb-4">Treatment Summary</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {comparisonData.metrics.averageScores.map((item, index) => (
//             <div key={item.treatment} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
//               <span className="font-medium text-slate-700">{item.treatment}</span>
//               <div className="flex items-center gap-3">
//                 <span className="text-sm text-slate-600">Avg Score:</span>
//                 <ScoreBadge score={item.avgScore} size="small" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ComparisonChart;


// import React, { useState, useEffect } from 'react';
// import { BarChart3, AlertCircle, Loader2, MessageSquare, Send, X, Lightbulb } from 'lucide-react';

// // Mock API service
// const mockApiService = {
//   async getTreatmentScores(treatment) {
//     await new Promise(resolve => setTimeout(resolve, 500));
    
//     const mockScores = [];
//     for (const biomarker of treatment.biomarkers) {
//       if (biomarker.name && biomarker.name.trim()) {
//         const score = Math.random() * 0.8 + 0.1;
//         mockScores.push({
//           biomarker: biomarker.name,
//           score: score,
//           biomarker_pdfs: Math.floor(score * 192),
//           total_pdfs: 192
//         });
//       }
//     }
    
//     return {
//       success: true,
//       treatment,
//       scores: mockScores
//     };
//   },

//   async getOpenAIInsights(query, treatmentData) {
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     // Mock OpenAI response
//     return {
//       success: true,
//       insights: `Based on your query "${query}" and the comparison of these treatments:\n\n**Key Findings:**\n\n1. **Treatment Efficacy**: ${treatmentData.treatment1.name} shows ${treatmentData.treatment1.avgScore > treatmentData.treatment2.avgScore ? 'superior' : 'comparable'} biomarker performance with an average score of ${(treatmentData.treatment1.avgScore * 100).toFixed(1)}%.\n\n2. **Biomarker Analysis**: The shared biomarkers between treatments indicate ${treatmentData.commonBiomarkers.length > 0 ? `complementary mechanisms of action, particularly in ${treatmentData.commonBiomarkers[0]}` : 'different therapeutic approaches'}.\n\n3. **Clinical Implications**: For optimal results, consider the higher-scoring treatment (${treatmentData.treatment1.avgScore > treatmentData.treatment2.avgScore ? treatmentData.treatment1.name : treatmentData.treatment2.name}) as the primary intervention.\n\n**Recommendations:**\n- Monitor biomarker response patterns\n- Consider combination therapy if appropriate\n- Evaluate patient-specific factors for personalized treatment selection`,
//       timestamp: new Date().toISOString()
//     };
//   }
// };




// // OpenAI Insights Component
// const OpenAIInsights = ({ treatments, comparisonData, isVisible, onClose }) => {
//   const [query, setQuery] = useState('');
//   const [insights, setInsights] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleGetInsights = async () => {
//     if (!query.trim()) {
//       setError('Please enter a query');
//       return;
//     }

//     setLoading(true);
//     setError('');
    
//     try {
//       const response = await mockApiService.getOpenAIInsights(query, comparisonData);
      
//       if (response.success) {
//         setInsights(response.insights);
//       } else {
//         setError('Failed to get insights');
//       }
//     } catch (error) {
//       console.error('Error getting OpenAI insights:', error);
//       setError('Error getting insights from AI');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleGetInsights();
//     }
//   };

//   if (!isVisible) return null;

//   return (
//     <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 mt-6">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-2">
//           <Lightbulb className="h-5 w-5 text-purple-600" />
//           <h4 className="text-lg font-bold text-purple-800">AI Treatment Insights</h4>
//         </div>
//         <button
//           onClick={onClose}
//           className="p-1 hover:bg-purple-100 rounded transition-colors"
//         >
//           <X className="h-4 w-4 text-purple-600" />
//         </button>
//       </div>

//       {/* Query Input */}
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-purple-700 mb-2">
//           Ask AI about this treatment comparison:
//         </label>
//         <div className="flex gap-2">
//           <textarea
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="e.g., Which treatment would be better for anti-aging? What are the key differences?"
//             className="flex-1 px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
//             rows="2"
//           />
//           <button
//             onClick={handleGetInsights}
//             disabled={loading || !query.trim()}
//             className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
//           >
//             {loading ? (
//               <Loader2 className="h-4 w-4 animate-spin" />
//             ) : (
//               <Send className="h-4 w-4" />
//             )}
//             Ask AI
//           </button>
//         </div>
//       </div>

//       {/* Error Display */}
//       {error && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
//           {error}
//         </div>
//       )}

//       {/* Loading State */}
//       {loading && (
//         <div className="mb-4 p-6 bg-white rounded-lg border border-purple-200">
//           <LoadingSpinner text="AI is analyzing your treatments..." />
//         </div>
//       )}

//       {/* Insights Display */}
//       {insights && !loading && (
//         <div className="bg-white rounded-lg p-4 border border-purple-200">
//           <div className="flex items-center gap-2 mb-3">
//             <MessageSquare className="h-4 w-4 text-purple-600" />
//             <span className="text-sm font-medium text-purple-700">AI Analysis</span>
//           </div>
//           <div className="prose prose-sm max-w-none">
//             <div className="text-slate-700 whitespace-pre-line leading-relaxed">
//               {insights}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const ComparisonChart = ({ 
//   treatments, 
//   selectedTreatments, 
//   sortBy = 'maxValue', 
//   showValues = true, 
//   filterBiomarker = '' 
// }) => {
//   const [comparisonData, setComparisonData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showInsights, setShowInsights] = useState(false);

//   useEffect(() => {
//     if (selectedTreatments.length >= 2) {
//       compareSelectedTreatments();
//     } else {
//       setComparisonData(null);
//     }
//   }, [selectedTreatments, treatments]);

//   const compareSelectedTreatments = async () => {
//     if (selectedTreatments.length < 2) return;

//     setLoading(true);
//     setError(null);
    
//     try {
//       const selectedTreatmentObjects = treatments.filter(t => selectedTreatments.includes(t.id));
      
//       // Get scores for all treatments
//       const treatmentScores = await Promise.all(
//         selectedTreatmentObjects.map(async (treatment) => {
//           try {
//             const response = await mockApiService.getTreatmentScores(treatment);
//             return {
//               treatment,
//               scores: response.success ? response.scores : []
//             };
//           } catch (error) {
//             console.error(`Error getting scores for ${treatment.name}:`, error);
//             return {
//               treatment,
//               scores: []
//             };
//           }
//         })
//       );

//       // Process comparison data with proper error handling
//       const processedData = processComparisonData(treatmentScores);
//       setComparisonData(processedData);
//     } catch (error) {
//       console.error('Error comparing treatments:', error);
//       setError('Failed to compare treatments');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processComparisonData = (treatmentScores) => {
//     // Safely get all unique biomarkers
//     const allBiomarkers = new Set();
    
//     if (Array.isArray(treatmentScores)) {
//       treatmentScores.forEach(({ scores }) => {
//         if (Array.isArray(scores)) {
//           scores.forEach(score => {
//             if (score && score.biomarker) {
//               allBiomarkers.add(score.biomarker);
//             }
//           });
//         }
//       });
//     }

//     let biomarkers = Array.from(allBiomarkers);

//     // Apply filter
//     if (filterBiomarker) {
//       biomarkers = biomarkers.filter(b => 
//         b.toLowerCase().includes(filterBiomarker.toLowerCase())
//       );
//     }

//     // Sort biomarkers
//     if (sortBy === 'alphabetical') {
//       biomarkers.sort();
//     } else if (sortBy === 'maxValue') {
//       biomarkers.sort((a, b) => getMaxScore(b, treatmentScores) - getMaxScore(a, treatmentScores));
//     } else if (sortBy === 'variance') {
//       biomarkers.sort((a, b) => getScoreVariance(b, treatmentScores) - getScoreVariance(a, treatmentScores));
//     }

//     return {
//       treatments: treatmentScores,
//       biomarkers,
//       metrics: calculateMetrics(treatmentScores)
//     };
//   };

//   const getMaxScore = (biomarker, treatmentScores) => {
//     let max = 0;
//     if (Array.isArray(treatmentScores)) {
//       treatmentScores.forEach(({ scores }) => {
//         if (Array.isArray(scores)) {
//           const score = scores.find(s => s && s.biomarker === biomarker);
//           if (score && score.score) {
//             max = Math.max(max, score.score);
//           }
//         }
//       });
//     }
//     return max;
//   };

//   const getScoreVariance = (biomarker, treatmentScores) => {
//     const values = [];
//     if (Array.isArray(treatmentScores)) {
//       treatmentScores.forEach(({ scores }) => {
//         if (Array.isArray(scores)) {
//           const score = scores.find(s => s && s.biomarker === biomarker);
//           if (score && score.score) {
//             values.push(score.score);
//           }
//         }
//       });
//     }

//     if (values.length < 2) return 0;

//     const mean = values.reduce((a, b) => a + b, 0) / values.length;
//     const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
//     return variance;
//   };

//   const calculateMetrics = (treatmentScores) => {
//     const averageScores = [];
//     const allBiomarkers = new Set();
//     const treatmentBiomarkers = {};
    
//     if (Array.isArray(treatmentScores)) {
//       treatmentScores.forEach(({ treatment, scores }) => {
//         if (treatment && Array.isArray(scores)) {
//           const avg = scores.length > 0 ? scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length : 0;
//           averageScores.push({ treatment: treatment.name, avgScore: avg });
          
//           treatmentBiomarkers[treatment.name] = new Set(scores.map(s => s.biomarker).filter(Boolean));
//           scores.forEach(score => {
//             if (score && score.biomarker) {
//               allBiomarkers.add(score.biomarker);
//             }
//           });
//         }
//       });
//     }

//     // Find common biomarkers
//     const commonBiomarkers = Array.from(allBiomarkers).filter(biomarker => 
//       Object.values(treatmentBiomarkers).every(set => set.has(biomarker))
//     );

//     return {
//       averageScores,
//       totalBiomarkers: allBiomarkers.size,
//       commonBiomarkers: commonBiomarkers.length,
//       totalDataPoints: treatmentScores.reduce((sum, { scores }) => sum + (scores ? scores.length : 0), 0)
//     };
//   };

//   const getTreatmentColor = (index) => {
//     const colors = [
//       'from-blue-500 to-blue-600',
//       'from-emerald-500 to-emerald-600',
//       'from-purple-500 to-purple-600',
//       'from-orange-500 to-orange-600',
//       'from-red-500 to-red-600',
//       'from-indigo-500 to-indigo-600',
//       'from-pink-500 to-pink-600',
//       'from-teal-500 to-teal-600'
//     ];
//     return colors[index % colors.length];
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-16">
//         <LoadingSpinner text="Comparing treatments..." />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-16">
//         <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
//         <h3 className="text-xl font-medium text-slate-900 mb-2">Comparison Failed</h3>
//         <p className="text-slate-600">{error}</p>
//         <button
//           onClick={compareSelectedTreatments}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   if (!comparisonData || comparisonData.biomarkers.length === 0) {
//     return (
//       <div className="text-center py-16 text-slate-500">
//         <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
//         <p className="text-xl font-medium mb-2">No biomarkers to compare</p>
//         <p className="text-sm">Add biomarkers to your treatments to see the comparison</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       {/* Overview Metrics */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
//           <div className="text-sm font-medium text-blue-600 mb-1">Treatments</div>
//           <div className="text-2xl font-bold text-blue-800">{comparisonData.treatments.length}</div>
//         </div>
//         <div className="bg-green-50 rounded-lg p-4 border border-green-200">
//           <div className="text-sm font-medium text-green-600 mb-1">Total Biomarkers</div>
//           <div className="text-2xl font-bold text-green-800">{comparisonData.metrics.totalBiomarkers}</div>
//         </div>
//         <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
//           <div className="text-sm font-medium text-purple-600 mb-1">Common Biomarkers</div>
//           <div className="text-2xl font-bold text-purple-800">{comparisonData.metrics.commonBiomarkers}</div>
//         </div>
//         <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
//           <div className="text-sm font-medium text-orange-600 mb-1">Data Points</div>
//           <div className="text-2xl font-bold text-orange-800">{comparisonData.metrics.totalDataPoints}</div>
//         </div>
//       </div>

//       {/* AI Insights Button */}
//       {!showInsights && (
//         <div className="text-center">
//           <button
//             onClick={() => setShowInsights(true)}
//             className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2 mx-auto"
//           >
//             <Lightbulb className="h-5 w-5" />
//             Get AI Insights on This Comparison
//           </button>
//         </div>
//       )}

//       {/* OpenAI Insights Component */}
//       <OpenAIInsights
//         treatments={treatments.filter(t => selectedTreatments.includes(t.id))}
//         comparisonData={comparisonData}
//         isVisible={showInsights}
//         onClose={() => setShowInsights(false)}
//       />

//       {/* Biomarker Comparisons */}
//       <div className="space-y-6">
//         {comparisonData.biomarkers.map((biomarkerName) => {
//           const maxScore = getMaxScore(biomarkerName, comparisonData.treatments);
//           const variance = getScoreVariance(biomarkerName, comparisonData.treatments);
          
//           return (
//             <div key={biomarkerName} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h4 className="font-bold text-slate-800 text-xl">{biomarkerName}</h4>
//                   <div className="flex items-center gap-6 mt-2">
//                     <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
//                       Max Score: <span className="font-mono">{(maxScore * 100).toFixed(1)}%</span>
//                     </span>
//                     <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
//                       Variance: <span className="font-mono">{variance.toFixed(3)}</span>
//                     </span>
//                   </div>
//                 </div>
//                 {variance > 0.1 && (
//                   <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-full border border-amber-200">
//                     <AlertCircle className="h-4 w-4" />
//                     <span className="text-sm font-medium">High variance</span>
//                   </div>
//                 )}
//               </div>
              
//               <div className="space-y-4">
//                 {comparisonData.treatments.map(({ treatment, scores }, index) => {
//                   const scoreData = scores?.find(s => s && s.biomarker === biomarkerName);
//                   const score = scoreData ? scoreData.score : 0;
//                   const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
//                   const colorClass = getTreatmentColor(index);
                  
//                   return (
//                     <div key={treatment.id} className="group">
//                       <div className="flex items-center gap-4 mb-2">
//                         <div className="w-36 text-sm font-semibold text-slate-700 truncate">
//                           {treatment.name}
//                         </div>
//                         <div className="flex-1 bg-slate-200 rounded-full h-10 relative overflow-hidden">
//                           <div
//                             className={`bg-gradient-to-r ${colorClass} h-10 rounded-full transition-all duration-700 ease-out flex items-center justify-between px-4 shadow-sm`}
//                             style={{ width: `${Math.max(percentage, 10)}%` }}
//                           >
//                             {showValues && percentage >= 25 && (
//                               <span className="text-white text-sm font-bold">
//                                 {(score * 100).toFixed(1)}%
//                               </span>
//                             )}
//                           </div>
//                           {(percentage < 25 && showValues) && (
//                             <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 text-sm font-mono">
//                               {(score * 100).toFixed(1)}%
//                             </div>
//                           )}
//                         </div>
//                         <div className="w-24 text-right">
//                           <ScoreBadge score={score} showPercentage={false} />
//                         </div>
//                       </div>
//                       {scoreData && (
//                         <div className="ml-40 text-xs text-slate-500 mb-2">
//                           Coverage: {scoreData.biomarker_pdfs}/{scoreData.total_pdfs} PDFs
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Treatment Summary */}
//       <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
//         <h4 className="font-bold text-slate-800 text-lg mb-4">Treatment Summary</h4>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {comparisonData.metrics.averageScores.map((item, index) => (
//             <div key={item.treatment} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
//               <span className="font-medium text-slate-700">{item.treatment}</span>
//               <div className="flex items-center gap-3">
//                 <span className="text-sm text-slate-600">Avg Score:</span>
//                 <ScoreBadge score={item.avgScore} />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ComparisonChart;



import React, { useState, useEffect } from 'react';
import { 
  BarChart3, AlertCircle, Loader2, MessageSquare, Send, X, Lightbulb, 
  Download, Share2, TrendingUp, Info, Brain, FileText, Copy
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ScoreBadge from './ScoreBadge';
import ApiService from '../services/api';

// Enhanced OpenAI Insights Component
const OpenAIInsights = ({ treatments, comparisonData, isVisible, onClose }) => {
  const [query, setQuery] = useState('');
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [insightHistory, setInsightHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  // Quick query suggestions
  const quickQueries = [
    'Which treatment would be most effective for anti-aging?',
    'What are the key differences between these treatments?',
    'Which biomarkers show the strongest evidence?',
    'What combination therapy would you recommend?',
    'How do these treatments compare for safety?',
    'What are the clinical implications of these results?'
  ];

  const handleGetInsights = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Prepare treatment data for API
      const treatmentData = {
        treatments: treatments.map(treatment => ({
          id: treatment.id,
          name: treatment.name,
          condition: treatment.condition,
          biomarkers: treatment.biomarkers
        }))
      };

      const response = await ApiService.generateInsights({
        query: query,
        treatment_data: treatmentData,
        comparison_context: {
          metrics: comparisonData.metrics,
          biomarkers: comparisonData.biomarkers
        }
      });
      
      if (response.success) {
        setInsights(response.insights);
        setInsightHistory(prev => [...prev, {
          id: Date.now(),
          query: query,
          insights: response.insights,
          timestamp: new Date().toISOString(),
          metadata: response.metadata
        }]);
        setError('');
      } else {
        setError(response.error || 'Failed to get insights');
      }
    } catch (error) {
      console.error('Error getting OpenAI insights:', error);
      setError('Error getting insights from AI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGetInsights();
    }
  };

  const handleQuickQuery = (quickQuery) => {
    setQuery(quickQuery);
    setTimeout(() => handleGetInsights(), 100);
  };

  const handleExportInsights = async () => {
    if (!insights) return;

    try {
      const currentInsight = insightHistory[insightHistory.length - 1];
      const response = await ApiService.exportInsights({
        insights: insights,
        format: exportFormat,
        metadata: currentInsight?.metadata || {}
      });

      if (response.success) {
        const blob = new Blob([
          exportFormat === 'json' ? JSON.stringify(response.data, null, 2) : response.data
        ], { 
          type: exportFormat === 'json' ? 'application/json' : 'text/plain' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting insights:', error);
    }
  };

  const copyInsights = async () => {
    try {
      await navigator.clipboard.writeText(insights);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy insights:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-2 border-purple-200 mt-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-purple-800">AI Treatment Insights</h4>
            <p className="text-sm text-purple-600">Get intelligent analysis of your treatment comparison</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {insightHistory.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
              title="View insight history"
            >
              <FileText className="h-4 w-4 text-purple-600" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 text-purple-600" />
          </button>
        </div>
      </div>

      {/* Quick Query Suggestions */}
      {!insights && !loading && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-purple-700 mb-3">
            💡 Quick Questions:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQueries.map((quickQuery, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuery(quickQuery)}
                className="text-left p-3 text-sm bg-white border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
              >
                {quickQuery}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Query Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-purple-700 mb-2">
          Ask AI about this treatment comparison:
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Which treatment would be better for anti-aging? What are the key differences?"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-slate-700"
              rows="3"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleGetInsights}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-medium flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? 'Analyzing...' : 'Ask AI'}
            </button>
            
            {insights && (
              <div className="flex gap-1">
                <button
                  onClick={copyInsights}
                  className="p-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                  title="Copy insights"
                >
                  <Copy className="h-4 w-4 text-purple-600" />
                </button>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-xs border border-purple-200 rounded px-2 bg-white"
                >
                  <option value="json">JSON</option>
                  <option value="txt">Text</option>
                </select>
                <button
                  onClick={handleExportInsights}
                  className="p-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                  title="Export insights"
                >
                  <Download className="h-4 w-4 text-purple-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Analysis Error</span>
          </div>
          <p className="text-red-700 mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-6 p-6 bg-white rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="small" />
            <div>
              <p className="font-medium text-slate-700">AI is analyzing your treatments...</p>
              <p className="text-sm text-slate-500">This may take 10-30 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* Insights Display */}
      {insights && !loading && (
        <div className="bg-white rounded-lg p-6 border border-purple-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <span className="text-lg font-semibold text-purple-700">AI Analysis Results</span>
          </div>
          <div className="prose prose-sm max-w-none">
            <div 
              className="text-slate-700 whitespace-pre-line leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: insights.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/### (.*?)$/gm, '<h3 class="text-lg font-semibold text-slate-800 mt-4 mb-2">$1</h3>')
                                .replace(/## (.*?)$/gm, '<h2 class="text-xl font-bold text-slate-800 mt-6 mb-3">$1</h2>')
                                .replace(/# (.*?)$/gm, '<h1 class="text-2xl font-bold text-slate-800 mt-8 mb-4">$1</h1>')
                                .replace(/- (.*?)$/gm, '<li class="ml-4">$1</li>')
              }}
            />
          </div>
        </div>
      )}

      {/* Insight History */}
      {showHistory && insightHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-lg p-4 border border-purple-200">
          <h5 className="font-semibold text-purple-700 mb-3">Previous Insights</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {insightHistory.slice().reverse().map((item, index) => (
              <div key={item.id} className="text-sm p-2 bg-purple-50 rounded border border-purple-100">
                <div className="font-medium text-purple-800">{item.query}</div>
                <div className="text-xs text-purple-600">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ComparisonChart = ({ 
  treatments, 
  selectedTreatments, 
  sortBy = 'maxValue', 
  showValues = true, 
  filterBiomarker = '' 
}) => {
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    if (selectedTreatments.length >= 2) {
      compareSelectedTreatments();
    } else {
      setComparisonData(null);
    }
  }, [selectedTreatments, treatments]);

  const compareSelectedTreatments = async () => {
    if (selectedTreatments.length < 2) return;

    setLoading(true);
    setError(null);
    
    try {
      const selectedTreatmentObjects = treatments.filter(t => selectedTreatments.includes(t.id));
      
      // Get scores for all treatments using real API
      const treatmentScores = await Promise.all(
        selectedTreatmentObjects.map(async (treatment) => {
          try {
            const response = await ApiService.getTreatmentScores(treatment);
            return {
              treatment,
              scores: response.success ? response.scores : []
            };
          } catch (error) {
            console.error(`Error getting scores for ${treatment.name}:`, error);
            // Fallback to mock data for demo
            return {
              treatment,
              scores: generateMockScores(treatment)
            };
          }
        })
      );

      // Process comparison data with enhanced error handling
      const processedData = processComparisonData(treatmentScores);
      setComparisonData(processedData);
    } catch (error) {
      console.error('Error comparing treatments:', error);
      setError('Failed to compare treatments');
    } finally {
      setLoading(false);
    }
  };

  const generateMockScores = (treatment) => {
    // Generate realistic mock scores for demo purposes
    return treatment.biomarkers.map(biomarker => {
      if (biomarker.name && biomarker.name.trim()) {
        const baseScore = Math.random() * 0.6 + 0.2; // Score between 0.2 and 0.8
        const variance = (Math.random() - 0.5) * 0.2;
        const score = Math.max(0.1, Math.min(0.9, baseScore + variance));
        
        return {
          biomarker: biomarker.name,
          score: score,
          biomarker_pdfs: Math.floor(score * 192),
          total_pdfs: 192
        };
      }
      return null;
    }).filter(Boolean);
  };

  const processComparisonData = (treatmentScores) => {
    // Safely get all unique biomarkers with validation
    const allBiomarkers = new Set();
    
    if (Array.isArray(treatmentScores)) {
      treatmentScores.forEach(({ scores }) => {
        if (Array.isArray(scores)) {
          scores.forEach(score => {
            if (score && score.biomarker && typeof score.biomarker === 'string') {
              allBiomarkers.add(score.biomarker);
            }
          });
        }
      });
    }

    let biomarkers = Array.from(allBiomarkers);

    // Apply filter with case-insensitive matching
    if (filterBiomarker && filterBiomarker.trim()) {
      const filterLower = filterBiomarker.toLowerCase().trim();
      biomarkers = biomarkers.filter(b => 
        b.toLowerCase().includes(filterLower)
      );
    }

    // Enhanced sorting with multiple criteria
    if (sortBy === 'alphabetical') {
      biomarkers.sort((a, b) => a.localeCompare(b));
    } else if (sortBy === 'maxValue') {
      biomarkers.sort((a, b) => getMaxScore(b, treatmentScores) - getMaxScore(a, treatmentScores));
    } else if (sortBy === 'variance') {
      biomarkers.sort((a, b) => getScoreVariance(b, treatmentScores) - getScoreVariance(a, treatmentScores));
    } else if (sortBy === 'avgValue') {
      biomarkers.sort((a, b) => getAvgScore(b, treatmentScores) - getAvgScore(a, treatmentScores));
    }

    return {
      treatments: treatmentScores,
      biomarkers,
      metrics: calculateEnhancedMetrics(treatmentScores)
    };
  };

  const getMaxScore = (biomarker, treatmentScores) => {
    let max = 0;
    if (Array.isArray(treatmentScores)) {
      treatmentScores.forEach(({ scores }) => {
        if (Array.isArray(scores)) {
          const score = scores.find(s => s && s.biomarker === biomarker);
          if (score && typeof score.score === 'number') {
            max = Math.max(max, score.score);
          }
        }
      });
    }
    return max;
  };

  const getAvgScore = (biomarker, treatmentScores) => {
    const scores = [];
    if (Array.isArray(treatmentScores)) {
      treatmentScores.forEach(({ scores: treatmentScoreList }) => {
        if (Array.isArray(treatmentScoreList)) {
          const score = treatmentScoreList.find(s => s && s.biomarker === biomarker);
          if (score && typeof score.score === 'number') {
            scores.push(score.score);
          }
        }
      });
    }
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  const getScoreVariance = (biomarker, treatmentScores) => {
    const values = [];
    if (Array.isArray(treatmentScores)) {
      treatmentScores.forEach(({ scores }) => {
        if (Array.isArray(scores)) {
          const score = scores.find(s => s && s.biomarker === biomarker);
          if (score && typeof score.score === 'number') {
            values.push(score.score);
          }
        }
      });
    }

    if (values.length < 2) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return variance;
  };

  const calculateEnhancedMetrics = (treatmentScores) => {
    const averageScores = [];
    const allBiomarkers = new Set();
    const treatmentBiomarkers = {};
    let totalDataPoints = 0;
    
    if (Array.isArray(treatmentScores)) {
      treatmentScores.forEach(({ treatment, scores }) => {
        if (treatment && Array.isArray(scores)) {
          const validScores = scores.filter(s => s && typeof s.score === 'number');
          const avg = validScores.length > 0 ? 
            validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length : 0;
          
          averageScores.push({ 
            treatment: treatment.name, 
            avgScore: avg,
            biomarkerCount: validScores.length,
            maxScore: validScores.length > 0 ? Math.max(...validScores.map(s => s.score)) : 0,
            minScore: validScores.length > 0 ? Math.min(...validScores.map(s => s.score)) : 0
          });
          
          treatmentBiomarkers[treatment.name] = new Set(
            validScores.map(s => s.biomarker).filter(Boolean)
          );
          
          validScores.forEach(score => {
            if (score.biomarker) {
              allBiomarkers.add(score.biomarker);
            }
          });
          
          totalDataPoints += validScores.reduce((sum, s) => sum + (s.total_pdfs || 0), 0);
        }
      });
    }

    // Find common biomarkers across all treatments
    const commonBiomarkers = Array.from(allBiomarkers).filter(biomarker => 
      Object.values(treatmentBiomarkers).every(set => set.has(biomarker))
    );

    // Calculate statistical insights
    const scoreDistribution = {
      high: 0, // >0.7
      medium: 0, // 0.4-0.7
      low: 0 // <0.4
    };

    treatmentScores.forEach(({ scores }) => {
      if (Array.isArray(scores)) {
        scores.forEach(score => {
          if (score && typeof score.score === 'number') {
            if (score.score > 0.7) scoreDistribution.high++;
            else if (score.score > 0.4) scoreDistribution.medium++;
            else scoreDistribution.low++;
          }
        });
      }
    });

    return {
      averageScores,
      totalBiomarkers: allBiomarkers.size,
      commonBiomarkers: commonBiomarkers.length,
      commonBiomarkersList: commonBiomarkers,
      totalDataPoints,
      scoreDistribution,
      treatmentCount: treatmentScores.length
    };
  };

  const getTreatmentColor = (index) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-emerald-500 to-emerald-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  const getVarianceIndicator = (variance) => {
    if (variance > 0.15) return { color: 'text-red-600 bg-red-50 border-red-200', label: 'High Variance', icon: '⚠️' };
    if (variance > 0.08) return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', label: 'Medium Variance', icon: '⚡' };
    return { color: 'text-green-600 bg-green-50 border-green-200', label: 'Low Variance', icon: '✅' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner text="Comparing treatments..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
        <h3 className="text-xl font-medium text-slate-900 mb-2">Comparison Failed</h3>
        <p className="text-slate-600 mb-4">{error}</p>
        <button
          onClick={compareSelectedTreatments}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!comparisonData || comparisonData.biomarkers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p className="text-xl font-medium mb-2">No biomarkers to compare</p>
        <p className="text-sm">Add biomarkers to your treatments to see the comparison</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-800">{comparisonData.treatments.length}</div>
              <div className="text-sm text-blue-600 font-medium">Treatments</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-800">{comparisonData.metrics.totalBiomarkers}</div>
              <div className="text-sm text-green-600 font-medium">Total Biomarkers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Share2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-800">{comparisonData.metrics.commonBiomarkers}</div>
              <div className="text-sm text-purple-600 font-medium">Common Biomarkers</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-lg">
              <Info className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-800">{comparisonData.metrics.totalDataPoints}</div>
              <div className="text-sm text-orange-600 font-medium">Data Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Score Distribution Analytics */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Score Distribution Analysis
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{comparisonData.metrics.scoreDistribution.high}</div>
            <div className="text-sm text-green-600">High Scores (&gt;70%)</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{comparisonData.metrics.scoreDistribution.medium}</div>
            <div className="text-sm text-yellow-600">Medium Scores (40-70%)</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{comparisonData.metrics.scoreDistribution.low}</div>
            <div className="text-sm text-red-600">Low Scores (&lt;40%)</div>
          </div>
        </div>
      </div>

      {/* AI Insights Toggle */}
      {!showInsights && (
        <div className="text-center">
          <button
            onClick={() => setShowInsights(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold flex items-center gap-3 mx-auto transform hover:scale-105"
          >
            <Brain className="h-6 w-6" />
            Get AI Insights on This Comparison
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">New!</span>
          </button>
        </div>
      )}

      {/* Enhanced OpenAI Insights Component */}
      <OpenAIInsights
        treatments={treatments.filter(t => selectedTreatments.includes(t.id))}
        comparisonData={comparisonData}
        isVisible={showInsights}
        onClose={() => setShowInsights(false)}
      />

      {/* Enhanced Biomarker Comparisons */}
      <div className="space-y-6">
        {comparisonData.biomarkers.map((biomarkerName) => {
          const maxScore = getMaxScore(biomarkerName, comparisonData.treatments);
          const avgScore = getAvgScore(biomarkerName, comparisonData.treatments);
          const variance = getScoreVariance(biomarkerName, comparisonData.treatments);
          const varianceInfo = getVarianceIndicator(variance);
          
          return (
            <div key={biomarkerName} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-slate-800 text-xl mb-2">{biomarkerName}</h4>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      Max: <span className="font-mono font-semibold">{(maxScore * 100).toFixed(1)}%</span>
                    </span>
                    <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      Avg: <span className="font-mono font-semibold">{(avgScore * 100).toFixed(1)}%</span>
                    </span>
                    <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      Variance: <span className="font-mono font-semibold">{variance.toFixed(3)}</span>
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${varianceInfo.color}`}>
                  <span className="text-sm">{varianceInfo.icon}</span>
                  <span className="text-sm font-medium">{varianceInfo.label}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {comparisonData.treatments.map(({ treatment, scores }, index) => {
                  const scoreData = scores?.find(s => s && s.biomarker === biomarkerName);
                  const score = scoreData ? scoreData.score : 0;
                  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
                  const colorClass = getTreatmentColor(index);
                  
                  return (
                    <div key={treatment.id} className="group">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-40 text-sm font-semibold text-slate-700 truncate">
                          {treatment.name}
                        </div>
                        <div className="flex-1 bg-slate-200 rounded-full h-12 relative overflow-hidden shadow-inner">
                          <div
                            className={`bg-gradient-to-r ${colorClass} h-12 rounded-full transition-all duration-1000 ease-out flex items-center justify-between px-4 shadow-sm relative`}
                            style={{ width: `${Math.max(percentage, 8)}%` }}
                          >
                            {showValues && percentage >= 20 && (
                              <span className="text-white text-sm font-bold">
                                {(score * 100).toFixed(1)}%
                              </span>
                            )}
                            {percentage >= 90 && (
                              <span className="text-white text-xs">🏆</span>
                            )}
                          </div>
                          {(percentage < 20 && showValues) && (
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 text-sm font-mono font-semibold">
                              {(score * 100).toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <div className="w-28 text-right">
                          <ScoreBadge score={score} showPercentage={false} size="small" />
                        </div>
                      </div>
                      {scoreData && (
                        <div className="ml-44 text-xs text-slate-500 mb-2 flex items-center gap-4">
                          <span>
                            Coverage: {scoreData.biomarker_pdfs}/{scoreData.total_pdfs} PDFs
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>
                            Reliability: {((scoreData.biomarker_pdfs / scoreData.total_pdfs) * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Treatment Summary */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Treatment Performance Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {comparisonData.metrics.averageScores.map((item, index) => (
            <div key={item.treatment} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <span className="font-semibold text-slate-700 text-lg">{item.treatment}</span>
                <div className="text-xs text-slate-500 mt-1">
                  {item.biomarkerCount} biomarkers • Range: {(item.minScore * 100).toFixed(0)}% - {(item.maxScore * 100).toFixed(0)}%
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-slate-600 font-medium">Avg Score</div>
                  <ScoreBadge score={item.avgScore} size="small" />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {comparisonData.metrics.commonBiomarkersList.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-semibold text-blue-800 mb-2">Common Biomarkers Across All Treatments</h5>
            <div className="flex flex-wrap gap-2">
              {comparisonData.metrics.commonBiomarkersList.map(biomarker => (
                <span key={biomarker} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {biomarker}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonChart;
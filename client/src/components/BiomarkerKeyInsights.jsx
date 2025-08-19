// import React, { useState, useEffect } from 'react';
// import { Lightbulb, Brain, Link2, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

// const BiomarkerKeyInsights = ({ biomarker, condition }) => {
//   const [insights, setInsights] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [expandedSections, setExpandedSections] = useState({
//     causality: true,
//     suggestive: true
//   });

//   useEffect(() => {
//     if (biomarker && condition) {
//       fetchInsights();
//     }
//   }, [biomarker, condition]);

//   const fetchInsights = async () => {
//     if (!biomarker || !condition) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      
//       // Build query parameters
//       const params = new URLSearchParams({
//         biomarkers: biomarker,
//         condition: condition,
//         case_insensitive: 'false'
//       });

//       const response = await fetch(`${API_URL}/api/biomarker/insights?${params}`, {
//         method: 'GET',
//         headers: {
//           'Accept': 'application/json'
//         },
//         mode: 'cors'
//       });

//       if (!response.ok) {
//         throw new Error(`API request failed (${response.status}): ${response.statusText}`);
//       }

//       const result = await response.json();
      
//       if (!result?.success) {
//         throw new Error(result?.error || 'Failed to fetch insights');
//       }

//       // Set insights, filtering out correlative
//       if (result.summary) {
//         setInsights({
//           causality: result.summary.Causality || null,
//           suggestive: result.summary.Suggestive || null,
//           count: result.count || 0
//         });
//       } else {
//         setInsights(null);
//       }
      
//     } catch (err) {
//       console.error('Error fetching biomarker insights:', err);
//       setError(err?.message || 'Failed to fetch insights');
//       setInsights(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const getInsightIcon = (type) => {
//     switch (type) {
//       case 'causality':
//         return Brain;
//       case 'suggestive':
//         return Lightbulb;
//       default:
//         return AlertCircle;
//     }
//   };

//   const getInsightColor = (type) => {
//     switch (type) {
//       case 'causality':
//         return 'text-purple-600 bg-purple-50 border-purple-200';
//       case 'suggestive':
//         return 'text-amber-600 bg-amber-50 border-amber-200';
//       default:
//         return 'text-slate-600 bg-slate-50 border-slate-200';
//     }
//   };

//   const formatInsightText = (text) => {
//     if (!text) return 'No insights available';
    
//     // Check if it's a "no data" message
//     if (text.includes('Data for') && text.includes('not given')) {
//       return null;
//     }
    
//     // Split by sentences and format
//     const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
//     return sentences.map((sentence, idx) => (
//       <li key={idx} className="mb-2 text-slate-700 leading-relaxed">
//         {sentence.trim()}
//       </li>
//     ));
//   };

//   if (loading) {
//     return (
//       <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
//         <div className="flex items-center justify-center">
//           <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
//           <span className="text-slate-600">Generating key insights...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
//         <div className="flex items-center gap-2 text-red-600">
//           <AlertCircle className="h-5 w-5" />
//           <span className="font-medium">Error loading insights</span>
//         </div>
//         <p className="text-slate-600 mt-2 text-sm">{error}</p>
//         <button
//           onClick={fetchInsights}
//           className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   if (!insights || insights.count === 0) {
//     return (
//       <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
//         <div className="text-center text-slate-500">
//           <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
//           <p className="text-sm">No key insights available for this biomarker-condition combination</p>
//         </div>
//       </div>
//     );
//   }

//   const renderInsightSection = (type, title, content) => {
//     const Icon = getInsightIcon(type);
//     const colorClass = getInsightColor(type);
//     const isExpanded = expandedSections[type];
//     const formattedContent = formatInsightText(content);
    
//     // Don't render if content is null (no data message)
//     if (!formattedContent) return null;

//     return (
//       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
//         <div 
//           className={`px-4 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors ${colorClass.split(' ')[1]}`}
//           onClick={() => toggleSection(type)}
//         >
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Icon className={`h-5 w-5 ${colorClass.split(' ')[0]}`} />
//               <h3 className="font-semibold text-slate-800">{title}</h3>
//               <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
//                 {type === 'causality' ? 'Causal Evidence' : 'Suggestive Evidence'}
//               </span>
//             </div>
//             <button className="p-1 hover:bg-slate-200 rounded transition-colors">
//               {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//             </button>
//           </div>
//         </div>
        
//         {isExpanded && (
//           <div className="p-4">
//             <ul className="list-disc list-inside space-y-1">
//               {formattedContent}
//             </ul>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-lg font-semibold text-slate-800">AI-Generated Key Insights</h2>
//             <p className="text-sm text-slate-600 mt-1">
//               Evidence-based analysis for {biomarker} in {condition}
//             </p>
//           </div>
//           <div className="text-right">
//             <span className="text-xs bg-white px-2 py-1 rounded-full text-slate-600 border border-slate-300">
//               {insights.count} data points analyzed
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Insight Sections */}
//       {insights.causality && renderInsightSection(
//         'causality',
//         'Causal Relationships',
//         insights.causality
//       )}
      
//       {insights.suggestive && renderInsightSection(
//         'suggestive',
//         'Suggestive Evidence',
//         insights.suggestive
//       )}

//       {/* Info Note */}
//       <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//         <div className="flex items-start gap-2">
//           <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
//           <div className="text-xs text-blue-800">
//             <p className="font-medium mb-1">About These Insights:</p>
//             <ul className="list-disc list-inside space-y-0.5 text-blue-700">
//               <li>Causal relationships indicate direct mechanistic links</li>
//               <li>Suggestive evidence indicates potential associations requiring further investigation</li>
//               <li>Insights are AI-generated based on available research data</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BiomarkerKeyInsights;



import React, { useState, useEffect } from 'react';
import { Lightbulb, Brain, Link2, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const BiomarkerKeyInsights = ({ biomarker, condition }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    causality: true,
    suggestive: true
  });

  useEffect(() => {
    if (biomarker && condition) {
      fetchInsights();
    }
  }, [biomarker, condition]);

  const fetchInsights = async () => {
    if (!biomarker || !condition) return;

    setLoading(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      
      // Build query parameters
      const params = new URLSearchParams({
        biomarkers: biomarker,
        condition: condition,
        case_insensitive: 'false'
      });

      const response = await fetch(`${API_URL}/api/biomarker/insights?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`API request failed (${response.status}): ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to fetch insights');
      }

      // Set insights, filtering out correlative
      if (result.summary) {
        setInsights({
          causality: result.summary.Causality || null,
          suggestive: result.summary.Suggestive || null,
          count: result.count || 0
        });
      } else {
        setInsights(null);
      }
      
    } catch (err) {
      console.error('Error fetching biomarker insights:', err);
      setError(err?.message || 'Failed to fetch insights');
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'causality':
        return Brain;
      case 'suggestive':
        return Lightbulb;
      default:
        return AlertCircle;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'causality':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'suggestive':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const formatInsightText = (text) => {
    if (!text) return 'No insights available';
    
    // Check if it's a "no data" message
    if (text.includes('Data for') && text.includes('not given')) {
      return null;
    }
    
    // Improved sentence splitting that handles abbreviations
    const splitIntoSentences = (text) => {
      // Replace known abbreviations temporarily to avoid incorrect splits
      const abbreviations = {
        'e.g.': '§EG§',
        'i.e.': '§IE§',
        'etc.': '§ETC§',
        'Dr.': '§DR§',
        'Mr.': '§MR§',
        'Mrs.': '§MRS§',
        'Ms.': '§MS§',
        'Prof.': '§PROF§',
        'Sr.': '§SR§',
        'Jr.': '§JR§',
        'Ph.D.': '§PHD§',
        'M.D.': '§MD§',
        'B.A.': '§BA§',
        'M.A.': '§MA§',
        'vs.': '§VS§',
        'et al.': '§ETAL§'
      };
      
      // Preserve scientific abbreviations with single letter + period
      let processedText = text;
      
      // Replace known abbreviations
      for (const [abbr, placeholder] of Object.entries(abbreviations)) {
        const regex = new RegExp(abbr.replace('.', '\\.'), 'gi');
        processedText = processedText.replace(regex, placeholder);
      }
      
      // Preserve single letter abbreviations (like K. alpina, L-theanine)
      processedText = processedText.replace(/\b([A-Z])\./g, '$1§DOT§');
      
      // Split on sentence endings (. ! ?) followed by space and capital letter or end of string
      const sentences = processedText.split(/(?<=[.!?])\s+(?=[A-Z])|(?<=[.!?])$/);
      
      // Restore abbreviations and clean up
      return sentences.map(sentence => {
        let restored = sentence.trim();
        
        // Restore known abbreviations
        for (const [abbr, placeholder] of Object.entries(abbreviations)) {
          restored = restored.replace(new RegExp(placeholder, 'g'), abbr);
        }
        
        // Restore single letter abbreviations
        restored = restored.replace(/§DOT§/g, '.');
        
        return restored;
      }).filter(s => s.length > 0);
    };
    
    const sentences = splitIntoSentences(text);
    
    // If only one sentence or very short text, return as single item
    if (sentences.length === 1 || text.length < 100) {
      return (
        <div className="text-slate-700 leading-relaxed">
          {text}
        </div>
      );
    }
    
    // For multiple sentences, create list items
    return sentences.map((sentence, idx) => (
      <li key={idx} className="mb-2 text-slate-700 leading-relaxed">
        {sentence.trim()}
      </li>
    ));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-slate-600">Generating key insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Error loading insights</span>
        </div>
        <p className="text-slate-600 mt-2 text-sm">{error}</p>
        <button
          onClick={fetchInsights}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!insights || insights.count === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <div className="text-center text-slate-500">
          <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No key insights available for this biomarker-condition combination</p>
        </div>
      </div>
    );
  }

  const renderInsightSection = (type, title, content) => {
    const Icon = getInsightIcon(type);
    const colorClass = getInsightColor(type);
    const isExpanded = expandedSections[type];
    const formattedContent = formatInsightText(content);
    
    // Don't render if content is null (no data message)
    if (!formattedContent) return null;

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-4">
        <div 
          className={`px-4 py-3 border-b border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors ${colorClass.split(' ')[1]}`}
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${colorClass.split(' ')[0]}`} />
              <h3 className="font-semibold text-slate-800">{title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
                {type === 'causality' ? 'Causal Evidence' : 'Suggestive Evidence'}
              </span>
            </div>
            <button className="p-1 hover:bg-slate-200 rounded transition-colors">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-4">
            <ul className="list-disc list-inside space-y-1">
              {formattedContent}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">AI-Generated Key Insights</h2>
            <p className="text-sm text-slate-600 mt-1">
              Evidence-based analysis for {biomarker} in {condition}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-white px-2 py-1 rounded-full text-slate-600 border border-slate-300">
              {insights.count} data points analyzed
            </span>
          </div>
        </div>
      </div>

      {/* Insight Sections */}
      {insights.causality && renderInsightSection(
        'causality',
        'Causal Relationships',
        insights.causality
      )}
      
      {insights.suggestive && renderInsightSection(
        'suggestive',
        'Suggestive Evidence',
        insights.suggestive
      )}

      {/* Info Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">About These Insights:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-700">
              <li>Causal relationships indicate direct mechanistic links</li>
              <li>Suggestive evidence indicates potential associations requiring further investigation</li>
              <li>Insights are AI-generated based on available research data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiomarkerKeyInsights;
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Link2, HelpCircle, Star, Info, Eye } from 'lucide-react';

// Helper functions
const toNum = (v) => {
  if (typeof v === 'number') return v;
  if (v == null) return NaN;
  const n = parseFloat(String(v).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

const getECS = (row) => {
  return toNum(row?.ECS ?? row?.Evidence_Causality_Score ?? row?.['ECS (Evidence Causality Score)']);
};

const getClassification = (row) => {
  const classification = row?.Classification ?? 
                         row?.['Classification_(Cause/Correlation)'] ?? 
                         row?.['Classification (Cause/Correlation)'];
  return (classification || '').toString().trim();
};

const safeFixed = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : '—');

const getECSColor = (score) => {
  if (!Number.isFinite(score)) return 'text-slate-500';
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

const getClassificationColor = (classification) => {
  const lower = classification.toLowerCase();
  if (lower.includes('causal')) return 'text-purple-600 bg-purple-50 border-purple-200';
  if (lower.includes('correlat')) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (lower.includes('suggest')) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-slate-600 bg-slate-50 border-slate-200';
};

const getClassificationIcon = (classification) => {
  const lower = classification.toLowerCase();
  if (lower.includes('causal')) return Brain;
  if (lower.includes('correlat')) return Link2;
  if (lower.includes('suggest')) return HelpCircle;
  return Info;
};

const BiomarkerEvidenceAnalysis = ({ biomarker, condition, data = [], onViewDetails }) => {
  const [animateStats, setAnimateStats] = useState(false);
  const [selectedClassification, setSelectedClassification] = useState(null);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    setAnimateStats(true);
    const timer = setTimeout(() => setAnimateStats(false), 600);
    return () => clearTimeout(timer);
  }, [data]);

  // Calculate ECS statistics by classification
  const calculateECSStats = (rows = []) => {
    const classifications = {
      causality: { items: [], scores: [], label: 'Causality' },
      correlative: { items: [], scores: [], label: 'Correlative' },
      suggestive: { items: [], scores: [], label: 'Suggestive' },
      unknown: { items: [], scores: [], label: 'Unknown' }
    };

    let totalECSSum = 0;
    let totalECSCount = 0;

    for (const row of rows) {
      const ecs = getECS(row);
      const classification = getClassification(row).toLowerCase();
      
      let bucket = null;
      if (classification.includes('causal')) {
        bucket = classifications.causality;
      } else if (classification.includes('correlat')) {
        bucket = classifications.correlative;
      } else if (classification.includes('suggest')) {
        bucket = classifications.suggestive;
      } else {
        bucket = classifications.unknown;
      }

      bucket.items.push(row);
      
      if (Number.isFinite(ecs)) {
        bucket.scores.push(ecs);
        totalECSSum += ecs;
        totalECSCount++;
      }
    }

    // Calculate averages
    const avgECS = (arr) => {
      if (!arr.length) return null;
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    };

    const stats = {
      total: rows.length,
      overallAvgECS: totalECSCount > 0 ? totalECSSum / totalECSCount : null,
      classifications: {}
    };

    for (const [key, data] of Object.entries(classifications)) {
      stats.classifications[key] = {
        label: data.label,
        count: data.items.length,
        avgECS: avgECS(data.scores),
        percentage: rows.length > 0 ? (data.items.length / rows.length) * 100 : 0,
        items: data.items
      };
    }

    // Determine evidence strength
    const overallECS = stats.overallAvgECS;
    let evidenceStrength = 'insufficient';
    if (overallECS >= 80) evidenceStrength = 'strong';
    else if (overallECS >= 60) evidenceStrength = 'moderate';
    else if (overallECS >= 40) evidenceStrength = 'suggestive';
    else if (overallECS !== null) evidenceStrength = 'weak';

    stats.evidenceStrength = evidenceStrength;

    return stats;
  };

  const stats = calculateECSStats(data);

  if (!stats.total) {
    return (
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="text-center text-slate-500">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No evidence analysis data available</p>
        </div>
      </div>
    );
  }

  // Circular visualization for ECS by classification
  const CircularECSProgress = ({ classification, data, delay = 0 }) => {
    const { label, count, avgECS, percentage } = data;
    const Icon = getClassificationIcon(label);
    
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const pct = Number.isFinite(percentage) ? percentage : 0;
    const strokeDashoffset = circumference * (1 - pct / 100);

    const ecsRadius = 45;
    const ecsCircumference = 2 * Math.PI * ecsRadius;
    const ecsScore = Number.isFinite(avgECS) ? avgECS : 0;
    const ecsOffset = ecsCircumference * (1 - ecsScore / 100);

    const colorClass = label.toLowerCase() === 'causality' ? 'text-purple' :
                       label.toLowerCase() === 'correlative' ? 'text-blue' :
                       label.toLowerCase() === 'suggestive' ? 'text-amber' : 'text-slate';

    return (
      <div 
        className="text-center cursor-pointer hover:scale-105 transition-transform"
        onClick={() => setSelectedClassification(classification)}
      >
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            {/* Outer ECS ring background */}
            <circle
              cx="50" cy="50" r={ecsRadius}
              stroke="currentColor" strokeWidth="3" fill="transparent"
              className="text-slate-200"
            />
            {/* Outer ECS ring progress */}
            <circle
              cx="50" cy="50" r={ecsRadius}
              stroke="currentColor" strokeWidth="3" fill="transparent"
              strokeDasharray={ecsCircumference}
              strokeDashoffset={ecsOffset}
              className={`${getECSColor(avgECS)} transition-all duration-1000`}
              strokeLinecap="round"
              style={{ animationDelay: `${delay}ms` }}
            />

            {/* Inner percentage ring background */}
            <circle
              cx="50" cy="50" r={radius}
              stroke="currentColor" strokeWidth="6" fill="transparent"
              className={`${colorClass}-100`}
            />
            {/* Inner percentage ring progress */}
            <circle
              cx="50" cy="50" r={radius}
              stroke="currentColor" strokeWidth="6" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${colorClass}-500 transition-all duration-1000 ${animateStats ? 'animate-pulse' : ''}`}
              strokeLinecap="round"
              style={{ animationDelay: `${delay}ms` }}
            />
          </svg>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`h-6 w-6 ${colorClass}-600`} />
          </div>

          {/* ECS badge */}
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border">
            <div className={`flex items-center gap-1 px-1`}>
              <Star className={`h-2 w-2 ${getECSColor(avgECS)}`} />
              <span className={`text-xs font-medium ${getECSColor(avgECS)}`}>
                {safeFixed(avgECS, 1)}
              </span>
            </div>
          </div>
        </div>

        <div className={`text-lg font-bold ${colorClass}-600`}>{safeFixed(percentage, 1)}%</div>
        <div className="text-xs text-slate-600">{label} ({count})</div>
        <div className={`text-xs ${getECSColor(avgECS)} font-medium`}>
          Avg ECS: {safeFixed(avgECS, 1)}/100
        </div>
      </div>
    );
  };

  // Get evidence strength color
  const getEvidenceStrengthColor = (strength) => {
    switch (strength) {
      case 'strong': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'suggestive': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'weak': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-slate-800">Evidence Analysis</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getEvidenceStrengthColor(stats.evidenceStrength)}`}>
              {stats.evidenceStrength} evidence
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Overall ECS: {safeFixed(stats.overallAvgECS, 1)}/100
            </span>
            {onViewDetails && (
              <button
                onClick={() => onViewDetails(biomarker, condition)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
              >
                <Eye className="h-3 w-3" />
                View Data
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Display */}
      <div className="p-4">
        {/* Circular Progress Indicators for Classifications */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <CircularECSProgress
            classification="causality"
            data={stats.classifications.causality}
            delay={0}
          />
          <CircularECSProgress
            classification="correlative"
            data={stats.classifications.correlative}
            delay={200}
          />
          <CircularECSProgress
            classification="suggestive"
            data={stats.classifications.suggestive}
            delay={400}
          />
        </div>

        {/* ECS Score Legend */}
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-700">ECS Score Scale (0-100):</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-slate-600">Evidence Causality Score</span>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-green-600">80-100: Strong</span>
            <span className="text-yellow-600">60-80: Moderate</span>
            <span className="text-orange-600">40-60: Suggestive</span>
            <span className="text-red-600">0-40: Weak</span>
          </div>
        </div>

        {/* Overall Evidence Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${getECSColor(stats.overallAvgECS)}`}>
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Evidence Strength: 
                </span>
                <span className={`ml-2 text-sm font-bold ${getECSColor(stats.overallAvgECS)}`}>
                  {safeFixed(stats.overallAvgECS, 1)}/100
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 rounded transition-colors"
            >
              {showInsights ? 'Hide' : 'Show'} Insights
            </button>
          </div>
        </div>

        {/* Distribution Bar Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Evidence Type Distribution</span>
            <span>{stats.total} studies analyzed</span>
          </div>

          <div className="flex h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`bg-purple-500 transition-all duration-1000 ${animateStats ? 'animate-pulse' : ''}`}
              style={{ width: `${stats.classifications.causality.percentage}%` }}
              title={`Causality: ${stats.classifications.causality.percentage.toFixed(1)}%`}
            />
            <div
              className={`bg-blue-500 transition-all duration-1000 delay-200 ${animateStats ? 'animate-pulse' : ''}`}
              style={{ width: `${stats.classifications.correlative.percentage}%` }}
              title={`Correlative: ${stats.classifications.correlative.percentage.toFixed(1)}%`}
            />
            <div
              className={`bg-amber-500 transition-all duration-1000 delay-400 ${animateStats ? 'animate-pulse' : ''}`}
              style={{ width: `${stats.classifications.suggestive.percentage}%` }}
              title={`Suggestive: ${stats.classifications.suggestive.percentage.toFixed(1)}%`}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span className="text-purple-600">Causal</span>
            <span className="text-blue-600">Correlative</span>
            <span className="text-amber-600">Suggestive</span>
          </div>
        </div>

        {/* Show insights if expanded */}
        {showInsights && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Key Insights</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data
                .filter(row => row.Key_Insight_ECS)
                .slice(0, 3)
                .map((row, idx) => (
                  <div key={idx} className="bg-slate-50 rounded-lg p-2 text-xs">
                    <div className={`flex items-center gap-2 mb-1`}>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${getClassificationColor(getClassification(row))}`}>
                        {getClassification(row)}
                      </span>
                      <span className={`font-medium ${getECSColor(getECS(row))}`}>
                        ECS: {safeFixed(getECS(row), 0)}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">{row.Key_Insight_ECS}</p>
                  </div>
                ))}
              {data.filter(row => row.Key_Insight_ECS).length === 0 && (
                <p className="text-slate-500 text-center">No insights available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiomarkerEvidenceAnalysis;
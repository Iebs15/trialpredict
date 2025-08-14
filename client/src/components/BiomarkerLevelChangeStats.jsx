import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Eye, Info, ChevronDown, ChevronUp, Star } from 'lucide-react';

// --- helper utils ---
const toNum = (v) => {
  if (typeof v === 'number') return v;
  if (v == null) return NaN;
  const n = parseFloat(String(v).replace(/[^\d.\-]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};

const norm = (s) => (s || '').toString().trim().toLowerCase();

const getLevel = (row) => {
  // prefer Biomarker_Level_Change; fallback to Biomarker_Change and common variants
  return norm(
    row?.Biomarker_Level_Change ??
    row?.Biomarker_Change ??
    row?.['Biomarker Level Change'] ??
    row?.['Biomarker Level_Change']
  );
};

const getConfidence = (row) => {
  // tolerant to different field spellings; returns NaN if missing
  // SCALE: 0–100 (no normalization)
  return toNum(
    row?.Confidence_Score ??
    row?.['Confidence Score'] ??
    row?.Confidence
  );
};

const safeFixed = (v, d=1) => (Number.isFinite(v) ? v.toFixed(d) : '—');

// Map reliability to tailwind classes
const getReliabilityColor = (reliability) => {
  switch (reliability) {
    case 'high': return 'text-green-600 bg-green-50 border-green-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    default: return 'text-red-600 bg-red-50 border-red-200';
  }
};

const getTrendColor = (trend) => {
  switch (trend) {
    case 'increase': return 'text-green-600';
    case 'decrease': return 'text-red-600';
    default: return 'text-blue-600';
  }
};

// 0–100 scale colors
const getConfidenceColor = (score100) => {
  if (!Number.isFinite(score100)) return 'text-slate-500';
  if (score100 >= 80) return 'text-green-600';
  if (score100 >= 60) return 'text-yellow-600';
  if (score100 >= 40) return 'text-orange-600';
  return 'text-red-600';
};

// --- main component ---
const BiomarkerLevelChangeStats = ({ biomarker, condition, data = [], onViewDetails }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    setAnimateStats(true);
    const timer = setTimeout(() => setAnimateStats(false), 600);
    return () => clearTimeout(timer);
  }, [data]);

  // Calculate level change statistics with per-level average confidence (/100)
  const calculateLevelChangeStats = (rows = []) => {
    const buckets = {
      increase: { items: [], scores: [] },
      decrease: { items: [], scores: [] },
      unchanged: { items: [], scores: [] },
      unknown:  { items: [], scores: [] },
    };

    for (const r of rows) {
      const lvl = getLevel(r);
      const conf = getConfidence(r); // 0–100

      if (lvl === 'increase') buckets.increase.items.push(r);
      else if (lvl === 'decrease') buckets.decrease.items.push(r);
      else if (lvl === 'unchanged') buckets.unchanged.items.push(r);
      else buckets.unknown.items.push(r);

      if (Number.isFinite(conf)) {
        if (lvl === 'increase') buckets.increase.scores.push(conf);
        else if (lvl === 'decrease') buckets.decrease.scores.push(conf);
        else if (lvl === 'unchanged') buckets.unchanged.scores.push(conf);
        else buckets.unknown.scores.push(conf);
      }
    }

    const valid = buckets.increase.items.length + buckets.decrease.items.length + buckets.unchanged.items.length;
    const total = rows.length;

    const pct = (n) => (valid > 0 ? (n / valid) * 100 : 0);

    const avg100 = (arr) => {
      if (!arr.length) return null;
      return arr.reduce((a, b) => a + b, 0) / arr.length; // keep 0–100
    };

    const avgIncrease100  = avg100(buckets.increase.scores);
    const avgDecrease100  = avg100(buckets.decrease.scores);
    const avgUnchanged100 = avg100(buckets.unchanged.scores);

    // dominant trend (exclude unchanged), tie => 'stable'
    let dominantTrend = 'stable';
    const inc = buckets.increase.items.length;
    const dec = buckets.decrease.items.length;
    if (inc > dec) dominantTrend = 'increase';
    else if (dec > inc) dominantTrend = 'decrease';

    // overall reliability from overall average (across valid buckets), 0–100
    const allScores = [
      ...buckets.increase.scores,
      ...buckets.decrease.scores,
      ...buckets.unchanged.scores,
    ];
    let overall100 = null;
    if (allScores.length) {
      overall100 = allScores.reduce((a,b)=>a+b,0)/allScores.length;
    }

    let reliability = 'low';
    if (overall100 != null) {
      if (overall100 >= 80) reliability = 'high';
      else if (overall100 >= 60) reliability = 'medium';
      else reliability = 'low';
    }

    return {
      total,
      validData: valid,
      increase: inc,
      decrease: dec,
      unchanged: buckets.unchanged.items.length,
      unknown: buckets.unknown.items.length,
      percentages: {
        increase: pct(inc),
        decrease: pct(dec),
        unchanged: pct(buckets.unchanged.items.length),
      },
      confidenceScores: {                 // per-level averages on a 0–100 scale
        increase:  avgIncrease100,
        decrease:  avgDecrease100,
        unchanged: avgUnchanged100,
      },
      dominantTrend,
      reliability,                        // 'high' | 'medium' | 'low'
      overallConfidence100: overall100,   // 0–100
    };
  };

  const stats = calculateLevelChangeStats(data);

  if (!stats.total) {
    return (
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="text-center text-slate-500">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No level change data available</p>
        </div>
      </div>
    );
  }

  // Circular viz with 0–100 confidence outer ring
  const CircularProgress = ({
    percentage,
    confidenceScore, // 0–100 (can be null)
    color,
    icon: Icon,
    label,
    count,
    delay = 0
  }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const pct = Number.isFinite(percentage) ? percentage : 0;
    const strokeDashoffset = circumference * (1 - pct / 100);

    const confidenceRadius = 45;
    const confidenceCircumference = 2 * Math.PI * confidenceRadius;
    const conf = Number.isFinite(confidenceScore) ? confidenceScore : 0; // 0–100
    const confidenceOffset = confidenceCircumference * (1 - (conf / 100));

    return (
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-2">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
            {/* Outer confidence ring background */}
            <circle
              cx="50" cy="50" r={confidenceRadius}
              stroke="currentColor" strokeWidth="3" fill="transparent"
              className="text-slate-200"
            />
            {/* Outer confidence ring progress (0–100) */}
            <circle
              cx="50" cy="50" r={confidenceRadius}
              stroke="currentColor" strokeWidth="3" fill="transparent"
              strokeDasharray={confidenceCircumference}
              strokeDashoffset={confidenceOffset}
              className={`${getConfidenceColor(confidenceScore)} transition-all duration-1000`}
              strokeLinecap="round"
              style={{ animationDelay: `${delay}ms` }}
            />

            {/* Inner percentage ring background */}
            <circle
              cx="50" cy="50" r={radius}
              stroke="currentColor" strokeWidth="6" fill="transparent"
              className={`${color}-100`}
            />
            {/* Inner percentage ring progress */}
            <circle
              cx="50" cy="50" r={radius}
              stroke="currentColor" strokeWidth="6" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={`${color}-500 transition-all duration-1000 ${animateStats ? 'animate-pulse' : ''}`}
              strokeLinecap="round"
              style={{ animationDelay: `${delay}ms` }}
            />
          </svg>

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={`h-6 w-6 ${color}-600`} />
          </div>

          {/* Confidence badge */}
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border">
            <div className={`flex items-center gap-1 px-1`}>
              <Star className={`h-2 w-2 ${getConfidenceColor(confidenceScore)}`} />
              <span className={`text-xs font-medium ${getConfidenceColor(confidenceScore)}`}>
                {safeFixed(confidenceScore, 1)}
              </span>
            </div>
          </div>
        </div>

        <div className={`text-lg font-bold ${color}-600`}>{safeFixed(percentage, 1)}%</div>
        <div className="text-xs text-slate-600">{label} ({count})</div>
        <div className={`text-xs ${getConfidenceColor(confidenceScore)} font-medium`}>
          Confidence: {safeFixed(confidenceScore, 1)}/100
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-slate-800">Level Change Analysis</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getReliabilityColor(stats.reliability)}`}>
              {stats.reliability} confidence
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{stats.validData} valid data points</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-1 hover:bg-slate-200 rounded transition-colors"
            >
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Display */}
      <div className="p-4">
        {/* Circular Progress Indicators with Confidence (0–100) */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <CircularProgress
            percentage={stats.percentages.increase}
            confidenceScore={stats.confidenceScores.increase}
            color="text-green"
            icon={TrendingUp}
            label="Increased"
            count={stats.increase}
            delay={0}
          />
          <CircularProgress
            percentage={stats.percentages.decrease}
            confidenceScore={stats.confidenceScores.decrease}
            color="text-red"
            icon={TrendingDown}
            label="Decreased"
            count={stats.decrease}
            delay={200}
          />
          <CircularProgress
            percentage={stats.percentages.unchanged}
            confidenceScore={stats.confidenceScores.unchanged}
            color="text-blue"
            icon={Minus}
            label="Unchanged"
            count={stats.unchanged}
            delay={400}
          />
        </div>

        {/* Confidence Legend (0–100) */}
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-700">Confidence Score Legend (0–100):</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500" />
              <span className="text-xs text-slate-600">Outer ring shows average confidence</span>
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-green-600">80–100: High</span>
            <span className="text-yellow-600">60–80: Medium</span>
            <span className="text-orange-600">40–60: Low</span>
            <span className="text-red-600">0–40: Very Low</span>
          </div>
        </div>

        {/* Dominant Trend Summary */}
        <div className="bg-slate-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${getTrendColor(stats.dominantTrend)}`}>
                {stats.dominantTrend === 'increase' && <TrendingUp className="h-4 w-4" />}
                {stats.dominantTrend === 'decrease' && <TrendingDown className="h-4 w-4" />}
                {stats.dominantTrend === 'stable' && <Minus className="h-4 w-4" />}
              </div>
              <span className="text-sm font-medium text-slate-700">
                Dominant trend:{' '}
                <span className={getTrendColor(stats.dominantTrend)}>
                  {stats.dominantTrend === 'stable' ? 'No clear trend' : stats.dominantTrend}
                </span>
              </span>
            </div>
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

        {/* Horizontal Bar Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Distribution Overview</span>
            <span>{stats.validData} data points</span>
          </div>

          <div className="flex h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`bg-green-500 transition-all duration-1000 ${animateStats ? 'animate-pulse' : ''}`}
              style={{ width: `${stats.percentages.increase}%` }}
            />
            <div
              className={`bg-red-500 transition-all duration-1000 delay-200 ${animateStats ? 'animate-pulse' : ''}`}
              style={{ width: `${stats.percentages.decrease}%` }}
            />
            <div
              className={`bg-blue-500 transition-all duration-1000 delay-400 ${animateStats ? 'animate-pulse' : ''}`}
              style={{ width: `${stats.percentages.unchanged}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span>Increase</span>
            <span>Decrease</span>
            <span>Unchanged</span>
          </div>
        </div>

        {/* Detailed Stats (Expandable) */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Total Studies:</span>
                <span className="font-medium ml-2">{stats.total}</span>
              </div>
              <div>
                <span className="text-slate-600">Valid Data:</span>
                <span className="font-medium ml-2">{stats.validData}</span>
              </div>
              <div>
                <span className="text-slate-600">Data Quality:</span>
                <span className={`font-medium ml-2 ${getReliabilityColor(stats.reliability).split(' ')[0]}`}>
                  {stats.total ? ((stats.validData / stats.total) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
              <div>
                <span className="text-slate-600">Unknown/Missing:</span>
                <span className="font-medium ml-2">{stats.unknown}</span>
              </div>
            </div>

            {/* Confidence Score Details (0–100) */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Average Confidence Scores (0–100)</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className={`font-bold ${getConfidenceColor(stats.confidenceScores.increase)}`}>
                    {safeFixed(stats.confidenceScores.increase, 1)}
                  </div>
                  <div className="text-xs text-slate-600">Increase</div>
                </div>
                <div className="text-center">
                  <div className={`font-bold ${getConfidenceColor(stats.confidenceScores.decrease)}`}>
                    {safeFixed(stats.confidenceScores.decrease, 1)}
                  </div>
                  <div className="text-xs text-slate-600">Decrease</div>
                </div>
                <div className="text-center">
                  <div className={`font-bold ${getConfidenceColor(stats.confidenceScores.unchanged)}`}>
                    {safeFixed(stats.confidenceScores.unchanged, 1)}
                  </div>
                  <div className="text-xs text-slate-600">Unchanged</div>
                </div>
              </div>
            </div>

            {stats.unknown > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-amber-800">
                  <Info className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {stats.unknown} studies have unclear or missing level change data
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BiomarkerLevelChangeStats;

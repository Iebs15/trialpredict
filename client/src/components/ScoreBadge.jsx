// import React from 'react';
// import { Info, Zap, Activity, AlertCircle } from 'lucide-react';

// const ScoreBadge = ({ score, showPercentage = true, showIcon = true, size = 'default' }) => {
//   const sizeClasses = {
//     small: 'px-2 py-1 text-xs',
//     default: 'px-3 py-1 text-sm',
//     large: 'px-4 py-2 text-base'
//   };

//   const iconSizes = {
//     small: 'h-3 w-3',
//     default: 'h-4 w-4',
//     large: 'h-5 w-5'
//   };

//   if (score === null || score === undefined) {
//     return (
//       <div className={`flex items-center gap-2 bg-slate-100 text-slate-600 rounded-full ${sizeClasses[size]}`}>
//         {showIcon && <Info className={iconSizes[size]} />}
//         <span className="font-medium">No data</span>
//       </div>
//     );
//   }

//   const getScoreColor = (score) => {
//     if (score >= 0.7) return 'bg-green-100 text-green-800 border-green-200';
//     if (score >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//     return 'bg-red-100 text-red-800 border-red-200';
//   };

//   const getScoreIcon = (score) => {
//     if (score >= 0.7) return <Zap className={iconSizes[size]} />;
//     if (score >= 0.4) return <Activity className={iconSizes[size]} />;
//     return <AlertCircle className={iconSizes[size]} />;
//   };

//   const getScoreLabel = (score) => {
//     if (score >= 0.7) return 'High';
//     if (score >= 0.4) return 'Medium';
//     return 'Low';
//   };

//   return (
//     <div className={`flex items-center gap-2 rounded-full border ${getScoreColor(score)} ${sizeClasses[size]}`}>
//       {showIcon && getScoreIcon(score)}
//       <span className="font-medium">
//         {getScoreLabel(score)}
//         {showPercentage && ` (${(score * 100).toFixed(1)}%)`}
//       </span>
//     </div>
//   );
// };

// export default ScoreBadge;


import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ScoreBadge = ({ 
  score, 
  size = 'default', 
  showPercentage = true, 
  showIcon = false, 
  showTrend = false, 
  previousScore = null,
  variant = 'default' // default, minimal, detailed
}) => {
  // Normalize score to 0-1 range if it's not already
  const normalizedScore = typeof score === 'number' ? Math.max(0, Math.min(1, score)) : 0;
  const percentage = normalizedScore * 100;

  // Determine score category and styling
  const getScoreCategory = (score) => {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.65) return 'good';
    if (score >= 0.45) return 'moderate';
    if (score >= 0.25) return 'low';
    return 'poor';
  };

  const category = getScoreCategory(normalizedScore);

  // Size variants
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  // Color schemes based on score category
  const colorSchemes = {
    excellent: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      gradient: 'from-emerald-400 to-emerald-500'
    },
    good: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      gradient: 'from-green-400 to-green-500'
    },
    moderate: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      gradient: 'from-yellow-400 to-yellow-500'
    },
    low: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      gradient: 'from-orange-400 to-orange-500'
    },
    poor: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      gradient: 'from-red-400 to-red-500'
    }
  };

  const colors = colorSchemes[category];

  // Calculate trend if previous score is provided
  let trend = null;
  if (showTrend && previousScore !== null) {
    const diff = normalizedScore - previousScore;
    if (Math.abs(diff) > 0.01) { // Only show trend if difference is significant
      trend = {
        direction: diff > 0 ? 'up' : 'down',
        magnitude: Math.abs(diff),
        percentage: Math.abs(diff) * 100
      };
    }
  }

  // Get appropriate icon
  const getIcon = () => {
    if (showTrend && trend) {
      return trend.direction === 'up' ? TrendingUp : TrendingDown;
    }
    if (showIcon) {
      return category === 'excellent' || category === 'good' ? TrendingUp : 
             category === 'poor' || category === 'low' ? TrendingDown : Minus;
    }
    return null;
  };

  const Icon = getIcon();

  // Render variants
  if (variant === 'minimal') {
    return (
      <span className={`inline-flex items-center font-mono font-semibold ${colors.text}`}>
        {showPercentage ? `${percentage.toFixed(1)}%` : normalizedScore.toFixed(3)}
        {Icon && <Icon className="h-3 w-3 ml-1" />}
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`inline-flex flex-col items-center ${sizeClasses[size]} ${colors.bg} ${colors.text} border ${colors.border} rounded-lg font-medium`}>
        <div className="flex items-center gap-1">
          {Icon && <Icon className="h-4 w-4" />}
          <span className="font-mono">
            {showPercentage ? `${percentage.toFixed(1)}%` : normalizedScore.toFixed(3)}
          </span>
        </div>
        <div className="text-xs opacity-75 capitalize">{category}</div>
        {trend && (
          <div className="text-xs opacity-75">
            {trend.direction === 'up' ? '↗' : '↘'} {trend.percentage.toFixed(1)}%
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} ${colors.bg} ${colors.text} border ${colors.border} rounded-full font-medium font-mono`}>
      {Icon && <Icon className="h-3 w-3" />}
      {showPercentage ? `${percentage.toFixed(1)}%` : normalizedScore.toFixed(3)}
      {trend && (
        <span className="text-xs opacity-75">
          ({trend.direction === 'up' ? '+' : '-'}{trend.percentage.toFixed(1)}%)
        </span>
      )}
    </span>
  );
};

// Additional helper component for score comparison
export const ScoreComparison = ({ scores, labels, size = 'default' }) => {
  if (!scores || scores.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {scores.map((score, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          {labels && labels[index] && (
            <span className="text-xs text-slate-500 font-medium">
              {labels[index]}
            </span>
          )}
          <ScoreBadge 
            score={score} 
            size={size}
            showTrend={index > 0}
            previousScore={index > 0 ? scores[index - 1] : null}
          />
        </div>
      ))}
    </div>
  );
};

// Score range component
export const ScoreRange = ({ minScore, maxScore, averageScore, size = 'default' }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-500 mb-1">Min</span>
        <ScoreBadge score={minScore} size={size} variant="minimal" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-0.5 bg-slate-300 relative">
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full"
            style={{ left: `${((averageScore - minScore) / (maxScore - minScore)) * 100}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-500 mb-1">Avg</span>
        <ScoreBadge score={averageScore} size={size} />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-0.5 bg-slate-300" />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-slate-500 mb-1">Max</span>
        <ScoreBadge score={maxScore} size={size} variant="minimal" />
      </div>
    </div>
  );
};

// Score distribution component
export const ScoreDistribution = ({ scores, title }) => {
  if (!scores || scores.length === 0) return null;

  const distribution = {
    excellent: scores.filter(s => s >= 0.8).length,
    good: scores.filter(s => s >= 0.65 && s < 0.8).length,
    moderate: scores.filter(s => s >= 0.45 && s < 0.65).length,
    low: scores.filter(s => s >= 0.25 && s < 0.45).length,
    poor: scores.filter(s => s < 0.25).length
  };

  const total = scores.length;

  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      {title && (
        <h4 className="font-medium text-slate-800 mb-3">{title}</h4>
      )}
      <div className="space-y-2">
        {Object.entries(distribution).map(([category, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const colors = {
            excellent: 'bg-emerald-500',
            good: 'bg-green-500',
            moderate: 'bg-yellow-500',
            low: 'bg-orange-500',
            poor: 'bg-red-500'
          };

          return (
            <div key={category} className="flex items-center gap-3">
              <div className="w-16 text-xs text-slate-600 capitalize">
                {category}
              </div>
              <div className="flex-1 bg-slate-200 rounded-full h-2">
                <div
                  className={`${colors[category]} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="w-12 text-xs text-slate-600 text-right">
                {count}
              </div>
              <div className="w-12 text-xs text-slate-500 text-right">
                {percentage.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 pt-2 border-t border-slate-300 text-xs text-slate-500">
        Total: {total} scores • Avg: {(scores.reduce((a, b) => a + b, 0) / total * 100).toFixed(1)}%
      </div>
    </div>
  );
};

export default ScoreBadge;
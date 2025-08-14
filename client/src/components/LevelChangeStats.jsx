import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Eye, BarChart3, 
  Users, Activity, AlertCircle, CheckCircle
} from 'lucide-react';

const LevelChangeStats = ({ 
  biomarkerName, 
  condition, 
  onViewData, 
  apiService,
  size = 'default' 
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (biomarkerName && condition) {
      fetchLevelChangeStats();
    }
  }, [biomarkerName, condition]);

  const fetchLevelChangeStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.calculateBiomarkerLevelChangeScore(biomarkerName, condition);
      
      if (result.success) {
        setStats(result);
      } else {
        setError(result.error || 'Failed to fetch statistics');
      }
    } catch (error) {
      console.error('Error fetching level change stats:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (type, percentage) => {
    const props = { className: "h-4 w-4" };
    
    switch (type) {
      case 'increase':
        return <TrendingUp {...props} className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown {...props} className="h-4 w-4 text-red-600" />;
      case 'unchanged':
        return <Minus {...props} className="h-4 w-4 text-gray-600" />;
      default:
        return <Activity {...props} className="h-4 w-4 text-blue-600" />;
    }
  };

  const getChangeColor = (type) => {
    switch (type) {
      case 'increase':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          gradient: 'from-green-400 to-green-500'
        };
      case 'decrease':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          gradient: 'from-red-400 to-red-500'
        };
      case 'unchanged':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          gradient: 'from-gray-400 to-gray-500'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          gradient: 'from-blue-400 to-blue-500'
        };
    }
  };

  const getReliabilityIndicator = (reliability, total) => {
    const indicators = {
      high: { icon: CheckCircle, color: 'text-green-600', label: 'High Confidence' },
      medium: { icon: AlertCircle, color: 'text-yellow-600', label: 'Medium Confidence' },
      low: { icon: AlertCircle, color: 'text-red-600', label: 'Low Confidence' }
    };
    
    const indicator = indicators[reliability] || indicators.low;
    const Icon = indicator.icon;
    
    return (
      <div className={`flex items-center gap-1 text-xs ${indicator.color}`}>
        <Icon className="h-3 w-3" />
        <span>{indicator.label}</span>
        <span className="text-gray-500">({total} studies)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 border border-slate-200 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="h-6 bg-slate-200 rounded w-16"></div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <div className="flex items-center gap-2 text-red-800 mb-2">
          <AlertCircle className="h-4 w-4" />
          <span className="font-medium">Error Loading Stats</span>
        </div>
        <p className="text-red-700 text-sm">{error}</p>
        <button
          onClick={fetchLevelChangeStats}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const { levelChangeStats, percentages, score, reliability } = stats;
  const maxPercentage = Math.max(
    parseFloat(percentages.increase),
    parseFloat(percentages.decrease),
    parseFloat(percentages.unchanged)
  );

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-slate-600" />
          <h4 className="font-semibold text-slate-800">Level Change Analysis</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-lg font-bold text-slate-800">
              {(score * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-500">Overall Score</div>
          </div>
          <button
            onClick={() => onViewData(biomarkerName, condition)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Eye className="h-4 w-4" />
            View Data
          </button>
        </div>
      </div>

      {/* Level Change Distribution */}
      <div className="space-y-3 mb-4">
        {[
          { type: 'increase', label: 'Increased', count: levelChangeStats.increase, percentage: percentages.increase },
          { type: 'decrease', label: 'Decreased', count: levelChangeStats.decrease, percentage: percentages.decrease },
          { type: 'unchanged', label: 'Unchanged', count: levelChangeStats.unchanged, percentage: percentages.unchanged }
        ].map(({ type, label, count, percentage }) => {
          const colors = getChangeColor(type);
          const width = maxPercentage > 0 ? (parseFloat(percentage) / maxPercentage) * 100 : 0;
          
          return (
            <div key={type} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getChangeIcon(type)}
                  <span className="font-medium text-slate-700">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">{count} studies</span>
                  <span className={`font-bold ${colors.text}`}>{percentage}%</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className={`h-2 ${colors.bg} rounded-full overflow-hidden border ${colors.border}`}>
                <div
                  className={`h-full bg-gradient-to-r ${colors.gradient} transition-all duration-700 ease-out`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with Reliability */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Users className="h-3 w-3" />
          <span>Total: {levelChangeStats.total} studies</span>
        </div>
        {getReliabilityIndicator(reliability, levelChangeStats.total)}
      </div>
    </div>
  );
};

// Compact version for smaller displays
export const CompactLevelChangeStats = ({ 
  biomarkerName, 
  condition, 
  onViewData, 
  apiService 
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (biomarkerName && condition) {
      apiService.calculateBiomarkerLevelChangeScore(biomarkerName, condition)
        .then(result => {
          if (result.success) setStats(result);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [biomarkerName, condition]);

  if (loading) {
    return <div className="animate-pulse bg-slate-200 h-12 rounded"></div>;
  }

  if (!stats) return null;

  const { percentages, score } = stats;

  return (
    <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Level Changes</span>
        <button
          onClick={() => onViewData(biomarkerName, condition)}
          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Eye className="h-3 w-3" />
          View
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded"></div>
          <span>{percentages.increase}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded"></div>
          <span>{percentages.decrease}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-500 rounded"></div>
          <span>{percentages.unchanged}%</span>
        </div>
        <div className="ml-auto font-bold text-slate-800">
          {(score * 100).toFixed(0)}%
        </div>
      </div>
    </div>
  );
};

// Category-wide stats component
export const CategoryLevelChangeStats = ({ 
  biomarkers, 
  condition, 
  onViewData, 
  apiService 
}) => {
  const [allStats, setAllStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStats = async () => {
      setLoading(true);
      const stats = {};
      
      for (const biomarker of biomarkers) {
        if (biomarker.name && biomarker.name.trim()) {
          try {
            const result = await apiService.calculateBiomarkerLevelChangeScore(
              biomarker.name, 
              condition
            );
            if (result.success) {
              stats[biomarker.name] = result;
            }
          } catch (error) {
            console.error(`Error fetching stats for ${biomarker.name}:`, error);
          }
        }
      }
      
      setAllStats(stats);
      setLoading(false);
    };

    if (biomarkers.length > 0) {
      fetchAllStats();
    }
  }, [biomarkers, condition]);

  if (loading) {
    return (
      <div className="space-y-4">
        {biomarkers.map((_, index) => (
          <div key={index} className="animate-pulse bg-slate-200 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {biomarkers.map((biomarker) => {
        const stats = allStats[biomarker.name];
        
        if (!stats) {
          return (
            <div key={biomarker.name} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-700">{biomarker.name}</h4>
                <span className="text-sm text-slate-500">No data available</span>
              </div>
            </div>
          );
        }

        return (
          <div key={biomarker.name} className="space-y-2">
            <h4 className="font-semibold text-slate-800">{biomarker.name}</h4>
            <LevelChangeStats
              biomarkerName={biomarker.name}
              condition={condition}
              onViewData={onViewData}
              apiService={apiService}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LevelChangeStats;
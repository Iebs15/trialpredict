import React from 'react';
import { TrendingUp, TrendingDown, Minus, Eye, BarChart3 } from 'lucide-react';

const EnhancedScoreDisplay = ({ 
  scoreData, 
  biomarkerName, 
  condition, 
  onViewData,
  size = 'default' 
}) => {
  if (!scoreData || !scoreData.success) {
    return (
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="text-center text-slate-500">
          <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  const { level_change_percentages, total_records, score } = scoreData;
  
  const getLevelChangeColor = (type) => {
    switch (type) {
      case 'increase': return 'bg-emerald-500';
      case 'decrease': return 'bg-red-500';
      case 'unchanged': return 'bg-yellow-500';
      default: return 'bg-slate-400';
    }
  };

  const getLevelChangeIcon = (type) => {
    switch (type) {
      case 'increase': return <TrendingUp className="h-4 w-4" />;
      case 'decrease': return <TrendingDown className="h-4 w-4" />;
      case 'unchanged': return <Minus className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getLevelChangeLabel = (type) => {
    switch (type) {
      case 'increase': return 'Increased';
      case 'decrease': return 'Decreased';
      case 'unchanged': return 'Unchanged';
      default: return 'Unknown';
    }
  };

  const getEffectivenessColor = (score) => {
    if (score >= 0.7) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const levelChangeData = [
    { type: 'increase', percentage: level_change_percentages.increase },
    { type: 'decrease', percentage: level_change_percentages.decrease },
    { type: 'unchanged', percentage: level_change_percentages.unchanged }
  ].filter(item => item.percentage > 0);

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{biomarkerName}</h3>
          <p className="text-sm text-slate-600">{condition} Condition</p>
          <p className="text-xs text-slate-500 mt-1">{total_records} total records</p>
        </div>
        <div className={`px-4 py-2 rounded-full border ${getEffectivenessColor(score)}`}>
          <div className="text-sm font-semibold">
            Effectiveness: {(score * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Level Change Visualization */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Biomarker Level Changes</h4>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex h-6 bg-slate-200 rounded-full overflow-hidden">
            {levelChangeData.map((item, index) => (
              <div
                key={item.type}
                className={`${getLevelChangeColor(item.type)} transition-all duration-1000 ease-out`}
                style={{ width: `${item.percentage}%` }}
                title={`${getLevelChangeLabel(item.type)}: ${item.percentage}%`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2">
          {levelChangeData.map((item) => (
            <div key={item.type} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${getLevelChangeColor(item.type)}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-slate-700">
                  {getLevelChangeIcon(item.type)}
                  <span className="text-xs font-medium truncate">
                    {getLevelChangeLabel(item.type)}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Top Study Type</div>
          <div className="text-xs font-bold text-blue-800">{scoreData.top_study_type}</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">Primary Skin Type</div>
          <div className="text-xs font-bold text-purple-800">{scoreData.top_skin_type}</div>
        </div>
      </div>

      {/* View Data Button */}
      <button
        onClick={() => onViewData(biomarkerName, condition)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium transform hover:scale-105"
      >
        <Eye className="h-4 w-4" />
        View Detailed Analytics
      </button>
    </div>
  );
};

export default EnhancedScoreDisplay;
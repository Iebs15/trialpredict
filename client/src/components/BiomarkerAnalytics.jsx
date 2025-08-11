import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Target, Zap, Brain, Eye, Filter, 
  Download, Share2, Info, AlertTriangle, CheckCircle, Clock
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import ScoreBadge from './ScoreBadge';
import ApiService from '../services/api';

const BiomarkerAnalytics = ({ 
  treatments = [], 
  selectedTreatments = [], 
  onBiomarkerSelect 
}) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedBiomarker, setSelectedBiomarker] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({
    minScore: 0,
    maxScore: 1,
    conditions: [],
    sortBy: 'score_desc'
  });

  useEffect(() => {
    if (selectedTreatments.length > 0) {
      analyzeSelectedTreatments();
    }
  }, [selectedTreatments, treatments]);

  const analyzeSelectedTreatments = async () => {
    setLoading(true);
    setError(null);

    try {
      const selectedTreatmentData = treatments.filter(t => 
        selectedTreatments.includes(t.id)
      );

      // Gather comprehensive analytics
      const analytics = await gatherComprehensiveAnalytics(selectedTreatmentData);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error analyzing treatments:', error);
      setError('Failed to analyze treatments');
    } finally {
      setLoading(false);
    }
  };

  const gatherComprehensiveAnalytics = async (treatments) => {
    const analytics = {
      overview: {
        totalTreatments: treatments.length,
        totalBiomarkers: 0,
        uniqueBiomarkers: new Set(),
        conditions: new Set(),
        avgScoresPerTreatment: []
      },
      biomarkerAnalysis: {},
      performanceMetrics: {},
      interactions: {},
      recommendations: []
    };

    // Process each treatment
    for (const treatment of treatments) {
      analytics.overview.conditions.add(treatment.condition);
      const treatmentScores = [];

      // Get scores for each biomarker
      for (const biomarker of treatment.biomarkers) {
        if (biomarker.name && biomarker.name.trim()) {
          const biomarkerName = biomarker.name.trim();
          analytics.overview.uniqueBiomarkers.add(biomarkerName);

          try {
            // Get biomarker score
            const scoreResponse = await ApiService.calculateBiomarkerScore(
              biomarkerName, 
              treatment.condition
            );

            if (scoreResponse.success) {
              const score = scoreResponse.score;
              treatmentScores.push(score);

              // Initialize biomarker analysis if not exists
              if (!analytics.biomarkerAnalysis[biomarkerName]) {
                analytics.biomarkerAnalysis[biomarkerName] = {
                  name: biomarkerName,
                  scores: [],
                  conditions: {},
                  treatments: [],
                  statistics: {
                    min: Infinity,
                    max: -Infinity,
                    avg: 0,
                    variance: 0
                  }
                };
              }

              // Add score data
              const biomarkerData = analytics.biomarkerAnalysis[biomarkerName];
              biomarkerData.scores.push(score);
              biomarkerData.conditions[treatment.condition] = 
                biomarkerData.conditions[treatment.condition] || [];
              biomarkerData.conditions[treatment.condition].push({
                treatment: treatment.name,
                score: score,
                coverage: scoreResponse.biomarker_pdfs / scoreResponse.total_pdfs
              });
              biomarkerData.treatments.push({
                name: treatment.name,
                condition: treatment.condition,
                score: score
              });
            }
          } catch (error) {
            console.error(`Error getting score for ${biomarkerName}:`, error);
          }
        }
      }

      // Calculate treatment average
      const avgScore = treatmentScores.length > 0 ? 
        treatmentScores.reduce((a, b) => a + b, 0) / treatmentScores.length : 0;
      
      analytics.overview.avgScoresPerTreatment.push({
        treatment: treatment.name,
        condition: treatment.condition,
        avgScore: avgScore,
        biomarkerCount: treatmentScores.length
      });
    }

    // Calculate biomarker statistics
    Object.values(analytics.biomarkerAnalysis).forEach(biomarker => {
      const scores = biomarker.scores;
      if (scores.length > 0) {
        biomarker.statistics.min = Math.min(...scores);
        biomarker.statistics.max = Math.max(...scores);
        biomarker.statistics.avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        
        // Calculate variance
        const mean = biomarker.statistics.avg;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
        biomarker.statistics.variance = variance;
        biomarker.statistics.stdDev = Math.sqrt(variance);
      }
    });

    analytics.overview.totalBiomarkers = analytics.overview.uniqueBiomarkers.size;
    analytics.overview.uniqueBiomarkers = Array.from(analytics.overview.uniqueBiomarkers);
    analytics.overview.conditions = Array.from(analytics.overview.conditions);

    // Generate performance metrics
    analytics.performanceMetrics = generatePerformanceMetrics(analytics);

    // Generate recommendations
    analytics.recommendations = generateRecommendations(analytics);

    return analytics;
  };

  const generatePerformanceMetrics = (analytics) => {
    const metrics = {
      topPerformingBiomarkers: [],
      consistentBiomarkers: [],
      variableBiomarkers: [],
      treatmentRankings: [],
      conditionAnalysis: {}
    };

    // Rank biomarkers by average score
    const biomarkersByScore = Object.values(analytics.biomarkerAnalysis)
      .sort((a, b) => b.statistics.avg - a.statistics.avg);

    metrics.topPerformingBiomarkers = biomarkersByScore.slice(0, 5);

    // Find consistent biomarkers (low variance)
    metrics.consistentBiomarkers = biomarkersByScore
      .filter(b => b.statistics.variance < 0.05)
      .slice(0, 5);

    // Find variable biomarkers (high variance)
    metrics.variableBiomarkers = biomarkersByScore
      .filter(b => b.statistics.variance > 0.15)
      .slice(0, 5);

    // Rank treatments
    metrics.treatmentRankings = analytics.overview.avgScoresPerTreatment
      .sort((a, b) => b.avgScore - a.avgScore);

    // Analyze by condition
    analytics.overview.conditions.forEach(condition => {
      const conditionBiomarkers = Object.values(analytics.biomarkerAnalysis)
        .filter(b => b.conditions[condition])
        .map(b => ({
          name: b.name,
          avgScore: b.conditions[condition].reduce((sum, item) => sum + item.score, 0) / b.conditions[condition].length,
          treatments: b.conditions[condition].length
        }))
        .sort((a, b) => b.avgScore - a.avgScore);

      metrics.conditionAnalysis[condition] = {
        topBiomarkers: conditionBiomarkers.slice(0, 3),
        avgScore: conditionBiomarkers.reduce((sum, b) => sum + b.avgScore, 0) / conditionBiomarkers.length,
        biomarkerCount: conditionBiomarkers.length
      };
    });

    return metrics;
  };

  const generateRecommendations = (analytics) => {
    const recommendations = [];

    // High-performing biomarker recommendations
    const topBiomarkers = Object.values(analytics.biomarkerAnalysis)
      .sort((a, b) => b.statistics.avg - a.statistics.avg)
      .slice(0, 3);

    if (topBiomarkers.length > 0) {
      recommendations.push({
        type: 'high_performance',
        title: 'Focus on High-Performing Biomarkers',
        description: `${topBiomarkers.map(b => b.name).join(', ')} show the highest average scores across treatments.`,
        priority: 'high',
        actionable: true,
        biomarkers: topBiomarkers.map(b => b.name)
      });
    }

    // Consistency recommendations
    const consistentBiomarkers = Object.values(analytics.biomarkerAnalysis)
      .filter(b => b.statistics.variance < 0.05 && b.statistics.avg > 0.5);

    if (consistentBiomarkers.length > 0) {
      recommendations.push({
        type: 'consistency',
        title: 'Reliable Biomarkers Identified',
        description: `${consistentBiomarkers.map(b => b.name).join(', ')} show consistent performance across treatments.`,
        priority: 'medium',
        actionable: true,
        biomarkers: consistentBiomarkers.map(b => b.name)
      });
    }

    // Variable biomarker warning
    const variableBiomarkers = Object.values(analytics.biomarkerAnalysis)
      .filter(b => b.statistics.variance > 0.2);

    if (variableBiomarkers.length > 0) {
      recommendations.push({
        type: 'caution',
        title: 'Variable Biomarker Performance',
        description: `${variableBiomarkers.map(b => b.name).join(', ')} show high variability. Consider additional validation.`,
        priority: 'medium',
        actionable: false,
        biomarkers: variableBiomarkers.map(b => b.name)
      });
    }

    return recommendations;
  };

  const handleBiomarkerClick = (biomarkerName) => {
    setSelectedBiomarker(biomarkerName);
    if (onBiomarkerSelect) {
      onBiomarkerSelect(biomarkerName);
    }
  };

  const exportAnalytics = () => {
    if (!analyticsData) return;

    const exportData = {
      timestamp: new Date().toISOString(),
      analytics: analyticsData,
      treatments: treatments.filter(t => selectedTreatments.includes(t.id)),
      filters: filterCriteria
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `biomarker_analytics_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <LoadingSpinner text="Analyzing biomarker data..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl p-8 border border-red-200 shadow-sm">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Analysis Failed</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={analyzeSelectedTreatments}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600">Select treatments to see detailed analytics</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Biomarker Analytics</h3>
              <p className="text-sm text-slate-600">
                Advanced analysis of {analyticsData.overview.totalTreatments} treatments, 
                {analyticsData.overview.totalBiomarkers} biomarkers
              </p>
            </div>
          </div>
          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'biomarkers', label: 'Biomarker Analysis', icon: Target },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'recommendations', label: 'Recommendations', icon: Zap }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab analyticsData={analyticsData} />
        )}
        {activeTab === 'biomarkers' && (
          <BiomarkersTab 
            analyticsData={analyticsData} 
            onBiomarkerClick={handleBiomarkerClick}
            selectedBiomarker={selectedBiomarker}
          />
        )}
        {activeTab === 'performance' && (
          <PerformanceTab analyticsData={analyticsData} />
        )}
        {activeTab === 'recommendations' && (
          <RecommendationsTab analyticsData={analyticsData} />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ analyticsData }) => (
  <div className="space-y-6">
    {/* Key Metrics */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <MetricCard
        title="Treatments"
        value={analyticsData.overview.totalTreatments}
        icon={BarChart3}
        color="blue"
      />
      <MetricCard
        title="Biomarkers"
        value={analyticsData.overview.totalBiomarkers}
        icon={Target}
        color="green"
      />
      <MetricCard
        title="Conditions"
        value={analyticsData.overview.conditions.length}
        icon={Filter}
        color="purple"
      />
      <MetricCard
        title="Avg Score"
        value={`${(analyticsData.overview.avgScoresPerTreatment.reduce((sum, t) => sum + t.avgScore, 0) / analyticsData.overview.avgScoresPerTreatment.length * 100).toFixed(1)}%`}
        icon={TrendingUp}
        color="orange"
      />
    </div>

    {/* Treatment Performance Chart */}
    <div className="bg-slate-50 rounded-lg p-6">
      <h4 className="font-semibold text-slate-800 mb-4">Treatment Performance Overview</h4>
      <div className="space-y-3">
        {analyticsData.overview.avgScoresPerTreatment.map((treatment, index) => (
          <div key={treatment.treatment} className="flex items-center gap-4">
            <div className="w-32 text-sm font-medium text-slate-700 truncate">
              {treatment.treatment}
            </div>
            <div className="flex-1 bg-slate-200 rounded-full h-8 relative">
              <div
                className={`bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full transition-all duration-1000 flex items-center justify-end pr-3`}
                style={{ width: `${treatment.avgScore * 100}%` }}
              >
                <span className="text-white text-xs font-bold">
                  {(treatment.avgScore * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-20 text-right">
              <span className="text-xs text-slate-500">
                {treatment.biomarkerCount} biomarkers
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Biomarkers Tab Component
const BiomarkersTab = ({ analyticsData, onBiomarkerClick, selectedBiomarker }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {Object.values(analyticsData.biomarkerAnalysis)
        .sort((a, b) => b.statistics.avg - a.statistics.avg)
        .map((biomarker) => (
          <BiomarkerCard
            key={biomarker.name}
            biomarker={biomarker}
            onClick={() => onBiomarkerClick(biomarker.name)}
            isSelected={selectedBiomarker === biomarker.name}
          />
        ))}
    </div>
  </div>
);

// Performance Tab Component
const PerformanceTab = ({ analyticsData }) => (
  <div className="space-y-6">
    {/* Top Performers */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Top Performing Biomarkers
        </h4>
        <div className="space-y-3">
          {analyticsData.performanceMetrics.topPerformingBiomarkers.slice(0, 5).map((biomarker, index) => (
            <div key={biomarker.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">
                #{index + 1} {biomarker.name}
              </span>
              <ScoreBadge score={biomarker.statistics.avg} size="small" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Most Consistent Biomarkers
        </h4>
        <div className="space-y-3">
          {analyticsData.performanceMetrics.consistentBiomarkers.slice(0, 5).map((biomarker, index) => (
            <div key={biomarker.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                {biomarker.name}
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                σ²: {biomarker.statistics.variance.toFixed(3)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Condition Analysis */}
    <div className="bg-slate-50 rounded-lg p-6">
      <h4 className="font-semibold text-slate-800 mb-4">Performance by Condition</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(analyticsData.performanceMetrics.conditionAnalysis).map(([condition, data]) => (
          <div key={condition} className="bg-white rounded-lg p-4 border border-slate-200">
            <h5 className="font-medium text-slate-700 mb-2">{condition}</h5>
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {(data.avgScore * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500">
              {data.biomarkerCount} biomarkers
            </div>
            <div className="mt-2 text-xs text-slate-600">
              Top: {data.topBiomarkers[0]?.name || 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Recommendations Tab Component
const RecommendationsTab = ({ analyticsData }) => (
  <div className="space-y-4">
    {analyticsData.recommendations.map((rec, index) => (
      <RecommendationCard key={index} recommendation={rec} />
    ))}
  </div>
);

// Helper Components
const MetricCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    green: 'from-green-50 to-green-100 border-green-200 text-green-600',
    purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
    orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-600'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-lg p-4 border`}>
      <div className="flex items-center gap-3">
        <Icon className="h-8 w-8" />
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm font-medium">{title}</div>
        </div>
      </div>
    </div>
  );
};

const BiomarkerCard = ({ biomarker, onClick, isSelected }) => (
  <div
    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
      isSelected 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-slate-200 bg-white hover:border-slate-300'
    }`}
    onClick={onClick}
  >
    <h5 className="font-medium text-slate-800 mb-2">{biomarker.name}</h5>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Average Score</span>
        <ScoreBadge score={biomarker.statistics.avg} size="small" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Range</span>
        <span className="text-xs text-slate-600">
          {(biomarker.statistics.min * 100).toFixed(0)}% - {(biomarker.statistics.max * 100).toFixed(0)}%
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Treatments</span>
        <span className="text-xs text-slate-600">{biomarker.treatments.length}</span>
      </div>
    </div>
  </div>
);

const RecommendationCard = ({ recommendation }) => {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50'
  };

  const priorityIcons = {
    high: AlertTriangle,
    medium: Info,
    low: CheckCircle
  };

  const Icon = priorityIcons[recommendation.priority];

  return (
    <div className={`p-4 rounded-lg border ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 mt-0.5 text-slate-600" />
        <div className="flex-1">
          <h5 className="font-medium text-slate-800 mb-1">{recommendation.title}</h5>
          <p className="text-sm text-slate-600 mb-2">{recommendation.description}</p>
          {recommendation.biomarkers && (
            <div className="flex flex-wrap gap-1">
              {recommendation.biomarkers.map(biomarker => (
                <span key={biomarker} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded-full">
                  {biomarker}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500 capitalize">
          {recommendation.priority}
        </div>
      </div>
    </div>
  );
};

export default BiomarkerAnalytics;
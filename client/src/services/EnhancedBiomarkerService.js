import React from 'react';

// Enhanced API Service with new scoring algorithm
class EnhancedBiomarkerService {
  constructor(apiBaseUrl = '/api') {
    this.baseUrl = apiBaseUrl;
  }

  // Calculate new score based on level changes
  async calculateBiomarkerLevelChangeScore(biomarkerName, condition) {
    try {
      const response = await fetch(`${this.baseUrl}/biomarker/level-change-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          biomarker_name: biomarkerName,
          condition: condition
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          biomarker: biomarkerName,
          condition: condition,
          levelChangeStats: {
            increase: data.increase_count,
            decrease: data.decrease_count,
            unchanged: data.unchanged_count,
            total: data.total_count
          },
          percentages: {
            increase: (data.increase_count / data.total_count * 100).toFixed(1),
            decrease: (data.decrease_count / data.total_count * 100).toFixed(1),
            unchanged: (data.unchanged_count / data.total_count * 100).toFixed(1)
          },
          score: this.calculateOverallScore(data.increase_count, data.decrease_count, data.unchanged_count),
          reliability: data.total_count >= 10 ? 'high' : data.total_count >= 5 ? 'medium' : 'low'
        };
      }
      
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Error calculating level change score:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Calculate overall score based on level changes
  calculateOverallScore(increase, decrease, unchanged) {
    const total = increase + decrease + unchanged;
    if (total === 0) return 0;
    
    // Weighted scoring: increase = positive, decrease = negative, unchanged = neutral
    const increaseWeight = 1.0;
    const decreaseWeight = -0.5;
    const unchangedWeight = 0.2;
    
    const weightedScore = (
      (increase * increaseWeight) + 
      (decrease * decreaseWeight) + 
      (unchanged * unchangedWeight)
    ) / total;
    
    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, (weightedScore + 0.5) / 1.5));
  }

  // Get detailed biomarker data with enhanced filtering
  async getBiomarkerDetailedData(biomarkerName, condition, filters = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/biomarker/detailed-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          biomarker_name: biomarkerName,
          condition: condition,
          filters: {
            level_change: filters.levelChange || null,
            study_type: filters.studyType || null,
            age_range: filters.ageRange || null,
            sex: filters.sex || null,
            page: filters.page || 1,
            size: filters.size || 50,
            sort_by: filters.sortBy || 'relevance'
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: data.records,
          statistics: data.statistics,
          filters: data.available_filters,
          pagination: data.pagination,
          visualData: this.processVisualizationData(data.records)
        };
      }
      
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Process data for visualization
  processVisualizationData(records) {
    const stats = {
      levelChange: { increase: 0, decrease: 0, unchanged: 0, unknown: 0 },
      studyTypes: {},
      ageDistribution: {},
      sexDistribution: {},
      skinChangeTypes: {},
      severityLevels: {}
    };

    records.forEach(record => {
      // Level Change
      const levelChange = record.Biomarker_Level_Change;
      if (levelChange === 'increase') stats.levelChange.increase++;
      else if (levelChange === 'decrease') stats.levelChange.decrease++;
      else if (levelChange === 'unchanged') stats.levelChange.unchanged++;
      else stats.levelChange.unknown++;

      // Study Types
      const studyType = record.Type_of_Study || 'Unknown';
      stats.studyTypes[studyType] = (stats.studyTypes[studyType] || 0) + 1;

      // Age Distribution
      const age = record.Age;
      if (age && age !== 'nan') {
        const ageGroup = this.getAgeGroup(age);
        stats.ageDistribution[ageGroup] = (stats.ageDistribution[ageGroup] || 0) + 1;
      }

      // Sex Distribution
      const sex = record.Sex;
      if (sex && sex !== 'nan') {
        stats.sexDistribution[sex] = (stats.sexDistribution[sex] || 0) + 1;
      }

      // Skin Change Types
      const skinChange = record.Skin_Change_Type;
      if (skinChange && skinChange !== 'nan') {
        stats.skinChangeTypes[skinChange] = (stats.skinChangeTypes[skinChange] || 0) + 1;
      }

      // Severity Levels
      const severity = record.Skin_Change_Severity;
      if (severity && severity !== 'nan') {
        const severityLabel = this.getSeverityLabel(severity);
        stats.severityLevels[severityLabel] = (stats.severityLevels[severityLabel] || 0) + 1;
      }
    });

    return stats;
  }

  getAgeGroup(age) {
    const ageNum = parseInt(age);
    if (ageNum < 20) return '< 20';
    if (ageNum < 30) return '20-29';
    if (ageNum < 40) return '30-39';
    if (ageNum < 50) return '40-49';
    if (ageNum < 60) return '50-59';
    return '60+';
  }

  getSeverityLabel(severity) {
    const sev = parseInt(severity);
    if (sev === 0) return 'None';
    if (sev === 1) return 'Mild';
    if (sev === 2) return 'Moderate';
    if (sev === 3) return 'Severe';
    return 'Unknown';
  }

  // Fixed OpenAI insights integration
  async generateInsights(queryData) {
    try {
      const response = await fetch(`${this.baseUrl}/insights/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(queryData)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating insights:', error);
      return { success: false, error: 'Failed to generate insights' };
    }
  }

  // Export data functionality
  async exportBiomarkerData(biomarkerName, condition, format = 'csv') {
    try {
      const response = await fetch(`${this.baseUrl}/biomarker/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          biomarker_name: biomarkerName,
          condition: condition,
          format: format
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${biomarkerName}_${condition}_data.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true };
      }
      
      return { success: false, error: 'Export failed' };
    } catch (error) {
      console.error('Error exporting data:', error);
      return { success: false, error: 'Export error' };
    }
  }
}

// Mock data for development
const mockApiService = {
  async calculateBiomarkerLevelChangeScore(biomarkerName, condition) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate realistic mock data based on the biomarker
    const mockData = {
      'Melanin': {
        'Aging': { increase: 45, decrease: 30, unchanged: 25, total: 100 },
        'Pigmentation': { increase: 70, decrease: 20, unchanged: 10, total: 100 },
        'Wrinkles': { increase: 35, decrease: 40, unchanged: 25, total: 100 }
      },
      'IL-6': {
        'Aging': { increase: 60, decrease: 25, unchanged: 15, total: 100 },
        'Pigmentation': { increase: 40, decrease: 35, unchanged: 25, total: 100 },
        'Wrinkles': { increase: 55, decrease: 30, unchanged: 15, total: 100 }
      },
      'MCP-1': {
        'Aging': { increase: 50, decrease: 30, unchanged: 20, total: 100 },
        'Pigmentation': { increase: 45, decrease: 35, unchanged: 20, total: 100 },
        'Wrinkles': { increase: 48, decrease: 32, unchanged: 20, total: 100 }
      }
    };

    const data = mockData[biomarkerName]?.[condition] || { increase: 33, decrease: 33, unchanged: 34, total: 100 };
    
    return {
      success: true,
      biomarker: biomarkerName,
      condition: condition,
      levelChangeStats: data,
      percentages: {
        increase: (data.increase / data.total * 100).toFixed(1),
        decrease: (data.decrease / data.total * 100).toFixed(1),
        unchanged: (data.unchanged / data.total * 100).toFixed(1)
      },
      score: new EnhancedBiomarkerService().calculateOverallScore(data.increase, data.decrease, data.unchanged),
      reliability: data.total >= 50 ? 'high' : data.total >= 20 ? 'medium' : 'low'
    };
  },

  async getBiomarkerDetailedData(biomarkerName, condition, filters = {}) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock records based on the provided data structure
    const mockRecords = Array.from({ length: 50 }, (_, i) => ({
      Document_id: `mock_${i}`,
      Subject_ID: `SUB${String(i + 1).padStart(3, '0')}`,
      PDF_name: `study_${biomarkerName.toLowerCase()}_${i + 1}.pdf`,
      Condition: condition,
      Biomarker_Name: biomarkerName,
      Biomarker_Presence: "1",
      Biomarker_Level_Change: ['increase', 'decrease', 'unchanged'][i % 3],
      Skin_Change_Type: condition.toLowerCase(),
      Skin_Change_Severity: String(Math.floor(Math.random() * 3) + 1),
      Skin_Change_Observed: "1",
      Age: Math.floor(Math.random() * 60) + 20,
      Sex: ['Male', 'Female'][i % 2],
      Treatment_Status: "Yes",
      Treatment_Name: `Treatment_${String.fromCharCode(65 + (i % 5))}`,
      Type_of_Study: ['Clinical Trial', 'Animal Study', 'In Vitro', 'Human Study'][i % 4],
      Key_Outcome: `Significant ${['improvement', 'change', 'response'][i % 3]} observed in ${biomarkerName} levels with treatment application.`
    }));

    return {
      success: true,
      data: mockRecords,
      statistics: {
        total_records: mockRecords.length,
        unique_treatments: 5,
        study_types: 4
      },
      filters: {
        level_change: ['increase', 'decrease', 'unchanged'],
        study_types: ['Clinical Trial', 'Animal Study', 'In Vitro', 'Human Study'],
        age_ranges: ['20-30', '31-40', '41-50', '51-60', '60+']
      },
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_records: mockRecords.length
      },
      visualData: new EnhancedBiomarkerService().processVisualizationData(mockRecords)
    };
  },

  async generateInsights(queryData) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      success: true,
      insights: `# AI Analysis Results

## Executive Summary
Based on your query about the biomarker comparison, here are the key findings:

**Key Insights:**
1. **Treatment Efficacy**: The comparison shows significant variations in biomarker response patterns across different treatments.

2. **Biomarker Performance**: Level change analysis reveals that most biomarkers show positive responses, with varying degrees of effectiveness.

3. **Clinical Implications**: The data suggests that treatment selection should be based on specific biomarker profiles and patient characteristics.

## Detailed Analysis

### Treatment Performance
- **Primary Treatment**: Shows 65% positive response rate
- **Secondary Treatment**: Demonstrates 58% improvement in target biomarkers
- **Combination Therapy**: Achieves optimal results with 72% success rate

### Recommendations
1. Consider combination approaches for enhanced efficacy
2. Monitor biomarker response patterns closely
3. Personalize treatment selection based on individual biomarker profiles

*Analysis completed with high confidence based on comprehensive data review.*`,
      metadata: {
        processing_time: 2.1,
        confidence_score: 0.87,
        data_points: 150
      }
    };
  }
};

export { EnhancedBiomarkerService, mockApiService };
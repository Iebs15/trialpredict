class EnhancedApiService {
  constructor() {
    this.baseURL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.requestQueue = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // ==================== CACHE MANAGEMENT ====================
  
  getCacheKey(endpoint, params) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify(Array.from(this.cache.values())).length
    };
  }

  // ==================== GENERIC API METHODS ====================

  async apiCall(endpoint, options = {}) {
    const requestKey = `${endpoint}_${JSON.stringify(options)}`;
    
    // Prevent duplicate requests
    if (this.requestQueue.has(requestKey)) {
      return await this.requestQueue.get(requestKey);
    }

    const requestPromise = this._makeRequest(endpoint, options);
    this.requestQueue.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  async _makeRequest(endpoint, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error;
        console.warn(`API call attempt ${attempt} failed for ${endpoint}:`, error.message);
        
        if (attempt < this.retryAttempts) {
          await this._delay(this.retryDelay * attempt);
        }
      }
    }
    
    throw lastError;
  }

  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== CORE API METHODS ====================

  async healthCheck() {
    try {
      const result = await this.apiCall('/api/health');
      return result;
    } catch (error) {
      return {
        status: 'error',
        elasticsearch_connected: false,
        level_change_scoring: 'unavailable',
        error: error.message,
        fallback: true
      };
    }
  }

  async getBiomarkers() {
    const cacheKey = this.getCacheKey('biomarkers', {});
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const result = await this.apiCall('/api/biomarkers');
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to fetch biomarkers:', error);
      // Enhanced fallback biomarkers
      const fallbackResult = {
        success: true,
        biomarkers: [
          'IL-6', 'MCP-1', 'Angiogenin', 'IL-8', 'Osteoprotegerin', 'HGF', 
          'TIMP-1', 'IGFBP-2', 'TIMP-2', 'TNF-α', 'Collagen I', 'Elastin', 
          'Hyaluronic Acid', 'Melanin', 'Tyrosinase', 'Filaggrin', 'VEGF',
          'TGF-β', 'MMP-1', 'MMP-3', 'Ceramides', 'Squalene', 'SOD', 'Catalase',
          'PDGF', 'IGF-1', 'CTGF', 'Fibronectin', 'Laminin', 'Vitronectin'
        ],
        count: 30,
        fallback: true,
        error: error.message
      };
      this.setCachedData(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  async getConditions() {
    const cacheKey = this.getCacheKey('conditions', {});
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const result = await this.apiCall('/api/conditions');
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Failed to fetch conditions:', error);
      // Enhanced fallback conditions
      const fallbackResult = {
        success: true,
        conditions: [
          'Aging', 'Pigmentation', 'Wrinkles', 'Acne', 'Dryness', 
          'Sensitivity', 'Inflammation', 'Photo-aging', 'Elasticity Loss'
        ],
        count: 9,
        fallback: true,
        error: error.message
      };
      this.setCachedData(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }
// Add this method to your EnhancedApiService class
async getBiomarkerData(biomarkerName, condition, page = 1, size = 20) {
  const cacheKey = this.getCacheKey('biomarker_data', { biomarkerName, condition, page, size });
  const cached = this.getCachedData(cacheKey);
  
  if (cached) {
    return { ...cached, cached: true };
  }

  try {
    const result = await this.apiCall('/api/biomarker/data', {
      method: 'POST',
      body: JSON.stringify({
        biomarker_name: biomarkerName,
        condition: condition,
        page: page,
        size: size
      })
    });
    
    this.setCachedData(cacheKey, result);
    return result;
  } catch (error) {
    console.error(`Failed to fetch biomarker data for ${biomarkerName}:`, error);
    
    // Generate mock data as fallback
    const mockData = this.generateMockDetailedBiomarkerData(biomarkerName, condition, page, size);
    const fallbackResult = {
      success: true,
      biomarker: biomarkerName,
      condition: condition,
      data: mockData.data,
      total_count: mockData.total_count,
      page: page,
      size: size,
      total_pages: mockData.total_pages,
      fallback: true,
      error: error.message
    };
    
    this.setCachedData(cacheKey, fallbackResult);
    return fallbackResult;
  }
}

// Also add this helper method for generating detailed mock data
generateMockDetailedBiomarkerData(biomarkerName, condition, page = 1, size = 20) {
  const totalItems = Math.floor(Math.random() * 150) + 50; // 50-200 total items
  const startIndex = (page - 1) * size;
  const endIndex = Math.min(startIndex + size, totalItems);
  
  const data = [];
  
  for (let i = startIndex; i < endIndex; i++) {
    const rand = Math.random();
    let levelChange = 'unknown';
    
    // Use realistic probabilities based on biomarker
    if (biomarkerName.toLowerCase().includes('il-6')) {
      if (rand < 0.65) levelChange = 'increase';
      else if (rand < 0.85) levelChange = 'decrease';
      else levelChange = 'unchanged';
    } else if (biomarkerName.toLowerCase().includes('melanin')) {
      if (rand < 0.70) levelChange = 'increase';
      else if (rand < 0.85) levelChange = 'decrease';
      else levelChange = 'unchanged';
    } else if (biomarkerName.toLowerCase().includes('collagen')) {
      if (rand < 0.35) levelChange = 'increase';
      else if (rand < 0.80) levelChange = 'decrease';
      else levelChange = 'unchanged';
    } else {
      if (rand < 0.45) levelChange = 'increase';
      else if (rand < 0.80) levelChange = 'decrease';
      else levelChange = 'unchanged';
    }
    
    const studyTypes = ['Clinical trial', 'In vitro study', 'Animal study', 'Observational study'];
    const ethnicities = ['Caucasian', 'Asian', 'African American', 'Hispanic', 'Mixed'];
    const treatments = ['Treatment A', 'Treatment B', 'Treatment C', 'Control', 'Placebo'];
    
    data.push({
      'Subject ID': `S${String(i + 1).padStart(3, '0')}`,
      'PDF_name': `${condition.toLowerCase()}_study_${String(Math.floor(i/5) + 1).padStart(3, '0')}.pdf`,
      'Biomarker_Level_Change': levelChange,
      'Treatment_Name': treatments[i % treatments.length],
      'Skin_Change_Type': condition.toLowerCase(),
      'Type of Study': studyTypes[Math.floor(Math.random() * studyTypes.length)],
      'Age': Math.floor(Math.random() * 60) + 20,
      'Sex': Math.random() > 0.5 ? 'Female' : 'Male',
      'Ethnicity': ethnicities[Math.floor(Math.random() * ethnicities.length)],
      'Treatment_Status': Math.random() > 0.8 ? 'Ongoing' : 'Completed',
      'Key_Outcome': `Study ${i + 1}: ${levelChange} in ${biomarkerName} levels observed after ${treatments[i % treatments.length]} in ${condition} condition. ${this.generateKeyOutcome(levelChange, biomarkerName, condition)}`
    });
  }
  
  return {
    data: data,
    total_count: totalItems,
    total_pages: Math.ceil(totalItems / size)
  };
}
  // ==================== LEVEL CHANGE SCORING METHODS ====================

  async getBiomarkerLevelChangeData(biomarkerName, condition) {
    const cacheKey = this.getCacheKey('levelchange', { biomarkerName, condition });
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const result = await this.apiCall('/api/biomarker/level-change-data', {
        method: 'POST',
        body: JSON.stringify({
          biomarker_name: biomarkerName,
          condition: condition
        })
      });
      
      // Calculate level change statistics if not provided
      if (result.success && result.data) {
        if (!result.stats) {
          result.stats = this.calculateLevelChangeStats(result.data);
        }
        if (!result.score) {
          result.score = this.calculateLevelChangeScore(result.stats);
        }
      }
      
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to fetch level change data for ${biomarkerName}:`, error);
      // Generate enhanced mock data
      const mockData = this.generateMockLevelChangeData(biomarkerName, condition);
      const mockResult = {
        success: true,
        data: mockData,
        stats: this.calculateLevelChangeStats(mockData),
        fallback: true,
        error: error.message
      };
      mockResult.score = this.calculateLevelChangeScore(mockResult.stats);
      this.setCachedData(cacheKey, mockResult);
      return mockResult;
    }
  }

  async getBiomarkerLevelChangeScore(biomarkerName, condition) {
    const cacheKey = this.getCacheKey('score', { biomarkerName, condition });
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const result = await this.apiCall('/api/biomarker/level-change-score', {
        method: 'POST',
        body: JSON.stringify({
          biomarker_name: biomarkerName,
          condition: condition
        })
      });
      
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error(`Failed to fetch score for ${biomarkerName}:`, error);
      // Generate mock score
      const mockData = this.generateMockLevelChangeData(biomarkerName, condition);
      const stats = this.calculateLevelChangeStats(mockData);
      const score = this.calculateLevelChangeScore(stats);
      
      const mockResult = {
        success: true,
        biomarker: biomarkerName,
        condition: condition,
        statistics: stats,
        score: score,
        scoring_method: 'level_change_v3',
        fallback: true,
        error: error.message
      };
      
      this.setCachedData(cacheKey, mockResult);
      return mockResult;
    }
  }

  // ==================== STATISTICAL CALCULATIONS ====================

  calculateLevelChangeStats(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        total: 0,
        increase: 0,
        decrease: 0,
        unchanged: 0,
        unknown: 0,
        percentages: { increase: 0, decrease: 0, unchanged: 0 },
        reliability: 'low',
        dominantTrend: 'unknown',
        dataQuality: 0
      };
    }

    const levelChanges = data.map(item => {
      const change = item.Biomarker_Level_Change?.toLowerCase().trim();
      if (change === 'increase') return 'increase';
      if (change === 'decrease') return 'decrease';
      if (change === 'unchanged' || change === 'no change' || change === 'stable') return 'unchanged';
      return 'unknown';
    });

    const total = levelChanges.length;
    const increase = levelChanges.filter(c => c === 'increase').length;
    const decrease = levelChanges.filter(c => c === 'decrease').length;
    const unchanged = levelChanges.filter(c => c === 'unchanged').length;
    const unknown = levelChanges.filter(c => c === 'unknown').length;

    const validData = total - unknown;
    const increasePercent = validData > 0 ? (increase / validData) * 100 : 0;
    const decreasePercent = validData > 0 ? (decrease / validData) * 100 : 0;
    const unchangedPercent = validData > 0 ? (unchanged / validData) * 100 : 0;

    // Calculate reliability based on data quality
    let reliability = 'low';
    if (validData >= 20 && (unknown / total) < 0.2) reliability = 'high';
    else if (validData >= 10 && (unknown / total) < 0.3) reliability = 'medium';

    // Determine dominant trend
    let dominantTrend = 'stable';
    if (increasePercent > decreasePercent && increasePercent > unchangedPercent) {
      dominantTrend = 'increase';
    } else if (decreasePercent > increasePercent && decreasePercent > unchangedPercent) {
      dominantTrend = 'decrease';
    }

    return {
      total,
      validData,
      increase,
      decrease,
      unchanged,
      unknown,
      percentages: {
        increase: increasePercent,
        decrease: decreasePercent,
        unchanged: unchangedPercent
      },
      reliability,
      dominantTrend,
      dataQuality: validData / total
    };
  }

  calculateLevelChangeScore(stats) {
    if (!stats || stats.validData === 0) return 0;

    const { percentages, reliability, dataQuality } = stats;
    
    // Base score calculation (0-1 scale)
    // Weighted towards beneficial changes (increase or stable)
    let baseScore = (
      percentages.increase * 0.6 +        // Positive changes weighted highest
      percentages.unchanged * 0.3 +       // Stable is good
      (100 - percentages.decrease) * 0.1  // Penalize decreases
    ) / 100;

    // Apply reliability multiplier
    let reliabilityMultiplier = 1.0;
    switch (reliability) {
      case 'high': reliabilityMultiplier = 1.0; break;
      case 'medium': reliabilityMultiplier = 0.8; break;
      case 'low': reliabilityMultiplier = 0.6; break;
    }

    // Apply data quality multiplier
    const dataQualityMultiplier = Math.min(dataQuality * 1.2, 1.0);

    const finalScore = baseScore * reliabilityMultiplier * dataQualityMultiplier;
    return Math.min(Math.max(finalScore, 0), 1); // Clamp between 0 and 1
  }

  // ==================== MOCK DATA GENERATION ====================

  generateMockLevelChangeData(biomarkerName, condition) {
    const dataPoints = Math.floor(Math.random() * 50) + 15; // 15-65 data points
    const data = [];
    
    // Define realistic probabilities based on biomarker and condition combinations
    const combinations = {
      // Aging-related biomarkers
      'IL-6_Aging': { increase: 0.65, decrease: 0.20, unchanged: 0.15 },
      'TNF-α_Aging': { increase: 0.60, decrease: 0.25, unchanged: 0.15 },
      'MCP-1_Aging': { increase: 0.55, decrease: 0.25, unchanged: 0.20 },
      'Collagen I_Aging': { increase: 0.35, decrease: 0.45, unchanged: 0.20 },
      'Elastin_Aging': { increase: 0.30, decrease: 0.50, unchanged: 0.20 },
      'Hyaluronic Acid_Aging': { increase: 0.40, decrease: 0.35, unchanged: 0.25 },
      
      // Pigmentation-related biomarkers
      'Melanin_Pigmentation': { increase: 0.70, decrease: 0.15, unchanged: 0.15 },
      'Tyrosinase_Pigmentation': { increase: 0.65, decrease: 0.20, unchanged: 0.15 },
      
      // Wrinkle-related biomarkers
      'Collagen I_Wrinkles': { increase: 0.40, decrease: 0.40, unchanged: 0.20 },
      'Elastin_Wrinkles': { increase: 0.35, decrease: 0.45, unchanged: 0.20 },
      'MMP-1_Wrinkles': { increase: 0.55, decrease: 0.30, unchanged: 0.15 },
      
      // Inflammation-related
      'IL-8_Aging': { increase: 0.58, decrease: 0.22, unchanged: 0.20 },
      'VEGF_Aging': { increase: 0.52, decrease: 0.28, unchanged: 0.20 },
      
      // Antioxidant-related
      'SOD_Aging': { increase: 0.45, decrease: 0.35, unchanged: 0.20 },
      'Catalase_Aging': { increase: 0.42, decrease: 0.38, unchanged: 0.20 }
    };
    
    const key = `${biomarkerName}_${condition}`;
    const probs = combinations[key] || { increase: 0.45, decrease: 0.35, unchanged: 0.20 };
    
    // Generate study types based on biomarker importance
    const getStudyTypes = () => {
      const clinicalTrialProb = biomarkerName.includes('IL-') || biomarkerName.includes('TNF') ? 0.6 : 0.4;
      return {
        'Clinical trial': clinicalTrialProb,
        'In vitro study': 0.3,
        'Animal study': 0.2,
        'Observational study': 0.1
      };
    };

    const studyTypes = getStudyTypes();
    const studyTypeNames = Object.keys(studyTypes);
    
    for (let i = 0; i < dataPoints; i++) {
      const rand = Math.random();
      let levelChange = 'unknown';
      
      // Determine level change based on probabilities
      if (rand < probs.increase) {
        levelChange = 'increase';
      } else if (rand < probs.increase + probs.decrease) {
        levelChange = 'decrease';
      } else if (rand < probs.increase + probs.decrease + probs.unchanged) {
        levelChange = 'unchanged';
      }
      
      // Select study type
      let studyType = 'In vitro study';
      const studyRand = Math.random();
      let cumProb = 0;
      for (const [type, prob] of Object.entries(studyTypes)) {
        cumProb += prob;
        if (studyRand < cumProb) {
          studyType = type;
          break;
        }
      }
      
      // Generate demographic data
      const ethnicities = ['Caucasian', 'Asian', 'African American', 'Hispanic', 'Mixed'];
      const treatmentNames = ['Treatment A', 'Treatment B', 'Treatment C', 'Control', 'Placebo', 'Standard Care'];
      
      data.push({
        Subject_ID: `S${String(i + 1).padStart(3, '0')}`,
        Biomarker_Level_Change: levelChange,
        Treatment_Name: treatmentNames[i % treatmentNames.length],
        Type_of_Study: studyType,
        Age: Math.floor(Math.random() * 60) + 20, // 20-80 years
        Sex: Math.random() > 0.5 ? 'Female' : 'Male',
        Ethnicity: ethnicities[Math.floor(Math.random() * ethnicities.length)],
        Environmental_Exposure: Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low',
        Key_Outcome: this.generateKeyOutcome(levelChange, biomarkerName, condition),
        Measurement_Timepoint: `Day ${Math.floor(Math.random() * 90) + 1}`,
        Study_Group: Math.random() > 0.5 ? 'Treatment' : 'Control'
      });
    }
    
    return data;
  }

  generateKeyOutcome(levelChange, biomarkerName, condition) {
    const outcomes = {
      increase: [
        `Significant increase in ${biomarkerName} levels observed after treatment, indicating enhanced ${condition.toLowerCase()}-related processes.`,
        `${biomarkerName} showed marked elevation following intervention, suggesting improved cellular response.`,
        `Notable upregulation of ${biomarkerName} detected, correlating with positive treatment outcomes.`
      ],
      decrease: [
        `Reduction in ${biomarkerName} levels noted, potentially indicating improved ${condition.toLowerCase()} management.`,
        `${biomarkerName} concentrations decreased significantly post-treatment, suggesting beneficial modulation.`,
        `Downregulation of ${biomarkerName} observed, consistent with therapeutic intervention effects.`
      ],
      unchanged: [
        `${biomarkerName} levels remained stable throughout the study period, indicating baseline maintenance.`,
        `No significant change in ${biomarkerName} concentrations detected, suggesting stable condition.`,
        `${biomarkerName} showed consistent levels across measurement timepoints.`
      ],
      unknown: [
        `${biomarkerName} measurements were inconclusive due to study limitations.`,
        `Data quality for ${biomarkerName} was insufficient for reliable interpretation.`,
        `${biomarkerName} analysis pending further validation.`
      ]
    };
    
    const relevantOutcomes = outcomes[levelChange] || outcomes.unknown;
    return relevantOutcomes[Math.floor(Math.random() * relevantOutcomes.length)];
  }

  // ==================== BIOMARKER SEARCH & VALIDATION ====================

  async getBiomarkerSuggestions(query, limit = 20) {
    const cacheKey = this.getCacheKey('suggestions', { query, limit });
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const response = await this.apiCall(`/api/biomarkers/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`);
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch biomarker suggestions:', error);
      // Fallback with local filtering
      const biomarkersResponse = await this.getBiomarkers();
      const biomarkers = biomarkersResponse.biomarkers || [];
      
      const filtered = biomarkers
        .filter(b => b.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit);
      
      const fallbackResult = {
        success: true,
        suggestions: filtered,
        total_matches: filtered.length,
        query: query,
        fallback: true,
        error: error.message
      };
      
      this.setCachedData(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  async validateBiomarker(biomarkerName) {
    const cacheKey = this.getCacheKey('validate', { biomarkerName });
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const response = await this.apiCall('/api/biomarkers/validate', {
        method: 'POST',
        body: JSON.stringify({ biomarker_name: biomarkerName })
      });
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to validate biomarker:', error);
      // Basic validation fallback
      const biomarkersResponse = await this.getBiomarkers();
      const biomarkers = biomarkersResponse.biomarkers || [];
      
      const valid = biomarkers.some(b => 
        b.toLowerCase() === biomarkerName.toLowerCase()
      );
      
      const fallbackResult = {
        success: true,
        original: biomarkerName,
        normalized: biomarkerName.trim(),
        valid: valid,
        suggestion: valid ? biomarkerName : biomarkers.find(b => 
          b.toLowerCase().includes(biomarkerName.toLowerCase().substring(0, 3))
        ),
        fallback: true,
        error: error.message
      };
      
      this.setCachedData(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  // ==================== TREATMENT COMPARISON ====================

  async compareTreatments(treatments) {
    const cacheKey = this.getCacheKey('compare', { treatments });
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const response = await this.apiCall('/api/treatments/compare-level-change', {
        method: 'POST',
        body: JSON.stringify({ treatments })
      });
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to compare treatments:', error);
      // Local comparison fallback
      const comparison = await this._performLocalComparison(treatments);
      const fallbackResult = {
        success: true,
        comparison,
        timestamp: new Date().toISOString(),
        scoring_method: 'level_change_v3',
        fallback: true,
        error: error.message
      };
      this.setCachedData(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  async _performLocalComparison(treatments) {
    const comparison = {
      treatments: [],
      summary: {
        totalBiomarkers: 0,
        avgLevelChangeScore: 0,
        bestPerformingTreatment: null,
        commonBiomarkers: []
      }
    };

    let totalScore = 0;
    let treatmentCount = 0;
    const allBiomarkers = new Set();
    const biomarkerCounts = new Map();

    for (const treatment of treatments) {
      const treatmentAnalysis = {
        name: treatment.name,
        condition: treatment.condition,
        biomarkers: [],
        overallScore: 0,
        levelChangeDistribution: { increase: 0, decrease: 0, unchanged: 0 }
      };

      let treatmentScore = 0;
      let biomarkerCount = 0;
      const distribution = { increase: 0, decrease: 0, unchanged: 0 };

      for (const biomarker of treatment.biomarkers) {
        if (biomarker.name.trim()) {
          allBiomarkers.add(biomarker.name);
          biomarkerCounts.set(biomarker.name, (biomarkerCounts.get(biomarker.name) || 0) + 1);

          try {
            const levelChangeData = await this.getBiomarkerLevelChangeData(biomarker.name, treatment.condition);
            
            if (levelChangeData.success && levelChangeData.stats) {
              const biomarkerAnalysis = {
                name: biomarker.name,
                stats: levelChangeData.stats,
                score: levelChangeData.score || 0,
                reliability: levelChangeData.stats.reliability
              };

              treatmentAnalysis.biomarkers.push(biomarkerAnalysis);
              treatmentScore += biomarkerAnalysis.score;
              biomarkerCount++;

              // Accumulate distribution
              distribution.increase += levelChangeData.stats.percentages.increase;
              distribution.decrease += levelChangeData.stats.percentages.decrease;
              distribution.unchanged += levelChangeData.stats.percentages.unchanged;
            }
          } catch (error) {
            console.error(`Error analyzing ${biomarker.name}:`, error);
          }
        }
      }

      if (biomarkerCount > 0) {
        treatmentAnalysis.overallScore = treatmentScore / biomarkerCount;
        treatmentAnalysis.levelChangeDistribution = {
          increase: distribution.increase / biomarkerCount,
          decrease: distribution.decrease / biomarkerCount,
          unchanged: distribution.unchanged / biomarkerCount
        };
      }

      comparison.treatments.push(treatmentAnalysis);
      totalScore += treatmentAnalysis.overallScore;
      treatmentCount++;
    }

    // Calculate summary statistics
    comparison.summary.totalBiomarkers = allBiomarkers.size;
    comparison.summary.avgLevelChangeScore = treatmentCount > 0 ? totalScore / treatmentCount : 0;
    
    // Find best performing treatment
    if (comparison.treatments.length > 0) {
      comparison.summary.bestPerformingTreatment = comparison.treatments.reduce((best, current) => 
        current.overallScore > best.overallScore ? current : best
      );
    }

    // Find common biomarkers (present in multiple treatments)
    comparison.summary.commonBiomarkers = Array.from(biomarkerCounts.entries())
      .filter(([biomarker, count]) => count > 1)
      .map(([biomarker, count]) => ({ biomarker, count }))
      .sort((a, b) => b.count - a.count);

    return comparison;
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  async getDashboardSummary() {
    const cacheKey = this.getCacheKey('dashboard', {});
    const cached = this.getCachedData(cacheKey);
    
    if (cached) {
      return { ...cached, cached: true };
    }

    try {
      const response = await this.apiCall('/api/dashboard/level-change-summary');
      this.setCachedData(cacheKey, response);
      return response;
    } catch (error) {
      console.error('Failed to fetch dashboard summary:', error);
      // Enhanced fallback dashboard
      const fallbackResult = {
        success: true,
        dashboard: {
          total_conditions: 9,
          total_biomarkers: 30,
          level_change_distribution: {
            increase: 1250,
            decrease: 890,
            unchanged: 560,
            unknown: 300
          },
          study_types: {
            'Clinical trial': 1200,
            'In vitro study': 800,
            'Animal study': 600,
            'Observational study': 400
          },
          conditions: ['Aging', 'Pigmentation', 'Wrinkles', 'Acne', 'Dryness', 'Sensitivity', 'Inflammation', 'Photo-aging', 'Elasticity Loss'],
          data_quality: 'medium',
          scoring_version: '3.0'
        },
        timestamp: new Date().toISOString(),
        scoring_method: 'level_change_v3',
        fallback: true,
        error: error.message
      };
      this.setCachedData(cacheKey, fallbackResult);
      return fallbackResult;
    }
  }

  // ==================== UTILITY METHODS ====================

  formatScore(score) {
    if (typeof score !== 'number' || isNaN(score)) return '0.0';
    return (score * 100).toFixed(1);
  }

  getScoreCategory(score) {
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'moderate';
    if (score >= 0.2) return 'poor';
    return 'very-poor';
  }

  getReliabilityColor(reliability) {
    switch (reliability) {
      case 'high': return 'green';
      case 'medium': return 'yellow';
      case 'low': return 'red';
      default: return 'gray';
    }
  }

  // ==================== ERROR HANDLING ====================

  handleApiError(error, context = 'Unknown') {
    const errorInfo = {
      message: error.message,
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };
    
    console.error('API Service Error:', errorInfo);
    return errorInfo;
  }
}

// Export singleton instance
const apiService = new EnhancedApiService();

// Additional utility functions
export const BiomarkerUtils = {
  normalizeBiomarkerName: (name) => {
    if (!name) return '';
    return name.trim().replace(/\s+/g, ' ');
  },
  
  validateBiomarkerFormat: (name) => {
    if (!name || typeof name !== 'string') return false;
    return name.trim().length >= 2 && name.trim().length <= 50;
  },
  
  getBiomarkerCategory: (name) => {
    const categories = {
      'Inflammatory': ['IL-6', 'TNF-α', 'IL-8', 'MCP-1', 'IL-1β'],
      'Structural': ['Collagen I', 'Elastin', 'Hyaluronic Acid', 'Fibronectin', 'Laminin'],
      'Enzymatic': ['MMP-1', 'MMP-3', 'TIMP-1', 'TIMP-2', 'Tyrosinase'],
      'Growth Factors': ['VEGF', 'TGF-β', 'PDGF', 'IGF-1', 'HGF'],
      'Antioxidant': ['SOD', 'Catalase', 'Glutathione', 'Vitamin C', 'Vitamin E'],
      'Pigmentation': ['Melanin', 'Tyrosinase', 'MITF', 'TRP-1', 'TRP-2']
    };
    
    for (const [category, biomarkers] of Object.entries(categories)) {
      if (biomarkers.some(b => name.toLowerCase().includes(b.toLowerCase()))) {
        return category;
      }
    }
    return 'Other';
  },
  
  getExpectedTrend: (biomarkerName, condition) => {
    const expectedTrends = {
      'IL-6_Aging': 'increase',
      'Collagen I_Aging': 'decrease',
      'Melanin_Pigmentation': 'increase',
      'Elastin_Wrinkles': 'decrease',
      'MMP-1_Aging': 'increase',
      'Hyaluronic Acid_Aging': 'decrease'
    };
    
    const key = `${biomarkerName}_${condition}`;
    return expectedTrends[key] || 'unknown';
  }

  
};

export const LevelChangeUtils = {
  calculateTrendSignificance: (stats) => {
    if (!stats || !stats.percentages) return 'none';
    
    const { increase, decrease, unchanged } = stats.percentages;
    const maxPercentage = Math.max(increase, decrease, unchanged);
    
    if (maxPercentage >= 70) return 'strong';
    if (maxPercentage >= 50) return 'moderate';
    if (maxPercentage >= 35) return 'weak';
    return 'none';
  },
  
  getConfidenceLevel: (stats) => {
    if (!stats) return 0;
    
    let confidence = 0;
    
    // Data quality factor
    if (stats.validData >= 20) confidence += 0.4;
    else if (stats.validData >= 10) confidence += 0.2;
    
    // Reliability factor
    if (stats.reliability === 'high') confidence += 0.3;
    else if (stats.reliability === 'medium') confidence += 0.2;
    else confidence += 0.1;
    
    // Data completeness factor
    if (stats.dataQuality >= 0.8) confidence += 0.3;
    else if (stats.dataQuality >= 0.6) confidence += 0.2;
    else confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  },
  
  interpretScore: (score) => {
    if (score >= 0.8) return {
      category: 'excellent',
      description: 'Highly beneficial biomarker profile',
      color: 'green',
      recommendation: 'Strong candidate for treatment focus'
    };
    if (score >= 0.6) return {
      category: 'good',
      description: 'Favorable biomarker response',
      color: 'blue',
      recommendation: 'Good therapeutic target'
    };
    if (score >= 0.4) return {
      category: 'moderate',
      description: 'Mixed biomarker response',
      color: 'yellow',
      recommendation: 'Monitor and optimize'
    };
    if (score >= 0.2) return {
      category: 'poor',
      description: 'Limited beneficial response',
      color: 'orange',
      recommendation: 'Consider alternative approaches'
    };
    return {
      category: 'very-poor',
      description: 'Unfavorable biomarker profile',
      color: 'red',
      recommendation: 'Avoid or modify treatment'
    };
  }
};

export const ComparisonUtils = {
  calculateStatisticalSignificance: (treatment1Stats, treatment2Stats) => {
    // Simplified chi-square test for level change distributions
    const observed1 = [treatment1Stats.increase, treatment1Stats.decrease, treatment1Stats.unchanged];
    const observed2 = [treatment2Stats.increase, treatment2Stats.decrease, treatment2Stats.unchanged];
    
    const total1 = observed1.reduce((sum, val) => sum + val, 0);
    const total2 = observed2.reduce((sum, val) => sum + val, 0);
    
    if (total1 === 0 || total2 === 0) return { significant: false, pValue: 1.0 };
    
    let chiSquare = 0;
    for (let i = 0; i < 3; i++) {
      const expected1 = (observed1[i] + observed2[i]) * total1 / (total1 + total2);
      const expected2 = (observed1[i] + observed2[i]) * total2 / (total1 + total2);
      
      if (expected1 > 0) chiSquare += Math.pow(observed1[i] - expected1, 2) / expected1;
      if (expected2 > 0) chiSquare += Math.pow(observed2[i] - expected2, 2) / expected2;
    }
    
    // Simplified p-value estimation (for 2 degrees of freedom)
    const pValue = chiSquare > 5.99 ? 0.05 : chiSquare > 9.21 ? 0.01 : 1.0;
    
    return {
      significant: pValue <= 0.05,
      pValue,
      chiSquare,
      interpretation: pValue <= 0.01 ? 'highly significant' : 
                     pValue <= 0.05 ? 'significant' : 'not significant'
    };
  },
  
  findOptimalBiomarkerCombination: (treatmentAnalysis) => {
    if (!treatmentAnalysis.biomarkers || treatmentAnalysis.biomarkers.length === 0) {
      return { combination: [], score: 0 };
    }
    
    // Sort biomarkers by score
    const sortedBiomarkers = treatmentAnalysis.biomarkers
      .filter(b => b.score > 0)
      .sort((a, b) => b.score - a.score);
    
    // Find optimal combination (top 3-5 biomarkers with complementary profiles)
    const optimalSize = Math.min(5, Math.max(3, sortedBiomarkers.length));
    const combination = sortedBiomarkers.slice(0, optimalSize);
    
    const combinedScore = combination.reduce((sum, b) => sum + b.score, 0) / combination.length;
    
    return {
      combination: combination.map(b => b.name),
      score: combinedScore,
      reliability: this.calculateCombinationReliability(combination)
    };
  },
  
  calculateCombinationReliability: (biomarkers) => {
    if (biomarkers.length === 0) return 'low';
    
    const reliabilityScores = biomarkers.map(b => {
      switch (b.reliability) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
      }
    });
    
    const avgReliability = reliabilityScores.reduce((sum, score) => sum + score, 0) / reliabilityScores.length;
    
    if (avgReliability >= 2.5) return 'high';
    if (avgReliability >= 1.5) return 'medium';
    return 'low';
  }
};

export const DataVisualizationUtils = {
  generateChartColors: (count) => {
    const baseColors = [
      '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(baseColors[i % baseColors.length]);
    }
    return colors;
  },
  
  formatPercentage: (value, decimals = 1) => {
    if (typeof value !== 'number' || isNaN(value)) return '0.0%';
    return `${value.toFixed(decimals)}%`;
  },
  
  formatScore: (value, decimals = 3) => {
    if (typeof value !== 'number' || isNaN(value)) return '0.000';
    return value.toFixed(decimals);
  },
  
  generateTrendIcon: (trend) => {
    switch (trend) {
      case 'increase': return '↗️';
      case 'decrease': return '↘️';
      case 'stable': return '➖';
      default: return '❓';
    }
  },
  
  generateReliabilityBadge: (reliability) => {
    const badges = {
      'high': { text: 'High Confidence', color: 'green', icon: '✅' },
      'medium': { text: 'Medium Confidence', color: 'yellow', icon: '⚠️' },
      'low': { text: 'Low Confidence', color: 'red', icon: '❌' }
    };
    
    return badges[reliability] || badges['low'];
  }
};

// Export configuration
export const ApiConfig = {
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_CACHE_SIZE: 100, // Maximum number of cached items
  
  SCORE_THRESHOLDS: {
    EXCELLENT: 0.8,
    GOOD: 0.6,
    MODERATE: 0.4,
    POOR: 0.2
  },
  
  RELIABILITY_THRESHOLDS: {
    HIGH_DATA_POINTS: 20,
    MEDIUM_DATA_POINTS: 10,
    HIGH_QUALITY_RATIO: 0.8,
    MEDIUM_QUALITY_RATIO: 0.6
  }
};

export default apiService;
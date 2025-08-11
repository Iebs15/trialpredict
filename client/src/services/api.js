// Enhanced API Service with OpenAI integration and advanced features
class ApiService {
  constructor() {
    this.baseURL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.timeout = 30000; // 30 seconds for AI requests
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Enhanced request handler with retry logic and better error handling
  async makeRequest(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: controller.signal,
      ...options
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseURL}${url}`, defaultOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (attempt === this.retryAttempts) {
          throw error;
        }

        // Don't retry on certain errors
        if (error.name === 'AbortError' || 
            error.message.includes('400') || 
            error.message.includes('401') || 
            error.message.includes('403')) {
          throw error;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
      }
    }
  }

  // Health check endpoint
  async healthCheck() {
    return this.makeRequest('/api/health');
  }

  // Get all biomarkers
  async getBiomarkers() {
    return this.makeRequest('/api/biomarkers');
  }

  // Get all conditions
  async getConditions() {
    return this.makeRequest('/api/conditions');
  }

  // Calculate biomarker score
  async calculateBiomarkerScore(biomarkerName, condition) {
    return this.makeRequest('/api/biomarker/score', {
      method: 'POST',
      body: JSON.stringify({
        biomarker_name: biomarkerName,
        condition: condition
      })
    });
  }

  // Get biomarker data with pagination
  async getBiomarkerData(biomarkerName, condition, page = 1, size = 20) {
    return this.makeRequest('/api/biomarker/data', {
      method: 'POST',
      body: JSON.stringify({
        biomarker_name: biomarkerName,
        condition: condition,
        page: page,
        size: size
      })
    });
  }

  // Enhanced treatment scores with caching
  async getTreatmentScores(treatment) {
    try {
      // Check if we have cached scores
      const cacheKey = `treatment_scores_${treatment.id}_${JSON.stringify(treatment.biomarkers)}`;
      const cached = this.getCachedData(cacheKey);
      
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      const scores = [];
      const promises = [];

      // Process biomarkers in batches to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < treatment.biomarkers.length; i += batchSize) {
        const batch = treatment.biomarkers.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (biomarker) => {
          if (biomarker.name && biomarker.name.trim()) {
            try {
              const scoreData = await this.calculateBiomarkerScore(
                biomarker.name.trim(), 
                treatment.condition
              );
              
              if (scoreData.success) {
                return {
                  biomarker: biomarker.name.trim(),
                  score: scoreData.score,
                  biomarker_pdfs: scoreData.biomarker_pdfs,
                  total_pdfs: scoreData.total_pdfs,
                  metadata: {
                    condition: treatment.condition,
                    timestamp: new Date().toISOString()
                  }
                };
              }
            } catch (error) {
              console.error(`Error getting score for ${biomarker.name}:`, error);
              // Return a fallback score instead of failing completely
              return {
                biomarker: biomarker.name.trim(),
                score: 0.5,
                biomarker_pdfs: 10,
                total_pdfs: 20,
                fallback: true,
                error: error.message
              };
            }
          }
          return null;
        });

        const batchResults = await Promise.all(batchPromises);
        scores.push(...batchResults.filter(Boolean));
        
        // Small delay between batches to be nice to the API
        if (i + batchSize < treatment.biomarkers.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      const result = {
        success: true,
        treatment: treatment,
        scores: scores,
        metadata: {
          total_biomarkers: treatment.biomarkers.length,
          processed_biomarkers: scores.length,
          processing_time: new Date().toISOString()
        }
      };

      // Cache the result
      this.setCachedData(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error in getTreatmentScores:', error);
      return {
        success: false,
        error: error.message,
        treatment: treatment,
        scores: []
      };
    }
  }

  // Compare treatments
  async compareTreatments(treatment1, treatment2) {
    return this.makeRequest('/api/treatments/compare', {
      method: 'POST',
      body: JSON.stringify({
        treatment1: treatment1,
        treatment2: treatment2
      })
    });
  }

  // Search biomarkers with advanced options
  async searchBiomarkers(query, condition = null, limit = 50, options = {}) {
    const searchParams = {
      query: query,
      condition: condition,
      limit: limit,
      ...options
    };

    return this.makeRequest('/api/search', {
      method: 'POST',
      body: JSON.stringify(searchParams)
    });
  }

  // Advanced search with filters and sorting
  async advancedSearch(searchOptions) {
    const {
      query,
      condition,
      biomarkerFilter,
      treatmentFilter,
      scoreRange,
      sortBy = 'relevance',
      limit = 50
    } = searchOptions;

    return this.makeRequest('/api/search/advanced', {
      method: 'POST',
      body: JSON.stringify({
        query,
        condition,
        biomarker_filter: biomarkerFilter,
        treatment_filter: treatmentFilter,
        score_range: scoreRange,
        sort_by: sortBy,
        limit
      })
    });
  }

  // Get all biomarker scores for a biomarker across conditions
  async getAllBiomarkerScores(biomarkerName) {
    return this.makeRequest('/api/biomarker/scores-all', {
      method: 'POST',
      body: JSON.stringify({
        biomarker_name: biomarkerName
      })
    });
  }

  // Get comprehensive treatment analysis
  async getTreatmentAnalysis(treatment) {
    return this.makeRequest('/api/treatment/analysis', {
      method: 'POST',
      body: JSON.stringify({
        treatment: treatment
      })
    });
  }

  // ===================== NEW OPENAI ENDPOINTS =====================

  // Generate AI insights for treatment comparison
  async generateInsights(insightRequest) {
    const { query, treatment_data, comparison_context, options = {} } = insightRequest;
    
    // Extended timeout for AI requests
    const originalTimeout = this.timeout;
    this.timeout = 60000; // 60 seconds for AI processing

    try {
      const response = await this.makeRequest('/api/insights/generate', {
        method: 'POST',
        body: JSON.stringify({
          query: query,
          treatment_data: treatment_data,
          comparison_context: comparison_context,
          options: {
            include_recommendations: true,
            include_statistical_analysis: true,
            format: 'markdown',
            ...options
          }
        })
      });

      // Cache successful insights
      if (response.success) {
        const cacheKey = `insights_${this.hashString(query + JSON.stringify(treatment_data))}`;
        this.setCachedData(cacheKey, response, 3600000); // Cache for 1 hour
      }

      return response;
    } finally {
      this.timeout = originalTimeout; // Restore original timeout
    }
  }

  // Export insights in various formats
  async exportInsights(exportRequest) {
    const { insights, format = 'json', metadata = {}, options = {} } = exportRequest;

    return this.makeRequest('/api/insights/export', {
      method: 'POST',
      body: JSON.stringify({
        insights: insights,
        format: format,
        metadata: {
          export_timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          ...metadata
        },
        options: {
          include_metadata: true,
          formatting: 'pretty',
          ...options
        }
      })
    });
  }

  // Get insight history for a user session
  async getInsightHistory(sessionId) {
    return this.makeRequest(`/api/insights/history/${sessionId}`);
  }

  // Save insight to history
  async saveInsightToHistory(insightData) {
    return this.makeRequest('/api/insights/history', {
      method: 'POST',
      body: JSON.stringify({
        ...insightData,
        session_id: this.getSessionId(),
        timestamp: new Date().toISOString()
      })
    });
  }

  // Get AI-powered treatment recommendations
  async getTreatmentRecommendations(patientProfile, availableTreatments) {
    return this.makeRequest('/api/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify({
        patient_profile: patientProfile,
        available_treatments: availableTreatments,
        recommendation_type: 'comprehensive'
      })
    });
  }

  // Generate biomarker interaction analysis
  async getBiomarkerInteractions(biomarkers, condition) {
    return this.makeRequest('/api/ai/biomarker-interactions', {
      method: 'POST',
      body: JSON.stringify({
        biomarkers: biomarkers,
        condition: condition,
        analysis_depth: 'detailed'
      })
    });
  }

  // ===================== UTILITY METHODS =====================

  // Simple caching mechanism
  getCachedData(key) {
    try {
      const cached = localStorage.getItem(`biomarker_cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  setCachedData(key, data, ttl = 1800000) { // Default 30 minutes TTL
    try {
      const cacheData = {
        data: data,
        timestamp: Date.now(),
        ttl: ttl
      };
      localStorage.setItem(`biomarker_cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  }

  isCacheValid(timestamp, ttl = 1800000) {
    return (Date.now() - timestamp) < ttl;
  }

  clearCache() {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('biomarker_cache_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Hash function for cache keys
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Session management
  getSessionId() {
    let sessionId = sessionStorage.getItem('biomarker_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('biomarker_session_id', sessionId);
    }
    return sessionId;
  }

  // Batch processing utility
  async processBatch(items, processor, batchSize = 5, delay = 100) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(processor);
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Delay between batches
      if (i + batchSize < items.length && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return results;
  }

  // Error reporting
  async reportError(error, context = {}) {
    try {
      await this.makeRequest('/api/errors/report', {
        method: 'POST',
        body: JSON.stringify({
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name
          },
          context: {
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            url: window.location.href,
            session_id: this.getSessionId(),
            ...context
          }
        })
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  // Performance monitoring
  startTimer(label) {
    const startTime = performance.now();
    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`${label}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }
}

// Create singleton instance
const apiService = new ApiService();

// Export both the class and the instance
export default apiService;
export { ApiService };
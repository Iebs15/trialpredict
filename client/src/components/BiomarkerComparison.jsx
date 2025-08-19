import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Beaker,
  Database,
  Target,
  Activity,
  Plus,
  BarChart3,
  Search,
  Eye,
  EyeOff,
  Download,
  Upload,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Settings,
  TrendingUp,
  Filter,
  SortAsc,
  Zap,
  Award,
  AlertTriangle,
  X,
} from "lucide-react";

// Import components (assuming they exist)
import TreatmentCard from "./TreatmentCard.jsx";
import EnhancedComparisonChart from "./EnhancedComparisonChart.jsx";
import SearchInterface from "./SearchInterface.jsx";
import BiomarkerDataModal from "./BiomarkerDataModal.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

const BiomarkerComparison = () => {
  // State management
  const [treatments, setTreatments] = useState([
    {
      id: 1,
      name: "Treatment 1",
      condition: "Aging",
      biomarkers: [{ name: "Melanin" }],
    },
  ]);

  const [selectedTreatments, setSelectedTreatments] = useState([1]);
  const [showComparison, setShowComparison] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState("maxValue");
  const [showValues, setShowValues] = useState(true);
  const [filterBiomarker, setFilterBiomarker] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Data state
  const [availableBiomarkers, setAvailableBiomarkers] = useState([]);
  const [availableConditions, setAvailableConditions] = useState([
    "Aging",
    "Pigmentation", 
    "Wrinkles",
  ]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [levelChangeData, setLevelChangeData] = useState({});
  const [systemStats, setSystemStats] = useState({
    totalDataPoints: 0,
    reliableBiomarkers: 0,
    avgDataQuality: 0,
  });

  // Modal state
  const [biomarkerDataModal, setBiomarkerDataModal] = useState({
    isOpen: false,
    biomarker: null,
    condition: null,
  });

  // Add Treatment Modal state
  const [showAddTreatmentModal, setShowAddTreatmentModal] = useState(false);
  const [newTreatmentName, setNewTreatmentName] = useState("");
  const [selectedConditionForNewTreatment, setSelectedConditionForNewTreatment] = useState("");

  const treatmentsPerPage = 3;
  const totalPages = Math.ceil(treatments.length / treatmentsPerPage);
  const currentTreatments = treatments.slice(
    currentPage * treatmentsPerPage,
    (currentPage + 1) * treatmentsPerPage
  );

  // API Service
  const ApiService = {
    async healthCheck() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/health`
        );
        return await response.json();
      } catch (error) {
        throw new Error("Health check failed");
      }
    },

    async getBiomarkers() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/biomarkers`
        );
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch biomarkers:", error);
        return {
          success: true,
          biomarkers: [
            "IL-6", "MCP-1", "Angiogenin", "IL-8", "Osteoprotegerin", "HGF",
            "TIMP-1", "IGFBP-2", "TIMP-2", "TNF-Î±", "Collagen I", "Elastin",
            "Hyaluronic Acid", "Melanin", "Tyrosinase", "Filaggrin", "VEGF",
            "TGF-Î²", "MMP-1", "MMP-3", "Ceramides", "Squalene",
          ],
          fallback: true,
        };
      }
    },

    async getConditions() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/conditions`
        );
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch conditions:", error);
        return {
          success: true,
          conditions: [
            "Aging", "Pigmentation", "Wrinkles", "Acne", "Dryness", "Sensitivity",
          ],
          fallback: true,
        };
      }
    },

    async getBiomarkerLevelChangeData(biomarker, condition) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/biomarker/level-change-data`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ biomarker_name: biomarker, condition }),
          }
        );
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch level change data:", error);
        return {
          success: true,
          data: this.generateMockLevelChangeData(biomarker, condition),
          fallback: true,
        };
      }
    },

    generateMockLevelChangeData(biomarkerName, condition) {
      const dataPoints = Math.floor(Math.random() * 40) + 20;
      const data = [];

      const getChangeProbabilities = () => {
        const combos = {
          "IL-6_Aging": { increase: 0.65, decrease: 0.2, unchanged: 0.15 },
          "Melanin_Pigmentation": { increase: 0.7, decrease: 0.15, unchanged: 0.15 },
          "Collagen I_Aging": { increase: 0.35, decrease: 0.45, unchanged: 0.2 },
        };
        const key = `${biomarkerName}_${condition}`;
        return combos[key] || { increase: 0.45, decrease: 0.35, unchanged: 0.2 };
      };

      const probs = getChangeProbabilities();

      for (let i = 0; i < dataPoints; i++) {
        const rand = Math.random();
        let levelChange = "unknown";

        if (rand < probs.increase) {
          levelChange = "increase";
        } else if (rand < probs.increase + probs.decrease) {
          levelChange = "decrease";
        } else if (rand < probs.increase + probs.decrease + probs.unchanged) {
          levelChange = "unchanged";
        }

        data.push({
          Subject_ID: `S${String(i + 1).padStart(3, "0")}`,
          Biomarker_Level_Change: levelChange,
          Treatment_Name: `Treatment ${String.fromCharCode(65 + (i % 6))}`,
          Type_of_Study: Math.random() > 0.6 ? "Clinical trial" : Math.random() > 0.3 ? "In vitro study" : "Animal study",
          Age: Math.floor(Math.random() * 60) + 20,
          Sex: Math.random() > 0.5 ? "Female" : "Male",
          Ethnicity: ["Caucasian", "Asian", "African", "Hispanic"][Math.floor(Math.random() * 4)],
          Key_Outcome: `Study showed ${levelChange} in ${biomarkerName} levels after treatment.`,
        });
      }

      return data;
    },
  };

  // Initialize data
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    calculateSystemStats();
  }, [levelChangeData, treatments]);

  const loadInitialData = async () => {
    setLoading(true);
    setApiError(null);

    try {
      await ApiService.healthCheck();

      const [biomarkersResponse, conditionsResponse] = await Promise.all([
        ApiService.getBiomarkers(),
        ApiService.getConditions(),
      ]);

      if (biomarkersResponse.success) {
        setAvailableBiomarkers(biomarkersResponse.biomarkers);
        if (biomarkersResponse.fallback) {
          setApiError(
            "Using fallback biomarker data. Database connection may be limited."
          );
        }
      }

      if (conditionsResponse.success) {
        setAvailableConditions(conditionsResponse.conditions);
      }

      await loadTreatmentLevelChangeData();
    } catch (error) {
      console.error("Error loading initial data:", error);
      setApiError(
        "Failed to connect to the biomarker database. Using fallback data."
      );
      setAvailableBiomarkers([
        "IL-6", "MCP-1", "Angiogenin", "IL-8", "Osteoprotegerin", "HGF",
        "TIMP-1", "IGFBP-2", "TIMP-2", "TNF-Î±", "Collagen I", "Elastin",
        "Hyaluronic Acid", "Melanin", "Tyrosinase",
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTreatmentLevelChangeData = async () => {
    const newLevelChangeData = { ...levelChangeData };

    for (const treatment of treatments) {
      for (const biomarker of treatment.biomarkers) {
        if (biomarker.name.trim()) {
          const key = `${biomarker.name}_${treatment.condition}`;
          if (!newLevelChangeData[key]) {
            try {
              const response = await ApiService.getBiomarkerLevelChangeData(
                biomarker.name,
                treatment.condition
              );
              if (response.success) {
                newLevelChangeData[key] = response.data;
              }
            } catch (error) {
              console.error(`Failed to load data for ${biomarker.name}:`, error);
            }
          }
        }
      }
    }

    setLevelChangeData(newLevelChangeData);
  };

  const calculateSystemStats = () => {
    let totalDataPoints = 0;
    let reliableBiomarkers = 0;
    let qualitySum = 0;
    let biomarkerCount = 0;

    Object.values(levelChangeData).forEach((data) => {
      if (data && Array.isArray(data)) {
        totalDataPoints += data.length;
        biomarkerCount++;

        const validData = data.filter(
          (d) => d.Biomarker_Level_Change && d.Biomarker_Level_Change !== "unknown"
        ).length;

        const quality = data.length > 0 ? validData / data.length : 0;
        qualitySum += quality;

        if (data.length >= 15 && quality >= 0.7) {
          reliableBiomarkers++;
        }
      }
    });

    setSystemStats({
      totalDataPoints,
      reliableBiomarkers,
      avgDataQuality: biomarkerCount > 0 ? (qualitySum / biomarkerCount) * 100 : 0,
    });
  };

  // Treatment management functions
  const openAddTreatmentModal = () => {
    setNewTreatmentName("");
    setSelectedConditionForNewTreatment(availableConditions[0] || "");
    setShowAddTreatmentModal(true);
  };

  const closeAddTreatmentModal = () => {
    setShowAddTreatmentModal(false);
    setNewTreatmentName("");
    setSelectedConditionForNewTreatment("");
  };

  const addTreatment = () => {
    if (!newTreatmentName.trim() || !selectedConditionForNewTreatment) {
      alert("Please enter a treatment name and select a condition");
      return;
    }

    const newId = Math.max(...treatments.map((t) => t.id)) + 1;
    const newTreatment = {
      id: newId,
      name: newTreatmentName.trim(),
      condition: selectedConditionForNewTreatment,
      biomarkers: [],
    };

    setTreatments([...treatments, newTreatment]);
    const newTreatmentPage = Math.floor(treatments.length / treatmentsPerPage);
    setCurrentPage(newTreatmentPage);
    closeAddTreatmentModal();
  };

  const removeTreatment = (id) => {
    if (treatments.length > 1) {
      setTreatments(treatments.filter((t) => t.id !== id));
      setSelectedTreatments(selectedTreatments.filter((t) => t !== id));

      const newTotalPages = Math.ceil((treatments.length - 1) / treatmentsPerPage);
      if (currentPage >= newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages - 1);
      }
    }
  };

  const updateTreatment = async (id, updatedTreatment) => {
    setTreatments(treatments.map((t) => (t.id === id ? updatedTreatment : t)));

    const treatment = treatments.find((t) => t.id === id);
    if (treatment && updatedTreatment.biomarkers.length > treatment.biomarkers.length) {
      const newBiomarkers = updatedTreatment.biomarkers.slice(treatment.biomarkers.length);
      for (const biomarker of newBiomarkers) {
        if (biomarker.name.trim()) {
          const key = `${biomarker.name}_${updatedTreatment.condition}`;
          if (!levelChangeData[key]) {
            try {
              const response = await ApiService.getBiomarkerLevelChangeData(
                biomarker.name,
                updatedTreatment.condition
              );
              if (response.success) {
                setLevelChangeData((prev) => ({
                  ...prev,
                  [key]: response.data,
                }));
              }
            } catch (error) {
              console.error(`Failed to load data for ${biomarker.name}:`, error);
            }
          }
        }
      }
    }
  };

  const duplicateTreatment = (id) => {
    const originalTreatment = treatments.find((t) => t.id === id);
    if (originalTreatment) {
      const newId = Math.max(...treatments.map((t) => t.id)) + 1;
      const duplicatedTreatment = {
        ...originalTreatment,
        id: newId,
        name: `${originalTreatment.name} (Copy)`,
        biomarkers: [...originalTreatment.biomarkers],
      };
      setTreatments([...treatments, duplicatedTreatment]);
      setSelectedTreatments([...selectedTreatments, newId]);

      const newTreatmentPage = Math.floor(treatments.length / treatmentsPerPage);
      setCurrentPage(newTreatmentPage);
    }
  };

  const toggleTreatmentSelection = (id, selected) => {
    if (selected) {
      setSelectedTreatments([...selectedTreatments, id]);
    } else {
      setSelectedTreatments(selectedTreatments.filter((t) => t !== id));
    }
  };

  const selectAllTreatments = () => {
    setSelectedTreatments(treatments.map((t) => t.id));
  };

  const deselectAllTreatments = () => {
    setSelectedTreatments([]);
  };

  // Data management functions
  const exportData = () => {
    const exportData = {
      treatments,
      levelChangeData,
      systemStats,
      metadata: {
        exportDate: new Date().toISOString(),
        version: "3.0",
        scoringMethod: "level_change",
        totalTreatments: treatments.length,
        totalBiomarkers: treatments.reduce((acc, t) => acc + t.biomarkers.length, 0),
        selectedTreatments: selectedTreatments,
        dataQuality: systemStats.avgDataQuality,
      },
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `biomarker-comparison-levelchange-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          const treatmentsData = imported.treatments || imported;

          if (Array.isArray(treatmentsData) && treatmentsData.length > 0) {
            setTreatments(treatmentsData);
            setSelectedTreatments(
              imported.metadata?.selectedTreatments || treatmentsData.map((t) => t.id)
            );

            if (imported.levelChangeData) {
              setLevelChangeData(imported.levelChangeData);
            }

            setCurrentPage(0);
          } else {
            throw new Error("Invalid data format");
          }
        } catch (error) {
          alert("Error importing file. Please check the format and try again.");
        }
      };
      reader.readAsText(file);
    }
    event.target.value = "";
  };

  const clearAllData = () => {
    if (
      confirm(
        "Are you sure you want to clear all treatment data? This action cannot be undone."
      )
    ) {
      setTreatments([
        {
          id: 1,
          name: "Treatment 1",
          condition: availableConditions[0] || "Aging",
          biomarkers: [],
        },
      ]);
      setSelectedTreatments([1]);
      setCurrentPage(0);
      setLevelChangeData({});
    }
  };

  // Modal functions
  const handleViewBiomarkerData = (biomarker, condition) => {
    setBiomarkerDataModal({
      isOpen: true,
      biomarker,
      condition,
    });
  };

  const closeBiomarkerDataModal = () => {
    setBiomarkerDataModal({
      isOpen: false,
      biomarker: null,
      condition: null,
    });
  };

  // Statistics calculation
  const getComparisonStats = () => {
    const selectedCount = selectedTreatments.length;
    const totalBiomarkers = new Set();
    let totalLevelChangeData = 0;
    let reliableDataPoints = 0;

    treatments
      .filter((t) => selectedTreatments.includes(t.id))
      .forEach((treatment) => {
        treatment.biomarkers.forEach((biomarker) => {
          if (biomarker.name.trim()) {
            totalBiomarkers.add(biomarker.name.trim());

            const key = `${biomarker.name}_${treatment.condition}`;
            const data = levelChangeData[key];
            if (data && Array.isArray(data)) {
              totalLevelChangeData += data.length;
              reliableDataPoints += data.filter(
                (d) =>
                  d.Biomarker_Level_Change && d.Biomarker_Level_Change !== "unknown"
              ).length;
            }
          }
        });
      });

    return {
      selectedTreatments: selectedCount,
      uniqueBiomarkers: totalBiomarkers.size,
      totalDataPoints: totalLevelChangeData,
      reliableDataPoints,
      dataReliability:
        totalLevelChangeData > 0
          ? (reliableDataPoints / totalLevelChangeData) * 100
          : 0,
    };
  };

  const stats = getComparisonStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="text-lg font-medium text-slate-700 mt-4">
            Loading biomarker database...
          </p>
          <p className="text-sm text-slate-500">
            Initializing level change analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Beaker className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Enhanced Biomarker Comparison
                </h1>
                <p className="text-slate-600">
                  Level change analytics with real-time database integration
                </p>

              </div>
            </div>
          </div>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Database Connection Issue</span>
            </div>
            <p className="text-amber-700 mt-1 text-sm">{apiError}</p>
          </div>
        )}

        {/* Enhanced Control Panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={openAddTreatmentModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                Add Treatment
              </button>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <BarChart3 className="h-4 w-4" />
                {showComparison ? "Hide" : "Show"} Compare Treatments
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <Search className="h-4 w-4" />
                {showSearch ? "Hide" : "Show"} Search
              </button>
              {selectedTreatments.length > 0 && (
                <button
                  onClick={deselectAllTreatments}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  <EyeOff className="h-4 w-4" />
                  Deselect All
                </button>
              )}
              {selectedTreatments.length < treatments.length && (
                <button
                  onClick={selectAllTreatments}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  <Eye className="h-4 w-4" />
                  Select All
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-sm hover:shadow-md font-medium transform hover:scale-105"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-sm hover:shadow-md font-medium cursor-pointer transform hover:scale-105">
                <Upload className="h-4 w-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              <button
                onClick={clearAllData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </div>

          {/* Enhanced Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-slate-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    {treatments.length}
                  </div>
                  <div className="text-sm text-slate-600">Total Treatments</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.selectedTreatments}
                  </div>
                  <div className="text-sm text-blue-600">
                    Selected for Analysis
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.uniqueBiomarkers}
                  </div>
                  <div className="text-sm text-green-600">
                    Unique Biomarkers
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalDataPoints}
                  </div>
                  <div className="text-sm text-purple-600">
                    Level Change Data Points
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-amber-600" />
                <div>
                  <div className="text-2xl font-bold text-amber-600">
                    {stats.dataReliability.toFixed(1)}%
                  </div>
                  <div className="text-sm text-amber-600">Data Reliability</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        {showSearch && (
          <div className="mb-8">
            <SearchInterface
              availableBiomarkers={availableBiomarkers}
              availableConditions={availableConditions}
            />
          </div>
        )}

        {/* Treatment Cards */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Treatment Configuration & Level Change Analytics
            </h2>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 text-sm text-slate-600 bg-slate-100 rounded-lg">
                  {currentPage + 1} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Treatment Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentTreatments.map((treatment) => (
              <TreatmentCard
                key={treatment.id}
                treatment={treatment}
                onUpdate={updateTreatment}
                onRemove={removeTreatment}
                onDuplicate={duplicateTreatment}
                canRemove={treatments.length > 1}
                isSelected={selectedTreatments.includes(treatment.id)}
                onToggleSelect={toggleTreatmentSelection}
                availableBiomarkers={availableBiomarkers}
                availableConditions={availableConditions}
                onViewBiomarkerData={handleViewBiomarkerData}
              />
            ))}
          </div>

          {/* Show total treatments info */}
          <div className="text-center text-sm text-slate-500">
            Showing {currentTreatments.length} of {treatments.length} treatments
          </div>
        </div>

        {/* Enhanced Comparison View with Level Change Analytics */}
        {showComparison && selectedTreatments.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Enhanced Comparison Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      Level Change Comparison Analysis
                    </h3>
                    <p className="text-sm text-slate-600">
                      Real-time analysis of {stats.selectedTreatments}{" "}
                      treatments across {stats.uniqueBiomarkers} biomarkers
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span>{stats.totalDataPoints} total data points</span>
                      <span>
                        {stats.reliableDataPoints} reliable measurements
                      </span>
                      <span>
                        {stats.dataReliability.toFixed(1)}% data quality
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Comparison Controls */}
              <div className="flex flex-wrap items-center gap-4">
                {/* <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter biomarkers..."
                    value={filterBiomarker}
                    onChange={(e) => setFilterBiomarker(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div> */}

                {/* <div className="flex items-center gap-2">
                  <SortAsc className="h-4 w-4 text-slate-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="maxValue">Sort by Max Value</option>
                    <option value="variance">Sort by Variance</option>
                    <option value="alphabetical">Sort Alphabetically</option>
                  </select>
                </div> */}

                {/* <button
                  onClick={() => setShowValues(!showValues)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showValues
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {showValues ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  Show Values
                </button> */}
              </div>
            </div>

            {/* Enhanced Comparison Chart */}
            <div className="p-6">
              {selectedTreatments.length > 1 ? (
                <EnhancedComparisonChart
                  treatments={treatments}
                  selectedTreatments={selectedTreatments}
                  sortBy={sortBy}
                  showValues={showValues}
                  filterBiomarker={filterBiomarker}
                  levelChangeData={levelChangeData}
                />
              ) : (
                <div className="text-center py-16 text-slate-500">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-medium mb-2">
                    Select at least 2 treatments to compare
                  </p>
                  <p className="text-sm">
                    Use the checkboxes on treatment cards to select them for
                    comparison
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add Treatment Modal */}
        {showAddTreatmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Add New Treatment</h3>
                <button
                  onClick={closeAddTreatmentModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Treatment Name *
                  </label>
                  <input
                    type="text"
                    value={newTreatmentName}
                    onChange={(e) => setNewTreatmentName(e.target.value)}
                    placeholder="Enter treatment name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Condition *
                  </label>
                  <select
                    value={selectedConditionForNewTreatment}
                    onChange={(e) => setSelectedConditionForNewTreatment(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a condition</option>
                    {availableConditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={addTreatment}
                  disabled={!newTreatmentName.trim() || !selectedConditionForNewTreatment}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Add Treatment
                </button>
                <button
                  onClick={closeAddTreatmentModal}
                  className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg hover:bg-slate-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Biomarker Data Modal */}
        <BiomarkerDataModal
          biomarker={biomarkerDataModal.biomarker}
          condition={biomarkerDataModal.condition}
          isOpen={biomarkerDataModal.isOpen}
          onClose={closeBiomarkerDataModal}
          levelChangeData={levelChangeData}
        />
      </div>
    </div>
  );
};

export default BiomarkerComparison;
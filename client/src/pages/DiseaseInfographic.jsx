"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Info, TrendingUp, TrendingDown, Activity, ZoomIn, ZoomOut, HelpCircle } from "lucide-react"

export default function DiseaseInfographic() {
  const location = useLocation()
  const { data, diseaseName } = location.state || {}
  const [tooltip, setTooltip] = useState(null)
  const [selectedSymptom, setSelectedSymptom] = useState(null)
  const [symptomDetails, setSymptomDetails] = useState(null)
  const [selectedCircle, setSelectedCircle] = useState(null)
  const [circleDetails, setCircleDetails] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const svgContainerRef = useRef(null)
  const detailsSectionRef = useRef(null)

  // Filter states
  const [biomarkerFilter, setBiomarkerFilter] = useState("")
  const [symptomFilter, setSymptomFilter] = useState("")
  const [scoreThreshold, setScoreThreshold] = useState(0)
  const [showOnlyWithData, setShowOnlyWithData] = useState(false)

  const CIRCLE_RADIUS = 16
  const cellSize = 60 // Increased cell size for better spacing
  const margin = { top: 180, right: 60, bottom: 80, left: 320 } // Increased margins for labels
  const VISUALIZATION_HEIGHT = 600

  // Scroll to center on initial load
  useEffect(() => {
    if (svgContainerRef.current) {
      const container = svgContainerRef.current
      container.scrollLeft =
        (Math.max(finalSymptoms.length * cellSize + margin.left + margin.right, 1200) * zoomLevel -
          container.clientWidth) /
        2
    }
  }, [zoomLevel])

  // Auto-scroll to details section when details are shown
  useEffect(() => {
    if ((selectedSymptom && symptomDetails) || (selectedCircle && circleDetails)) {
      setTimeout(() => {
        detailsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
  }, [selectedSymptom, symptomDetails, selectedCircle, circleDetails])

  // Show error message if no data is available
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <Activity className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">No Data Available</h2>
            <p className="text-slate-600 mt-2">Please navigate here with valid disease data.</p>
          </div>
        </Card>
      </div>
    )
  }

  const biomarkers = Object.keys(data)

  // Get ALL unique symptoms from ALL biomarkers
  const allSymptoms = new Set()
  biomarkers.forEach((biomarker) => {
    Object.keys(data[biomarker] || {}).forEach((symptom) => {
      allSymptoms.add(symptom)
    })
  })
  const symptoms = Array.from(allSymptoms).sort()

  // Apply filters to biomarkers and symptoms
  const filteredBiomarkers = biomarkers.filter((biomarker) =>
    biomarker.toLowerCase().includes(biomarkerFilter.toLowerCase()),
  )

  const filteredSymptoms = symptoms.filter((symptom) => symptom.toLowerCase().includes(symptomFilter.toLowerCase()))

  // Further filter based on score threshold and data availability
  const finalBiomarkers = filteredBiomarkers.filter((biomarker) => {
    if (!showOnlyWithData && scoreThreshold === 0) return true

    const hasValidData = filteredSymptoms.some((symptom) => {
      const datum = data[biomarker]?.[symptom]
      if (!datum) return !showOnlyWithData
      return datum.total_avg >= scoreThreshold
    })

    return hasValidData
  })

  const finalSymptoms = filteredSymptoms.filter((symptom) => {
    if (!showOnlyWithData && scoreThreshold === 0) return true

    const hasValidData = finalBiomarkers.some((biomarker) => {
      const datum = data[biomarker]?.[symptom]
      if (!datum) return !showOnlyWithData
      return datum.total_avg >= scoreThreshold
    })

    return hasValidData
  })

  const width = Math.max(finalSymptoms.length * cellSize + margin.left + margin.right, 1200)
  const height = Math.max(finalBiomarkers.length * cellSize + margin.top + margin.bottom, 800)

  console.log("Total biomarkers:", biomarkers.length)
  console.log("Total symptoms:", symptoms.length)
  console.log("Symptoms:", symptoms)

  // Create gradient for colored circles with updated colors
  const createGradient = (inhibitorPercent, promoterPercent, unknownPercent, id) => (
    <defs key={id}>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="oklch(0.925 0.084 155.995)" stopOpacity={inhibitorPercent / 100} />
        <stop
          offset={`${inhibitorPercent}%`}
          stopColor="oklch(0.925 0.084 155.995)"
          stopOpacity={inhibitorPercent / 100}
        />
        <stop
          offset={`${inhibitorPercent}%`}
          stopColor="oklch(0.924 0.12 95.746)"
          stopOpacity={promoterPercent / 100}
        />
        <stop
          offset={`${inhibitorPercent + promoterPercent}%`}
          stopColor="oklch(0.924 0.12 95.746)"
          stopOpacity={promoterPercent / 100}
        />
        <stop
          offset={`${inhibitorPercent + promoterPercent}%`}
          stopColor="#6b7280"
          stopOpacity={unknownPercent / 100}
        />
        <stop offset="100%" stopColor="#6b7280" stopOpacity={unknownPercent / 100} />
      </linearGradient>
    </defs>
  )

  // Handle mouse events for tooltip with null checks
  const handleMouseEnter = (biomarker, symptom, datum, event) => {
    if (!datum) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      biomarker,
      symptom,
      total_avg: datum.total_avg || 0,
      avg_inhibitor: datum.avg_inhibitor || 0,
      avg_promoter: datum.avg_promoter || 0,
      avg_unknown: datum.avg_unknown || 0,
      percent_inhibitor: datum.percent_inhibitor || 0,
      percent_promoter: datum.percent_promoter || 0,
      percent_unknown: datum.percent_unknown || 0,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  // Handle symptom click - clear circle details when symptom is selected
  const handleSymptomClick = (symptom) => {
    // Clear circle selection when selecting a symptom
    setSelectedCircle(null)
    setCircleDetails(null)

    setSelectedSymptom(symptom)

    // Calculate statistics for this symptom across all biomarkers
    const symptomStats = {
      symptom,
      totalBiomarkers: biomarkers.length,
      biomarkersWithData: 0,
      avgInhibitorScore: 0,
      avgPromoterScore: 0,
      avgUnknownScore: 0,
      avgTotalScore: 0,
      strongestInhibitor: null,
      strongestPromoter: null,
      strongestUnknown: null,
      biomarkerData: [],
    }

    let totalInhibitor = 0
    let totalPromoter = 0
    let totalUnknown = 0
    let totalScore = 0
    let maxInhibitor = 0
    let maxPromoter = 0
    let maxUnknown = 0

    biomarkers.forEach((biomarker) => {
      const datum = data[biomarker]?.[symptom]
      if (datum) {
        symptomStats.biomarkersWithData++
        totalInhibitor += datum.avg_inhibitor || 0
        totalPromoter += datum.avg_promoter || 0
        totalUnknown += datum.avg_unknown || 0
        totalScore += datum.total_avg || 0

        if ((datum.avg_inhibitor || 0) > maxInhibitor) {
          maxInhibitor = datum.avg_inhibitor || 0
          symptomStats.strongestInhibitor = { biomarker, score: datum.avg_inhibitor || 0 }
        }

        if ((datum.avg_promoter || 0) > maxPromoter) {
          maxPromoter = datum.avg_promoter || 0
          symptomStats.strongestPromoter = { biomarker, score: datum.avg_promoter || 0 }
        }

        if ((datum.avg_unknown || 0) > maxUnknown) {
          maxUnknown = datum.avg_unknown || 0
          symptomStats.strongestUnknown = { biomarker, score: datum.avg_unknown || 0 }
        }

        symptomStats.biomarkerData.push({
          biomarker,
          ...datum,
        })
      }
    })

    if (symptomStats.biomarkersWithData > 0) {
      symptomStats.avgInhibitorScore = totalInhibitor / symptomStats.biomarkersWithData
      symptomStats.avgPromoterScore = totalPromoter / symptomStats.biomarkersWithData
      symptomStats.avgUnknownScore = totalUnknown / symptomStats.biomarkersWithData
      symptomStats.avgTotalScore = totalScore / symptomStats.biomarkersWithData
    }

    // Sort biomarker data by total score
    symptomStats.biomarkerData.sort((a, b) => (b.total_avg || 0) - (a.total_avg || 0))

    setSymptomDetails(symptomStats)
  }

  // Handle circle click - clear symptom details when circle is selected
  const handleCircleClick = (biomarker, symptom, datum) => {
    if (!datum) return

    // Clear symptom selection when selecting a circle
    setSelectedSymptom(null)
    setSymptomDetails(null)

    setSelectedCircle({ biomarker, symptom })
    setCircleDetails({
      biomarker,
      symptom,
      total_avg: datum.total_avg || 0,
      avg_inhibitor: datum.avg_inhibitor || 0,
      avg_promoter: datum.avg_promoter || 0,
      avg_unknown: datum.avg_unknown || 0,
      percent_inhibitor: datum.percent_inhibitor || 0,
      percent_promoter: datum.percent_promoter || 0,
      percent_unknown: datum.percent_unknown || 0,
      // Additional analysis
      dominantType:
        (datum.percent_inhibitor || 0) > (datum.percent_promoter || 0) &&
        (datum.percent_inhibitor || 0) > (datum.percent_unknown || 0)
          ? "Inhibitor"
          : (datum.percent_promoter || 0) > (datum.percent_unknown || 0)
            ? "Promoter"
            : "Unknown",
      confidence: Math.max(datum.percent_inhibitor || 0, datum.percent_promoter || 0, datum.percent_unknown || 0),
    })
  }

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.6))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Biomarker-Symptom Association Matrix</h1>
            <p className="text-slate-600 mt-1">
              Interactive visualization for disease:{" "}
              <Badge variant="outline" className="ml-2 font-semibold">
                {diseaseName}
              </Badge>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500">
              {finalBiomarkers.length} biomarkers × {finalSymptoms.length} symptoms
              {(biomarkerFilter || symptomFilter || scoreThreshold > 0 || showOnlyWithData) &&
                ` (filtered from ${biomarkers.length} × ${symptoms.length})`}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.6}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-slate-600">{Math.round(zoomLevel * 100)}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Filter Controls for Association Matrix */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-4">
          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Matrix Filters
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Biomarkers</label>
              <input
                type="text"
                placeholder="Filter biomarkers..."
                value={biomarkerFilter}
                onChange={(e) => setBiomarkerFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search Symptoms</label>
              <input
                type="text"
                placeholder="Filter symptoms..."
                value={symptomFilter}
                onChange={(e) => setSymptomFilter(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Min Score Threshold</label>
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="0.000"
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display Options</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOnlyWithData}
                  onChange={(e) => setShowOnlyWithData(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Show only with data</span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="overflow-hidden">
          <div
            className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden"
            style={{ height: `${VISUALIZATION_HEIGHT}px` }}
          >
            <div ref={svgContainerRef} className="overflow-auto" style={{ height: "100%", width: "100%" }}>
              <svg
                width={width * zoomLevel}
                height={height * zoomLevel}
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMinYMin meet"
              >
                {/* Create gradients for all data points */}
                {finalBiomarkers.map((biomarker, biomarkerIndex) =>
                  finalSymptoms.map((symptom, symptomIndex) => {
                    const datum = data[biomarker]?.[symptom]
                    if (!datum) return null
                    const gradientId = `gradient-${biomarkerIndex}-${symptomIndex}`
                    return createGradient(
                      datum.percent_inhibitor || 0,
                      datum.percent_promoter || 0,
                      datum.percent_unknown || 0,
                      gradientId,
                    )
                  }),
                )}

                {/* Y-axis labels (Biomarkers) */}
                {finalBiomarkers.map((biomarker, index) => (
                  <text
                    key={biomarker}
                    x={margin.left - 15}
                    y={margin.top + index * cellSize + cellSize / 2}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-sm font-medium fill-slate-700 hover:fill-blue-600 cursor-default"
                  >
                    {biomarker.replace(/_/g, " ")}
                  </text>
                ))}

                {/* X-axis labels (Symptoms) - positioned at top with better spacing */}
                {finalSymptoms.map((symptom, index) => (
                  <g key={symptom}>
                    <text
                      x={margin.left + index * cellSize + cellSize / 2}
                      y={margin.top - 40}
                      textAnchor="start"
                      dominantBaseline="middle"
                      className="text-sm font-semibold fill-slate-700 hover:fill-blue-600 cursor-pointer transition-colors"
                      transform={`rotate(-45, ${margin.left + index * cellSize + cellSize / 2}, ${margin.top - 40})`}
                      onClick={() => handleSymptomClick(symptom)}
                    >
                      {symptom}
                    </text>
                    {/* Vertical guide line */}
                    <line
                      x1={margin.left + index * cellSize + cellSize / 2}
                      y1={margin.top - 10}
                      x2={margin.left + index * cellSize + cellSize / 2}
                      y2={margin.top}
                      stroke="#e2e8f0"
                      strokeDasharray="2,2"
                    />
                  </g>
                ))}

                {/* Complete matrix - show circle for EVERY biomarker-symptom combination */}
                {finalBiomarkers.map((biomarker, biomarkerIndex) =>
                  finalSymptoms.map((symptom, symptomIndex) => {
                    const datum = data[biomarker]?.[symptom]
                    const cx = margin.left + symptomIndex * cellSize + cellSize / 2
                    const cy = margin.top + biomarkerIndex * cellSize + cellSize / 2

                    if (datum) {
                      // Show colored circle with data - FIXED SIZE
                      const gradientId = `gradient-${biomarkerIndex}-${symptomIndex}`

                      return (
                        <circle
                          key={`${biomarker}-${symptom}-data`}
                          cx={cx}
                          cy={cy}
                          r={CIRCLE_RADIUS}
                          fill={`url(#${gradientId})`}
                          stroke="#374151"
                          strokeWidth="1.5"
                          className="cursor-pointer hover:stroke-2 hover:stroke-blue-500 transition-all"
                          onMouseEnter={(e) => handleMouseEnter(biomarker, symptom, datum, e)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => handleCircleClick(biomarker, symptom, datum)}
                        />
                      )
                    } else {
                      // Show grey circle for missing data - FIXED SIZE
                      return (
                        <circle
                          key={`${biomarker}-${symptom}-empty`}
                          cx={cx}
                          cy={cy}
                          r={CIRCLE_RADIUS * 0.6}
                          fill="#e2e8f0"
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          className="opacity-60"
                        />
                      )
                    }
                  }),
                )}

                {/* Grid lines for better readability */}
                {finalBiomarkers.map((_, index) => (
                  <line
                    key={`hgrid-${index}`}
                    x1={margin.left - 5}
                    y1={margin.top + index * cellSize}
                    x2={margin.left + finalSymptoms.length * cellSize}
                    y2={margin.top + index * cellSize}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                ))}
                {finalSymptoms.map((_, index) => (
                  <line
                    key={`vgrid-${index}`}
                    x1={margin.left + index * cellSize}
                    y1={margin.top - 5}
                    x2={margin.left + index * cellSize}
                    y2={margin.top + finalBiomarkers.length * cellSize}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Details Panel Below Visualization */}
        {(selectedSymptom && symptomDetails) || (selectedCircle && circleDetails) ? (
          <div ref={detailsSectionRef} className="bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedSymptom ? "Symptom Analysis" : "Interaction Details"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedSymptom(null)
                    setSymptomDetails(null)
                    setSelectedCircle(null)
                    setCircleDetails(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Symptom Details */}
              {selectedSymptom && symptomDetails && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2 capitalize">{selectedSymptom}</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500">Coverage</div>
                          <div className="font-semibold">
                            {symptomDetails.biomarkersWithData}/{symptomDetails.totalBiomarkers}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <div className="text-slate-500">Avg Score</div>
                          <div className="font-semibold">{symptomDetails.avgTotalScore.toFixed(3)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <div className="text-sm text-green-700 font-medium">Avg Inhibitor Score</div>
                          <div className="text-lg font-bold text-green-800">
                            {symptomDetails.avgInhibitorScore.toFixed(3)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                        <div className="flex-1">
                          <div className="text-sm text-yellow-700 font-medium">Avg Promoter Score</div>
                          <div className="text-lg font-bold text-yellow-800">
                            {symptomDetails.avgPromoterScore.toFixed(3)}
                          </div>
                        </div>
                      </div>

                      {/* Only show Unknown Effect if it's greater than 0 */}
                      {symptomDetails.avgUnknownScore > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <HelpCircle className="h-4 w-4 text-gray-600" />
                          <div className="flex-1">
                            <div className="text-sm text-gray-700 font-medium">Avg Unknown Score</div>
                            <div className="text-lg font-bold text-gray-800">
                              {symptomDetails.avgUnknownScore.toFixed(3)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {symptomDetails.strongestInhibitor && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-700 mb-1">Strongest Inhibitor</div>
                        <div className="text-sm text-green-800">
                          {symptomDetails.strongestInhibitor.biomarker.replace(/_/g, " ")}
                        </div>
                        <div className="text-lg font-bold text-green-900">
                          {symptomDetails.strongestInhibitor.score.toFixed(3)}
                        </div>
                      </div>
                    )}

                    {symptomDetails.strongestPromoter && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm font-medium text-yellow-700 mb-1">Strongest Promoter</div>
                        <div className="text-sm text-yellow-800">
                          {symptomDetails.strongestPromoter.biomarker.replace(/_/g, " ")}
                        </div>
                        <div className="text-lg font-bold text-yellow-900">
                          {symptomDetails.strongestPromoter.score.toFixed(3)}
                        </div>
                      </div>
                    )}

                    {/* Only show Unknown if it exists and is greater than 0 */}
                    {symptomDetails.strongestUnknown && symptomDetails.strongestUnknown.score > 0 && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">Strongest Unknown</div>
                        <div className="text-sm text-gray-800">
                          {symptomDetails.strongestUnknown.biomarker.replace(/_/g, " ")}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {symptomDetails.strongestUnknown.score.toFixed(3)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Top Biomarkers</h5>
                    <div className="space-y-2 max-h-64 overflow-auto">
                      {symptomDetails.biomarkerData.slice(0, 10).map((item, index) => (
                        <div
                          key={item.biomarker}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                        >
                          <div className="flex-1 truncate">
                            <span className="font-medium">{index + 1}. </span>
                            {item.biomarker.replace(/_/g, " ")}
                          </div>
                          <div className="font-semibold text-slate-700">{(item.total_avg || 0).toFixed(3)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Circle Details - Enhanced UI like SymptomInfographic */}
              {selectedCircle && circleDetails && (
                <div className="space-y-6">
                  {/* Header Section */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold mb-2">{circleDetails.biomarker.replace(/_/g, " ")}</h4>
                        <p className="text-blue-100 text-lg mb-3 capitalize">{circleDetails.symptom}</p>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                            {circleDetails.dominantType} Effect
                          </Badge>
                          <span className="text-blue-100">
                            Confidence: {(circleDetails.confidence || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{(circleDetails.total_avg || 0).toFixed(3)}</div>
                        <div className="text-blue-200 text-sm">Total Score</div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Metrics */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-slate-800 mb-4">Effect Breakdown</h5>

                      {circleDetails.avg_inhibitor !== null && circleDetails.avg_inhibitor !== undefined && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <TrendingDown className="h-5 w-5 text-green-600" />
                              <span className="font-medium text-green-800">Antagonist Effect</span>
                            </div>
                            <Badge variant="outline" className="border-green-300 text-green-700">
                              {(circleDetails.percent_inhibitor || 0).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-green-900">
                            {(circleDetails.avg_inhibitor || 0).toFixed(4)}
                          </div>
                          <div className="text-sm text-green-600 mt-1">Suppressive interaction strength</div>
                        </div>
                      )}

                      {circleDetails.avg_promoter !== null && circleDetails.avg_promoter !== undefined && (
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-amber-600" />
                              <span className="font-medium text-amber-800">Agonist Effect</span>
                            </div>
                            <Badge variant="outline" className="border-amber-300 text-amber-700">
                              {(circleDetails.percent_promoter || 0).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="text-2xl font-bold text-amber-900">
                            {(circleDetails.avg_promoter || 0).toFixed(4)}
                          </div>
                          <div className="text-sm text-amber-600 mt-1">Enhancing interaction strength</div>
                        </div>
                      )}

                      {/* Only show Unknown Effect if it's greater than 0 */}
                      {circleDetails.avg_unknown !== null &&
                        circleDetails.avg_unknown !== undefined &&
                        circleDetails.avg_unknown > 0 && (
                          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <HelpCircle className="h-5 w-5 text-gray-600" />
                                <span className="font-medium text-gray-800">Unknown Effect</span>
                              </div>
                              <Badge variant="outline" className="border-gray-300 text-gray-700">
                                {(circleDetails.percent_unknown || 0).toFixed(1)}%
                              </Badge>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {(circleDetails.avg_unknown || 0).toFixed(4)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">Undetermined interaction type</div>
                          </div>
                        )}

                      {/* Clinical Significance */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <h6 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Clinical Significance
                        </h6>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          This <strong>{circleDetails.dominantType.toLowerCase()}</strong> relationship between{" "}
                          <strong>{circleDetails.biomarker.replace(/_/g, " ")}</strong> and{" "}
                          <strong>{circleDetails.symptom}</strong> in the context of <strong>{diseaseName}</strong>{" "}
                          suggests potential therapeutic targets for intervention.
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Additional Information */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold text-slate-800">Interaction Summary</h5>

                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">Biomarker:</span>
                            <span className="text-sm text-slate-900 font-semibold">
                              {circleDetails.biomarker.replace(/_/g, " ")}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">Symptom:</span>
                            <span className="text-sm text-slate-900 font-semibold capitalize">
                              {circleDetails.symptom}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">Disease Context:</span>
                            <span className="text-sm text-slate-900 font-semibold">{diseaseName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">Dominant Effect:</span>
                            <span className="text-sm text-slate-900 font-semibold">{circleDetails.dominantType}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700">Confidence Level:</span>
                            <span className="text-sm text-slate-900 font-semibold">
                              {(circleDetails.confidence || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                        <h6 className="font-semibold text-purple-800 mb-2">Research Implications</h6>
                        <p className="text-sm text-purple-700 leading-relaxed">
                          Understanding this biomarker-symptom relationship could provide insights into disease
                          mechanisms and potential therapeutic interventions for {diseaseName}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Enhanced Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl text-sm pointer-events-none border border-slate-700"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            maxWidth: "320px",
          }}
        >
          <div className="font-bold text-blue-300 mb-1">{tooltip.biomarker.replace(/_/g, " ")}</div>
          <div className="text-slate-300 mb-2 capitalize">{tooltip.symptom}</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total Score:</span>
              <span className="font-semibold">{(tooltip.total_avg || 0).toFixed(4)}</span>
            </div>
            {tooltip.avg_inhibitor !== null && tooltip.avg_inhibitor !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "oklch(0.925 0.084 155.995)" }}></div>
                  <span>Inhibitor:</span>
                </div>
                <span className="font-semibold">
                  {(tooltip.avg_inhibitor || 0).toFixed(4)} ({(tooltip.percent_inhibitor || 0).toFixed(1)}%)
                </span>
              </div>
            )}
            {tooltip.avg_promoter !== null && tooltip.avg_promoter !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "oklch(0.924 0.12 95.746)" }}></div>
                  <span>Promoter:</span>
                </div>
                <span className="font-semibold">
                  {(tooltip.avg_promoter || 0).toFixed(4)} ({(tooltip.percent_promoter || 0).toFixed(1)}%)
                </span>
              </div>
            )}
            {/* Only show Unknown in tooltip if it's greater than 0 */}
            {tooltip.avg_unknown !== null && tooltip.avg_unknown !== undefined && tooltip.avg_unknown > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>Unknown:</span>
                </div>
                <span className="font-semibold">
                  {(tooltip.avg_unknown || 0).toFixed(4)} ({(tooltip.percent_unknown || 0).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "oklch(0.925 0.084 155.995)" }}></div>
            <span className="font-medium">Inhibitor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "oklch(0.924 0.12 95.746)" }}></div>
            <span className="font-medium">Promoter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
            <span className="font-medium">Unknown</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
            <span className="font-medium">No Data</span>
          </div>
          <div className="text-slate-500">
            <Info className="w-4 h-4 inline mr-1" />
            Click symptoms/circles to analyze • Hover for details
          </div>
        </div>
      </div>
    </div>
  )
}

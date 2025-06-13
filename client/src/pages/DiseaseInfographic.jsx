"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Info, TrendingUp, TrendingDown, Activity, ZoomIn, ZoomOut } from "lucide-react"

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
  const CIRCLE_RADIUS = 16
  const cellSize = 60 // Increased cell size for better spacing
  const margin = { top: 180, right: 60, bottom: 80, left: 320 } // Increased margins for labels
  const VISUALIZATION_HEIGHT = 600

  // Scroll to center on initial load
  useEffect(() => {
    if (svgContainerRef.current) {
      const container = svgContainerRef.current
      container.scrollLeft = (1200 * zoomLevel - container.clientWidth) / 2
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

  const width = Math.max(symptoms.length * cellSize + margin.left + margin.right, 1200)
  const height = Math.max(biomarkers.length * cellSize + margin.top + margin.bottom, 800)

  console.log("Total biomarkers:", biomarkers.length)
  console.log("Total symptoms:", symptoms.length)
  console.log("Symptoms:", symptoms)

  // Create gradient for colored circles
  const createGradient = (inhibitorPercent, promoterPercent, id) => (
    <defs key={id}>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" stopOpacity={inhibitorPercent / 100} />
        <stop offset={`${inhibitorPercent}%`} stopColor="#10b981" stopOpacity={inhibitorPercent / 100} />
        <stop offset={`${inhibitorPercent}%`} stopColor="#f59e0b" stopOpacity={promoterPercent / 100} />
        <stop offset="100%" stopColor="#f59e0b" stopOpacity={promoterPercent / 100} />
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
      percent_inhibitor: datum.percent_inhibitor || 0,
      percent_promoter: datum.percent_promoter || 0,
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
      avgTotalScore: 0,
      strongestInhibitor: null,
      strongestPromoter: null,
      biomarkerData: [],
    }

    let totalInhibitor = 0
    let totalPromoter = 0
    let totalScore = 0
    let maxInhibitor = 0
    let maxPromoter = 0

    biomarkers.forEach((biomarker) => {
      const datum = data[biomarker]?.[symptom]
      if (datum) {
        symptomStats.biomarkersWithData++
        totalInhibitor += datum.avg_inhibitor || 0
        totalPromoter += datum.avg_promoter || 0
        totalScore += datum.total_avg || 0

        if ((datum.avg_inhibitor || 0) > maxInhibitor) {
          maxInhibitor = datum.avg_inhibitor || 0
          symptomStats.strongestInhibitor = { biomarker, score: datum.avg_inhibitor || 0 }
        }

        if ((datum.avg_promoter || 0) > maxPromoter) {
          maxPromoter = datum.avg_promoter || 0
          symptomStats.strongestPromoter = { biomarker, score: datum.avg_promoter || 0 }
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
      ...datum,
      // Additional analysis
      dominantType: (datum.percent_inhibitor || 0) > (datum.percent_promoter || 0) ? "Inhibitor" : "Promoter",
      confidence: Math.max(datum.percent_inhibitor || 0, datum.percent_promoter || 0),
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
              {biomarkers.length} biomarkers × {symptoms.length} symptoms
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
                {biomarkers.map((biomarker, biomarkerIndex) =>
                  symptoms.map((symptom, symptomIndex) => {
                    const datum = data[biomarker]?.[symptom]
                    if (!datum) return null
                    const gradientId = `gradient-${biomarkerIndex}-${symptomIndex}`
                    return createGradient(datum.percent_inhibitor || 0, datum.percent_promoter || 0, gradientId)
                  }),
                )}

                {/* Y-axis labels (Biomarkers) */}
                {biomarkers.map((biomarker, index) => (
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
                {symptoms.map((symptom, index) => (
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
                {biomarkers.map((biomarker, biomarkerIndex) =>
                  symptoms.map((symptom, symptomIndex) => {
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
                {biomarkers.map((_, index) => (
                  <line
                    key={`hgrid-${index}`}
                    x1={margin.left - 5}
                    y1={margin.top + index * cellSize}
                    x2={margin.left + symptoms.length * cellSize}
                    y2={margin.top + index * cellSize}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                  />
                ))}
                {symptoms.map((_, index) => (
                  <line
                    key={`vgrid-${index}`}
                    x1={margin.left + index * cellSize}
                    y1={margin.top - 5}
                    x2={margin.left + index * cellSize}
                    y2={margin.top + biomarkers.length * cellSize}
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

              {/* Circle Details */}
              {selectedCircle && circleDetails && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-1">
                        {circleDetails.biomarker.replace(/_/g, " ")}
                      </h4>
                      <p className="text-sm text-slate-600 mb-3 capitalize">{circleDetails.symptom}</p>

                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <div className="text-sm text-blue-700 font-medium">Dominant Effect</div>
                        <div className="text-lg font-bold text-blue-800">
                          {circleDetails.dominantType} ({circleDetails.confidence.toFixed(1)}%)
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="text-sm text-slate-600">Total Average Score</div>
                        <div className="text-xl font-bold text-slate-800">
                          {(circleDetails.total_avg || 0).toFixed(4)}
                        </div>
                      </div>

                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-700">Inhibitor Effect</div>
                        <div className="text-lg font-bold text-green-800">
                          {(circleDetails.avg_inhibitor || 0).toFixed(4)} (
                          {(circleDetails.percent_inhibitor || 0).toFixed(1)}%)
                        </div>
                      </div>

                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm font-medium text-yellow-700">Promoter Effect</div>
                        <div className="text-lg font-bold text-yellow-800">
                          {(circleDetails.avg_promoter || 0).toFixed(4)} (
                          {(circleDetails.percent_promoter || 0).toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">Clinical Significance</h5>
                    <p className="text-sm text-blue-700">
                      This {circleDetails.dominantType.toLowerCase()} relationship between{" "}
                      <strong>{circleDetails.biomarker.replace(/_/g, " ")}</strong> and{" "}
                      <strong>{circleDetails.symptom}</strong> suggests potential therapeutic implications.
                    </p>
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
            maxWidth: "300px",
          }}
        >
          <div className="font-bold text-blue-300 mb-1">{tooltip.biomarker.replace(/_/g, " ")}</div>
          <div className="text-slate-300 mb-2 capitalize">{tooltip.symptom}</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total Score:</span>
              <span className="font-semibold">{(tooltip.total_avg || 0).toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Inhibitor:</span>
              </div>
              <span className="font-semibold">
                {(tooltip.avg_inhibitor || 0).toFixed(4)} ({(tooltip.percent_inhibitor || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Promoter:</span>
              </div>
              <span className="font-semibold">
                {(tooltip.avg_promoter || 0).toFixed(4)} ({(tooltip.percent_promoter || 0).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="font-medium">Inhibitor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="font-medium">Promoter</span>
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

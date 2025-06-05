"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  X,
  Info,
  TrendingUp,
  TrendingDown,
  Activity,
  HelpCircle,
  BarChart3,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react"

export default function SymptomInfographic() {
  const location = useLocation()
  const { symptomData, disease } = location.state || {}
  const [tooltip, setTooltip] = useState(null)
  const [selectedDisease, setSelectedDisease] = useState(null)
  const [diseaseDetails, setDiseaseDetails] = useState(null)
  const [selectedCircle, setSelectedCircle] = useState(null)
  const [circleDetails, setCircleDetails] = useState(null)
  const [activeTab, setActiveTab] = useState("matrix")
  const [zoomLevel, setZoomLevel] = useState(1)
  const svgContainerRef = useRef(null)

  // Fixed circle size
  const CIRCLE_RADIUS = 16
  const cellSize = 60 // Increased cell size for better spacing
  const margin = { top: 180, right: 60, bottom: 80, left: 320 } // Increased margins for labels

  // Fixed height for scrollable visualization
  const VISUALIZATION_HEIGHT = 600
  const biomarkers = Object.keys(symptomData?.nested_assoc || {})
  const diseases = Array.from(
    new Set(biomarkers.flatMap((biomarker) => Object.keys(symptomData?.nested_assoc[biomarker] || {}))),
  ).sort()

  console.log("Total biomarkers:", biomarkers.length)
  console.log("Total diseases:", diseases.length)
  console.log("Diseases:", diseases)

  const width = Math.max(diseases.length * cellSize + margin.left + margin.right, 1200)
  const height = biomarkers.length * cellSize + margin.top + margin.bottom

  // Scroll to center on initial load
  useEffect(() => {
    if (svgContainerRef.current) {
      const container = svgContainerRef.current
      container.scrollLeft = (width * zoomLevel - container.clientWidth) / 2
    }
  }, [width, zoomLevel])

  // Show error message if no data is available
  if (!symptomData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <Activity className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">No Data Available</h2>
            <p className="text-slate-600 mt-2">Please navigate here with valid symptom data.</p>
          </div>
        </Card>
      </div>
    )
  }

  const { nested_assoc: data, plots, symptom } = symptomData

  // Create gradient for colored circles (inhibitor, promoter, unknown)
  const createGradient = (inhibitorPercent, promoterPercent, unknownPercent, id) => (
    <defs key={id}>
      <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#10b981" stopOpacity={inhibitorPercent / 100} />
        <stop offset={`${inhibitorPercent}%`} stopColor="#10b981" stopOpacity={inhibitorPercent / 100} />
        <stop offset={`${inhibitorPercent}%`} stopColor="#f59e0b" stopOpacity={promoterPercent / 100} />
        <stop
          offset={`${inhibitorPercent + promoterPercent}%`}
          stopColor="#f59e0b"
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

  // Handle mouse events for tooltip
  const handleMouseEnter = (biomarker, disease, datum, event) => {
    if (!datum) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      biomarker,
      disease,
      total_avg: datum.total_avg,
      avg_inhibitor: datum.avg_inhibitor,
      avg_promoter: datum.avg_promoter,
      avg_unknown: datum.avg_unknown,
      percent_inhibitor: datum.percent_inhibitor,
      percent_promoter: datum.percent_promoter,
      percent_unknown: datum.percent_unknown,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleMouseLeave = () => {
    setTooltip(null)
  }

  // Handle disease click
  const handleDiseaseClick = (disease) => {
    setSelectedDisease(disease)

    // Calculate statistics for this disease across all biomarkers
    const diseaseStats = {
      disease,
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
      const datum = data[biomarker]?.[disease]
      if (datum) {
        diseaseStats.biomarkersWithData++
        totalInhibitor += datum.avg_inhibitor || 0
        totalPromoter += datum.avg_promoter || 0
        totalUnknown += datum.avg_unknown || 0
        totalScore += datum.total_avg

        if ((datum.avg_inhibitor || 0) > maxInhibitor) {
          maxInhibitor = datum.avg_inhibitor || 0
          diseaseStats.strongestInhibitor = { biomarker, score: datum.avg_inhibitor }
        }

        if ((datum.avg_promoter || 0) > maxPromoter) {
          maxPromoter = datum.avg_promoter || 0
          diseaseStats.strongestPromoter = { biomarker, score: datum.avg_promoter }
        }

        if ((datum.avg_unknown || 0) > maxUnknown) {
          maxUnknown = datum.avg_unknown || 0
          diseaseStats.strongestUnknown = { biomarker, score: datum.avg_unknown }
        }

        diseaseStats.biomarkerData.push({
          biomarker,
          ...datum,
        })
      }
    })

    if (diseaseStats.biomarkersWithData > 0) {
      diseaseStats.avgInhibitorScore = totalInhibitor / diseaseStats.biomarkersWithData
      diseaseStats.avgPromoterScore = totalPromoter / diseaseStats.biomarkersWithData
      diseaseStats.avgUnknownScore = totalUnknown / diseaseStats.biomarkersWithData
      diseaseStats.avgTotalScore = totalScore / diseaseStats.biomarkersWithData
    }

    // Sort biomarker data by total score
    diseaseStats.biomarkerData.sort((a, b) => b.total_avg - a.total_avg)

    setDiseaseDetails(diseaseStats)
  }

  // Handle circle click
  const handleCircleClick = (biomarker, disease, datum) => {
    if (!datum) return

    setSelectedCircle({ biomarker, disease })
    setCircleDetails({
      biomarker,
      disease,
      symptom,
      ...datum,
      // Additional analysis
      dominantType:
        datum.percent_inhibitor > datum.percent_promoter && datum.percent_inhibitor > datum.percent_unknown
          ? "Inhibitor"
          : datum.percent_promoter > datum.percent_unknown
            ? "Promoter"
            : "Unknown",
      confidence: Math.max(datum.percent_inhibitor, datum.percent_promoter, datum.percent_unknown),
    })
  }

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.6))
  }

  // Download image
  const downloadPlot = (plotType, base64Data) => {
    const link = document.createElement("a")
    link.href = `data:image/png;base64,${base64Data}`
    link.download = `${symptom}_${plotType}_plot.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Biomarker-Disease Association Matrix</h1>
            <p className="text-slate-600 mt-1">
              Symptom analysis for:{" "}
              <Badge variant="outline" className="ml-2 font-semibold capitalize">
                {symptom}
              </Badge>
            </p>
          </div>
          <div className="text-sm text-slate-500">
            {biomarkers.length} biomarkers × {diseases.length} diseases
          </div>
        </div>
      </div>

      {/* Tabs for Matrix and Plots */}
      <div className="p-4">
        <Tabs defaultValue="matrix" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="matrix" className="px-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Association Matrix</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="plots" className="px-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analysis Plots</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {activeTab === "matrix" && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.6}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium text-slate-600">{Math.round(zoomLevel * 100)}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="matrix" className="mt-0">
            <div className="flex h-[calc(100vh-220px)]">
              {/* Main Visualization */}
              <div className="flex-1 overflow-hidden">
                <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-auto h-full">
                  <div ref={svgContainerRef} className="overflow-auto" style={{ height: "100%", width: "100%" }}>
                    <svg
                      width={width * zoomLevel}
                      height={height * zoomLevel}
                      viewBox={`0 0 ${width} ${height}`}
                      preserveAspectRatio="xMinYMin meet"
                    >
                      {/* Create gradients for all data points */}
                      {biomarkers.map((biomarker, biomarkerIndex) =>
                        diseases.map((disease, diseaseIndex) => {
                          const datum = data[biomarker]?.[disease]
                          if (!datum) return null
                          const gradientId = `gradient-${biomarkerIndex}-${diseaseIndex}`
                          return createGradient(
                            datum.percent_inhibitor,
                            datum.percent_promoter,
                            datum.percent_unknown,
                            gradientId,
                          )
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

                      {/* X-axis labels (Diseases) - positioned at top with better spacing */}
                      {diseases.map((disease, index) => (
                        <g key={disease}>
                          <text
                            x={margin.left + index * cellSize + cellSize / 2}
                            y={margin.top - 40}
                            textAnchor="start"
                            dominantBaseline="middle"
                            className="text-sm font-semibold fill-slate-700 hover:fill-blue-600 cursor-pointer transition-colors"
                            transform={`rotate(-45, ${margin.left + index * cellSize + cellSize / 2}, ${
                              margin.top - 40
                            })`}
                            onClick={() => handleDiseaseClick(disease)}
                          >
                            {disease}
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

                      {/* Complete matrix - show circle for EVERY biomarker-disease combination */}
                      {biomarkers.map((biomarker, biomarkerIndex) =>
                        diseases.map((disease, diseaseIndex) => {
                          const datum = data[biomarker]?.[disease]
                          const cx = margin.left + diseaseIndex * cellSize + cellSize / 2
                          const cy = margin.top + biomarkerIndex * cellSize + cellSize / 2

                          if (datum) {
                            // Show colored circle with data - FIXED SIZE
                            const gradientId = `gradient-${biomarkerIndex}-${diseaseIndex}`

                            return (
                              <circle
                                key={`${biomarker}-${disease}-data`}
                                cx={cx}
                                cy={cy}
                                r={CIRCLE_RADIUS}
                                fill={`url(#${gradientId})`}
                                stroke="#374151"
                                strokeWidth="1.5"
                                className="cursor-pointer hover:stroke-2 hover:stroke-blue-500 transition-all"
                                onMouseEnter={(e) => handleMouseEnter(biomarker, disease, datum, e)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => handleCircleClick(biomarker, disease, datum)}
                              />
                            )
                          } else {
                            // Show grey circle for missing data - FIXED SIZE
                            return (
                              <circle
                                key={`${biomarker}-${disease}-empty`}
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
                          x2={margin.left + diseases.length * cellSize}
                          y2={margin.top + index * cellSize}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                        />
                      ))}
                      {diseases.map((_, index) => (
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

              {/* Side Panel for Disease/Circle Details */}
              {(selectedDisease && diseaseDetails) || (selectedCircle && circleDetails) ? (
                <div className="w-96 bg-white border-l border-slate-200 overflow-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-800">
                        {selectedDisease ? "Disease Analysis" : "Interaction Details"}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDisease(null)
                          setDiseaseDetails(null)
                          setSelectedCircle(null)
                          setCircleDetails(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Disease Details */}
                    {selectedDisease && diseaseDetails && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-2">{selectedDisease}</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <div className="text-slate-500">Coverage</div>
                              <div className="font-semibold">
                                {diseaseDetails.biomarkersWithData}/{diseaseDetails.totalBiomarkers}
                              </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <div className="text-slate-500">Avg Score</div>
                              <div className="font-semibold">{diseaseDetails.avgTotalScore.toFixed(3)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <TrendingDown className="h-4 w-4 text-green-600" />
                            <div className="flex-1">
                              <div className="text-sm text-green-700 font-medium">Avg Inhibitor Score</div>
                              <div className="text-lg font-bold text-green-800">
                                {diseaseDetails.avgInhibitorScore.toFixed(3)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                            <TrendingUp className="h-4 w-4 text-yellow-600" />
                            <div className="flex-1">
                              <div className="text-sm text-yellow-700 font-medium">Avg Promoter Score</div>
                              <div className="text-lg font-bold text-yellow-800">
                                {diseaseDetails.avgPromoterScore.toFixed(3)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                            <HelpCircle className="h-4 w-4 text-gray-600" />
                            <div className="flex-1">
                              <div className="text-sm text-gray-700 font-medium">Avg Unknown Score</div>
                              <div className="text-lg font-bold text-gray-800">
                                {diseaseDetails.avgUnknownScore.toFixed(3)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-slate-700 mb-2">Top Biomarkers</h5>
                          <div className="space-y-2 max-h-64 overflow-auto">
                            {diseaseDetails.biomarkerData.slice(0, 10).map((item, index) => (
                              <div
                                key={item.biomarker}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                              >
                                <div className="flex-1 truncate">
                                  <span className="font-medium">{index + 1}. </span>
                                  {item.biomarker.replace(/_/g, " ")}
                                </div>
                                <div className="font-semibold text-slate-700">{item.total_avg.toFixed(3)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Circle Details */}
                    {selectedCircle && circleDetails && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-700 mb-1">
                            {circleDetails.biomarker.replace(/_/g, " ")}
                          </h4>
                          <p className="text-sm text-slate-600 mb-3">{circleDetails.disease}</p>

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
                            <div className="text-xl font-bold text-slate-800">{circleDetails.total_avg.toFixed(4)}</div>
                          </div>

                          {circleDetails.avg_inhibitor !== null && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="text-sm font-medium text-green-700">Inhibitor Effect</div>
                              <div className="text-lg font-bold text-green-800">
                                {circleDetails.avg_inhibitor.toFixed(4)} ({circleDetails.percent_inhibitor.toFixed(1)}%)
                              </div>
                            </div>
                          )}

                          {circleDetails.avg_promoter !== null && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="text-sm font-medium text-yellow-700">Promoter Effect</div>
                              <div className="text-lg font-bold text-yellow-800">
                                {circleDetails.avg_promoter.toFixed(4)} ({circleDetails.percent_promoter.toFixed(1)}%)
                              </div>
                            </div>
                          )}

                          {circleDetails.avg_unknown !== null && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <div className="text-sm font-medium text-gray-700">Unknown Effect</div>
                              <div className="text-lg font-bold text-gray-800">
                                {circleDetails.avg_unknown.toFixed(4)} ({circleDetails.percent_unknown.toFixed(1)}%)
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-2">Clinical Significance</h5>
                          <p className="text-sm text-blue-700">
                            This {circleDetails.dominantType.toLowerCase()} relationship between{" "}
                            <strong>{circleDetails.biomarker.replace(/_/g, " ")}</strong> and{" "}
                            <strong>{circleDetails.disease}</strong> in the context of{" "}
                            <strong>{circleDetails.symptom}</strong> suggests potential therapeutic targets.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="plots" className="mt-0">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Statistical Analysis Plots</h3>
              <div className="grid grid-cols-1 gap-8">
                {plots &&
                  Object.entries(plots).map(([plotType, base64Data]) => (
                    <Card key={plotType} className="overflow-hidden">
                      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                        <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          {plotType} Analysis for "{symptom}"
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadPlot(plotType, base64Data)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </Button>
                      </div>
                      <div className="p-4 flex justify-center bg-white">
                        <div className="max-w-full overflow-x-auto">
                          <img
                            src={`data:image/png;base64,${base64Data}`}
                            alt={`${plotType} plot for ${symptom}`}
                            className="max-w-none h-auto"
                            onError={(e) => {
                              e.target.style.display = "none"
                              e.target.nextSibling.style.display = "block"
                            }}
                          />
                          <div className="hidden text-center text-slate-500 py-16 px-8">
                            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Plot data unavailable or could not be rendered</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 border-t border-slate-200">
                        <p className="text-sm text-slate-600">
                          This plot shows the {plotType.toLowerCase()} relationship between biomarkers and diseases for
                          the symptom "{symptom}". Each bar represents a biomarker's score, stacked by disease.
                        </p>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
          <div className="text-slate-300 mb-2">{tooltip.disease}</div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Total Score:</span>
              <span className="font-semibold">{tooltip.total_avg.toFixed(4)}</span>
            </div>
            {tooltip.avg_inhibitor !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Inhibitor:</span>
                </div>
                <span className="font-semibold">
                  {tooltip.avg_inhibitor.toFixed(4)} ({tooltip.percent_inhibitor.toFixed(1)}%)
                </span>
              </div>
            )}
            {tooltip.avg_promoter !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Promoter:</span>
                </div>
                <span className="font-semibold">
                  {tooltip.avg_promoter.toFixed(4)} ({tooltip.percent_promoter.toFixed(1)}%)
                </span>
              </div>
            )}
            {tooltip.avg_unknown !== null && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded"></div>
                  <span>Unknown:</span>
                </div>
                <span className="font-semibold">
                  {tooltip.avg_unknown.toFixed(4)} ({tooltip.percent_unknown.toFixed(1)}%)
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
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="font-medium">Inhibitor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
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
            Click diseases/circles to analyze • Hover for details
          </div>
        </div>
      </div>
    </div>
  )
}

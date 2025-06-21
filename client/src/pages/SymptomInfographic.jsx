// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useLocation } from "react-router-dom"
// import { Card } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Slider } from "@/components/ui/slider"
// import { Switch } from "@/components/ui/switch"
// import {
//   X,
//   Info,
//   TrendingUp,
//   TrendingDown,
//   Activity,
//   HelpCircle,
//   BarChart3,
//   ZoomIn,
//   ZoomOut,
//   Loader2,
//   Network,
//   RotateCcw,
//   ChevronDown,
//   ChevronUp,
//   Filter,
//   Search,
//   Settings,
//   Eye,
//   Maximize2,
//   Minimize2,
// } from "lucide-react"
// import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import * as d3 from "d3"

// // Top Biomarkers Bar Chart Component
// const TopBiomarkersChart = ({ data, symptom, width = 800, height = 300 }) => {
//   const svgRef = useRef(null)

//   useEffect(() => {
//     if (!data || Object.keys(data).length === 0) return

//     // Calculate top promoters and inhibitors
//     const biomarkerScores = []

//     Object.keys(data).forEach((biomarker) => {
//       Object.keys(data[biomarker]).forEach((disease) => {
//         const datum = data[biomarker][disease]
//         if (datum) {
//           const inhibitorScore = -(datum.avg_inhibitor || 0) // Negative for left side
//           const promoterScore = datum.avg_promoter || 0 // Positive for right side

//           if (inhibitorScore < 0) {
//             biomarkerScores.push({
//               biomarker: biomarker.replace(/_/g, " "),
//               score: inhibitorScore,
//               type: "inhibitor",
//               disease: disease,
//             })
//           }

//           if (promoterScore > 0) {
//             biomarkerScores.push({
//               biomarker: biomarker.replace(/_/g, " "),
//               score: promoterScore,
//               type: "promoter",
//               disease: disease,
//             })
//           }
//         }
//       })
//     })

//     // Get top 5 inhibitors and promoters
//     const topInhibitors = biomarkerScores
//       .filter((d) => d.type === "inhibitor")
//       .sort((a, b) => a.score - b.score) // Most negative first
//       .slice(0, 5)

//     const topPromoters = biomarkerScores
//       .filter((d) => d.type === "promoter")
//       .sort((a, b) => b.score - a.score) // Highest positive first
//       .slice(0, 5)

//     // Combine and create unique biomarker list
//     const allTopBiomarkers = [...topInhibitors, ...topPromoters]
//     const uniqueBiomarkers = Array.from(new Set(allTopBiomarkers.map((d) => d.biomarker)))
//       .map((biomarker) => {
//         const inhibitor = topInhibitors.find((d) => d.biomarker === biomarker)
//         const promoter = topPromoters.find((d) => d.biomarker === biomarker)
//         return {
//           biomarker,
//           inhibitorScore: inhibitor ? inhibitor.score : 0,
//           promoterScore: promoter ? promoter.score : 0,
//         }
//       })
//       .slice(0, 7) // Show top 7 biomarkers

//     if (uniqueBiomarkers.length === 0) return

//     const svg = d3.select(svgRef.current)
//     svg.selectAll("*").remove()

//     const margin = { top: 40, right: 60, bottom: 60, left: 400 } // Increased from 120 to 180
//     const chartWidth = width - margin.left - margin.right
//     const chartHeight = height - margin.top - margin.bottom

//     const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

//     // Scales
//     const yScale = d3
//       .scaleBand()
//       .domain(uniqueBiomarkers.map((d) => d.biomarker))
//       .range([0, chartHeight])
//       .padding(0.2)

//     const maxAbsScore = d3.max(uniqueBiomarkers, (d) => Math.max(Math.abs(d.inhibitorScore), Math.abs(d.promoterScore)))

//     const xScale = d3
//       .scaleLinear()
//       .domain([-maxAbsScore * 1.1, maxAbsScore * 1.1])
//       .range([0, chartWidth])

//     // Add title
//     svg
//       .append("text")
//       .attr("x", width / 2)
//       .attr("y", 25)
//       .attr("text-anchor", "middle")
//       .attr("font-size", "16px")
//       .attr("font-weight", "bold")
//       .attr("fill", "#1f2937")
//       .text(`Top Agonist and Antagonist for ${symptom}`)

//     // Add center line
//     g.append("line")
//       .attr("x1", xScale(0))
//       .attr("x2", xScale(0))
//       .attr("y1", 0)
//       .attr("y2", chartHeight)
//       .attr("stroke", "#6b7280")
//       .attr("stroke-width", 2)
//       .attr("stroke-dasharray", "3,3")

//     // Add inhibitor bars (negative, orange)
//     g.selectAll(".inhibitor-bar")
//       .data(uniqueBiomarkers.filter((d) => d.inhibitorScore < 0))
//       .enter()
//       .append("rect")
//       .attr("class", "inhibitor-bar")
//       .attr("x", (d) => xScale(d.inhibitorScore))
//       .attr("y", (d) => yScale(d.biomarker))
//       .attr("width", (d) => xScale(0) - xScale(d.inhibitorScore))
//       .attr("height", yScale.bandwidth())
//       .attr("fill", "#fb923c")
//       .attr("opacity", 0.8)

//     // Add promoter bars (positive, yellow)
//     g.selectAll(".promoter-bar")
//       .data(uniqueBiomarkers.filter((d) => d.promoterScore > 0))
//       .enter()
//       .append("rect")
//       .attr("class", "promoter-bar")
//       .attr("x", xScale(0))
//       .attr("y", (d) => yScale(d.biomarker))
//       .attr("width", (d) => xScale(d.promoterScore) - xScale(0))
//       .attr("height", yScale.bandwidth())
//       .attr("fill", "#fbbf24")
//       .attr("opacity", 0.8)

//     // Add Y axis
//     g.append("g").call(d3.axisLeft(yScale)).selectAll("text").attr("font-size", "12px").attr("fill", "#374151")

//     // Add X axis
//     g.append("g")
//       .attr("transform", `translate(0,${chartHeight})`)
//       .call(d3.axisBottom(xScale).tickFormat(d3.format(".2f")))
//       .selectAll("text")
//       .attr("font-size", "11px")
//       .attr("fill", "#6b7280")

//     // Add X axis label
//     svg
//       .append("text")
//       .attr("x", width / 2)
//       .attr("y", height - 10)
//       .attr("text-anchor", "middle")
//       .attr("font-size", "12px")
//       .attr("fill", "#6b7280")
//       .text("Association Score")

//     // Add legend
//     const legend = svg.append("g").attr("transform", `translate(${width - 50}, 50)`)

//     legend
//       .append("rect")
//       .attr("x", 0)
//       .attr("y", 0)
//       .attr("width", 15)
//       .attr("height", 15)
//       .attr("fill", "#fb923c")
//       .attr("opacity", 0.8)

//     legend
//       .append("text")
//       .attr("x", 20)
//       .attr("y", 12)
//       .attr("font-size", "11px")
//       .attr("fill", "#374151")
//       .text("Antagonist")

//     legend
//       .append("rect")
//       .attr("x", 0)
//       .attr("y", 25)
//       .attr("width", 15)
//       .attr("height", 15)
//       .attr("fill", "#fbbf24")
//       .attr("opacity", 0.8)

//     legend.append("text").attr("x", 20).attr("y", 37).attr("font-size", "11px").attr("fill", "#374151").text("Agonist")
//   }, [data, symptom, width, height])

//   return (
//     <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
//       <svg ref={svgRef} width={width + 200} height={height} />
//     </div>
//   )
// }

// // Enhanced Network Chart Component with much better readability
// const NetworkChart = ({ data, width = 1000, height = 700 }) => {
//   const svgRef = useRef(null)
//   const [allNodes, setAllNodes] = useState([])
//   const [allLinks, setAllLinks] = useState([])
//   const [filteredNodes, setFilteredNodes] = useState([])
//   const [filteredLinks, setFilteredLinks] = useState([])
//   const [simulation, setSimulation] = useState(null)
//   const [selectedNode, setSelectedNode] = useState(null)
//   const [selectedNetworkDisease, setSelectedNetworkDisease] = useState(null)
//   const [isFiltersOpen, setIsFiltersOpen] = useState(false)
//   const [isFullscreen, setIsFullscreen] = useState(false)

//   // Enhanced filter states
//   const [selectedDisease, setSelectedDisease] = useState("")
//   const [selectedBiomarker, setSelectedBiomarker] = useState("")
//   const [connectionType, setConnectionType] = useState("all")
//   const [strengthThreshold, setStrengthThreshold] = useState([0])
//   const [showOnlyConnected, setShowOnlyConnected] = useState(true)
//   const [nodeSearchTerm, setNodeSearchTerm] = useState("")

//   // New layout and visualization controls
//   const [layoutType, setLayoutType] = useState("force") // force, circular, hierarchical
//   const [nodeSpacing, setNodeSpacing] = useState([150]) // Increased default spacing
//   const [edgeBundling, setEdgeBundling] = useState(false)
//   const [showLabels, setShowLabels] = useState(true)
//   const [labelThreshold, setLabelThreshold] = useState([2]) // Only show labels for nodes with >= connections
//   const [clusterSimilar, setClusterSimilar] = useState(true)
//   const [highlightMode, setHighlightMode] = useState("neighbors") // neighbors, path, none

//   // Initialize nodes and links from data
//   useEffect(() => {
//     if (!data || Object.keys(data).length === 0) {
//       console.log("No data provided to NetworkChart")
//       return
//     }

//     console.log("Processing network data:", data)

//     const biomarkers = Object.keys(data)
//     const diseases = Array.from(new Set(biomarkers.flatMap((biomarker) => Object.keys(data[biomarker] || {}))))

//     console.log("Found biomarkers:", biomarkers.length, "diseases:", diseases.length)

//     // Create nodes with enhanced properties
//     const newNodes = []

//     // Add biomarker nodes
//     biomarkers.forEach((biomarker) => {
//       const connections = diseases.filter((disease) => data[biomarker]?.[disease]?.total_avg > 0).length
//       const totalStrength = diseases.reduce((sum, disease) => {
//         const datum = data[biomarker]?.[disease]
//         return sum + (datum?.total_avg || 0)
//       }, 0)

//       const node = {
//         id: biomarker,
//         type: "biomarker",
//         name: biomarker.replace(/_/g, " "),
//         connections: connections,
//         totalStrength: totalStrength,
//         importance: connections * totalStrength, // Combined metric for importance
//         group: Math.floor(connections / 3), // Group for clustering
//       }
//       newNodes.push(node)
//     })

//     // Add disease nodes
//     diseases.forEach((disease) => {
//       const connections = biomarkers.filter((biomarker) => data[biomarker]?.[disease]?.total_avg > 0).length
//       const totalStrength = biomarkers.reduce((sum, biomarker) => {
//         const datum = data[biomarker]?.[disease]
//         return sum + (datum?.total_avg || 0)
//       }, 0)

//       const node = {
//         id: disease,
//         type: "disease",
//         name: disease,
//         connections: connections,
//         totalStrength: totalStrength,
//         importance: connections * totalStrength,
//         group: Math.floor(connections / 3) + 10, // Offset disease groups
//       }
//       newNodes.push(node)
//     })

//     // Create links with improved edge type detection
//     const newLinks = []
//     biomarkers.forEach((biomarker) => {
//       diseases.forEach((disease) => {
//         const datum = data[biomarker]?.[disease]
//         if (datum && datum.total_avg > 0) {
//           let edgeType = "unknown"
//           const inhibitorScore = datum.avg_inhibitor || 0
//           const promoterScore = datum.avg_promoter || 0
//           const unknownScore = datum.avg_unknown || 0

//           if (inhibitorScore > promoterScore && inhibitorScore > unknownScore && inhibitorScore > 0.001) {
//             edgeType = "inhibitor"
//           } else if (promoterScore > unknownScore && promoterScore > 0.001) {
//             edgeType = "promoter"
//           } else if (unknownScore > 0.001) {
//             edgeType = "unknown"
//           }

//           const strength = datum.total_avg
//           const link = {
//             source: biomarker,
//             target: disease,
//             type: edgeType,
//             strength: strength,
//             width: Math.max(1, Math.min(8, strength * 20)), // Increased max width
//             data: datum,
//             importance: strength * 10, // For edge filtering
//           }

//           newLinks.push(link)
//         }
//       })
//     })

//     console.log("Created nodes:", newNodes.length, "links:", newLinks.length)
//     setAllNodes(newNodes)
//     setAllLinks(newLinks)
//   }, [data])

//   // Enhanced filtering with search
//   useEffect(() => {
//     if (!allNodes.length || !allLinks.length) {
//       return
//     }

//     let filteredLinkSet = [...allLinks]
//     let filteredNodeSet = [...allNodes]

//     // Helper function to get source/target ID from link
//     const getSourceId = (link) => (typeof link.source === "object" ? link.source.id : link.source)
//     const getTargetId = (link) => (typeof link.target === "object" ? link.target.id : link.target)

//     // Filter by search term
//     if (nodeSearchTerm) {
//       const searchLower = nodeSearchTerm.toLowerCase()
//       const matchingNodeIds = new Set(
//         filteredNodeSet.filter((node) => node.name.toLowerCase().includes(searchLower)).map((node) => node.id),
//       )

//       // Keep links that connect to matching nodes
//       filteredLinkSet = filteredLinkSet.filter(
//         (link) => matchingNodeIds.has(getSourceId(link)) || matchingNodeIds.has(getTargetId(link)),
//       )
//     }

//     // Filter by selected disease
//     if (selectedDisease) {
//       filteredLinkSet = filteredLinkSet.filter((link) => {
//         const targetId = getTargetId(link)
//         return targetId === selectedDisease
//       })
//     }

//     // Filter by selected biomarker
//     if (selectedBiomarker) {
//       filteredLinkSet = filteredLinkSet.filter((link) => {
//         const sourceId = getSourceId(link)
//         return sourceId === selectedBiomarker
//       })
//     }

//     // Filter by connection type
//     if (connectionType !== "all") {
//       filteredLinkSet = filteredLinkSet.filter((link) => link.type === connectionType)
//     }

//     // Filter by strength threshold
//     if (strengthThreshold[0] > 0) {
//       filteredLinkSet = filteredLinkSet.filter((link) => link.strength >= strengthThreshold[0])
//     }

//     // Filter nodes based on connections
//     if (showOnlyConnected) {
//       const connectedNodeIds = new Set()
//       filteredLinkSet.forEach((link) => {
//         connectedNodeIds.add(getSourceId(link))
//         connectedNodeIds.add(getTargetId(link))
//       })
//       filteredNodeSet = filteredNodeSet.filter((node) => connectedNodeIds.has(node.id))
//     }

//     // Apply search filter to nodes
//     if (nodeSearchTerm) {
//       const searchLower = nodeSearchTerm.toLowerCase()
//       const relevantNodeIds = new Set()

//       // Add directly matching nodes
//       filteredNodeSet.forEach((node) => {
//         if (node.name.toLowerCase().includes(searchLower)) {
//           relevantNodeIds.add(node.id)
//         }
//       })

//       // Add connected nodes
//       filteredLinkSet.forEach((link) => {
//         const sourceId = getSourceId(link)
//         const targetId = getTargetId(link)
//         if (relevantNodeIds.has(sourceId)) relevantNodeIds.add(targetId)
//         if (relevantNodeIds.has(targetId)) relevantNodeIds.add(sourceId)
//       })

//       filteredNodeSet = filteredNodeSet.filter((node) => relevantNodeIds.has(node.id))
//     }

//     console.log("Final filtered results:", {
//       nodes: filteredNodeSet.length,
//       links: filteredLinkSet.length,
//     })

//     setFilteredNodes(filteredNodeSet)
//     setFilteredLinks(filteredLinkSet)
//   }, [
//     allNodes,
//     allLinks,
//     connectionType,
//     strengthThreshold,
//     selectedDisease,
//     selectedBiomarker,
//     showOnlyConnected,
//     nodeSearchTerm,
//   ])

//   // Enhanced D3 visualization with better layout
//   useEffect(() => {
//     if (!filteredNodes.length || !svgRef.current) {
//       return
//     }

//     const svg = d3.select(svgRef.current)
//     svg.selectAll("*").remove()

//     // Helper functions
//     const getSourceId = (d) => (typeof d.source === "object" ? d.source.id : d.source)
//     const getTargetId = (d) => (typeof d.target === "object" ? d.target.id : d.target)

//     // Create zoom behavior
//     const zoom = d3
//       .zoom()
//       .scaleExtent([0.1, 4])
//       .on("zoom", (event) => {
//         g.attr("transform", event.transform)
//       })

//     svg.call(zoom)

//     const g = svg.append("g")

//     // Enhanced highlighting logic
//     const isHighlighted = (nodeId) => {
//       if (!selectedNetworkDisease) return true

//       if (highlightMode === "neighbors") {
//         return (
//           nodeId === selectedNetworkDisease ||
//           filteredLinks.some(
//             (link) =>
//               (getSourceId(link) === nodeId && getTargetId(link) === selectedNetworkDisease) ||
//               (getTargetId(link) === nodeId && getSourceId(link) === selectedNetworkDisease),
//           )
//         )
//       }

//       return nodeId === selectedNetworkDisease
//     }

//     const isLinkHighlighted = (link) => {
//       if (!selectedNetworkDisease) return true
//       const sourceId = getSourceId(link)
//       const targetId = getTargetId(link)
//       return sourceId === selectedNetworkDisease || targetId === selectedNetworkDisease
//     }

//     // Create links with enhanced styling
//     const linkGroup = g.append("g").attr("class", "links")
//     const link = linkGroup
//       .selectAll("line")
//       .data(filteredLinks, (d) => `${getSourceId(d)}-${getTargetId(d)}`)
//       .enter()
//       .append("line")
//       .attr("stroke", (d) => {
//         switch (d.type) {
//           case "inhibitor":
//             return "#10b981" // Better green
//           case "promoter":
//             return "#f59e0b" // Better amber
//           default:
//             return "#6b7280"
//         }
//       })
//       .attr("stroke-width", (d) => Math.max(1, d.width * 0.8)) // Slightly thinner
//       .attr("stroke-opacity", (d) => (isLinkHighlighted(d) ? 0.8 : 0.15)) // Better contrast
//       .style("cursor", "pointer")
//       .on("mouseover", function (event, d) {
//         d3.select(this)
//           .attr("stroke-opacity", 1)
//           .attr("stroke-width", d.width + 2)

//         // Enhanced tooltip
//         const tooltip = d3
//           .select("body")
//           .append("div")
//           .attr("class", "network-tooltip")
//           .style("position", "absolute")
//           .style("background", "rgba(0, 0, 0, 0.95)")
//           .style("color", "white")
//           .style("padding", "12px")
//           .style("border-radius", "8px")
//           .style("font-size", "12px")
//           .style("pointer-events", "none")
//           .style("z-index", "1000")
//           .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
//           .html(`
//             <div class="font-bold text-blue-300 mb-2">${typeof d.source === "object" ? d.source.name || d.source.id : d.source} → ${typeof d.target === "object" ? d.target.name || d.target.id : d.target}</div>
//             <div class="space-y-1">
//               <div>Type: <span class="font-semibold">${d.type.charAt(0).toUpperCase() + d.type.slice(1)}</span></div>
//               <div>Strength: <span class="font-semibold">${d.strength.toFixed(4)}</span></div>
//               <div>Inhibitor: <span class="font-semibold">${(d.data.avg_inhibitor || 0).toFixed(4)}</span></div>
//               <div>Promoter: <span class="font-semibold">${(d.data.avg_promoter || 0).toFixed(4)}</span></div>
//             </div>
//           `)

//         tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 10 + "px")
//       })
//       .on("mouseout", function (event, d) {
//         d3.select(this)
//           .attr("stroke-opacity", isLinkHighlighted(d) ? 0.8 : 0.15)
//           .attr("stroke-width", Math.max(1, d.width * 0.8))
//         d3.selectAll(".network-tooltip").remove()
//       })

//     // Create nodes with enhanced sizing and styling
//     const nodeGroup = g.append("g").attr("class", "nodes")
//     const node = nodeGroup
//       .selectAll("circle")
//       .data(filteredNodes, (d) => d.id)
//       .enter()
//       .append("circle")
//       .attr("r", (d) => {
//         // Enhanced size calculation based on importance
//         const baseSize = d.type === "biomarker" ? 8 : 6
//         const importanceBonus = Math.min(12, Math.sqrt(d.importance) * 2)
//         return baseSize + importanceBonus
//       })
//       .attr("fill", (d) => {
//         // Enhanced colors with better contrast
//         if (d.type === "biomarker") {
//           return d.connections > 5 ? "#3b82f6" : "#93c5fd" // Blue gradient
//         } else {
//           return d.connections > 5 ? "#f97316" : "#fdba74" // Orange gradient
//         }
//       })
//       .attr("stroke", "#fff")
//       .attr("stroke-width", 2)
//       .attr("opacity", (d) => (isHighlighted(d.id) ? 1 : 0.3))
//       .style("cursor", "pointer")
//       .on("mouseover", function (event, d) {
//         d3.select(this).attr("stroke", "#333").attr("stroke-width", 3)
//         setSelectedNode(d)
//       })
//       .on("mouseout", function (event, d) {
//         d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2)
//       })
//       .on("click", (event, d) => {
//         if (d.type === "disease") {
//           if (selectedNetworkDisease === d.id) {
//             setSelectedNetworkDisease(null)
//           } else {
//             setSelectedNetworkDisease(d.id)
//           }
//         }

//         // Handle node pinning
//         if (d.fx === null || d.fx === undefined) {
//           d.fx = d.x
//           d.fy = d.y
//         } else {
//           d.fx = null
//           d.fy = null
//         }
//         if (simulation) {
//           simulation.alpha(0.3).restart()
//         }
//       })

//     // Enhanced drag behavior
//     const drag = d3
//       .drag()
//       .on("start", (event, d) => {
//         if (!event.active && simulation) simulation.alphaTarget(0.3).restart()
//         d.fx = d.x
//         d.fy = d.y
//       })
//       .on("drag", (event, d) => {
//         d.fx = event.x
//         d.fy = event.y
//       })
//       .on("end", (event, d) => {
//         if (!event.active && simulation) simulation.alphaTarget(0)
//       })

//     node.call(drag)

//     // Enhanced labels with better positioning
//     const labelGroup = g.append("g").attr("class", "labels")
//     const labels = labelGroup
//       .selectAll("text")
//       .data(
//         filteredNodes.filter((d) => showLabels && d.connections >= labelThreshold[0]),
//         (d) => d.id,
//       )
//       .enter()
//       .append("text")
//       .text((d) => {
//         const name = d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name
//         return name
//       })
//       .attr("font-size", (d) => Math.max(8, Math.min(12, 8 + d.connections * 0.5)))
//       .attr("font-weight", "600")
//       .attr("text-anchor", "middle")
//       .attr("dy", (d) => {
//         const baseSize = d.type === "biomarker" ? 8 : 6
//         const importanceBonus = Math.min(12, Math.sqrt(d.importance) * 2)
//         return baseSize + importanceBonus + 18
//       })
//       .attr("fill", "#1f2937")
//       .attr("opacity", (d) => (isHighlighted(d.id) ? 1 : 0.4))
//       .style("pointer-events", "none")
//       .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)")

//     // Enhanced simulation with better forces
//     let newSimulation
//     if (simulation) {
//       simulation.stop()
//     }

//     newSimulation = d3
//       .forceSimulation(filteredNodes)
//       .force(
//         "link",
//         d3
//           .forceLink(filteredLinks)
//           .id((d) => d.id)
//           .distance((d) => {
//             // Dynamic distance based on node importance and spacing setting
//             const baseDistance = nodeSpacing[0]
//             const importanceFactor = 1 - (d.importance / 100) * 0.3 // Reduce distance for important connections
//             return baseDistance * importanceFactor
//           })
//           .strength(0.3), // Reduced strength for less aggressive pulling
//       )
//       .force(
//         "charge",
//         d3.forceManyBody().strength((d) => {
//           // Enhanced repulsion based on importance
//           const baseRepulsion = -300
//           const importanceMultiplier = 1 + d.importance / 50
//           return baseRepulsion * importanceMultiplier
//         }),
//       )
//       .force("center", d3.forceCenter(width / 2, height / 2))
//       .force(
//         "collision",
//         d3
//           .forceCollide()
//           .radius((d) => {
//             const baseSize = d.type === "biomarker" ? 8 : 6
//             const importanceBonus = Math.min(12, Math.sqrt(d.importance) * 2)
//             return baseSize + importanceBonus + 8 // Extra padding
//           })
//           .strength(0.8), // Strong collision detection
//       )
//       .force("x", d3.forceX(width / 2).strength(0.05)) // Weaker centering
//       .force("y", d3.forceY(height / 2).strength(0.05))

//     // Add clustering force if enabled
//     if (clusterSimilar) {
//       newSimulation.force("cluster", (alpha) => {
//         filteredNodes.forEach((d) => {
//           const cluster = d.group
//           const clusterNodes = filteredNodes.filter((n) => n.group === cluster)
//           if (clusterNodes.length > 1) {
//             const centerX = d3.mean(clusterNodes, (n) => n.x || 0)
//             const centerY = d3.mean(clusterNodes, (n) => n.y || 0)
//             d.vx += (centerX - d.x) * alpha * 0.1
//             d.vy += (centerY - d.y) * alpha * 0.1
//           }
//         })
//       })
//     }

//     // Update positions on simulation tick
//     newSimulation.on("tick", () => {
//       link
//         .attr("x1", (d) => d.source.x)
//         .attr("y1", (d) => d.source.y)
//         .attr("x2", (d) => d.target.x)
//         .attr("y2", (d) => d.target.y)

//       node.attr("cx", (d) => d.x).attr("cy", (d) => d.y)

//       labels.attr("x", (d) => d.x).attr("y", (d) => d.y)
//     })

//     newSimulation.alpha(1).restart()
//     setSimulation(newSimulation)

//     return () => {
//       if (newSimulation) {
//         newSimulation.stop()
//       }
//       d3.selectAll(".network-tooltip").remove()
//     }
//   }, [
//     filteredNodes,
//     filteredLinks,
//     selectedNetworkDisease,
//     width,
//     height,
//     nodeSpacing,
//     showLabels,
//     labelThreshold,
//     clusterSimilar,
//     highlightMode,
//   ])

//   // Update opacity when selectedNetworkDisease changes
//   useEffect(() => {
//     if (!svgRef.current) return

//     const svg = d3.select(svgRef.current)
//     const getSourceId = (d) => (typeof d.source === "object" ? d.source.id : d.source)
//     const getTargetId = (d) => (typeof d.target === "object" ? d.target.id : d.target)

//     const isHighlighted = (nodeId) => {
//       if (!selectedNetworkDisease) return true
//       if (highlightMode === "neighbors") {
//         return (
//           nodeId === selectedNetworkDisease ||
//           filteredLinks.some(
//             (link) =>
//               (getSourceId(link) === nodeId && getTargetId(link) === selectedNetworkDisease) ||
//               (getTargetId(link) === nodeId && getSourceId(link) === selectedNetworkDisease),
//           )
//         )
//       }
//       return nodeId === selectedNetworkDisease
//     }

//     const isLinkHighlighted = (link) => {
//       if (!selectedNetworkDisease) return true
//       const sourceId = getSourceId(link)
//       const targetId = getTargetId(link)
//       return sourceId === selectedNetworkDisease || targetId === selectedNetworkDisease
//     }

//     svg
//       .selectAll("circle")
//       .transition()
//       .duration(300)
//       .attr("opacity", (d) => (isHighlighted(d.id) ? 1 : 0.3))

//     svg
//       .selectAll("line")
//       .transition()
//       .duration(300)
//       .attr("stroke-opacity", (d) => (isLinkHighlighted(d) ? 0.8 : 0.15))

//     svg
//       .selectAll("text")
//       .transition()
//       .duration(300)
//       .attr("opacity", (d) => (isHighlighted(d.id) ? 1 : 0.4))
//   }, [selectedNetworkDisease, filteredLinks, highlightMode])

//   const handleReset = () => {
//     if (simulation) {
//       filteredNodes.forEach((node) => {
//         node.fx = null
//         node.fy = null
//       })
//       simulation.alpha(1).restart()
//     }
//   }

//   const handleZoomIn = () => {
//     const svg = d3.select(svgRef.current)
//     svg.transition().call(d3.zoom().scaleBy, 1.5)
//   }

//   const handleZoomOut = () => {
//     const svg = d3.select(svgRef.current)
//     svg.transition().call(d3.zoom().scaleBy, 1 / 1.5)
//   }

//   const clearFilters = () => {
//     setSelectedDisease("")
//     setSelectedBiomarker("")
//     setConnectionType("all")
//     setStrengthThreshold([0])
//     setShowOnlyConnected(true)
//     setSelectedNetworkDisease(null)
//     setNodeSearchTerm("")
//   }

//   // Get unique values for dropdowns
//   const diseases = Array.from(new Set(allLinks.map((l) => (typeof l.target === "object" ? l.target.id : l.target))))
//   const biomarkers = Array.from(new Set(allLinks.map((l) => (typeof l.source === "object" ? l.source.id : l.source))))

//   const currentWidth = isFullscreen ? window.innerWidth - 100 : width
//   const currentHeight = isFullscreen ? window.innerHeight - 200 : height

//   return (
//     <div className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-white p-4" : ""}`}>
//       {/* Enhanced Filter Panel */}
//       <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200 shadow-lg max-w-sm">
//         <div className="p-3 border-b border-slate-200">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setIsFiltersOpen(!isFiltersOpen)}
//             className="w-full justify-between text-sm font-semibold"
//           >
//             <div className="flex items-center gap-2">
//               <Filter className="h-4 w-4" />
//               Network Controls
//             </div>
//             {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//           </Button>
//         </div>

//         {isFiltersOpen && (
//           <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
//             {/* Search */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">Search Nodes</label>
//               <div className="relative">
//                 <Search className="absolute left-2 top-2 h-4 w-4 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Search biomarkers or diseases..."
//                   value={nodeSearchTerm}
//                   onChange={(e) => setNodeSearchTerm(e.target.value)}
//                   className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Focus Controls */}
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-xs font-medium text-slate-700 mb-1">Focus Disease</label>
//                 <select
//                   value={selectedDisease}
//                   onChange={(e) => setSelectedDisease(e.target.value)}
//                   className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Diseases</option>
//                   {diseases.map((disease) => (
//                     <option key={disease} value={disease}>
//                       {disease}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-medium text-slate-700 mb-1">Focus Biomarker</label>
//                 <select
//                   value={selectedBiomarker}
//                   onChange={(e) => setSelectedBiomarker(e.target.value)}
//                   className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">All Biomarkers</option>
//                   {biomarkers.map((biomarker) => (
//                     <option key={biomarker} value={biomarker}>
//                       {biomarker.replace(/_/g, " ")}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Connection Filters */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">Connection Type</label>
//               <select
//                 value={connectionType}
//                 onChange={(e) => setConnectionType(e.target.value)}
//                 className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="all">All Types</option>
//                 <option value="inhibitor">Inhibitor Only</option>
//                 <option value="promoter">Promoter Only</option>
//                 <option value="unknown">Unknown Only</option>
//               </select>
//             </div>

//             {/* Strength Threshold */}
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-2">
//                 Min Strength: {strengthThreshold[0].toFixed(3)}
//               </label>
//               <Slider
//                 value={strengthThreshold}
//                 onValueChange={setStrengthThreshold}
//                 max={0.1}
//                 min={0}
//                 step={0.001}
//                 className="w-full"
//               />
//             </div>

//             {/* Layout Controls */}
//             <div className="border-t pt-3">
//               <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
//                 <Settings className="h-3 w-3" />
//                 Layout Settings
//               </h4>

//               <div className="space-y-3">
//                 <div>
//                   <label className="block text-xs font-medium text-slate-700 mb-2">
//                     Node Spacing: {nodeSpacing[0]}px
//                   </label>
//                   <Slider
//                     value={nodeSpacing}
//                     onValueChange={setNodeSpacing}
//                     max={300}
//                     min={50}
//                     step={10}
//                     className="w-full"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-medium text-slate-700 mb-2">
//                     Label Threshold: {labelThreshold[0]} connections
//                   </label>
//                   <Slider
//                     value={labelThreshold}
//                     onValueChange={setLabelThreshold}
//                     max={10}
//                     min={0}
//                     step={1}
//                     className="w-full"
//                   />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <label className="text-xs font-medium text-slate-700">Show Labels</label>
//                   <Switch checked={showLabels} onCheckedChange={setShowLabels} />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <label className="text-xs font-medium text-slate-700">Cluster Similar</label>
//                   <Switch checked={clusterSimilar} onCheckedChange={setClusterSimilar} />
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <label className="text-xs font-medium text-slate-700">Connected Only</label>
//                   <Switch checked={showOnlyConnected} onCheckedChange={setShowOnlyConnected} />
//                 </div>
//               </div>
//             </div>

//             {/* Clear Filters */}
//             <Button variant="outline" size="sm" onClick={clearFilters} className="w-full text-xs">
//               Clear All Filters
//             </Button>

//             {/* Stats */}
//             <div className="border-t pt-3 text-xs text-slate-600">
//               <div>
//                 Showing: {filteredNodes.length} nodes, {filteredLinks.length} edges
//               </div>
//               {selectedNetworkDisease && (
//                 <div className="mt-1 text-blue-600 font-medium">Highlighting: {selectedNetworkDisease}</div>
//               )}
//               <div className="mt-2 space-y-1">
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-green-500 rounded"></div>
//                   <span>{filteredLinks.filter((l) => l.type === "inhibitor").length} inhibitor</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-amber-500 rounded"></div>
//                   <span>{filteredLinks.filter((l) => l.type === "promoter").length} promoter</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 bg-gray-400 rounded"></div>
//                   <span>{filteredLinks.filter((l) => l.type === "unknown").length} unknown</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Enhanced Controls */}
//       <div className="absolute top-4 right-4 z-10 flex gap-2">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => setIsFullscreen(!isFullscreen)}
//           className="bg-white/90 backdrop-blur-sm"
//         >
//           {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
//         </Button>
//         <Button variant="outline" size="sm" onClick={handleReset} className="bg-white/90 backdrop-blur-sm">
//           <RotateCcw className="h-4 w-4" />
//         </Button>
//         <Button variant="outline" size="sm" onClick={handleZoomIn} className="bg-white/90 backdrop-blur-sm">
//           <ZoomIn className="h-4 w-4" />
//         </Button>
//         <Button variant="outline" size="sm" onClick={handleZoomOut} className="bg-white/90 backdrop-blur-sm">
//           <ZoomOut className="h-4 w-4" />
//         </Button>
//       </div>

//       {/* Network SVG */}
//       <svg
//         ref={svgRef}
//         width={currentWidth}
//         height={currentHeight}
//         className="border border-slate-200 rounded-lg bg-white"
//       />

//       {/* Enhanced Node Info Panel */}
//       {selectedNode && (
//         <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg border border-slate-200 shadow-lg max-w-xs">
//           <h4 className="font-semibold text-slate-800 mb-2">{selectedNode.name}</h4>
//           <div className="text-sm text-slate-600">
//             <div className="flex items-center gap-2 mb-2">
//               <div
//                 className="w-3 h-3 rounded-full"
//                 style={{
//                   backgroundColor:
//                     selectedNode.type === "biomarker"
//                       ? selectedNode.connections > 5
//                         ? "#3b82f6"
//                         : "#93c5fd"
//                       : selectedNode.connections > 5
//                         ? "#f97316"
//                         : "#fdba74",
//                 }}
//               />
//               <span className="capitalize">{selectedNode.type}</span>
//             </div>
//             <div className="text-xs space-y-1">
//               <div>
//                 Connections: <span className="font-semibold">{selectedNode.connections}</span>
//               </div>
//               <div>
//                 Total Strength: <span className="font-semibold">{selectedNode.totalStrength?.toFixed(4)}</span>
//               </div>
//               <div>
//                 Importance: <span className="font-semibold">{selectedNode.importance?.toFixed(2)}</span>
//               </div>
//               <div className="text-slate-500 mt-2">
//                 {selectedNode.type === "biomarker"
//                   ? "Click to pin/unpin • Drag to move"
//                   : "Click disease to highlight • Drag to move"}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Enhanced Legend */}
//       <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg border border-slate-200 shadow-lg">
//         <h4 className="font-semibold text-slate-800 mb-3 text-sm">Legend</h4>
//         <div className="space-y-2 text-xs">
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 rounded-full bg-blue-500" />
//             <span>High-connection biomarkers</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-blue-300" />
//             <span>Low-connection biomarkers</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 rounded-full bg-orange-500" />
//             <span>High-connection diseases</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-orange-300" />
//             <span>Low-connection diseases</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-1 rounded bg-green-500" />
//             <span>Inhibitor (width = strength)</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-1 rounded bg-amber-500" />
//             <span>Promoter (width = strength)</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-1 rounded bg-gray-400" />
//             <span>Unknown (width = strength)</span>
//           </div>
//           <div className="text-slate-500 mt-2 text-xs">
//             💡 Use filters to focus • Click diseases to highlight • Drag nodes to explore
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function SymptomInfographic() {
//   // Handle API response with NaN values
//   const handleApiResponse = async (response) => {
//     try {
//       // Get the raw text from the response
//       const text = await response.text()

//       // Replace NaN with null in the text before parsing
//       const cleanedText = text.replace(/:\s*NaN/g, ": null")

//       // Parse the cleaned JSON
//       const data = JSON.parse(cleanedText)

//       // Extract the result array if it exists
//       const resultArray = data.result || data

//       // Filter out entries with mostly empty values
//       return resultArray.filter((item) => {
//         // Check if the item has meaningful data
//         return (
//           item.Insights ||
//           (item.Direction && item.Direction !== "null") ||
//           (item["Quantified Changes"] && item["Quantified Changes"] !== "null")
//         )
//       })
//     } catch (error) {
//       console.error("Error processing API response:", error)
//       throw new Error(`Failed to process API response: ${error.message}`)
//     }
//   }

//   // Process the API data to filter out N/A entries
//   const processApiData = (data) => {
//     if (!Array.isArray(data)) return []

//     // Filter out entries where most fields are N/A or null
//     return data.filter((item) => {
//       // Check if the item has meaningful data
//       const hasInsights = item.Insights && item.Insights !== "N/A" && item.Insights !== "NA"
//       const hasDirection = item.Direction && item.Direction !== "N/A" && item.Direction !== "NA"
//       const hasChanges =
//         item.Quantified_Changes && item.Quantified_Changes !== "N/A" && item.Quantified_Changes !== "NA"

//       return hasInsights || hasDirection || hasChanges
//     })
//   }

//   const location = useLocation()
//   const { symptomData, disease } = location.state || {}

//   // Move this line up before the filter logic (around line 90)
//   const { nested_assoc: data, plots, symptom } = symptomData

//   const [tooltip, setTooltip] = useState(null)
//   const [selectedDisease, setSelectedDisease] = useState(null)
//   const [diseaseDetails, setDiseaseDetails] = useState(null)
//   const [selectedCircle, setSelectedCircle] = useState(null)
//   const [circleDetails, setCircleDetails] = useState(null)
//   const [activeTab, setActiveTab] = useState("matrix")
//   const [zoomLevel, setZoomLevel] = useState(1)
//   const [apiData, setApiData] = useState(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const [apiError, setApiError] = useState(null)
//   const svgContainerRef = useRef(null)
//   const detailsSectionRef = useRef(null)

//   const [biomarkerFilter, setBiomarkerFilter] = useState("")
//   const [diseaseFilter, setDiseaseFilter] = useState("")
//   const [scoreThreshold, setScoreThreshold] = useState(0)
//   const [showOnlyWithData, setShowOnlyWithData] = useState(false)

//   const [chartType, setChartType] = useState("combined")
//   const [topN, setTopN] = useState(10)
//   const [sortBy, setSortBy] = useState("score")

//   // Fixed circle size
//   const CIRCLE_RADIUS = 16
//   const cellSize = 60 // Increased cell size for better spacing
//   const margin = { top: 180, right: 60, bottom: 80, left: 320 } // Increased margins for labels

//   // Fixed height for scrollable visualization
//   const VISUALIZATION_HEIGHT = 600

//   const biomarkers = Object.keys(symptomData?.nested_assoc || {})
//   const diseases = Array.from(
//     new Set(biomarkers.flatMap((biomarker) => Object.keys(symptomData?.nested_assoc[biomarker] || {}))),
//   ).sort()

//   // Apply filters to biomarkers and diseases
//   const filteredBiomarkers = biomarkers.filter((biomarker) =>
//     biomarker.toLowerCase().includes(biomarkerFilter.toLowerCase()),
//   )

//   const filteredDiseases = diseases.filter((disease) => disease.toLowerCase().includes(diseaseFilter.toLowerCase()))

//   // Further filter based on score threshold and data availability
//   const finalBiomarkers = filteredBiomarkers.filter((biomarker) => {
//     if (!showOnlyWithData && scoreThreshold === 0) return true

//     const hasValidData = filteredDiseases.some((disease) => {
//       const datum = data[biomarker]?.[disease]
//       if (!datum) return !showOnlyWithData
//       return datum.total_avg >= scoreThreshold
//     })

//     return hasValidData
//   })

//   const finalDiseases = filteredDiseases.filter((disease) => {
//     if (!showOnlyWithData && scoreThreshold === 0) return true

//     const hasValidData = finalBiomarkers.some((biomarker) => {
//       const datum = data[biomarker]?.[disease]
//       if (!datum) return !showOnlyWithData
//       return datum.total_avg >= scoreThreshold
//     })

//     return hasValidData
//   })

//   console.log("Total biomarkers:", biomarkers.length)
//   console.log("Total diseases:", diseases.length)
//   console.log("Diseases:", diseases)

//   const width = Math.max(finalDiseases.length * cellSize + margin.left + margin.right, 1200)
//   const height = finalBiomarkers.length * cellSize + margin.top + margin.bottom

//   // Scroll to center on initial load
//   useEffect(() => {
//     if (svgContainerRef.current) {
//       const container = svgContainerRef.current
//       container.scrollLeft = (width * zoomLevel - container.clientWidth) / 2
//     }
//   }, [width, zoomLevel])

//   // Auto-scroll to details section when details are shown
//   useEffect(() => {
//     if ((selectedDisease && diseaseDetails) || (selectedCircle && circleDetails)) {
//       setTimeout(() => {
//         detailsSectionRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "start",
//         })
//       }, 100)
//     }
//   }, [selectedDisease, diseaseDetails, selectedCircle, circleDetails])

//   // Show error message if no data is available
//   if (!symptomData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <Card className="p-8 text-center">
//           <div className="text-red-600 mb-4">
//             <Activity className="h-12 w-12 mx-auto mb-4" />
//             <h2 className="text-xl font-semibold">No Data Available</h2>
//             <p className="text-slate-600 mt-2">Please navigate here with valid symptom data.</p>
//           </div>
//         </Card>
//       </div>
//     )
//   }

//   // Create gradient for colored circles (inhibitor, promoter, unknown)
//   const createGradient = (inhibitorPercent, promoterPercent, unknownPercent, id) => (
//     <defs key={id}>
//       <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
//         <stop offset="0%" stopColor="oklch(0.925 0.084 155.995)" stopOpacity={inhibitorPercent / 100} />
//         <stop
//           offset={`${inhibitorPercent}%`}
//           stopColor="oklch(0.925 0.084 155.995)"
//           stopOpacity={inhibitorPercent / 100}
//         />
//         <stop
//           offset={`${inhibitorPercent}%`}
//           stopColor="oklch(0.924 0.12 95.746)"
//           stopOpacity={promoterPercent / 100}
//         />
//         <stop
//           offset={`${inhibitorPercent + promoterPercent}%`}
//           stopColor="oklch(0.924 0.12 95.746)"
//           stopOpacity={promoterPercent / 100}
//         />
//         <stop
//           offset={`${inhibitorPercent + promoterPercent}%`}
//           stopColor="#6b7280"
//           stopOpacity={unknownPercent / 100}
//         />
//         <stop offset="100%" stopColor="#6b7280" stopOpacity={unknownPercent / 100} />
//       </linearGradient>
//     </defs>
//   )

//   // Handle mouse events for tooltip
//   const handleMouseEnter = (biomarker, disease, datum, event) => {
//     if (!datum) return
//     const rect = event.currentTarget.getBoundingClientRect()
//     setTooltip({
//       biomarker,
//       disease,
//       total_avg: datum.total_avg || 0,
//       avg_inhibitor: datum.avg_inhibitor || 0,
//       avg_promoter: datum.avg_promoter || 0,
//       avg_unknown: datum.avg_unknown || 0,
//       percent_inhibitor: datum.percent_inhibitor || 0,
//       percent_promoter: datum.percent_promoter || 0,
//       percent_unknown: datum.percent_unknown || 0,
//       x: rect.left + rect.width / 2,
//       y: rect.top - 10,
//     })
//   }

//   const handleMouseLeave = () => {
//     setTooltip(null)
//   }

//   // Handle disease click
//   const handleDiseaseClick = (disease) => {
//     // Clear circle selection when selecting a disease
//     setSelectedCircle(null)
//     setCircleDetails(null)
//     setApiData(null)
//     setApiError(null)

//     setSelectedDisease(disease)

//     // Calculate statistics for this disease across all biomarkers
//     const diseaseStats = {
//       disease,
//       totalBiomarkers: biomarkers.length,
//       biomarkersWithData: 0,
//       avgInhibitorScore: 0,
//       avgPromoterScore: 0,
//       avgUnknownScore: 0,
//       avgTotalScore: 0,
//       strongestInhibitor: null,
//       strongestPromoter: null,
//       strongestUnknown: null,
//       biomarkerData: [],
//     }

//     let totalInhibitor = 0
//     let totalPromoter = 0
//     let totalUnknown = 0
//     let totalScore = 0
//     let maxInhibitor = 0
//     let maxPromoter = 0
//     let maxUnknown = 0

//     biomarkers.forEach((biomarker) => {
//       const datum = data[biomarker]?.[disease]
//       if (datum) {
//         diseaseStats.biomarkersWithData++
//         totalInhibitor += datum.avg_inhibitor || 0
//         totalPromoter += datum.avg_promoter || 0
//         totalUnknown += datum.avg_unknown || 0
//         totalScore += datum.total_avg

//         if ((datum.avg_inhibitor || 0) > maxInhibitor) {
//           maxInhibitor = datum.avg_inhibitor || 0
//           diseaseStats.strongestInhibitor = {
//             biomarker,
//             score: datum.avg_inhibitor,
//           }
//         }

//         if ((datum.avg_promoter || 0) > maxPromoter) {
//           maxPromoter = datum.avg_promoter || 0
//           diseaseStats.strongestPromoter = {
//             biomarker,
//             score: datum.avg_promoter,
//           }
//         }

//         if ((datum.avg_unknown || 0) > maxUnknown) {
//           maxUnknown = datum.avg_unknown || 0
//           diseaseStats.strongestUnknown = {
//             biomarker,
//             score: datum.avg_unknown,
//           }
//         }

//         diseaseStats.biomarkerData.push({
//           biomarker,
//           ...datum,
//         })
//       }
//     })

//     if (diseaseStats.biomarkersWithData > 0) {
//       diseaseStats.avgInhibitorScore = totalInhibitor / diseaseStats.biomarkersWithData
//       diseaseStats.avgPromoterScore = totalPromoter / diseaseStats.biomarkersWithData
//       diseaseStats.avgUnknownScore = totalUnknown / diseaseStats.biomarkersWithData
//       diseaseStats.avgTotalScore = totalScore / diseaseStats.biomarkersWithData
//     }

//     // Sort biomarker data by total score
//     diseaseStats.biomarkerData.sort((a, b) => b.total_avg - a.total_avg)

//     setDiseaseDetails(diseaseStats)
//   }

//   // Handle circle click with API call
//   const handleCircleClick = async (biomarker, disease, datum) => {
//     if (!datum) return

//     // Clear disease selection when selecting a circle
//     setSelectedDisease(null)
//     setDiseaseDetails(null)

//     setSelectedCircle({ biomarker, disease })
//     setCircleDetails({
//       biomarker,
//       disease,
//       symptom,
//       total_avg: datum.total_avg || 0,
//       avg_inhibitor: datum.avg_inhibitor || 0,
//       avg_promoter: datum.avg_promoter || 0,
//       avg_unknown: datum.avg_unknown || 0,
//       percent_inhibitor: datum.percent_inhibitor || 0,
//       percent_promoter: datum.percent_promoter || 0,
//       percent_unknown: datum.percent_unknown || 0,
//       // Additional analysis
//       dominantType:
//         (datum.percent_inhibitor || 0) > (datum.percent_promoter || 0) &&
//         (datum.percent_inhibitor || 0) > (datum.percent_unknown || 0)
//           ? "Inhibitor"
//           : (datum.percent_promoter || 0) > (datum.percent_unknown || 0)
//             ? "Promoter"
//             : "Unknown",
//       confidence: Math.max(datum.percent_inhibitor || 0, datum.percent_promoter || 0, datum.percent_unknown || 0),
//     })

//     // Make API call to get additional data
//     setIsLoading(true)
//     setApiData(null)
//     setApiError(null)

//     try {
//       const response = await fetch(`${import.meta.env.VITE_API_URL}/ligmaballs`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           disease: disease,
//           biomarker: biomarker,
//           symptom_data: symptomData,
//         }),
//       })

//       if (response.status === 404) {
//         // Handle 404 specifically - no data found
//         setApiData([])
//         setApiError(null)
//         return
//       }

//       if (!response.ok) {
//         throw new Error(`API request failed with status ${response.status}`)
//       }

//       // Use the new handler function
//       const processedData = await handleApiResponse(response)
//       console.log("Processed API data:", processedData)
//       setApiData(processedData)
//     } catch (error) {
//       console.error("Error fetching data from API:", error)
//       setApiError(error.message || "Failed to fetch data from API")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // Handle zoom controls
//   const handleZoomIn = () => {
//     setZoomLevel((prev) => Math.min(prev + 0.2, 2))
//   }

//   const handleZoomOut = () => {
//     setZoomLevel((prev) => Math.max(prev - 0.2, 0.6))
//   }

//   // Download image
//   const downloadPlot = (plotType, base64Data) => {
//     const link = document.createElement("a")
//     link.href = `data:image/png;base64,${base64Data}`
//     link.download = `${symptom}_${plotType}_plot.png`
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Header */}
//       <div className="bg-white border-b border-slate-200 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-800">Biomarker-Disease Association Matrix</h1>
//             <p className="text-slate-600 mt-1">
//               Symptom analysis for:{" "}
//               <Badge variant="outline" className="ml-2 font-semibold capitalize">
//                 {symptom}
//               </Badge>
//             </p>
//           </div>
//           <div className="text-sm text-slate-500">
//             {finalBiomarkers.length} biomarkers × {finalDiseases.length} diseases
//             {(biomarkerFilter || diseaseFilter || scoreThreshold > 0 || showOnlyWithData) &&
//               ` (filtered from ${biomarkers.length} × ${diseases.length})`}
//           </div>
//         </div>
//       </div>

//       {/* Tabs for Matrix and Plots */}
//       <div className="p-4">
//         <Tabs defaultValue="matrix" className="w-full" value={activeTab} onValueChange={setActiveTab}>
//           <div className="flex justify-between items-center mb-4">
//             <TabsList>
//               <TabsTrigger value="matrix" className="px-6">
//                 <div className="flex items-center gap-2">
//                   <Activity className="h-4 w-4" />
//                   <span>Association Matrix</span>
//                 </div>
//               </TabsTrigger>
//               <TabsTrigger value="plots" className="px-6">
//                 <div className="flex items-center gap-2">
//                   <Network className="h-4 w-4" />
//                   <span>Network Analysis</span>
//                 </div>
//               </TabsTrigger>
//             </TabsList>

//             {activeTab === "matrix" && (
//               <div className="flex items-center gap-2">
//                 <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoomLevel <= 0.6}>
//                   <ZoomOut className="h-4 w-4" />
//                 </Button>
//                 <span className="text-sm font-medium text-slate-600">{Math.round(zoomLevel * 100)}%</span>
//                 <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
//                   <ZoomIn className="h-4 w-4" />
//                 </Button>
//               </div>
//             )}
//           </div>

//           <TabsContent value="matrix" className="mt-0">
//             <div className="space-y-4">
//               {/* Filter Controls for Association Matrix */}
//               <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm mb-4">
//                 <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                   <Activity className="h-5 w-5" />
//                   Matrix Filters
//                 </h4>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Search Biomarkers</label>
//                     <input
//                       type="text"
//                       placeholder="Filter biomarkers..."
//                       value={biomarkerFilter}
//                       onChange={(e) => setBiomarkerFilter(e.target.value)}
//                       className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Search Diseases</label>
//                     <input
//                       type="text"
//                       placeholder="Filter diseases..."
//                       value={diseaseFilter}
//                       onChange={(e) => setDiseaseFilter(e.target.value)}
//                       className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Min Score Threshold</label>
//                     <input
//                       type="number"
//                       step="0.001"
//                       min="0"
//                       placeholder="0.000"
//                       value={scoreThreshold}
//                       onChange={(e) => setScoreThreshold(Number(e.target.value))}
//                       className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">Display Options</label>
//                     <label className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={showOnlyWithData}
//                         onChange={(e) => setShowOnlyWithData(e.target.checked)}
//                         className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                       />
//                       <span className="text-sm text-slate-700">Show only with data</span>
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               {/* Main Visualization */}
//               <div className="overflow-hidden">
//                 <div
//                   className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-auto"
//                   style={{ height: `${VISUALIZATION_HEIGHT}px` }}
//                 >
//                   <div ref={svgContainerRef} className="overflow-auto" style={{ height: "100%", width: "100%" }}>
//                     <svg
//                       width={width * zoomLevel}
//                       height={height * zoomLevel}
//                       viewBox={`0 0 ${width} ${height}`}
//                       preserveAspectRatio="xMinYMin meet"
//                     >
//                       {/* Create gradients for all data points */}
//                       {finalBiomarkers.map((biomarker, biomarkerIndex) =>
//                         finalDiseases.map((disease, diseaseIndex) => {
//                           const datum = data[biomarker]?.[disease]
//                           if (!datum) return null
//                           const gradientId = `gradient-${biomarkerIndex}-${diseaseIndex}`
//                           return createGradient(
//                             datum.percent_inhibitor,
//                             datum.percent_promoter,
//                             datum.percent_unknown,
//                             gradientId,
//                           )
//                         }),
//                       )}

//                       {/* Y-axis labels (Biomarkers) */}
//                       {finalBiomarkers.map((biomarker, index) => (
//                         <text
//                           key={biomarker}
//                           x={margin.left - 15}
//                           y={margin.top + index * cellSize + cellSize / 2}
//                           textAnchor="end"
//                           dominantBaseline="middle"
//                           className="text-sm font-medium fill-slate-700 hover:fill-blue-600 cursor-default"
//                         >
//                           {biomarker.replace(/_/g, " ")}
//                         </text>
//                       ))}

//                       {/* X-axis labels (Diseases) - positioned at top with better spacing */}
//                       {finalDiseases.map((disease, index) => (
//                         <g key={disease}>
//                           <text
//                             x={margin.left + index * cellSize + cellSize / 2}
//                             y={margin.top - 40}
//                             textAnchor="start"
//                             dominantBaseline="middle"
//                             className="text-sm font-semibold fill-slate-700 hover:fill-blue-600 cursor-pointer transition-colors"
//                             transform={`rotate(-45, ${
//                               margin.left + index * cellSize + cellSize / 2
//                             }, ${margin.top - 40})`}
//                             onClick={() => handleDiseaseClick(disease)}
//                           >
//                             {disease}
//                           </text>
//                           {/* Vertical guide line */}
//                           <line
//                             x1={margin.left + index * cellSize + cellSize / 2}
//                             y1={margin.top - 10}
//                             x2={margin.left + index * cellSize + cellSize / 2}
//                             y2={margin.top}
//                             stroke="#e2e8f0"
//                             strokeDasharray="2,2"
//                           />
//                         </g>
//                       ))}

//                       {/* Complete matrix - show circle for EVERY biomarker-disease combination */}
//                       {finalBiomarkers.map((biomarker, biomarkerIndex) =>
//                         finalDiseases.map((disease, diseaseIndex) => {
//                           const datum = data[biomarker]?.[disease]
//                           const cx = margin.left + diseaseIndex * cellSize + cellSize / 2
//                           const cy = margin.top + biomarkerIndex * cellSize + cellSize / 2

//                           if (datum) {
//                             // Show colored circle with data - FIXED SIZE
//                             const gradientId = `gradient-${biomarkerIndex}-${diseaseIndex}`

//                             return (
//                               <circle
//                                 key={`${biomarker}-${disease}-data`}
//                                 cx={cx}
//                                 cy={cy}
//                                 r={CIRCLE_RADIUS}
//                                 fill={`url(#${gradientId})`}
//                                 stroke="#374151"
//                                 strokeWidth="1.5"
//                                 className="cursor-pointer hover:stroke-2 hover:stroke-blue-500 transition-all"
//                                 onMouseEnter={(e) => handleMouseEnter(biomarker, disease, datum, e)}
//                                 onMouseLeave={handleMouseLeave}
//                                 onClick={() => handleCircleClick(biomarker, disease, datum)}
//                               />
//                             )
//                           } else {
//                             // Show grey circle for missing data - FIXED SIZE
//                             return (
//                               <circle
//                                 key={`${biomarker}-${disease}-empty`}
//                                 cx={cx}
//                                 cy={cy}
//                                 r={CIRCLE_RADIUS * 0.6}
//                                 fill="#e2e8f0"
//                                 stroke="#cbd5e1"
//                                 strokeWidth="1"
//                                 className="opacity-60"
//                               />
//                             )
//                           }
//                         }),
//                       )}

//                       {/* Grid lines for better readability */}
//                       {finalBiomarkers.map((_, index) => (
//                         <line
//                           key={`hgrid-${index}`}
//                           x1={margin.left - 5}
//                           y1={margin.top + index * cellSize}
//                           x2={margin.left + finalDiseases.length * cellSize}
//                           y2={margin.top + index * cellSize}
//                           stroke="#f1f5f9"
//                           strokeWidth="1"
//                         />
//                       ))}
//                       {finalDiseases.map((_, index) => (
//                         <line
//                           key={`vgrid-${index}`}
//                           x1={margin.left + index * cellSize}
//                           y1={margin.top - 5}
//                           x2={margin.left + index * cellSize}
//                           y2={margin.top + finalBiomarkers.length * cellSize}
//                           stroke="#f1f5f9"
//                           strokeWidth="1"
//                         />
//                       ))}
//                     </svg>
//                   </div>
//                 </div>
//               </div>

//               {/* Details Panel Below Visualization */}
//               {(selectedDisease && diseaseDetails) || (selectedCircle && circleDetails) ? (
//                 <div ref={detailsSectionRef} className="bg-white border border-slate-200 rounded-lg shadow-sm">
//                   <div className="p-6">
//                     <div className="flex items-center justify-between mb-4">
//                       <h3 className="text-lg font-bold text-slate-800">
//                         {selectedDisease ? "Disease Analysis" : "Interaction Details"}
//                       </h3>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => {
//                           setSelectedDisease(null)
//                           setDiseaseDetails(null)
//                           setSelectedCircle(null)
//                           setCircleDetails(null)
//                           setApiData(null)
//                           setApiError(null)
//                         }}
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     </div>

//                     {/* Disease Details */}
//                     {selectedDisease && diseaseDetails && (
//                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                         <div className="space-y-4">
//                           <div>
//                             <h4 className="font-semibold text-slate-700 mb-2">{selectedDisease}</h4>
//                             <div className="grid grid-cols-2 gap-3 text-sm">
//                               <div className="bg-slate-50 p-3 rounded-lg">
//                                 <div className="text-slate-500">Coverage</div>
//                                 <div className="font-semibold">
//                                   {diseaseDetails.biomarkersWithData}/{diseaseDetails.totalBiomarkers}
//                                 </div>
//                               </div>
//                               <div className="bg-slate-50 p-3 rounded-lg">
//                                 <div className="text-slate-500">Avg Score</div>
//                                 <div className="font-semibold">{diseaseDetails.avgTotalScore.toFixed(3)}</div>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="space-y-3">
//                             <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
//                               <TrendingDown className="h-4 w-4 text-green-600" />
//                               <div className="flex-1">
//                                 <div className="text-sm text-green-700 font-medium">Avg Inhibitor Score</div>
//                                 <div className="text-lg font-bold text-green-800">
//                                   {diseaseDetails.avgInhibitorScore.toFixed(3)}
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
//                               <TrendingUp className="h-4 w-4 text-yellow-600" />
//                               <div className="flex-1">
//                                 <div className="text-sm text-yellow-700 font-medium">Avg Promoter Score</div>
//                                 <div className="text-lg font-bold text-yellow-800">
//                                   {diseaseDetails.avgPromoterScore.toFixed(3)}
//                                 </div>
//                               </div>
//                             </div>

//                             <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
//                               <HelpCircle className="h-4 w-4 text-gray-600" />
//                               <div className="flex-1">
//                                 <div className="text-sm text-gray-700 font-medium">Avg Unknown Score</div>
//                                 <div className="text-lg font-bold text-gray-800">
//                                   {diseaseDetails.avgUnknownScore.toFixed(3)}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         <div>
//                           <h5 className="font-medium text-slate-700 mb-2">Top Biomarkers</h5>
//                           <div className="space-y-2 max-h-64 overflow-auto">
//                             {diseaseDetails.biomarkerData.slice(0, 10).map((item, index) => (
//                               <div
//                                 key={item.biomarker}
//                                 className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
//                               >
//                                 <div className="flex-1 truncate">
//                                   <span className="font-medium">{index + 1}. </span>
//                                   {item.biomarker.replace(/_/g, " ")}
//                                 </div>
//                                 <div className="font-semibold text-slate-700">{item.total_avg.toFixed(3)}</div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Circle Details */}
//                     {selectedCircle && circleDetails && (
//                       <div className="space-y-6">
//                         {/* Header Section */}
//                         <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
//                           <div className="flex items-start justify-between">
//                             <div className="flex-1">
//                               <h4 className="text-2xl font-bold mb-2">{circleDetails.biomarker.replace(/_/g, " ")}</h4>
//                               <p className="text-blue-100 text-lg mb-3">{circleDetails.disease}</p>
//                               <div className="flex items-center gap-4">
//                                 <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
//                                   {circleDetails.dominantType} Effect
//                                 </Badge>
//                               </div>
//                             </div>
//                             <div className="text-right">
//                               <div className="text-3xl font-bold">{(circleDetails.total_avg || 0).toFixed(3)}</div>
//                               <div className="text-blue-200 text-sm">Total Score</div>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Main Content Grid */}
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                           {/* Left Column - Metrics */}
//                           <div className="space-y-4">
//                             <h5 className="text-lg font-semibold text-slate-800 mb-4">Effect Breakdown</h5>

//                             {circleDetails.avg_inhibitor !== null && circleDetails.avg_inhibitor !== undefined && (
//                               <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
//                                 <div className="flex items-center justify-between mb-2">
//                                   <div className="flex items-center gap-2">
//                                     <TrendingDown className="h-5 w-5 text-green-600" />
//                                     <span className="font-medium text-green-800">Antagonist Effect</span>
//                                   </div>
//                                   <Badge variant="outline" className="border-green-300 text-green-700">
//                                     {(circleDetails.percent_inhibitor || 0).toFixed(1)}%
//                                   </Badge>
//                                 </div>
//                                 <div className="text-2xl font-bold text-green-900">
//                                   {(circleDetails.avg_inhibitor || 0).toFixed(4)}
//                                 </div>
//                                 <div className="text-sm text-green-600 mt-1">Suppressive interaction strength</div>
//                               </div>
//                             )}

//                             {circleDetails.avg_promoter !== null && circleDetails.avg_promoter !== undefined && (
//                               <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
//                                 <div className="flex items-center justify-between mb-2">
//                                   <div className="flex items-center gap-2">
//                                     <TrendingUp className="h-5 w-5 text-amber-600" />
//                                     <span className="font-medium text-amber-800">Agonist Effect</span>
//                                   </div>
//                                   <Badge variant="outline" className="border-amber-300 text-amber-700">
//                                     {(circleDetails.percent_promoter || 0).toFixed(1)}%
//                                   </Badge>
//                                 </div>
//                                 <div className="text-2xl font-bold text-amber-900">
//                                   {(circleDetails.avg_promoter || 0).toFixed(4)}
//                                 </div>
//                                 <div className="text-sm text-amber-600 mt-1">Enhancing interaction strength</div>
//                               </div>
//                             )}

//                             {/* Only show Unknown Effect if it's greater than 0 */}
//                             {circleDetails.avg_unknown !== null &&
//                               circleDetails.avg_unknown !== undefined &&
//                               circleDetails.avg_unknown > 0 && (
//                                 <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
//                                   <div className="flex items-center justify-between mb-2">
//                                     <div className="flex items-center gap-2">
//                                       <HelpCircle className="h-5 w-5 text-gray-600" />
//                                       <span className="font-medium text-gray-800">Unknown Effect</span>
//                                     </div>
//                                     <Badge variant="outline" className="border-gray-300 text-gray-700">
//                                       {(circleDetails.percent_unknown || 0).toFixed(1)}%
//                                     </Badge>
//                                   </div>
//                                   <div className="text-2xl font-bold text-gray-900">
//                                     {(circleDetails.avg_unknown || 0).toFixed(4)}
//                                   </div>
//                                   <div className="text-sm text-gray-600 mt-1">Undetermined interaction type</div>
//                                 </div>
//                               )}

//                             {/* Clinical Significance */}
//                             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
//                               <h6 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
//                                 <Activity className="h-4 w-4" />
//                                 Clinical Significance
//                               </h6>
//                               <p className="text-sm text-blue-700 leading-relaxed">
//                                 This <strong>{circleDetails.dominantType.toLowerCase()}</strong> relationship between{" "}
//                                 <strong>{circleDetails.biomarker.replace(/_/g, " ")}</strong> and{" "}
//                                 <strong>{circleDetails.disease}</strong> in the context of{" "}
//                                 <strong>{circleDetails.symptom}</strong> suggests potential therapeutic targets for
//                                 intervention.
//                               </p>
//                             </div>
//                           </div>

//                           {/* Right Column - Research Data */}
//                           <div className="space-y-4">
//                             <div className="flex items-center justify-between">
//                               <h5 className="text-lg font-semibold text-slate-800">Additional Research Data</h5>
//                               {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
//                             </div>

//                             <div className="bg-slate-50 rounded-lg border border-slate-200 min-h-[400px]">
//                               {isLoading && (
//                                 <div className="flex flex-col items-center justify-center h-64">
//                                   <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
//                                   <p className="text-sm text-slate-600">Loading research insights...</p>
//                                 </div>
//                               )}

//                               {apiError && (
//                                 <div className="p-6">
//                                   <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                                     <div className="flex items-center gap-2 mb-2">
//                                       <X className="h-4 w-4 text-red-600" />
//                                       <span className="font-medium text-red-800">Error Loading Data</span>
//                                     </div>
//                                     <p className="text-sm text-red-700">{apiError}</p>
//                                   </div>
//                                 </div>
//                               )}

//                               {!isLoading && !apiError && (
//                                 <div className="p-6">
//                                   {apiData && apiData.length > 0 ? (
//                                     <div className="space-y-4 max-h-96 overflow-y-auto">
//                                       {apiData.map((item, index) => {
//                                         // Skip items with no meaningful data
//                                         if (!item.Insights && !item.Direction && !item["Quantified Changes"]) {
//                                           return null
//                                         }

//                                         return (
//                                           <div
//                                             key={index}
//                                             className="bg-white rounded-lg border border-slate-200 shadow-sm"
//                                           >
//                                             <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-4 rounded-t-lg">
//                                               <div className="flex items-center justify-between">
//                                                 <h6 className="font-medium text-slate-800">
//                                                   {item.Matched_Biomarker || "Cyclooxygenase"} Analysis
//                                                 </h6>
//                                                 {item.Direction && (
//                                                   <Badge
//                                                     variant={
//                                                       item.Direction?.includes("Increase") ? "destructive" : "default"
//                                                     }
//                                                     className="text-xs"
//                                                   >
//                                                     {item.Direction}
//                                                   </Badge>
//                                                 )}
//                                               </div>
//                                             </div>
//                                             <div className="p-4 space-y-3">
//                                               {/* Insights */}
//                                               {item.Insights && (
//                                                 <div>
//                                                   <h6 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
//                                                     <Info className="h-3 w-3" />
//                                                     Key Insights
//                                                   </h6>
//                                                   <p className="text-sm text-slate-600 bg-blue-50 p-2 rounded">
//                                                     {item.Insights}
//                                                   </p>
//                                                 </div>
//                                               )}

//                                               {/* Quantified Changes */}
//                                               {item["Quantified Changes"] && (
//                                                 <div>
//                                                   <h6 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
//                                                     <BarChart3 className="h-3 w-3" />
//                                                     Quantified Changes
//                                                   </h6>
//                                                   <p className="text-sm text-slate-600 bg-green-50 p-2 rounded">
//                                                     {item["Quantified Changes"]}
//                                                   </p>
//                                                 </div>
//                                               )}

//                                               {/* Comparison to Reference */}
//                                               {item["Comparison to Reference"] && (
//                                                 <div>
//                                                   <h6 className="text-sm font-semibold text-slate-700 mb-1">
//                                                     Reference Comparison
//                                                   </h6>
//                                                   <p className="text-sm text-slate-600 bg-amber-50 p-2 rounded">
//                                                     {item["Comparison to Reference"]}
//                                                   </p>
//                                                 </div>
//                                               )}

//                                               {/* Reference Point */}
//                                               {item["Reference Point"] && (
//                                                 <div>
//                                                   <h6 className="text-sm font-semibold text-slate-700 mb-1">
//                                                     Reference Point
//                                                   </h6>
//                                                   <p className="text-sm text-slate-600 bg-purple-50 p-2 rounded">
//                                                     {item["Reference Point"]}
//                                                   </p>
//                                                 </div>
//                                               )}
//                                             </div>
//                                           </div>
//                                         )
//                                       })}
//                                     </div>
//                                   ) : (
//                                     <div className="flex flex-col items-center justify-center h-64 text-center">
//                                       <div className="bg-slate-100 rounded-full p-4 mb-4">
//                                         <HelpCircle className="h-8 w-8 text-slate-400" />
//                                       </div>
//                                       <h6 className="font-medium text-slate-700 mb-2">No Additional Data Available</h6>
//                                       <p className="text-sm text-slate-600 max-w-sm">
//                                         No additional research data is currently available for this specific
//                                         biomarker-disease combination. This may indicate limited research coverage or
//                                         data availability.
//                                       </p>
//                                     </div>
//                                   )}

//                                   {!apiData && (
//                                     <div className="flex items-center justify-center h-32">
//                                       <p className="text-sm text-slate-500">
//                                         Research data will appear here once loaded.
//                                       </p>
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : null}
//             </div>
//           </TabsContent>

//           <TabsContent value="plots" className="mt-0">
//             <div className="space-y-6">
//               <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
//                 <div className="flex items-center justify-between mb-6">
//                   <div>
//                     <h3 className="text-2xl font-bold text-slate-800">Enhanced Network Analysis</h3>
//                     <p className="text-slate-600 mt-1">
//                       Interactive biomarker-disease network with improved readability for "{symptom}"
//                     </p>
//                   </div>
//                   <Badge variant="secondary" className="text-sm">
//                     {biomarkers.length} Biomarkers • {diseases.length} Diseases
//                   </Badge>
//                 </div>

//                 {/* Network Visualization */}
//                 {data && Object.keys(data).length > 0 ? (
//                   <div className="space-y-6">
//                     {/* Top Biomarkers Bar Chart */}
//                     <TopBiomarkersChart data={data} symptom={symptom} width={1000} height={300} />

//                     {/* Network Stats */}
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                       <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
//                         <CardHeader className="pb-3">
//                           <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
//                             <Network className="h-5 w-5" />
//                             Network Nodes
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="text-2xl font-bold text-blue-900">{biomarkers.length + diseases.length}</div>
//                           <div className="text-sm text-blue-600">
//                             {biomarkers.length} biomarkers + {diseases.length} diseases
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
//                         <CardHeader className="pb-3">
//                           <CardTitle className="text-lg text-green-800 flex items-center gap-2">
//                             <TrendingDown className="h-5 w-5" />
//                             Antagonist Links
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                           {(() => {
//                             let inhibitorCount = 0
//                             biomarkers.forEach((biomarker) => {
//                               diseases.forEach((disease) => {
//                                 const datum = data[biomarker]?.[disease]
//                                 if (
//                                   datum &&
//                                   (datum.avg_inhibitor || 0) > (datum.avg_promoter || 0) &&
//                                   (datum.avg_inhibitor || 0) > (datum.avg_unknown || 0) &&
//                                   (datum.avg_inhibitor || 0) > 0.001
//                                 ) {
//                                   inhibitorCount++
//                                 }
//                               })
//                             })
//                             return (
//                               <>
//                                 <div className="text-2xl font-bold text-green-900">{inhibitorCount}</div>
//                                 <div className="text-sm text-green-600">Suppressive connections</div>
//                               </>
//                             )
//                           })()}
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
//                         <CardHeader className="pb-3">
//                           <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
//                             <TrendingUp className="h-5 w-5" />
//                             Agonist Links
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                           {(() => {
//                             let promoterCount = 0
//                             biomarkers.forEach((biomarker) => {
//                               diseases.forEach((disease) => {
//                                 const datum = data[biomarker]?.[disease]
//                                 if (
//                                   datum &&
//                                   (datum.avg_promoter || 0) > (datum.avg_inhibitor || 0) &&
//                                   (datum.avg_promoter || 0) > (datum.avg_unknown || 0) &&
//                                   (datum.avg_promoter || 0) > 0.001
//                                 ) {
//                                   promoterCount++
//                                 }
//                               })
//                             })
//                             return (
//                               <>
//                                 <div className="text-2xl font-bold text-amber-900">{promoterCount}</div>
//                                 <div className="text-sm text-amber-600">Enhancing connections</div>
//                               </>
//                             )
//                           })()}
//                         </CardContent>
//                       </Card>

//                       <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
//                         <CardHeader className="pb-3">
//                           <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
//                             <Activity className="h-5 w-5" />
//                             Total Links
//                           </CardTitle>
//                         </CardHeader>
//                         <CardContent>
//                           {(() => {
//                             let totalLinks = 0
//                             biomarkers.forEach((biomarker) => {
//                               diseases.forEach((disease) => {
//                                 const datum = data[biomarker]?.[disease]
//                                 if (datum && datum.total_avg > 0) {
//                                   totalLinks++
//                                 }
//                               })
//                             })
//                             return (
//                               <>
//                                 <div className="text-2xl font-bold text-purple-900">{totalLinks}</div>
//                                 <div className="text-sm text-purple-600">Active associations</div>
//                               </>
//                             )
//                           })()}
//                         </CardContent>
//                       </Card>
//                     </div>

//                     {/* Enhanced Network Chart */}
//                     <Card className="overflow-hidden border-slate-200 shadow-lg">
//                       <CardHeader className="bg-gradient-to-r from-slate-700 to-blue-700 text-white">
//                         <CardTitle className="flex items-center gap-3 text-xl">
//                           <Network className="h-6 w-6" />
//                           <div>
//                             <div>Enhanced Biomarker-Disease Network</div>
//                             <div className="text-slate-200 text-sm font-normal mt-1">
//                               Improved readability with advanced filtering • Adjustable node spacing • Smart clustering
//                               • Enhanced interactions
//                             </div>
//                           </div>
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent className="p-0">
//                         <NetworkChart data={data} width={1000} height={700} />
//                       </CardContent>
//                     </Card>

//                     {/* Enhanced Network Insights */}
//                     <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-lg">
//                       <CardHeader className="bg-gradient-to-r from-slate-700 to-blue-700 text-white">
//                         <CardTitle className="flex items-center gap-3">
//                           <Info className="h-6 w-6" />
//                           Enhanced Network Features & Interpretation
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent className="p-6">
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                           <div className="space-y-4">
//                             <h4 className="font-semibold text-slate-800 text-lg mb-3">Readability Improvements</h4>
//                             <div className="space-y-3">
//                               <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <Settings className="h-4 w-4 text-blue-600" />
//                                   <span className="font-medium text-blue-800">Adjustable Node Spacing</span>
//                                 </div>
//                                 <div className="text-sm text-blue-700">
//                                   Control node separation distance to reduce congestion and improve visual clarity
//                                 </div>
//                               </div>

//                               <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <Search className="h-4 w-4 text-green-600" />
//                                   <span className="font-medium text-green-800">Smart Search & Filtering</span>
//                                 </div>
//                                 <div className="text-sm text-green-700">
//                                   Search nodes by name and apply multiple filters to focus on specific relationships
//                                 </div>
//                               </div>

//                               <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <Eye className="h-4 w-4 text-amber-600" />
//                                   <span className="font-medium text-amber-800">Adaptive Label Display</span>
//                                 </div>
//                                 <div className="text-sm text-amber-700">
//                                   Labels shown only for highly connected nodes to reduce visual clutter
//                                 </div>
//                               </div>

//                               <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
//                                 <div className="flex items-center gap-2 mb-2">
//                                   <Network className="h-4 w-4 text-purple-600" />
//                                   <span className="font-medium text-purple-800">Smart Clustering</span>
//                                 </div>
//                                 <div className="text-sm text-purple-700">
//                                   Similar nodes are grouped together using connection patterns for better organization
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="space-y-4">
//                             <h4 className="font-semibold text-slate-800 text-lg mb-3">Enhanced Interactions</h4>
//                             <div className="space-y-3 text-sm">
//                               <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
//                                 <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
//                                 <div>
//                                   <span className="font-medium text-indigo-800">Fullscreen Mode:</span>
//                                   <span className="text-indigo-700 ml-1">
//                                     Expand network to full screen for detailed analysis of complex relationships
//                                   </span>
//                                 </div>
//                               </div>
//                               <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
//                                 <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
//                                 <div>
//                                   <span className="font-medium text-teal-800">Dynamic Highlighting:</span>
//                                   <span className="text-teal-700 ml-1">
//                                     Click disease nodes to highlight their connections and fade unrelated elements
//                                   </span>
//                                 </div>
//                               </div>
//                               <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg">
//                                 <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
//                                 <div>
//                                   <span className="font-medium text-rose-800">Enhanced Tooltips:</span>
//                                   <span className="text-rose-700 ml-1">
//                                     Detailed information on hover with improved styling and comprehensive data
//                                   </span>
//                                 </div>
//                               </div>
//                               <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
//                                 <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
//                                 <div>
//                                   <span className="font-medium text-orange-800">Improved Physics:</span>
//                                   <span className="text-orange-700 ml-1">
//                                     Better force simulation with collision detection and importance-based positioning
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   </div>
//                 ) : (
//                   <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg border-2 border-dashed border-slate-300">
//                     <div className="max-w-md mx-auto">
//                       <Network className="h-20 w-20 mx-auto mb-6 text-slate-400" />
//                       <h3 className="text-xl font-semibold text-slate-600 mb-3">No Network Data Available</h3>
//                       <p className="text-slate-500 leading-relaxed">
//                         The dataset does not contain sufficient biomarker association data for network visualization.
//                         Please ensure your data includes biomarker-disease relationships.
//                       </p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>

//       {/* Enhanced Tooltip */}
//       {tooltip && (
//         <div
//           className="fixed z-50 bg-slate-900 text-white p-4 rounded-xl shadow-2xl text-sm pointer-events-none border border-slate-700"
//           style={{
//             left: tooltip.x,
//             top: tooltip.y,
//             transform: "translate(-50%, -100%)",
//             maxWidth: "320px",
//           }}
//         >
//           <div className="font-bold text-blue-300 mb-1">{tooltip.biomarker.replace(/_/g, " ")}</div>
//           <div className="text-slate-300 mb-2">{tooltip.disease}</div>
//           <div className="space-y-1">
//             <div className="flex justify-between">
//               <span>Total Score:</span>
//               <span className="font-semibold">{(tooltip.total_avg || 0).toFixed(4)}</span>
//             </div>
//             {tooltip.avg_inhibitor !== null && tooltip.avg_inhibitor !== undefined && (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded" style={{ backgroundColor: "#10b981" }}></div>
//                   <span>Inhibitor:</span>
//                 </div>
//                 <span className="font-semibold">
//                   {(tooltip.avg_inhibitor || 0).toFixed(4)} ({(tooltip.percent_inhibitor || 0).toFixed(1)}%)
//                 </span>
//               </div>
//             )}
//             {tooltip.avg_promoter !== null && tooltip.avg_promoter !== undefined && (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f59e0b" }}></div>
//                   <span>Promoter:</span>
//                 </div>
//                 <span className="font-semibold">
//                   {(tooltip.avg_promoter || 0).toFixed(4)} ({(tooltip.percent_promoter || 0).toFixed(1)}%)
//                 </span>
//               </div>
//             )}
//             {tooltip.avg_unknown !== null && tooltip.avg_unknown !== undefined && (
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-2">
//                   <div className="w-3 h-3 bg-gray-500 rounded"></div>
//                   <span>Unknown:</span>
//                 </div>
//                 <span className="font-semibold">
//                   {(tooltip.avg_unknown || 0).toFixed(4)} ({(tooltip.percent_unknown || 0).toFixed(1)}%)
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Enhanced Legend */}
//       <div className="bg-white border-t border-slate-200 px-6 py-4">
//         <div className="flex items-center justify-center gap-8 text-sm">
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-4 rounded-full bg-blue-500"></div>
//             <span className="font-medium">High-connection biomarkers</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 rounded-full bg-orange-500"></div>
//             <span className="font-medium">High-connection diseases</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-1 rounded bg-green-500"></div>
//             <span className="font-medium">Antagonist</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-4 h-1 rounded bg-amber-500"></div>
//             <span className="font-medium">Agonist</span>
//           </div>
//           <div className="flex items-center gap-2">
//             <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
//             <span className="font-medium">No Data</span>
//           </div>
//           <div className="text-slate-500">
//             <Info className="h-4 w-4 inline mr-1" />
//             Enhanced with smart filtering, adjustable spacing, and improved interactions
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



"use client"

import { useState, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
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
  Loader2,
  Network,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  Settings,
  Eye,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import * as d3 from "d3"

// Top Biomarkers Bar Chart Component
const TopBiomarkersChart = ({ data, symptom, width = 800, height = 300 }) => {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return

    // Calculate top promoters and inhibitors
    const biomarkerScores = []

    Object.keys(data).forEach((biomarker) => {
      Object.keys(data[biomarker]).forEach((disease) => {
        const datum = data[biomarker][disease]
        if (datum) {
          const inhibitorScore = -(datum.avg_inhibitor || 0) // Negative for left side
          const promoterScore = datum.avg_promoter || 0 // Positive for right side

          if (inhibitorScore < 0) {
            biomarkerScores.push({
              biomarker: biomarker.replace(/_/g, " "),
              score: inhibitorScore,
              type: "inhibitor",
              disease: disease,
            })
          }

          if (promoterScore > 0) {
            biomarkerScores.push({
              biomarker: biomarker.replace(/_/g, " "),
              score: promoterScore,
              type: "promoter",
              disease: disease,
            })
          }
        }
      })
    })

    // Get top 5 inhibitors and promoters
    const topInhibitors = biomarkerScores
      .filter((d) => d.type === "inhibitor")
      .sort((a, b) => a.score - b.score) // Most negative first
      .slice(0, 5)

    const topPromoters = biomarkerScores
      .filter((d) => d.type === "promoter")
      .sort((a, b) => b.score - a.score) // Highest positive first
      .slice(0, 5)

    // Combine and create unique biomarker list
    const allTopBiomarkers = [...topInhibitors, ...topPromoters]
    const uniqueBiomarkers = Array.from(new Set(allTopBiomarkers.map((d) => d.biomarker)))
      .map((biomarker) => {
        const inhibitor = topInhibitors.find((d) => d.biomarker === biomarker)
        const promoter = topPromoters.find((d) => d.biomarker === biomarker)
        return {
          biomarker,
          inhibitorScore: inhibitor ? inhibitor.score : 0,
          promoterScore: promoter ? promoter.score : 0,
        }
      })
      .slice(0, 7) // Show top 7 biomarkers

    if (uniqueBiomarkers.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 40, right: 60, bottom: 60, left: 400 } // Increased from 120 to 180
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Scales
    const yScale = d3
      .scaleBand()
      .domain(uniqueBiomarkers.map((d) => d.biomarker))
      .range([0, chartHeight])
      .padding(0.2)

    const maxAbsScore = d3.max(uniqueBiomarkers, (d) => Math.max(Math.abs(d.inhibitorScore), Math.abs(d.promoterScore)))

    const xScale = d3
      .scaleLinear()
      .domain([-maxAbsScore * 1.1, maxAbsScore * 1.1])
      .range([0, chartWidth])

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .attr("fill", "#1f2937")
      .text(`Top Agonist and Antagonist for ${symptom}`)

    // Add center line
    g.append("line")
      .attr("x1", xScale(0))
      .attr("x2", xScale(0))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "#6b7280")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "3,3")

    // Add inhibitor bars (negative, orange)
    g.selectAll(".inhibitor-bar")
      .data(uniqueBiomarkers.filter((d) => d.inhibitorScore < 0))
      .enter()
      .append("rect")
      .attr("class", "inhibitor-bar")
      .attr("x", (d) => xScale(d.inhibitorScore))
      .attr("y", (d) => yScale(d.biomarker))
      .attr("width", (d) => xScale(0) - xScale(d.inhibitorScore))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#fb923c")
      .attr("opacity", 0.8)

    // Add promoter bars (positive, yellow)
    g.selectAll(".promoter-bar")
      .data(uniqueBiomarkers.filter((d) => d.promoterScore > 0))
      .enter()
      .append("rect")
      .attr("class", "promoter-bar")
      .attr("x", xScale(0))
      .attr("y", (d) => yScale(d.biomarker))
      .attr("width", (d) => xScale(d.promoterScore) - xScale(0))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#fbbf24")
      .attr("opacity", 0.8)

    // Add Y axis
    g.append("g").call(d3.axisLeft(yScale)).selectAll("text").attr("font-size", "12px").attr("fill", "#374151")

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format(".2f")))
      .selectAll("text")
      .attr("font-size", "11px")
      .attr("fill", "#6b7280")

    // Add X axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#6b7280")
      .text("Association Score")

    // Add legend
    const legend = svg.append("g").attr("transform", `translate(${width - 50}, 50)`)

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#fb923c")
      .attr("opacity", 0.8)

    legend
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("font-size", "11px")
      .attr("fill", "#374151")
      .text("Antagonist")

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 25)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", "#fbbf24")
      .attr("opacity", 0.8)

    legend.append("text").attr("x", 20).attr("y", 37).attr("font-size", "11px").attr("fill", "#374151").text("Agonist")
  }, [data, symptom, width, height])

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <svg ref={svgRef} width={width + 200} height={height} />
    </div>
  )
}

// Enhanced Network Chart Component with much better readability
const NetworkChart = ({ data, width = 1000, height = 700 }) => {
  const svgRef = useRef(null)
  const [allNodes, setAllNodes] = useState([])
  const [allLinks, setAllLinks] = useState([])
  const [filteredNodes, setFilteredNodes] = useState([])
  const [filteredLinks, setFilteredLinks] = useState([])
  const [simulation, setSimulation] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedNetworkDisease, setSelectedNetworkDisease] = useState(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Enhanced filter states
  const [selectedDisease, setSelectedDisease] = useState("")
  const [selectedBiomarker, setSelectedBiomarker] = useState("")
  const [connectionType, setConnectionType] = useState("all")
  const [strengthThreshold, setStrengthThreshold] = useState([0])
  const [showOnlyConnected, setShowOnlyConnected] = useState(true)
  const [nodeSearchTerm, setNodeSearchTerm] = useState("")

  // New layout and visualization controls
  const [layoutType, setLayoutType] = useState("force") // force, circular, hierarchical
  const [nodeSpacing, setNodeSpacing] = useState([150]) // Increased default spacing
  const [edgeBundling, setEdgeBundling] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [labelThreshold, setLabelThreshold] = useState([2]) // Only show labels for nodes with >= connections
  const [clusterSimilar, setClusterSimilar] = useState(true)
  const [highlightMode, setHighlightMode] = useState("neighbors") // neighbors, path, none

  // Initialize nodes and links from data
  useEffect(() => {
    if (!data || Object.keys(data).length === 0) {
      console.log("No data provided to NetworkChart")
      return
    }

    console.log("Processing network data:", data)

    const biomarkers = Object.keys(data)
    const diseases = Array.from(new Set(biomarkers.flatMap((biomarker) => Object.keys(data[biomarker] || {}))))

    console.log("Found biomarkers:", biomarkers.length, "diseases:", diseases.length)

    // Create nodes with enhanced properties
    const newNodes = []

    // Add biomarker nodes
    biomarkers.forEach((biomarker) => {
      const connections = diseases.filter((disease) => data[biomarker]?.[disease]?.total_avg > 0).length
      const totalStrength = diseases.reduce((sum, disease) => {
        const datum = data[biomarker]?.[disease]
        return sum + (datum?.total_avg || 0)
      }, 0)

      const node = {
        id: biomarker,
        type: "biomarker",
        name: biomarker.replace(/_/g, " "),
        connections: connections,
        totalStrength: totalStrength,
        importance: connections * totalStrength, // Combined metric for importance
        group: Math.floor(connections / 3), // Group for clustering
      }
      newNodes.push(node)
    })

    // Add disease nodes
    diseases.forEach((disease) => {
      const connections = biomarkers.filter((biomarker) => data[biomarker]?.[disease]?.total_avg > 0).length
      const totalStrength = biomarkers.reduce((sum, biomarker) => {
        const datum = data[biomarker]?.[disease]
        return sum + (datum?.total_avg || 0)
      }, 0)

      const node = {
        id: disease,
        type: "disease",
        name: disease,
        connections: connections,
        totalStrength: totalStrength,
        importance: connections * totalStrength,
        group: Math.floor(connections / 3) + 10, // Offset disease groups
      }
      newNodes.push(node)
    })

    // Create links with improved edge type detection
    const newLinks = []
    biomarkers.forEach((biomarker) => {
      diseases.forEach((disease) => {
        const datum = data[biomarker]?.[disease]
        if (datum && datum.total_avg > 0) {
          let edgeType = "unknown"
          const inhibitorScore = datum.avg_inhibitor || 0
          const promoterScore = datum.avg_promoter || 0
          const unknownScore = datum.avg_unknown || 0

          if (inhibitorScore > promoterScore && inhibitorScore > unknownScore && inhibitorScore > 0.001) {
            edgeType = "inhibitor"
          } else if (promoterScore > unknownScore && promoterScore > 0.001) {
            edgeType = "promoter"
          } else if (unknownScore > 0.001) {
            edgeType = "unknown"
          }

          const strength = datum.total_avg
          const link = {
            source: biomarker,
            target: disease,
            type: edgeType,
            strength: strength,
            width: Math.max(1, Math.min(8, strength * 20)), // Increased max width
            data: datum,
            importance: strength * 10, // For edge filtering
          }

          newLinks.push(link)
        }
      })
    })

    console.log("Created nodes:", newNodes.length, "links:", newLinks.length)
    setAllNodes(newNodes)
    setAllLinks(newLinks)
  }, [data])

  // Enhanced filtering with search
  useEffect(() => {
    if (!allNodes.length || !allLinks.length) {
      return
    }

    let filteredLinkSet = [...allLinks]
    let filteredNodeSet = [...allNodes]

    // Helper function to get source/target ID from link
    const getSourceId = (link) => (typeof link.source === "object" ? link.source.id : link.source)
    const getTargetId = (link) => (typeof link.target === "object" ? link.target.id : link.target)

    // Filter by search term
    if (nodeSearchTerm) {
      const searchLower = nodeSearchTerm.toLowerCase()
      const matchingNodeIds = new Set(
        filteredNodeSet.filter((node) => node.name.toLowerCase().includes(searchLower)).map((node) => node.id),
      )

      // Keep links that connect to matching nodes
      filteredLinkSet = filteredLinkSet.filter(
        (link) => matchingNodeIds.has(getSourceId(link)) || matchingNodeIds.has(getTargetId(link)),
      )
    }

    // Filter by selected disease
    if (selectedDisease) {
      filteredLinkSet = filteredLinkSet.filter((link) => {
        const targetId = getTargetId(link)
        return targetId === selectedDisease
      })
    }

    // Filter by selected biomarker
    if (selectedBiomarker) {
      filteredLinkSet = filteredLinkSet.filter((link) => {
        const sourceId = getSourceId(link)
        return sourceId === selectedBiomarker
      })
    }

    // Filter by connection type
    if (connectionType !== "all") {
      filteredLinkSet = filteredLinkSet.filter((link) => link.type === connectionType)
    }

    // Filter by strength threshold
    if (strengthThreshold[0] > 0) {
      filteredLinkSet = filteredLinkSet.filter((link) => link.strength >= strengthThreshold[0])
    }

    // Filter nodes based on connections
    if (showOnlyConnected) {
      const connectedNodeIds = new Set()
      filteredLinkSet.forEach((link) => {
        connectedNodeIds.add(getSourceId(link))
        connectedNodeIds.add(getTargetId(link))
      })
      filteredNodeSet = filteredNodeSet.filter((node) => connectedNodeIds.has(node.id))
    }

    // Apply search filter to nodes
    if (nodeSearchTerm) {
      const searchLower = nodeSearchTerm.toLowerCase()
      const relevantNodeIds = new Set()

      // Add directly matching nodes
      filteredNodeSet.forEach((node) => {
        if (node.name.toLowerCase().includes(searchLower)) {
          relevantNodeIds.add(node.id)
        }
      })

      // Add connected nodes
      filteredLinkSet.forEach((link) => {
        const sourceId = getSourceId(link)
        const targetId = getTargetId(link)
        if (relevantNodeIds.has(sourceId)) relevantNodeIds.add(targetId)
        if (relevantNodeIds.has(targetId)) relevantNodeIds.add(sourceId)
      })

      filteredNodeSet = filteredNodeSet.filter((node) => relevantNodeIds.has(node.id))
    }

    console.log("Final filtered results:", {
      nodes: filteredNodeSet.length,
      links: filteredLinkSet.length,
    })

    setFilteredNodes(filteredNodeSet)
    setFilteredLinks(filteredLinkSet)
  }, [
    allNodes,
    allLinks,
    connectionType,
    strengthThreshold,
    selectedDisease,
    selectedBiomarker,
    showOnlyConnected,
    nodeSearchTerm,
  ])

  // Enhanced D3 visualization with better layout
  useEffect(() => {
    if (!filteredNodes.length || !svgRef.current) {
      return
    }

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Helper functions
    const getSourceId = (d) => (typeof d.source === "object" ? d.source.id : d.source)
    const getTargetId = (d) => (typeof d.target === "object" ? d.target.id : d.target)

    // Create zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform)
      })

    svg.call(zoom)

    const g = svg.append("g")

    // Enhanced highlighting logic
    const isHighlighted = (nodeId) => {
      if (!selectedNetworkDisease) return true

      if (highlightMode === "neighbors") {
        return (
          nodeId === selectedNetworkDisease ||
          filteredLinks.some(
            (link) =>
              (getSourceId(link) === nodeId && getTargetId(link) === selectedNetworkDisease) ||
              (getTargetId(link) === nodeId && getSourceId(link) === selectedNetworkDisease),
          )
        )
      }

      return nodeId === selectedNetworkDisease
    }

    const isLinkHighlighted = (link) => {
      if (!selectedNetworkDisease) return true
      const sourceId = getSourceId(link)
      const targetId = getTargetId(link)
      return sourceId === selectedNetworkDisease || targetId === selectedNetworkDisease
    }

    // Create links with enhanced styling
    const linkGroup = g.append("g").attr("class", "links")
    const link = linkGroup
      .selectAll("line")
      .data(filteredLinks, (d) => `${getSourceId(d)}-${getTargetId(d)}`)
      .enter()
      .append("line")
      .attr("stroke", (d) => {
        switch (d.type) {
          case "inhibitor":
            return "#10b981" // Better green
          case "promoter":
            return "#f59e0b" // Better amber
          default:
            return "#6b7280"
        }
      })
      .attr("stroke-width", (d) => Math.max(1, d.width * 0.8)) // Slightly thinner
      .attr("stroke-opacity", (d) => (isLinkHighlighted(d) ? 0.8 : 0.15)) // Better contrast
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("stroke-opacity", 1)
          .attr("stroke-width", d.width + 2)

        // Enhanced tooltip
        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "network-tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.95)")
          .style("color", "white")
          .style("padding", "12px")
          .style("border-radius", "8px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000")
          .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)")
          .html(`
            <div class="font-bold text-blue-300 mb-2">${typeof d.source === "object" ? d.source.name || d.source.id : d.source} → ${typeof d.target === "object" ? d.target.name || d.target.id : d.target}</div>
            <div class="space-y-1">
              <div>Type: <span class="font-semibold">${d.type.charAt(0).toUpperCase() + d.type.slice(1)}</span></div>
              <div>Strength: <span class="font-semibold">${d.strength.toFixed(4)}</span></div>
              <div>Inhibitor: <span class="font-semibold">${(d.data.avg_inhibitor || 0).toFixed(4)}</span></div>
              <div>Promoter: <span class="font-semibold">${(d.data.avg_promoter || 0).toFixed(4)}</span></div>
            </div>
          `)

        tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("stroke-opacity", isLinkHighlighted(d) ? 0.8 : 0.15)
          .attr("stroke-width", Math.max(1, d.width * 0.8))
        d3.selectAll(".network-tooltip").remove()
      })

    // Create nodes with enhanced sizing and styling
    const nodeGroup = g.append("g").attr("class", "nodes")
    const node = nodeGroup
      .selectAll("circle")
      .data(filteredNodes, (d) => d.id)
      .enter()
      .append("circle")
      .attr("r", (d) => {
        // Enhanced size calculation based on importance
        const baseSize = d.type === "biomarker" ? 8 : 6
        const importanceBonus = Math.min(12, Math.sqrt(d.importance) * 2)
        return baseSize + importanceBonus
      })
      .attr("fill", (d) => {
        // Enhanced colors with better contrast
        if (d.type === "biomarker") {
          return d.connections > 5 ? "#3b82f6" : "#93c5fd" // Blue gradient
        } else {
          return d.connections > 5 ? "#f97316" : "#fdba74" // Orange gradient
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", (d) => (isHighlighted(d.id) ? 1 : 0.3))
      .style("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 3)
        setSelectedNode(d)
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke", "#fff").attr("stroke-width", 2)
      })
      .on("click", (event, d) => {
        if (d.type === "disease") {
          if (selectedNetworkDisease === d.id) {
            setSelectedNetworkDisease(null)
          } else {
            setSelectedNetworkDisease(d.id)
          }
        }

        // Handle node pinning
        if (d.fx === null || d.fx === undefined) {
          d.fx = d.x
          d.fy = d.y
        } else {
          d.fx = null
          d.fy = null
        }
        if (simulation) {
          simulation.alpha(0.3).restart()
        }
      })

    // Enhanced drag behavior
    const drag = d3
      .drag()
      .on("start", (event, d) => {
        if (!event.active && simulation) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on("drag", (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on("end", (event, d) => {
        if (!event.active && simulation) simulation.alphaTarget(0)
      })

    node.call(drag)

    // Enhanced labels with better positioning
    const labelGroup = g.append("g").attr("class", "labels")
    const labels = labelGroup
      .selectAll("text")
      .data(
        filteredNodes.filter((d) => showLabels && d.connections >= labelThreshold[0]),
        (d) => d.id,
      )
      .enter()
      .append("text")
      .text((d) => {
        const name = d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name
        return name
      })
      .attr("font-size", (d) => Math.max(8, Math.min(12, 8 + d.connections * 0.5)))
      .attr("font-weight", "600")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => {
        const baseSize = d.type === "biomarker" ? 8 : 6
        const importanceBonus = Math.min(12, Math.sqrt(d.importance) * 2)
        return baseSize + importanceBonus + 18
      })
      .attr("fill", "#1f2937")
      .attr("opacity", (d) => (isHighlighted(d.id) ? 1 : 0.4))
      .style("pointer-events", "none")
      .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)")

    // Enhanced simulation with better forces
    let newSimulation
    if (simulation) {
      simulation.stop()
    }

    newSimulation = d3
      .forceSimulation(filteredNodes)
      .force(
        "link",
        d3
          .forceLink(filteredLinks)
          .id((d) => d.id)
          .distance((d) => {
            // Dynamic distance based on node importance and spacing setting
            const baseDistance = nodeSpacing[0]
            const importanceFactor = 1 - (d.importance / 100) * 0.3 // Reduce distance for important connections
            return baseDistance * importanceFactor
          })
          .strength(0.3), // Reduced strength for less aggressive pulling
      )
      .force(
        "charge",
        d3.forceManyBody().strength((d) => {
          // Enhanced repulsion based on importance
          const baseRepulsion = -300
          const importanceMultiplier = 1 + d.importance / 50
          return baseRepulsion * importanceMultiplier
        }),
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) => {
            const baseSize = d.type === "biomarker" ? 8 : 6
            const importanceBonus = Math.min(12, Math.sqrt(d.importance) * 2)
            return baseSize + importanceBonus + 8 // Extra padding
          })
          .strength(0.8), // Strong collision detection
      )
      .force("x", d3.forceX(width / 2).strength(0.05)) // Weaker centering
      .force("y", d3.forceY(height / 2).strength(0.05))

    // Add clustering force if enabled
    if (clusterSimilar) {
      newSimulation.force("cluster", (alpha) => {
        filteredNodes.forEach((d) => {
          const cluster = d.group
          const clusterNodes = filteredNodes.filter((n) => n.group === cluster)
          if (clusterNodes.length > 1) {
            const centerX = d3.mean(clusterNodes, (n) => n.x || 0)
            const centerY = d3.mean(clusterNodes, (n) => n.y || 0)
            d.vx += (centerX - d.x) * alpha * 0.1
            d.vy += (centerY - d.y) * alpha * 0.1
          }
        })
      })
    }

    // Update positions on simulation tick
    newSimulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y)

      labels.attr("x", (d) => d.x).attr("y", (d) => d.y)
    })

    newSimulation.alpha(1).restart()
    setSimulation(newSimulation)

    return () => {
      if (newSimulation) {
        newSimulation.stop()
      }
      d3.selectAll(".network-tooltip").remove()
    }
  }, [
    filteredNodes,
    filteredLinks,
    selectedNetworkDisease,
    width,
    height,
    nodeSpacing,
    showLabels,
    labelThreshold,
    clusterSimilar,
    highlightMode,
  ])

  // Update opacity when selectedNetworkDisease changes
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const getSourceId = (d) => (typeof d.source === "object" ? d.source.id : d.source)
    const getTargetId = (d) => (typeof d.target === "object" ? d.target.id : d.target)

    const isHighlighted = (nodeId) => {
      if (!selectedNetworkDisease) return true
      if (highlightMode === "neighbors") {
        return (
          nodeId === selectedNetworkDisease ||
          filteredLinks.some(
            (link) =>
              (getSourceId(link) === nodeId && getTargetId(link) === selectedNetworkDisease) ||
              (getTargetId(link) === nodeId && getSourceId(link) === selectedNetworkDisease),
          )
        )
      }
      return nodeId === selectedNetworkDisease
    }

    const isLinkHighlighted = (link) => {
      if (!selectedNetworkDisease) return true
      const sourceId = getSourceId(link)
      const targetId = getTargetId(link)
      return sourceId === selectedNetworkDisease || targetId === selectedNetworkDisease
    }

    svg
      .selectAll("circle")
      .transition()
      .duration(300)
      .attr("opacity", (d) => (isHighlighted(d.id) ? 1 : 0.3))

    svg
      .selectAll("line")
      .transition()
      .duration(300)
      .attr("stroke-opacity", (d) => (isLinkHighlighted(d) ? 0.8 : 0.15))

    svg
      .selectAll("text")
      .transition()
      .duration(300)
      .attr("opacity", (d) => (isHighlighted(d.id) ? 1 : 0.4))
  }, [selectedNetworkDisease, filteredLinks, highlightMode])

  const handleReset = () => {
    if (simulation) {
      filteredNodes.forEach((node) => {
        node.fx = null
        node.fy = null
      })
      simulation.alpha(1).restart()
    }
  }

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(d3.zoom().scaleBy, 1.5)
  }

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().call(d3.zoom().scaleBy, 1 / 1.5)
  }

  const clearFilters = () => {
    setSelectedDisease("")
    setSelectedBiomarker("")
    setConnectionType("all")
    setStrengthThreshold([0])
    setShowOnlyConnected(true)
    setSelectedNetworkDisease(null)
    setNodeSearchTerm("")
  }

  // Get unique values for dropdowns
  const diseases = Array.from(new Set(allLinks.map((l) => (typeof l.target === "object" ? l.target.id : l.target))))
  const biomarkers = Array.from(new Set(allLinks.map((l) => (typeof l.source === "object" ? l.source.id : l.source))))

  const currentWidth = isFullscreen ? window.innerWidth - 100 : width
  const currentHeight = isFullscreen ? window.innerHeight - 200 : height

  return (
    <div className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-white p-4" : ""}`}>
      {/* Enhanced Filter Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg border border-slate-200 shadow-lg max-w-sm">
        <div className="p-3 border-b border-slate-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full justify-between text-sm font-semibold"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Network Controls
            </div>
            {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {isFiltersOpen && (
          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Search Nodes</label>
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search biomarkers or diseases..."
                  value={nodeSearchTerm}
                  onChange={(e) => setNodeSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Focus Controls */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Focus Disease</label>
                <select
                  value={selectedDisease}
                  onChange={(e) => setSelectedDisease(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Diseases</option>
                  {diseases.map((disease) => (
                    <option key={disease} value={disease}>
                      {disease}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Focus Biomarker</label>
                <select
                  value={selectedBiomarker}
                  onChange={(e) => setSelectedBiomarker(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Biomarkers</option>
                  {biomarkers.map((biomarker) => (
                    <option key={biomarker} value={biomarker}>
                      {biomarker.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Connection Filters */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Connection Type</label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                className="w-full p-2 text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="inhibitor">Inhibitor Only</option>
                <option value="promoter">Promoter Only</option>
                <option value="unknown">Unknown Only</option>
              </select>
            </div>

            {/* Strength Threshold */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">
                Min Strength: {strengthThreshold[0].toFixed(3)}
              </label>
              <Slider
                value={strengthThreshold}
                onValueChange={setStrengthThreshold}
                max={0.1}
                min={0}
                step={0.001}
                className="w-full"
              />
            </div>

            {/* Layout Controls */}
            <div className="border-t pt-3">
              <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Layout Settings
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Node Spacing: {nodeSpacing[0]}px
                  </label>
                  <Slider
                    value={nodeSpacing}
                    onValueChange={setNodeSpacing}
                    max={300}
                    min={50}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Label Threshold: {labelThreshold[0]} connections
                  </label>
                  <Slider
                    value={labelThreshold}
                    onValueChange={setLabelThreshold}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Show Labels</label>
                  <Switch checked={showLabels} onCheckedChange={setShowLabels} />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Cluster Similar</label>
                  <Switch checked={clusterSimilar} onCheckedChange={setClusterSimilar} />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700">Connected Only</label>
                  <Switch checked={showOnlyConnected} onCheckedChange={setShowOnlyConnected} />
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <Button variant="outline" size="sm" onClick={clearFilters} className="w-full text-xs">
              Clear All Filters
            </Button>

            {/* Stats */}
            <div className="border-t pt-3 text-xs text-slate-600">
              <div>
                Showing: {filteredNodes.length} nodes, {filteredLinks.length} edges
              </div>
              {selectedNetworkDisease && (
                <div className="mt-1 text-blue-600 font-medium">Highlighting: {selectedNetworkDisease}</div>
              )}
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded"></div>
                  <span>{filteredLinks.filter((l) => l.type === "inhibitor").length} inhibitor</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded"></div>
                  <span>{filteredLinks.filter((l) => l.type === "promoter").length} promoter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded"></div>
                  <span>{filteredLinks.filter((l) => l.type === "unknown").length} unknown</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset} className="bg-white/90 backdrop-blur-sm">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomIn} className="bg-white/90 backdrop-blur-sm">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomOut} className="bg-white/90 backdrop-blur-sm">
          <ZoomOut className="h-4 w-4" />
        </Button>
      </div>

      {/* Network SVG */}
      <svg
        ref={svgRef}
        width={currentWidth}
        height={currentHeight}
        className="border border-slate-200 rounded-lg bg-white"
      />

      {/* Enhanced Node Info Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg border border-slate-200 shadow-lg max-w-xs">
          <h4 className="font-semibold text-slate-800 mb-2">{selectedNode.name}</h4>
          <div className="text-sm text-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    selectedNode.type === "biomarker"
                      ? selectedNode.connections > 5
                        ? "#3b82f6"
                        : "#93c5fd"
                      : selectedNode.connections > 5
                        ? "#f97316"
                        : "#fdba74",
                }}
              />
              <span className="capitalize">{selectedNode.type}</span>
            </div>
            <div className="text-xs space-y-1">
              <div>
                Connections: <span className="font-semibold">{selectedNode.connections}</span>
              </div>
              <div>
                Total Strength: <span className="font-semibold">{selectedNode.totalStrength?.toFixed(4)}</span>
              </div>
              <div>
                Importance: <span className="font-semibold">{selectedNode.importance?.toFixed(2)}</span>
              </div>
              <div className="text-slate-500 mt-2">
                {selectedNode.type === "biomarker"
                  ? "Click to pin/unpin • Drag to move"
                  : "Click disease to highlight • Drag to move"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg border border-slate-200 shadow-lg">
        <h4 className="font-semibold text-slate-800 mb-3 text-sm">Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500" />
            <span>High-connection biomarkers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-300" />
            <span>Low-connection biomarkers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span>High-connection diseases</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-300" />
            <span>Low-connection diseases</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-green-500" />
            <span>Inhibitor (width = strength)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-amber-500" />
            <span>Promoter (width = strength)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-gray-400" />
            <span>Unknown (width = strength)</span>
          </div>
          <div className="text-slate-500 mt-2 text-xs">
            💡 Use filters to focus • Click diseases to highlight • Drag nodes to explore
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SymptomInfographic() {
  // Handle API response with NaN values
  const handleApiResponse = async (response) => {
    try {
      // Get the raw text from the response
      const text = await response.text()

      // Replace NaN with null in the text before parsing
      const cleanedText = text.replace(/:\s*NaN/g, ": null")

      // Parse the cleaned JSON
      const data = JSON.parse(cleanedText)

      // Return the entire response object, but filter the result array if it exists
      if (data.result && Array.isArray(data.result)) {
        data.result = data.result.filter((item) => {
          // Check if the item has meaningful data
          return (
            item.Insights ||
            (item.Direction && item.Direction !== "null") ||
            (item["Quantified Changes"] && item["Quantified Changes"] !== "null")
          )
        })
      }

      return data
    } catch (error) {
      console.error("Error processing API response:", error)
      throw new Error(`Failed to process API response: ${error.message}`)
    }
  }

  // Process the API data to filter out N/A entries
  const processApiData = (data) => {
    if (!Array.isArray(data)) return []

    // Filter out entries where most fields are N/A or null
    return data.filter((item) => {
      // Check if the item has meaningful data
      const hasInsights = item.Insights && item.Insights !== "N/A" && item.Insights !== "NA"
      const hasDirection = item.Direction && item.Direction !== "N/A" && item.Direction !== "NA"
      const hasChanges =
        item.Quantified_Changes && item.Quantified_Changes !== "N/A" && item.Quantified_Changes !== "NA"

      return hasInsights || hasDirection || hasChanges
    })
  }

  const location = useLocation()
  const { symptomData, disease } = location.state || {}

  // Move this line up before the filter logic (around line 90)
  const { nested_assoc: data, plots, symptom } = symptomData

  const [tooltip, setTooltip] = useState(null)
  const [selectedDisease, setSelectedDisease] = useState(null)
  const [diseaseDetails, setDiseaseDetails] = useState(null)
  const [selectedCircle, setSelectedCircle] = useState(null)
  const [circleDetails, setCircleDetails] = useState(null)
  const [activeTab, setActiveTab] = useState("matrix")
  const [zoomLevel, setZoomLevel] = useState(1)
  const [apiData, setApiData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const svgContainerRef = useRef(null)
  const detailsSectionRef = useRef(null)

  const [biomarkerFilter, setBiomarkerFilter] = useState("")
  const [diseaseFilter, setDiseaseFilter] = useState("")
  const [scoreThreshold, setScoreThreshold] = useState(0)
  const [showOnlyWithData, setShowOnlyWithData] = useState(false)

  const [chartType, setChartType] = useState("combined")
  const [topN, setTopN] = useState(10)
  const [sortBy, setSortBy] = useState("score")

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

  // Apply filters to biomarkers and diseases
  const filteredBiomarkers = biomarkers.filter((biomarker) =>
    biomarker.toLowerCase().includes(biomarkerFilter.toLowerCase()),
  )

  const filteredDiseases = diseases.filter((disease) => disease.toLowerCase().includes(diseaseFilter.toLowerCase()))

  // Further filter based on score threshold and data availability
  const finalBiomarkers = filteredBiomarkers.filter((biomarker) => {
    if (!showOnlyWithData && scoreThreshold === 0) return true

    const hasValidData = filteredDiseases.some((disease) => {
      const datum = data[biomarker]?.[disease]
      if (!datum) return !showOnlyWithData
      return datum.total_avg >= scoreThreshold
    })

    return hasValidData
  })

  const finalDiseases = filteredDiseases.filter((disease) => {
    if (!showOnlyWithData && scoreThreshold === 0) return true

    const hasValidData = finalBiomarkers.some((biomarker) => {
      const datum = data[biomarker]?.[disease]
      if (!datum) return !showOnlyWithData
      return datum.total_avg >= scoreThreshold
    })

    return hasValidData
  })

  console.log("Total biomarkers:", biomarkers.length)
  console.log("Total diseases:", diseases.length)
  console.log("Diseases:", diseases)

  const width = Math.max(finalDiseases.length * cellSize + margin.left + margin.right, 1200)
  const height = finalBiomarkers.length * cellSize + margin.top + margin.bottom

  // Scroll to center on initial load
  useEffect(() => {
    if (svgContainerRef.current) {
      const container = svgContainerRef.current
      container.scrollLeft = (width * zoomLevel - container.clientWidth) / 2
    }
  }, [width, zoomLevel])

  // Auto-scroll to details section when details are shown
  useEffect(() => {
    if ((selectedDisease && diseaseDetails) || (selectedCircle && circleDetails)) {
      setTimeout(() => {
        detailsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    }
  }, [selectedDisease, diseaseDetails, selectedCircle, circleDetails])

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

  // Create gradient for colored circles (inhibitor, promoter, unknown)
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

  // Handle mouse events for tooltip
  const handleMouseEnter = (biomarker, disease, datum, event) => {
    if (!datum) return
    const rect = event.currentTarget.getBoundingClientRect()
    setTooltip({
      biomarker,
      disease,
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

  // Handle disease click
  const handleDiseaseClick = (disease) => {
    // Clear circle selection when selecting a disease
    setSelectedCircle(null)
    setCircleDetails(null)
    setApiData(null)
    setApiError(null)

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
          diseaseStats.strongestInhibitor = {
            biomarker,
            score: datum.avg_inhibitor,
          }
        }

        if ((datum.avg_promoter || 0) > maxPromoter) {
          maxPromoter = datum.avg_promoter || 0
          diseaseStats.strongestPromoter = {
            biomarker,
            score: datum.avg_promoter,
          }
        }

        if ((datum.avg_unknown || 0) > maxUnknown) {
          maxUnknown = datum.avg_unknown || 0
          diseaseStats.strongestUnknown = {
            biomarker,
            score: datum.avg_unknown,
          }
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

  // Handle circle click with API call
  const handleCircleClick = async (biomarker, disease, datum) => {
    if (!datum) return

    // Clear disease selection when selecting a circle
    setSelectedDisease(null)
    setDiseaseDetails(null)

    setSelectedCircle({ biomarker, disease })
    setCircleDetails({
      biomarker,
      disease,
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

    // Make API call to get additional data
    setIsLoading(true)
    setApiData(null)
    setApiError(null)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ligmaballs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          disease: disease,
          biomarker: biomarker,
          symptom_data: symptomData,
        }),
      })

      if (response.status === 404) {
        // Handle 404 specifically - no data found
        setApiData([])
        setApiError(null)
        return
      }

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      // Use the new handler function
      const processedData = await handleApiResponse(response)
      console.log("Processed API data:", processedData)

      setApiData(processedData)
    } catch (error) {
      console.error("Error fetching data from API:", error)
      setApiError(error.message || "Failed to fetch data from API")
    } finally {
      setIsLoading(false)
    }
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
            {finalBiomarkers.length} biomarkers × {finalDiseases.length} diseases
            {(biomarkerFilter || diseaseFilter || scoreThreshold > 0 || showOnlyWithData) &&
              ` (filtered from ${biomarkers.length} × ${diseases.length})`}
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
                  <Network className="h-4 w-4" />
                  <span>Network Analysis</span>
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
            <div className="space-y-4">
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Search Diseases</label>
                    <input
                      type="text"
                      placeholder="Filter diseases..."
                      value={diseaseFilter}
                      onChange={(e) => setDiseaseFilter(e.target.value)}
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
                  className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-auto"
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
                        finalDiseases.map((disease, diseaseIndex) => {
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

                      {/* X-axis labels (Diseases) - positioned at top with better spacing */}
                      {finalDiseases.map((disease, index) => (
                        <g key={disease}>
                          <text
                            x={margin.left + index * cellSize + cellSize / 2}
                            y={margin.top - 40}
                            textAnchor="start"
                            dominantBaseline="middle"
                            className="text-sm font-semibold fill-slate-700 hover:fill-blue-600 cursor-pointer transition-colors"
                            transform={`rotate(-45, ${
                              margin.left + index * cellSize + cellSize / 2
                            }, ${margin.top - 40})`}
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
                      {finalBiomarkers.map((biomarker, biomarkerIndex) =>
                        finalDiseases.map((disease, diseaseIndex) => {
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
                      {finalBiomarkers.map((_, index) => (
                        <line
                          key={`hgrid-${index}`}
                          x1={margin.left - 5}
                          y1={margin.top + index * cellSize}
                          x2={margin.left + finalDiseases.length * cellSize}
                          y2={margin.top + index * cellSize}
                          stroke="#f1f5f9"
                          strokeWidth="1"
                        />
                      ))}
                      {finalDiseases.map((_, index) => (
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
              {(selectedDisease && diseaseDetails) || (selectedCircle && circleDetails) ? (
                <div ref={detailsSectionRef} className="bg-white border border-slate-200 rounded-lg shadow-sm">
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
                          setApiData(null)
                          setApiError(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Disease Details */}
                    {selectedDisease && diseaseDetails && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <div className="space-y-6">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-2xl font-bold mb-2">{circleDetails.biomarker.replace(/_/g, " ")}</h4>
                              <p className="text-blue-100 text-lg mb-3">{circleDetails.disease}</p>
                              <div className="flex items-center gap-4">
                                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                                  {circleDetails.dominantType} Effect
                                </Badge>
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
                                <strong>{circleDetails.disease}</strong> in the context of{" "}
                                <strong>{circleDetails.symptom}</strong> suggests potential therapeutic targets for
                                intervention.
                              </p>
                            </div>
                          </div>

                          {/* Right Column - Research Data */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="text-lg font-semibold text-slate-800">Additional Research Data</h5>
                              {isLoading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
                            </div>

                            <div className="bg-slate-50 rounded-lg border border-slate-200 min-h-[400px]">
                              {isLoading && (
                                <div className="flex flex-col items-center justify-center h-64">
                                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
                                  <p className="text-sm text-slate-600">Loading research insights...</p>
                                </div>
                              )}

                              {apiError && (
                                <div className="p-6">
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <X className="h-4 w-4 text-red-600" />
                                      <span className="font-medium text-red-800">Error Loading Data</span>
                                    </div>
                                    <p className="text-sm text-red-700">{apiError}</p>
                                  </div>
                                </div>
                              )}

                              {!isLoading && !apiError && (
                                <div className="p-6">
                                  {apiData && apiData.result && apiData.result.length > 0 ? (
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                      {apiData.result.map((item, index) => {
                                        // Skip items with no meaningful data
                                        if (!item.Insights && !item.Direction && !item["Quantified Changes"]) {
                                          return null
                                        }

                                        return (
                                          <div
                                            key={index}
                                            className="bg-white rounded-lg border border-slate-200 shadow-sm"
                                          >
                                            <div className="bg-gradient-to-r from-slate-100 to-blue-100 p-4 rounded-t-lg">
                                              <div className="flex items-center justify-between">
                                                <h6 className="font-medium text-slate-800">
                                                  {item.Matched_Biomarker || "Research"} Analysis
                                                </h6>
                                                {item.Direction && item.Direction !== "null" && (
                                                  <Badge
                                                    variant={
                                                      item.Direction?.includes("Increase") ? "destructive" : "default"
                                                    }
                                                    className="text-xs"
                                                  >
                                                    {item.Direction}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            <div className="p-4 space-y-3">
                                              {/* Insights */}
                                              {item.Insights && (
                                                <div>
                                                  <h6 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                                    <Info className="h-3 w-3" />
                                                    Key Insights
                                                  </h6>
                                                  <p className="text-sm text-slate-600 bg-blue-50 p-2 rounded">
                                                    {item.Insights}
                                                  </p>
                                                </div>
                                              )}

                                              {/* Quantified Changes */}
                                              {item["Quantified Changes"] && item["Quantified Changes"] !== "null" && (
                                                <div>
                                                  <h6 className="text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                                                    <BarChart3 className="h-3 w-3" />
                                                    Quantified Changes
                                                  </h6>
                                                  <div
                                                    className="text-sm text-slate-600 bg-green-50 p-2 rounded"
                                                    dangerouslySetInnerHTML={{
                                                      __html: item["Quantified Changes"].replace(/\n/g, "<br>"),
                                                    }}
                                                  />
                                                </div>
                                              )}

                                              {/* Comparison to Reference */}
                                              {item["Comparison to Reference"] &&
                                                item["Comparison to Reference"] !== "null" && (
                                                  <div>
                                                    <h6 className="text-sm font-semibold text-slate-700 mb-1">
                                                      Reference Comparison
                                                    </h6>
                                                    <p className="text-sm text-slate-600 bg-amber-50 p-2 rounded">
                                                      {item["Comparison to Reference"]}
                                                    </p>
                                                  </div>
                                                )}

                                              {/* Reference Point */}
                                              {item["Reference Point"] && item["Reference Point"] !== "null" && (
                                                <div>
                                                  <h6 className="text-sm font-semibold text-slate-700 mb-1">
                                                    Reference Point
                                                  </h6>
                                                  <p className="text-sm text-slate-600 bg-purple-50 p-2 rounded">
                                                    {item["Reference Point"]}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center h-64 text-center">
                                      <div className="bg-slate-100 rounded-full p-4 mb-4">
                                        <HelpCircle className="h-8 w-8 text-slate-400" />
                                      </div>
                                      <h6 className="font-medium text-slate-700 mb-2">No Additional Data Available</h6>
                                      <p className="text-sm text-slate-600 max-w-sm">
                                        No additional research data is currently available for this specific
                                        biomarker-disease combination. This may indicate limited research coverage or
                                        data availability.
                                      </p>
                                    </div>
                                  )}

                                  {!apiData && (
                                    <div className="flex items-center justify-center h-32">
                                      <p className="text-sm text-slate-500">
                                        Research data will appear here once loaded.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* NEW: Full-width Quantified Biomarker Section */}
                        {apiData && apiData.quantified_biomarker && (
                          <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 shadow-sm">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg">
                              <h5 className="text-xl font-semibold flex items-center gap-2">
                                <BarChart3 className="h-6 w-6" />
                                Quantified Biomarker Expression Data
                              </h5>
                              <p className="text-indigo-100 text-sm mt-1">
                                Detailed expression patterns and clinical insights for{" "}
                                {apiData.quantified_biomarker.Biomarker || "this biomarker"}
                              </p>
                            </div>

                            <div className="p-6 space-y-6">
                              {/* Biomarker Info Header */}
                              <div className="flex items-center justify-between bg-white rounded-lg p-4 border border-indigo-200">
                                <div>
                                  <h6 className="text-lg font-bold text-indigo-900">
                                    {apiData.quantified_biomarker.Biomarker || "Unknown Biomarker"}
                                  </h6>
                                  <p className="text-indigo-600 text-sm">Expression Analysis</p>
                                </div>
                                <Badge variant="outline" className="border-indigo-300 text-indigo-700 bg-indigo-50">
                                  Quantified Data Available
                                </Badge>
                              </div>

                              {/* Expression Data Grid */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Disease-specific Expression */}
                                <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                                  <h6 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-blue-600" />
                                    Disease Expression Pattern
                                  </h6>
                                  {Object.entries(apiData.quantified_biomarker).map(([key, value]) => {
                                    // Skip non-disease fields
                                    if (["Biomarker", "Healthy Skin", "Notes/Insights", "Sources"].includes(key))
                                      return null

                                    return (
                                      <div key={key} className="mb-4 last:mb-0">
                                        <div className="font-medium text-slate-700 mb-2">{key}</div>
                                        <div
                                          className="text-sm text-slate-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400"
                                          dangerouslySetInnerHTML={{
                                            __html: value.replace(/\n/g, "<br>").replace(/<br>/g, "<br>"),
                                          }}
                                        />
                                      </div>
                                    )
                                  })}
                                </div>

                                {/* Healthy Control & Insights */}
                                <div className="space-y-4">
                                  {/* Healthy Skin Comparison */}
                                  {apiData.quantified_biomarker["Healthy Skin"] && (
                                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                                      <h6 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-green-600" />
                                        Healthy Control
                                      </h6>
                                      <div className="text-sm text-slate-600 bg-green-50 p-3 rounded border-l-4 border-green-400">
                                        {apiData.quantified_biomarker["Healthy Skin"]}
                                      </div>
                                    </div>
                                  )}

                                  {/* Clinical Insights */}
                                  {apiData.quantified_biomarker["Notes/Insights"] && (
                                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                                      <h6 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <Info className="h-4 w-4 text-amber-600" />
                                        Clinical Insights
                                      </h6>
                                      <div className="text-sm text-slate-600 bg-amber-50 p-3 rounded border-l-4 border-amber-400">
                                        {apiData.quantified_biomarker["Notes/Insights"]}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Research Sources */}
                              {apiData.quantified_biomarker.Sources && (
                                <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm">
                                  <h6 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <Search className="h-4 w-4 text-purple-600" />
                                    Research Sources
                                  </h6>
                                  <div className="space-y-2">
                                    {apiData.quantified_biomarker.Sources.split("\n")
                                      .filter((source) => source.trim())
                                      .map((source, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-200"
                                        >
                                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                                          <a
                                            href={source.trim()}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-purple-700 hover:text-purple-900 hover:underline flex-1 break-all"
                                          >
                                            {source.trim()}
                                          </a>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-purple-600 hover:text-purple-800"
                                            onClick={() => window.open(source.trim(), "_blank")}
                                          >
                                            <svg
                                              className="h-3 w-3"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                              />
                                            </svg>
                                          </Button>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="plots" className="mt-0">
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Enhanced Network Analysis</h3>
                    <p className="text-slate-600 mt-1">
                      Interactive biomarker-disease network with improved readability for "{symptom}"
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {biomarkers.length} Biomarkers • {diseases.length} Diseases
                  </Badge>
                </div>

                {/* Network Visualization */}
                {data && Object.keys(data).length > 0 ? (
                  <div className="space-y-6">
                    {/* Top Biomarkers Bar Chart */}
                    <TopBiomarkersChart data={data} symptom={symptom} width={1000} height={300} />

                    {/* Network Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                            <Network className="h-5 w-5" />
                            Network Nodes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-900">{biomarkers.length + diseases.length}</div>
                          <div className="text-sm text-blue-600">
                            {biomarkers.length} biomarkers + {diseases.length} diseases
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-green-800 flex items-center gap-2">
                            <TrendingDown className="h-5 w-5" />
                            Antagonist Links
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            let inhibitorCount = 0
                            biomarkers.forEach((biomarker) => {
                              diseases.forEach((disease) => {
                                const datum = data[biomarker]?.[disease]
                                if (
                                  datum &&
                                  (datum.avg_inhibitor || 0) > (datum.avg_promoter || 0) &&
                                  (datum.avg_inhibitor || 0) > (datum.avg_unknown || 0) &&
                                  (datum.avg_inhibitor || 0) > 0.001
                                ) {
                                  inhibitorCount++
                                }
                              })
                            })
                            return (
                              <>
                                <div className="text-2xl font-bold text-green-900">{inhibitorCount}</div>
                                <div className="text-sm text-green-600">Suppressive connections</div>
                              </>
                            )
                          })()}
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Agonist Links
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            let promoterCount = 0
                            biomarkers.forEach((biomarker) => {
                              diseases.forEach((disease) => {
                                const datum = data[biomarker]?.[disease]
                                if (
                                  datum &&
                                  (datum.avg_promoter || 0) > (datum.avg_inhibitor || 0) &&
                                  (datum.avg_promoter || 0) > (datum.avg_unknown || 0) &&
                                  (datum.avg_promoter || 0) > 0.001
                                ) {
                                  promoterCount++
                                }
                              })
                            })
                            return (
                              <>
                                <div className="text-2xl font-bold text-amber-900">{promoterCount}</div>
                                <div className="text-sm text-amber-600">Enhancing connections</div>
                              </>
                            )
                          })()}
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Total Links
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            let totalLinks = 0
                            biomarkers.forEach((biomarker) => {
                              diseases.forEach((disease) => {
                                const datum = data[biomarker]?.[disease]
                                if (datum && datum.total_avg > 0) {
                                  totalLinks++
                                }
                              })
                            })
                            return (
                              <>
                                <div className="text-2xl font-bold text-purple-900">{totalLinks}</div>
                                <div className="text-sm text-purple-600">Active associations</div>
                              </>
                            )
                          })()}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Enhanced Network Chart */}
                    <Card className="overflow-hidden border-slate-200 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-blue-700 text-white">
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <Network className="h-6 w-6" />
                          <div>
                            <div>Enhanced Biomarker-Disease Network</div>
                            <div className="text-slate-200 text-sm font-normal mt-1">
                              Improved readability with advanced filtering • Adjustable node spacing • Smart clustering
                              • Enhanced interactions
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <NetworkChart data={data} width={1000} height={700} />
                      </CardContent>
                    </Card>

                    {/* Enhanced Network Insights */}
                    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-lg">
                      <CardHeader className="bg-gradient-to-r from-slate-700 to-blue-700 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <Info className="h-6 w-6" />
                          Enhanced Network Features & Interpretation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800 text-lg mb-3">Readability Improvements</h4>
                            <div className="space-y-3">
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Settings className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-800">Adjustable Node Spacing</span>
                                </div>
                                <div className="text-sm text-blue-700">
                                  Control node separation distance to reduce congestion and improve visual clarity
                                </div>
                              </div>

                              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Search className="h-4 w-4 text-green-600" />
                                  <span className="font-medium text-green-800">Smart Search & Filtering</span>
                                </div>
                                <div className="text-sm text-green-700">
                                  Search nodes by name and apply multiple filters to focus on specific relationships
                                </div>
                              </div>

                              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Eye className="h-4 w-4 text-amber-600" />
                                  <span className="font-medium text-amber-800">Adaptive Label Display</span>
                                </div>
                                <div className="text-sm text-amber-700">
                                  Labels shown only for highly connected nodes to reduce visual clutter
                                </div>
                              </div>

                              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Network className="h-4 w-4 text-purple-600" />
                                  <span className="font-medium text-purple-800">Smart Clustering</span>
                                </div>
                                <div className="text-sm text-purple-700">
                                  Similar nodes are grouped together using connection patterns for better organization
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800 text-lg mb-3">Enhanced Interactions</h4>
                            <div className="space-y-3 text-sm">
                              <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <span className="font-medium text-indigo-800">Fullscreen Mode:</span>
                                  <span className="text-indigo-700 ml-1">
                                    Expand network to full screen for detailed analysis of complex relationships
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                                <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <span className="font-medium text-teal-800">Dynamic Highlighting:</span>
                                  <span className="text-teal-700 ml-1">
                                    Click disease nodes to highlight their connections and fade unrelated elements
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg">
                                <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <span className="font-medium text-rose-800">Enhanced Tooltips:</span>
                                  <span className="text-rose-700 ml-1">
                                    Detailed information on hover with improved styling and comprehensive data
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                  <span className="font-medium text-orange-800">Improved Physics:</span>
                                  <span className="text-orange-700 ml-1">
                                    Better force simulation with collision detection and importance-based positioning
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-gray-100 rounded-lg border-2 border-dashed border-slate-300">
                    <div className="max-w-md mx-auto">
                      <Network className="h-20 w-20 mx-auto mb-6 text-slate-400" />
                      <h3 className="text-xl font-semibold text-slate-600 mb-3">No Network Data Available</h3>
                      <p className="text-slate-500 leading-relaxed">
                        The dataset does not contain sufficient biomarker association data for network visualization.
                        Please ensure your data includes biomarker-disease relationships.
                      </p>
                    </div>
                  </div>
                )}
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
              <span className="font-semibold">{(tooltip.total_avg || 0).toFixed(4)}</span>
            </div>
            {tooltip.avg_inhibitor !== null && tooltip.avg_inhibitor !== undefined && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#10b981" }}></div>
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
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f59e0b" }}></div>
                  <span>Promoter:</span>
                </div>
                <span className="font-semibold">
                  {(tooltip.avg_promoter || 0).toFixed(4)} ({(tooltip.percent_promoter || 0).toFixed(1)}%)
                </span>
              </div>
            )}
            {tooltip.avg_unknown !== null && tooltip.avg_unknown !== undefined && (
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

      {/* Enhanced Legend */}
      <div className="bg-white border-t border-slate-200 px-6 py-4">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="font-medium">High-connection biomarkers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="font-medium">High-connection diseases</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-green-500"></div>
            <span className="font-medium">Antagonist</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-amber-500"></div>
            <span className="font-medium">Agonist</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
            <span className="font-medium">No Data</span>
          </div>
          <div className="text-slate-500">
            <Info className="h-4 w-4 inline mr-1" />
            Enhanced with smart filtering, adjustable spacing, and improved interactions
          </div>
        </div>
      </div>
    </div>
  )
}

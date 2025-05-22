"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

const BiomarkerNetwork2D = ({ biomarker, predictions }) => {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });
  const [dynamicGraph, setDynamicGraph] = useState({ nodes: [], links: [] });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [expandedDiseases, setExpandedDiseases] = useState([]);

  const nodeColors = {
    biomarker: "#10b981", // Emerald
    disease: "#f43f5e",   // Rose
    drug: "#6366f1",      // Indigo
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener("resize", updateDimensions);
    updateDimensions();
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    // Initial graph layout adjustments to ensure all nodes are visible
    const timer = setTimeout(() => {
      if (fgRef.current) {
        fgRef.current.d3Force('charge').strength(-300); // Increase repulsion
        fgRef.current.d3Force('link').distance(link => {
          // Make biomarker-disease links longer to create more space
          if (link.source.type === 'biomarker' || link.target.type === 'biomarker') {
            return 200;
          }
          return 100;
        });
        fgRef.current.zoomToFit(400);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const baseGraph = useMemo(() => {
    const nodes = [
      {
        id: biomarker,
        name: biomarker,
        type: "biomarker",
        val: 35,
      },
    ];
    const links = [];

    predictions.forEach((pred) => {
      const diseaseNode = {
        id: pred.disease_id,
        name: pred.disease_name,
        type: "disease",
        drugs: pred.linked_drugs,
        score: pred.score,
        val: 20 + pred.score / 5,
      };
      nodes.push(diseaseNode);

      links.push({
        source: biomarker,
        target: diseaseNode.id,
        score: pred.score,
        color: `rgba(244, 63, 94, ${Math.min(pred.score / 100 + 0.3, 0.9)})`,
        width: Math.max(pred.score / 10, 3),
      });
    });

    return { nodes, links };
  }, [biomarker, predictions]);

  const handleNodeClick = useCallback(
    (node) => {
      // Prevent action if we're clicking on a drug node
      if (node.type === "drug") return;
      
      // If clicking on the biomarker node, just return
      if (node.type === "biomarker") return;

      // Check if this disease node was already expanded
      const alreadyExpanded = expandedDiseases.includes(node.id);

      if (alreadyExpanded) {
        // Collapse the node
        setDynamicGraph((prev) => ({
          nodes: prev.nodes.filter((n) => !n.id.startsWith(node.id + "_")),
          links: prev.links.filter((l) => !l.target.id?.startsWith(node.id + "_")),
        }));
        setExpandedDiseases(prev => prev.filter(id => id !== node.id));
        return;
      }

      // Expand the disease with its drugs
      const drugCount = node.drugs.length;
      const radius = 100;
      const newDrugNodes = node.drugs.map((drug, i) => {
        const angle = (2 * Math.PI * i) / drugCount;
        return {
          id: `${node.id}_${drug}`,
          name: drug,
          type: "drug",
          val: 15,
          // Keep fixed positions for drugs
          fx: node.x + radius * Math.cos(angle),
          fy: node.y + radius * Math.sin(angle),
          parentNode: node.id
        };
      });

      const newLinks = node.drugs.map((drug) => ({
        source: node.id,
        target: `${node.id}_${drug}`,
        color: "rgba(99, 102, 241, 0.8)",
        width: 2.5,
      }));

      setDynamicGraph((prev) => ({
        nodes: [...prev.nodes, ...newDrugNodes],
        links: [...prev.links, ...newLinks],
      }));
      
      setExpandedDiseases(prev => [...prev, node.id]);
      
      // Only fit graph to view if this is the first expansion
      if (expandedDiseases.length === 0) {
        setTimeout(() => fgRef.current.zoomToFit(400, 60), 300);
      }
    },
    [dynamicGraph, expandedDiseases]
  );

  const fullGraph = {
    nodes: [...baseGraph.nodes, ...dynamicGraph.nodes],
    links: [...baseGraph.links, ...dynamicGraph.links],
  };

  const handleNodeHover = useCallback((node) => {
    setHoveredNode(node);
    document.body.style.cursor = node ? "pointer" : "default";
  }, []);

  const zoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 1.2, 400);
    }
  };

  const zoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 0.8, 400);
    }
  };

  const centerGraph = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 60);
    }
  };

  const paintNode = useCallback(
    (node, ctx, globalScale) => {
      const { x, y, val, type } = node;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;

      const size = val || 15;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColors[type];
      ctx.fill();

      const glowSize = size * 1.4;
      const gradient = ctx.createRadialGradient(x, y, size, x, y, glowSize);
      gradient.addColorStop(0, nodeColors[type]);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2 / globalScale;
      ctx.stroke();

      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${Math.max(12, size / 2) / globalScale}px Arial`;

      let symbol = "";
      if (type === "biomarker") symbol = "B";
      else if (type === "disease") symbol = "D";
      else if (type === "drug") symbol = "Rx";

      ctx.fillText(symbol, x, y);

      // Make disease names always visible
      const label = node.name;
      const fontSize = Math.max(14, size / 2) / globalScale;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
      ctx.lineWidth = 4 / globalScale;
      ctx.strokeText(label, x, y + size + 10 / globalScale);
      ctx.fillText(label, x, y + size + 10 / globalScale);

      if (type === "disease" && node.score) {
        const scoreSize = size / 2;
        ctx.beginPath();
        ctx.arc(x + size, y - size / 2, scoreSize, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = `bold ${scoreSize / globalScale}px Arial`;
        ctx.fillText(node.score, x + size, y - size / 2);
      }

      if (hoveredNode === node) {
        ctx.beginPath();
        ctx.arc(x, y, size * 1.2, 0, 2 * Math.PI);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3 / globalScale;
        ctx.stroke();

        const pulseSize = size * (1.3 + 0.1 * Math.sin(Date.now() / 200));
        ctx.beginPath();
        ctx.arc(x, y, pulseSize, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }
      
      // If this is an expanded disease node, draw an indicator
      if (type === "disease" && expandedDiseases.includes(node.id)) {
        const expandedSize = size * 0.4;
        ctx.beginPath();
        ctx.arc(x - size, y - size / 2, expandedSize, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fill();
        
        ctx.fillStyle = nodeColors.disease;
        ctx.font = `bold ${expandedSize / globalScale}px Arial`;
        ctx.fillText("-", x - size, y - size / 2);
      }
    },
    [hoveredNode, nodeColors, expandedDiseases]
  );

  // Enhanced click handler for background to help with collapsing expanded views
  const handleBackgroundClick = useCallback(() => {
    // If clicking background, collapse all expanded diseases
    if (expandedDiseases.length > 0) {
      setDynamicGraph((prev) => ({
        nodes: prev.nodes.filter((n) => !n.parentNode),
        links: prev.links.filter((l) => !l.target.parentNode),
      }));
      setExpandedDiseases([]);
    }
  }, [expandedDiseases]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800"
    >
      {hoveredNode && (
        <div className="absolute top-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-10 max-w-xs border border-gray-700">
          <div className="font-bold text-lg">{hoveredNode.name}</div>
          <div className="text-sm text-gray-300 capitalize">{hoveredNode.type}</div>
          {hoveredNode.score && (
            <div className="mt-2 text-sm">
              Score: <span className="font-semibold text-rose-400">{hoveredNode.score}</span>
            </div>
          )}
          {hoveredNode.type === "disease" && hoveredNode.drugs && (
            <div className="mt-2">
              <div className="text-sm font-semibold">Connected Drugs:</div>
              <div className="text-xs text-gray-300 mt-1">{hoveredNode.drugs.join(", ")}</div>
              <div className="mt-2 text-xs text-gray-400">
                Click to {expandedDiseases.includes(hoveredNode.id) ? "collapse" : "expand"} drug connections
              </div>
            </div>
          )}
        </div>
      )}

      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button onClick={zoomIn} className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors">
          <ZoomIn size={20} />
        </button>
        <button onClick={zoomOut} className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors">
          <ZoomOut size={20} />
        </button>
        <button onClick={centerGraph} className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors">
          <Maximize2 size={20} />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-10 border border-gray-700">
        <div className="text-sm font-semibold mb-2">Network Legend</div>
        {["biomarker", "disease", "drug"].map((type) => (
          <div key={type} className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: nodeColors[type] }}></div>
            <span className="text-sm capitalize">{type}</span>
          </div>
        ))}
        {expandedDiseases.length > 0 && (
          <div className="mt-3 flex gap-3 items-center">
            <button 
              onClick={handleBackgroundClick} 
              className="text-xs bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition-colors"
            >
              Collapse All ({expandedDiseases.length})
            </button>
          </div>
        )}
      </div>

      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={fullGraph}
        nodeVal={(node) => node.val}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        linkColor={(link) => link.color}
        linkWidth={(link) => link.width}
        linkDirectionalParticles={6}
        linkDirectionalParticleWidth={(link) => (link.width ? link.width / 2 : 1)}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        cooldownTicks={100}
        cooldownTime={2000}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={100}
        backgroundColor="rgba(0,0,0,0)"
        d3Force="charge"
        d3ForceStrength={-200} // Increase node separation
      />
    </div>
  );
};

export default BiomarkerNetwork2D;
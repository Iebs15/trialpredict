import React, { useEffect, useMemo, useRef, useState } from "react";
import { Download, RefreshCw } from "lucide-react";

/** Lazy-load Plotly from CDN (no npm install required) with a safe fallback. */
function usePlotly() {
  const [plotly, setPlotly] = useState(
    typeof window !== "undefined" ? window.Plotly : null
  );

  useEffect(() => {
    if (plotly) return;

    const onLoaded = () => setPlotly(window.Plotly);

    // Already injected?
    const existing = document.querySelector('script[data-role="plotly-cdn"]');
    if (existing) {
      if (window.Plotly) setPlotly(window.Plotly);
      else existing.addEventListener("load", onLoaded, { once: true });
      return;
    }

    const s = document.createElement("script");
    s.src = "https://cdn.plot.ly/plotly-2.27.0.min.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-role", "plotly-cdn");
    s.addEventListener("load", onLoaded, { once: true });
    document.body.appendChild(s);

    return () => s.removeEventListener("load", onLoaded);
  }, [plotly]);

  return plotly;
}

const UNKNOWN = new Set([
  "", "na", "n/a", "nan", "none", "null", "unknown", "unk",
  "not available", "not-applicable", "NA", "NaN"
]);

const norm = (x, { yesNo = false } = {}) => {
  if (x == null) return "Unknown";
  const s = String(x).trim();
  if (UNKNOWN.has(s.toLowerCase())) return "Unknown";
  if (yesNo) {
    const low = s.toLowerCase();
    if (["yes", "y", "true", "1"].includes(low)) return "Yes";
    if (["no", "n", "false", "0"].includes(low)) return "No";
  }
  return s;
};

const shorten = (t, n = 18) =>
  t && t.length > n ? `${t.slice(0, n - 1)}…` : t || "Unknown";

/** Simple CSS fallback bar chart (no libs). */
function FallbackBar({ items, title, valueKey, labelKey, max = 100 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      </div>
      {(!items || !items.length) && (
        <div className="text-slate-400 text-sm">No data to visualize.</div>
      )}
      <div className="space-y-2">
        {items?.slice(0, 8).map((d, i) => {
          const val = Number(d[valueKey]) || 0;
          const pct = Math.max(0, Math.min(100, (val / max) * 100));
          return (
            <div key={i}>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span className="truncate max-w-[70%]">{d[labelKey]}</span>
                <span className="tabular-nums">{val.toFixed(1)}</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded">
                <div
                  className="h-2.5 rounded bg-blue-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BiomarkerDashboard({ biomarker, data = [] }) {
  const Plotly = usePlotly();

  // Normalize rows (accept underscore/space variants)
  const rows = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr.map((r) => {
      const m = { ...r };
      m["Biomarker Name"] = m["Biomarker Name"] ?? m["Biomarker_Name"];
      m["Type of Study"] = m["Type of Study"] ?? m["Type_of_Study"];
      m["Diseases (Comorbidity)"] = m["Diseases (Comorbidity)"] ?? m["Diseases_(Comorbidity)"];
      m["Confidence_Score"] = Number(m["Confidence_Score"] ?? m["Confidence Score"] ?? 0) || 0;
      m["Condition"] = norm(m["Condition"]);
      m["Type of Study"] = norm(m["Type of Study"]);
      m["Study_Group"] = norm(m["Study_Group"]);
      m["Skin_Change_Type"] = norm(m["Skin_Change_Type"]);
      m["Treatment_Status"] = norm(m["Treatment_Status"], { yesNo: true });
      m["Treatment_Name"] = norm(m["Treatment_Name"]);
      m["Biomarker Level"] = norm(m["Biomarker_Level"]);
      m["Biomarker Level Change"] = norm(m["Biomarker_Level_Change"]);
      return m;
    });
  }, [data]);

  const total = rows.length;
  const meanCI = useMemo(() => {
    if (!total) return 0;
    const s = rows.reduce((a, b) => a + (b["Confidence_Score"] || 0), 0);
    return +(s / total).toFixed(1);
  }, [rows, total]);

  const conditionStats = useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      const c = r["Condition"] || "Unknown";
      const ci = r["Confidence_Score"] || 0;
      const v = m.get(c) || { count: 0, sum: 0 };
      v.count += 1; v.sum += ci;
      m.set(c, v);
    }
    return Array.from(m, ([condition, { count, sum }]) => ({
      condition, count, avgCI: +(sum / (count || 1)).toFixed(1),
    })).sort((a, b) => b.count - a.count);
  }, [rows]);

  // Sunburst prep (Biomarker > Condition > Study Group > Type > Skin Change)
  const sunburst = useMemo(() => {
    const leafMap = new Map();
    const tup = (r) => [
      r["Condition"] || "Unknown",
      r["Study_Group"] || "Unknown",
      r["Type of Study"] || "Unknown",
      r["Skin_Change_Type"] || "Unknown",
    ];
    for (const r of rows) {
      const key = JSON.stringify(tup(r));
      const ci = r["Confidence_Score"] || 0;
      const cur = leafMap.get(key) || { count: 0, sum: 0 };
      cur.count += 1; cur.sum += ci;
      leafMap.set(key, cur);
    }

    const rootId = "__ROOT__";
    const nodes = new Map();
    const ensure = (id, label, parent) => {
      if (!nodes.has(id)) nodes.set(id, { id, label, parent, count: 0, sum: 0 });
      return nodes.get(id);
    };
    ensure(rootId, biomarker || "Biomarker", "");

    for (const [key, agg] of leafMap) {
      const [cond, sg, type, sc] = JSON.parse(key);
      const ids = [
        `${rootId}|${cond}`,
        `${rootId}|${cond}|${sg}`,
        `${rootId}|${cond}|${sg}|${type}`,
        `${rootId}|${cond}|${sg}|${type}|${sc}`,
      ];
      const labels = [cond, sg, type, sc];
      ensure(ids[0], labels[0], rootId);
      ensure(ids[1], labels[1], ids[0]);
      ensure(ids[2], labels[2], ids[1]);
      ensure(ids[3], labels[3], ids[2]);
      for (const id of [rootId, ...ids]) {
        const n = nodes.get(id);
        n.count += agg.count;
        n.sum += agg.sum;
      }
    }

    const labels = [];
    const parents = [];
    const values = [];
    const colors = [];

    for (const n of nodes.values()) {
      if (n.id === rootId) continue;
      labels.push(shorten(n.label, 20));
      parents.push(n.parent === rootId ? biomarker || "Biomarker" : shorten(nodes.get(n.parent).label, 20));
      values.push(n.count);
      colors.push(+(n.sum / (n.count || 1)).toFixed(1));
    }

    labels.unshift(biomarker || "Biomarker");
    parents.unshift("");
    values.unshift(nodes.get(rootId)?.count || total);
    colors.unshift(+(nodes.get(rootId)?.sum / (nodes.get(rootId)?.count || 1)).toFixed(1));

    return { labels, parents, values, colors };
  }, [rows, biomarker, total]);

  const radar = useMemo(() => {
    const top = conditionStats.slice(0, 8);
    return { theta: top.map((d) => d.condition), r: top.map((d) => d.avgCI) };
  }, [conditionStats]);

  const sunburstRef = useRef(null);
  const radarRef = useRef(null);

  // Render Plotly charts (if CDN works)
  useEffect(() => {
    if (!Plotly || !sunburstRef.current || !sunburst.labels?.length) return;
    Plotly.newPlot(
      sunburstRef.current,
      [{
        type: "sunburst",
        labels: sunburst.labels,
        parents: sunburst.parents,
        values: sunburst.values,
        marker: {
          colors: sunburst.colors,
          colorscale: "RdYlGn",
          cmin: 0,
          cmax: 100,
          colorbar: { title: "Avg CI" },
        },
        branchvalues: "total",
        hovertemplate: "<b>%{label}</b><br>Records: %{value}<br>Avg CI: %{color:.1f}/100<extra></extra>"
      }],
      {
        height: 360,
        margin: { l: 0, r: 0, t: 10, b: 10 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { family: "Inter, ui-sans-serif, system-ui" },
      },
      { displayModeBar: false }
    );
    const handle = () => Plotly.Plots.resize(sunburstRef.current);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [Plotly, sunburst]);

  useEffect(() => {
    if (!Plotly || !radarRef.current || !radar.theta?.length) return;
    Plotly.newPlot(
      radarRef.current,
      [{
        type: "scatterpolar",
        r: radar.r,
        theta: radar.theta,
        fill: "toself",
        name: "Avg CI",
        hovertemplate: "<b>%{theta}</b><br>Avg CI: %{r:.1f}/100<extra></extra>"
      }],
      {
        height: 320,
        polar: {
          radialaxis: { visible: true, range: [0, 100], tickfont: { size: 10 } },
          angularaxis: { tickfont: { size: 10 } }
        },
        margin: { l: 10, r: 10, t: 10, b: 10 },
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        font: { family: "Inter, ui-sans-serif, system-ui" },
      },
      { displayModeBar: false }
    );
    const handle = () => Plotly.Plots.resize(radarRef.current);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [Plotly, radar]);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(biomarker || "biomarker").replace(/\s+/g, "_")}_dashboard_rows.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const plotlyReady = Boolean(Plotly);

  return (
    <div className="w-full">
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">🔬 Biomarker Evidence Network</h1>
          <p className="text-slate-600">Single Biomarker Analysis Dashboard</p>
        </div>
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Download className="h-4 w-4" />
          Export Dashboard Data
        </button>
      </div>

      {/* KPI pill */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-slate-700">
            <span className="text-sm">Current Analysis:&nbsp;</span>
            <span className="font-semibold">{biomarker || "Biomarker"}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-700">
            <span className="px-2 py-1 bg-white rounded-md shadow-sm">Rows: <b>{total}</b></span>
            <span className="px-2 py-1 bg-white rounded-md shadow-sm">Avg CI: <b>{meanCI}/100</b></span>
          </div>
        </div>
      </div>

      {/* Charts (Plotly or fallback) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Hierarchy Overview</h3>
            {!plotlyReady && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading charts…
              </div>
            )}
          </div>
          {plotlyReady ? (
            <div ref={sunburstRef} className="w-full" style={{ height: 360 }} />
          ) : (
            <FallbackBar
              title="Hierarchy (fallback: CI by Condition)"
              items={conditionStats.map(d => ({ label: d.condition, value: d.avgCI }))}
              valueKey="value"
              labelKey="label"
              max={100}
            />
          )}
          {!rows.length && <div className="text-slate-400 text-sm">No data to visualize.</div>}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-slate-800">Top Conditions by Avg CI</h3>
            {!plotlyReady && (
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading charts…
              </div>
            )}
          </div>
          {plotlyReady ? (
            <div ref={radarRef} className="w-full" style={{ height: 320 }} />
          ) : (
            <FallbackBar
              title="Avg CI (fallback)"
              items={conditionStats.map(d => ({ label: d.condition, value: d.avgCI }))}
              valueKey="value"
              labelKey="label"
              max={100}
            />
          )}
          {!rows.length && <div className="text-slate-400 text-sm">No data to visualize.</div>}
        </div>
      </div>
    </div>
  );
}

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   X,
//   ChevronLeft,
//   ChevronRight,
//   Filter,
//   Search,
//   Download,
//   SortAsc,
//   SortDesc,
// } from "lucide-react";
// import LoadingSpinner from "./LoadingSpinner";
// import BiomarkerDashboard from "./BiomarkerDashboard.jsx";

// const API_URL = import.meta.env.VITE_API_URL;

// /* -------------------------- helpers -------------------------- */

// const isTruthy = (v) => v !== undefined && v !== null && v !== "";

// /** Accept both underscore and space variants coming from ES */
// const normalizeRowKeys = (row) => {
//   const r = { ...row };
//   if (r["Type_of_Study"] != null && r["Type of Study"] == null)
//     r["Type of Study"] = r["Type_of_Study"];
//   if (r["Biomarker_Name"] != null && r["Biomarker Name"] == null)
//     r["Biomarker Name"] = r["Biomarker_Name"];
//   if (r["Diseases_(Comorbidity)"] != null && r["Diseases (Comorbidity)"] == null)
//     r["Diseases (Comorbidity)"] = r["Diseases_(Comorbidity)"];
//   if (r["Confidence Score"] != null && r["Confidence_Score"] == null)
//     r["Confidence_Score"] = r["Confidence Score"];
//   return r;
// };

// const toNumber = (v) => {
//   const n = Number(v);
//   return Number.isFinite(n) ? n : 0;
// };

// const PRIORITY_COLS = [
//   "PDF_Name",
//   "Condition",
//   "Biomarker_Level_Change",
//   "Confidence_Score",
//   "Treatment_Name",
//   "Treatment_Status",
//   "Type_of_Study",
//   "Type of Study", // accept either
//   "Age",
//   "Sex",
//   "Ethnicity",
//   "Biomarker_Presence",
//   "Biomarker_Level",
//   "Skin_Change_Type",
//   "Skin_Change_Severity",
//   "Study_Group",
//   "Key_Outcome",
//   "Justification",
// ];

// const ExpandableText = ({ text, limit = 160 }) => {
//   const [expanded, setExpanded] = useState(false);
//   if (!isTruthy(text)) return <span className="text-slate-400">—</span>;
//   const s = String(text);
//   if (s.length <= limit) return <span>{s}</span>;
//   return (
//     <span className="leading-relaxed">
//       {expanded ? s : s.slice(0, limit) + "… "}
//       <button
//         className="text-blue-600 hover:underline text-xs"
//         onClick={() => setExpanded((e) => !e)}
//       >
//         {expanded ? "View less" : "View more"}
//       </button>
//     </span>
//   );
// };

// /* ============================== COMPONENT ============================== */

// export default function BiomarkerDataModal({ biomarker, condition, isOpen, onClose }) {
//   /* ---------- state ---------- */
//   const [data, setData] = useState([]); // table rows for current page
//   const [byCondition, setByCondition] = useState(null); // map: cond -> {data,count}
//   const [isAll, setIsAll] = useState(false);
//   const [totalCount, setTotalCount] = useState(0);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // table & UX
//   const [currentPage, setCurrentPage] = useState(1);
//   const [size, setSize] = useState(50);
//   const [totalPages, setTotalPages] = useState(1);

//   const [showFilters, setShowFilters] = useState(true);
//   const [searchText, setSearchText] = useState("");

//   // sorting
//   const [sortKey, setSortKey] = useState("Confidence_Score");
//   const [sortDir, setSortDir] = useState("desc"); // 'asc' | 'desc'

//   /* ---------- derived for DASHBOARD (merge all conditions if provided) ---------- */
//   const dashboardData = useMemo(() => {
//     if (isAll && byCondition) {
//       let merged = [];
//       Object.values(byCondition).forEach(({ data: arr = [] }) => {
//         merged = merged.concat(arr.map(normalizeRowKeys));
//       });
//       return merged;
//     }
//     return (data || []).map(normalizeRowKeys);
//   }, [isAll, byCondition, data]);

//   /* -------------------------- API fetch -------------------------- */
//   const fetchData = async (pageToFetch = 1) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const body = {
//         biomarker_name: biomarker,
//         page: pageToFetch,
//         size,
//       };
//       if (condition && String(condition).trim() !== "") {
//         body.condition = condition;
//       }

//       const res = await fetch(`${API_URL}/api/biomarker/data`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();

//       const {
//         data: rows = [],
//         by_condition = null,
//         total_count = 0,
//         page = pageToFetch,
//         size: returnedSize = size,
//         all_conditions = false,
//       } = json || {};

//       setData(Array.isArray(rows) ? rows : []);
//       setByCondition(by_condition);
//       setIsAll(Boolean(all_conditions));
//       setTotalCount(Number(total_count) || 0);
//       setCurrentPage(Number(page) || pageToFetch);
//       setSize(Number(returnedSize) || size);

//       const tp =
//         Number(returnedSize) > 0
//           ? Math.max(1, Math.ceil((Number(total_count) || 0) / Number(returnedSize)))
//           : 1;
//       setTotalPages(tp);
//     } catch (e) {
//       console.error("Fetch biomarker data failed:", e);
//       setError(e.message || "Failed to fetch data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // fetch when opened / biomarker / condition changes
//   useEffect(() => {
//     if (!isOpen) return;
//     setCurrentPage(1);
//     fetchData(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isOpen, biomarker, condition]);

//   /* -------------------- table headers + processed rows -------------------- */

//   const tableHeaders = useMemo(() => {
//     const set = new Set();
//     const addRow = (r) => Object.keys(r || {}).forEach((k) => set.add(k));

//     (Array.isArray(data) ? data : []).forEach(addRow);
//     PRIORITY_COLS.forEach((h) => set.add(h)); // keep order stable even if not present

//     const arr = Array.from(set);
//     return arr.sort((a, b) => {
//       const ai = PRIORITY_COLS.indexOf(a);
//       const bi = PRIORITY_COLS.indexOf(b);
//       const ap = ai === -1 ? 999 : ai;
//       const bp = bi === -1 ? 999 : bi;
//       if (ap !== bp) return ap - bp;
//       return a.localeCompare(b);
//     });
//   }, [data]);

//   const filteredRows = useMemo(() => {
//     if (!searchText) return data || [];
//     const q = searchText.toLowerCase();
//     return (data || []).filter((row) =>
//       tableHeaders.some((h) => String(row[h] ?? "").toLowerCase().includes(q))
//     );
//   }, [data, searchText, tableHeaders]);

//   const processedData = useMemo(() => {
//     const rows = [...filteredRows];
//     if (!sortKey) return rows;
//     rows.sort((a, b) => {
//       const av = a?.[sortKey];
//       const bv = b?.[sortKey];

//       if (sortKey === "Confidence_Score") {
//         const an = toNumber(av);
//         const bn = toNumber(bv);
//         return sortDir === "asc" ? an - bn : bn - an;
//       }
//       const as = String(av ?? "");
//       const bs = String(bv ?? "");
//       return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
//     });
//     return rows;
//   }, [filteredRows, sortKey, sortDir]);

//   /* ------------------------------ UI helpers ------------------------------ */

//   const onSort = (key) => {
//     if (sortKey === key) {
//       setSortDir((d) => (d === "asc" ? "desc" : "asc"));
//     } else {
//       setSortKey(key);
//       setSortDir("asc");
//     }
//   };

//   const exportData = () => {
//     const blob = new Blob([JSON.stringify(processedData, null, 2)], {
//       type: "application/json",
//     });
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = `${(biomarker || "biomarker").replace(/\s+/g, "_")}-${
//       condition ? String(condition).replace(/\s+/g, "_") : "all"
//     }-data.json`;
//     a.click();
//     URL.revokeObjectURL(a.href);
//   };

//   const renderCell = (header, value) => {
//     if (!isTruthy(value)) return <span className="text-slate-400">—</span>;

//     if (header === "PDF_Name") {
//       return <span className="text-slate-800 font-medium">{String(value)}</span>;
//     }

//     if (header === "Biomarker_Level_Change" && value) {
//       const val = String(value).toLowerCase();
//       const colorClass =
//         val.includes("increase")
//           ? "text-green-600 font-medium"
//           : val.includes("decrease")
//           ? "text-red-600 font-medium"
//           : "text-slate-600";
//       return <span className={colorClass}>{String(value)}</span>;
//     }

//     if (header === "Confidence_Score") {
//       const n = toNumber(value);
//       const colorClass =
//         n >= 66 ? "text-green-600" : n >= 33 ? "text-amber-600" : "text-red-600";
//       return (
//         <span className={`${colorClass} font-medium`}>
//           {n.toFixed(1)}
//           <span className="text-slate-400">/100</span>
//         </span>
//       );
//     }

//     if (header === "Treatment_Status" && value) {
//       const colorClass =
//         String(value).toLowerCase() === "yes"
//           ? "text-green-600 font-medium"
//           : "text-slate-600";
//       return <span className={colorClass}>{String(value)}</span>;
//     }

//     const s = String(value);
//     if (s.length > 160) return <ExpandableText text={s} limit={160} />;
//     return s;
//   };

//   /* --------------------------------- RENDER -------------------------------- */

//   // Return null only AFTER all hooks have executed, to keep hook order stable.
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl max-w-[95vw] w-full max-h-[95vh] flex flex-col overflow-hidden">
//         {/* Header (fixed) */}
//         <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
//           <div>
//             <h2 className="text-xl font-bold text-slate-800">
//               {biomarker} — {condition || "All Conditions"} Data
//             </h2>
//             <div className="flex items-center gap-3 mt-1">
//               <p className="text-sm text-slate-600">
//                 {processedData.length} records displayed (of {totalCount} total)
//               </p>
//               {isAll && (
//                 <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
//                   merged across conditions
//                 </span>
//               )}
//             </div>
//           </div>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={exportData}
//               className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
//             >
//               <Download className="h-4 w-4" />
//               Export
//             </button>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//         </div>

//         {/* ONE scrollable content area (dashboard + filters + table) */}
//         <div className="flex-1 overflow-y-auto">
//           {/* Dashboard */}
//           <div className="p-6 border-b border-slate-200">
//             <BiomarkerDashboard biomarker={biomarker} data={dashboardData} />
//           </div>

//           {/* Filters/Search toolbar (sticky within scroll) */}
//           <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-200">
//             <div className="flex items-center gap-3 p-4">
//               <button
//                 onClick={() => setShowFilters((v) => !v)}
//                 className="flex items-center gap-2 px-3 py-2 border rounded-lg text-slate-700 hover:bg-slate-50"
//               >
//                 <Filter className="h-4 w-4" />
//                 {showFilters ? "Hide Filters" : "Show Filters"}
//               </button>

//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <input
//                   type="text"
//                   value={searchText}
//                   onChange={(e) => setSearchText(e.target.value)}
//                   placeholder="Search all fields..."
//                   className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
//                 />
//               </div>

//               <div className="text-sm text-slate-600">
//                 Showing {tableHeaders.length} columns
//               </div>
//             </div>
//           </div>

//           {/* Loading / Error */}
//           {loading && (
//             <div className="flex items-center justify-center p-10">
//               <LoadingSpinner />
//             </div>
//           )}
//           {error && !loading && (
//             <div className="p-4 text-red-600 text-sm">
//               Failed to load: {String(error)}
//             </div>
//           )}

//           {/* Table */}
//           {!loading && !error && (
//             <div className="p-4">
//               <div className="overflow-x-auto border rounded-xl">
//                 <table className="min-w-full text-sm">
//                   <thead className="bg-slate-50">
//                     <tr className="text-slate-700">
//                       {tableHeaders.map((h) => (
//                         <th
//                           key={h}
//                           onClick={() => onSort(h)}
//                           className="px-4 py-3 text-left font-semibold whitespace-nowrap border-b cursor-pointer select-none"
//                           title={`Sort by ${h}`}
//                         >
//                           <span className="inline-flex items-center gap-1">
//                             {h.replaceAll("_", " ")}
//                             {sortKey === h ? (
//                               sortDir === "asc" ? (
//                                 <SortAsc className="h-4 w-4" />
//                               ) : (
//                                 <SortDesc className="h-4 w-4" />
//                               )
//                             ) : null}
//                           </span>
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {processedData.map((row, idx) => (
//                       <tr key={idx} className="hover:bg-slate-50">
//                         {tableHeaders.map((h) => (
//                           <td
//                             key={h}
//                             className="px-4 py-3 align-top text-slate-800 whitespace-pre-wrap"
//                           >
//                             {renderCell(h, row[h])}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                     {processedData.length === 0 && (
//                       <tr>
//                         <td
//                           colSpan={tableHeaders.length}
//                           className="px-4 py-10 text-center text-slate-500"
//                         >
//                           No records found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="flex items-center justify-between p-4">
//                   <div className="text-sm text-slate-600">
//                     Page {currentPage} of {totalPages} ({totalCount} total records)
//                   </div>

//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => {
//                         const newPage = Math.max(1, currentPage - 1);
//                         setCurrentPage(newPage);
//                         fetchData(newPage);
//                       }}
//                       disabled={currentPage === 1}
//                       className="flex items-center gap-2 px-3 py-1 border rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       <ChevronLeft className="h-4 w-4" />
//                       Previous
//                     </button>

//                     {/* compact page buttons */}
//                     <div className="flex gap-1">
//                       {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                         let pageNum;
//                         if (totalPages <= 5) {
//                           pageNum = i + 1;
//                         } else if (currentPage <= 3) {
//                           pageNum = i + 1;
//                         } else if (currentPage >= totalPages - 2) {
//                           pageNum = totalPages - 4 + i;
//                         } else {
//                           pageNum = currentPage - 2 + i;
//                         }
//                         const active = pageNum === currentPage;
//                         return (
//                           <button
//                             key={pageNum}
//                             onClick={() => {
//                               setCurrentPage(pageNum);
//                               fetchData(pageNum);
//                             }}
//                             className={`px-3 py-1 rounded-lg border ${
//                               active
//                                 ? "bg-blue-600 text-white border-blue-600"
//                                 : "text-slate-700 hover:bg-slate-50"
//                             }`}
//                           >
//                             {pageNum}
//                           </button>
//                         );
//                       })}
//                     </div>

//                     <button
//                       onClick={() => {
//                         const newPage = Math.min(totalPages, currentPage + 1);
//                         setCurrentPage(newPage);
//                         fetchData(newPage);
//                       }}
//                       disabled={currentPage === totalPages}
//                       className="flex items-center gap-2 px-3 py-1 border rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       Next
//                       <ChevronRight className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



// src/components/BiomarkerDataModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Download,
  SortAsc,
  SortDesc,
} from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const API_URL = import.meta.env.VITE_API_URL;

// ---------- helpers ----------
const prettyHeader = (h) => String(h || "").replace(/_/g, " ");

// Per-cell expandable text

const ExpandableText = ({ text, limit = 160 }) => {
  const [expanded, setExpanded] = useState(false);
  const str = String(text ?? "");
  if (str.length <= limit)
    return <span className="whitespace-pre-wrap">{str}</span>;
  const shown = expanded ? str : str.slice(0, limit) + "…";
  return (
    <span className="whitespace-pre-wrap">
      {shown}{" "}
      <button
        type="button"
        onClick={() => setExpanded((s) => !s)}
        className="text-blue-600 hover:text-blue-800 underline text-xs"
      >
        {expanded ? "View less" : "View more"}
      </button>
    </span>
  );
};

const BiomarkerDataModal = ({ biomarker, condition, isOpen, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [byCondition, setByCondition] = useState(null);
  const [isAll, setIsAll] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [selectedLevelChange, setSelectedLevelChange] = useState("all");
  const [selectedStudyType, setSelectedStudyType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Sorting states
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");

  // Table display states
  const [tableHeaders, setTableHeaders] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState(new Set());

  useEffect(() => {
    if (!isOpen || !biomarker) return;
    // Reset on open
    setCurrentPage(1);
    setError(null);
    setByCondition(null);
    setIsAll(false);
    setSearchTerm("");
    setSelectedCondition("all");
    setSelectedLevelChange("all");
    setSelectedStudyType("all");
    setShowFilters(false);
    setSortField("");
    setSortDirection("asc");
    fetchData(1);
  }, [isOpen, biomarker, condition]);

  const fetchData = async (page) => {
    setLoading(true);
    setError(null);
    try {
      const API_URL_LOCAL =
        import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

      const body = {
        biomarker_name: biomarker,
        page,
        size: 50,
      };

      if (
        condition &&
        condition !== "All Conditions" &&
        condition.trim() !== ""
      ) {
        body.condition = condition;
      }

      const res = await fetch(`${API_URL_LOCAL}/api/biomarker/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify(body),
      });

      if (!res.ok)
        throw new Error(`Request failed (${res.status}): ${res.statusText}`);

      const json = await res.json();

      if (!json?.success)
        throw new Error(json?.error || "Failed to fetch data");

      if (json.all_conditions) {
        setIsAll(true);
        setByCondition(json.by_condition || {});
        setData(json.data || []);
        setTotalPages(1);
        setTotalCount(json.total_count || 0);
      } else {
        setIsAll(false);
        setByCondition(null);
        setData(json.data || []);
        setTotalPages(json.total_pages || 1);
        setTotalCount(json.total_count || 0);
      }

      extractTableHeaders(json.data || []);

      if (json.fallback) {
        console.warn("BiomarkerDataModal - Using fallback/mock data");
        setError(
          "Displaying mock data - Elasticsearch connection may be limited"
        );
      }
    } catch (e) {
      console.error("BiomarkerDataModal - Error fetching biomarker data:", e);
      setError(e.message || "Failed to fetch biomarker data");
      setData([]);
      setByCondition(null);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const extractTableHeaders = (dataArray) => {
    const allHeaders = new Set();

    if (isAll && byCondition) {
      Object.values(byCondition).forEach((condData) => {
        (condData.data || []).forEach((item) => {
          Object.keys(item).forEach((key) => allHeaders.add(key));
        });
      });
    } else {
      dataArray.forEach((item) => {
        Object.keys(item).forEach((key) => allHeaders.add(key));
      });
    }

    const priorityColumns = [
      "Document_id",
      "Subject_ID",
      "PDF_name",
      "Condition",
      "Biomarker_Name",
      "Biomarker_Level_Change",
      "Confidence_Score",
      "Treatment_Name",
      "Treatment_Status",
      "Type_of_Study",
      "Age",
      "Sex",
      "Ethnicity",
      "Biomarker_Presence",
      "Biomarker_Level",
      "Skin_Change_Type",
      "Skin_Change_Severity",
      "Study_Group",
      "Key_Outcome",
      "Justification",
    ];

    const sortedHeaders = Array.from(allHeaders).sort((a, b) => {
      const aIndex = priorityColumns.indexOf(a);
      const bIndex = priorityColumns.indexOf(b);

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      } else if (aIndex !== -1) {
        return -1;
      } else if (bIndex !== -1) {
        return 1;
      } else {
        return String(a).localeCompare(String(b));
      }
    });

    setTableHeaders(sortedHeaders);

    const defaultVisible = new Set(
      sortedHeaders.filter(
        (header) =>
          priorityColumns.includes(header) || sortedHeaders.indexOf(header) < 12
      )
    );
    setVisibleColumns(defaultVisible);
  };

  const filterOptions = useMemo(() => {
    let allData = [];

    if (isAll && byCondition) {
      Object.values(byCondition).forEach((condData) => {
        allData = allData.concat(condData.data || []);
      });
    } else {
      allData = data;
    }

    const conditions = [
      ...new Set(allData.map((item) => item["Condition"]).filter(Boolean)),
    ];
    const levelChanges = [
      ...new Set(
        allData.map((item) => item["Biomarker_Level_Change"]).filter(Boolean)
      ),
    ];
    const studyTypes = [
      ...new Set(allData.map((item) => item["Type_of_Study"]).filter(Boolean)),
    ];

    return {
      conditions: conditions.sort(),
      levelChanges: levelChanges.sort(),
      studyTypes: studyTypes.sort(),
    };
  }, [data, byCondition, isAll]);

  const processedData = useMemo(() => {
    let processedItems = [];

    if (isAll && byCondition) {
      Object.entries(byCondition).forEach(([condName, condData]) => {
        let condItems = (condData.data || []).map((item) => ({
          ...item,
          _condition: condName,
        }));
        processedItems = processedItems.concat(condItems);
      });
    } else {
      processedItems = [...data];
    }

    if (searchTerm) {
      processedItems = processedItems.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (selectedCondition !== "all") {
      processedItems = processedItems.filter(
        (item) =>
          (item["Condition"] || item["_condition"]) === selectedCondition
      );
    }

    if (selectedLevelChange !== "all") {
      processedItems = processedItems.filter(
        (item) => item["Biomarker_Level_Change"] === selectedLevelChange
      );
    }

    if (selectedStudyType !== "all") {
      processedItems = processedItems.filter(
        (item) => item["Type_of_Study"] === selectedStudyType
      );
    }

    if (sortField) {
      processedItems.sort((a, b) => {
        const aVal = a[sortField] ?? "";
        const bVal = b[sortField] ?? "";

        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
        }

        const comparison = String(aVal).localeCompare(String(bVal));
        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return processedItems;
  }, [
    data,
    byCondition,
    isAll,
    searchTerm,
    selectedCondition,
    selectedLevelChange,
    selectedStudyType,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleColumn = (header) => {
    const newVisibleColumns = new Set(visibleColumns);
    if (newVisibleColumns.has(header)) {
      newVisibleColumns.delete(header);
    } else {
      newVisibleColumns.add(header);
    }
    setVisibleColumns(newVisibleColumns);
  };

  const exportData = () => {
    let exportData = [];

    if (isAll && typeof processedData === "object") {
      Object.entries(processedData).forEach(([condName, condData]) => {
        exportData = exportData.concat(condData.data || []);
      });
    } else {
      exportData = Array.isArray(processedData) ? processedData : [];
    }

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${biomarker}-${
      condition || "all-conditions"
    }-data.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const formatCellValue = (value, header) => {
    if (
      value === null ||
      value === undefined ||
      value === "nan" ||
      value === "None"
    ) {
      return "N/A";
    }

    if (header === "Age" && !isNaN(value) && value !== "Unknown") {
      return `${value} years`;
    }

    // Confidence score: 0–100 scale with new thresholds and display
    if (header === "Confidence_Score" && !isNaN(value)) {
      const raw = parseFloat(value);
      const score = Number.isFinite(raw) ? raw : 0;
      const colorClass =
        score >= 80
          ? "text-green-600 font-medium"
          : score >= 60
          ? "text-yellow-600 font-medium"
          : score >= 40
          ? "text-orange-600 font-medium"
          : "text-red-600 font-medium";
      return <span className={colorClass}>{score.toFixed(1)}/100</span>;
    }

    if (header === "Biomarker_Level_Change" && value) {
      const colorClass =
        value === "increase"
          ? "text-green-600 font-medium"
          : value === "decrease"
          ? "text-red-600 font-medium"
          : value === "unchanged"
          ? "text-blue-600 font-medium"
          : "text-slate-800";
      return <span className={colorClass}>{value}</span>;
    }

    if (header === "Treatment_Status" && value) {
      const colorClass =
        value === "Yes" ? "text-green-600 font-medium" : "text-slate-600";
      return <span className={colorClass}>{value}</span>;
    }

    const stringValue = String(value);

    // Any long string => expandable
    if (stringValue.length > 160) {
      return <ExpandableText text={stringValue} limit={160} />;
    }

    return stringValue;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {biomarker} - {condition || "All Conditions"} Data
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm text-slate-600">
                {processedData.length} records displayed (of {totalCount} total)
              </p>
              {error && error.includes("mock data") && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                  Mock Data
                </span>
              )}
              {!error &&
                data.length > 0 &&
                data.some((item) =>
                  item.Document_id?.toString().startsWith("mock")
                ) && (
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                    Mock Data
                  </span>
                )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {((error && error.includes("mock data")) ||
          (!error &&
            data.length > 0 &&
            data.some((item) =>
              item.Document_id?.toString().startsWith("mock")
            ))) && (
          <div className="mx-6 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="text-sm font-medium">
                Displaying mock data - Elasticsearch connection may be limited
              </span>
            </div>
          </div>
        )}

        <div className="border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>

              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search all fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div className="text-sm text-slate-600">
                Showing {Array.from(visibleColumns).length} of{" "}
                {tableHeaders.length} columns
              </div>

              {(searchTerm ||
                selectedCondition !== "all" ||
                selectedLevelChange !== "all" ||
                selectedStudyType !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCondition("all");
                    setSelectedLevelChange("all");
                    setSelectedStudyType("all");
                  }}
                  className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={selectedCondition}
                    onChange={(e) => setSelectedCondition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Conditions</option>
                    {filterOptions.conditions.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Level Change
                  </label>
                  <select
                    value={selectedLevelChange}
                    onChange={(e) => setSelectedLevelChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Changes</option>
                    {filterOptions.levelChanges.map((change) => (
                      <option key={change} value={change}>
                        {change}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Study Type
                  </label>
                  <select
                    value={selectedStudyType}
                    onChange={(e) => setSelectedStudyType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Study Types</option>
                    {filterOptions.studyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Column Visibility
                  </label>
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        if (e.target.value === "show_all") {
                          setVisibleColumns(new Set(tableHeaders));
                        } else if (e.target.value === "hide_all") {
                          setVisibleColumns(new Set());
                        } else if (e.target.value === "reset_default") {
                          const priorityColumns = [
                            "Document_id",
                            "Subject_ID",
                            "PDF_name",
                            "Treatment_Name",
                            "Condition",
                            "Biomarker_Level_Change",
                            "Type_of_Study",
                            "Age",
                            "Sex",
                          ];
                          const defaultVisible = new Set(
                            tableHeaders.filter(
                              (header) =>
                                priorityColumns.includes(header) ||
                                tableHeaders.indexOf(header) < 8
                            )
                          );
                          setVisibleColumns(defaultVisible);
                        }
                        e.target.value = "";
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Column Actions...</option>
                      <option value="show_all">Show All Columns</option>
                      <option value="hide_all">Hide All Columns</option>
                      <option value="reset_default">Reset to Default</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {showFilters && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Toggle Columns
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {tableHeaders.map((header) => (
                    <label
                      key={header}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns.has(header)}
                        onChange={() => toggleColumn(header)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate" title={header}>
                        {prettyHeader(header)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <LoadingSpinner center text="Loading biomarker data..." />
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Error Loading Data
              </h3>
              <p className="text-slate-600">{error}</p>
              <button
                onClick={() => fetchData(currentPage)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : processedData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No Data Found
              </h3>
              <p className="text-slate-600">
                {searchTerm ||
                selectedCondition !== "all" ||
                selectedLevelChange !== "all" ||
                selectedStudyType !== "all"
                  ? "No records match the current search criteria."
                  : `No records found for ${biomarker} in ${condition} condition.`}
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    {Array.from(visibleColumns).map((header) => (
                      <th
                        key={header}
                        onClick={() => handleSort(header)}
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors border-r border-slate-200 last:border-r-0"
                      >
                        <div className="flex items-center gap-1">
                          <span className="truncate" title={header}>
                            {prettyHeader(header)}
                          </span>
                          {sortField === header &&
                            (sortDirection === "asc" ? (
                              <SortAsc className="h-3 w-3" />
                            ) : (
                              <SortDesc className="h-3 w-3" />
                            ))}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {processedData.map((item, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-25"
                      }`}
                    >
                      {Array.from(visibleColumns).map((header) => {
                        const raw = item[header];
                        const isLong = String(raw ?? "").length > 160;
                        return (
                          <td
                            key={header}
                            className="px-4 py-3 text-sm text-slate-900 border-r border-slate-100 last:border-r-0 align-top"
                          >
                            <div
                              className={isLong ? "" : "truncate"}
                              title={String(raw ?? "N/A")}
                            >
                              {formatCellValue(raw, header)}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {!isAll && totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-slate-200 flex-shrink-0">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages} ({totalCount} total records)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  setCurrentPage(newPage);
                  fetchData(newPage);
                }}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        fetchData(pageNum);
                      }}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  const newPage = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(newPage);
                  fetchData(newPage);
                }}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiomarkerDataModal;

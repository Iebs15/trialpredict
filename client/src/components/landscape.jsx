import React, { useState, useEffect } from "react";
import BiomarkerGraph3D from "./BiomarkerGraph";
import { useNavigate } from "react-router-dom";

export default function BiomarkerDiseaseSearch() {
    const [activeTab, setActiveTab] = useState("biomarker");
    const [biomarkerInput, setBiomarkerInput] = useState("");
    const [diseaseInput, setDiseaseInput] = useState("");
    const [pkpdInput, setPkpdInput] = useState("");
    
    // Clinical trial states
    const [clinicalDiseaseInput, setClinicalDiseaseInput] = useState("");
    const [clinicalDiseaseOptions, setClinicalDiseaseOptions] = useState([]);
    const [selectedClinicalDisease, setSelectedClinicalDisease] = useState("");
    const [clinicalTargetOptions, setClinicalTargetOptions] = useState([]);
    const [selectedClinicalTarget, setSelectedClinicalTarget] = useState("");
    const [loadingClinicalDiseases, setLoadingClinicalDiseases] = useState(false);
    const [loadingClinicalTargets, setLoadingClinicalTargets] = useState(false);
    const [showClinicalDiseaseDropdown, setShowClinicalDiseaseDropdown] = useState(false);
    const [showClinicalTargetDropdown, setShowClinicalTargetDropdown] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [predictions, setPredictions] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Search for diseases
    const searchClinicalDiseases = async (query) => {
        if (!query || query.length < 1) {
            setClinicalDiseaseOptions([]);
            setShowClinicalDiseaseDropdown(false);
            return;
        }

        setLoadingClinicalDiseases(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/search-disease?query=${encodeURIComponent(query)}`
            );
            
            if (!response.ok) {
                throw new Error("Failed to fetch disease options");
            }
            
            const data = await response.json();
            setClinicalDiseaseOptions(data.diseases || []);
            setShowClinicalDiseaseDropdown(true);
        } catch (err) {
            console.error("Error searching diseases:", err);
            setClinicalDiseaseOptions([]);
        } finally {
            setLoadingClinicalDiseases(false);
        }
    };

    // Search for targets based on selected disease
    const searchClinicalTargets = async (disease) => {
        if (!disease) {
            setClinicalTargetOptions([]);
            setShowClinicalTargetDropdown(false);
            return;
        }

        setLoadingClinicalTargets(true);
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/search-drugs?disease=${encodeURIComponent(disease)}`
            );
            
            if (!response.ok) {
                throw new Error("Failed to fetch target options");
            }
            
            const data = await response.json();
            setClinicalTargetOptions(data.options || []);
            setShowClinicalTargetDropdown(true);
        } catch (err) {
            console.error("Error searching targets:", err);
            setClinicalTargetOptions([]);
        } finally {
            setLoadingClinicalTargets(false);
        }
    };

    // Handle disease input change
    const handleClinicalDiseaseInputChange = (e) => {
        const value = e.target.value;
        setClinicalDiseaseInput(value);
        setSelectedClinicalDisease("");
        setSelectedClinicalTarget("");
        setClinicalTargetOptions([]);
        searchClinicalDiseases(value);
    };

    // Handle disease selection
    const handleClinicalDiseaseSelect = (disease) => {
        setSelectedClinicalDisease(disease);
        setClinicalDiseaseInput(disease);
        setShowClinicalDiseaseDropdown(false);
        setSelectedClinicalTarget("");
        searchClinicalTargets(disease);
    };

    // Handle target selection
    const handleClinicalTargetSelect = (target) => {
        setSelectedClinicalTarget(target);
        setShowClinicalTargetDropdown(false);
    };

    // Handle clinical trial search
    const handleClinicalTrialSearch = () => {
        if (!selectedClinicalDisease || !selectedClinicalTarget) {
            setError("Please select both a disease and target.");
            return;
        }

        navigate("/clinical-trial-journey", {
            state: {
                disease: selectedClinicalDisease,
                target: selectedClinicalTarget,
            },
        });
    };

    const handleBiomarkerSearch = async () => {
        if (!biomarkerInput.trim()) {
            setError("Please enter a biomarker name.");
            setPredictions(null);
            return;
        }

        setLoading(true);
        setError(null);
        setPredictions(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/biomarker_landscape?targetName=${encodeURIComponent(biomarkerInput.trim())}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch predictions");
            }

            const data = await response.json();
            setPredictions(data);
            navigate("/network", {
                state: {
                    biomarker: biomarkerInput,
                    predictions: data,
                },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDiseaseSearch = async () => {
        if (!diseaseInput.trim()) {
            setError("Please enter a disease name.");
            setPredictions(null);
            return;
        }

        setLoading(true);
        setError(null);
        setPredictions(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/disease_landscape?disease=${encodeURIComponent(diseaseInput.trim())}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch disease data");
            }

            const data = await response.json();
            console.log(data);
            navigate("/disease-targets", {
                state: {
                    diseaseID: data.diseaseId,
                    diseaseName: diseaseInput,
                    targets: data.targets,
                },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePkpdSearch = async () => {
        if (!pkpdInput.trim()) {
            setError("Please enter a disease name for PKPD analysis.");
            setPredictions(null);
            return;
        }

        setLoading(true);
        setError(null);
        setPredictions(null);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/pkpd-data?disease=${encodeURIComponent(pkpdInput.trim())}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch PKPD data");
            }

            const data = await response.json();
            console.log(data);
            navigate("/pkpd-results", {
                state: {
                    disease: pkpdInput,
                    pkpdData: data,
                },
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="grid grid-cols-4 border-b">
                    <button
                        className={`py-2 font-medium text-sm ${activeTab === "biomarker"
                            ? "border-b-2 border-teal-600 text-teal-700"
                            : "text-gray-500"
                            }`}
                        onClick={() => setActiveTab("biomarker")}
                    >
                        Biomarker Landscape
                    </button>
                    <button
                        className={`py-2 font-medium text-sm ${activeTab === "disease"
                            ? "border-b-2 border-teal-600 text-teal-700"
                            : "text-gray-500"
                            }`}
                        onClick={() => setActiveTab("disease")}
                    >
                        Disease Landscape
                    </button>
                    <button
                        className={`py-2 font-medium text-sm ${activeTab === "pkpd"
                            ? "border-b-2 border-teal-600 text-teal-700"
                            : "text-gray-500"
                            }`}
                        onClick={() => setActiveTab("pkpd")}
                    >
                        PKPD Landscape
                    </button>
                    <button
                        className={`py-2 font-medium text-sm ${activeTab === "clinical"
                            ? "border-b-2 border-teal-600 text-teal-700"
                            : "text-gray-500"
                            }`}
                        onClick={() => setActiveTab("clinical")}
                    >
                        Clinical Trial Landscape
                    </button>
                </div>

                {activeTab === "biomarker" && (
                    <div className="p-4 border rounded-lg mt-2 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="biomarker-search" className="block font-semibold">
                                Enter Biomarker
                            </label>
                            <div className="relative">
                                <svg
                                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    id="biomarker-search"
                                    type="text"
                                    placeholder="e.g., IL-6, TNF-α, EGFR"
                                    className="pl-8 w-full border rounded px-3 py-2"
                                    value={biomarkerInput}
                                    onChange={(e) => setBiomarkerInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleBiomarkerSearch();
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleBiomarkerSearch}
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>

                        {error && (
                            <div className="text-red-600 font-semibold mt-2">{error}</div>
                        )}
                    </div>
                )}

                {activeTab === "disease" && (
                    <div className="p-4 border rounded-lg mt-2 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="disease-search" className="block font-semibold">
                                Enter Disease
                            </label>
                            <div className="relative">
                                <svg
                                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    id="disease-search"
                                    type="text"
                                    placeholder="e.g., Rheumatoid Arthritis, Alzheimer's"
                                    className="pl-8 w-full border rounded px-3 py-2"
                                    value={diseaseInput}
                                    onChange={(e) => setDiseaseInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleDiseaseSearch();
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleDiseaseSearch}
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded"
                        >
                            {loading ? "Searching..." : "Search"}
                        </button>

                        {error && (
                            <div className="text-red-600 font-semibold mt-2">{error}</div>
                        )}
                    </div>
                )}

                {activeTab === "pkpd" && (
                    <div className="p-4 border rounded-lg mt-2 space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="pkpd-search" className="block font-semibold">
                                Enter Disease for PKPD Analysis
                            </label>
                            <div className="relative">
                                <svg
                                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    id="pkpd-search"
                                    type="text"
                                    placeholder="e.g., Diabetes, Hypertension, Cancer"
                                    className="pl-8 w-full border rounded px-3 py-2"
                                    value={pkpdInput}
                                    onChange={(e) => setPkpdInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handlePkpdSearch();
                                    }}
                                />
                            </div>
                        </div>
                        <button
                            onClick={handlePkpdSearch}
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded"
                        >
                            {loading ? "Analyzing..." : "Analyze PKPD"}
                        </button>

                        {error && (
                            <div className="text-red-600 font-semibold mt-2">{error}</div>
                        )}
                    </div>
                )}

                {activeTab === "clinical" && (
                    <div className="p-4 border rounded-lg mt-2 space-y-4">
                        {/* Disease Selection */}
                        <div className="space-y-2">
                            <label htmlFor="clinical-disease-search" className="block font-semibold">
                                Select Disease
                            </label>
                            <div className="relative">
                                <svg
                                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                <input
                                    id="clinical-disease-search"
                                    type="text"
                                    placeholder="Type to search diseases..."
                                    className="pl-8 w-full border rounded px-3 py-2"
                                    value={clinicalDiseaseInput}
                                    onChange={handleClinicalDiseaseInputChange}
                                    onFocus={() => {
                                        if (clinicalDiseaseOptions.length > 0) setShowClinicalDiseaseDropdown(true);
                                    }}
                                />
                                {loadingClinicalDiseases && (
                                    <div className="absolute right-2.5 top-2.5">
                                        <div className="animate-spin h-4 w-4 border-2 border-teal-600 rounded-full border-t-transparent"></div>
                                    </div>
                                )}
                                
                                {/* Disease Dropdown */}
                                {showClinicalDiseaseDropdown && clinicalDiseaseOptions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                        {clinicalDiseaseOptions.map((disease, index) => (
                                            <div
                                                key={index}
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleClinicalDiseaseSelect(disease)}
                                            >
                                                {disease}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Target Selection - Only show if disease is selected */}
                        {selectedClinicalDisease && (
                            <div className="space-y-2">
                                <label htmlFor="clinical-target-select" className="block font-semibold">
                                    Select Target
                                </label>
                                <div className="relative">
                                    <select
                                        id="clinical-target-select"
                                        className="w-full border rounded px-3 py-2"
                                        value={selectedClinicalTarget}
                                        onChange={(e) => handleClinicalTargetSelect(e.target.value)}
                                        disabled={loadingClinicalTargets}
                                    >
                                        <option value="">
                                            {loadingClinicalTargets ? "Loading targets..." : "Select a target"}
                                        </option>
                                        {clinicalTargetOptions.map((target, index) => (
                                            <option key={index} value={target}>
                                                {target}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingClinicalTargets && (
                                        <div className="absolute right-2.5 top-2.5">
                                            <div className="animate-spin h-4 w-4 border-2 border-teal-600 rounded-full border-t-transparent"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Search Button */}
                        <button
                            onClick={handleClinicalTrialSearch}
                            disabled={!selectedClinicalDisease || !selectedClinicalTarget || loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded"
                        >
                            {loading ? "Searching..." : "Explore Clinical Trials"}
                        </button>

                        {error && (
                            <div className="text-red-600 font-semibold mt-2">{error}</div>
                        )}

                        {/* Selection Summary */}
                        {(selectedClinicalDisease || selectedClinicalTarget) && (
                            <div className="bg-gray-50 p-3 rounded text-sm">
                                <div className="font-semibold mb-1">Selected:</div>
                                {selectedClinicalDisease && <div>Disease: {selectedClinicalDisease}</div>}
                                {selectedClinicalTarget && <div>Target: {selectedClinicalTarget}</div>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
import React, { useState } from "react";
import BiomarkerGraph3D from "./BiomarkerGraph";
import { useNavigate } from "react-router-dom";

export default function BiomarkerDiseaseSearch() {
    const [activeTab, setActiveTab] = useState("biomarker");
    const [biomarkerInput, setBiomarkerInput] = useState("");
    const [diseaseInput, setDiseaseInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [predictions, setPredictions] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

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
            //   setPredictions(data);
              navigate("/disease-targets", {
                state: {
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


    return (
        <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
                <div className="grid grid-cols-2 border-b">
                    <button
                        className={`py-2 font-medium ${activeTab === "biomarker"
                                ? "border-b-2 border-teal-600 text-teal-700"
                                : "text-gray-500"
                            }`}
                        onClick={() => setActiveTab("biomarker")}
                    >
                        Biomarker Landscape
                    </button>
                    <button
                        className={`py-2 font-medium ${activeTab === "disease"
                                ? "border-b-2 border-teal-600 text-teal-700"
                                : "text-gray-500"
                            }`}
                        onClick={() => setActiveTab("disease")}
                    >
                        Disease Landscape
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

                        {/* {predictions && (
              <pre className="mt-4 max-h-64 overflow-auto bg-gray-100 p-3 rounded text-sm">
                <BiomarkerGraph3D data={predictions} biomarker={biomarkerInput} />
              </pre>
            )} */}
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

                    </div>
                )}
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Building2, Target, Microscope, FileText, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export default function ClinicalTrialJourney() {
    const location = useLocation();
    const navigate = useNavigate();
    const { disease, target } = location.state || {};

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [summary, setSummary] = useState({
        totalPatents: 0,
        uniqueCompanies: new Set(),
        latestDate: null,
        oldestDate: null
    });

    useEffect(() => {
        if (!disease || !target) {
            setError('Missing disease or target information');
            setLoading(false);
            return;
        }

        const eventSource = new EventSource(
            `${import.meta.env.VITE_API_URL}/clinical-trial-journey?disease=${encodeURIComponent(disease)}&target=${encodeURIComponent(target)}`
        );

        eventSource.onopen = () => {
            setConnectionStatus('connected');
        };

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.error) {
                    setError(data.error);
                    setLoading(false);
                    return;
                }

                setResults(prevResults => {
                    const newResults = [...prevResults, data];

                    // Update summary
                    setSummary(prev => {
                        const newSummary = {
                            totalPatents: newResults.length,
                            uniqueCompanies: new Set([...prev.uniqueCompanies, data.assignee_name].filter(Boolean)),
                            latestDate: data.publication_date ?
                                (prev.latestDate ?
                                    (new Date(data.publication_date) > new Date(prev.latestDate) ? data.publication_date : prev.latestDate)
                                    : data.publication_date)
                                : prev.latestDate,
                            oldestDate: data.publication_date ?
                                (prev.oldestDate ?
                                    (new Date(data.publication_date) < new Date(prev.oldestDate) ? data.publication_date : prev.oldestDate)
                                    : data.publication_date)
                                : prev.oldestDate
                        };
                        return newSummary;
                    });

                    return newResults;
                });
            } catch (err) {
                console.error('Error parsing SSE data:', err);
            }
        };

        eventSource.onerror = (event) => {
            console.error('SSE error:', event);
            setConnectionStatus('error');
            if (results.length === 0) {
                setError('Failed to connect to the server');
            }
            setLoading(false);
            eventSource.close();
        };

        eventSource.addEventListener('done', () => {
            setLoading(false);
            setConnectionStatus('completed');
            eventSource.close();
        });

        // Cleanup
        return () => {
            eventSource.close();
        };
    }, [disease, target]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getPriorityLevel = (date) => {
        if (!date) return 'low';
        const publicationDate = new Date(date);
        const now = new Date();
        const monthsAgo = (now - publicationDate) / (1000 * 60 * 60 * 24 * 30);

        if (monthsAgo < 12) return 'high';
        if (monthsAgo < 36) return 'medium';
        return 'low';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (!disease || !target) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Missing Information</h2>
                    <p className="text-gray-600 mb-4">Disease and target information are required.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-5 w-5 mr-1" />
                                Back
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Clinical Trial Landscape</h1>
                                <p className="text-sm text-gray-600">
                                    Patent analysis for <span className="font-medium text-teal-600">{target}</span> in <span className="font-medium text-teal-600">{disease}</span>
                                </p>
                            </div>
                        </div>

                        {/* Connection Status */}
                        <div className="flex items-center space-x-2">
                            {connectionStatus === 'connecting' && (
                                <>
                                    <Clock className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm text-yellow-600">Connecting...</span>
                                </>
                            )}
                            {connectionStatus === 'connected' && loading && (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-teal-500 rounded-full border-t-transparent"></div>
                                    <span className="text-sm text-teal-600">Loading data...</span>
                                </>
                            )}
                            {connectionStatus === 'completed' && (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm text-green-600">Complete</span>
                                </>
                            )}
                            {connectionStatus === 'error' && (
                                <>
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                    <span className="text-sm text-red-600">Connection Error</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Summary Cards */}
                {results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <FileText className="h-8 w-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Patents</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.totalPatents}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <Building2 className="h-8 w-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Companies</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.uniqueCompanies.size}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <Calendar className="h-8 w-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Latest Publication</p>
                                    <p className="text-lg font-bold text-gray-900">{formatDate(summary.latestDate)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <TrendingUp className="h-8 w-8 text-orange-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Date Range</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {summary.oldestDate && summary.latestDate
                                            ? `${Math.ceil((new Date(summary.latestDate) - new Date(summary.oldestDate)) / (1000 * 60 * 60 * 24 * 365.25))} years`
                                            : 'N/A'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center">
                            <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                            <div>
                                <h3 className="text-lg font-medium text-red-800">Error</h3>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && results.length === 0 && !error && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="animate-spin mx-auto h-8 w-8 border-4 border-teal-500 rounded-full border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Analyzing patent landscape for {target} in {disease}...</p>
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Patent Portfolio Analysis</h2>
                            <span className="text-sm text-gray-500">
                                {loading ? `${results.length} patents found (loading...)` : `${results.length} patents found`}
                            </span>
                        </div>

                        {results.map((result, index) => {
                            const priority = getPriorityLevel(result.publication_date);
                            return (
                                <div key={index} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                                        {result.title || 'Untitled Patent'}
                                                    </h3>
                                                    <a
                                                        href={result.Source}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-2 py-1 rounded-full w-[90px] text-xs font-medium border text-blue-600 border-blue-400 hover:bg-blue-50 transition"
                                                    >
                                                        View Source
                                                    </a>
                                                </div>
                                                <p className="text-sm text-gray-600">Patent ID: {result.pg_pubid}</p>
                                            </div>
                                        </div>

                                        {/* Key Information Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-center space-x-2">
                                                <Microscope className="h-4 w-4 text-blue-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Drug Name</p>
                                                    <p className="text-sm font-medium text-gray-900">{result.drug_name || 'N/A'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Target className="h-4 w-4 text-green-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Target</p>
                                                    <p className="text-sm font-medium text-gray-900">{result.target_name}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-purple-600" />
                                                <div>
                                                    <p className="text-xs text-gray-500">Publication Date</p>
                                                    <p className="text-sm font-medium text-gray-900">{formatDate(result.publication_date)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Company and Inventor */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-start space-x-2">
                                                <Building2 className="h-4 w-4 text-orange-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500">Assignee/Company</p>
                                                    <p className="text-sm font-medium text-gray-900">{result.assignee_name || 'Not specified'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-2">
                                                <Users className="h-4 w-4 text-teal-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-xs text-gray-500">Inventor(s)</p>
                                                    <p className="text-sm font-medium text-gray-900">{result.inventor || 'Not specified'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Scientific Rationale */}
                                        {result.justification && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Scientific Rationale</h4>
                                                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                                    {result.justification}
                                                </p>
                                            </div>
                                        )}

                                        {/* Biomarker Association */}
                                        {result.biomarker_association && (
                                            <div className="mb-4">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Disease-Target Association</h4>
                                                <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg">
                                                    {result.biomarker_association}
                                                </p>
                                            </div>
                                        )}

                                        {/* Disease Context */}
                                        <div className="pt-3 border-t border-gray-200">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                                                <span className="text-sm text-gray-600">
                                                    Therapeutic Area: <span className="font-medium text-gray-900">{result.disease || disease}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && results.length === 0 && !error && (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Patents Found</h3>
                        <p className="text-gray-600">
                            No patent data available for {target} in {disease}. This could indicate an emerging or unexplored therapeutic area.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
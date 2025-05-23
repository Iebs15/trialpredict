import React from "react";
import { ArrowLeft, Target, Activity, AlertTriangle, Info, ChevronRight } from "lucide-react";

export default function PKPDResults({ disease, pkpdData, onBack, onPrint }) {
    if (!pkpdData || !Array.isArray(pkpdData)) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">No PKPD Data Available</h1>
                    <button
                        onClick={onBack}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const extractKeyPKInfo = (pkData) => {
        if (!pkData) return null;
        
        const bioavailability = pkData.absorption?.match(/(\d+%)?\s*to\s*(\d+%)/)?.[0] || 
                               pkData.absorption?.match(/(\d+%)/)?.[0];
        const peakTime = pkData.absorption?.match(/(\d+)\s*to\s*(\d+)\s*hours?/)?.[0] ||
                        pkData.absorption?.match(/(\d+)\s*hour/)?.[0];
        const halfLife = pkData.metabolism?.match(/half-life/i) ? "Variable" : "Not specified";
        
        return { bioavailability, peakTime, halfLife };
    };

    const formatText = (text) => {
        if (!text) return "";
        return text.replace(/\[.*?\]/g, '').replace(/\r\n/g, ' ').trim();
    };

    const uniqueData = pkpdData.reduce((acc, current) => {
        const exists = acc.find(item => 
            item.Biomarkers?.approved_symbol === current.Biomarkers?.approved_symbol &&
            item.Disease_name === current.Disease_name
        );
        if (!exists) {
            acc.push(current);
        }
        return acc;
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="flex items-center text-gray-600 hover:text-gray-800"
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    PKPD Landscape Analysis
                                </h1>
                                <p className="text-gray-600">Disease: {disease}</p>
                            </div>
                        </div>
                        <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                            {uniqueData.length} Drug{uniqueData.length !== 1 ? 's' : ''} Found
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                        <div className="flex items-center">
                            <Target className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Targets Identified</h3>
                                <p className="text-2xl font-bold text-blue-600">
                                    {new Set(uniqueData.map(d => d.Biomarkers?.approved_symbol)).size}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                        <div className="flex items-center">
                            <Activity className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Mechanisms</h3>
                                <p className="text-2xl font-bold text-green-600">
                                    {new Set(uniqueData.map(d => d.Pharmacodynamics?.mechanism_of_action)).size}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
                        <div className="flex items-center">
                            <Info className="h-8 w-8 text-purple-500 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Approved Drugs</h3>
                                <p className="text-2xl font-bold text-purple-600">
                                    {uniqueData.filter(d => d.Description?.includes('approved')).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Drug Cards */}
                <div className="space-y-8">
                    {uniqueData.map((drug, index) => {
                        const pkInfo = extractKeyPKInfo(drug.Pharmacokinetics);
                        
                        return (
                            <div key={index} className="bg-white rounded-lg shadow-sm border">
                                {/* Drug Header */}
                                <div className="border-b bg-gray-50 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                {drug.Biomarkers?.approved_name || 'Unknown Target'}
                                            </h2>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                                    {drug.Biomarkers?.approved_symbol}
                                                </span>
                                                <span className="text-gray-600 text-sm">
                                                    {drug.Biomarkers?.target_class?.replace(/[\[\]']/g, '')}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Drug Description */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Drug Information</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {formatText(drug.Description)}
                                        </p>
                                    </div>

                                    {/* PK/PD Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Pharmacodynamics */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                                <Activity className="h-5 w-5 mr-2 text-green-600" />
                                                Pharmacodynamics
                                            </h3>
                                            
                                            <div className="bg-green-50 rounded-lg p-4">
                                                <h4 className="font-medium text-green-800 mb-2">Mechanism of Action</h4>
                                                <p className="text-green-700 text-sm">
                                                    {drug.Pharmacodynamics?.mechanism_of_action || 'Not specified'}
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-800 mb-2">Pharmacodynamic Profile</h4>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {formatText(drug.Pharmacodynamics?.pharmacodynamics) || 'Not available'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Pharmacokinetics */}
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                                <Target className="h-5 w-5 mr-2 text-blue-600" />
                                                Pharmacokinetics
                                            </h3>

                                            {/* PK Summary */}
                                            <div className="bg-blue-50 rounded-lg p-4">
                                                <h4 className="font-medium text-blue-800 mb-3">Key PK Parameters</h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-blue-700 font-medium">Bioavailability:</span>
                                                        <p className="text-blue-600">{pkInfo?.bioavailability || 'Not specified'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-blue-700 font-medium">Peak Time:</span>
                                                        <p className="text-blue-600">{pkInfo?.peakTime || 'Not specified'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Detailed PK Sections */}
                                            <div className="space-y-3">
                                                <details className="bg-gray-50 rounded-lg">
                                                    <summary className="p-3 font-medium text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg">
                                                        Absorption & Distribution
                                                    </summary>
                                                    <div className="px-3 pb-3">
                                                        <p className="text-gray-700 text-sm leading-relaxed">
                                                            {formatText(drug.Pharmacokinetics?.absorption) || 'Not available'}
                                                        </p>
                                                    </div>
                                                </details>

                                                <details className="bg-gray-50 rounded-lg">
                                                    <summary className="p-3 font-medium text-gray-800 cursor-pointer hover:bg-gray-100 rounded-lg">
                                                        Metabolism & Elimination
                                                    </summary>
                                                    <div className="px-3 pb-3 space-y-2">
                                                        <div>
                                                            <h5 className="font-medium text-gray-800 text-sm">Metabolism:</h5>
                                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                                {formatText(drug.Pharmacokinetics?.metabolism) || 'Not available'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <h5 className="font-medium text-gray-800 text-sm">Elimination:</h5>
                                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                                {formatText(drug.Pharmacokinetics?.route_of_elimination) || 'Not available'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </details>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Safety Information */}
                                    {drug.Pharmacokinetics?.toxicity && (
                                        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                            <h4 className="font-medium text-red-800 flex items-center mb-2">
                                                <AlertTriangle className="h-4 w-4 mr-2" />
                                                Safety & Toxicity Profile
                                            </h4>
                                            <details>
                                                <summary className="text-red-700 cursor-pointer hover:text-red-800 text-sm font-medium">
                                                    View Safety Information
                                                </summary>
                                                <div className="mt-2">
                                                    <p className="text-red-700 text-sm leading-relaxed">
                                                        {formatText(drug.Pharmacokinetics.toxicity)}
                                                    </p>
                                                </div>
                                            </details>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-12 bg-white rounded-lg shadow-sm p-6 border">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            PKPD Analysis Complete
                        </h3>
                        <p className="text-gray-600 mb-4">
                            This analysis provides comprehensive pharmacokinetic and pharmacodynamic information 
                            for therapeutic targets associated with {disease}.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={onBack}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
                            >
                                Back to Search
                            </button>
                            <button
                                onClick={onPrint || (() => window.print())}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg"
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
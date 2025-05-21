import DiseaseTargetHeatmap from "@/components/DiseaseTargetHeatmap";
import React from "react";
import { useLocation } from "react-router-dom";

const DiseaseTargetHeatmapPage = () => {
    const location = useLocation();
    const { diseaseName, targets } = location.state || {};

    if ( !diseaseName || !targets) return <div>Invalid access</div>;

    // Construct the data object expected by the DiseaseTargetHeatmap component
    const diseaseData = {
        diseaseName,
        targets
    };

    return (
        <div className="p-2 bg-white rounded-xl shadow-lg w-full h-screen">
            <h1 className="text-2xl font-bold mb-2 text-center">
                Disease Target Associations: {diseaseName}
            </h1>
            <div className="w-full h-[90%] overflow-auto">
                <DiseaseTargetHeatmap diseaseName={diseaseName} data={diseaseData} />
            </div>
        </div>
    );
};

export default DiseaseTargetHeatmapPage;
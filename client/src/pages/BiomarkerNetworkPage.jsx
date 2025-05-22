import BiomarkerNetwork2D from "@/components/BiomarkerGraph";
import React from "react";
import { useLocation } from "react-router-dom";

const BiomarkerNetworkPage = () => {
    const location = useLocation();
    const { biomarker, predictions } = location.state || {};

    if (!biomarker || !predictions) return <div>Invalid access</div>;

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg w-full h-screen">
            <h1 className="text-2xl font-bold mb-4 text-center">
                Biomarker Network: {biomarker}
            </h1>
            <div className="w-full h-[90%]">
                <BiomarkerNetwork2D biomarker={biomarker} predictions={predictions} />
            </div>
        </div>

    );
};

export default BiomarkerNetworkPage;

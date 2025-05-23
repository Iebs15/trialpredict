// PKPDResultsPage.js - Create this as a new file
import PKPDResults from "@/components/PKPDResults";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PKPDResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const { disease, pkpdData } = location.state || {};

    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <PKPDResults
            disease={disease}
            pkpdData={pkpdData}
            onBack={handleBack}
            onPrint={handlePrint}
        />
    );
}
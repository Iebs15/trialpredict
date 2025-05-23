import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import BiomarkerNetworkPage from "./pages/BiomarkerNetworkPage"
import DiseaseTargetHeatmapPage from "./pages/DiseaseTargetHeatmapPage"
import Layout from "./pages/Layout"
import PKPDResultsPage from "./pages/PKPDResultsPage"
import ClinicalTrialJourney from "./pages/ClinicalTrialJourney"

export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/network" element={<BiomarkerNetworkPage />} />
          <Route path="/disease-targets" element={<DiseaseTargetHeatmapPage />} />
          <Route path="/pkpd-results" element={<PKPDResultsPage />} />
          <Route path="/clinical-trial-journey" element={<ClinicalTrialJourney />} />
        </Route>
      </Routes>  )
}

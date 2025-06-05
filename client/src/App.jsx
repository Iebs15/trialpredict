import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import BiomarkerNetworkPage from "./pages/BiomarkerNetworkPage"
import SymptomInfographic from "./pages/SymptomInfographic"
import DiseaseInfographic from "./pages/DiseaseInfographic"
import Layout from "./pages/Layout"


export default function App() {
  return (
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/network" element={<BiomarkerNetworkPage />} />
          <Route path="/disease-targets" element={<DiseaseInfographic />} />
          <Route path="/symptom-results" element={<SymptomInfographic />} />
        </Route>
      </Routes>  )
}

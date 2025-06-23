// import {
//   ArrowRight,
//   Database,
//   FileSearch,
//   FlaskRoundIcon as Flask,
//   LineChart,
//   Network,
//   PieChart,
//   Shield,
//   Users,
//   Zap,
// } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import BiomarkerDiseaseSearch from "@/components/BiomarkerDiseaseSearch"

// export default function Home() {
//   return (
//     <>
//       {/* Hero Section */}
//       <section className="w-full py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950/20 dark:to-background">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-12 lg:grid-cols-[1fr_500px] lg:gap-16 xl:grid-cols-[1fr_600px] items-center">
//             <div className="flex flex-col justify-center space-y-8">
//               <div className="space-y-6">
//                 <div className="inline-flex items-center rounded-full px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold">
//                   <Shield className="w-4 h-4 mr-2" />
//                   Clinical-Grade Research Platform
//                 </div>
//                 <h1 className="text-3xl font-bold tracking-tight sm:text-6xl xl:text-7xl/none bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
//                   Advanced Biomarker Intelligence Platform
//                 </h1>
//                 <p className="max-w-[600px] text-slate-600 text-lg md:text-xl leading-relaxed">
//                   TrialPredict empowers pharmaceutical researchers and clinicians with comprehensive
//                   biomarker–disease–drug relationship analysis, predictive clinical outcomes, and evidence-based
//                   treatment optimization through advanced data science and machine learning.
//                 </p>
//               </div>

//               {/* Key Stats */}
//               <div className="grid grid-cols-3 gap-6 pt-4">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">10K+</div>
//                   <div className="text-sm text-slate-600 font-medium">Biomarkers</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">5K+</div>
//                   <div className="text-sm text-slate-600 font-medium">Diseases</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-blue-600">99.9%</div>
//                   <div className="text-sm text-slate-600 font-medium">Accuracy</div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-center lg:justify-end">
//               <BiomarkerDiseaseSearch />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="w-full py-20 md:py-28 lg:py-32 bg-white">
//         <div className="container px-4 md:px-6">
//           <div className="flex flex-col items-center justify-center space-y-8 text-center mb-16">
//             <div className="space-y-4">
//               <div className="inline-flex items-center rounded-full px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold">
//                 <Zap className="w-4 h-4 mr-2" />
//                 Powered by Advanced Analytics
//               </div>
//               <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900">
//                 Comprehensive Biomarker Intelligence Suite
//               </h2>
//               <p className="max-w-[900px] text-slate-600 text-lg md:text-xl leading-relaxed">
//                 Leverage cutting-edge computational biology and machine learning to accelerate drug discovery, optimize
//                 clinical trials, and improve patient outcomes through precision medicine approaches.
//               </p>
//             </div>
//           </div>

//           <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
//             <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
//               <CardHeader className="flex flex-row items-center gap-4 pb-4">
//                 <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
//                   <Network className="h-6 w-6 text-blue-600" />
//                 </div>
//                 <CardTitle className="text-lg font-bold text-slate-800">Biomarker-Disease Networks</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="text-slate-600 leading-relaxed">
//                   Quantitative association scoring (0-1) between biomarkers and diseases, powered by comprehensive
//                   multi-omics data integration and validated research findings.
//                 </CardDescription>
//               </CardContent>
//             </Card>

//             <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
//               <CardHeader className="flex flex-row items-center gap-4 pb-4">
//                 <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
//                   <LineChart className="h-6 w-6 text-green-600" />
//                 </div>
//                 <CardTitle className="text-lg font-bold text-slate-800">Interactive Visualization</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="text-slate-600 leading-relaxed">
//                   Dynamic network graphs and pathway visualization tools to explore complex biomarker relationships and
//                   identify novel therapeutic targets.
//                 </CardDescription>
//               </CardContent>
//             </Card>

//             <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
//               <CardHeader className="flex flex-row items-center gap-4 pb-4">
//                 <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
//                   <Flask className="h-6 w-6 text-purple-600" />
//                 </div>
//                 <CardTitle className="text-lg font-bold text-slate-800">Drug Intelligence</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="text-slate-600 leading-relaxed">
//                   Comprehensive pharmacodynamics, pharmacokinetics, and mechanism of action data for precision drug
//                   selection and optimization.
//                 </CardDescription>
//               </CardContent>
//             </Card>

//             <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
//               <CardHeader className="flex flex-row items-center gap-4 pb-4">
//                 <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
//                   <PieChart className="h-6 w-6 text-orange-600" />
//                 </div>
//                 <CardTitle className="text-lg font-bold text-slate-800">Predictive Analytics</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="text-slate-600 leading-relaxed">
//                   AI-powered clinical trial outcome prediction based on biomarker profiles, patient stratification, and
//                   historical trial data analysis.
//                 </CardDescription>
//               </CardContent>
//             </Card>

//             <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
//               <CardHeader className="flex flex-row items-center gap-4 pb-4">
//                 <div className="p-3 bg-teal-100 rounded-xl group-hover:bg-teal-200 transition-colors">
//                   <FileSearch className="h-6 w-6 text-teal-600" />
//                 </div>
//                 <CardTitle className="text-lg font-bold text-slate-800">Evidence Synthesis</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="text-slate-600 leading-relaxed">
//                   Automated literature mining and clinical study analysis with safety and efficacy profiling for
//                   marketed therapeutics.
//                 </CardDescription>
//               </CardContent>
//             </Card>

//             <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
//               <CardHeader className="flex flex-row items-center gap-4 pb-4">
//                 <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
//                   <Database className="h-6 w-6 text-indigo-600" />
//                 </div>
//                 <CardTitle className="text-lg font-bold text-slate-800">Integrated Data Platform</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="text-slate-600 leading-relaxed">
//                   Curated multi-source database integration including OpenTargets, GoBiom, ClinicalTrials.gov, and
//                   proprietary research datasets.
//                 </CardDescription>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Platform Overview Section */}
//       <section className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
//             <div className="relative">
//               <img
//                 src="/placeholder.svg?height=500&width=700"
//                 width={700}
//                 height={500}
//                 alt="TrialPredict Platform Dashboard"
//                 className="rounded-2xl shadow-2xl border border-slate-200"
//               />
//               <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
//                 <div className="flex items-center space-x-3">
//                   <Users className="h-5 w-5 text-blue-600" />
//                   <span className="text-sm font-semibold text-slate-700">1000+ Researchers</span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col justify-center space-y-8">
//               <div className="space-y-4">
//                 <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900">
//                   Evidence-Based Clinical Decision Support
//                 </h2>
//                 <p className="text-slate-600 text-lg leading-relaxed">
//                   TrialPredict integrates multi-dimensional data from clinical trials, peer-reviewed literature,
//                   regulatory databases, and real-world evidence to provide actionable insights for pharmaceutical
//                   research and clinical practice.
//                 </p>
//               </div>

//               {/* Enhanced Checklist */}
//               <div className="space-y-4">
//                 {[
//                   {
//                     text: "Quantitative biomarker-disease association scoring with confidence intervals",
//                     icon: "📊",
//                   },
//                   {
//                     text: "Comprehensive drug PK/PD profiles with safety and efficacy data",
//                     icon: "💊",
//                   },
//                   {
//                     text: "Machine learning-powered clinical trial outcome predictions",
//                     icon: "🤖",
//                   },
//                   {
//                     text: "Interactive network visualization of molecular pathways",
//                     icon: "🔬",
//                   },
//                 ].map((item, idx) => (
//                   <div
//                     key={idx}
//                     className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
//                   >
//                     <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex-shrink-0">
//                       {item.icon}
//                     </div>
//                     <span className="text-slate-700 font-medium leading-relaxed">{item.text}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-r from-blue-600 to-indigo-700">
//         <div className="container px-4 md:px-6">
//           <div className="flex flex-col items-center justify-center space-y-8 text-center text-white">
//             <div className="space-y-4">
//               <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
//                 Accelerate Your Research Today
//               </h2>
//               <p className="max-w-[700px] text-blue-100 text-lg md:text-xl leading-relaxed">
//                 Join leading pharmaceutical companies and research institutions using TrialPredict to drive breakthrough
//                 discoveries and improve patient outcomes.
//               </p>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
//               <Button
//                 size="lg"
//                 className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
//               >
//                 Start Free Trial
//                 <ArrowRight className="ml-2 h-5 w-5" />
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="flex-1 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-300"
//               >
//                 Schedule Demo
//               </Button>
//             </div>

//             <p className="text-blue-200 text-sm">
//               No credit card required • 14-day free trial • Enterprise support available
//             </p>
//           </div>
//         </div>
//       </section>
//     </>
//   )
// }


"use client"

import { useState, useEffect } from "react"
import {
  ArrowRight,
  Database,
  FileSearch,
  FlaskRoundIcon as Flask,
  LineChart,
  Network,
  PieChart,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Settings,
  Search,
  Eye,
} from "lucide-react"
import netwrok from '../assets/network.png'
import mapping from '../assets/mapping.png'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BiomarkerDiseaseSearch from "@/components/BiomarkerDiseaseSearch"

const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      image: netwrok,
      title: "Advanced Network Visualization",
      description:
        "Interactive biomarker-disease relationship networks with smart clustering and adaptive positioning for comprehensive analysis.",
    },
    {
      image: mapping,
      title: "Intelligent Data Mapping",
      description:
        "Sophisticated data integration and mapping algorithms that connect multi-dimensional biomarker data across research domains.",
    },
  ]

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(timer)
  }, [slides.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-slate-200 bg-white">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={slide.image || "/placeholder.svg"}
                width={700}
                height={500}
                alt={slide.title}
                className="w-full h-[350px] object-contain"
              />
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-blue-600 scale-110" : "bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Slide content overlay */}
      <div className="absolute -bottom-30 -right-6 bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-sm">
        <h3 className="font-bold text-slate-800 mb-2">{slides[currentSlide].title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{slides[currentSlide].description}</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950/20 dark:to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_500px] lg:gap-16 xl:grid-cols-[1fr_600px] items-center">
            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold">
                  <Shield className="w-4 h-4 mr-2" />
                  Clinical-Grade Research Platform
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-6xl xl:text-7xl/none bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                  Advanced Biomarker Intelligence Platform
                </h1>
                <p className="max-w-[600px] text-slate-600 text-lg md:text-xl leading-relaxed">
                  TrialPredict empowers pharmaceutical researchers and clinicians with comprehensive
                  biomarker–disease–drug relationship analysis, predictive clinical outcomes, and evidence-based
                  treatment optimization through advanced data science and machine learning.
                </p>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">10K+</div>
                  <div className="text-sm text-slate-600 font-medium">Biomarkers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">5K+</div>
                  <div className="text-sm text-slate-600 font-medium">Diseases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">99.9%</div>
                  <div className="text-sm text-slate-600 font-medium">Accuracy</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <BiomarkerDiseaseSearch />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-28 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                Powered by Advanced Analytics
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900">
                Comprehensive Biomarker Intelligence Suite
              </h2>
              <p className="max-w-[900px] text-slate-600 text-lg md:text-xl leading-relaxed">
                Leverage cutting-edge computational biology and machine learning to accelerate drug discovery, optimize
                clinical trials, and improve patient outcomes through precision medicine approaches.
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Network className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-800">Biomarker-Disease Networks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Quantitative association scoring (0-1) between biomarkers and diseases, powered by comprehensive
                  multi-omics data integration and validated research findings.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                  <LineChart className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-800">Interactive Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Dynamic network graphs and pathway visualization tools to explore complex biomarker relationships and
                  identify novel therapeutic targets.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                  <Flask className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-800">Drug Intelligence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Comprehensive pharmacodynamics, pharmacokinetics, and mechanism of action data for precision drug
                  selection and optimization.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                  <PieChart className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-800">Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 leading-relaxed">
                  AI-powered clinical trial outcome prediction based on biomarker profiles, patient stratification, and
                  historical trial data analysis.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-teal-100 rounded-xl group-hover:bg-teal-200 transition-colors">
                  <FileSearch className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-800">Evidence Synthesis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Automated literature mining and clinical study analysis with safety and efficacy profiling for
                  marketed therapeutics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg group">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-indigo-100 rounded-xl group-hover:bg-indigo-200 transition-colors">
                  <Database className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-800">Integrated Data Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600 leading-relaxed">
                  Curated multi-source database integration including OpenTargets, GoBiom, ClinicalTrials.gov, and
                  proprietary research datasets.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Platform Overview Section with Carousel */}
      <section className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <ImageCarousel />

            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900">
                  Evidence-Based Clinical Decision Support
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  Advanced network visualization and intelligent data mapping capabilities that transform complex
                  biomarker relationships into actionable clinical insights through cutting-edge computational
                  approaches.
                </p>
              </div>

              {/* Enhanced Network Features */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Adjustable Node Spacing</span>
                    </div>
                    <div className="text-sm text-blue-700">
                      Control node separation distance to reduce congestion and improve visual clarity
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Search className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Smart Search & Filtering</span>
                    </div>
                    <div className="text-sm text-green-700">
                      Search nodes by name and apply multiple filters to focus on specific relationships
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-800">Adaptive Label Display</span>
                    </div>
                    <div className="text-sm text-amber-700">
                      Labels shown only for highly connected nodes to reduce visual clutter
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Network className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Smart Clustering</span>
                    </div>
                    <div className="text-sm text-purple-700">
                      Similar nodes are grouped together using connection patterns for better organization
                    </div>
                  </div>
                </div>

                {/* Enhanced Interactions */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-800 text-lg">Enhanced Interactions</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-indigo-800">Fullscreen Mode:</span>
                        <span className="text-indigo-700 ml-1">
                          Expand network to full screen for detailed analysis of complex relationships
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-teal-800">Dynamic Highlighting:</span>
                        <span className="text-teal-700 ml-1">
                          Click disease nodes to highlight their connections and fade unrelated elements
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg">
                      <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium text-rose-800">Enhanced Tooltips:</span>
                        <span className="text-rose-700 ml-1">
                          Detailed information on hover with improved styling and comprehensive data
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-8 text-center text-white">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Accelerate Your Research Today
              </h2>
              <p className="max-w-[700px] text-blue-100 text-lg md:text-xl leading-relaxed">
                Join leading pharmaceutical companies and research institutions using TrialPredict to drive breakthrough
                discoveries and improve patient outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

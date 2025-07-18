// "use client"

// import { useState, useEffect } from "react"
// import {
//   ArrowRight,
//   Database,
//   FileSearch,
//   FlaskRoundIcon as Flask,
//   LineChart,
//   Network,
//   PieChart,
//   Shield,
//   Zap,
//   ChevronLeft,
//   ChevronRight,
//   Settings,
//   Search,
//   Eye,
// } from "lucide-react"
// import netwrok from '../assets/network.png'
// import mapping from '../assets/mapping.png'
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import BiomarkerDiseaseSearch from "@/components/BiomarkerDiseaseSearch"

// const ImageCarousel = () => {
//   const [currentSlide, setCurrentSlide] = useState(0)

//   const slides = [
//     {
//       image: netwrok,
//       title: "Advanced Network Visualization",
//       description:
//         "Interactive biomarker-disease relationship networks with smart clustering and adaptive positioning for comprehensive analysis.",
//     },
//     {
//       image: mapping,
//       title: "Intelligent Data Mapping",
//       description:
//         "Sophisticated data integration and mapping algorithms that connect multi-dimensional biomarker data across research domains.",
//     },
//   ]

//   // Auto-slide functionality
//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length)
//     }, 4000) // Change slide every 4 seconds

//     return () => clearInterval(timer)
//   }, [slides.length])

//   const nextSlide = () => {
//     setCurrentSlide((prev) => (prev + 1) % slides.length)
//   }

//   const prevSlide = () => {
//     setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
//   }

//   return (
//     <div className="relative">
//       <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-slate-200 bg-white">
//         <div
//           className="flex transition-transform duration-500 ease-in-out"
//           style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//         >
//           {slides.map((slide, index) => (
//             <div key={index} className="w-full flex-shrink-0">
//               <img
//                 src={slide.image || "/placeholder.svg"}
//                 width={700}
//                 height={500}
//                 alt={slide.title}
//                 className="w-full h-[350px] object-contain"
//               />
//             </div>
//           ))}
//         </div>

//         {/* Navigation buttons */}
//         <button
//           onClick={prevSlide}
//           className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
//         >
//           <ChevronLeft className="h-5 w-5" />
//         </button>

//         <button
//           onClick={nextSlide}
//           className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-slate-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
//         >
//           <ChevronRight className="h-5 w-5" />
//         </button>

//         {/* Slide indicators */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
//           {slides.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentSlide(index)}
//               className={`w-3 h-3 rounded-full transition-all duration-200 ${
//                 index === currentSlide ? "bg-blue-600 scale-110" : "bg-white/70 hover:bg-white"
//               }`}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Slide content overlay */}
//       <div className="absolute -bottom-30 -right-6 bg-white p-6 rounded-xl shadow-lg border border-slate-200 max-w-sm">
//         <h3 className="font-bold text-slate-800 mb-2">{slides[currentSlide].title}</h3>
//         <p className="text-sm text-slate-600 leading-relaxed">{slides[currentSlide].description}</p>
//       </div>
//     </div>
//   )
// }

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

//       {/* Enhanced Platform Overview Section with Carousel */}
//       <section className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
//             <ImageCarousel />

//             <div className="flex flex-col justify-center space-y-8">
//               <div className="space-y-4">
//                 <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900">
//                   Evidence-Based Clinical Decision Support
//                 </h2>
//                 <p className="text-slate-600 text-lg leading-relaxed">
//                   Advanced network visualization and intelligent data mapping capabilities that transform complex
//                   biomarker relationships into actionable clinical insights through cutting-edge computational
//                   approaches.
//                 </p>
//               </div>

//               {/* Enhanced Network Features */}
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Settings className="h-4 w-4 text-blue-600" />
//                       <span className="font-medium text-blue-800">Adjustable Node Spacing</span>
//                     </div>
//                     <div className="text-sm text-blue-700">
//                       Control node separation distance to reduce congestion and improve visual clarity
//                     </div>
//                   </div>

//                   <div className="p-4 bg-green-50 rounded-lg border border-green-200">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Search className="h-4 w-4 text-green-600" />
//                       <span className="font-medium text-green-800">Smart Search & Filtering</span>
//                     </div>
//                     <div className="text-sm text-green-700">
//                       Search nodes by name and apply multiple filters to focus on specific relationships
//                     </div>
//                   </div>

//                   <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Eye className="h-4 w-4 text-amber-600" />
//                       <span className="font-medium text-amber-800">Adaptive Label Display</span>
//                     </div>
//                     <div className="text-sm text-amber-700">
//                       Labels shown only for highly connected nodes to reduce visual clutter
//                     </div>
//                   </div>

//                   <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Network className="h-4 w-4 text-purple-600" />
//                       <span className="font-medium text-purple-800">Smart Clustering</span>
//                     </div>
//                     <div className="text-sm text-purple-700">
//                       Similar nodes are grouped together using connection patterns for better organization
//                     </div>
//                   </div>
//                 </div>

//                 {/* Enhanced Interactions */}
//                 <div className="space-y-3">
//                   <h4 className="font-semibold text-slate-800 text-lg">Enhanced Interactions</h4>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
//                       <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-indigo-800">Fullscreen Mode:</span>
//                         <span className="text-indigo-700 ml-1">
//                           Expand network to full screen for detailed analysis of complex relationships
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
//                       <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-teal-800">Dynamic Highlighting:</span>
//                         <span className="text-teal-700 ml-1">
//                           Click disease nodes to highlight their connections and fade unrelated elements
//                         </span>
//                       </div>
//                     </div>
//                     <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg">
//                       <div className="w-2 h-2 bg-rose-500 rounded-full mt-2 flex-shrink-0"></div>
//                       <div>
//                         <span className="font-medium text-rose-800">Enhanced Tooltips:</span>
//                         <span className="text-rose-700 ml-1">
//                           Detailed information on hover with improved styling and comprehensive data
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
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
//           </div>
//         </div>
//       </section>
//     </>
//   )
// }


"use client"

import { useState, useEffect, useRef } from "react"
import {
  ArrowRight,
  Database,
  FileSearch,
  FlaskRoundIcon as Flask,
  LineChart,
  Network,
  Shield,
  Zap,
  ChevronLeft,
  ChevronRight,
  Settings,
  Search,
  Eye,
  Activity,
  Users,
  CheckCircle,
  Globe,
  Brain,
  Target,
  BarChart3,
  Sparkles,
  Play,
  Quote,
  Building2,
  Calendar,
  Clock,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import BiomarkerDiseaseSearch from "../components/BiomarkerDiseaseSearch"
import network from '../assets/network.png'
import mapping from '../assets/mapping.png'
// Floating particles animation component
const FloatingParticles = () => {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-emerald-200/20 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// Enhanced Image Carousel with more features
const ImageCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const slides = [
    {
      image: network,
      title: "Advanced Network Visualization",
      description:
        "Interactive biomarker-disease relationship networks with smart clustering and adaptive positioning for comprehensive analysis.",
      features: ["Real-time Updates", "3D Visualization", "AI-Powered Insights"],
    },
    {
      image: mapping,
      title: "Intelligent Data Mapping",
      description:
        "Sophisticated data integration and mapping algorithms that connect multi-dimensional biomarker data across research domains.",
      features: ["Multi-Source Integration", "Automated Processing", "Quality Validation"],
    }
  ]

  useEffect(() => {
    if (!isPlaying) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length, isPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl border-2 border-slate-200/50 bg-white backdrop-blur-sm">
        <div
          className="flex transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0 relative">
              <img
                src={slide.image || "/placeholder.svg"}
                width={700}
                height={500}
                alt={slide.title}
                className="w-full h-[450px] object-contain p-6"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-slate-700 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/95 hover:bg-white text-slate-700 p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute top-6 right-6 bg-white/95 hover:bg-white text-slate-700 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
        >
          <Play className={`h-5 w-5 ${isPlaying ? "opacity-50" : "opacity-100"}`} />
        </button>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-emerald-600 scale-125 shadow-lg"
                  : "bg-white/70 hover:bg-white hover:scale-110"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="absolute -bottom-12 -right-12 bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-slate-200/50 max-w-md transform transition-all duration-500 hover:scale-105">
        <h3 className="font-bold text-slate-800 mb-3 text-xl">{slides[currentSlide].title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{slides[currentSlide].description}</p>
        <div className="flex flex-wrap gap-2">
          {slides[currentSlide].features.map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-emerald-100 text-emerald-700">
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

// Enhanced Animated Counter with more effects
const AnimatedCounter = ({ end, duration = 2000, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime
    let animationFrame

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, isVisible])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      quote:
        "InsiBiom has revolutionized our drug discovery process. The biomarker insights have accelerated our research by 40%.",
      author: "Dr. Sarah Chen",
      role: "Chief Scientific Officer",
      company: "BioTech Innovations",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      quote:
        "The predictive analytics capabilities have saved us millions in failed clinical trials. Absolutely game-changing.",
      author: "Prof. Michael Rodriguez",
      role: "Research Director",
      company: "Global Pharma Corp",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      quote:
        "Integration with our existing systems was seamless. The platform's accuracy is unmatched in the industry.",
      author: "Dr. Emily Watson",
      role: "VP of Research",
      company: "MedTech Solutions",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  return (
    <section className="w-full py-16 md:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 relative overflow-hidden">
      <FloatingParticles />
      <div className="container relative px-4 md:px-6">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
            <Users className="w-4 h-4 mr-2" />
            Trusted by Industry Leaders
          </Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-white mb-6">
            What Our Partners Say
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Leading pharmaceutical companies and research institutions trust InsiBiom for their most critical
            research initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-500 hover:scale-105 hover:shadow-2xl group"
            >
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-white/90 text-lg leading-relaxed mb-6 font-medium">{testimonial.quote}</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full border-2 border-emerald-400"
                  />
                  <div>
                    <p className="font-bold text-white">{testimonial.author}</p>
                    <p className="text-emerald-300 text-sm">{testimonial.role}</p>
                    <p className="text-slate-400 text-sm">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}


// Enhanced Stats Section
const StatsSection = () => {
  const stats = [
    {
      value: 10000,
      suffix: "+",
      label: "Biomarkers Analyzed",
      icon: Flask,
      description: "Comprehensive biomarker database",
    },
    {
      value: 5000,
      suffix: "+",
      label: "Disease Profiles",
      icon: Activity,
      description: "Detailed disease characterizations",
    },
    {
      value: 99.9,
      suffix: "%",
      label: "Prediction Accuracy",
      icon: Target,
      description: "AI-powered precision",
    },
    {
      value: 500,
      suffix: "+",
      label: "Research Partners",
      icon: Building2,
      description: "Global collaboration network",
    },
    {
      value: 1000000,
      suffix: "+",
      label: "Data Points",
      icon: BarChart3,
      description: "Rich analytical insights",
    },
    {
      value: 24,
      suffix: "/7",
      label: "Platform Uptime",
      icon: Clock,
      description: "Always available",
    },
  ]

  return (
    <section className="w-full py-16 md:py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-emerald-100 text-emerald-800">
            <BarChart3 className="w-4 h-4 mr-2" />
            Platform Statistics
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl text-slate-900 mb-6">
            Powering Research Worldwide
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="text-center group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-2 border-white/50"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-4 bg-emerald-100 rounded-2xl group-hover:bg-emerald-200 transition-colors group-hover:scale-110 transform duration-300">
                    <stat.icon className="w-8 h-8 text-emerald-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-600 mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <h3 className="text-md font-bold text-slate-800 mb-2">{stat.label}</h3>
                <p className="text-slate-600 text-sm font-medium">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Main Home Component
export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 relative overflow-hidden">
      {/* Cursor follower effect */}
      <div
        className="fixed w-6 h-6 bg-emerald-400/20 rounded-full pointer-events-none z-50 transition-transform duration-100 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: "scale(1)",
        }}
      />

      {/* Hero Section */}
      <section className="relative w-full py-12 overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_50%)]" />

        <div className="container relative px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_500px] lg:gap-16 xl:grid-cols-[1fr_600px] items-center">
            <div className="flex flex-col justify-center space-y-8 animate-in slide-in-from-left duration-1000">
              <div className="space-y-6">
                <Badge
                  variant="secondary"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-100/80 text-emerald-800 text-base font-bold border border-emerald-200/50 hover:bg-emerald-100 transition-all duration-300 hover:scale-105"
                >
                  <Shield className="w-5 h-5" />
                  Clinical-Grade Research Platform
                  <Sparkles className="w-4 h-4 ml-2" />
                </Badge>

                <h1 className="text-3xl font-bold tracking-tight sm:text-5xl xl:text-6xl/none">
                  <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 bg-clip-text text-transparent">
                    Advanced Biomarker
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Intelligence Platform
                  </span>
                </h1>

                <p className="max-w-[700px] text-lg md:text-xl leading-relaxed font-medium">
                  InsiBiom empowers pharmaceutical researchers and clinicians with comprehensive
                  biomarker–disease–drug relationship analysis, predictive clinical outcomes, and evidence-based
                  treatment optimization through advanced data science and machine learning.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-10 pt-8">
                {[
                  { value: 10, suffix: "K+", label: "Biomarkers", icon: Flask, color: "emerald" },
                  { value: 5, suffix: "K+", label: "Diseases", icon: Activity, color: "teal" },
                  { value: 99.9, suffix: "%", label: "Accuracy", icon: Target, color: "cyan" },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className="text-center group hover:scale-110 transition-all duration-500 cursor-pointer"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    <div className="flex items-center justify-center mb-4">
                      <div className="p-4 bg-emerald-100 rounded-3xl group-hover:bg-emerald-200 transition-all duration-300 group-hover:rotate-12 shadow-lg">
                        <stat.icon className="w-8 h-8 text-emerald-700" />
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-emerald-600 mb-2">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-base text-slate-600 font-bold uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end animate-in slide-in-from-right duration-1000 delay-300">
              <BiomarkerDiseaseSearch />
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="w-full py-18 md:py-24 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/40 to-transparent" />

        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-12 text-center mb-24">
            <div className="space-y-8">
              <Badge
                variant="secondary"
                className="inline-flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-700 text-base font-bold hover:bg-slate-200 transition-colors"
              >
                <Zap className="w-5 h-5" />
                Powered by Advanced Analytics
                <Brain className="w-4 h-4 ml-2" />
              </Badge>

              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900 max-w-5xl">
                Comprehensive Biomarker Intelligence Suite
              </h2>

              <p className="max-w-[1000px] text-lg md:text-xl leading-relaxed font-medium">
                Leverage cutting-edge computational biology and machine learning to accelerate drug discovery, optimize
                clinical trials, and improve patient outcomes through precision medicine approaches.
              </p>
            </div>
          </div>

          <div className="mx-auto grid max-w-8xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Network,
                title: "Biomarker-Disease Networks",
                description:
                  "Quantitative association scoring (0-1) between biomarkers and diseases, powered by comprehensive multi-omics data integration and validated research findings.",
                color: "emerald",
                delay: "0ms",
                features: ["Multi-omics Integration", "Validated Research", "Real-time Updates"],
              },
              {
                icon: LineChart,
                title: "Interactive Visualization",
                description:
                  "Dynamic network graphs and pathway visualization tools to explore complex biomarker relationships and identify novel therapeutic targets.",
                color: "teal",
                delay: "100ms",
                features: ["3D Networks", "Pathway Analysis", "Custom Filters"],
              },
              {
                icon: Flask,
                title: "Drug Intelligence",
                description:
                  "Comprehensive pharmacodynamics, pharmacokinetics, and mechanism of action data for precision drug selection and optimization.",
                color: "cyan",
                delay: "200ms",
                features: ["PK/PD Analysis", "MOA Mapping", "Safety Profiles"],
              },
              {
                icon: Brain,
                title: "AI-Powered Predictions",
                description:
                  "Machine learning algorithms trained on vast datasets to predict clinical trial outcomes and drug efficacy with unprecedented accuracy.",
                color: "slate",
                delay: "300ms",
                features: ["ML Algorithms", "Outcome Prediction", "Risk Assessment"],
              },
              {
                icon: FileSearch,
                title: "Evidence Synthesis",
                description:
                  "Automated literature mining and clinical study analysis with safety and efficacy profiling for marketed therapeutics.",
                color: "amber",
                delay: "400ms",
                features: ["Literature Mining", "Clinical Studies", "Safety Analysis"],
              },
              {
                icon: Database,
                title: "Integrated Data Platform",
                description:
                  "Curated multi-source database integration including OpenTargets, GoBiom, ClinicalTrials.gov, and proprietary research datasets.",
                color: "violet",
                delay: "500ms",
                features: ["Multi-source Data", "Quality Curation", "API Access"],
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                className="group border-2 border-slate-100 hover:border-emerald-200 transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 bg-white/90 backdrop-blur-sm relative overflow-hidden"
                style={{ animationDelay: feature.delay }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="flex flex-col items-start gap-6 pb-8 relative z-10">
                  <div className="flex items-center justify-between w-full">
                    <div className="p-5 bg-emerald-100 rounded-3xl group-hover:bg-emerald-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-lg">
                      <feature.icon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <div className="space-y-4">
                    <CardTitle className="text-2xl font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-slate-600 leading-relaxed text-lg font-medium">
                      {feature.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {feature.features.map((feat, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                          {feat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Platform Overview Section */}
      <section className="w-full py-16 md:py-20 bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 relative overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_70%)]" />

        <div className="container relative px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="animate-in slide-in-from-left duration-1000">
              <ImageCarousel />
            </div>

            <div className="flex flex-col justify-center space-y-12 animate-in slide-in-from-right duration-1000 delay-300">
              <div className="space-y-8">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-6 py-3">
                  <Globe className="w-4 h-4 mr-2" />
                  Global Research Platform
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900">
                  Evidence-Based Clinical Decision Support
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed font-medium">
                  Advanced network visualization and intelligent data mapping capabilities that transform complex
                  biomarker relationships into actionable clinical insights through cutting-edge computational
                  approaches.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Settings,
                    title: "Adjustable Node Spacing",
                    description: "Control node separation distance to reduce congestion and improve visual clarity",
                    color: "emerald",
                  },
                  {
                    icon: Search,
                    title: "Smart Search & Filtering",
                    description: "Search nodes by name and apply multiple filters to focus on specific relationships",
                    color: "teal",
                  },
                  {
                    icon: Eye,
                    title: "Adaptive Label Display",
                    description: "Labels shown only for highly connected nodes to reduce visual clutter",
                    color: "cyan",
                  },
                  {
                    icon: Network,
                    title: "Smart Clustering",
                    description: "Similar nodes are grouped together using connection patterns for better organization",
                    color: "slate",
                  },
                ].map((feature, index) => (
                  <div
                    key={feature.title}
                    className="p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-emerald-200/50 hover:bg-white transition-all duration-500 hover:scale-105 hover:shadow-xl group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-emerald-100 rounded-2xl group-hover:bg-emerald-200 transition-colors">
                        <feature.icon className="h-6 w-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="font-bold text-emerald-800 text-md">{feature.title}</span>
                    </div>
                    <div className="text-emerald-700 leading-relaxed font-medium">{feature.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="w-full py-16 md:py-20 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden">
        <FloatingParticles />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

        <div className="container relative px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-12 text-center text-white">
            <div className="space-y-10 max-w-5xl">
             
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
                Accelerate Your Research Today
              </h2>
              <p className="text-emerald-100 text-lg md:text-xl leading-relaxed font-medium">
                Join leading pharmaceutical companies and research institutions using InsiBiom to drive breakthrough
                discoveries and improve patient outcomes.
              </p>
            </div>

           

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-4xl">
              {[
                { icon: CheckCircle, text: "30-day free trial" },
                { icon: Shield, text: "Enterprise security" },
                { icon: Users, text: "24/7 expert support" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center justify-center gap-3 text-emerald-100">
                  <feature.icon className="h-6 w-6" />
                  <span className="font-semibold text-lg">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// import { ArrowRight, Database, FileSearch, FlaskRoundIcon as Flask, LineChart, Network, PieChart } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import BiomarkerDiseaseSearch from "@/components/BiomarkerDiseaseSearch"

// export default function Home() {
//   return (
//     <>
//       {/* Hero Section */}
//       <section className="w-full py-2 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/20 dark:to-background">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
//             <div className="flex flex-col justify-center space-y-4">
//               <div className="space-y-2">
//                 <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
//                   Discover Biomarker-Disease Relationships
//                 </h1>
//                 <p className="max-w-[600px] text-muted-foreground md:text-xl">
//                 TrialPredict empowers researchers and clinicians with a unified platform to decode biomarker–disease–drug relationships, predict clinical outcomes, and make evidence-based treatment decisions.
//                 Explore dynamic landscapes of biomarkers, diseases, pharmacokinetics/pharmacodynamics (PK/PD), and clinical trials — all backed by data-driven insights.
//                 </p>
//               </div>
//             </div>

//             <BiomarkerDiseaseSearch />
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="w-full py-12 md:py-24 lg:py-32">
//         <div className="container px-4 md:px-6">
//           <div className="flex flex-col items-center justify-center space-y-4 text-center">
//             <div className="space-y-2">
//               <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//                 Comprehensive Biomarker Intelligence
//               </h2>
//               <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
//                 TrialPredict provides a comprehensive analysis platform for biomarker-disease relationships, clinical
//                 trial outcomes, and treatment efficacy.
//               </p>
//             </div>
//           </div>
//           <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
//             <Card>
//               <CardHeader className="flex flex-row items-center gap-4 pb-2">
//                 <Network className="h-8 w-8 text-teal-600" />
//                 <CardTitle className="text-lg">Biomarker-Disease Association</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="min-h-[4rem]">
//                   Discover association scores (0-1) between biomarkers and diseases, backed by comprehensive research
//                   data.
//                 </CardDescription>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center gap-4 pb-2">
//                 <LineChart className="h-8 w-8 text-teal-600" />
//                 <CardTitle className="text-lg">Interactive Graph Visualization</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="min-h-[4rem]">
//                   Explore related diseases through interactive network graphs to identify new research opportunities.
//                 </CardDescription>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center gap-4 pb-2">
//                 <Flask className="h-8 w-8 text-teal-600" />
//                 <CardTitle className="text-lg">Drug Information</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="min-h-[4rem]">
//                   Access detailed pharmacodynamics and pharmacokinetics for treatments associated with specific
//                   diseases.
//                 </CardDescription>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center gap-4 pb-2">
//                 <PieChart className="h-8 w-8 text-teal-600" />
//                 <CardTitle className="text-lg">Clinical Trial Predictions</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="min-h-[4rem]">
//                   Predict outcomes for clinical trials based on biomarker-disease combinations and historical data.
//                 </CardDescription>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center gap-4 pb-2">
//                 <FileSearch className="h-8 w-8 text-teal-600" />
//                 <CardTitle className="text-lg">Research Insights</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="min-h-[4rem]">
//                   Review previous clinical studies and safety/efficacy data for marketed drugs related to your search.
//                 </CardDescription>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center gap-4 pb-2">
//                 <Database className="h-8 w-8 text-teal-600" />
//                 <CardTitle className="text-lg">Comprehensive Database</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <CardDescription className="min-h-[4rem]">
//                   Access a curated database of biomarkers, diseases, and drugs with regularly updated research findings.
//                 </CardDescription>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Dashboard Image Section */}
//       <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-50 dark:bg-teal-950/10">
//         <div className="container px-4 md:px-6">
//           <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
//             <img
//               src="/placeholder.svg"
//               width={600}
//               height={400}
//               alt="TrialPredict Dashboard"
//               className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
//             />
//             <div className="flex flex-col justify-center space-y-4">
//               <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//                 Evidence-Based Decision Support
//               </h2>
//               <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
//                 TrialPredict integrates data from multiple sources, including clinical trials, published research, and
//                 databases like OpenTargets and GoBiom.
//               </p>
//               {/* Checklist */}
//               <ul className="grid gap-2">
//                 {[
//                   "Quantitative association scores between biomarkers and diseases",
//                   "Detailed drug pharmacodynamics and pharmacokinetics",
//                   "Clinical trial outcome predictions based on historical data",
//                   "Interactive network visualization of biomarker-disease relationships",
//                 ].map((text, idx) => (
//                   <li key={idx} className="flex items-center gap-2">
//                     <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white">
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-4 w-4"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                       >
//                         <polyline points="20 6 9 17 4 12" />
//                       </svg>
//                     </div>
//                     <span>{text}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="w-full py-12 md:py-24 lg:py-32">
//         <div className="container px-4 md:px-6">
//           <div className="flex flex-col items-center justify-center space-y-4 text-center">
//             <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Start Exploring Today</h2>
//             <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
//               Begin your journey with TrialPredict and unlock valuable insights for your research or clinical practice.
//             </p>
//             <div className="mx-auto w-full max-w-sm space-y-2">
//               <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700">
//                 Get Started Now
//               </Button>
//               <p className="text-xs text-muted-foreground">
//                 No credit card required. Start exploring biomarker-disease relationships immediately.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   )
// }



import {
  ArrowRight,
  Database,
  FileSearch,
  FlaskRoundIcon as Flask,
  LineChart,
  Network,
  PieChart,
  Shield,
  Users,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import BiomarkerDiseaseSearch from "@/components/BiomarkerDiseaseSearch"

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

      {/* Platform Overview Section */}
      <section className="w-full py-20 md:py-28 lg:py-32 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="relative">
              <img
                src="/placeholder.svg?height=500&width=700"
                width={700}
                height={500}
                alt="TrialPredict Platform Dashboard"
                className="rounded-2xl shadow-2xl border border-slate-200"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">1000+ Researchers</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-slate-900">
                  Evidence-Based Clinical Decision Support
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed">
                  TrialPredict integrates multi-dimensional data from clinical trials, peer-reviewed literature,
                  regulatory databases, and real-world evidence to provide actionable insights for pharmaceutical
                  research and clinical practice.
                </p>
              </div>

              {/* Enhanced Checklist */}
              <div className="space-y-4">
                {[
                  {
                    text: "Quantitative biomarker-disease association scoring with confidence intervals",
                    icon: "📊",
                  },
                  {
                    text: "Comprehensive drug PK/PD profiles with safety and efficacy data",
                    icon: "💊",
                  },
                  {
                    text: "Machine learning-powered clinical trial outcome predictions",
                    icon: "🤖",
                  },
                  {
                    text: "Interactive network visualization of molecular pathways",
                    icon: "🔬",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold text-sm flex-shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-slate-700 font-medium leading-relaxed">{item.text}</span>
                  </div>
                ))}
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

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Button
                size="lg"
                className="flex-1 bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-300"
              >
                Schedule Demo
              </Button>
            </div>

            <p className="text-blue-200 text-sm">
              No credit card required • 14-day free trial • Enterprise support available
            </p>
          </div>
        </div>
      </section>
    </>
  )
}

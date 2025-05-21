import { Link } from "react-router-dom"
import {
  ArrowRight,
  Database,
  FileSearch,
  FlaskRoundIcon as Flask,
  LineChart,
  Network,
  PieChart,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Flask className="h-6 w-6 text-teal-600" />
            <span>TrialPredict</span>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              About
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Features
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Documentation
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Contact
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/20 dark:to-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Discover Biomarker-Disease Relationships
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    TrialPredict helps researchers and clinicians understand biomarker associations, predict clinical
                    outcomes, and explore treatment options with evidence-based insights.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <Tabs defaultValue="biomarker" className="w-full max-w-md">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="biomarker">Biomarker Landscape</TabsTrigger>
                    <TabsTrigger value="disease">Disease Landscape</TabsTrigger>
                  </TabsList>
                  <TabsContent value="biomarker" className="p-4 border rounded-lg mt-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="biomarker-search">Enter Biomarker</Label>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input id="biomarker-search" placeholder="e.g., IL-6, TNF-α, EGFR" className="pl-8" />
                        </div>
                      </div>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700">Search</Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="disease" className="p-4 border rounded-lg mt-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="disease-search">Enter Disease</Label>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="disease-search"
                            placeholder="e.g., Rheumatoid Arthritis, Alzheimer's"
                            className="pl-8"
                          />
                        </div>
                      </div>
                      <Button className="w-full bg-teal-600 hover:bg-teal-700">Search</Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Comprehensive Biomarker Intelligence
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  TrialPredict provides a comprehensive analysis platform for biomarker-disease relationships, clinical
                  trial outcomes, and treatment efficacy.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Network className="h-8 w-8 text-teal-600" />
                  <CardTitle className="text-lg">Biomarker-Disease Association</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[4rem]">
                    Discover association scores (0-1) between biomarkers and diseases, backed by comprehensive research
                    data.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <LineChart className="h-8 w-8 text-teal-600" />
                  <CardTitle className="text-lg">Interactive Graph Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[4rem]">
                    Explore related diseases through interactive network graphs to identify new research opportunities.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Flask className="h-8 w-8 text-teal-600" />
                  <CardTitle className="text-lg">Drug Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[4rem]">
                    Access detailed pharmacodynamics and pharmacokinetics for treatments associated with specific
                    diseases.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <PieChart className="h-8 w-8 text-teal-600" />
                  <CardTitle className="text-lg">Clinical Trial Predictions</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[4rem]">
                    Predict outcomes for clinical trials based on biomarker-disease combinations and historical data.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <FileSearch className="h-8 w-8 text-teal-600" />
                  <CardTitle className="text-lg">Research Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[4rem]">
                    Review previous clinical studies and safety/efficacy data for marketed drugs related to your search.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                  <Database className="h-8 w-8 text-teal-600" />
                  <CardTitle className="text-lg">Comprehensive Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="min-h-[4rem]">
                    Access a curated database of biomarkers, diseases, and drugs with regularly updated research
                    findings.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Dashboard Image Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-teal-50 dark:bg-teal-950/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <img
                src="/placeholder.svg"
                width={600}
                height={400}
                alt="TrialPredict Dashboard"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Evidence-Based Decision Support
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                  TrialPredict integrates data from multiple sources, including clinical trials, published research, and
                  databases like OpenTargets and GoBiom.
                </p>
                {/* Checklist */}
                <ul className="grid gap-2">
                  {[
                    "Quantitative association scores between biomarkers and diseases",
                    "Detailed drug pharmacodynamics and pharmacokinetics",
                    "Clinical trial outcome predictions based on historical data",
                    "Interactive network visualization of biomarker-disease relationships",
                  ].map((text, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Start Exploring Today</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Begin your journey with TrialPredict and unlock valuable insights for your research or clinical
                practice.
              </p>
              <div className="mx-auto w-full max-w-sm space-y-2">
                <Button size="lg" className="w-full bg-teal-600 hover:bg-teal-700">
                  Get Started Now
                </Button>
                <p className="text-xs text-muted-foreground">
                  No credit card required. Start exploring biomarker-disease relationships immediately.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8">
          <div className="flex items-center gap-2 font-bold">
            <Flask className="h-5 w-5 text-teal-600" />
            <span>TrialPredict</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2025 TrialPredict. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6 md:ml-auto">
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Terms
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Privacy
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" to="#">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

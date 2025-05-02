"use client"

import { useEffect, useState } from "react"
import { ArrowRight, BarChart2, FileText, Database, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DrugSearch } from "@/components/drug-search"

function App() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)
  const [inputMethod, setInputMethod] = useState("form")
  const [selectedInput, setSelectedInput] = useState("")
  const [query, setQuery] = useState("")
  const [options, setOptions] = useState([])
  const [selected, setSelected] = useState("")

  const API_BASE_URL = "http://localhost:5000" // Change this to your actual API URL

  useEffect(() => {
    const fetchOptions = async () => {
      if (selectedInput.length >= 3) {
        const res = await fetch(`${API_BASE_URL}/api/search-drugs?query=${selectedInput}`)
        const data = await res.json()
        if (data?.options) {
          setOptions(data.options)
        }
      } else {
        setOptions([])
      }
    }

    const timeout = setTimeout(fetchOptions, 300) // debounce
    return () => clearTimeout(timeout)
  }, [selectedInput])

  // Form inputs
  const [drugName, setDrugName] = useState("")
  const [targetName, setTargetName] = useState("")
  const [disease, setDisease] = useState("")
  const [study, setStudy] = useState("")
  const [synonym, setSynonym] = useState("")

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!drugName.trim() || !targetName.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/predict-preclinical-success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          drug_name: drugName,
          target_name: targetName,
          disease: disease,
          study: study,
          synonym: synonym,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get prediction")
      }

      const data = await response.json()
      setResults({
        type: "form",
        data: data,
      })
    } catch (err) {
      console.error("Error fetching prediction:", err)
      setError(err.message || "Failed to get prediction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDropdownSubmit = async (e) => {
    e.preventDefault()
    if (!selectedInput) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/preclinical-eval`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: selected,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get prediction")
      }

      const data = await response.json()
      setResults({
        type: "dropdown",
        data: data.results,
      })
    } catch (err) {
      console.error("Error fetching prediction:", err)
      setError(err.message || "Failed to get prediction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  function getProbabilityColor(probability) {
    if (probability >= 90) return "#10b981" // green-500
    if (probability >= 80) return "#22c55e" // green-600
    if (probability >= 70) return "#f59e0b" // amber-500
    return "#ef4444" // red-500
  }

  function formatAuthors(authorsString) {
    return authorsString.replace(/\|/g, ", ")
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">TrialPredict AI Suite</h1>
              <p className="text-blue-100 mt-1">Empowering Smarter Decisions for Clinical Success</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {/* <Button variant="outline" className="text-white border-white hover:bg-blue-700">
                Dashboard
              </Button>
              <Button variant="outline" className="text-white border-white hover:bg-blue-700">
                Reports
              </Button>
              <Button variant="outline" className="text-white border-white hover:bg-blue-700">
                Settings
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              Predict Clinical Trial Success with AI-Powered Insights
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Our advanced machine learning models analyze preclinical data to forecast trial outcomes with
              unprecedented accuracy.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Search for Drug or Target</CardTitle>
                <CardDescription>Choose your preferred input method to get prediction results</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="form" onValueChange={setInputMethod} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="form" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Detailed Form
                    </TabsTrigger>
                    <TabsTrigger value="dropdown" className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Quick Search
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="form">
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="drug-name">Drug Name (prefName)</Label>
                          <Input
                            id="drug-name"
                            placeholder="e.g., INSULIN HUMAN"
                            value={drugName}
                            onChange={(e) => setDrugName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="target-name">Target Name (targetName)</Label>
                          <Input
                            id="target-name"
                            placeholder="e.g., Insulin receptor"
                            value={targetName}
                            onChange={(e) => setTargetName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="disease">Disease</Label>
                        <Input
                          id="disease"
                          placeholder="e.g., Type 2 Diabetes"
                          value={disease}
                          onChange={(e) => setDisease(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="study">Study Title (abstract/claim text)</Label>
                        <Textarea
                          id="study"
                          placeholder="Enter the study abstract or claim text"
                          className="min-h-[100px]"
                          value={study}
                          onChange={(e) => setStudy(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="synonym">Synonyms</Label>
                        <Input
                          id="synonym"
                          placeholder="e.g., Humulin, Novolin"
                          value={synonym}
                          onChange={(e) => setSynonym(e.target.value)}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Analyzing..." : "Predict Results"}
                        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="dropdown">
                    <form onSubmit={handleDropdownSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="drug-input">Enter Drug or Target Name</Label>
                        <DrugSearch
                          options={options}
                          value={selected}
                          onChange={setSelected}
                          onInputChange={setSelectedInput}
                          placeholder="e.g., INSULIN HUMAN or Insulin receptor"
                          emptyMessage="No matches found. Type at least 3 characters to search."
                        />

                        {selected && (
                          <p className="text-sm text-gray-600 mt-2">
                            You selected: <strong>{selected}</strong>
                          </p>
                        )}
                      </div>

                      <p className="text-sm text-gray-500">
                        Enter a drug name (prefName) or target name to search for all matching records.
                      </p>

                      <Button type="submit" className="w-full" disabled={loading || !selected}>
                        {loading ? "Analyzing..." : "Search"}
                        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {loading && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-pulse flex space-x-4 mb-4">
                    <BarChart2 className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Analyzing Data</h3>
                  <p className="text-gray-500 mb-4 text-center">
                    Our AI is cross-referencing your query with our database of 50,000+ historical trials
                  </p>
                  <div className="w-full max-w-md">
                    <Progress value={45} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Results sections remain unchanged */}
      {results && results.type === "form" && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
              Results:
            </h2>

            <Card
              className="mb-6 overflow-hidden border-l-4"
              style={{ borderLeftColor: getProbabilityColor(results.data.probability) }}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Prediction Results</h3>
                    <div className="flex items-center">
                      <span
                        className="font-bold text-lg mr-2"
                        style={{ color: getProbabilityColor(results.data.probability) }}
                      >
                        {results.data.probability}%
                      </span>
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${results.data.probability}%`,
                            backgroundColor: getProbabilityColor(results.data.probability),
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
                    <p>
                      <strong>
                        Results for {results.data.drug_name} targeting {results.data.target_name}
                      </strong>
                    </p>
                    <p>
                      <strong>Probability</strong>: {results.data.probability}%
                    </p>
                    <p>
                      <strong>Justification</strong>: {results.data.justification}
                    </p>
                    <p>
                      <strong>Disease Name</strong>: {results.data.disease}
                    </p>
                    <p>
                      <strong>Synonym</strong>: {results.data.synonym}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Analysis Summary</h3>
              <p className="text-blue-700 mb-4">
                Based on our AI analysis, this target shows {results.data.probability >= 80 ? "strong" : "moderate"}{" "}
                potential for clinical success with a probability of {results.data.probability}%.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded shadow-sm">
                  <h4 className="font-medium text-gray-700">Key Risk Drivers</h4>
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Metabolic stability</li>
                    <li>Receptor specificity</li>
                    <li>Dosing regimen</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <h4 className="font-medium text-gray-700">Recommendations</h4>
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Optimize formulation</li>
                    <li>Consider patient stratification</li>
                    <li>Monitor for hypoglycemia</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded shadow-sm">
                  <h4 className="font-medium text-gray-700">Next Steps</h4>
                  <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                    <li>Review full report</li>
                    <li>Schedule expert consultation</li>
                    <li>Run scenario modeling</li>
                  </ul>
                </div>
              </div>
            </div> */}
          </div>
        </section>
      )}

      {results && results.type === "dropdown" && (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <BarChart2 className="mr-2 h-6 w-6 text-blue-600" />
              Search Results for "{selected}"
            </h2>

            {results.data.length === 0 ? (
              <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>No results found for your search query.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {results.data.map((result, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden border-l-4"
                    style={{ borderLeftColor: getProbabilityColor(result.probability) }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center">
                          Result {index + 1}
                          {result.probability >= 85 ? (
                            <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                          ) : result.probability < 75 ? (
                            <AlertCircle className="ml-2 h-5 w-5 text-amber-500" />
                          ) : null}
                        </CardTitle>
                        <div className="flex items-center">
                          <span
                            className="font-bold text-lg mr-2"
                            style={{ color: getProbabilityColor(result.probability) }}
                          >
                            {result.probability}%
                          </span>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${result.probability}%`,
                                backgroundColor: getProbabilityColor(result.probability),
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Disease</p>
                          <p className="font-medium">{result.disease || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Publication ID</p>
                          <p className="font-medium">{result.pg_pubid || "Not available"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Assignee</p>
                          <p className="font-medium">{result.assignee_name || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Publication Date</p>
                          <p className="font-medium">{result.publication_date || "Not available"}</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Inventor</p>
                        <p className="font-medium">{formatAuthors(result.inventor)}</p>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-1">Justification</p>
                        <p className="text-sm text-gray-700">{result.justification}</p>
                      </div>

                      {/* <div className="mt-4 pt-4 border-t border-gray-100">
                        <details className="text-sm">
                          <summary className="font-medium text-blue-600 cursor-pointer">View JSON Data</summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded-md overflow-auto text-xs">
                            {JSON.stringify(result, null, 2)}
                          </pre>
                        </details>
                      </div> */}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* {results.data.length > 0 && (
              <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Analysis Summary</h3>
                <p className="text-blue-700 mb-4">
                  Found {results.data.length} result{results.data.length !== 1 ? "s" : ""} for your search query.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded shadow-sm">
                    <h4 className="font-medium text-gray-700">Average Probability</h4>
                    <p className="text-2xl font-bold mt-2">
                      {Math.round(
                        results.data.reduce((sum, result) => sum + result.probability, 0) / results.data.length,
                      )}
                      %
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded shadow-sm">
                    <h4 className="font-medium text-gray-700">Recommendations</h4>
                    <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                      <li>Review detailed justifications</li>
                      <li>Compare results across studies</li>
                      <li>Export data for further analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </section>
      )}

      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">TrialPredict AI Suite</h3>
              <p className="text-gray-400 text-sm">
                Bridging the gap between preclinical promise and clinical reality with cutting-edge artificial
                intelligence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">
                For inquiries, please contact our support team at support@trialpredict.ai
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} TrialPredict AI Suite. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App

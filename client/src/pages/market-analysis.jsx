"use client"

import { Filter, Download, ChevronDown, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Select from "react-select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MarketChart } from "../components/market-chart"
import { useEffect, useRef, useState } from "react"
import { PieGrid } from "@/components/grid-pie"
import CompanyTable from "@/components/CompanyTable"

const modalityOptions = [
  { value: "Small Molecules", label: "Small Molecules" },
  { value: "Gene Therapies", label: "Gene Therapies" },
  { value: "Antibody Drug Conjugates", label: "Antibody Drug Conjugates" },
  { value: "Cell Therapies", label: "Cell Therapies" },
]

const regionOptions = [
  { value: "USA", label: "USA" },
  { value: "Germany", label: "Germany" },
  { value: "UK", label: "UK" },
  { value: "Japan", label: "Japan" },
]

const smallMoleculesOutsourcingTrendsUSA = [
  {
    trend: "API Manufacturing",
    cagr: "6.8%",
    notes: "The global small molecule API market is projected to grow from $204.47B (2024) to $218.35B (2025)."
  },
  {
    trend: "Final Dosage Form Manufacturing",
    cagr: "Significant growth",
    notes: "The finished drug products (final dosage forms) segment is expected to grow significantly within the small molecule CDMO market, driven by demand for complex and controlled-release formulations. The overall small molecule CDMO market is growing at a CAGR of 7.14% (2025–2034)."
  },
  {
    trend: "Analytical Testing",
    cagr: "6.49%",
    notes: "The global pharmaceutical analytical testing outsourcing market is expected to grow at a CAGR of 6.49% (2025–2033)."
  },
  {
    trend: "Formulation Development",
    cagr: "Included in CDMO CAGR",
    notes: "Formulation development is a major driver within the CDMO sector, which is growing at 7.14% CAGR (2025–2034)."
  }
];

const smallMoleculesTechnologyAdaptionUSA = [
  {
    technology: "Continuous Manufacturing",
    cagr: "10.42%",
    notes: "The global continuous manufacturing market for small molecule APIs is projected to grow at a CAGR of 10.42% (2024–2030)."
  },
  {
    technology: "Process Analytical Technology",
    cagr: "12.0%",
    notes: "The global process analytical technology market will grow from $2.99B (2024) to $3.35B (2025) at a CAGR of 12.0%. Other sources indicate long-term CAGRs up to 14.3%."
  },
  {
    technology: "Digital Quality Management",
    cagr: "13.9%",
    notes: "The quality management software market is expected to grow from $11.69B (2024) to $13.31B (2025) at a CAGR of 13.9%."
  },
  {
    technology: "AI-Driven Process Optimization",
    cagr: "N/A (no specific CAGR)",
    notes: "While a precise CAGR for AI-driven process optimization in small molecules is not separately reported, the integration of AI and machine learning is a major trend in quality management and process analytical technology, driving double-digit growth in those segments."
  }
];

const ADCoutsourcingTrendsUSA = [
  {
    trend: "API Manufacturing",
    cagr: "12.8%",
    keyInsights: "The US dominates ADC API manufacturing, driven by advanced bioconjugation facilities and rising demand for HPAPIs (high-potency APIs). North America accounts for 45% of global ADC demand."
  },
  {
    trend: "Final Dosage Form Manufacturing",
    cagr: "11.5%",
    keyInsights: "The US leads in ADC final dosage form production, with 57% of global ADC clinical trials conducted domestically. Complex formulations (e.g., lyophilized powders, sterile injectables) are increasingly outsourced."
  },
  {
    trend: "Analytical Testing",
    cagr: "9.2%",
    keyInsights: "Demand for ADC analytical testing in the US is rising due to stringent FDA requirements for characterization (e.g., drug-to-antibody ratio, payload quantification)."
  },
  {
    trend: "Formulation Development",
    cagr: "10.1%",
    keyInsights: "Outsourcing ADC formulation development is growing as companies seek expertise in stabilizing cytotoxic payloads and optimizing linker chemistry."
  }
];



export default function MarketAnalysis() {
  const [modalities, setModalities] = useState([modalityOptions[0]])
  const [regions, setRegions] = useState([regionOptions[0]])
  const [chartData, setChartData] = useState([])
  const [trendsData, setTrendsData] = useState([])
  const [diseaseChartData, setDiseaseChartData] = useState([])
  const [shareChartData, setShareChartData] = useState([])
  const [companyTableData, setCompanyTableData] = useState([])

  const chartRef = useRef(null)
  const diseaseRef = useRef(null)
  const companyRef = useRef(null)

  const extractBulletPoints = (text) => {
    return text
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.replace(/^-+\s*/, '').trim());
  };

  const [revenueinsightData, setrevenueInsightData] = useState(null);
  const [diseaseinsightData, setdiseaseInsightData] = useState(null);
  const [marketinsightData, setmarketInsightData] = useState(null);

  const parseInsightsBySection = (text) => {
    const lines = text.split('\n');
    const sections = [];
    let currentSection = null;

    lines.forEach((line) => {
      if (line.startsWith('### ')) {
        // Start new section
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: line.replace('### ', '').trim(),
          points: [],
        };
      } else if (/^\d+\.\s/.test(line.trim())) {
        // Numbered list item
        const cleaned = line.replace(/^\d+\.\s*/, '').trim();
        if (currentSection) currentSection.points.push(cleaned);
      }
    });

    if (currentSection) sections.push(currentSection);
    return sections;
  };

  const extractStructuredInsights = (data) => {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      const raw = parsed.result || parsed;

      return Object.entries(raw).map(([title, descriptions]) => ({
        title,
        descriptions,
      }));
    } catch (err) {
      console.error("Failed to extract insights:", err);
      return [];
    }
  };




  function parseMarkdownJson(markdownString) {
    // Ensure that markdownString is a valid string before proceeding
    if (typeof markdownString !== 'string') {
      console.error('Expected a string, but received:', markdownString);
      return null;
    }

    try {
      // Remove the Markdown code block formatting
      const jsonString = markdownString.replace(/^```json\n|\n```$/g, '').trim();

      // Parse the cleaned JSON string into a JavaScript object
      const jsonData = JSON.parse(jsonString);

      return jsonData;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  }





  // const bulletPoints = extractBulletPoints(insightText);


  const handleDownloadChart = () => {
    if (chartRef.current) {
      chartRef.current.downloadImage()
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const query = [
        ...modalities.map((m) => `modality=${encodeURIComponent(m.value)}`),
        ...regions.map((r) => `region=${encodeURIComponent(r.value)}`),
      ].join("&");

      try {
        // 1. Revenue Data
        const res1 = await fetch(`${import.meta.env.VITE_API_URL}:6005/api/get_data?${query}`);
        const revenueData = await res1.json();
        setChartData(revenueData);
        const restrendsadoption = await fetch(`${import.meta.env.VITE_API_URL}:6005/trends-n-tech?${query}`);
        const trendsAndTech = await restrendsadoption.json();
        setTrendsData(trendsAndTech);
        console.log("trendsData: ", trendsData)


        // 2. Disease Share
        const res2 = await fetch(`${import.meta.env.VITE_API_URL}:6005/api/get_disease_share?${query}`);
        const diseaseData = await res2.json();
        setDiseaseChartData(diseaseData);


        // 3. Market Share
        const res3 = await fetch(`${import.meta.env.VITE_API_URL}:6005/api/get_market_share?${query}`);
        const shareData = await res3.json();
        setShareChartData(shareData);

        const post1 = await fetch(`${import.meta.env.VITE_API_URL}:6005/api/store_revenue_data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(revenueData),
        });
        const post1Resp = await post1.json();
        console.log("Revenue data POST response:", post1Resp);
        // const dynamicKey = post1Resp?.result ? Object.keys(post1Resp.result)[0] : null;
        // const insightText = dynamicKey ? post1Resp.result[dynamicKey] : "";
        console.log(extractStructuredInsights(post1Resp.result));
        // console.log(insightText)
        setrevenueInsightData((post1Resp.result));


        const post2 = await fetch(`${import.meta.env.VITE_API_URL}:6005/api/store_disease_data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(diseaseData),
        });

        const post2Resp = await post2.json();
        console.log("Disease data POST response:", post2Resp);
        // const dynamicDiseaseKey = post2Resp?.result ? Object.keys(post2Resp.result)[0] : null;
        // const insightDiseaseText = dynamicDiseaseKey ? post2Resp.result[dynamicDiseaseKey] : "";
        console.log(extractStructuredInsights(post2Resp.result))
        setdiseaseInsightData(post2Resp.result);

        const post3 = await fetch(`${import.meta.env.VITE_API_URL}:6005/api/store_share_data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shareData),
        });
        const post3Resp = await post3.json();
        console.log("Market share data POST response:", post3Resp);
        // const dynamicMarketKey = post3Resp?.result ? Object.keys(post3Resp.result)[0] : null;
        // const insightMarketText = dynamicMarketKey ? post3Resp.result[dynamicMarketKey] : "";
        setmarketInsightData(post3Resp.result);
        // console.log(parseInsightsBySection(marketinsightData))

        // 4. Company Data
        const res4 = await fetch(`${import.meta.env.VITE_API_URL}:6005/api/get_companies?${query}`);
        const companyData = await res4.json();
        setCompanyTableData(companyData);

      } catch (err) {
        console.error("Error fetching or posting data:", err);
      }
    };

    if (modalities.length && regions.length) {
      fetchData();
    }
  }, [modalities, regions]);



  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Market Analysis</h2>
        {/* <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div> */}
        <div className="flex items-center gap-2">
          <Select
            isMulti
            options={modalityOptions}
            value={modalities}
            onChange={setModalities}
            className="min-w-[200px] text-xs"
            placeholder="Select modalities"
          />
          <Select
            isMulti
            options={regionOptions}
            value={regions}
            onChange={setRegions}
            className="min-w-[200px] text-xs"
            placeholder="Select regions"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="text-lg font-medium">{/* Market Analysis for: <span className="text-primary">{}</span> */}</div>
        {/* <div className="flex items-center gap-2">
          <Select
            isMulti
            options={modalityOptions}
            value={modalities}
            onChange={setModalities}
            className="min-w-[200px] text-xs"
            placeholder="Select modalities"
          />
          <Select
            isMulti
            options={regionOptions}
            value={regions}
            onChange={setRegions}
            className="min-w-[200px] text-xs"
            placeholder="Select regions"
          />
        </div> */}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="w-full space-y-4">
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Market Size & Growth</CardTitle>
                  <CardDescription>Revenue forecast (2019–2029)</CardDescription>
                </div>
                <Button onClick={handleDownloadChart} size="sm" className="text-xs">
                  <Download className="mr-2 h-4 w-4" />
                  Download Chart
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-full">
                  <MarketChart ref={chartRef} data={chartData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Disease Share</CardTitle>
                  <CardDescription>for selected modalities and regions</CardDescription>
                </div>
                <Button onClick={() => diseaseRef.current?.downloadChartsAsImage()} size="sm" className="text-xs">
                  <Download className="mr-2 h-4 w-4" />
                  Download Chart
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-full">
                  <PieGrid ref={diseaseRef} idPrefix="disease-share" data={diseaseChartData} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Market Share</CardTitle>
                  <CardDescription>for selected modalities and regions</CardDescription>
                </div>
                <Button onClick={() => companyRef.current?.downloadChartsAsImage()} size="sm" className="text-xs">
                  <Download className="mr-2 h-4 w-4" />
                  Download Chart
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-full">
                  <PieGrid ref={companyRef} idPrefix="market-share" data={shareChartData} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Market Drivers", data: revenueinsightData, iconColor: "text-primary" },
              { title: "Disease Drivers", data: diseaseinsightData, iconColor: "text-destructive" },
              { title: "Market Share Insights", data: marketinsightData, iconColor: "text-blue-500" },
            ].map(({ title, data, iconColor }, index) => (
              <Card key={index} className="h-[300px] flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="overflow-y-auto flex-grow pr-1">
                  <ul className="space-y-6 text-sm">
                    {(data &&
                      extractStructuredInsights(data).map((insightGroup, idx) => (
                        <li key={idx}>
                          <div className="font-medium mb-2">{insightGroup.title}</div>
                          <ul className="space-y-3">
                            {insightGroup.descriptions.map((desc, subIdx) => (
                              <li key={subIdx} className="flex items-start gap-2">
                                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                  <ChevronDown className={`h-3 w-3 ${iconColor}`} />
                                </div>
                                <span>{desc}</span>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))) || (
                        <li className="text-muted-foreground text-sm">No insights available.</li>
                      )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {trendsData &&
            (trendsData.matched_tech?.length > 0 || trendsData.matched_trends?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>Market Trends Analysis</CardTitle>
                  <CardDescription>Key Trends and Technology Insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Dynamically extract unique modalities and countries */}
                    {Array.from(
                      new Set([
                        ...trendsData.matched_tech.map(item => item.Modality),
                        ...trendsData.matched_trends.map(item => item.Modality),
                      ])
                    ).map(modality =>
                      Array.from(
                        new Set([
                          ...trendsData.matched_tech
                            .filter(item => item.Modality === modality)
                            .map(item => item.Country),
                          ...trendsData.matched_trends
                            .filter(item => item.Modality === modality)
                            .map(item => item.Country),
                        ])
                      ).map(country => (
                        <div key={`${modality}-${country}`}>
                          <h3 className="text-lg font-medium mb-2">
                            Outsourcing Trends - {modality} ({country})
                          </h3>

                          {/* Render Trends */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trendsData.matched_trends
                              .filter(trend => trend.Modality === modality && trend.Country === country)
                              .map((trend, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{trend.Trend}</span>
                                    <Badge>
                                      {typeof trend['2025 Growth Rate / CAGR'] === 'number'
                                        ? `${(trend['2025 Growth Rate / CAGR'] * 100).toFixed(1)}%`
                                        : trend['2025 Growth Rate / CAGR']}
                                    </Badge>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-muted">
                                    <div
                                      className="h-2 rounded-full bg-primary"
                                      style={{
                                        width: `${typeof trend['2025 Growth Rate / CAGR'] === 'number'
                                          ? Math.min(Math.max(trend['2025 Growth Rate / CAGR'] * 100, 10), 90)
                                          : 10
                                          }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* Render Technologies */}
                          <h3 className="text-lg font-medium mb-2">
                            Technology Adoption - {modality} ({country})
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {trendsData.matched_tech
                              .filter(tech => tech.Modality === modality && tech.Country === country)
                              .map((tech, index) => (
                                <div key={index} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm">{tech.Technology}</span>
                                    <Badge>
                                      {typeof tech['2025 Growth Rate / CAGR'] === 'number'
                                        ? `${(tech['2025 Growth Rate / CAGR'] * 100).toFixed(1)}%`
                                        : 'N/A'}
                                    </Badge>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-muted">
                                    <div
                                      className="h-2 rounded-full bg-blue-500"
                                      style={{
                                        width: `${typeof tech['2025 Growth Rate / CAGR'] === 'number'
                                          ? Math.min(Math.max(tech['2025 Growth Rate / CAGR'] * 100, 10), 90)
                                          : 10
                                          }%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}


        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Pharma Companies</CardTitle>
              <CardDescription>Market leaders in selected modalities and selected regions.</CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyTable data={companyTableData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4 relative">
          {/* Translucent overlay with lock icon for Forecasts tab */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="rounded-full bg-muted p-6">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Market Forecasts</CardTitle>
              <CardDescription>Projected growth and trends for Small Molecules CDMO market</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Revenue Forecast by Region (2025-2029)</h3>
                  <div className="h-[300px]">
                    <MarketChart data={chartData} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Growth Projections by Service Type</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service Type</TableHead>
                        <TableHead>2025</TableHead>
                        <TableHead>2026</TableHead>
                        <TableHead>2027</TableHead>
                        <TableHead>2028</TableHead>
                        <TableHead>2029</TableHead>
                        <TableHead>CAGR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">API Manufacturing</TableCell>
                        <TableCell>$42.3M</TableCell>
                        <TableCell>$48.7M</TableCell>
                        <TableCell>$56.1M</TableCell>
                        <TableCell>$64.5M</TableCell>
                        <TableCell>$74.2M</TableCell>
                        <TableCell>15.1%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Drug Product</TableCell>
                        <TableCell>$38.9M</TableCell>
                        <TableCell>$43.8M</TableCell>
                        <TableCell>$49.3M</TableCell>
                        <TableCell>$55.5M</TableCell>
                        <TableCell>$62.4M</TableCell>
                        <TableCell>12.5%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Analytical Testing</TableCell>
                        <TableCell>$22.7M</TableCell>
                        <TableCell>$26.8M</TableCell>
                        <TableCell>$31.7M</TableCell>
                        <TableCell>$37.4M</TableCell>
                        <TableCell>$44.2M</TableCell>
                        <TableCell>18.1%</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

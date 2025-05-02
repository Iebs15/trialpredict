import { Link } from "react-router-dom"
import { Search, Filter, FileText, Users, BarChart3, ChevronRight, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useEffect, useState } from "react"
import { getUserData } from "@/lib/db"

import CountUp from 'react-countup';
import { Tooltip } from "@/components/ui/Tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import SavedReports from "@/components/saved-reports"

const cards = [
  { title: "Major Modalities", value: 7, suffix: "+", note: "Covered in Analysis", border: "green-600" },
  { title: "Countries", value: 35, note: "Included in Reports", border: "blue-500" },
  { title: "Prospect Companies", value: 300, suffix: "+", note: "Analyzed & Profiled", border: "rose-500" },
  { title: "Competitor Profiles", value: 300, suffix: "+", note: "Tracked for Comparison", border: "yellow-500" },
  { title: "Pipeline Drugs", value: 2000, suffix: "+", note: "Mapped to Indications", border: "cyan-600" },
  { title: "Contacts", value: 10000, suffix: "+", note: "Across All Companies", border: "purple-600" },
];

const marketData = [
  {
    segment: "Small Molecules",
    projectedMarketSize: "$130B",
    percentage: 85, // for progress bar width
    barColor: "bg-primary",
    source: "Grand View Research, 2024"
  },
  {
    segment: "Biologics",
    projectedMarketSize: "$94B",
    percentage: 75,
    barColor: "bg-blue-500",
    source: "MarketsandMarkets, 2024"
  },
  {
    segment: "Cell & Gene Therapy",
    projectedMarketSize: "$28.2B",
    percentage: 30,
    barColor: "bg-purple-500",
    source: "Precedence Research, 2024"
  },
  {
    segment: "Antibody Drug Conjugates",
    projectedMarketSize: "$22.87B",
    percentage: 26,
    barColor: "bg-green-500",
    source: "GlobalData, 2024"
  }
];

const companyData = [
  {
    company: "Lonza",
    capabilities: "Small Molecules, Biologics, Cell & Gene",
    region: "Europe",
    marketShare: "$7.1B",
    source: "Lonza Annual Report 2023"
  },
  {
    company: "Catalent",
    capabilities: "Small Molecules, Biologics, ADCs",
    region: "North America",
    marketShare: "$4.3B",
    source: "Catalent Annual Report 2023"
  },
  {
    company: "WuXi AppTec",
    capabilities: "Small Molecules, Biologics, Cell & Gene",
    region: "Asia",
    marketShare: "$4.0B",
    source: "WuXi AppTec 2023"
  },
  {
    company: "Samsung Biologics",
    capabilities: "Biologics, ADCs",
    region: "Asia",
    marketShare: "$2.6B",
    source: "Samsung Biologics 2023"
  },
  {
    company: "Thermo Fisher",
    capabilities: "Small Molecules, Biologics, Cell & Gene",
    region: "North America",
    marketShare: "$2.2B (CDMO segment only)",
    source: "Thermo Fisher 2023"
  }
];

const marketTrends = [
  {
    trend: "Biologics Outsourcing Growth",
    description: "Biologics CDMO market growing at 10.2% CAGR",
    source: "MarketsandMarkets, 2024"
  },
  {
    trend: "Industry Consolidation",
    description: "11 major M&A deals in 2023",
    source: "Pharma Intelligence, 2024"
  },
  {
    trend: "Cell & Gene Therapy Expansion",
    description: "Segment growing at 22.3% CAGR",
    source: "Precedence Research, 2024"
  },
  {
    trend: "Continuous Manufacturing Adoption",
    description: "9.1% of global CDMO facilities now use continuous manufacturing",
    source: "BioProcess International, 2024"
  },
  {
    trend: "Reshoring/Localization",
    description: "$4.5B in new US/EU CDMO investments announced in 2023",
    source: "Evaluate Pharma, 2024"
  }
];




export default function Dashboard() {
  const [searchHistory, setSearchHistory] = useState([]);
  const [prospectProfilesCount, setProspectProfilesCount] = useState(0);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  useEffect(() => {
    const fetchSearchData = async () => {
      setIsSearchLoading(true);  // Start loading

      const uuidData = await getUserData("user_salescout_id");
      const uuid = uuidData?.value;
      console.log(uuid);

      if (!uuid) {
        setIsSearchLoading(false);  // Stop loading if no uuid
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}:6002/api/search-history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uuid })
        });

        const data = await res.json();
        if (data.status === "success") {
          setSearchHistory(data.data);
          // setProspectProfilesCount(data.prospect_profiles_last_count || 0);
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setIsSearchLoading(false);  // Stop loading
      }
    };

    fetchSearchData();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">CDMO Intelligence Dashboard</h2>
        <div className="flex items-center space-x-2">
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>

          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Searches</TabsTrigger>
          <TabsTrigger value="saved">Saved Items</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {marketData.map((item, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.segment}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.projectedMarketSize}</div>
                  <p className="text-xs text-muted-foreground">Projected market size by 2029</p>
                  <div className="mt-4 h-1 w-full rounded-full bg-muted">
                    <div
                      className={`h-1 rounded-full ${item.barColor}`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground italic">Source: {item.source}</p>
                </CardContent>
              </Card>
            ))}
          </div>


          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Top CDMO Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Capabilities</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead className="text-right">Market Share</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyData.map((company, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{company.company}</TableCell>
                        <TableCell>{company.capabilities}</TableCell>
                        <TableCell>{company.region}</TableCell>
                        <TableCell className="text-right">
                          <span className=" underline decoration-dotted">
                            {company.marketShare}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Key Market Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {marketTrends.map((trend, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                        <ChevronRight className="h-3 w-3 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{trend.trend}</p>
                        <p className="text-xs text-muted-foreground">{trend.description}</p>
                        <p className="text-xs text-muted-foreground italic">{trend.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 mt-4 md:grid-cols-3 lg:grid-cols-6">
            {cards.map((card, index) => (
              <Card key={index} className={`border-l-4 border-l-${card.border}`}>
                <CardHeader className="pb-2 min-h-[50px]">
                  <CardTitle className="text-sm font-medium whitespace-nowrap">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold min-h-[40px]">
                    <CountUp end={card.value} duration={2} separator="," suffix={card.suffix || ""} />
                  </div>
                  <p className="text-xs text-muted-foreground">{card.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Saved Searches</CardTitle>
            </CardHeader>
            <CardContent>
              {isSearchLoading ? (
                // Skeleton for entire table when search is loading
                <Skeleton className="w-full h-24" />
              ) : searchHistory.length === 0 ? (
                <div className="text-center text-muted-foreground mt-4">
                  No saved searches yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Name</TableHead>
                      <TableHead className="w-1/3">Saved at</TableHead>
                      <TableHead className="w-1/3 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchHistory.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{new Date(entry.saved_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => (window.location.href = entry.frontend_url)}
                          >
                            View Results
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>


        </TabsContent>



        <TabsContent value="saved" className="space-y-4 relative">
          {/* <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="rounded-full bg-muted p-6">
              <Lock className="h-12 w-12 text-primary" />
            </div>
          </div> */}

          <SavedReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}


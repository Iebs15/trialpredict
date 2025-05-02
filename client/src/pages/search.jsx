import { SearchIcon, Filter, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Search() {
  return (
    <div className="relative flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="rounded-full bg-muted p-6">
          <Lock className="h-12 w-12 text-primary" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Advanced Search</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Saved Searches
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search CDMO Intelligence Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input placeholder="Enter search terms..." className="w-full" />
              </div>
              <Button>
                <SearchIcon className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="prospects">Prospects</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
                <TabsTrigger value="market">Market Data</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Modality</label>
                <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">All Modalities</option>
                  <option value="small-molecules">Small Molecules</option>
                  <option value="biologics">Biologics</option>
                  <option value="adc">Antibody Drug Conjugates</option>
                  <option value="cell-gene">Cell & Gene Therapy</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Region</label>
                <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">All Regions</option>
                  <option value="north-america">North America</option>
                  <option value="europe">Europe</option>
                  <option value="asia">Asia-Pacific</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Date Range</label>
                <select className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="all">All Time</option>
                  <option value="year">Past Year</option>
                  <option value="month">Past Month</option>
                  <option value="week">Past Week</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-12">
        <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-medium">Enter search terms to find CDMO intelligence</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Search across prospect profiles, competitor data, and market analysis
        </p>
      </div>
    </div>
  )
}


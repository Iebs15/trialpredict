"use client"

import { Search, Download, ChevronLeft, ChevronRight, Save, FileEdit } from "lucide-react"
import { useRef, useEffect, useState, useCallback } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"
import mammoth from "mammoth"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Checkbox } from "../components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog"
import { getUserData } from "@/lib/db"
import { useToast } from "../components/ui/use-toast"

export default function ProspectProfiles() {
  const location = useLocation()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // State for query parameters
  const [queryParams, setQueryParams] = useState({
    page: 1,
    limit: 25,
    mechanismOfAction: "",
    phase: [],
    therapeuticArea: [],
    modality: "Antibody Drug Conjugates",
  })

  // State for profiles data
  const [profiles, setProfiles] = useState([])
  const [totalResults, setTotalResults] = useState(0)

  // Add these state variables after the other useState declarations
  const [showFilters, setShowFilters] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRows, setSelectedRows] = useState([])
  const [saveSearchDialogOpen, setSaveSearchDialogOpen] = useState(false)
  const [saveReportDialogOpen, setReportDialogOpen] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [reportName, setReportName] = useState("")

  // Add this inside your component
  const hasInitialized = useRef(false)

  useEffect(() => {
    // Only parse and set queryParams on the first load
    if (!hasInitialized.current) {
      const searchParams = new URLSearchParams(location.search)
      const newParams = { ...queryParams }

      if (searchParams.has("mechanismOfAction")) newParams.mechanismOfAction = searchParams.get("mechanismOfAction")
      if (searchParams.has("therapeuticArea")) newParams.therapeuticArea = searchParams.get("therapeuticArea")
      if (searchParams.has("page")) newParams.page = Number.parseInt(searchParams.get("page")) || 1
      if (searchParams.has("modality")) newParams.modality = searchParams.get("modality")

      if (searchParams.has("phase")) {
        const phases = searchParams.get("phase").split(",")
        newParams.phase = phases.filter((p) => p.trim() !== "")
      }

      hasInitialized.current = true
      setQueryParams(newParams)
    }
  }, [location.search])

  useEffect(() => {
    const params = new URLSearchParams()

    if (queryParams.mechanismOfAction) params.set("mechanismOfAction", queryParams.mechanismOfAction)
    if (queryParams.therapeuticArea) params.set("therapeuticArea", queryParams.therapeuticArea)
    if (queryParams.page > 1) params.set("page", queryParams.page.toString())
    if (queryParams.modality !== "all") params.set("modality", queryParams.modality)
    if (queryParams.phase.length > 0) {
      params.set("phase", queryParams.phase.join(","))
    }

    const newUrl = `${location.pathname}?${params.toString()}`
    const currentUrl = `${location.pathname}${location.search}`

    if (newUrl !== currentUrl) {
      navigate(newUrl, { replace: true })
    }

    fetchProfiles()
  }, [queryParams])

  // Fetch profiles from backend
  const fetchProfiles = useCallback(async () => {
    setLoading(true)

    try {
      const userData = await getUserData("user_salescout_id")
      const uuid = userData.value // Support both object or direct uuid string

      if (!uuid) {
        console.error("UUID not found.")
        setLoading(false)
        return
      }

      const queryString = new URLSearchParams({
        uuid: uuid,
        page: queryParams.page,
        limit: queryParams.limit,
        mechanismOfAction: queryParams.mechanismOfAction,
        phase: queryParams.phase.join(","),
        therapeuticArea: queryParams.therapeuticArea,
        modality: queryParams.modality,
      })

      const response = await fetch(`${import.meta.env.VITE_API_URL}:6002/api/customer-profiles?${queryString}`)
      const data = await response.json()

      setProfiles(data.data)
      setTotalResults(data.total)
    } catch (error) {
      console.error("Error fetching profiles:", error)
    } finally {
      setLoading(false)
    }
  }, [queryParams])

  // Add this function after fetchProfiles
  const highlightText = (text, highlight) => {
    if (!highlight || !text) return text

    const parts = text.toString().split(new RegExp(`(${highlight})`, "gi"))
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const handleAddToReport = async () => {
    const data = profiles.filter((profile) =>
      selectedRows.includes(profile.id || profile["Product Name"]),
    )
    const userData = await getUserData("user_salescout_id")
    const uuid = userData.value
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}:6005/add-to-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: data, uuid: uuid, reportName: reportName }),
      });
  
      const result = await response.json();
      if (response.ok) {
        toast({
          title: "Report saved",
          description: `Report "${reportName}" saved successfully`,
        })
        setReportDialogOpen(false)
        setReportName("")
      } else {
        throw new Error("Save failed")
      }
    } catch (error) {
      console.error('Error uploading report:', error);
    }
  }
  
  


  // Add this function to handle row selection
  const handleRowSelection = (profileId, isSelected) => {
    if (isSelected) {
      setSelectedRows((prev) => [...prev, profileId])
    } else {
      setSelectedRows((prev) => prev.filter((id) => id !== profileId))
    }
  }

  // Add this function to handle "select all"
  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allIds = profiles.map((profile) => profile.id || profile["Product Name"])
      setSelectedRows(allIds)
    } else {
      setSelectedRows([])
    }
  }

  // Add this function to handle export
  const handleExport = async () => {
    if (selectedRows.length === 0) {
      toast({
        title: "No rows selected",
        description: "Please select at least one row to export",
        variant: "destructive",
      })
      return
    }

    try {
      const selectedProfiles = profiles.filter((profile) =>
        selectedRows.includes(profile.id || profile["Product Name"]),
      )

      const response = await fetch(`${import.meta.env.VITE_API_URL}:6005/api/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: selectedProfiles, type: "xlsx" }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "prospect_profiles_export.xlsx" // or .csv or .json depending on backend
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the selected profiles",
        variant: "destructive",
      })
    }
  }

  // Add this function to handle save search
  const handleSaveSearch = async () => {
    const userData = await getUserData("user_salescout_id")
    const uuid = userData.value
    if (!searchName.trim()) {
      toast({
        title: "Search name required",
        description: "Please enter a name for your saved search",
        variant: "destructive",
      })
      return
    }

    try {
      const searchData = {
        uuid: uuid, // You can replace this with your app's actual user UUID
        url: window.location.href,
        name: searchName,
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}:6002/api/save-search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchData),
      })

      if (response.ok) {
        toast({
          title: "Search saved",
          description: `Search "${searchName}" saved successfully`,
        })
        setSaveSearchDialogOpen(false)
        setSearchName("")
      } else {
        throw new Error("Save failed")
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: "There was an error saving your search",
        variant: "destructive",
      })
    }
  }

  // Add this function to filter profiles by search term
  const filteredProfiles = searchTerm
    ? profiles.filter((profile) =>
      Object.values(profile).some(
        (value) => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    )
    : profiles

  // Handle filter changes
  const handleFilterChange = (filterType, newValue) => {
    setQueryParams((prev) => ({
      ...prev,
      [filterType]: newValue,
      page: 1, // Reset to first page when filters change
    }))
  }

  // Handle search input
  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setQueryParams((prev) => ({
        ...prev,
        mechanismOfAction: e.target.value,
        therapeuticArea: e.target.value,
        page: 1,
      }))
    }
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    setQueryParams((prev) => ({
      ...prev,
      page: newPage,
    }))
  }

  // Calculate pagination values
  const totalPages = Math.ceil(totalResults / queryParams.limit)
  const startItem = (queryParams.page - 1) * queryParams.limit + 1
  const endItem = Math.min(startItem + queryParams.limit - 1, totalResults)

  const phaseMapping = {
    "Phase 1": "1",
    "Phase 2": "2",
    "Phase 3": "3",
    Preclinical: "Preclinical", // Keep as is
    Approved: "Approved",
  }

  return (
    <div className="flex-1 space-y-2 px-4 md:p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Prospect Profiles</h2>
      </div>

      {/* Main layout container */}
      <div className="flex flex-col space-y-4">
        {/* Filter toggle button - always at the left */}
        <div className="flex flex-row justify-between">
          <Button variant="ghost" className="px-2" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <ChevronLeft className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" onClick={() => setSaveSearchDialogOpen(true)}>
              <Save className="mr-2 h-4 w-4" />
              Save Search
            </Button>
            <Button variant="outline" size="sm" onClick={() => setReportDialogOpen(true)}>
              <FileEdit className="mr-2 h-4 w-4" />
              Add to Report
            </Button> 
          </div>
        </div>

        {/* Content area with conditional layout */}
        <div className="flex">
          {/* Filter panel - only shown when showFilters is true */}
          {showFilters && (
            <div className="w-64 mr-4">
              <Card className="w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Search Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Modality</div>
                    <Select
                      value={queryParams.modality}
                      onValueChange={(value) => handleFilterChange("modality", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select modality" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Small Molecules",
                          "Gene Therapies",
                          "Cell Therapies",
                          "Antibody Drug Conjugates",
                          "Antibodies",
                          "Proteins/Peptides",
                          "Nucleic Acid-Based Drugs",
                          "Biologics",
                        ].map((modality) => (
                          <SelectItem key={modality} value={modality}>
                            {modality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium">Phase</div>
                    {["Phase 1", "Phase 2", "Phase 3", "Preclinical", "Approved"].map((phase) => (
                      <div key={phase} className="flex items-center space-x-2">
                        <Checkbox
                          id={`phase-${phase}`}
                          checked={queryParams.phase.includes(phaseMapping[phase])}
                          onCheckedChange={(checked) => {
                            const newPhases = checked
                              ? [...queryParams.phase, phaseMapping[phase]]
                              : queryParams.phase.filter((p) => p !== phaseMapping[phase])
                            handleFilterChange("phase", newPhases)
                          }}
                        />
                        <label htmlFor={`phase-${phase}`} className="text-xs cursor-pointer">
                          {phase}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-medium">Mechanism of Action</div>
                    <Input
                      placeholder="Search MOA..."
                      className="text-xs h-8"
                      defaultValue={queryParams.mechanismOfAction}
                      onKeyDown={handleSearch}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Therapeutic Area</div>
                    <Input
                      placeholder="Search..."
                      className="text-xs h-8"
                      defaultValue={queryParams.therapeuticArea}
                      onKeyDown={handleSearch}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Table section - will expand to full width when filters are hidden */}
          <div className="flex-1">
            <Tabs defaultValue="list" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-2">
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    placeholder="Search profiles..."
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const searchInput = document.querySelector('input[placeholder="Search profiles..."]')
                      if (searchInput) {
                        setQueryParams((prev) => ({
                          ...prev,
                          search: searchInput.value,
                          page: 1,
                        }))
                      }
                    }}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="grid">Grid View</TabsTrigger>
                  </TabsList>
                  <Badge variant="outline" className="rounded-sm px-2 w-[150px] font-normal justify-center">
                    {totalResults} results
                  </Badge>
                </div>
              </div>

              <TabsContent value="list">
                <div className="rounded-md border h-[340px] overflow-auto">
                  {loading ? (
                    <div className="flex justify-center items-center h-40">
                      <p>Loading profiles...</p>
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="flex justify-center items-center h-40">
                      <p>No profiles found matching your criteria.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">
                            <Checkbox
                              checked={selectedRows.length === profiles.length && profiles.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead className="hidden md:table-cell">Mechanism of Action</TableHead>
                          <TableHead>Phase</TableHead>
                          <TableHead className="hidden md:table-cell">Therapeutic Area</TableHead>
                          <TableHead className="text-right"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProfiles.map((profile, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.includes(profile.id || profile["Product Name"])}
                                onCheckedChange={(checked) =>
                                  handleRowSelection(profile.id || profile["Product Name"], checked)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {searchTerm ? highlightText(profile.Manufacturer, searchTerm) : profile.Manufacturer}
                            </TableCell>
                            <TableCell>
                              {searchTerm
                                ? highlightText(profile["Product Name"], searchTerm)
                                : profile["Product Name"]}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {searchTerm
                                ? highlightText(profile["Mechanism of Action"], searchTerm)
                                : profile["Mechanism of Action"]}
                            </TableCell>
                            <TableCell>
                              {searchTerm ? highlightText(profile.Phase, searchTerm) : profile.Phase}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {searchTerm ? highlightText(profile.Indication, searchTerm) : profile.Indication}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const params = new URLSearchParams(location.search)
                                  params.set("Manufacturer", profile.Manufacturer)
                                  navigate(`/profile?${params.toString()}`, { state: { initialRowData: profile } })
                                }}
                              >
                                View Profile
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="grid" className="h-[340px] overflow-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <p>Loading profiles...</p>
                  </div>
                ) : profiles.length === 0 ? (
                  <div className="flex justify-center items-center h-40">
                    <p>No profiles found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profiles.map((profile, i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardHeader className="p-4 pb-2 bg-muted/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge className="mb-2">Phase: {profile.Phase}</Badge>
                              <CardTitle className="text-base">{profile["Product Name"]}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="text-sm font-medium">{profile.Manufacturer}</div>
                          <div className="text-xs text-muted-foreground mb-2">{profile.Indication}</div>
                          <p className="text-xs line-clamp-2">
                            {profile["Mechanism of Action"] || "Mechanism of action not specified"}
                          </p>
                          <div className="mt-4 flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const params = new URLSearchParams(location.search)
                                params.set("Manufacturer", profile.Manufacturer)
                                navigate(`/profile?${params.toString()}`, { state: { initialRowData: profile } })
                              }}
                            >
                              View Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {totalResults > 0
                  ? `Showing ${startItem} to ${endItem} of ${totalResults} profiles`
                  : "No results found"}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={queryParams.page <= 1 || loading}
                  onClick={() => handlePageChange(queryParams.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={queryParams.page >= totalPages || loading}
                  onClick={() => handlePageChange(queryParams.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          {selectedProfile && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>{selectedProfile["Product Name"]}</span>
                  <Badge>{selectedProfile.Phase}</Badge>
                </DialogTitle>
                <DialogDescription>Manufactured by {selectedProfile.Manufacturer}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Mechanism of Action</h4>
                  <p className="text-sm">{selectedProfile["Mechanism of Action"] || "Not specified"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Therapeutic Area</h4>
                    <p className="text-sm">{selectedProfile.Indication}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Development Phase</h4>
                    <p className="text-sm">{selectedProfile.Phase}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Additional Information</h4>
                  <p className="text-sm">
                    This product is currently in {selectedProfile.Phase.toLowerCase()} development for{" "}
                    {selectedProfile.Indication.toLowerCase()} indications. The mechanism of action involves{" "}
                    {selectedProfile["Mechanism of Action"]?.toLowerCase() || "proprietary technology"}.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
                <Button>View Full Profile</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={saveSearchDialogOpen} onOpenChange={setSaveSearchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>Enter a name for this search to save it for future use.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Search name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="my-4"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveSearchDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSearch}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={saveReportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Report</DialogTitle>
            <DialogDescription>Enter a name for this report to save it for future use.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Report name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="my-4"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToReport}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

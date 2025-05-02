"use client"

import { Search, Download, ExternalLink, Check, MapPin, X, Save, ChevronLeft, ChevronRight, FileEdit } from "lucide-react"
import { useState, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { getUserData } from "@/lib/db"

// Helper function to highlight search text
const highlightText = (text, query) => {
  if (!query || !text) return text

  const parts = String(text).split(new RegExp(`(${query})`, "gi"))

  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={index} className="bg-yellow-200 font-medium">
        {part}
      </span>
    ) : (
      part
    ),
  )
}

export default function CompetitorProfiles() {
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useState(
    new URLSearchParams(typeof window !== "undefined" ? window.location.search : ""),
  )
  const [selectedModalities, setSelectedModalities] = useState([])
  const [selectedRegions, setSelectedRegions] = useState([])
  const [selectedCapacities, setSelectedCapacities] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("list")

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = viewMode === "list" ? 25 : 1

  const [showMoreSites, setShowMoreSites] = useState(false)

  const [reportName, setReportName] = useState("")
  const [saveReportDialogOpen, setReportDialogOpen] = useState(false)

  // Add these state variables for the new features
  const [showFilters, setShowFilters] = useState(true)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [saveSearchDialogOpen, setSaveSearchDialogOpen] = useState(false)
  const [searchName, setSearchName] = useState("")
  const [dropdownSearchTerms, setDropdownSearchTerms] = useState({
    modalities: "",
    regions: "",
  })

  // Filter companies based on search query
  const filteredCompanies = companies.filter((company) => {
    if (!searchQuery) return true

    // Search in multiple fields
    return (
      (company["Company Name"] && company["Company Name"].toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company["Service Offerings"] &&
        company["Service Offerings"].toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company["Certifications"] && company["Certifications"].toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company["About"] && company["About"].toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.manufacturingSites &&
        company.manufacturingSites.some((site) => site.toLowerCase().includes(searchQuery.toLowerCase())))
    )
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Reset to first page when filters or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedModalities, selectedRegions, selectedCapacities])

  const optionsModalities = [
    "Small Molecules",
    "Gene Therapies",
    "Cell Therapies",
    "Antibody Drug Conjugates",
    "Antibodies",
    "Proteins/Peptides",
    "Nucleic Acid-Based Drugs",
  ]

  const optionsRegions = [
    "USA",
    "Spain",
    "Germany",
    "Korea",
    "Canada",
    "Belgium",
    "Austria",
    "India",
    "United Kingdom of Great Britain and Northern Ireland",
    "France",
    "Italy",
    "Switzerland",
    "Ireland",
    "Romania",
    "Denmark",
    "China",
    "Netherlands",
    "Sweden",
    "Latvia",
    "New Zealand",
    "Australia",
    "Puerto Rico",
    "Japan",
    "Slovakia",
    "Brazil",
    "Finland",
    "Portugal",
    "Taiwan",
    "Estonia",
    "Singapore",
    "Argentina",
    "Czechia",
    "Andorra",
    "Norway",
    "Poland",
    "Mexico",
    "Greece",
    "Ecuador",
    "Lithuania",
  ]

  const optionsCapacities = ["Small", "Medium", "Large"]

  const modalityColors = {
    "Small Molecules": "#4CAF50", // Green
    "Gene Therapies": "#2196F3", // Blue
    "Cell Therapies": "#9C27B0", // Purple
    "Antibody Drug Conjugates": "#FF9800", // Orange
    Antibodies: "#F44336", // Red
    "Proteins/Peptides": "#00BCD4", // Cyan
    "Nucleic Acid-Based Drugs": "#795548", // Brown
  }

  // Function to fetch data from the backend
  const fetchData = async (params) => {
    setLoading(true)
    try {
      // Build the URL with query parameters
      const queryString = params.toString()
      const url = `${import.meta.env.VITE_API_URL}:6003/api/competitor-profiles${queryString ? `?${queryString}` : ""}`

      const response = await fetch(url)
      const result = await response.json()

      if (result.status === "success" && result.data) {
        // Group companies by name
        const groupedCompanies = groupCompaniesByName(result.data)
        setCompanies(groupedCompanies)
      } else {
        console.error("Error fetching data:", result)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
      console.log(companies)
    }
  }

  // Modify the groupCompaniesByName function to handle multiple modalities
  const groupCompaniesByName = (data) => {
    const grouped = {}

    data.forEach((company) => {
      const name = company["Company Name"]

      if (!grouped[name]) {
        grouped[name] = {
          ...company,
          manufacturingSites: [company["Manufacturing sites"]],
          modalities: company["Modality"] ? company["Modality"].split(" | ") : [], // Split multiple modalities
        }
      } else {
        // Add additional manufacturing sites
        grouped[name].manufacturingSites.push(company["Manufacturing sites"])
      }
    })

    return Object.values(grouped)
  }

  useEffect(() => {
    // Initialize from URL parameters
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")

    // Get modalities from URL
    const modalitiesParam = params.get("modalities")
    const initialModalities = modalitiesParam ? modalitiesParam.split(",") : []
    setSelectedModalities(initialModalities)

    // Get regions from URL
    const regionsParam = params.get("regions")
    const initialRegions = regionsParam ? regionsParam.split(",") : []
    setSelectedRegions(initialRegions)

    // Get manufacturing capacities from URL
    const capacitiesParam = params.get("capacities")
    const initialCapacities = capacitiesParam ? capacitiesParam.split(",") : []
    setSelectedCapacities(initialCapacities)

    // Set default modality if none selected
    if (!modalitiesParam && optionsModalities.length > 0) {
      const defaultModality = [optionsModalities[0]]
      setSelectedModalities(defaultModality)
      params.set("modalities", defaultModality)
      updateQueryParams("modalities", defaultModality)
    }

    // Fetch initial data
    fetchData(params)
  }, [])

  const updateQueryParams = (paramName, values) => {
    const params = new URLSearchParams(window.location.search)

    if (values.length > 0) {
      params.set(paramName, values.join(","))
    } else {
      params.delete(paramName)
    }

    // Update URL without refreshing the page
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`)
    setSearchParams(params)

    // Fetch data with updated parameters
    fetchData(params)
  }

  const clearAllFilters = () => {
    setSelectedModalities([])
    setSelectedRegions([])
    setSelectedCapacities([])
    const emptyParams = new URLSearchParams()
    window.history.pushState({}, "", window.location.pathname)
    setSearchParams(emptyParams)

    // Fetch data with cleared parameters
    fetchData(emptyParams)
  }

  const toggleSelect = useCallback(
    (value, selectedList, setSelected, paramName) => {
      let newSelected
      if (selectedList.includes(value)) {
        newSelected = selectedList.filter((item) => item !== value)
      } else {
        newSelected = [...selectedList, value]
      }
      setSelected(newSelected)
      updateQueryParams(paramName, newSelected)
    },
    [updateQueryParams],
  )

  const handleCapacityChange = (capacity, checked) => {
    let newCapacities
    if (checked) {
      newCapacities = [...selectedCapacities, capacity]
    } else {
      newCapacities = selectedCapacities.filter((c) => c !== capacity)
    }
    setSelectedCapacities(newCapacities)
    updateQueryParams("capacities", newCapacities)
  }

  const handleAddToReport = async () => {
    const data = companies.filter((company) => selectedCompanies.includes(company["Company Name"]))
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

  // Add these functions for the new features
  const handleCompanySelection = (companyName, isSelected) => {
    if (isSelected) {
      setSelectedCompanies((prev) => [...prev, companyName])
    } else {
      setSelectedCompanies((prev) => prev.filter((name) => name !== companyName))
    }
  }

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const allCompanyNames = filteredCompanies.map((company) => company["Company Name"])
      setSelectedCompanies(allCompanyNames)
    } else {
      setSelectedCompanies([])
    }
  }

  const handleExport = async () => {
    if (selectedCompanies.length === 0) {
      toast({
        title: "No companies selected",
        description: "Please select at least one company to export",
        variant: "destructive",
      })
      return
    }

    try {
      const selectedCompaniesData = companies.filter((company) => selectedCompanies.includes(company["Company Name"]))

      const response = await fetch(`${import.meta.env.VITE_API_URL}:6005/api/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: selectedCompaniesData, type: "xlsx" }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "competitor_profiles_export.xlsx" // or .csv or .json depending on backend
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
        description: "There was an error exporting the selected companies",
        variant: "destructive",
      })
    }
  }

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

  const renderDropdown = (label, options, selectedList, setSelected, paramName) => {
    const searchTerm = dropdownSearchTerms[paramName] || ""

    const filteredOptions = options.filter((opt) => opt.toLowerCase().includes(searchTerm.toLowerCase()))

    const handleSearchTermChange = (e) => {
      setDropdownSearchTerms((prev) => ({
        ...prev,
        [paramName]: e.target.value,
      }))
    }

    return (
      <div className="space-y-2">
        <div className="text-xs font-medium">{label}</div>

        {/* Popover Trigger */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-xs font-normal">
              {`Select ${label}`}
            </Button>
          </PopoverTrigger>

          {/* Dropdown with Search */}
          <PopoverContent className="w-64 p-2 space-y-2">
            <Input
              placeholder={`Search ${label}`}
              value={searchTerm}
              onChange={handleSearchTermChange}
              className="text-xs"
            />
            <div className="max-h-60 overflow-y-auto">
              <Command>
                <CommandGroup>
                  {filteredOptions.map((option) => (
                    <CommandItem
                      key={option}
                      onSelect={() => toggleSelect(option, selectedList, setSelected, paramName)}
                      className="text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <Check className={`h-4 w-4 ${selectedList.includes(option) ? "opacity-100" : "opacity-0"}`} />
                        {paramName === "modalities" && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: modalityColors[option] || "#888888" }}
                          />
                        )}
                        <span>{option}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </div>
          </PopoverContent>
        </Popover>

        {/* Badges below the button */}
        {selectedList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedList.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="rounded-sm px-2 justify-center font-normal"
                style={
                  paramName === "modalities" ? { borderColor: modalityColors[item], color: modalityColors[item] } : {}
                }
              >
                {item}
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={() => toggleSelect(item, selectedList, setSelected, paramName)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-2 px-4 md:p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Competitor Profiles</h2>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-row justify-between">
          <Button variant="ghost" className="self-start mb-2" onClick={() => setShowFilters(!showFilters)}>
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

        <div className="flex">
          {showFilters && (
            <div className="w-64 mr-4">
              <Card className="w-full min-h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Filter Companies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-xs font-medium">Manufacturing Capacity</div>
                    <div className="space-y-1">
                      {optionsCapacities.map((capacity) => (
                        <div key={capacity} className="flex items-center space-x-2">
                          <Checkbox
                            id={capacity.toLowerCase()}
                            checked={selectedCapacities.includes(capacity)}
                            onCheckedChange={(checked) => handleCapacityChange(capacity, checked)}
                          />
                          <label htmlFor={capacity.toLowerCase()} className="text-xs">
                            {capacity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-4">
                    {renderDropdown(
                      "Modalities",
                      optionsModalities,
                      selectedModalities,
                      setSelectedModalities,
                      "modalities",
                    )}
                    {renderDropdown("Region", optionsRegions, selectedRegions, setSelectedRegions, "regions")}
                  </div>

                  <Button className="w-full text-xs" onClick={clearAllFilters}>
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex-1">
            <Tabs
              defaultValue="list"
              className="space-y-4"
              onValueChange={(value) => {
                setViewMode(value)
                setCurrentPage(1) // Reset to first page when changing view
              }}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    placeholder="Search competitors..."
                    className="max-w-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                  </TabsList>
                  <Badge variant="outline" className="rounded-sm px-2 w-[180px] justify-center font-normal">
                    {companies.length} companies
                  </Badge>
                  {/* <Button variant="outline" size="sm">
                  <SlidersHorizontal className="mr-2 h-3 w-3" />
                  Actions
                </Button> */}
                </div>
              </div>

              <TabsContent value="list" className="">
                <div className="h-[340px] overflow-auto space-y-4 ">
                  {loading ? (
                    <div className="text-center py-8">Loading companies...</div>
                  ) : paginatedCompanies.length > 0 ? (
                    <>
                      <div className="px-4 py-2 flex items-center">
                        <Checkbox
                          id="select-all"
                          checked={
                            selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                          className="mr-2"
                        />
                        <label htmlFor="select-all" className="text-sm font-medium">
                          Select All
                        </label>
                      </div>
                      {paginatedCompanies.map((company, index) => (
                        <Card key={index} className="relative overflow-hidden">
                          <CardHeader className="py-3 px-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`company-${index}`}
                                  checked={selectedCompanies.includes(company["Company Name"])}
                                  onCheckedChange={(checked) =>
                                    handleCompanySelection(company["Company Name"], checked)
                                  }
                                />
                                <CardTitle className="text-base">
                                  {highlightText(company["Company Name"], searchQuery)}
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Add modality dots */}
                                {company.modalities && company.modalities.length > 0 && (
                                  <div className="flex gap-1 mr-2">
                                    {company.modalities.map((modality, i) => (
                                      <div
                                        key={i}
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: modalityColors[modality] || "#888888" }}
                                        title={modality}
                                      />
                                    ))}
                                  </div>
                                )}
                                <Badge variant="outline" className=" text-black hover:bg-green px-2 py-1 text-xs">
                                  {company["Markets"]?.split(" ")[0] || "Global"}
                                </Badge>
                                <a href={company["Company URL"]} target="_blank" rel="noopener noreferrer">
                                  <Button variant="ghost" size="sm" className="h-7 gap-1">
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="text-xs">Website</span>
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2 px-4">
                            <div className="text-sm">
                              <span className="font-medium">Capabilities:</span>{" "}
                              {highlightText(company["Service Offerings"], searchQuery)}
                            </div>
                            <div className="text-sm mt-1">
                              <span className="font-medium">Certifications:</span>{" "}
                              {highlightText(company["Certifications"] || "Not specified", searchQuery)}
                            </div>
                            <div className="text-sm mt-1">
                              <span className="font-medium">Manufacturing Sites:</span>
                              <ul className="list-disc pl-5 mt-1">
                                {company.manufacturingSites.length > 0 && (
                                  <div className="text-sm text-gray-600 mb-2">
                                    <div className="flex items-start gap-2 mb-2">
                                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#54681D]" />
                                      <span>{highlightText(company.manufacturingSites[0], searchQuery)}</span>
                                    </div>

                                    {company.manufacturingSites.length > 1 && (
                                      <>
                                        {showMoreSites
                                          ? company.manufacturingSites.slice(1).map((site, siteIndex) => (
                                            <div key={siteIndex} className="flex items-start gap-2 mb-2">
                                              <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#54681D]" />
                                              <span>{highlightText(site, searchQuery)}</span>
                                            </div>
                                          ))
                                          : null}

                                        <button
                                          onClick={() => setShowMoreSites(!showMoreSites)}
                                          className="text-sm text-black underline focus:outline-none"
                                        >
                                          {showMoreSites
                                            ? "Show less"
                                            : `Show ${company.manufacturingSites.length - 1} more`}
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-8">No companies found matching your filters or search.</div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="detailed" className="space-y-4 h-[340px] overflow-auto">
                {loading ? (
                  <div className="text-center py-8">Loading companies...</div>
                ) : paginatedCompanies.length > 0 ? (
                  <>
                    <div className="px-4 py-2 flex items-center">
                      <Checkbox
                        id="select-all-detailed"
                        checked={selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="mr-2"
                      />
                      <label htmlFor="select-all-detailed" className="text-sm font-medium">
                        Select All
                      </label>
                    </div>
                    {paginatedCompanies.map((company, index) => (
                      <Card key={index} className="relative overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`company-detailed-${index}`}
                                checked={selectedCompanies.includes(company["Company Name"])}
                                onCheckedChange={(checked) => handleCompanySelection(company["Company Name"], checked)}
                              />
                              <CardTitle>{highlightText(company["Company Name"], searchQuery)}</CardTitle>
                            </div>
                            {/* Add modality dots */}
                            {company.modalities && company.modalities.length > 0 && (
                              <div className="flex gap-1">
                                {company.modalities.map((modality, i) => (
                                  <div
                                    key={i}
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: modalityColors[modality] || "#888888" }}
                                    title={modality}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <CardDescription>
                            <a
                              href={company["Company URL"]}
                              className="text-blue-500 hover:underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {company["Company URL"]}
                            </a>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p>{highlightText(company["About"] || "", searchQuery)}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Uses</h4>
                                <p className="text-sm text-muted-foreground">
                                  {highlightText(company["Uses"] || "Not specified", searchQuery)}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Certifications</h4>
                                <p className="text-sm text-muted-foreground">
                                  {highlightText(company["Certifications"] || "Not specified", searchQuery)}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-1">Capabilities</h4>
                              <div className="flex flex-wrap gap-2">
                                {company["Service Offerings"]?.split(", ").map((service, serviceIndex) => (
                                  <Badge key={serviceIndex} variant="outline">
                                    {highlightText(service, searchQuery)}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-1">Manufacturing Capacity</h4>
                              <p className="text-sm text-muted-foreground">
                                {highlightText(company["Manufacturing Capacity"] || "Not specified", searchQuery)}
                              </p>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium mb-1">Manufacturing Sites</h4>
                              <div className="space-y-2">
                                {company.manufacturingSites.map((site, siteIndex) => (
                                  <div key={siteIndex} className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                                    <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#54681D]" />
                                    <span>{highlightText(site, searchQuery)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8">No companies found matching your filters or search.</div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {loading
                  ? "Loading..."
                  : `Showing ${paginatedCompanies.length} of ${filteredCompanies.length} companies (Page ${currentPage} of ${totalPages || 1})`}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage <= 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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

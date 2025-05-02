"use client"

import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../components/ui/table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Checkbox } from "../components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog"

import { Popover, PopoverTrigger, PopoverContent } from "../components/ui/popover"

import { Skeleton } from "@/components/ui/skeleton"

import { Download, SlidersHorizontal, Lock } from "lucide-react"
import EventsList from "@/components/events-page"
import NewsList from "@/components/news-list"
import { getUserData } from "@/lib/db"

export default function ProfilePage() {
  const location = useLocation()
  const initialRowData = location?.state?.initialRowData || {}

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    email_info: "",
    company: "",
    designation: "",
    about: "",
    uuid: "",
  })
  useEffect(() => {
    const fetchUser = async () => {
      const firstName = await getUserData("first_name_salescout_user")
      const uuid = await getUserData("user_salescout_id")
      const lastName = await getUserData("last_name_salescout_user")
      const email = await getUserData("user_salescout_email_id")
      const email_info = await getUserData("user_email_info")
      const company = await getUserData("company_salescout_user")
      const designation = await getUserData("user_designation")
      const about = await getUserData("user_about")
      setUser({
        firstName: firstName?.value || "",
        uuid: uuid?.value || "",
        lastName: lastName?.value || "",
        email: email?.value || "",
        company: company?.value || "",
        email_info: email_info?.value || "",
        designation: designation?.value || "",
        about: about?.value || "",
      })
    }

    fetchUser()
  }, [])

  console.log(user)

  const [activeTab, setActiveTab] = useState("decisionMakers")
  const [selectedRoles, setSelectedRoles] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [decisionMakersData, setDecisionMakersData] = useState([])
  const [eventsData, setEventsData] = useState([])
  const [newsArticles, setNewsArticles] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [emailContent, setEmailContent] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generatingEmail, setGeneratingEmail] = useState(null)

  const allRoles = ["Panelist", "Speaker", "Decision Maker"]

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const manufacturer = searchParams.get("Manufacturer")
    const modality = searchParams.get("modality")
    const mechanismOfAction = searchParams.get("mechanismOfAction")
    const indication = searchParams.get("therapeuticArea")

    setLoading(true)

    if (manufacturer) {
      fetch(`${import.meta.env.VITE_API_URL}:6005/api/view-profile?Manufacturer=${encodeURIComponent(manufacturer)}`)
        .then((res) => res.json())
        .then((data) => {
          setDecisionMakersData(data)
          // Remove this line to ensure no filters are checked by default
          // setSelectedRoles(allRoles)
        })
        .catch((err) => console.error("Failed to fetch profile data", err))

      fetch(`${import.meta.env.VITE_API_URL}:6005/company-events?Manufacturer=${encodeURIComponent(manufacturer)}`)
        .then((res) => res.json())
        .then((events) => setEventsData(events))
        .catch((err) => console.error("Failed to fetch company events", err))
    }

    if (manufacturer || modality || mechanismOfAction || indication) {
      const newsQuery = new URLSearchParams({
        ...(manufacturer && { Manufacturer: manufacturer }),
        ...(modality && { modality }),
        ...(mechanismOfAction && { mechanismOfAction }),
        ...(indication && { indication }),
      }).toString()

      fetch(`${import.meta.env.VITE_API_URL}:6005/get-news?${newsQuery}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.news?.articles) {
            setNewsArticles(data.news.articles)
          } else {
            console.warn("No news articles found in response")
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error("Failed to fetch news articles", err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [location.search])

  const filteredData = decisionMakersData.filter(
    (dm) =>
      (selectedRoles.length === 0 || selectedRoles.includes(dm.Role)) &&
      `${dm.Name} ${dm.Company} ${dm.Designation}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEmail = async (currentrowdata) => {
    try {
      console.log(currentrowdata)
      setGeneratingEmail(currentrowdata["Email ID"])
      const response = await fetch(`${import.meta.env.VITE_API_URL}:6004/send-email-new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileData: currentrowdata,
          initialRowData: initialRowData,
          news: newsArticles,
          user: user,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setEmailContent(data.email || "")
        setRecipientEmail(currentrowdata["Email ID"])
        setDialogOpen(true)
      } else {
        alert("Failed to send email.")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      alert("An error occurred while sending the email.")
    } finally {
      setGeneratingEmail(null)
    }
  }

  const TableSkeleton = () => (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  )

  return (
    <>
      <div className="flex flex-col p-4 md:p-8 pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tight">Company Profile</h2>
          <div className="flex gap-2">
            {/* <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button> */}
          </div>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="w-full max-w-md grid grid-cols-3">
            <TabsTrigger value="decisionMakers">Decision Makers</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
          </TabsList>

          <TabsContent value="decisionMakers">
            <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
              <Input
                placeholder="Search decision makers..."
                className="max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-36 justify-center">
                  {filteredData.length} results
                </Badge>

                {/* Filter Dialog Trigger */}
                {/* <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 space-y-2">
                    <h4 className="text-sm font-medium mb-2">Filter by Role</h4>
                    {allRoles.map((role) => (
                      <div key={role} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role}`}
                          checked={selectedRoles.includes(role)}
                          onCheckedChange={(checked) => {
                            setSelectedRoles((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)))
                          }}
                        />
                        <label htmlFor={`role-${role}`} className="text-sm cursor-pointer">
                          {role}
                        </label>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover> */}
              </div>
            </div>
            <div className="rounded-md border overflow-auto h-[400px]">
              {loading ? (
                <div className="p-4">
                  <TableSkeleton />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      {/* <TableHead>Event Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead> */}
                      <TableHead>Email ID</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((dm, index) => (
                      <TableRow key={index}>
                        <TableCell>{dm.Company}</TableCell>
                        <TableCell>{dm.Name}</TableCell>
                        <TableCell>{dm.Position}</TableCell>
                        <TableCell>{dm.Department}</TableCell>
                        {/* <TableCell>{dm["Event name"]}</TableCell>
                        <TableCell>{dm.Date}</TableCell>
                        <TableCell>{dm.Location}</TableCell> */}
                        <TableCell>{dm["E-MailId"]}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            className="hover:bg-[#95b833] rounded-[12px]"
                            onClick={() => handleEmail(dm)}
                            disabled={generatingEmail === dm["Email ID"]}
                          >
                            {generatingEmail === dm["Email ID"] ? "Generating..." : "Send Email"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <EventsList data={eventsData} />
          </TabsContent>

          <TabsContent value="news">
            {/* <p className="text-muted-foreground">News content coming soon...</p> */}
            <NewsList articles={newsArticles} />
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="hidden">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="max-w-[600px] h-[550px] overflow-y-auto p-6">
          <DialogTitle className="text-xl font-bold mb-4">Email Preview</DialogTitle>

          {/* Replaced DialogDescription with div */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <label htmlFor="from" className="font-semibold mb-2">
                From:
              </label>
              <input
                id="from"
                type="email"
                placeholder="Enter your email"
                className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-2">To:</label>
              <div className="p-2 bg-gray-100 border border-gray-300 rounded-md">{recipientEmail}</div>
            </div>
            <div className="flex flex-col">
              <label className="font-semibold mb-2">Subject:</label>
              <div className="p-2 bg-gray-100 border border-gray-300 rounded-md">{emailContent.subject}</div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="emailContent" className="font-semibold mb-2">
                Email Content:
              </label>
              <textarea
                id="emailContent"
                placeholder="Type your message here..."
                className="w-full h-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green outline-none overflow-y-scroll"
                value={emailContent.body}
                onChange={(e) => setEmailContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end mt-4">
            <Button
              className="bg-[#a6ce39] text-white hover:bg-[#95b833] rounded-[12px] transition px-4 py-2 opacity-50 pointer-events-none relative"
              disabled
            >
              Send Email
              <Lock className="h-4 w-4 text-white opacity-75" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

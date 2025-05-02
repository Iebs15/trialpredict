"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Globe, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SpeakersTable } from "./speakers-table"

const EventCard = ({ event, speakers, onViewSpeakers }) => (
  <Card className="h-full flex flex-col justify-between shadow-md">
    <CardContent className="p-4 space-y-2 flex flex-col h-full">
      <a
        href={event["Official Website"]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg font-semibold hover:underline text-primary"
      >
        {event["Event Name"]}
      </a>
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <CalendarDays className="h-4 w-4" /> {event.Dates}
      </div>
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <MapPin className="h-4 w-4" /> {event.Location}
      </div>
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Globe className="h-4 w-4" /> {event["Unnamed: 3"]}
      </div>
      <div className="flex justify-between items-center mt-auto pt-4">
        <Badge variant="outline">{event["Unnamed: 3"]}</Badge>
        {speakers.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => onViewSpeakers(event)} className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            View Speakers ({speakers.length})
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
)

export default function EventsList({ data }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { EventsData = [], EventsSpeakerData = [] } = data || {}
  const today = new Date()

  const parsedEvents = EventsData.map((event) => {
    const fullDateStr = event.Dates || ""
    const parts = fullDateStr.split(/[–-]/)
    const startDateStr = parts[0].trim()

    // Try to extract the year from the full string
    const yearMatch = fullDateStr.match(/\b\d{4}\b/)
    const year = yearMatch ? yearMatch[0] : new Date().getFullYear()

    // Combine the start date with the year (in case it's missing)
    const finalDateStr = `${startDateStr}, ${year}`
    const parsedDate = new Date(finalDateStr)

    return {
      ...event,
      parsedDate,
    }
  })

  const upcomingEvents = parsedEvents.filter((e) => e.parsedDate && e.parsedDate >= today)
  const pastEvents = parsedEvents.filter((e) => e.parsedDate && e.parsedDate < today)

  // Function to get speakers for a specific event
  const getSpeakersForEvent = (eventName) => {
    return EventsSpeakerData.filter((speaker) => speaker["Event Name"] === eventName)
  }

  // Handle opening the speakers dialog
  const handleViewSpeakers = (event) => {
    setSelectedEvent(event)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-2xl font-bold mb-4">📅 Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-muted-foreground">No upcoming events.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map((event) => (
              <EventCard
                key={event["Event Name"] + event.Dates}
                event={event}
                speakers={getSpeakersForEvent(event["Event Name"])}
                onViewSpeakers={handleViewSpeakers}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">📜 Past Events</h2>
        {pastEvents.length === 0 ? (
          <p className="text-muted-foreground">No past events.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastEvents.map((event) => (
              <EventCard
                key={event["Event Name"] + event.Dates}
                event={event}
                speakers={getSpeakersForEvent(event["Event Name"])}
                onViewSpeakers={handleViewSpeakers}
              />
            ))}
          </div>
        )}
      </section>

      {/* Speakers Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? `Speakers - ${selectedEvent["Event Name"]}` : "Speakers"}</DialogTitle>
          </DialogHeader>
          {selectedEvent && <SpeakersTable speakers={getSpeakersForEvent(selectedEvent["Event Name"])} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

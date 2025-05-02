import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail } from "lucide-react"

export function SpeakersTable({ speakers }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Speaker</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Contact</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {speakers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No speakers found for this event.
              </TableCell>
            </TableRow>
          ) : (
            speakers.map((speaker) => (
              <TableRow key={speaker.Email}>
                <TableCell className="font-medium">{speaker.Speaker}</TableCell>
                <TableCell>{speaker.Designation}</TableCell>
                <TableCell>{speaker.Organization}</TableCell>
                <TableCell>
                  <a href={`mailto:${speaker.Email}`} className="flex items-center gap-1 text-primary hover:underline">
                    <Mail className="h-4 w-4" />
                    {speaker.Email}
                  </a>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

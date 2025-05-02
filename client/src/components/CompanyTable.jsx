"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

export default function CompanyTable({ data = [] }) {
  if (!data.length) return <div className="text-sm text-muted-foreground">No data available.</div>

  const columns = Object.keys(data[0])

  return (
    <div className="max-h-[400px] overflow-auto border rounded-md shadow-sm">
      <Table className="w-full">
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className="capitalize">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((col, colIndex) => (
                <TableCell key={colIndex}>
                  {row[col]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

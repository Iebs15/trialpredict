"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

export function DiseaseDropdown({ diseases, selectedDisease, onSelect, isLoading = false }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor="disease-dropdown">Related Diseases</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="disease-dropdown"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={diseases.length === 0 && !isLoading}
          >
            {isLoading
              ? "Loading diseases..."
              : selectedDisease || (diseases.length > 0 ? "Select a disease (optional)" : "No diseases found")}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2">
          <Command>
            <CommandInput placeholder="Search diseases..." />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">Loading diseases...</div>
              ) : (
                <>
                  <CommandEmpty>No diseases found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="all"
                      onSelect={() => {
                        onSelect("all")
                        setOpen(false)
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedDisease === "all" ? "opacity-100" : "opacity-0")} />
                      All Diseases ({diseases.length})
                    </CommandItem>
                    {diseases.map((disease) => (
                      <CommandItem
                        key={disease}
                        value={disease}
                        onSelect={() => {
                          onSelect(disease)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn("mr-2 h-4 w-4", selectedDisease === disease ? "opacity-100" : "opacity-0")}
                        />
                        {disease}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

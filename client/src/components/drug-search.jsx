// "use client"

// import React, { useState, useEffect } from "react"
// import { Check, ChevronsUpDown } from "lucide-react"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// export function DrugSearch({
//   options,
//   value,
//   onChange,
//   onInputChange,
//   placeholder = "Search drugs or targets...",
//   emptyMessage = "No matches found.",
// }) {
//   const [open, setOpen] = useState(false)
//   const [inputValue, setInputValue] = useState("")

//   useEffect(() => {
//     if (value) {
//       setInputValue(value)
//     }
//   }, [value])

//   const handleInputChange = (input) => {
//     setInputValue(input)
//     onInputChange(input)
//   }

//   const handleSelect = (currentValue) => {
//     onChange(currentValue)
//     setInputValue(currentValue)
//     setOpen(false)
//   }

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
//           {value || inputValue || placeholder}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-full p-2">
//         <Command>
//           <CommandInput placeholder={placeholder} value={inputValue} onValueChange={handleInputChange} />
//           <CommandList>
//             <CommandEmpty>{emptyMessage}</CommandEmpty>
//             <CommandGroup>
//               {options.map((option) => (
//                 <CommandItem key={option} value={option} onSelect={() => handleSelect(option)}>
//                   <Check className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
//                   {option}
//                 </CommandItem>
//               ))}
//             </CommandGroup>
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   )
// }



"use client"

import { useState, useEffect, useRef } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DrugSearch({
  options,
  value,
  onChange,
  onInputChange,
  placeholder = "Search drugs or targets...",
  emptyMessage = "No matches found.",
  isLoading = false,
}) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const prevOptions = useRef([])

  // Cache previous options to improve performance
  useEffect(() => {
    if (options.length > 0) {
      prevOptions.current = options
    }
  }, [options])

  useEffect(() => {
    if (value) {
      setInputValue(value)
    }
  }, [value])

  const handleInputChange = (input) => {
    setInputValue(input)
    onInputChange(input)
  }

  const handleSelect = (currentValue) => {
    onChange(currentValue)
    setInputValue(currentValue)
    setOpen(false)
  }

  // Display cached options when input is less than 3 characters
  const displayOptions =
    inputValue.length < 3 && prevOptions.current.length > 0 && options.length === 0
      ? prevOptions.current.slice(0, 5) // Show limited cached results
      : options

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value || inputValue || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-2">
        <Command>
          <CommandInput placeholder={placeholder} value={inputValue} onValueChange={handleInputChange} />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">Loading options...</div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {displayOptions.map((option) => (
                    <CommandItem key={option} value={option} onSelect={() => handleSelect(option)}>
                      <Check className={cn("mr-2 h-4 w-4", value === option ? "opacity-100" : "opacity-0")} />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

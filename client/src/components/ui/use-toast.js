// components/ui/use-toast.js
import { toast } from "sonner"

export function useToast() {
  return {
    toast: ({ title, description, variant }) => {
      toast(`${title}${description ? " – " + description : ""}`, {
        className: variant === "destructive" ? "bg-red-500 text-white" : "",
      })
    },
  }
}

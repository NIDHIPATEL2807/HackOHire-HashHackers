"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeToCrackProps {
  timeString: string
  className?: string
}

export function TimeToCrack({ timeString, className }: TimeToCrackProps) {
  // Determine security level based on time
  const getSecurityLevel = () => {
    if (timeString.includes("second") || timeString.includes("minute") || timeString.includes("hour")) {
      return {
        level: "Insecure",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
      }
    }

    if (timeString.includes("day") || timeString.includes("week") || timeString.includes("month")) {
      return {
        level: "Moderate",
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
      }
    }

    if (timeString.includes("year") && !timeString.includes("century")) {
      return {
        level: "Secure",
        color: "text-teal-500",
        bgColor: "bg-teal-500/10",
      }
    }

    return {
      level: "Very Secure",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    }
  }

  const security = getSecurityLevel()

  return (
    <div className={cn("p-4 rounded-lg border border-border", security.bgColor, className)}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className={cn("h-5 w-5", security.color)} />
        <h3 className="font-medium">Time to Crack</h3>
      </div>
      <p className="text-2xl font-bold mb-1">{timeString}</p>
      <p className={cn("text-sm", security.color)}>{security.level}</p>
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"

interface PasswordStrengthMeterProps {
  strength: number // 0-100
  className?: string
}

export function PasswordStrengthMeter({ strength, className }: PasswordStrengthMeterProps) {
  // Determine color based on strength
  const getColor = () => {
    if (strength < 30) return "bg-red-500"
    if (strength < 70) return "bg-amber-500"
    if (strength < 90) return "bg-teal-500"
    return "bg-emerald-500"
  }

  // Determine label based on strength
  const getLabel = () => {
    if (strength < 30) return "Very Weak"
    if (strength < 70) return "Moderate"
    if (strength < 90) return "Strong"
    else return "Very Strong"
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500 ease-out", getColor())}
          style={{ width: `${strength}%` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Password Strength</span>
        <span className="text-sm font-medium">{getLabel()}</span>
      </div>
    </div>
  )
}

"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GlowingCardProps {
  title: string
  description: string
  className?: string
  delay?: number
  highlight?: boolean
  size?: "default" | "large" | "tall"
}

export function GlowingCard({
  title,
  description,
  className,
  delay = 0,
  highlight = false,
  size = "default",
}: GlowingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "group relative rounded-xl overflow-hidden",
        size === "large" && "md:col-span-2 md:row-span-1",
        size === "tall" && "md:col-span-1 md:row-span-2",
        className,
      )}
    >
      {/* Permanent glow effect */}
      <div className="absolute inset-0 rounded-xl">
        <div
          className={cn(
            "absolute inset-0 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700",
            highlight
              ? "bg-gradient-to-r from-purple-500/30 via-teal-500/30 to-pink-500/30"
              : "bg-gradient-to-r from-teal-400/30 via-primary/30 to-cyan-400/30",
          )}
        />
      </div>

      {/* Border glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl opacity-40 group-hover:opacity-100 transition-opacity duration-700",
          highlight
            ? "bg-gradient-to-r from-purple-500 via-teal-500 to-pink-500"
            : "bg-gradient-to-r from-teal-400 via-primary to-cyan-400",
        )}
      >
        <div className="absolute inset-px rounded-xl bg-slate-950" />
      </div>

      {/* Content */}
      <div className="relative h-full bg-slate-900/90 backdrop-blur-sm rounded-xl border border-slate-800/50 p-6 flex flex-col">
        <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </motion.div>
  )
}

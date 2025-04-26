"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"

// Define the type for insights coming from the backend
interface Insight {
  header: string
  quote: string
}

interface InsightsResponse {
  insights: Insight[]
}

export function PasswordGuidelinesSection() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch insights from the backend
  useEffect(() => {
    const fetchInsights = async () => {
      setIsLoading(true)
      try {
        // Make the API call to fetch insights
        const response = await axios.get<InsightsResponse>("http://127.0.0.1:5003/generate_insights")
        setInsights(response.data.insights)
      } catch (err) {
        console.error("Error fetching insights:", err)
        setError("Failed to load security insights. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInsights()
  }, []) // Empty dependency array ensures this runs once when component mounts

  // Don't render anything while loading
  if (isLoading) {
    return null
  }

  // Don't render anything if there's an error or no insights
  if (error || insights.length === 0) {
    return null
  }

  // Define card sizes for the asymmetric layout
  const getCardSize = (index: number) => {
    if (index === 1) return "large" as const
    if (index === 3) return "tall" as const
    return "default" as const
  }

  // Determine if a card should be highlighted
  const isHighlighted = (index: number) => index === 2 // Highlighting the 3rd card (2FA)

  // Only render the section once we have insights data
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent" />
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-sm font-medium text-primary"
          >
            FortiPhrase Security Guidelines
          </motion.div>
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Best Practices for Secure Passwords
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Follow these guidelines to create strong passwords that protect your digital identity
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {insights.map((insight, index) => {
            // Define custom layout based on index
            let colSpan = "md:col-span-4" // Default size

            // First row: 2 cards spanning 6 columns each
            

            return (
              <motion.div
                key={index}
                className={`${colSpan} relative rounded-xl overflow-hidden`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl">
                  <div
                    className={`absolute inset-0 blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-700 ${
                      
                        "bg-gradient-to-r from-teal-400/30 via-primary/30 to-cyan-400/30"
                    }`}
                  />
                </div>

                {/* Border glow */}
                <div
                  className={`absolute inset-0 rounded-xl opacity-40 group-hover:opacity-100 transition-opacity duration-700 ${
                     "bg-gradient-to-r from-teal-400 via-primary to-cyan-400"
                  }`}
                >
                  <div className="absolute inset-px rounded-xl bg-[#0a1122]" />
                </div>

                {/* Content */}
                <div className="relative h-full bg-[#0a1122] backdrop-blur-sm rounded-xl border border-slate-800/50 p-6 flex flex-col">
                  <h3 className={`text-lg font-semibold mb-3 ${"text-white"}`}>
                    {insight.header}
                  </h3>
                  <p className="text-muted-foreground text-sm">{insight.quote}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

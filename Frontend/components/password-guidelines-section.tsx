"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlowingCard } from "./glowing-card"

// Define the type for guidelines coming from the backend
interface Guideline {
  id: string
  title: string
  description: string
}

export function PasswordGuidelinesSection() {
  const [guidelines, setGuidelines] = useState<Guideline[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch guidelines from the backend
  useEffect(() => {
    const fetchGuidelines = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data to simulate a backend response
        const mockResponse = [
          {
            id: "1",
            title: "Use Long Passwords",
            description:
              "Aim for at least 12 characters. Length is one of the most important factors in password strength.",
          },
          {
            id: "2",
            title: "Mix Character Types",
            description:
              "Combine uppercase, lowercase, numbers, and special characters to increase complexity and make your passwords significantly harder to crack through brute force methods.",
          },
          {
            id: "3",
            title: "Avoid Personal Info",
            description:
              "Don't use easily guessable information like birthdays, names, or common words that could be discovered through social engineering.",
          },
          {
            id: "4",
            title: "Use Unique Passwords",
            description:
              "Never reuse passwords across different accounts to prevent cascading breaches. When one service is compromised, others remain secure.",
          },
          {
            id: "5",
            title: "Consider Passphrases",
            description:
              "A string of random words can be both secure and memorable, like 'correct-horse-battery-staple'.",
          },
          {
            id: "6",
            title: "Check for Breaches",
            description:
              "Regularly verify if your passwords have been exposed in known data breaches and change them immediately if compromised.",
          },
        ]

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        setGuidelines(mockResponse)
      } catch (err) {
        console.error("Error fetching guidelines:", err)
        setError("Failed to load password guidelines. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchGuidelines()
  }, [])

  // Define card sizes for the asymmetric layout
  const getCardSize = (index: number) => {
    if (index === 1) return "large" as const
    if (index === 3) return "tall" as const
    return "default" as const
  }

  // Determine if a card should be highlighted
  const isHighlighted = (index: number) => index === 1

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
            Password Security Guidelines
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

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
            {guidelines.map((guideline, index) => (
              <GlowingCard
                key={guideline.id}
                title={guideline.title}
                description={guideline.description}
                delay={0.4 + index * 0.1}
                size={getCardSize(index)}
                highlight={isHighlighted(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

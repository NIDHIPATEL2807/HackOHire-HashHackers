"use client"

import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { SecuritySection } from "@/components/security-section"
import { PasswordGuidelinesSection } from "@/components/password-guidelines-section"
import { useEffect, useState } from "react"

export default function Home() {
  // This key will force the PasswordGuidelinesSection to remount and refetch data
  const [refreshKey, setRefreshKey] = useState(0)

  // Force refresh when the page loads
  useEffect(() => {
    setRefreshKey((prevKey) => prevKey + 1)
  }, [])

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Security Section */}
      <SecuritySection />

      {/* Password Guidelines Section - key forces remount on page load */}
      <PasswordGuidelinesSection key={refreshKey} />
    </div>
  )
}

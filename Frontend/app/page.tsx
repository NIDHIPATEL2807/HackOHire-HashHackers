"use client"

import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { SecuritySection } from "@/components/security-section"
import { PasswordGuidelinesSection } from "@/components/password-guidelines-section"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Security Section */}
      <SecuritySection />

      {/* Password Guidelines Section */}
      <PasswordGuidelinesSection />
    </div>
  )
}

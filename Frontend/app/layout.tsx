import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { ScrollIndicator } from "@/components/scroll-indicator"
import { AnimatedBackground } from "@/components/animated-background"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FortiPhrase - Password Strength Analysis Tool",
  description: "AI-powered password strength analysis and generation tool",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-background min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AnimatedBackground />
          <ScrollIndicator />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="py-6 border-t border-border">
              <div className="container flex flex-col items-center justify-center gap-2 md:flex-row md:justify-between">
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} FortiPhrase. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </a>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

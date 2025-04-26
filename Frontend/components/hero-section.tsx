"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatedButton } from "./animated-button"
import { AnimatedBackground } from "./animated-background"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Hero background */}
      <div className="absolute inset-0 -z-10">
        <AnimatedBackground variant="hero" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/80 to-background" />
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />

      <div className="container relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-sm font-medium text-teal-400"
        >
          AI-Powered Password Security
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-5xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Secure Your Digital Life with{" "}
          <span className="relative">
            <span className="relative z-10 gradient-text">AI-Powered</span>
            <motion.span
              className="absolute -inset-1 rounded-lg bg-gradient-to-r from-teal-400/20 to-cyan-500/20 blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </span>{" "}
          Password Analysis
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-muted-foreground max-w-3xl mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          FortiPhrase uses advanced machine learning to evaluate, strengthen, and generate secure passwords that keep
          your accounts safe.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <AnimatedButton delay={0.4} asChild size="lg" className="gap-2 text-lg px-8 py-6">
            <Link href="/analyze">
              Try Password Analyzer <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
          </AnimatedButton>
          <AnimatedButton delay={0.5} asChild variant="outline" size="lg" className="text-lg px-8 py-6">
            <Link href="/passphrase">Generate Secure Passphrase</Link>
          </AnimatedButton>
        </div>

        
      </div>
    </section>
  )
}

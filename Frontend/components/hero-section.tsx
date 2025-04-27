"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatedButton } from "./animated-button"
import { AnimatedBackground } from "./animated-background"
import { Floating3DCard } from "./floating-3d-card"

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
         <motion.div
                  className="mt-16 w-full max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <Floating3DCard className="w-full" glowColor="rgba(20, 184, 166, 0.3)">
                    <div className="p-8 border border-border/60 rounded-xl bg-card/80 backdrop-blur-sm shadow-xl">
                      <div className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold">Password Strength</h3>
                          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm font-medium">
                            Strong
                          </span>
                        </div>
        
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{ duration: 1, delay: 0.7 }}
                          />
                        </div>
        
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                            <div className="text-sm text-muted-foreground mb-1">Time to crack:</div>
                            <div className="text-lg font-medium">3 centuries</div>
                          </div>
                          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
                            <div className="text-sm text-muted-foreground mb-1">Character variety:</div>
                            <div className="text-lg font-medium">Excellent</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Floating3DCard>
                </motion.div>
        
      </div>
    </section>
  )
}

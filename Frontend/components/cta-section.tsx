"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { AnimatedButton } from "./animated-button"

export function CtaSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        {/* Decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl opacity-60" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl opacity-60" />
      </div>

      <div className="container relative z-10 max-w-5xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          

          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Ready to secure your accounts?
          </motion.h2>

          <motion.p
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Start using our password tools today and take control of your digital security. Our comprehensive suite
            helps you create, analyze, and manage secure passwords.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <AnimatedButton asChild size="lg" className="text-lg px-8 py-6" delay={0.5}>
              <Link href="/analyze">Analyze Password</Link>
            </AnimatedButton>
            <AnimatedButton asChild variant="outline" size="lg" className="text-lg px-8 py-6" delay={0.6}>
              <Link href="/passphrase">Generate Passphrase</Link>
            </AnimatedButton>
            <AnimatedButton asChild variant="secondary" size="lg" className="text-lg px-8 py-6" delay={0.7}>
              <Link href="/bulk">Bulk Analysis</Link>
            </AnimatedButton>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

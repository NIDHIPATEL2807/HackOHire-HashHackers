"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Shield, Zap, ShieldCheck } from "lucide-react"
import { AnimatedButton } from "./animated-button"

export function SecuritySection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 -z-10" />

      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            

            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Password Security Matters</h2>
            <p className="text-xl text-muted-foreground mb-8">
              In today's digital world, a strong password is your first line of defense against cyber threats. Our tool
              helps you create and maintain passwords that are:
            </p>

            <ul className="space-y-6">
              <motion.li
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="mt-1 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Shield className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Highly secure</h3>
                  <p className="text-muted-foreground">Resistant to brute force and dictionary attacks</p>
                </div>
              </motion.li>
              <motion.li
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="mt-1 p-2 rounded-xl bg-teal-500/10 border border-teal-500/20">
                  <Zap className="h-6 w-6 text-teal-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Easy to remember</h3>
                  <p className="text-muted-foreground">But difficult for others to guess</p>
                </div>
              </motion.li>
              <motion.li
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="mt-1 p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <ShieldCheck className="h-6 w-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-1">Unique across accounts</h3>
                  <p className="text-muted-foreground">To prevent cascading security breaches</p>
                </div>
              </motion.li>
            </ul>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <AnimatedButton asChild size="lg">
                <Link href="/analyze">Check Your Password Now</Link>
              </AnimatedButton>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex-1 w-full max-w-xl"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative">
              {/* Card background with glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/10 via-primary/5 to-cyan-500/10 rounded-2xl blur-xl" />

              <motion.div
                className="relative p-8 border border-border/60 rounded-xl bg-card/80 backdrop-blur-sm shadow-xl"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
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

                  <div className="p-4 border border-border/60 rounded-lg bg-card/50 backdrop-blur-sm">
                    <h4 className="text-sm font-medium mb-3">Suggestions for improvement:</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <motion.li
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>Add more special characters</span>
                      </motion.li>
                      <motion.li
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9, duration: 0.3 }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>Increase overall length to 16+ characters</span>
                      </motion.li>
                      <motion.li
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.0, duration: 0.3 }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                        <span>Avoid sequential numbers</span>
                      </motion.li>
                    </ul>
                  </div>

                  <motion.div
                    className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">AI-Generated Suggestion</h4>
                    </div>
                    <code className="block w-full p-2 bg-background/50 rounded border border-border/50 font-mono text-sm">
                      P@$$w0rd-S3cur1ty-2024!
                    </code>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { Clock, Lightbulb, FileSpreadsheet, Lock } from "lucide-react"

export function FeaturesSection() {
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.5,
      },
    }),
  }

  const features = [
    {
      icon: <Lightbulb className="h-6 w-6 text-primary" />,
      title: "AI-Powered Suggestions",
      description: "Get intelligent password recommendations based on advanced machine learning algorithms.",
    },
    {
      icon: <Clock className="h-6 w-6 text-primary" />,
      title: "Time-to-Crack Visualization",
      description: "See exactly how long it would take hackers to break your password with real-time visualization.",
    },
    {
      icon: <Lock className="h-6 w-6 text-primary" />,
      title: "Passphrase Conversion",
      description: "Transform memorable phrases into ultra-secure passwords that are easy to remember.",
    },
    {
      icon: <FileSpreadsheet className="h-6 w-6 text-primary" />,
      title: "Bulk Password Analysis",
      description:
        "Analyze multiple passwords at once by uploading a CSV or Excel file for comprehensive security audits.",
    },
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-muted/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-muted/30 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-muted/30 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-muted/30 to-transparent" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative z-10">
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
            Powerful Features
          </motion.div>
          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything You Need for Password Security
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            FortiPhrase provides a comprehensive suite of tools to help you create, analyze, and manage secure passwords
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card group"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={featureVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="mb-6 p-3 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "framer-motion"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <CardHeader className={className}>{children}</CardHeader>
}

export function AnimatedCardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <CardTitle className={className}>{children}</CardTitle>
    </motion.div>
  )
}

export function AnimatedCardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
      <CardDescription className={className}>{children}</CardDescription>
    </motion.div>
  )
}

export function AnimatedCardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <CardContent className={className}>{children}</CardContent>
}

export function AnimatedCardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <CardFooter className={className}>{children}</CardFooter>
}

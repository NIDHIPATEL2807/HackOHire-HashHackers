"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PasswordStrengthMeter } from "@/components/password-strength-meter"
import { TimeToCrack } from "@/components/time-to-crack"
import { AlertTriangle, Copy, Loader2, Plus, Trash2, CheckCircle, Info, Shield } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardDescription,
  AnimatedCardFooter,
  AnimatedCardHeader,
  AnimatedCardTitle,
} from "@/components/animated-card"
import { AnimatedButton } from "@/components/animated-button"
import { AnimatedSection } from "@/components/animated-section"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import { formatApiError, apiRequestWithRetry } from "@/lib/api-utils"
interface CrackTimeInfo {
  crack_time: string
  hashcat_speed: string
}

interface PasswordResponse {
  passphrase: string
  strength: number
}

export default function PassphraseGenerator() {
  const [phrases, setPhrases] = useState<string[]>(["", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PasswordResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handlePhraseChange = (index: number, value: string) => {
    const newPhrases = [...phrases]
    newPhrases[index] = value
    setPhrases(newPhrases)
  }

  const addPhrase = () => {
    setPhrases([...phrases, ""])
  }

  const removePhrase = (index: number) => {
    if (phrases.length <= 1) return
    const newPhrases = phrases.filter((_, i) => i !== index)
    setPhrases(newPhrases)
  }

  const handleGenerate = async () => {
    const validPhrases = phrases.filter((phrase) => phrase.trim().length > 0)

    if (validPhrases.length === 0) {
      setError("Please enter at least one phrase")
      return
    }

    setIsLoading(true)
    setError(null)
    setCopied(false)

    try {
      // Make API call with retry logic
      const response = await apiRequestWithRetry(
        () =>
          axios.post<PasswordResponse>(
            "http://127.0.0.1:5001/generate-passphrase",
            {
              phrases: validPhrases,
            },
            {
              timeout: 15000, // 15 seconds
            },
          ),
        {
          maxRetries: 3,
          retryDelay: 1500,
          onRetry: (attempt, maxRetries) => {
            toast({
              title: "Connection issue",
              description: `Retrying request (${attempt}/${maxRetries})...`,
              variant: "destructive",
            })
          },
        },
      )

      // Handle successful response
      setResult(response.data)

      // Show success toast
      toast({
        title: "Password Generated",
        description: "Your secure password has been successfully generated.",
      })
    } catch (err) {
      console.error("Error generating password:", err)

      // Format and set error message
      setError(formatApiError(err))

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to generate password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!result?.passphrase) return

    navigator.clipboard
      .writeText(result.passphrase)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        // Show success toast
        toast({
          title: "Copied to Clipboard",
          description: "Password has been copied to your clipboard.",
        })
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)

        // Show error toast
        toast({
          title: "Copy Failed",
          description: "Failed to copy password to clipboard.",
          variant: "destructive",
        })
      })
  }

  const getSecurityLevel = (strength: number): string => {
    if (strength < 0.3) {
      return "Weak"
    } else if (strength<0.65) {
      return "Moderate"
    } else if (strength<0.85) {
      return "Strong"
    }
    return "Very Strong"
  }

  // Helper function to get color based on security level
  const getSecurityColor = (level: string): string => {
    switch (level) {
      case "Very Weak":
        return "text-red-500"
      case "Weak":
        return "text-orange-500"
      case "Moderate":
        return "text-amber-500"
      case "Strong":
        return "text-teal-500"
      case "Very Strong":
        return "text-emerald-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="container max-w-4xl py-12">
      <AnimatedSection>
        <div className="mb-8 text-center">
          <motion.h1
            className="text-3xl font-bold mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Passphrase Password Generator
          </motion.h1>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Create a strong, memorable password from phrases that are meaningful to you
          </motion.p>
        </div>
      </AnimatedSection>

      <AnimatedCard className="mb-8" delay={0.2}>
        <Card>
          <AnimatedCardHeader>
            <AnimatedCardTitle>Enter Your Phrases</AnimatedCardTitle>
            <AnimatedCardDescription>
              Add words or short phrases that are meaningful to you. We'll convert them into a secure password.
            </AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent className="space-y-4">
            <AnimatePresence>
              {phrases.map((phrase, index) => (
                <motion.div
                  key={index}
                  className="flex gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <Input
                    placeholder={`Phrase ${index + 1}`}
                    value={phrase}
                    onChange={(e) => handlePhraseChange(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePhrase(index)}
                    disabled={phrases.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + phrases.length * 0.1 }}
            >
              <AnimatedButton
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={addPhrase}
                delay={0.3}
              >
                <Plus className="h-4 w-4" /> Add Another Phrase
              </AnimatedButton>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <AnimatedButton onClick={handleGenerate} disabled={isLoading} className="w-full" delay={0.4}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating
                </>
              ) : (
                "Generate Secure Password"
              )}
            </AnimatedButton>
          </AnimatedCardContent>
          <AnimatedCardFooter>
            <p className="text-sm text-muted-foreground">
              Your phrases are processed securely. We recommend using a password manager to store the generated
              password.
            </p>
          </AnimatedCardFooter>
        </Card>
      </AnimatedCard>

      <AnimatePresence>
        {result && result.passphrase && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedCard delay={0.5}>
              <Card>
                <AnimatedCardHeader>
                  <AnimatedCardTitle>Your Generated Password</AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent className="space-y-6">
                  <motion.div
                    className="p-4 bg-muted rounded-lg flex items-center justify-between"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <code className="text-xl font-mono">{result.passphrase}</code>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard} className="relative">
                      {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      {copied && (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute -top-8 right-0 text-xs bg-background px-2 py-1 rounded shadow-sm"
                        >
                          Copied!
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    <PasswordStrengthMeter strength={result.strength * 100} />
                  </motion.div>

                  
                </AnimatedCardContent>
              </Card>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

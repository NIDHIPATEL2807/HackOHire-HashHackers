"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  Info,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import axios from "axios"

// Define types for the API response
interface CrackTimeInfo {
  hours: number
}

interface AttackTypes {
  dictionary_attack: CrackTimeInfo
  offline_brute_force: CrackTimeInfo
  rainbow_table: CrackTimeInfo
}

interface TimeToCrackInfo {
  crack_times: AttackTypes
  password: string
}

interface PasswordAnalysisResponse {
  improvement_suggestions: string[]
  original_password: string
  strength: number
  new_strength: number
  suggested_password: string
  time_to_crack: TimeToCrackInfo
  new_time_to_crack: TimeToCrackInfo
  vulnerabilities_detected: string[]
}

export default function PasswordAnalyzer() {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<PasswordAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { toast } = useToast()

  // Replace the handleAnalyze function with this simpler implementation that uses axios directly
  const handleAnalyze = async () => {
    if (!password.trim()) {
      setError("Please enter a password to analyze")
      return
    }

    // Add minimum password length validation
    if (password.length < 7) {
      setError("Password must be at least 7 characters long")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Make a direct API call without retry logic
      const response = await axios.post(
        "http://localhost:5002/analyse",
        {
          password: password,
        },
        
      )

      // Set the result from the API response
      setResult(response.data)

      // Show success toast
      toast({
        title: "Analysis Complete",
        description: "Your password has been successfully analyzed.",
      })
    } catch (err) {
      console.error("Error analyzing password:", err)

      if (axios.isAxiosError(err)) {
        if (err.response) {
          // The request was made and the server responded with a status code outside the 2xx range
          setError(`Server error: ${err.response.data?.message || err.response.statusText || "Unknown error"}`)
        } else if (err.request) {
          // The request was made but no response was received
          setError("No response from server. Please check your connection and try again.")
        } else {
          // Something happened in setting up the request
          setError(`Error: ${err.message}`)
        }
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get the dictionary attack time to crack
  const getDictionaryAttackTime = (timeToCrackInfo: TimeToCrackInfo | undefined): string => {
    if (!timeToCrackInfo) return "Unknown"

    const { crack_times } = timeToCrackInfo
    const minutes = crack_times.dictionary_attack.hours

    // Convert to appropriate time unit
    if (minutes < 1) {
      return "less than a minute"
    } else if (minutes < 60) {
      return `${Math.round(minutes)} minutes`
    } else if (minutes < 1440) {
      // less than a day
      return `${Math.round(minutes / 60)} hours`
    } else if (minutes < 43200) {
      // less than a month (30 days)
      return `${Math.round(minutes / 1440)} days`
    } else if (minutes < 525600) {
      // less than a year
      return `${Math.round(minutes / 43200)} months`
    } else if (minutes < 5256000) {
      // less than 10 years
      return `${Math.round(minutes / 525600)} years`
    } else if (minutes < 52560000) {
      // less than a century
      return `${Math.round(minutes / 5256000)} decades`
    } else if (minutes < 525600000) {
      // less than a millennium
      return `${Math.round(minutes / 52560000)} centuries`
    } else {
      return `${Math.round(minutes / 525600000)} millennia`
    }
  }

  // Helper function to format large numbers with commas
  const formatLargeNumber = (numStr: string): string => {
    // Handle special cases
    if (numStr.includes("less than")) {
      return numStr
    }

    // Extract the numeric part and the unit
    const match = numStr.match(/^(\d+(?:\.\d+)?)\s+(.+)$/)
    if (!match) return numStr

    const number = match[1]
    const unit = match[2]

    // For extremely large numbers, use scientific notation if over 1 trillion
    const numValue = Number.parseFloat(number)
    let formattedNumber

    if (numValue >= 1e12) {
      formattedNumber = numValue.toExponential(2)
    } else {
      formattedNumber = numValue.toLocaleString()
    }

    return `${formattedNumber} ${unit}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
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

  // Helper function to get security rating
  const getSecurityRating = (strength: number): { label: string; color: string; bgColor: string } => {
    if (strength < 0.3) return { label: "Very Weak", color: "text-red-500", bgColor: "bg-red-500" }
    if (strength < 0.5) return { label: "Weak", color: "text-orange-500", bgColor: "bg-orange-500" }
    if (strength < 0.65) return { label: "Moderate", color: "text-amber-500", bgColor: "bg-amber-500" }
    if (strength < 0.9) return { label: "Strong", color: "text-teal-500", bgColor: "bg-teal-500" }
    return { label: "Very Strong", color: "text-emerald-500", bgColor: "bg-emerald-500" }
  }

  // Calculate improvement percentage
  const calculateImprovement = (): number => {
    if (!result) return 0;
  
    // Handle edge cases where strength is very low
    if (result.strength < 0.05) {
      // For very weak passwords, cap the improvement at 1000%
      return Math.min(1000, Math.round((result.new_strength - result.strength) * 2000));
    }
  
    // For normal cases, use a more balanced calculation
    // This prevents extreme percentages when original strength is low
    // and gives more weight to improvements at higher strength levels
    const rawImprovement = ((result.new_strength - result.strength) / Math.max(0.1, result.strength)) * 100;
  
    // Apply a logarithmic scale for very large improvements to keep numbers reasonable
    if (rawImprovement > 200) {
      return Math.round(100 + Math.log10(rawImprovement) * 50);
    }
  
    // For smaller improvements, round to nearest 5%
    return Math.round(rawImprovement / 5) * 5;
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* Password Input Section */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Password Strength Analyzer</h2>
          <p className="text-muted-foreground mb-6">
            Enter your password below to analyze its strength and get security recommendations
          </p>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button onClick={handleAnalyze} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <div className="p-6">
              {/* Summary Section */}
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {/* Left: Current Password */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Your Password</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm bg-muted p-2 rounded flex-1 truncate mr-2">
                      {result.original_password}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.original_password)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Strength</span>
                      <span
                        className={cn(
                          "text-sm font-medium px-2 py-0.5 rounded-full",
                          `${getSecurityRating(result.strength).color}/20`,
                          getSecurityRating(result.strength).color,
                        )}
                      >
                        {getSecurityRating(result.strength).label}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full", getSecurityRating(result.strength).bgColor)}
                        style={{ width: `${result.strength * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Time to crack: </span>
                    <span className="text-sm font-medium">
                    {result.time_to_crack.crack_times.dictionary_attack.hours > 1 ? `${result.time_to_crack.crack_times.dictionary_attack.hours} hours` : `${result.time_to_crack.crack_times.dictionary_attack.hours} hours`}
                    </span>
                  </div>
                </div>

                {/* Middle: Improvement */}
                <div className="flex flex-col items-center justify-center px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-primary"
                    >
                      <path
                        d="M5 12H19M19 12L13 6M19 12L13 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm text-muted-foreground">Improvement</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">+{calculateImprovement()}%</div>
                </div>

                {/* Right: Suggested Password */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Suggested Password</h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-mono text-sm bg-primary/5 border border-primary/20 p-2 rounded flex-1 truncate mr-2">
                      {result.suggested_password}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.suggested_password)}>
                      {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Strength</span>
                      <span
                        className={cn(
                          "text-sm font-medium px-2 py-0.5 rounded-full",
                          `${getSecurityRating(result.new_strength).color}/20`,
                          getSecurityRating(result.new_strength).color,
                        )}
                      >
                        {getSecurityRating(result.new_strength).label}
                      </span>
                    </div>
                    <motion.div
                      className="h-2 w-full bg-muted rounded-full overflow-hidden"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        className={cn("h-full", getSecurityRating(result.new_strength).bgColor)}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.new_strength * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      />
                    </motion.div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Time to crack: </span>
                    <span className="text-sm font-medium">
                    {result.new_time_to_crack.crack_times.dictionary_attack.hours > 1 ? `${result.new_time_to_crack.crack_times.dictionary_attack.hours} hours` : `${result.new_time_to_crack.crack_times.dictionary_attack.hours} hours`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Issues & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Vulnerabilities */}
                {result.vulnerabilities_detected.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <h3 className="font-semibold">Security Issues</h3>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                      <ul className="space-y-2">
                        {result.vulnerabilities_detected.map((item, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            className="flex items-start gap-2"
                          >
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Recommendations</h3>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <ul className="space-y-2">
                      {result.improvement_suggestions.map((suggestion, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="flex items-start gap-2"
                        >
                          <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{suggestion}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Visual Comparison */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Security Comparison</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="text-sm">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-sm">Suggested</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/60 rounded-xl p-6 space-y-8 border border-slate-800/80 shadow-lg">
                  {/* Strength comparison */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Password Strength</span>
                      <span className="text-muted-foreground">
                        {Math.round(result.strength * 100)}% → {Math.round(result.new_strength * 100)}%
                      </span>
                    </div>
                    <div className="relative h-10 space-y-2">
                      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-red-400"
                          style={{ width: `${Math.max(5, result.strength * 100)}%` }}
                        />
                      </div>
                      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.max(5, result.new_strength * 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Time to crack comparison (log scale) */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">Time to Crack</span>
                      
                    <div className="relative h-10 space-y-2">
                      {(() => {
                        // Calculate relative strengths for visualization using dictionary attack times
                        const originalMinutes = result.time_to_crack.crack_times.dictionary_attack.hours
                        const suggestedMinutes = result.new_time_to_crack.crack_times.dictionary_attack.hours

                        // Use logarithmic scale with base 10
                        const logOriginal = Math.log10(Math.max(0.1, originalMinutes))
                        const logSuggested = Math.log10(Math.max(0.1, suggestedMinutes))

                        // Set minimum log value to 0 (1 minute)
                        const minLog = 0
                        // Set maximum log value to represent centuries (10^8 minutes ≈ 190 years)
                        const maxLog = 8

                        // Calculate normalized percentages for visualization
                        const normalizedLogOriginal = Math.max(0, (logOriginal - minLog) / (maxLog - minLog))
                        const normalizedLogSuggested = Math.max(0, (logSuggested - minLog) / (maxLog - minLog))

                        // Ensure minimum visible width and cap at 100%
                        const originalPercent = Math.min(100, Math.max(5, normalizedLogOriginal * 100))
                        const suggestedPercent = Math.min(100, Math.max(5, normalizedLogSuggested * 100))

                        return (
                          <>
                            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-400"
                                style={{ width: `${originalPercent}%` }}
                              />
                            </div>
                            <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${suggestedPercent}%` }}
                                transition={{ duration: 0.8, delay: 0.6 }}
                              />
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    
                  </div>

                  {/* Actual time comparison */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <div className="text-xs text-muted-foreground mb-1">Current crack time:</div>
                      <div className="text-sm font-medium text-red-400">
                        {result.time_to_crack.crack_times.dictionary_attack.hours > 1 ? `${result.time_to_crack.crack_times.dictionary_attack.hours} hours` : `${result.time_to_crack.crack_times.dictionary_attack.hours} hours`}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-900/30">
                      <div className="text-xs text-muted-foreground mb-1">Suggested crack time:</div>
                      <div className="text-sm font-medium text-emerald-400">
                      {result.new_time_to_crack.crack_times.dictionary_attack.hours > 1 ? `${result.new_time_to_crack.crack_times.dictionary_attack.hours} hours` : `${result.new_time_to_crack.crack_times.dictionary_attack.hours} hours`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Details Toggle */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showAdvanced ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide Advanced Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show Advanced Details
                    </>
                  )}
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4"
                  >
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Info className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">Estimated Crack Times by Attack Method</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {Object.entries(result.time_to_crack.crack_times).map(([attackType, info], index) => (
                          <div key={attackType} className="p-2 bg-muted/50 rounded border border-border/50">
                            <div className="text-xs font-medium uppercase mb-1">{attackType.replace("_", " ")}</div>
                            <div className="text-xs truncate">
                              {info.hours > 1 ? `${info.hours} hours` : `${info.hours} hours`}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-sm font-medium mb-2">Suggested Password Crack Times</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(result.new_time_to_crack.crack_times).map(([attackType, info], index) => (
                          <div key={attackType} className="p-2 bg-primary/5 rounded border border-primary/20">
                            <div className="text-xs font-medium uppercase mb-1">{attackType.replace("_", " ")}</div>
                            <div className="text-xs truncate">
                              {info.hours > 1 ? `${info.hours} hours` : `${info.hours} hours`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

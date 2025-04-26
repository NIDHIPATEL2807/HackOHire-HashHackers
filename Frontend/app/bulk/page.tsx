"use client"

import { CardContent } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, FileUp, Download, Loader2, FileSpreadsheet, CheckCircle, PieChart } from "lucide-react"
import { Progress } from "@/components/ui/progress"
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

// Add these imports at the top of the file
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"

// Add this constant at the top of the file, after the imports
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function BulkAnalyzer() {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [result, setResult] = useState<{
    analyzed: number
    weak: number
    moderate: number
    strong: number
    downloadUrl: string
    passwordDetails?: Array<{
      password: string
      strength: string
      issues: string
    }>
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Inside the component function, add this line after the existing state declarations
  const { toast } = useToast()

  // Add this state after the other state declarations
  const [retryCount, setRetryCount] = useState(0)

  // Update the handleFileChange function to check file size
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]

      // Check file type
      const fileType = selectedFile.name.split(".").pop()?.toLowerCase()
      if (fileType !== "csv" && fileType !== "xlsx" && fileType !== "xls") {
        setError("Please upload a CSV or Excel file")
        setFile(null)
        e.target.value = ""
        return
      }

      // Check file size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError(`File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
        setFile(null)
        e.target.value = ""
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  // Also update the handleDrop function to check file size
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]

      // Check file type
      const fileType = droppedFile.name.split(".").pop()?.toLowerCase()
      if (fileType !== "csv" && fileType !== "xlsx" && fileType !== "xls") {
        setError("Please upload a CSV or Excel file")
        setFile(null)
        return
      }

      // Check file size
      if (droppedFile.size > MAX_FILE_SIZE) {
        setError(`File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`)
        setFile(null)
        return
      }

      setFile(droppedFile)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Replace the handleAnalyze function with this implementation
  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select a file to analyze")
      return
    }

    setIsLoading(true)
    setError(null)
    setUploadProgress(0)

    // Create form data for file upload
    const formData = new FormData()
    formData.append("file", file)

    // Set maximum retries
    const MAX_RETRIES = 3
    let currentRetry = retryCount

    const attemptUpload = async () => {
      try {
        // Make API call with axios
        const response = await axios.post("http://127.0.0.1:5000/bulk", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        })

        // Reset retry count on success
        setRetryCount(0)

        // Handle successful response
        setResult({
          analyzed: response.data.total_passwords_analyzed,
          weak: response.data.weak_passwords,
          moderate: response.data.moderate_passwords,
          strong: response.data.strong_passwords,
          downloadUrl: response.data.download_link,
          passwordDetails: response.data.password_details || [],
        })

        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${response.data.total_passwords_analyzed} passwords.`,
        })
      } catch (err) {
        console.error("Error analyzing passwords:", err)

        // Check if we should retry
        if (currentRetry < MAX_RETRIES && axios.isAxiosError(err) && (err.code === "ECONNABORTED" || !err.response)) {
          // Network error or timeout, retry
          currentRetry++
          setRetryCount(currentRetry)

          toast({
            title: "Connection issue",
            description: `Retrying upload (${currentRetry}/${MAX_RETRIES})...`,
            variant: "destructive",
          })

          // Wait a bit before retrying
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return attemptUpload()
        }

        // Handle different types of errors
        if (axios.isAxiosError(err)) {
          if (err.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            setError(`Server error: ${err.response.data.message || err.response.statusText || "Unknown error"}`)
          } else if (err.request) {
            // The request was made but no response was received
            setError("No response from server. Please check your connection and try again.")
          } else {
            // Something happened in setting up the request that triggered an Error
            setError(`Error: ${err.message}`)
          }
        } else {
          setError("An unexpected error occurred. Please try again.")
        }
      } finally {
        if (currentRetry === retryCount) {
          // Only set loading to false if we're not retrying
          setIsLoading(false)
        }
      }
    }

    // Start the upload process
    await attemptUpload()
  }

  // Add this function after the handleAnalyze function
  const handleDownloadReport = async () => {
    if (!result || !result.downloadUrl) return

    try {
      // Show loading toast
      toast({
        title: "Preparing download",
        description: "Your report is being prepared...",
      })

      // Download the file
      const response = await axios.get(`http://127.0.0.1:5000${result.downloadUrl}`, {
        responseType: "blob",
      })

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `password-analysis-report-${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)

      toast({
        title: "Download complete",
        description: "Your report has been downloaded successfully.",
      })
    } catch (err) {
      console.error("Error downloading report:", err)
      toast({
        title: "Download failed",
        description: "There was an error downloading your report. Please try again.",
        variant: "destructive",
      })
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
            Bulk Password Analyzer
          </motion.h1>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Analyze multiple passwords at once by uploading a CSV or Excel file
          </motion.p>
        </div>
      </AnimatedSection>

      <AnimatedCard className="mb-8" delay={0.2}>
        <Card>
          <AnimatedCardHeader>
            <AnimatedCardTitle>Upload Password File</AnimatedCardTitle>
            <AnimatedCardDescription>
              Upload a CSV or Excel file containing passwords to analyze in bulk
            </AnimatedCardDescription>
          </AnimatedCardHeader>
          <AnimatedCardContent className="space-y-4">
            <motion.div
              className={`border-2 border-dashed ${
                isDragging ? "border-teal-400" : "border-muted-foreground/25"
              } rounded-lg p-8 text-center hover:border-teal-400/50 transition-colors`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ scale: 1.01 }}
            >
              <input
                type="file"
                id="file-upload"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".csv,.xlsx,.xls"
                disabled={isLoading}
              />
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 }}
                >
                  <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                </motion.div>
                <motion.p
                  className="text-lg font-medium mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  {file ? file.name : isDragging ? "Drop file here" : "Choose a file or drag & drop"}
                </motion.p>
                <motion.p
                  className="text-sm text-muted-foreground mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  Supports CSV and Excel files
                </motion.p>
                <AnimatedButton
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.preventDefault()
                    handleButtonClick()
                  }}
                  delay={0.7}
                >
                  <FileUp className="mr-2 h-4 w-4" />
                  Select File
                </AnimatedButton>
              </label>
            </motion.div>

            <AnimatePresence>
              {file && (
                <motion.div
                  className="flex items-center justify-between p-2 bg-muted rounded"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-5 w-5 mr-2 text-teal-400" />
                    <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setFile(null)} disabled={isLoading}>
                    Remove
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
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
            </AnimatePresence>

            <AnimatedButton onClick={handleAnalyze} disabled={isLoading || !file} className="w-full" delay={0.8}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                "Analyze Passwords"
              )}
            </AnimatedButton>
          </AnimatedCardContent>
          <AnimatedCardFooter>
            <p className="text-sm text-muted-foreground">
              Your file should have one password per row. For best results, include a header row.
            </p>
          </AnimatedCardFooter>
        </Card>
      </AnimatedCard>

      

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <AnimatedCard delay={0.3}>
              <Card>
                <AnimatedCardHeader>
                  <AnimatedCardTitle>Analysis Results</AnimatedCardTitle>
                </AnimatedCardHeader>
                <AnimatedCardContent className="space-y-6">
                  <motion.div
                    className="flex items-center justify-center gap-2 mb-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                    <p className="text-lg font-medium">Successfully analyzed {result.analyzed} passwords</p>
                  </motion.div>

                  <div className="grid grid-cols-3 gap-4">
                    <motion.div
                      className="p-4 bg-red-500/10 rounded-lg text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.p
                        className="text-2xl font-bold text-red-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.8 }}
                      >
                        {result.weak}
                      </motion.p>
                      <p className="text-sm">Weak</p>
                    </motion.div>
                    <motion.div
                      className="p-4 bg-amber-500/10 rounded-lg text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.p
                        className="text-2xl font-bold text-amber-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.9 }}
                      >
                        {result.moderate}
                      </motion.p>
                      <p className="text-sm">Moderate</p>
                    </motion.div>
                    <motion.div
                      className="p-4 bg-emerald-500/10 rounded-lg text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.7 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.p
                        className="text-2xl font-bold text-emerald-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 1.0 }}
                      >
                        {result.strong}
                      </motion.p>
                      <p className="text-sm">Strong</p>
                    </motion.div>
                  </div>

                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <PieChart className="h-40 w-40 text-muted-foreground" />
                  </motion.div>

                  {result.passwordDetails && result.passwordDetails.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1.0 }}
                      className="mt-6 space-y-4"
                    >
                      <h3 className="text-lg font-medium">Password Analysis Details</h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {result.passwordDetails.map((detail, index) => {
                          // Calculate color based on strength
                          const strength = Number.parseFloat(detail.strength)
                          let strengthColor = "text-red-500"
                          if (strength > 0.75) strengthColor = "text-emerald-500"
                          else if (strength > 0.3) strengthColor = "text-amber-500"

                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 1.1 + index * 0.05 }}
                              className="p-4 bg-muted/50 rounded-lg border border-border"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div className="font-mono text-sm bg-background/50 px-2 py-1 rounded">
                                  {detail.password}
                                </div>
                                <div className={`text-sm font-medium ${strengthColor}`}>
                                  Strength: {Math.round(Number.parseFloat(detail.strength) * 100)}%
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground whitespace-pre-line">{detail.issues}</div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                  >
                    <AnimatedButton onClick={handleDownloadReport} delay={1.0}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Detailed Report
                    </AnimatedButton>
                  </motion.div>
                </AnimatedCardContent>
                <AnimatedCardFooter>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.1 }}
                  >
                    <Alert>
                      <AlertTitle>Security Recommendation</AlertTitle>
                      <AlertDescription>
                        We recommend updating all weak passwords immediately. For best security, each account should
                        have a unique, strong password.
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                </AnimatedCardFooter>
              </Card>
            </AnimatedCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// This file contains mock API functions to simulate backend calls

// Simulates password strength analysis
export async function analyzePassword(password: string): Promise<{
  strength: number
  timeToCrack: string
  suggestions: string[]
  vulnerabilities: string[]
  suggestedPassword: string
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simple password strength calculation (for demo purposes)
  let strength = 0
  let timeToCrack = "less than a second"
  const suggestions: string[] = []
  const vulnerabilities: string[] = []

  if (!password) {
    return {
      strength: 0,
      timeToCrack: "instant",
      suggestions: ["Please enter a password"],
      vulnerabilities: ["Empty password"],
      suggestedPassword: "P@ssw0rd!2345",
    }
  }

  // Length check
  if (password.length < 8) {
    strength += 10
    timeToCrack = "instant"
    suggestions.push("Use at least 8 characters")
    vulnerabilities.push("Too short")
  } else if (password.length < 12) {
    strength += 30
    timeToCrack = "a few hours"
    suggestions.push("Consider using 12+ characters")
  } else if (password.length < 16) {
    strength += 50
    timeToCrack = "a few months"
  } else {
    strength += 70
    timeToCrack = "several years"
  }

  // Character variety
  if (/[A-Z]/.test(password)) {
    strength += 5
    if (strength > 30) timeToCrack = "a few years"
  } else {
    suggestions.push("Add uppercase letters")
    vulnerabilities.push("No uppercase letters")
  }

  if (/[a-z]/.test(password)) {
    strength += 5
  } else {
    suggestions.push("Add lowercase letters")
    vulnerabilities.push("No lowercase letters")
  }

  if (/[0-9]/.test(password)) {
    strength += 5
    if (strength > 50) timeToCrack = "decades"
  } else {
    suggestions.push("Add numbers")
    vulnerabilities.push("No numbers")
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    strength += 15
    if (strength > 70) timeToCrack = "centuries"
  } else {
    suggestions.push("Add special characters")
    vulnerabilities.push("No special characters")
  }

  // Common patterns
  if (/123|abc|qwerty|password|admin|welcome/i.test(password)) {
    strength = Math.max(10, strength - 30)
    timeToCrack = "a few minutes"
    suggestions.push("Avoid common patterns and words")
    vulnerabilities.push("Contains common patterns")
  }

  // Cap at 100
  strength = Math.min(100, strength)

  // If no suggestions, add a positive one
  if (suggestions.length === 0) {
    suggestions.push("Excellent password! Consider using a password manager to store it.")
  }

  // Generate a suggested password based on the vulnerabilities
  const suggestedPassword = generateStrongPassword()

  return {
    strength,
    timeToCrack,
    suggestions,
    vulnerabilities,
    suggestedPassword,
  }
}

// Helper function to generate a strong password
function generateStrongPassword(): string {
  const length = 16
  const uppercaseChars = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lowercaseChars = "abcdefghijkmnopqrstuvwxyz"
  const numberChars = "23456789"
  const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?"

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars

  // Ensure at least one of each character type
  let password =
    uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) +
    lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) +
    numberChars.charAt(Math.floor(Math.random() * numberChars.length)) +
    specialChars.charAt(Math.floor(Math.random() * specialChars.length))

  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("")
}

// Simulates paraphrase to password conversion
export async function generatePasswordFromPhrase(phrases: string[]): Promise<{
  password: string
  strength: number
  timeToCrack: string
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  if (!phrases.length) {
    return {
      password: "",
      strength: 0,
      timeToCrack: "instant",
    }
  }

  // Simple algorithm to generate a password from phrases
  let password = ""
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?"

  phrases.forEach((phrase, index) => {
    if (!phrase.trim()) return

    // Take first letter or first two letters
    const firstPart = phrase.length > 3 ? phrase.substring(0, 2) : phrase.substring(0, 1)

    // Add a number based on phrase position
    const number = (index + 1) * 2

    // Add a special character
    const specialChar = specialChars[Math.floor(Math.random() * specialChars.length)]

    // Add to password
    password += firstPart + number + specialChar
  })

  // Analyze the generated password
  const analysis = await analyzePassword(password)

  return {
    password,
    strength: analysis.strength,
    timeToCrack: analysis.timeToCrack,
  }
}

// Simulates bulk password analysis
export async function analyzeBulkPasswords(file: File): Promise<{
  analyzed: number
  weak: number
  moderate: number
  strong: number
  downloadUrl: string
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Mock results
  return {
    analyzed: 100,
    weak: 45,
    moderate: 30,
    strong: 25,
    downloadUrl: "#", // In a real app, this would be a URL to download results
  }
}

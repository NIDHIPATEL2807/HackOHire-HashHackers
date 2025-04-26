import axios, { type AxiosError } from "axios"

/**
 * Formats an error message from an Axios error
 */
export function formatApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const axiosError = err as AxiosError<{ message?: string }>

    if (axiosError.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return `Server error: ${axiosError.response.data?.message || axiosError.response.statusText || "Unknown error"}`
    } else if (axiosError.request) {
      // The request was made but no response was received
      return "No response from server. Please check your connection and try again."
    } else {
      // Something happened in setting up the request that triggered an Error
      return `Error: ${axiosError.message}`
    }
  }

  // For non-Axios errors
  return err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
}

/**
 * Handles API request with retry logic
 */
export async function apiRequestWithRetry<T>(
  requestFn: () => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    onRetry?: (attempt: number, maxRetries: number) => void
  } = {},
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, onRetry } = options
  let attempt = 0

  while (true) {
    try {
      return await requestFn()
    } catch (err) {
      attempt++

      // Don't retry if we've reached max retries or if it's not a network error
      const isNetworkError =
        axios.isAxiosError(err) && (!err.response || err.code === "ECONNABORTED" || err.code === "ERR_NETWORK")

      if (attempt >= maxRetries || !isNetworkError) {
        throw err
      }

      // Notify about retry
      if (onRetry) {
        onRetry(attempt, maxRetries)
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
    }
  }
}

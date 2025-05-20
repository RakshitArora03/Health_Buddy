"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Progress } from "@/components/ui/progress"

export function GlobalLoading() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Start loading
    setIsLoading(true)
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 5
      })
    }, 100)

    // Finish loading after a short delay to simulate page load
    const timeout = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setIsLoading(false)
      }, 200)
    }, 800)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 md:left-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900">
      <div className="w-64 mb-4">
        <Progress value={progress} className="h-2" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
  )
}

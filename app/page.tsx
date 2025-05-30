"use client"

import Link from "next/link"
import { UserRound } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function Home() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <main className="flex-grow flex items-center justify-center bg-gradient-to-tr from-[#dafaf3] to-[#8FC4E3] p-4">
      <div className="w-full max-w-4xl mx-auto text-center space-y-8 sm:space-y-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Welcome to Health Portal</h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {isClient && (
            <>
              <Link href="/login?userType=patient" className="w-full sm:w-auto">
                <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center gap-4 cursor-pointer">
                  {/* <UserRound className="w-8 h-8" /> */}
                  <Image src="/assets/icons/person-266.png" alt="Health Portal" width={40} height={40} />
                  <span className="text-lg font-medium">I am a Patient</span>
                </Card>
              </Link>
              <Link href="/login?userType=doctor" className="w-full sm:w-auto">
                <Card className="p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200 flex flex-col items-center gap-4 cursor-pointer">
                  {/* <UserRound className="w-8 h-8" /> */}
                  <Image src="/assets/icons/doctor-284.png" alt="Health Portal" width={40} height={40} />
                  <span className="text-lg font-medium">I am a Doctor</span>
                </Card>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}


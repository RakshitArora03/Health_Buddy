import type React from "react"
import Navbar from "@/components/patient/navbar"
import { GlobalLoading } from "@/components/global-loading"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="md:ml-64 min-h-screen bg-gradient-to-tr from-[#DAF8FA] to-[#8FC4E3] relative">
        <GlobalLoading />
        {children}
      </main>
    </div>
  )
}

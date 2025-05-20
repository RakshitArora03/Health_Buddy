import type React from "react"
import DoctorNavbar from "@/components/doctor/navbar"
import { Toaster } from "@/components/ui/toaster"
import { GlobalLoading } from "@/components/global-loading"

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#E7F6F6]">
      <DoctorNavbar />
      <main className="md:ml-60 min-h-screen p-4 transition-all duration-300 ease-in-out relative">
        <GlobalLoading />
        {children}
      </main>
      <Toaster />
    </div>
  )
}

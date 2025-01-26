import DoctorNavbar from "@/components/doctor/navbar"
import { Toaster } from "react-hot-toast"

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#E7F6F6]">
      <DoctorNavbar />
      <main className="md:ml-60 min-h-screen p-4 transition-all duration-300 ease-in-out">{children}</main>
      <Toaster position="top-right" />
    </div>
  )
}


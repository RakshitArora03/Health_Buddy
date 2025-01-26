import Navbar from "@/components/patient/navbar"

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}


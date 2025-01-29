"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonalInfo } from "@/components/doctor/profile/PersonalInfo"
import { ProfessionalInfo } from "@/components/doctor/profile/ProfessionalInfo"
import { WorkInfo } from "@/components/doctor/profile/WorkInfo"
import { VerificationDocuments } from "@/components/doctor/profile/VerificationDocuments"
import { AccountSettings } from "@/components/doctor/profile/AccountSettings"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export default function DoctorProfilePage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("personal")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!session) {
    return <div>Loading...</div>
  }

  const tabs = [
    { value: "personal", label: "Personal Info" },
    { value: "professional", label: "Professional Info" },
    { value: "work", label: "Work Info" },
    { value: "verification", label: "Verification Documents" },
    { value: "account", label: "Account Settings" },
  ]

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Doctor Profile</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <SheetTitle>Doctor Profile</SheetTitle>
            <nav className="flex flex-col space-y-2 mt-4">
              {tabs.map((tab) => (
                <Button
                  key={tab.value}
                  variant={activeTab === tab.value ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => {
                    setActiveTab(tab.value)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  {tab.label}
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border-b w-full justify-start rounded-none h-auto p-0 hidden md:flex">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={`px-6 py-3 rounded-none border-b-2 data-[state=active]:border-[#006D5B] data-[state=active]:text-[#006D5B] transition-none`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="personal" className="m-0">
          <PersonalInfo />
        </TabsContent>
        <TabsContent value="professional" className="m-0">
          <ProfessionalInfo />
        </TabsContent>
        <TabsContent value="work" className="m-0">
          <WorkInfo />
        </TabsContent>
        <TabsContent value="verification" className="m-0">
          <VerificationDocuments />
        </TabsContent>
        <TabsContent value="account" className="m-0">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}


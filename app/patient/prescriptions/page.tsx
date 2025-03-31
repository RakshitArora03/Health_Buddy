"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EPrescriptions } from "@/components/patient/EPrescriptions"
import { AnalyzedPrescriptions } from "@/components/patient/AnalyzedPrescriptions"

export default function PrescriptionsPage() {
  const [activeTab, setActiveTab] = useState("e-prescriptions")

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Prescriptions</h1>
      <Tabs defaultValue="e-prescriptions" className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border-b w-full justify-start rounded-none h-auto p-0">
          <TabsTrigger
            value="e-prescriptions"
            className={`px-6 py-3 rounded-none border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 transition-none`}
          >
            E-Prescriptions
          </TabsTrigger>
          <TabsTrigger
            value="analyzed-prescriptions"
            className={`px-6 py-3 rounded-none border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 transition-none`}
          >
            Analyzed Prescriptions
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="e-prescriptions" className="m-0">
            <EPrescriptions />
          </TabsContent>
          <TabsContent value="analyzed-prescriptions" className="m-0">
            <AnalyzedPrescriptions />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}


"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SchedulePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Schedule</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No appointments scheduled. This is a placeholder for the Schedule page.</p>
        </CardContent>
      </Card>
    </div>
  )
}


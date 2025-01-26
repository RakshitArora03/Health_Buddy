"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MessagesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No messages to display. This is a placeholder for the Messages page.</p>
        </CardContent>
      </Card>
    </div>
  )
}


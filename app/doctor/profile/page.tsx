"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"

export default function ProfilePage() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Doctor Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Dr. {session?.user?.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">This is a placeholder for the Doctor's Profile page.</p>
          <p className="mt-2">Email: {session?.user?.email}</p>
        </CardContent>
      </Card>
    </div>
  )
}


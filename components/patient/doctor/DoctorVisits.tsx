import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DoctorVisitsProps {
  doctorId: string
}

export function DoctorVisits({ doctorId }: DoctorVisitsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visit History</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-center py-8">No visits recorded yet.</p>
      </CardContent>
    </Card>
  )
}


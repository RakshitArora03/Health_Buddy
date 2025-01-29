import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PatientVisitsProps {
  patientId: string
}

export function PatientVisits({ patientId }: PatientVisitsProps) {
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


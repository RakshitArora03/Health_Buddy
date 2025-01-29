import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PatientPrescriptionsProps {
  patientId: string
}

export function PatientPrescriptions({ patientId }: PatientPrescriptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 text-center py-8">No prescriptions recorded yet.</p>
      </CardContent>
    </Card>
  )
}


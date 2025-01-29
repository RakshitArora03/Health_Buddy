import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PatientInfoProps {
  patient: {
    dateOfBirth?: string
    gender?: string
    bloodGroup?: string
    height?: string
    weight?: string
    phoneNumber?: string
    address?: string
  }
}

export function PatientInfo({ patient }: PatientInfoProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not provided"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateAge = (dateString?: string) => {
    if (!dateString) return "Not provided"
    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return `${age} years old`
  }

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-3 border-b last:border-b-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow label="Date of birth" value={formatDate(patient.dateOfBirth)} />
          <InfoRow label="Age" value={calculateAge(patient.dateOfBirth)} />
          <InfoRow label="Gender" value={patient.gender || "Not provided"} />
          <InfoRow label="Blood Group" value={patient.bloodGroup || "Not provided"} />
          <InfoRow label="Height" value={patient.height ? `${patient.height} cm` : "Not provided"} />
          <InfoRow label="Weight" value={patient.weight ? `${patient.weight} kg` : "Not provided"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow label="Phone Number" value={patient.phoneNumber || "Not provided"} />
          <InfoRow label="Address" value={patient.address || "Not provided"} />
        </CardContent>
      </Card>
    </div>
  )
}


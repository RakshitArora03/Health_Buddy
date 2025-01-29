import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DoctorInfoProps {
  doctor: {
    qualifications?: string
    experience?: string
    clinicAddress?: string
    consultationHours?: string
  }
}

export function DoctorInfo({ doctor }: DoctorInfoProps) {
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
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow label="Qualifications" value={doctor.qualifications || "Not provided"} />
          <InfoRow label="Experience" value={doctor.experience || "Not provided"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clinic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          <InfoRow label="Clinic Address" value={doctor.clinicAddress || "Not provided"} />
          <InfoRow label="Consultation Hours" value={doctor.consultationHours || "Not provided"} />
        </CardContent>
      </Card>
    </div>
  )
}


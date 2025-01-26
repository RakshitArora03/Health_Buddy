import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PatientDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Welcome to Health Buddy, !</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Health ID Registration Section */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold">Register for Your Health ID</h2>
          <p className="text-gray-600 text-sm">
            Get personalized healthcare services and easy access to your medical records
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Your Health ID is your unique identifier in the healthcare system. It allows you to:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Access your medical records easily</li>
              <li>Share your health information securely with healthcare providers</li>
              <li>Receive personalized health recommendations</li>
              <li>Streamline your healthcare experience</li>
            </ul>
          </div>
          <Button asChild>
            <Link href="/patient/health-id-registration">Register Now</Link>
          </Button>
        </div>

        {/* Analyze Prescription Section */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold">Analyze Prescription</h2>
          <p className="text-gray-600 text-sm">
            Upload and analyze your prescription using our advanced AI.
          </p>
          <Button asChild>
            <Link href="/patient/analyzer">Go to Analyzer</Link>
          </Button>
        </div>

        {/* View History Section */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold">View History</h2>
          <p className="text-gray-600 text-sm">
            Check your past analyses and track your health journey.
          </p>
          <Button asChild>
            <Link href="/patient/history">View History</Link>
          </Button>
        </div>
      </div>

      {/* Quick Tips Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Tips</h2>
        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
          <li>Always consult with a healthcare professional for medical advice.</li>
          <li>Keep your prescriptions organized and easily accessible.</li>
          <li>Regularly update your health information for accurate analysis.</li>
        </ul>
      </div>
    </div>
  )
}


"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import "@/app/styles/card-flip.css"

interface UserDetails {
  fullName: string
  userId: string
  healthBuddyUID: string
  profileImage: string
  phoneNumber: string
  dateOfBirth: string
  gender: string
  height: string
  weight: string
  bloodGroup: string
  healthIdRegistered: boolean
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [downloading, setDownloading] = useState(false)
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [showFront, setShowFront] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/user-details?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched user details:", data)
          if (data && Object.keys(data).length > 0) {
            setUserDetails(data)
          } else {
            setError("Failed to load user details. Please try again.")
          }
        })
        .catch((err) => {
          console.error("Failed to fetch user details:", err)
          setError("An error occurred while fetching user details. Please try again.")
        })
    }
  }, [session])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const frontElement = document.getElementById("id-card-front")
      const backElement = document.getElementById("id-card-back")

      if (frontElement && backElement) {
        // Capture front side
        const frontCanvas = await html2canvas(frontElement, {
          scale: 2,
          useCORS: true,
          logging: false,
        })

        // Create a temporary container for the back side
        const tempContainer = document.createElement("div")
        tempContainer.style.position = "absolute"
        tempContainer.style.left = "-9999px"
        tempContainer.style.width = `${frontElement.offsetWidth}px`
        tempContainer.style.height = `${frontElement.offsetHeight}px`
        document.body.appendChild(tempContainer)

        // Clone the back element and remove the flip transformation
        const clonedBackElement = backElement.cloneNode(true) as HTMLElement
        clonedBackElement.style.transform = "none"
        clonedBackElement.style.position = "static"
        tempContainer.appendChild(clonedBackElement)

        // Capture the temporary back element
        const backCanvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          logging: false,
        })

        // Remove the temporary container
        document.body.removeChild(tempContainer)

        const pdf = new jsPDF("p", "mm", "a4")
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()

        // Add front side to PDF
        const frontImgWidth = pageWidth - 20
        const frontImgHeight = (frontCanvas.height * frontImgWidth) / frontCanvas.width
        pdf.addImage(frontCanvas.toDataURL("image/png"), "PNG", 10, 10, frontImgWidth, frontImgHeight)

        // Add back side to PDF
        const backImgWidth = pageWidth - 20
        const backImgHeight = (backCanvas.height * backImgWidth) / backCanvas.width
        pdf.addImage(backCanvas.toDataURL("image/png"), "PNG", 10, frontImgHeight + 20, backImgWidth, backImgHeight)

        pdf.save("health-buddy-id.pdf")
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      setError("Failed to generate PDF. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  if (!session) {
    router.push("/")
    return null
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (!userDetails || !userDetails.healthIdRegistered) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="p-6">
            <p className="text-center mb-4">You haven't registered your Health ID yet.</p>
            <Button onClick={() => router.push("/patient/health-id-registration")} className="w-full">
              Register Health ID
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-md mx-auto mb-4 card-flip-container">
          <div className={`card-flip ${showFront ? "" : "flipped"}`}>
            <Card className="w-full card-face card-front" id="id-card-front">
              <CardHeader className="text-center bg-primary/10">
                <CardTitle>Health Buddy ID Card</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-4">
                  <Image
                    src={userDetails?.profileImage || "/placeholder.svg"}
                    alt="User Avatar"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h2 className="text-xl font-semibold mb-2">{userDetails?.fullName || "N/A"}</h2>
                <p className="text-gray-500 mb-4">ID: {userDetails?.healthBuddyUID || "N/A"}</p>
              </CardContent>
            </Card>
            <Card className="w-full card-face card-back" id="id-card-back">
              <CardHeader className="text-center bg-primary/10">
                <CardTitle>Health Buddy ID Card</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col justify-center p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p>
                      <strong>Phone:</strong>
                    </p>
                    <p>
                      <strong>Date of Birth:</strong>
                    </p>
                    <p>
                      <strong>Gender:</strong>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>{userDetails.phoneNumber || "N/A"}</p>
                    <p>
                      {userDetails.dateOfBirth
                        ? new Date(userDetails.dateOfBirth).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </p>
                    <p>{userDetails.gender || "N/A"}</p>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <strong>Height:</strong>
                    </p>
                    <p>
                      <strong>Weight:</strong>
                    </p>
                    <p>
                      <strong>Blood Group:</strong>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p>{userDetails.height ? `${userDetails.height} cm` : "N/A"}</p>
                    <p>{userDetails.weight ? `${userDetails.weight} kg` : "N/A"}</p>
                    <p>{userDetails.bloodGroup || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <Button onClick={() => setShowFront(!showFront)} className="flex-1" variant="outline">
            {showFront ? "Show Back" : "Show Front"}
          </Button>
          <Button onClick={handleDownload} disabled={downloading} className="flex-1">
            {downloading ? "Downloading..." : "Download ID Card (PDF)"}
          </Button>
        </div>
      </div>
    </div>
  )
}


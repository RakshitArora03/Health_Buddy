"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { Trash2, Upload } from "lucide-react"

interface VerificationDocuments {
  medicalLicenseCertificate: string | null
  degreeCertificate: string | null
  additionalCertifications: string[]
}

const fetchVerificationDocuments = async (setIsLoading, setDocuments) => {
  try {
    setIsLoading(true)
    const response = await fetch("/api/doctor/verification-documents")
    if (response.ok) {
      const data = await response.json()
      setDocuments(data)
    } else {
      throw new Error("Failed to fetch verification documents")
    }
  } catch (error) {
    console.error("Error fetching verification documents:", error)
    toast.error("Failed to load verification documents")
  } finally {
    setIsLoading(false)
  }
}

export function VerificationDocuments() {
  const { data: session } = useSession()
  const [documents, setDocuments] = useState<VerificationDocuments>({
    medicalLicenseCertificate: null,
    degreeCertificate: null,
    additionalCertifications: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchVerificationDocuments(setIsLoading, setDocuments)
    }
  }, [session])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("documentType", documentType)

      try {
        const response = await fetch("/api/doctor/verification-documents", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setDocuments((prev) => ({
            ...prev,
            [documentType]:
              documentType === "additionalCertifications" ? [...prev.additionalCertifications, data.path] : data.path,
          }))
          toast.success("Document uploaded successfully")
        } else {
          throw new Error("Failed to upload document")
        }
      } catch (error) {
        console.error("Error uploading document:", error)
        toast.error("Failed to upload document")
      }
    }
  }

  const handleDeleteDocument = async (documentType: string, documentPath: string) => {
    try {
      const response = await fetch(
        `/api/doctor/verification-documents?documentType=${documentType}&documentPath=${documentPath}`,
        {
          method: "DELETE",
        },
      )

      if (response.ok) {
        setDocuments((prev) => ({
          ...prev,
          [documentType]:
            documentType === "additionalCertifications"
              ? prev.additionalCertifications.filter((path) => path !== documentPath)
              : null,
        }))
        toast.success("Document deleted successfully")
      } else {
        throw new Error("Failed to delete document")
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      toast.error("Failed to delete document")
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="medicalLicense">Medical License Certificate</Label>
          <div className="flex items-center mt-2">
            <Input
              id="medicalLicense"
              type="file"
              onChange={(e) => handleFileUpload(e, "medicalLicenseCertificate")}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            <Label
              htmlFor="medicalLicense"
              className="cursor-pointer flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Label>
            {documents.medicalLicenseCertificate && (
              <div className="ml-4 flex items-center">
                <a
                  href={documents.medicalLicenseCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Document
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleDeleteDocument("medicalLicenseCertificate", documents.medicalLicenseCertificate!)
                  }
                  className="ml-2"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="degreeCertificate">Degree Certificate</Label>
          <div className="flex items-center mt-2">
            <Input
              id="degreeCertificate"
              type="file"
              onChange={(e) => handleFileUpload(e, "degreeCertificate")}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            <Label
              htmlFor="degreeCertificate"
              className="cursor-pointer flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Label>
            {documents.degreeCertificate && (
              <div className="ml-4 flex items-center">
                <a
                  href={documents.degreeCertificate}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Document
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDocument("degreeCertificate", documents.degreeCertificate!)}
                  className="ml-2"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="additionalCertifications">Additional Certifications</Label>
          <div className="flex items-center mt-2">
            <Input
              id="additionalCertifications"
              type="file"
              onChange={(e) => handleFileUpload(e, "additionalCertifications")}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            <Label
              htmlFor="additionalCertifications"
              className="cursor-pointer flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Label>
          </div>
          {documents.additionalCertifications.length > 0 && (
            <div className="mt-4 space-y-2">
              {documents.additionalCertifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <a href={cert} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Additional Certification {index + 1}
                  </a>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteDocument("additionalCertifications", cert)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


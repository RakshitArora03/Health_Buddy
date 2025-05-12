"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"

interface AppointmentRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AppointmentRequestModal({ isOpen, onClose, onSuccess }: AppointmentRequestModalProps) {
  const [doctors, setDoctors] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  // Get tomorrow's date as a string in YYYY-MM-DD format for min date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowString = tomorrow.toISOString().split("T")[0]

  // Get date 3 months from now for max date
  const threeMonthsLater = new Date()
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)
  const threeMonthsLaterString = threeMonthsLater.toISOString().split("T")[0]

  // Fetch patient's associated doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        // Use the patient/doctors endpoint to get associated doctors
        const response = await fetch("/api/patient/doctors")
        if (response.ok) {
          const data = await response.json()
          setDoctors(data)
        }
      } catch (error) {
        console.error("Error fetching doctors:", error)
        toast({
          title: "Error",
          description: "Failed to load your doctors. Please try again.",
          variant: "destructive",
        })
      }
    }

    if (isOpen) {
      fetchDoctors()
    }
  }, [isOpen, toast])

  // Form schema
  const appointmentFormSchema = z.object({
    doctorId: z.string({
      required_error: "Please select a doctor",
    }),
    date: z.string({
      required_error: "Please select a date",
    }),
    time: z.string({
      required_error: "Please select a time",
    }),
    consultationType: z.enum(["online", "in-person"], {
      required_error: "Please select a consultation type",
    }),
    reason: z.string().min(5, {
      message: "Reason must be at least 5 characters",
    }),
    paymentMethod: z.string({
      required_error: "Please select a payment method",
    }),
    notes: z.string().optional(),
  })

  type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

  // Initialize form with default values
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      date: "",
      time: "",
      notes: "",
    },
  })

  // Handle form submission
  const onSubmit = async (data: AppointmentFormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        // Get doctor name for the toast message
        const selectedDoctor = doctors.find((doctor) => doctor.id === data.doctorId)
        const doctorName = selectedDoctor ? selectedDoctor.name : "the doctor"

        toast({
          title: "Appointment Requested",
          description: `Your appointment with Dr. ${doctorName} has been requested successfully. You'll be notified when the doctor confirms.`,
          variant: "default",
        })
        onClose()
        if (onSuccess) onSuccess()
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to request appointment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request an Appointment</DialogTitle>
          <DialogDescription>Fill in the details below to request an appointment with a doctor.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Doctor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors.length > 0 ? (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name} {doctor.specialization ? `- ${doctor.specialization}` : ""}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-doctors" disabled>
                          No doctors available. Add doctors from the Doctors page.
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={tomorrowString}
                        max={threeMonthsLaterString}
                        placeholder="DD-MM-YYYY"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Select a date within the next 3 months</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Time</FormLabel>
                    <FormControl>
                      <Input type="time" min="09:00" max="17:00" step="1800" {...field} />
                    </FormControl>
                    <FormDescription>Select a time between 9:00 AM and 5:00 PM</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="consultationType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Consultation Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="online" />
                        </FormControl>
                        <FormLabel className="font-normal">Online Consultation</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="in-person" />
                        </FormControl>
                        <FormLabel className="font-normal">In-Person Visit</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Appointment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your symptoms or reason for the appointment"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="credit-card">Credit Card</SelectItem>
                      <SelectItem value="debit-card">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information you'd like to provide"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Request Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


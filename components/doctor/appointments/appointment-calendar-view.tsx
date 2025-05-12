"use client"

import { useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface AppointmentCalendarViewProps {
  appointments: any[]
}

export function AppointmentCalendarView({ appointments }: AppointmentCalendarViewProps) {
  const [view, setView] = useState("month")

  // Transform appointments for the calendar
  const events = appointments.map((appointment) => {
    // Ensure we have a valid date object
    const startDate = new Date(appointment.date)

    // Parse the time string and set it on the date
    if (appointment.time) {
      const [hours, minutes] = appointment.time.replace(/\s/g, "").replace(/AM|PM/i, "").split(":").map(Number)

      const isPM = /PM/i.test(appointment.time)

      startDate.setHours(isPM && hours < 12 ? hours + 12 : hours, minutes || 0, 0, 0)
    }

    // Create end time (30 minutes after start)
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + 30)

    return {
      id: appointment._id || appointment.id,
      title: `${appointment.patientName || "Patient"} - ${appointment.type === "online" ? "Online" : "In-Person"}`,
      start: startDate,
      end: endDate,
      status: appointment.status,
      resource: appointment,
    }
  })

  // Custom event styling based on status
  const eventStyleGetter = (event: any) => {
    let backgroundColor = "#3182ce" // Default blue

    switch (event.status) {
      case "confirmed":
        backgroundColor = "#10b981" // Green
        break
      case "pending":
        backgroundColor = "#f59e0b" // Yellow
        break
      case "cancelled":
        backgroundColor = "#ef4444" // Red
        break
      case "completed":
        backgroundColor = "#6366f1" // Indigo
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        color: "white",
        border: "none",
        display: "block",
      },
    }
  }

  // Custom event component with tooltip
  const EventComponent = ({ event }: { event: any }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="h-full w-full p-1 overflow-hidden text-ellipsis whitespace-nowrap">{event.title}</div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="p-2">
            <p className="font-semibold">{event.title}</p>
            <p>
              Time: {moment(event.start).format("h:mm A")} - {moment(event.end).format("h:mm A")}
            </p>
            <p>Status: {event.status.charAt(0).toUpperCase() + event.status.slice(1)}</p>
            {event.resource.reason && <p>Reason: {event.resource.reason}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  // Custom toolbar to add status legend
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 p-2 gap-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="text-lg font-semibold">{label}</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onNavigate("TODAY")}
              className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onNavigate("PREV")}
              className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => onNavigate("NEXT")}
              className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Next
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-green-500">Confirmed</Badge>
          <Badge className="bg-yellow-500">Pending</Badge>
          <Badge className="bg-red-500">Cancelled</Badge>
          <Badge className="bg-indigo-500">Completed</Badge>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div style={{ height: 700 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["month", "week", "day"]}
            defaultView="month"
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
              event: EventComponent,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}


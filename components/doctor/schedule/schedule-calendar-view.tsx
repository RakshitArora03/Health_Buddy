"use client"

import { useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface ScheduleCalendarViewProps {
  appointments: any[]
  onAppointmentClick: (appointment: any) => void
}

export function ScheduleCalendarView({ appointments, onAppointmentClick }: ScheduleCalendarViewProps) {
  const [view, setView] = useState("month")

  // Transform appointments for the calendar
  const events = appointments.map((appointment) => ({
    id: appointment.id,
    title: `${appointment.patientName} - ${appointment.type === "online" ? "Online" : "In-Person"}`,
    start: new Date(`${appointment.date}T${appointment.time.replace(/\s/g, "")}`),
    end: new Date(new Date(`${appointment.date}T${appointment.time.replace(/\s/g, "")}`).getTime() + 30 * 60000), // Add 30 minutes
    status: appointment.status,
    resource: appointment,
  }))

  // Custom event styling based on status
  const eventStyleGetter = (event: any) => {
    const style = {
      backgroundColor: "#3182ce", // Default blue
      borderRadius: "4px",
      color: "white",
      border: "none",
      display: "block",
    }

    switch (event.status) {
      case "confirmed":
        style.backgroundColor = "#10b981" // Green
        break
      case "pending":
        style.backgroundColor = "#f59e0b" // Yellow
        break
      case "cancelled":
        style.backgroundColor = "#ef4444" // Red
        break
      case "completed":
        style.backgroundColor = "#6366f1" // Indigo
        break
    }

    return {
      style,
    }
  }

  // Custom toolbar to add status legend
  const CustomToolbar = ({ label, onView, onNavigate, views }: any) => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 p-2">
        <div className="mb-4 sm:mb-0">
          <div className="text-lg font-semibold">{label}</div>
          <div className="flex flex-wrap gap-2 mt-2">
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

        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            {views.map((name: string) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onView(name)
                  setView(name)
                }}
                className={`px-3 py-1 text-sm rounded-md ${
                  view === name ? "bg-[#006D5B] text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge className="bg-green-500">Confirmed</Badge>
            <Badge className="bg-yellow-500">Pending</Badge>
            <Badge className="bg-red-500">Cancelled</Badge>
            <Badge className="bg-indigo-500">Completed</Badge>
          </div>
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
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
            onSelectEvent={(event) => onAppointmentClick(event.resource)}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}


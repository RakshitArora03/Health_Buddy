"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HomeIcon as House } from "lucide-react"

export default function DoctorDashboard() {
  const { data: session } = useSession()
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.toLocaleString("default", { month: "long" }))
  const [calendarDates, setCalendarDates] = useState<Date[]>([])

  // Calculate calendar dates for the current week
  useEffect(() => {
    const today = new Date()
    const currentDay = today.getDay()
    const dates = []

    const sunday = new Date(today)
    sunday.setDate(today.getDate() - currentDay)

    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday)
      date.setDate(sunday.getDate() + i)
      dates.push(date)
    }

    setCalendarDates(dates)
  }, [])

  const SectionHeader = ({ title, children, href }: { title: string; children?: React.ReactNode; href: string }) => (
    <div className="bg-[#006D5B] text-white p-4 rounded-lg mb-2 flex justify-between items-center">
      <Link href={href} className="text-xl font-semibold hover:underline">
        {title}
      </Link>
      {children}
    </div>
  )

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - 60% */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Banner */}
          <Card className="bg-[#006D5B] text-white pt-4 pr-4 pb-0 pl-4 md:pt-2 md:pr-6 md:pb-0 md:pl-6 relative overflow-hidden ">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="z-10 mb-4 md:mb-0">
                <div className="flex items-center space-x-2 text-sm">
                  <House className="w-6 h-6 text-white" />
                  <span>
                    {currentDate.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <h1 className="text-2xl font-bold mt-2">Good Day, Dr {session?.user?.name}!</h1>
                <p className="mt-1">Have a Nice Day!</p>
              </div>
              <div className="relative w-full md:w-1/3 h-32 md:h-40">
                <Image
                  src="/assets/images/doctor-illustration.png"
                  alt="Doctor"
                  layout="fill"
                  objectFit="contain"
                  objectPosition="right bottom"
                />
              </div>
            </div>
          </Card>

          {/* Today's Appointments */}
          <div>
            <SectionHeader title="Today's Appointments" href="/doctor/schedule">
              {/* Add any additional header content here if needed */}
            </SectionHeader>
            <Card className="p-4">
              <div className="text-center py-8">
                <p className="text-gray-500">No appointments scheduled for today</p>
              </div>
            </Card>
          </div>

          {/* Appointment Requests */}
          <div>
            <SectionHeader title="Appointment Requests" href="/doctor/messages">
              {/* Add any additional header content here if needed */}
            </SectionHeader>
            <Card className="p-4">
              <div className="text-center py-8">
                <p className="text-gray-500">No pending appointment requests</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column - 40% */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Profile */}
          <div>
            <SectionHeader title="My Profile" href="/doctor/profile">
              {/* Add any additional header content here if needed */}
            </SectionHeader>
            <Card className="p-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center space-x-6 mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      src="/assets/icons/profile-placeholder.png"
                      alt="Doctor Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Dr. {session?.user?.name}</h3>
                    <p className="text-gray-500">Cardiologist</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full text-center text-sm">
                  <div>
                    <p className="text-gray-500">Date Of Birth</p>
                    <p className="font-medium">--/--/--</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Blood</p>
                    <p className="font-medium">--</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Working Hours</p>
                    <p className="font-medium">--:-- - --:--</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* My Calendar */}
          <div>
            <SectionHeader title="My Calendar" href="/doctor/schedule">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[120px] bg-white/10 border-0 text-white">
                  <SelectValue>{selectedMonth}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SectionHeader>
            <Card className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {/* Day headers */}
                {days.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600">
                    {day}
                  </div>
                ))}
                {/* Date cells */}
                {calendarDates.map((date, index) => (
                  <div
                    key={index}
                    className={`
                      text-center p-2 rounded-lg text-sm
                      ${date.toDateString() === new Date().toDateString() ? "bg-[#006D5B] text-white" : "bg-gray-100"}
                    `}
                  >
                    {date.getDate()}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Next Patient Details */}
          <div>
            <SectionHeader title="Next Patient Details" href="/doctor/patients">
              {/* Add any additional header content here if needed */}
            </SectionHeader>
            <Card className="p-4">
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming patients scheduled</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}


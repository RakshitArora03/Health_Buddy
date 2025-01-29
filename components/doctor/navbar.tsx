"use client"

import { useState } from "react"
import { LayoutDashboard, Users, Calendar, MessageSquare, UserCircle, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import Image from "next/image"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export default function DoctorNavbar() {
  const [showLogoutDialog, setShowLogoutDialog] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className={`w-full justify-start text-white hover:bg-white/10 ${pathname === href ? "bg-white/10" : ""}`}
      asChild
      onClick={() => setIsMobileMenuOpen(false)}
    >
      <Link href={href}>
        <Icon className="h-5 w-5 shrink-0" />
        <span className="ml-2">{children}</span>
      </Link>
    </Button>
  )

  return (
    <>
      <nav className="bg-[#006D5B] text-white">
        {/* Mobile navbar */}
        <div className="md:hidden flex justify-between items-center p-4 bg-[#006D5B] text-white">
          <div className="text-lg font-bold">Health Buddy</div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px] bg-[#006D5B] text-white">
              <SheetTitle asChild>
                <div className="flex flex-col items-center space-y-2 px-6 mb-8">
                  <Image src="/assets/images/logo.png" alt="Health Buddy" width={40} height={40} />
                  <span className="font-bold text-lg">Health Buddy</span>
                </div>
              </SheetTitle>
              <nav className="space-y-2 px-4">
                <NavLink href="/doctor/dashboard" icon={LayoutDashboard}>
                  Dashboard
                </NavLink>
                <NavLink href="/doctor/patients" icon={Users}>
                  Patients
                </NavLink>
                <NavLink href="/doctor/schedule" icon={Calendar}>
                  Schedule
                </NavLink>
                <NavLink href="/doctor/messages" icon={MessageSquare}>
                  Messages
                </NavLink>
                <NavLink href="/doctor/profile" icon={UserCircle}>
                  Profile
                </NavLink>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowLogoutDialog(true)
                  }}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span className="ml-2">Logout</span>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col fixed h-full w-60 overflow-y-auto bg-[#006D5B] py-4 transition-all duration-300 ease-in-out">
          <div className="flex flex-col items-center space-y-2 px-6 mb-8">
            <Image src="/assets/images/logo.png" alt="Health Buddy" width={40} height={40} />
            <span className="font-bold text-lg">Health Buddy</span>
          </div>
          <nav className="space-y-2 px-4">
            <NavLink href="/doctor/dashboard" icon={LayoutDashboard}>
              Dashboard
            </NavLink>
            <NavLink href="/doctor/patients" icon={Users}>
              Patients
            </NavLink>
            <NavLink href="/doctor/schedule" icon={Calendar}>
              Schedule
            </NavLink>
            <NavLink href="/doctor/messages" icon={MessageSquare}>
              Messages
            </NavLink>
            <NavLink href="/doctor/profile" icon={UserCircle}>
              Profile
            </NavLink>
          </nav>
          <Button
            variant="ghost"
            className="mt-8 mx-4 text-white hover:bg-white/10 justify-start"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="ml-2">Logout</span>
          </Button>
        </aside>
      </nav>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>This action will end your current session.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Home,
  User,
  Search,
  LogOut,
  Menu,
  X,
  UserPlus,
  UserIcon as UserMd,
  FileText,
  MessageSquare,
  Clipboard,
  Calendar,
} from "lucide-react"
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
import { signOut, useSession } from "next-auth/react"

export default function Navbar() {
  const [showLogoutDialog, setShowLogoutDialog] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [userDetails, setUserDetails] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/user-details?email=${session.user.email}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Fetched user details:", data)
          setUserDetails(data)
        })
        .catch((err) => console.error("Failed to fetch user details:", err))
    }
  }, [session])

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const NavLink = ({
    href,
    icon: Icon,
    children,
    onClick,
  }: { href: string; icon: any; children: React.ReactNode; onClick?: (e: React.MouseEvent) => void }) => (
    <Button
      variant={pathname === href ? "secondary" : "ghost"}
      className={`w-full justify-start ${pathname === href ? "bg-white text-[#1A75BC]" : "text-white hover:bg-white hover:text-[#1A75BC]"}`}
      asChild
      onClick={(e) => {
        setIsMobileMenuOpen(false)
        onClick && onClick(e)
      }}
    >
      <Link href={href}>
        <Icon className="mr-2 h-4 w-4" />
        {children}
      </Link>
    </Button>
  )

  return (
    <>
      <nav className="bg-[#1A75BC] text-white">
        {/* Mobile menu button */}
        <div className="md:hidden flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold">HEALTH BUDDY</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Desktop sidebar */}
        <aside className="hidden md:block fixed h-full w-64 p-4 overflow-y-auto bg-[#1A75BC]">
          <h1 className="text-2xl font-bold mb-8 pt-4">HEALTH BUDDY</h1>
          <nav className="space-y-4">
            <NavLink href="/patient/dashboard" icon={Home}>
              Home
            </NavLink>
            <NavLink href="/patient/profile" icon={User}>
              Profile
            </NavLink>
            <NavLink href="/patient/doctors" icon={UserMd}>
              Doctors
            </NavLink>
            <NavLink href="/patient/analyzer" icon={Search}>
              Analyzer
            </NavLink>
            <NavLink href="/patient/prescriptions" icon={FileText}>
              Prescriptions
            </NavLink>
            <NavLink href="/patient/messages" icon={MessageSquare}>
              Messages
            </NavLink>
            <NavLink href="/patient/appointments" icon={Calendar}>
              Appointments
            </NavLink>
            <NavLink href="/patient/notes" icon={Clipboard}>
              Notes
            </NavLink>
            {!userDetails?.healthIdRegistered && (
              <NavLink href="/patient/health-id-registration" icon={UserPlus}>
                Health ID Registration
              </NavLink>
            )}
          </nav>
          <Button
            variant="ghost"
            className="w-full justify-start mt-8 text-white hover:bg-white hover:text-[#1A75BC]"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </aside>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-[#1A75BC] z-50">
            <div className="flex justify-between items-center p-4">
              <h1 className="text-2xl font-bold">HEALTH BUDDY</h1>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="space-y-4 p-4">
              <NavLink href="/patient/dashboard" icon={Home}>
                Home
              </NavLink>
              <NavLink href="/patient/profile" icon={User}>
                Profile
              </NavLink>
              <NavLink href="/patient/doctors" icon={UserMd}>
                Doctors
              </NavLink>
              <NavLink href="/patient/analyzer" icon={Search}>
                Analyzer
              </NavLink>
              <NavLink href="/patient/prescriptions" icon={FileText}>
                Prescriptions
              </NavLink>
              <NavLink href="/patient/messages" icon={MessageSquare}>
                Messages
              </NavLink>
              <NavLink href="/patient/appointments" icon={Calendar}>
                Appointments
              </NavLink>
              <NavLink href="/patient/notes" icon={Clipboard}>
                Notes
              </NavLink>
              {!userDetails?.healthIdRegistered && (
                <NavLink href="/patient/health-id-registration" icon={UserPlus}>
                  Health ID Registration
                </NavLink>
              )}
              <Button
                variant="ghost"
                className="w-full justify-start text-white hover:bg-white hover:text-[#1A75BC]"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setShowLogoutDialog(true)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        )}
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
            <AlertDialogAction className="bg-red-600 hover:bg-red-400" onClick={handleLogout}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


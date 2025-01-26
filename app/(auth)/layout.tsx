export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-r from-blue-50 to-green-50 p-4">
      {children}
    </div>
  )
}


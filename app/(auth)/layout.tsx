export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-grow flex items-center justify-center bg-gradient-to-tr from-[#dafaf3] to-[#8FC4E3] p-4">
      {children}
    </div>
  )
}


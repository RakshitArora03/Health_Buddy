import "@/app/globals.css"
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Health Portal - Medical ePrescription Platform",
  description: "A modern medical ePrescription platform for doctors and patients",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}


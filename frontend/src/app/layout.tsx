import { AuthProvider } from '@/contexts/AuthContext'
import { TenantProvider } from '@/contexts/TenantContext'
import './globals.css'

// Force dynamic rendering & disable static caches across the app
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export const metadata = {
  title: 'HelixBridge - Enterprise Workforce Management',
  description: 'Connecting Enterprise Operations Through Intelligent Workforce Management',
  icons: {
    icon: '/helix-icon.png',
    shortcut: '/helix-icon.png',
    apple: '/helix-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <TenantProvider>
            {children}
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

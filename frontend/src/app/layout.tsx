import { AuthProvider } from '@/contexts/AuthContext'
import { TenantProvider } from '@/contexts/TenantContext'
import './globals.css'

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
    <html lang="en">
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


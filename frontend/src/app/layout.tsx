// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TenantProvider } from '@/contexts/TenantContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ETLA Platform',
  description: 'Enterprise payroll and HR management platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TenantProvider>
          {children}
        </TenantProvider>
      </body>
    </html>
  )
}


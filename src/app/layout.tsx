import { SupabaseListener } from '@/components/supabase/supabase-listener'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { Manrope, Roboto_Mono } from 'next/font/google'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-brand',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DocForge - AI-Powered Documentation Generator',
  description: 'Automatically generate comprehensive documentation for your software projects',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const [{ data: sessionResponse }, { data: userResponse }] = await Promise.all([
    supabase.auth.getSession(),
    supabase.auth.getUser(),
  ])

  const session = userResponse.user ? sessionResponse.session : null

  return (
    <html lang="en" className={`${manrope.variable} ${robotoMono.variable}`}>
      <body className="bg-background text-foreground antialiased">
        <SupabaseListener session={session} />
        {children}
      </body>
    </html>
  )
}


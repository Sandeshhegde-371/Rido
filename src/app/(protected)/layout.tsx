import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { BookOpen, Calendar, CreditCard, LayoutDashboard, LogOut, User } from 'lucide-react'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const cookieStore = await cookies()
  const sessionId = cookieStore.get('rido_session_id')?.value

  // Single session enforcement
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_session_id')
    .eq('id', user.id)
    .single()

  if (profile?.active_session_id && profile.active_session_id !== sessionId) {
    redirect('/login?error=Your account has been logged in elsewhere')
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="p-6 border-b border-border/50">
          <Link href="/dashboard" className="text-2xl font-bold text-primary tracking-tight">
            Rido.
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/library" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
            <BookOpen size={20} />
            <span className="font-medium">Library</span>
          </Link>
          <Link href="/purchases" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
            <CreditCard size={20} />
            <span className="font-medium">Purchases</span>
          </Link>
          <Link href="/bookings" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
            <Calendar size={20} />
            <span className="font-medium">Bookings</span>
          </Link>
          <Link href="/profile" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
            <User size={20} />
            <span className="font-medium">Profile</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-border/50">
          <form action={logout}>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center px-6 md:hidden">
          <Link href="/dashboard" className="text-xl font-bold text-primary tracking-tight">
            Rido.
          </Link>
          <div className="ml-auto">
            {/* Mobile menu toggle would go here */}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          {/* Subtle gradient background for main content */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl -z-10" />
          {children}
        </div>
      </main>
    </div>
  )
}

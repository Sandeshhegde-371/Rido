import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { BookOpen, Calendar, CreditCard, LayoutDashboard, LogOut, User, Shield, Menu } from 'lucide-react'

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
    .select('active_session_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.active_session_id && profile.active_session_id !== sessionId) {
    redirect('/login?error=Your account has been logged in elsewhere')
  }

  const NavLinks = () => (
    <>
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
      {profile?.role === 'admin' && (
        <div className="pt-4 mt-4 border-t border-border/50">
          <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Shield size={20} />
            <span className="font-medium">Admin Portal</span>
          </Link>
        </div>
      )}
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/50 backdrop-blur-xl flex-col hidden md:flex">
        <div className="p-6 border-b border-border/50">
          <Link href="/dashboard" className="text-2xl font-bold text-primary tracking-tight">
            Rido.
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLinks />
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
            <Sheet>
              <SheetTrigger className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl">
                  <div className="p-6 border-b border-border/50">
                    <span className="text-2xl font-bold text-primary tracking-tight">Rido.</span>
                  </div>
                  <nav className="flex-1 p-4 space-y-2">
                    <NavLinks />
                  </nav>
                  <div className="p-4 border-t border-border/50">
                    <form action={logout}>
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </form>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl -z-10" />
          {children}
        </div>
      </main>
    </div>
  )
}

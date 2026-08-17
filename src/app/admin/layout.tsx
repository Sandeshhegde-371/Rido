import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { LayoutDashboard, Users, BookOpen, CreditCard, LogOut, Video, Bell, Settings as SettingsIcon, Package, Menu } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard') // Redirect non-admins to student dashboard
  }

  const NavLinks = () => (
    <>
      <Link href="/admin" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
        <LayoutDashboard size={20} />
        <span className="font-medium">Overview</span>
      </Link>
      <Link href="/admin/resources" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
        <BookOpen size={20} />
        <span className="font-medium">Resources</span>
      </Link>
      <Link href="/admin/bundles" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
        <Package size={20} />
        <span className="font-medium">Bundles</span>
      </Link>
      <Link href="/admin/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
        <Users size={20} />
        <span className="font-medium">Users</span>
      </Link>
      <Link href="/admin/payments" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
        <CreditCard size={20} />
        <span className="font-medium">Payments</span>
      </Link>
      <Link href="/admin/mentorship" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
        <Video size={20} />
        <span className="font-medium">Mentorship</span>
      </Link>
      <Link href="/admin/notifications" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
        <Bell size={20} />
        <span className="font-medium">Notifications</span>
      </Link>
      <Link href="/admin/settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-foreground hover:text-primary transition-colors">
        <SettingsIcon size={20} />
        <span className="font-medium">Settings</span>
      </Link>
      
      <div className="pt-4 mt-4 border-t border-border/50">
        <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors shadow-sm">
          <LayoutDashboard size={20} />
          <span className="font-medium">Student Portal</span>
        </Link>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/80 backdrop-blur-xl flex-col hidden md:flex">
        <div className="p-6 border-b border-border/50">
          <Link href="/admin" className="text-2xl font-bold text-primary tracking-tight">
            Rido Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-border/50">
          <form action={logout}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-md flex items-center px-6 md:hidden">
          <Link href="/admin" className="text-xl font-bold text-primary tracking-tight">
            Rido Admin
          </Link>
          <div className="ml-auto">
            <Sheet>
              <SheetTrigger className="md:hidden p-2 rounded-md hover:bg-accent hover:text-accent-foreground">
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full bg-card/80 backdrop-blur-xl">
                  <div className="p-6 border-b border-border/50">
                    <span className="text-2xl font-bold text-primary tracking-tight">Rido Admin</span>
                  </div>
                  <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavLinks />
                  </nav>
                  <div className="p-4 border-t border-border/50">
                    <form action={logout}>
                      <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10">
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

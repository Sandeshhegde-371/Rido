import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toggleUserStatus, toggleAdminRole } from '@/app/actions/users'
import { Search, UserX, UserCheck, Shield, ShieldAlert, Calendar } from 'lucide-react'

export default async function AdminUsersPage(props: { searchParams: Promise<{ q?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const query = searchParams?.q || ''

  let dbQuery = supabase.from('profiles').select('*').order('created_at', { ascending: false })
  
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
  }

  const { data: users } = await dbQuery

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage access, roles, and platform users.</p>
        </div>
      </div>

      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
          <CardDescription>View and manage all registered users.</CardDescription>
          <div className="mt-4">
            <form className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input name="q" placeholder="Search by name or email..." defaultValue={query} className="pl-9 bg-background/50" />
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden bg-card/30">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users?.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{user.name || 'No Name'}</div>
                      <div className="text-muted-foreground text-xs">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3 mr-1" /> : <ShieldAlert className="w-3 h-3 mr-1" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_disabled ? (
                        <span className="text-destructive text-xs font-medium bg-destructive/10 px-2 py-1 rounded-full">Disabled</span>
                      ) : (
                        <span className="text-green-500 text-xs font-medium bg-green-500/10 px-2 py-1 rounded-full">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <form action={async () => { 'use server'; await toggleUserStatus(user.id, user.is_disabled || false) }} className="inline-block">
                        <Button variant={user.is_disabled ? "outline" : "destructive"} size="sm" className="h-8">
                          {user.is_disabled ? <><UserCheck className="w-3 h-3 mr-1" /> Enable</> : <><UserX className="w-3 h-3 mr-1" /> Disable</>}
                        </Button>
                      </form>
                      <form action={async () => { 'use server'; await toggleAdminRole(user.id, user.role) }} className="inline-block">
                        <Button variant="outline" size="sm" className="h-8">
                          {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </Button>
                      </form>
                    </td>
                  </tr>
                ))}
                {users?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

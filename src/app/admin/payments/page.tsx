import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { grantAccess, revokeAccess, refundAccess } from '@/app/actions/payments'
import { IndianRupee, CheckCircle, XCircle, Clock } from 'lucide-react'

export default async function PaymentsPage() {
  const supabase = await createClient()
  
  // Fetch Purchases
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, profiles(email, name), plans(name), resources(title)')
    .order('created_at', { ascending: false })

  // Fetch Options for Grant UI
  const { data: plans } = await supabase.from('plans').select('*')
  const { data: resources } = await supabase.from('resources').select('id, title').eq('is_active', true)

  // Analytics
  const completedPurchases = purchases?.filter(p => p.status === 'completed') || []
  const failedPurchases = purchases?.filter(p => p.status === 'failed') || []
  const totalRevenue = completedPurchases.reduce((acc, p) => acc + Number(p.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Access</h1>
          <p className="text-muted-foreground">Manage revenue, transactions, and manual access grants.</p>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glassmorphism bg-primary/10 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary font-medium">Total Revenue</CardDescription>
            <CardTitle className="text-4xl flex items-center"><IndianRupee className="h-8 w-8 mr-1" />{totalRevenue.toLocaleString('en-IN')}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glassmorphism">
          <CardHeader className="pb-2">
            <CardDescription>Successful Transactions</CardDescription>
            <CardTitle className="text-4xl text-green-500">{completedPurchases.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="glassmorphism">
          <CardHeader className="pb-2">
            <CardDescription>Failed Transactions</CardDescription>
            <CardTitle className="text-4xl text-destructive">{failedPurchases.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Manual Grant */}
        <Card className="glassmorphism xl:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Grant Access</CardTitle>
            <CardDescription>Manually give a user access without payment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={grantAccess} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Student Email</Label>
                <Input id="email" name="email" type="email" required className="bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan_id">Grant Plan</Label>
                <select id="plan_id" name="plan_id" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">-- None --</option>
                  {plans?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource_id">OR Grant Specific Resource</Label>
                <select id="resource_id" name="resource_id" className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">-- None --</option>
                  {resources?.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full">Grant Access</Button>
            </form>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card className="glassmorphism xl:col-span-2">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
              {purchases?.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30 backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    {purchase.status === 'completed' ? <CheckCircle className="text-green-500 mt-1" /> : 
                     purchase.status === 'failed' ? <XCircle className="text-destructive mt-1" /> : 
                     <Clock className="text-yellow-500 mt-1" />}
                    <div>
                      <p className="font-semibold text-lg">
                        {purchase.profiles?.name} <span className="text-sm font-normal text-muted-foreground">({purchase.profiles?.email})</span>
                      </p>
                      <p className="text-primary font-medium">{purchase.plans?.name || purchase.resources?.title || 'Unknown Product'}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {purchase.payment_id || purchase.id} • {new Date(purchase.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold text-lg">₹{purchase.amount}</p>
                    <div className="flex gap-2">
                      {purchase.status === 'completed' && (
                        <form action={async () => {
                          'use server'
                          await refundAccess(purchase.id)
                        }}>
                          <Button variant="outline" size="sm" className="text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10">Refund</Button>
                        </form>
                      )}
                      <form action={async () => {
                        'use server'
                        await revokeAccess(purchase.id)
                      }}>
                        <Button variant="destructive" size="sm">Revoke</Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
              {purchases?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No transactions found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

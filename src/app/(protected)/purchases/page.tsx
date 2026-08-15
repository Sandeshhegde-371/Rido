import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function PurchasesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, plans(name), resources(title)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Purchase History</h1>
        <p className="text-muted-foreground text-lg">View your past transactions and unlocked resources.</p>
      </div>

      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" /> Your Transactions</CardTitle>
          <CardDescription>A complete log of your purchases and grants.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchases?.map((purchase) => (
              <div key={purchase.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border/50 rounded-lg bg-card/30 backdrop-blur-sm gap-4">
                <div className="flex items-start gap-3">
                  {purchase.status === 'completed' ? <CheckCircle className="text-green-500 mt-1 h-5 w-5 shrink-0" /> : 
                   purchase.status === 'failed' ? <XCircle className="text-destructive mt-1 h-5 w-5 shrink-0" /> : 
                   <Clock className="text-yellow-500 mt-1 h-5 w-5 shrink-0" />}
                  <div>
                    <p className="font-semibold text-lg text-primary">
                      {purchase.plans?.name || purchase.resources?.title || 'Unknown Product'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <span>{new Date(purchase.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>ID: {purchase.payment_id || purchase.id.slice(0, 8)}</span>
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto">
                  <p className="font-bold text-xl">₹{purchase.amount}</p>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${purchase.status === 'completed' ? 'text-green-500' : purchase.status === 'failed' ? 'text-destructive' : 'text-yellow-500'}`}>
                    {purchase.status}
                  </p>
                </div>
              </div>
            ))}

            {purchases?.length === 0 && (
              <div className="text-center py-16 bg-card/30 rounded-2xl border border-border/50">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No purchases yet</h3>
                <p className="text-muted-foreground mb-6">Explore our library to find premium resources.</p>
                <Link href="/library" className={buttonVariants()}>Browse Library</Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { sendNotification, deleteNotification } from '@/app/actions/notifications'
import { Bell, Send, Trash2, Users } from 'lucide-react'

export default async function AdminNotificationsPage() {
  const supabase = await createClient()
  
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, profiles(email)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Broadcast messages or target specific users.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="glassmorphism xl:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="w-5 h-5" /> Send Notification</CardTitle>
            <CardDescription>Pushes a message to student dashboards.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={sendNotification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required placeholder="e.g. Server Maintenance" className="bg-background/50" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required placeholder="Details about the notification..." className="bg-background/50 resize-none h-24" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center justify-between">
                  <span>Target User Email</span>
                  <span className="text-xs text-muted-foreground">(Optional)</span>
                </Label>
                <Input id="email" name="email" type="email" placeholder="Leave blank to broadcast to everyone" className="bg-background/50" />
              </div>

              <Button type="submit" className="w-full">Push Notification</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glassmorphism xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications?.map((notif) => (
                <div key={notif.id} className="flex items-start justify-between p-4 border border-border/50 rounded-lg bg-card/30 backdrop-blur-sm">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {notif.title}
                      {!notif.user_id && <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center gap-1"><Users className="w-3 h-3" /> Broadcast</span>}
                    </h3>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      {notif.user_id && <span>Target: {notif.profiles?.email}</span>}
                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <form action={async () => {
                    'use server'
                    await deleteNotification(notif.id)
                  }}>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              ))}
              {notifications?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No notifications sent yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

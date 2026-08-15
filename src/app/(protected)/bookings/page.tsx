import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
      <p className="text-muted-foreground">Manage your mentorship sessions.</p>
      
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Your scheduled Google Meet sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
              <div>
                <p className="font-medium text-lg">System Design Mock Interview</p>
                <p className="text-sm text-muted-foreground">Tomorrow at 10:00 AM • 45 mins</p>
              </div>
              <Button>Join Google Meet</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveSettings } from '@/app/actions/settings'
import { Settings2, Paintbrush, Image as ImageIcon } from 'lucide-react'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  
  const { data: settings } = await supabase.from('settings').select('*')
  
  const platformName = settings?.find(s => s.key === 'platform_name')?.value || 'Rido'
  const primaryColor = settings?.find(s => s.key === 'primary_color')?.value || '#8b5cf6'
  const logoUrl = settings?.find(s => s.key === 'logo_url')?.value || ''

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Manage your brand, colors, and global configurations.</p>
      </div>

      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5 text-primary" /> General Configuration</CardTitle>
          <CardDescription>Update how your platform appears to users.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={saveSettings} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="platform_name">Platform Name</Label>
              <Input id="platform_name" name="platform_name" defaultValue={platformName} className="bg-background/50 max-w-md" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_color" className="flex items-center gap-2"><Paintbrush className="w-4 h-4" /> Primary Brand Color</Label>
              <div className="flex items-center gap-4">
                <Input type="color" id="primary_color" name="primary_color" defaultValue={primaryColor} className="h-12 w-24 p-1 cursor-pointer bg-background/50" />
                <span className="text-muted-foreground text-sm font-mono">{primaryColor}</span>
              </div>
              <p className="text-xs text-muted-foreground">This sets the global --primary CSS variable dynamically via layout injection.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url" className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Logo URL (Optional)</Label>
              <Input id="logo_url" name="logo_url" defaultValue={logoUrl} placeholder="https://..." className="bg-background/50 max-w-xl" />
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

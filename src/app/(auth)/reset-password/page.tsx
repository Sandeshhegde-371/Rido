import { resetPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import * as React from 'react'

export default async function ResetPasswordPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  return (
    <Card className="w-full glassmorphism border-primary/10 shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Reset Password</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={resetPassword} className="space-y-4">
          {searchParams?.error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md text-center">
              {searchParams.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" name="password" type="password" required className="bg-background/50 backdrop-blur-sm" />
          </div>
          <Button type="submit" className="w-full font-semibold transition-all hover:scale-[1.02]">
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

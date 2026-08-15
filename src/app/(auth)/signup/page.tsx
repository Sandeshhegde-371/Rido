import { signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import * as React from 'react'

export default async function SignupPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams
  return (
    <Card className="w-full glassmorphism border-primary/10 shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-3xl font-bold tracking-tight text-foreground">Create an account</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your details to get started with Rido
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signup} className="space-y-4">
          {searchParams?.error && (
            <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md text-center">
              {searchParams.error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" type="text" placeholder="Jane Doe" required className="bg-background/50 backdrop-blur-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="student@example.com" required className="bg-background/50 backdrop-blur-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required className="bg-background/50 backdrop-blur-sm" />
          </div>
          <Button type="submit" className="w-full font-semibold transition-all hover:scale-[1.02]">
            Sign up
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border/50 pt-4 mt-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

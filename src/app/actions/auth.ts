'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  if (!email || !password) {
    redirect('/login?error=Email and password are required')
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Generate a new session ID for single-session enforcement
  const newSessionId = crypto.randomUUID()
  
  // Update the user's active session in the database
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ active_session_id: newSessionId, last_login: new Date().toISOString() })
    .eq('id', data.user.id)

  if (profileError) {
    redirect('/login?error=Failed to create active session')
  }

  // Set the session cookie
  const cookieStore = await cookies()
  cookieStore.set('rido_session_id', newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  if (!email || !password || !name) {
    redirect('/signup?error=All fields are required')
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  })

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // If email confirmations are turned off, Supabase will instantly log the user in and return a session
  if (data.session) {
    const newSessionId = crypto.randomUUID()
    
    await supabase
      .from('profiles')
      .update({ active_session_id: newSessionId, last_login: new Date().toISOString() })
      .eq('id', data.user!.id)

    const cookieStore = await cookies()
    cookieStore.set('rido_session_id', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    revalidatePath('/dashboard')
    redirect('/dashboard')
  }

  // Otherwise, they need to verify their email
  redirect('/login?message=Check your email to confirm your account')
}

export async function logout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Clear active session in DB
    await supabase.from('profiles').update({ active_session_id: null }).eq('id', user.id)
  }

  await supabase.auth.signOut()
  
  const cookieStore = await cookies()
  cookieStore.delete('rido_session_id')

  revalidatePath('/')
  redirect('/')
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    redirect('/forgot-password?error=Email is required')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/forgot-password?message=Check your email for the reset link')
}

export async function resetPassword(formData: FormData) {
  const password = formData.get('password') as string

  if (!password) {
    redirect('/reset-password?error=Password is required')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?message=Password updated successfully, please log in')
}

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, BookOpen, Video, CreditCard, Activity } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    users: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    resources: 0,
    purchases: 0,
    mentorships: 0
  })
  
  // Mock chart data for MVP, but normally this would be aggregated from DB
  const revenueData = [
    { name: 'Jan', revenue: 4000 },
    { name: 'Feb', revenue: 3000 },
    { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 8000 },
    { name: 'May', revenue: 12000 },
    { name: 'Jun', revenue: 15000 },
  ]
  
  const userGrowth = [
    { name: 'Jan', users: 100 },
    { name: 'Feb', users: 250 },
    { name: 'Mar', users: 400 },
    { name: 'Apr', users: 800 },
    { name: 'May', users: 1200 },
    { name: 'Jun', users: 2000 },
  ]

  useEffect(() => {
    async function fetchStats() {
      // Users
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      // Resources
      const { count: resources } = await supabase.from('resources').select('*', { count: 'exact', head: true })
      // Purchases
      const { data: purchases } = await supabase.from('purchases').select('amount').eq('status', 'completed')
      const totalRev = purchases?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
      
      // Mentorships
      const { data: mentorships } = await supabase.from('mentorship_bookings').select('id').in('booking_status', ['confirmed', 'completed'])
      const totalMentorshipRev = (mentorships?.length || 0) * 99

      setStats({
        users: users || 0,
        resources: resources || 0,
        purchases: purchases?.length || 0,
        totalRevenue: totalRev + totalMentorshipRev,
        monthlyRevenue: Math.round((totalRev + totalMentorshipRev) / 6), // simple average for mock
        mentorships: mentorships?.length || 0
      })
    }
    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your platform today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Average monthly run rate</p>
          </CardContent>
        </Card>
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.users}</div>
            <p className="text-xs text-muted-foreground">+180 new users this week</p>
          </CardContent>
        </Card>
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.resources}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.purchases}</div>
            <p className="text-xs text-muted-foreground">Successful transactions</p>
          </CardContent>
        </Card>
        <Card className="glassmorphism">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mentorship Sessions</CardTitle>
            <Video className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.mentorships}</div>
            <p className="text-xs text-muted-foreground">Booked sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glassmorphism col-span-1">
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glassmorphism col-span-1">
          <CardHeader>
            <CardTitle>User Acquisition</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

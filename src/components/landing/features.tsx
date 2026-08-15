'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Calendar, Lock, ShieldCheck } from 'lucide-react'

const features = [
  {
    title: 'Placement Vault',
    description: 'A curated collection of resources that top companies test for.',
    icon: ShieldCheck,
  },
  {
    title: 'Last Minute Revision Notes',
    description: 'Quick, high-yield notes to review hours before your interviews.',
    icon: BookOpen,
  },
  {
    title: 'Mentorship Sessions',
    description: 'Book 1-on-1 time with industry experts to refine your skills.',
    icon: Calendar,
  },
  {
    title: 'Secure Reader',
    description: 'Read premium books and materials securely within the platform.',
    icon: Lock,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to succeed</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We&apos;ve built the ultimate platform to ensure you are fully prepared for your placement drives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full glassmorphism border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <feature.icon size={24} />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

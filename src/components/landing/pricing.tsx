'use client'

import { motion } from 'framer-motion'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import Link from 'next/link'

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Invest in your future with our affordable placement preparation packages.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glassmorphism border-primary shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">Pro Vault</CardTitle>
                <CardDescription>Everything you need to get placed</CardDescription>
                <div className="mt-4 flex justify-center items-baseline text-5xl font-extrabold">
                  ₹999
                  <span className="text-xl text-muted-foreground font-medium ml-1">/lifetime</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 text-sm">
                  {['Access to all Revision Handbooks', 'Premium Interview Questions', 'Secure E-book Reader access', '1 Free Mentorship Session', 'Priority Support'].map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href="/signup" className={buttonVariants({ className: "w-full h-12 text-lg font-semibold hover:scale-[1.02] transition-transform" })}>
                  Get Access Now
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

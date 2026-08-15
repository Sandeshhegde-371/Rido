'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Everything that helped me get placed in my <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">7th semester.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Rido is your ultimate placement vault. Access revision handbooks, securely read top preparation books, and book mentorship sessions with industry experts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/25 transition-all hover:scale-105" })}>
              Get Started
            </Link>
            <Link href="#features" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto text-lg h-14 px-8 rounded-full transition-all hover:scale-105" })}>
              Explore Features
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

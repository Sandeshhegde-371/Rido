'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    quote: "Rido's revision notes were exactly what I needed the night before my technical round. I got placed!",
    name: "Aarav Sharma",
    role: "Software Engineer at TechCorp"
  },
  {
    quote: "The 1-on-1 mentorship sessions helped me identify my weak points in System Design.",
    name: "Priya Patel",
    role: "SDE I at StartupInc"
  },
  {
    quote: "Best investment for my 7th semester. The secure reader has all the premium books I couldn't afford otherwise.",
    name: "Rohan Gupta",
    role: "Placed at BigTech"
  }
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Loved by Students</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Don&apos;t just take our word for it. Hear from those who secured their dream jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <p className="italic text-muted-foreground mb-6">&quot;{t.quote}&quot;</p>
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-sm text-primary">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

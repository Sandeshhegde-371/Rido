'use client'

import { motion } from 'framer-motion'

const faqs = [
  {
    question: "Is the payment one-time or subscription?",
    answer: "It is a one-time lifetime payment. You get access to all current and future updates to the vault."
  },
  {
    question: "How do mentorship sessions work?",
    answer: "Once you purchase a session, you can select a time slot from the mentor's calendar. We use Google Meet for the session."
  },
  {
    question: "Can I share my account with my friends?",
    answer: "No. Rido enforces a strict single-session policy. If you log in from another device, your previous session will be automatically terminated."
  },
  {
    question: "Are the resources updated?",
    answer: "Yes, we regularly update the handbooks and question banks based on recent interview experiences."
  }
]

export default function FAQ() {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm"
            >
              <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

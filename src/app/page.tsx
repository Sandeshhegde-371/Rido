import Hero from '@/components/landing/hero'
import Features from '@/components/landing/features'
import Testimonials from '@/components/landing/testimonials'
import Pricing from '@/components/landing/pricing'
import FAQ from '@/components/landing/faq'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar placeholder */}
      <header className="fixed top-0 w-full border-b border-border/40 bg-background/60 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">Rido.</div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium hover:text-primary transition-colors">Log in</a>
            <a href="/signup" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors">Get Started</a>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>

      <footer className="border-t border-border py-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Rido Platform. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
